import type { APIGatewayProxyEventV2WithJWTAuthorizer } from "aws-lambda";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { beforeEach, expect, test, vi } from "vitest";
import { handler } from "../src/tasks";

const send = vi.spyOn(DynamoDBDocumentClient.prototype, "send");
vi.stubEnv("PROJECTS_TABLE", "test-projects");
vi.stubEnv("MILESTONES_TABLE", "test-milestones");
vi.stubEnv("TASKS_TABLE", "test-tasks");

beforeEach(() => {
  send.mockReset();
  send.mockImplementation(async () => ({}));
});

function mockDb(...responses: object[]) {
  for (const response of responses) {
    send.mockImplementationOnce(async () => response);
  }
}

function event(method: string, taskId?: string, body?: string) {
  return {
    requestContext: {
      http: { method },
      authorizer: { jwt: { claims: { sub: "user-123" } } },
    },
    queryStringParameters: { projectId: "project-1", milestoneId: "milestone-1", taskId },
    body,
  } as unknown as APIGatewayProxyEventV2WithJWTAuthorizer;
}

const project = { userId: "user-123", projectId: "project-1", name: "Home" };
const milestone = { projectId: "project-1", milestoneId: "milestone-1", name: "Planning" };
const task = {
  milestoneKey: "project-1#milestone-1",
  taskId: "task-1",
  projectId: "project-1",
  milestoneId: "milestone-1",
  name: "Write spec",
};

test("requires an authenticated user", async () => {
  const request = event("GET");
  request.requestContext.authorizer.jwt.claims = {};

  const response = await handler(request);

  expect(response.statusCode).toBe(401);
  expect(send).not.toHaveBeenCalled();
});

test("requires a project owned by the user", async () => {
  mockDb({});

  const response = await handler(event("POST", undefined, '{"name":"Write spec"}'));

  expect(response.statusCode).toBe(404);
  expect(send).toHaveBeenCalledTimes(1);
  expect(send.mock.calls[0][0]).toMatchObject({
    input: { TableName: "test-projects", Key: { userId: "user-123", projectId: "project-1" } },
  });
});

test("requires the milestone to exist in the requested project", async () => {
  mockDb({ Item: project }, {});

  const response = await handler(event("POST", undefined, '{"name":"Write spec"}'));

  expect(response.statusCode).toBe(404);
  expect(JSON.parse(response.body ?? "")).toEqual({ message: "Milestone not found" });
  expect(send).toHaveBeenCalledTimes(2);
  expect(send.mock.calls[1][0]).toMatchObject({
    input: {
      TableName: "test-milestones",
      Key: { projectId: "project-1", milestoneId: "milestone-1" },
      ConsistentRead: true,
    },
  });
});

test("GET lists all pages and retrieves one task", async () => {
  const key = { milestoneKey: task.milestoneKey, taskId: task.taskId };
  const second = { ...task, taskId: "task-2" };
  mockDb({ Item: project }, { Item: milestone }, { Items: [task], LastEvaluatedKey: key }, { Items: [second] });

  const list = await handler(event("GET"));

  expect(list.statusCode).toBe(200);
  expect(JSON.parse(list.body ?? "")).toEqual({ tasks: [task, second] });
  expect(send.mock.calls[3][0]).toMatchObject({ input: { ExclusiveStartKey: key } });

  mockDb({ Item: project }, { Item: milestone }, { Item: task });
  const one = await handler(event("GET", "task-1"));

  expect(one.statusCode).toBe(200);
  expect(JSON.parse(one.body ?? "")).toEqual({ task });
});

test("POST creates a task and trims its name", async () => {
  mockDb({ Item: project }, { Item: milestone }, {});

  const response = await handler(event("POST", undefined, '{"name":" Write spec "}'));
  const created = JSON.parse(response.body ?? "");

  expect(response.statusCode).toBe(201);
  expect(created).toEqual({ ...task, taskId: expect.any(String) });
  expect(send.mock.calls[2][0]).toMatchObject({
    input: {
      TableName: "test-tasks",
      Item: created,
      ConditionExpression: "attribute_not_exists(milestoneKey)",
    },
  });
});

test("POST rejects an empty name", async () => {
  mockDb({ Item: project }, { Item: milestone });

  const response = await handler(event("POST", undefined, '{"name":"   "}'));

  expect(response.statusCode).toBe(400);
  expect(send).toHaveBeenCalledTimes(2);
});

test("PATCH renames a task", async () => {
  const updated = { ...task, name: "Review spec" };
  mockDb({ Item: project }, { Item: milestone }, { Attributes: updated });

  const response = await handler(event("PATCH", "task-1", '{"name":"Review spec"}'));

  expect(response.statusCode).toBe(200);
  expect(JSON.parse(response.body ?? "")).toEqual({ task: updated });
  expect(send.mock.calls[2][0]).toMatchObject({
    input: {
      Key: { milestoneKey: task.milestoneKey, taskId: task.taskId },
      ExpressionAttributeValues: { ":name": "Review spec" },
    },
  });
});

test("DELETE removes a task", async () => {
  mockDb({ Item: project }, { Item: milestone }, {});

  const response = await handler(event("DELETE", "task-1"));

  expect(response.statusCode).toBe(200);
  expect(send.mock.calls[2][0]).toMatchObject({
    input: { Key: { milestoneKey: task.milestoneKey, taskId: task.taskId } },
  });
});
