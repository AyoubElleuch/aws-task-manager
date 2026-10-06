import type { APIGatewayProxyEventV2WithJWTAuthorizer } from "aws-lambda";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { describe, expect, test, vi } from "vitest";
import { handler } from "../src/projects";

const send = vi.spyOn(DynamoDBDocumentClient.prototype, "send");
vi.stubEnv("PROJECTS_TABLE", "test-projects");

function event(method: "GET" | "POST", projectId?: string, body?: string) {
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
});
