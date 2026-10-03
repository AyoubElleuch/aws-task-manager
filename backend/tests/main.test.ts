import { handler } from "../src/main";
import { describe, expect, test } from "vitest";

describe("health handler", () => {
  test("returns a successful JSON response", async () => {
    const response = await handler();

    expect(response.statusCode).toBe(200);
    expect(response.headers?.["Content-Type"]).toBe("application/json");
    expect(JSON.parse(response.body ?? "")).toEqual({
      status: "ok",
    });
  });
});