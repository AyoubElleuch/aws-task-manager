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
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";

import { deleteTasks } from "./deleteTasks.js";

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
  const userId = event.requestContext.authorizer?.jwt?.claims?.sub;
  if (typeof userId !== "string" || !userId) {
    return json(401, { message: "Unauthorized" });
  }

  const projectsTable = process.env.PROJECTS_TABLE;
  const milestonesTable = process.env.MILESTONES_TABLE;
  if (!projectsTable || !milestonesTable) throw new Error("Projects or milestones table is missing");

  const projectId = event.queryStringParameters?.projectId;
  if (!projectId?.trim()) return json(400, { message: "Project ID is required" });

  const project = await db.send(new GetCommand({
    TableName: projectsTable,
    Key: { userId, projectId },
    ConsistentRead: true,
  }));
  if (!project.Item) return json(404, { message: "Project not found" });

  const method = event.requestContext.http.method;
  const milestoneId = event.queryStringParameters?.milestoneId;

  if (method === "GET") {
    if (milestoneId !== undefined) {
      if (!milestoneId.trim()) return json(400, { message: "Milestone ID is required" });

      const result = await db.send(new GetCommand({
        TableName: milestonesTable,
        Key: { projectId, milestoneId },
      }));
      if (!result.Item) return json(404, { message: "Milestone not found" });
      return json(200, { milestone: result.Item });
    }

    const milestones: Record<string, unknown>[] = [];
    let lastKey: Record<string, unknown> | undefined;
    do {
      const page = await db.send(new QueryCommand({
        TableName: milestonesTable,
        KeyConditionExpression: "projectId = :projectId",
        ExpressionAttributeValues: { ":projectId": projectId },
        ExclusiveStartKey: lastKey,
      }));
      milestones.push(...(page.Items ?? []));
      lastKey = page.LastEvaluatedKey;
    } while (lastKey);
    return json(200, { milestones });
  }

  if (method === "POST" || method === "PATCH") {
    if (method === "PATCH" && !milestoneId?.trim()) {
      return json(400, { message: "Milestone ID is required" });
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
      return json(400, { message: "Milestone name is required" });
    }
    const name = input.name.trim();

    if (method === "POST") {
      const milestone = { projectId, milestoneId: randomUUID(), name };
      try {
        await db.send(new PutCommand({
          TableName: milestonesTable,
          Item: milestone,
          ConditionExpression: "attribute_not_exists(projectId)",
        }));
      } catch (error) {
        if (error instanceof ConditionalCheckFailedException) {
          return json(409, { message: "Milestone already exists" });
        }
        throw error;
      }
      return json(201, milestone);
    }

    try {
      const result = await db.send(new UpdateCommand({
        TableName: milestonesTable,
        Key: { projectId, milestoneId },
        UpdateExpression: "SET #name = :name",
        ExpressionAttributeNames: { "#name": "name" },
        ExpressionAttributeValues: { ":name": name },
        ConditionExpression: "attribute_exists(projectId)",
        ReturnValues: "ALL_NEW",
      }));
      return json(200, { milestone: result.Attributes });
    } catch (error) {
      if (error instanceof ConditionalCheckFailedException) {
        return json(404, { message: "Milestone not found" });
      }
      throw error;
    }
  }

  if (method === "DELETE") {
    if (!milestoneId?.trim()) return json(400, { message: "Milestone ID is required" });
    const tasksTable = process.env.TASKS_TABLE;
    if (!tasksTable) throw new Error("TASKS_TABLE is missing");

    const milestone = await db.send(new GetCommand({
      TableName: milestonesTable,
      Key: { projectId, milestoneId },
      ConsistentRead: true,
    }));
    if (!milestone.Item) return json(404, { message: "Milestone not found" });

    await deleteTasks(db, tasksTable, `${projectId}#${milestoneId}`);
    try {
      await db.send(new DeleteCommand({
        TableName: milestonesTable,
        Key: { projectId, milestoneId },
        ConditionExpression: "attribute_exists(projectId)",
      }));
      return json(200, { message: "Milestone deleted" });
    } catch (error) {
      if (error instanceof ConditionalCheckFailedException) {
        return json(404, { message: "Milestone not found" });
      }
      throw error;
    }
  }

  return json(405, { message: "Method not allowed" });
}
