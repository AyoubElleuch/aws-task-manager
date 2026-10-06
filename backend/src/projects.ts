import type {
  APIGatewayProxyEventV2WithJWTAuthorizer,
  APIGatewayProxyStructuredResultV2,
} from "aws-lambda";
import { randomUUID } from "node:crypto";
import { ConditionalCheckFailedException, DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DeleteCommand,
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  QueryCommand,
  type QueryCommandInput,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";

const db = DynamoDBDocumentClient.from(new DynamoDBClient({}));

function json(statusCode: number, value: unknown): APIGatewayProxyStructuredResultV2 {
  return {
    statusCode,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(value),
  };
}

export async function handler(
  event: APIGatewayProxyEventV2WithJWTAuthorizer,
): Promise<APIGatewayProxyStructuredResultV2> {
  // Read the authenticated caller for THIS request.
  const userId = event.requestContext.authorizer?.jwt?.claims?.sub;
  if (typeof userId !== "string" || !userId) {
    return json(401, { message: "Unauthorized" });
  }

  const table = process.env.PROJECTS_TABLE;
  if (!table) throw new Error("PROJECTS_TABLE is missing");

  if (event.requestContext.http.method === "GET") {
    const projectId = event.queryStringParameters?.projectId;

    if (projectId !== undefined) {
      if (!projectId.trim()) {
        return json(400, { message: "Project ID is required" });
      }

      const result = await db.send(new GetCommand({
        TableName: table,
        Key: { userId, projectId },
      }));

      if (!result.Item) {
        return json(404, { message: "Project not found" });
      }

      return json(200, { project: result.Item });
    }

    const page = await db.send(new QueryCommand({
      TableName: table,
      KeyConditionExpression: "userId = :userId",
      ExpressionAttributeValues: { ":userId": userId },
    }));

    return json(200, { projects: page.Items ?? [] });
  }

  if (event.requestContext.http.method === "POST") {
    let input: unknown;
    try {
      input = JSON.parse(event.body ?? "{}") as unknown;
    } catch {
      return json(400, { message: "Invalid JSON" });
    }

    if (
      !input ||
      typeof input !== "object" ||
      !("name" in input) ||
      typeof input.name !== "string" ||
      !input.name.trim()
    ) {
      return json(400, { message: "Project name is required" });
    }

    const project = {
      userId,
      projectId: randomUUID(),
      name: input.name.trim(),
    };

    await db.send(new PutCommand({
      TableName: table,
      Item: project,
      ConditionExpression: "attribute_not_exists(userId)",
    }));

    return json(201, { projectId: project.projectId, name: project.name });
  }

  if (event.requestContext.http.method === "PATCH") {
    const projectId = event.queryStringParameters?.projectId;

    if (!projectId || !projectId.trim()) {
      return json(400, { message: "Project ID is required" });
    }

    let input: unknown;
    try {
      input = JSON.parse(event.body ?? "{}") as unknown;
    } catch {
      return json(400, { message: "Invalid JSON" });
    }

    if (
      !input ||
      typeof input !== "object" ||
      !("name" in input) ||
      typeof input.name !== "string" ||
      !input.name.trim()
    ) {
      return json(400, { message: "Project name is required" });
    }

    try {
      const result = await db.send(new UpdateCommand({
        TableName: table,
        Key: { userId, projectId },
        UpdateExpression: "SET #name = :name",
        ExpressionAttributeNames: { "#name": "name" },
        ExpressionAttributeValues: { ":name": input.name.trim() },
        ConditionExpression: "attribute_exists(userId) AND attribute_exists(projectId)",
        ReturnValues: "ALL_NEW",
      }));

      return json(200, { project: result.Attributes });
    } catch (error) {
      if (error instanceof ConditionalCheckFailedException) {
        return json(404, { message: "Project not found" });
      }
      throw error;
    }
  }

  if (event.requestContext.http.method === "DELETE") {
    const projectId = event.queryStringParameters?.projectId;

    if (!projectId || !projectId.trim()) {
      return json(400, { message: "Project ID is required" });
    }

    const milestonesTable = process.env.MILESTONES_TABLE;
    if (!milestonesTable) throw new Error("MILESTONES_TABLE is missing");

    const project = await db.send(new GetCommand({
      TableName: table,
      Key: { userId, projectId },
      ConsistentRead: true,
    }));
    if (!project.Item) return json(404, { message: "Project not found" });

    let lastKey: QueryCommandInput["ExclusiveStartKey"];
    do {
      const page = await db.send(new QueryCommand({
        TableName: milestonesTable,
        KeyConditionExpression: "projectId = :projectId",
        ExpressionAttributeValues: { ":projectId": projectId },
        ConsistentRead: true,
        ExclusiveStartKey: lastKey,
      }));
      await Promise.all((page.Items ?? []).map(({ milestoneId }) => db.send(new DeleteCommand({
        TableName: milestonesTable,
        Key: { projectId, milestoneId },
      }))));
      lastKey = page.LastEvaluatedKey;
    } while (lastKey);

    try {
      await db.send(new DeleteCommand({
        TableName: table,
        Key: { userId, projectId },
        ConditionExpression: "attribute_exists(userId) AND attribute_exists(projectId)",
      }));

      return json(200, { message: "Project deleted" });
    } catch (error) {
      if (error instanceof ConditionalCheckFailedException) {
        return json(404, { message: "Project not found" });
      }
      throw error;
    }
  }
  return json(405, { message: "Method not allowed" });
}
