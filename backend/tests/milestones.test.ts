import type { APIGatewayProxyEventV2WithJWTAuthorizer } from "aws-lambda";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { beforeEach, expect, test, vi } from "vitest";
import { handler } from "../src/milestones";

const send = vi.spyOn(DynamoDBDocumentClient.prototype, "send");
vi.stubEnv("PROJECTS_TABLE", "test-projects");
vi.stubEnv("MILESTONES_TABLE", "test-milestones");

beforeEach(() => send.mockReset());

function mockDb(...responses: Record<string, unknown>[]) {
  send.mockImplementation(async () => responses.shift() ?? {});
}

function event(method: string, projectId = "project-1", milestoneId?: string, body?: string) {
  return {
    requestContext: {
      http: { method },
      authorizer: { jwt: { claims: { sub: "user-123" } } },
    },
    queryStringParameters: { projectId, milestoneId },
    body,
  } as unknown as APIGatewayProxyEventV2WithJWTAuthorizer;
}

const project = { userId: "user-123", projectId: "project-1", name: "Home" };
const milestone = { projectId: "project-1", milestoneId: "milestone-1", name: "Plan" };

test("does not allow access to a project the user does not own", async () => {
  mockDb({});

  const response = await handler(event("POST", "project-1", undefined, JSON.stringify({ name: "Plan" })));

  expect(response.statusCode).toBe(404);
  expect(send).toHaveBeenCalledTimes(1);
});

test("GET lists milestones and retrieves one milestone", async () => {
  mockDb({ Item: project }, { Items: [milestone] }, { Item: project }, { Item: milestone });

  const list = await handler(event("GET", "project-1"));
  const one = await handler(event("GET", "project-1", "milestone-1"));

  expect(JSON.parse(list.body ?? "")).toEqual({ milestones: [milestone] });
  expect(JSON.parse(one.body ?? "")).toEqual({ milestone });
});

test("POST creates a milestone without overwriting the same key", async () => {
  mockDb({ Item: project }, {});

  const response = await handler(event("POST", "project-1", undefined, JSON.stringify({ name: " Plan " })));
  const created = JSON.parse(response.body ?? "");

  expect(response.statusCode).toBe(201);
  expect(created).toEqual({ projectId: "project-1", milestoneId: expect.any(String), name: "Plan" });
  expect(send.mock.calls[1][0]).toMatchObject({
    input: {
      TableName: "test-milestones",
      Item: created,
      ConditionExpression: "attribute_not_exists(projectId)",
    },
  });
});

test("PATCH renames a milestone", async () => {
  const updated = { ...milestone, name: "Build" };
  mockDb({ Item: project }, { Attributes: updated });

  const response = await handler(event("PATCH", "project-1", "milestone-1", JSON.stringify({ name: "Build" })));

  expect(JSON.parse(response.body ?? "")).toEqual({ milestone: updated });
  expect(send.mock.calls[1][0]).toMatchObject({
    input: {
      Key: { projectId: "project-1", milestoneId: "milestone-1" },
      ExpressionAttributeValues: { ":name": "Build" },
    },
  });
});

test("DELETE removes a milestone", async () => {
  mockDb({ Item: project }, {});

  const response = await handler(event("DELETE", "project-1", "milestone-1"));

  expect(JSON.parse(response.body ?? "")).toEqual({ message: "Milestone deleted" });
  expect(send.mock.calls[1][0]).toMatchObject({
    input: { Key: { projectId: "project-1", milestoneId: "milestone-1" } },
  });
});

test("GET returns all milestone pages", async () => {
  const key = { projectId: "project-1", milestoneId: "milestone-1" };
  const second = { ...milestone, milestoneId: "milestone-2" };
  mockDb({ Item: project }, { Items: [milestone], LastEvaluatedKey: key }, { Items: [second] });

  const response = await handler(event("GET"));

  expect(JSON.parse(response.body ?? "")).toEqual({ milestones: [milestone, second] });
  expect(send.mock.calls[2][0]).toMatchObject({ input: { ExclusiveStartKey: key } });
});
