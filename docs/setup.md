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

CI runs these checks for pushes and pull requests to `dev` and `main`. After building the backend, check the app infrastructure from the repository root:

```sh
terraform -chdir=infra/app init -backend=false -lockfile=readonly
terraform -chdir=infra/app fmt -check -recursive
terraform -chdir=infra/app validate
terraform -chdir=infra/app test
```

Use Terraform 1.11 or newer for the app configuration and its plan-time mocks. The Terraform tests use mocked AWS and archive providers and run plans only. They verify the default and custom-domain configurations, including CORS and Cognito URLs, and reject incomplete inputs, invalid hostnames, and certificates outside `us-east-1`. They do not connect to AWS or change infrastructure. The backend CI job runs them after its build.

## Deployment

Start the `Deploy app` workflow manually from GitHub Actions on `main`. It builds the backend, applies the app Terraform configuration, builds and uploads the frontend to S3, and clears the CloudFront cache.

The GitHub repository needs an `AWS_ROLE_ARN` variable for the deployment role. AWS access uses OIDC.

Apply any deployment permission changes in `infra/bootstrap` before running the app workflow. The Terraform backends are configured for this project's AWS account, so those settings need updating if you use a different account.

## Custom domain with Hostinger

For this app, the selected hostname is `taskmanager.mohamedayoubeleuch.com`. AWS continues hosting the application; Hostinger manages its DNS. A separate Hostinger website or hosting subdomain is not required.

### 1. Request and validate the HTTPS certificate

1. Open AWS Certificate Manager in **US East (N. Virginia), `us-east-1`**. CloudFront requires its ACM certificate in this region.
2. Request a **public certificate** for `taskmanager.mohamedayoubeleuch.com`. Choose **Disable export**, **DNS validation**, and **RSA 2048**.
3. Open the certificate's **Domains** section and copy its CNAME name and value.
4. In Hostinger hPanel, open **Domains → mohamedayoubeleuch.com → DNS / Nameservers**. Confirm the domain uses Hostinger nameservers; otherwise add the records at the authoritative DNS provider.
5. Add a **CNAME** record. For **Name**, use the ACM record name without the final `.mohamedayoubeleuch.com.` suffix, leaving a value such as `_validation-token.taskmanager`. For **Target / Points to**, paste the complete ACM CNAME value. Keep the default TTL.
6. Refresh the AWS certificate page until its status is **Issued**, then copy its ARN. Keep the validation record so ACM can renew the certificate.

See the [AWS CloudFront certificate requirements](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/cnames-and-https-requirements.html) and [Hostinger CNAME instructions](https://www.hostinger.com/support/4738777-how-to-manage-cname-records/).

### 2. Configure Terraform and deployment

Set **both** inputs, or leave both empty to retain the CloudFront hostname:

| Terraform input | Value |
| --- | --- |
| `domain_name` | `taskmanager.mohamedayoubeleuch.com` |
| `acm_certificate_arn` | ARN of the issued certificate from step 1 |

For a local deployment, copy `infra/app/custom-domain.tfvars.example` to `infra/app/custom-domain.tfvars`, then replace its example certificate ARN with your real ARN. The `.tfvars` file is ignored by Git. Build the backend first because Terraform packages files from `backend/dist`.

With AWS credentials for the deployment account, initialize the real backend and review the plan:

```sh
terraform -chdir=infra/app init -reconfigure
terraform -chdir=infra/app plan -var-file=custom-domain.tfvars -out=custom-domain.tfplan
```

The plan should add the CloudFront alias and ACM certificate, allow the hostname in API CORS, extend Cognito callback/logout URLs, and update `website_url`. Review any additional changes before applying the saved plan:

```sh
terraform -chdir=infra/app apply custom-domain.tfplan
```

For GitHub Actions deployment, open **Settings → Secrets and variables → Actions → Variables** in the repository and add:

| Repository variable | Value |
| --- | --- |
| `APP_DOMAIN_NAME` | `taskmanager.mohamedayoubeleuch.com` |
| `APP_ACM_CERTIFICATE_ARN` | The same issued certificate ARN |

The workflow passes these values as `TF_VAR_domain_name` and `TF_VAR_acm_certificate_arn`. Set both before the first domain-enabled deployment and keep them configured for subsequent runs; a missing pair intentionally selects the default CloudFront configuration. After the changes reach `main`, manually run **Deploy app**. A local `.tfvars` file alone does not configure GitHub Actions.

The frontend currently signs in directly through Amplify SRP, so its auth configuration needs no hostname change. Terraform also updates the Cognito app client's configured OAuth callback/logout URLs; this does not add an OAuth callback page to the frontend. API requests continue using the existing `VITE_API_BASE_URL`.

### 3. Point the subdomain to CloudFront

Wait for the CloudFront distribution update to finish before routing visitors to the hostname. Get the DNS target:

```sh
terraform -chdir=infra/app output -raw cloudfront_domain_name
```

In Hostinger's DNS editor, add this second record:

| Field | Value |
| --- | --- |
| Type | `CNAME` |
| Name | `taskmanager` |
| Target / Points to | The `cloudfront_domain_name` output; currently `dlwxz7gig68tc.cloudfront.net` |
| TTL | Hostinger's default |

Enter only the target hostname, without `https://` or a path. If another A, AAAA, or CNAME record already exists for the exact `taskmanager` name, replace that conflicting record. Keep the separate ACM validation record, the root website records, and email records.

### 4. Verify the rollout

After DNS propagates, open `https://taskmanager.mohamedayoubeleuch.com` and check:

- HTTPS loads with a valid certificate for the hostname.
- Refreshing a frontend route such as `/signin` loads the app.
- Sign-up/email confirmation and sign-in work; an existing user can load projects and change tasks without CORS errors.
- Sign-out works, and the original CloudFront address remains accessible.

The new hostname has its own browser storage, so existing users will need to sign in again there. `website_url` reports the custom URL once Terraform is applied. Update the README's live-application link after verifying the new address.

For rollback, restore the old DNS routing if needed, then clear both local Terraform inputs and both GitHub repository variables and review/apply the resulting Terraform plan. The default CloudFront address and localhost configuration are retained in both modes.
