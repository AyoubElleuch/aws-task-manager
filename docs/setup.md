# Setup and deployment

## Run locally

Use Node.js 22. The frontend connects to the AWS API and Cognito, so you need an existing deployment first.

Create `frontend/.env.local` with these values from the Terraform outputs in `infra/app`:

```dotenv
VITE_COGNITO_USER_POOL_ID=your-user-pool-id
VITE_COGNITO_USER_POOL_CLIENT_ID=your-user-pool-client-id
VITE_API_BASE_URL=https://your-api-id.execute-api.us-east-1.amazonaws.com
```

Then run:

```sh
cd frontend
npm ci
npm run dev
```

Open `http://localhost:3000`. This port is allowed by the API's CORS settings.

## Checks

Run these commands in both `frontend/` and `backend/`:

```sh
npm ci
npm run lint
npm test
npm run build
```

CI runs these checks for pushes and pull requests to `dev` and `main`.

## Deployment

Start the `Deploy app` workflow manually from GitHub Actions on `main`. It builds the backend, applies the app Terraform configuration, builds and uploads the frontend to S3, and clears the CloudFront cache.

The GitHub repository needs an `AWS_ROLE_ARN` variable for the deployment role. AWS access uses OIDC.

Apply any deployment permission changes in `infra/bootstrap` before running the app workflow. The Terraform backends are configured for this project's AWS account, so those settings need updating if you use a different account.
