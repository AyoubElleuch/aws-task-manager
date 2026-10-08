# Technical notes

The architecture decisions and AWS and Terraform setup are my own. I wrote all the technical content in these notes, including the choices, reasoning, costs, and trade-offs. I then used AI to improve the wording and formatting.

## Why I went serverless

I wanted to use the AWS free tier as much as possible. An EC2 server with a load balancer felt unnecessary and potentially expensive for a small project like this.

Serverless made more sense to me: less maintenance, and no server to keep running when nobody is using the app.

## What I used

- S3 and CloudFront to host the frontend. The S3 bucket stays private.
- API Gateway and Lambda for the backend.
- Cognito for sign-up, sign-in, and password resets.
- DynamoDB to save projects, milestones, and tasks.
- CloudWatch logs to help me debug things.

Terraform is split into two folders. `infra/bootstrap` sets up the state bucket and GitHub's AWS access. `infra/app` sets up the app itself. Their state is stored separately in S3.

GitHub Actions runs the checks and handles deployment. It uses temporary AWS credentials through OIDC. Deployment is started manually from `main`.

## A note on costs

The goal is to stay within free allowances, but serverless doesn't mean everything is free. The DynamoDB tables currently use on-demand billing. That is easy to manage, but its reads and writes aren't covered by the free provisioned-capacity allowance. Credits may cover them, depending on the account ([AWS pricing](https://aws.amazon.com/dynamodb/pricing/)).

There is no VPC gateway endpoint here. The Lambdas aren't attached to my own VPC and call DynamoDB directly through the AWS SDK. Those calls don't go through API Gateway. The browser's API requests still use API Gateway and have their own pricing ([AWS pricing](https://aws.amazon.com/api-gateway/pricing/)). The Lambdas don't currently access S3.

## Trade-offs

- **S3 + CloudFront:** No frontend server to manage. Server-side page rendering would need another service.
- **Lambda:** No backend servers to maintain. Cold starts can slow some requests.
- **API Gateway HTTP API:** Cheaper than the REST API. No built-in API caching or per-client rate limits.
- **DynamoDB on-demand:** No capacity planning. Costs grow with usage, and queries are less flexible than SQL.
- **Cognito:** AWS handles passwords and account recovery. Authentication depends on Cognito's features and limits.
- **One AWS region:** Simpler deployment. The backend has no regional failover if `us-east-1` becomes unavailable.

For now, this works for a small personal app. I'll improve the UI next, then work on collaboration slowly.
