import type { APIGatewayProxyStructuredResultV2 } from "aws-lambda";

export async function handler() {
    return {
        statusCode: 200,
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ status: "ok" })
    } as APIGatewayProxyStructuredResultV2;
}