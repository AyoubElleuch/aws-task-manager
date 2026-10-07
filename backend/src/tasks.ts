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
  const tasksTable = process.env.TASKS_TABLE;
  if (!projectsTable || !milestonesTable || !tasksTable) {
    throw new Error("Projects, milestones or tasks table is missing");
  }

  const projectId = event.queryStringParameters?.projectId;
  if (!projectId?.trim()) return json(400, { message: "Project ID is required" });

  const milestoneId = event.queryStringParameters?.milestoneId;
  if (!milestoneId?.trim()) return json(400, { message: "Milestone ID is required" });

  const project = await db.send(new GetCommand({
    TableName: projectsTable,
    Key: { userId, projectId },
    ConsistentRead: true,
  }));
  if (!project.Item) return json(404, { message: "Project not found" });

  const milestone = await db.send(new GetCommand({
    TableName: milestonesTable,
    Key: { projectId, milestoneId },
    ConsistentRead: true,
  }));
  if (!milestone.Item) return json(404, { message: "Milestone not found" });

  const milestoneKey = `${projectId}#${milestoneId}`;
  const method = event.requestContext.http.method;
  const taskId = event.queryStringParameters?.taskId;

  if (method === "GET") {
    if (taskId !== undefined) {
      if (!taskId.trim()) return json(400, { message: "Task ID is required" });

      const result = await db.send(new GetCommand({
        TableName: tasksTable,
        Key: { milestoneKey, taskId },
      }));
      if (!result.Item) return json(404, { message: "Task not found" });
      return json(200, { task: result.Item });
    }

    const tasks: Record<string, unknown>[] = [];
    let lastKey: Record<string, unknown> | undefined;
    do {
      const page = await db.send(new QueryCommand({
        TableName: tasksTable,
        KeyConditionExpression: "milestoneKey = :milestoneKey",
        ExpressionAttributeValues: { ":milestoneKey": milestoneKey },
        ExclusiveStartKey: lastKey,
      }));
      tasks.push(...(page.Items ?? []));
      lastKey = page.LastEvaluatedKey;
    } while (lastKey);
    return json(200, { tasks });
  }

  if (method === "POST" || method === "PATCH") {
    if (method === "PATCH" && !taskId?.trim()) {
      return json(400, { message: "Task ID is required" });
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
      return json(400, { message: "Task name is required" });
    }
    const name = input.name.trim();

    if (method === "POST") {
      const task = { milestoneKey, taskId: randomUUID(), projectId, milestoneId, name };
      try {
        await db.send(new PutCommand({
          TableName: tasksTable,
          Item: task,
          ConditionExpression: "attribute_not_exists(milestoneKey)",
        }));
      } catch (error) {
        if (error instanceof ConditionalCheckFailedException) {
          return json(409, { message: "Task already exists" });
        }
        throw error;
      }
      return json(201, task);
    }

    try {
      const result = await db.send(new UpdateCommand({
        TableName: tasksTable,
        Key: { milestoneKey, taskId },
        UpdateExpression: "SET #name = :name",
        ExpressionAttributeNames: { "#name": "name" },
        ExpressionAttributeValues: { ":name": name },
        ConditionExpression: "attribute_exists(milestoneKey) AND attribute_exists(taskId)",
        ReturnValues: "ALL_NEW",
      }));
      return json(200, { task: result.Attributes });
    } catch (error) {
      if (error instanceof ConditionalCheckFailedException) {
        return json(404, { message: "Task not found" });
      }
      throw error;
    }
  }

  if (method === "DELETE") {
    if (!taskId?.trim()) return json(400, { message: "Task ID is required" });
    try {
      await db.send(new DeleteCommand({
        TableName: tasksTable,
        Key: { milestoneKey, taskId },
        ConditionExpression: "attribute_exists(milestoneKey) AND attribute_exists(taskId)",
      }));
      return json(200, { message: "Task deleted" });
    } catch (error) {
      if (error instanceof ConditionalCheckFailedException) {
        return json(404, { message: "Task not found" });
      }
      throw error;
    }
  }

  return json(405, { message: "Method not allowed" });
}
