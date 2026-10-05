import type { APIGatewayProxyEventV2WithJWTAuthorizer } from "aws-lambda";
import { handler } from "../src/me";
import { describe, expect, test } from "vitest";

function eventWithClaims(claims: Record<string, string>) {
  return {
    requestContext: { authorizer: { jwt: { claims } } },
  } as APIGatewayProxyEventV2WithJWTAuthorizer;
}

describe("me handler", () => {
  test("returns the authenticated Cognito subject", async () => {
    const response = await handler(eventWithClaims({ sub: "user-123" }));

    expect(response.statusCode).toBe(200);
    expect(response.headers?.["Content-Type"]).toBe("application/json");
    expect(JSON.parse(response.body ?? "")).toEqual({ sub: "user-123" });
  });

  test("rejects an event without a Cognito subject", async () => {
    const response = await handler(eventWithClaims({}));

    expect(response.statusCode).toBe(401);
    expect(JSON.parse(response.body ?? "")).toEqual({ message: "Unauthorized" });
  });
});
