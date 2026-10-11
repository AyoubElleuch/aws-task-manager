import { type DynamoDBDocumentClient, QueryCommand } from "@aws-sdk/lib-dynamodb";

export async function getTasks(db: DynamoDBDocumentClient, tasksTable: string, milestoneKey: string) {
  const tasks = [];
  let lastKey: Record<string, unknown> | undefined;
  do {
    const page = await db.send(new QueryCommand({
      TableName: tasksTable,
      KeyConditionExpression: "milestoneKey = :milestoneKey",
      ExpressionAttributeValues: { ":milestoneKey": milestoneKey },
      ConsistentRead: true,
      ExclusiveStartKey: lastKey,
    }));
    tasks.push(...(page.Items ?? []));
    lastKey = page.LastEvaluatedKey;
  } while (lastKey);
  return tasks;
}
