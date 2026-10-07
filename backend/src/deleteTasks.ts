import {
  DeleteCommand,
  type DynamoDBDocumentClient,
  QueryCommand,
} from "@aws-sdk/lib-dynamodb";

export async function deleteTasks(
  db: DynamoDBDocumentClient,
  tasksTable: string,
  milestoneKey: string,
): Promise<void> {
  const query = {
    TableName: tasksTable,
    KeyConditionExpression: "milestoneKey = :milestoneKey",
    ExpressionAttributeValues: { ":milestoneKey": milestoneKey },
    ConsistentRead: true,
  };
  let page = await db.send(new QueryCommand(query));

  while (true) {
    for (const task of page.Items ?? []) {
      await db.send(new DeleteCommand({
        TableName: tasksTable,
        Key: { milestoneKey, taskId: task.taskId },
      }));
    }

    if (!page.LastEvaluatedKey) break;

    page = await db.send(new QueryCommand({
      ...query,
      ExclusiveStartKey: page.LastEvaluatedKey,
    }));
  }
}
