import type { APIGatewayProxyEventV2WithJWTAuthorizer } from "aws-lambda";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { describe, expect, test, vi } from "vitest";
import { handler } from "../src/projects";

const send = vi.spyOn(DynamoDBDocumentClient.prototype, "send");
vi.stubEnv("PROJECTS_TABLE", "test-projects");
vi.stubEnv("MILESTONES_TABLE", "test-milestones");
vi.stubEnv("TASKS_TABLE", "test-tasks");

function event(method: "GET" | "POST" | "PATCH" | "DELETE", projectId?: string, body?: string) {
  return {
    requestContext: {
      http: { method },
      authorizer: { jwt: { claims: { sub: "user-123" } } },
    },
    queryStringParameters: projectId ? { projectId } : undefined,
    body,
  } as unknown as APIGatewayProxyEventV2WithJWTAuthorizer;
}

describe("projects handler", () => {
  test("GET lists projects or gets one by project ID", async () => {
    const project = { userId: "user-123", projectId: "project-1", name: "Home" };
    send.mockReset();
    send.mockImplementationOnce(async () => ({ Items: [project] }));
    send.mockImplementationOnce(async () => ({ Item: project }));

    const listResponse = await handler(event("GET"));
    expect(JSON.parse(listResponse.body ?? "")).toEqual({ projects: [project] });

    const oneResponse = await handler(event("GET", "project-1"));
    expect(JSON.parse(oneResponse.body ?? "")).toEqual({ project });
    expect(send.mock.calls[1][0]).toMatchObject({
      input: { Key: { userId: "user-123", projectId: "project-1" } },
    });
  });

  test("POST creates a project for the authenticated user", async () => {
    send.mockReset();
    send.mockImplementation(async () => ({}));

    const response = await handler(event("POST", undefined, JSON.stringify({ name: "Home" })));
    const created = JSON.parse(response.body ?? "");

    expect(response.statusCode).toBe(201);
    expect(created).toEqual({ projectId: expect.any(String), name: "Home" });
    expect(send.mock.calls[0][0]).toMatchObject({
      input: { Item: { userId: "user-123", projectId: created.projectId, name: "Home" } },
    });
  });

  test("PATCH updates a project for the authenticated user", async () => {
    const project = { userId: "user-123", projectId: "project-1", name: "Work" };
    send.mockReset();
    send.mockImplementation(async () => ({ Attributes: project }));

    const response = await handler(event("PATCH", "project-1", JSON.stringify({ name: "Work" })));
    const updated = JSON.parse(response.body ?? "");

    expect(response.statusCode).toBe(200);
    expect(updated).toEqual({ project });
    expect(send.mock.calls[0][0]).toMatchObject({
      input: { Key: { userId: "user-123", projectId: "project-1" }, UpdateExpression: expect.any(String), ExpressionAttributeValues: { ":name": "Work" } },
    });
  });

  test("DELETE does not remove milestones from someone else's project", async () => {
    send.mockReset();
    send.mockImplementation(async () => ({}));

    const response = await handler(event("DELETE", "project-1"));

    expect(response.statusCode).toBe(404);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send.mock.calls[0][0]).toMatchObject({
      input: { TableName: "test-projects", Key: { userId: "user-123", projectId: "project-1" } },
    });
  });

  test("DELETE removes a project and its milestones", async () => {
    const project = { userId: "user-123", projectId: "project-1", name: "Home" };
    const milestone = { projectId: "project-1", milestoneId: "milestone-1" };
    const responses = [
      { Item: project },
      { Items: [milestone] },
      { Items: [] },
      {},
      {},
    ];
    send.mockReset();
    send.mockImplementation(async () => responses.shift() ?? {});

    const response = await handler(event("DELETE", "project-1"));
    const deleted = JSON.parse(response.body ?? "");

    expect(response.statusCode).toBe(200);
    expect(deleted).toEqual({ message: "Project deleted" });
    expect(send).toHaveBeenCalledTimes(5);
    expect(send.mock.calls[1][0]).toMatchObject({
      input: { TableName: "test-milestones", ExpressionAttributeValues: { ":projectId": "project-1" } },
    });
    expect(send.mock.calls[3][0]).toMatchObject({
      input: { TableName: "test-milestones", Key: milestone },
    });
    expect(send.mock.calls[4][0]).toMatchObject({
      input: { TableName: "test-projects", Key: { userId: "user-123", projectId: "project-1" } },
    });
  });

  test("DELETE removes tasks from all milestone pages", async () => {
    const project = { userId: "user-123", projectId: "project-1" };
    const first = { projectId: "project-1", milestoneId: "milestone-1" };
    const second = { projectId: "project-1", milestoneId: "milestone-2" };
    const responses = [
      { Item: project },
      { Items: [first], LastEvaluatedKey: first },
      { Items: [{ taskId: "task-1" }] },
      {},
      {},
      { Items: [second] },
      { Items: [{ taskId: "task-2" }] },
      {},
      {},
      {},
    ];
    send.mockReset();
    send.mockImplementation(async () => responses.shift() ?? {});

    const response = await handler(event("DELETE", "project-1"));

    expect(response.statusCode).toBe(200);
    expect(send).toHaveBeenCalledTimes(10);
    expect(send.mock.calls[3][0]).toMatchObject({
      input: { TableName: "test-tasks", Key: { milestoneKey: "project-1#milestone-1", taskId: "task-1" } },
    });
    expect(send.mock.calls[4][0]).toMatchObject({
      input: { TableName: "test-milestones", Key: first },
    });
    expect(send.mock.calls[5][0]).toMatchObject({
      input: { TableName: "test-milestones", ExclusiveStartKey: first },
    });
    expect(send.mock.calls[7][0]).toMatchObject({
      input: { TableName: "test-tasks", Key: { milestoneKey: "project-1#milestone-2", taskId: "task-2" } },
    });
    expect(send.mock.calls[8][0]).toMatchObject({
      input: { TableName: "test-milestones", Key: second },
    });
    expect(send.mock.calls[9][0]).toMatchObject({
      input: { TableName: "test-projects", Key: { userId: "user-123", projectId: "project-1" } },
    });
  });

  test("DELETE keeps the project and milestone if task cleanup fails", async () => {
    send.mockReset();
    send.mockImplementationOnce(async () => ({ Item: { userId: "user-123", projectId: "project-1" } }));
    send.mockImplementationOnce(async () => ({ Items: [{ milestoneId: "milestone-1" }] }));
    send.mockImplementationOnce(async () => ({ Items: [{ taskId: "task-1" }] }));
    send.mockImplementationOnce(async () => {
      throw new Error("Task deletion failed");
    });

    await expect(handler(event("DELETE", "project-1"))).rejects.toThrow("Task deletion failed");

    expect(send).toHaveBeenCalledTimes(4);
    expect(send.mock.calls[3][0]).toMatchObject({
      input: { TableName: "test-tasks", Key: { milestoneKey: "project-1#milestone-1", taskId: "task-1" } },
    });
  });
});
