# AWS bootstrap

The bootstrap configuration manages:

- A GitHub OIDC provider and a role trusted by this repository's `main` branch. Its deployment policy lets GitHub manage the app resources and app Terraform state.
- An S3 bucket named `aws-task-manager-state-<account-id>` in `us-east-1` for Terraform state. Versioning and all four public access blocks are enabled, and Terraform is prevented from destroying the bucket.

Bootstrap state is stored in the bucket at `bootstrap/terraform.tfstate`. The app uses a separate backend key, `app/terraform.tfstate`, for the app resources. Local state backups are ignored by Git.

Apply bootstrap permission changes before running the app deployment workflow. More details are in the [technical notes](../../docs/technical/README.md).
