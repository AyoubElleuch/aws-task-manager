# AWS bootstrap

The bootstrap configuration manages:

- A GitHub OIDC provider and a role trusted by this repository's `main` branch. The role has no AWS resource permissions yet.
- An S3 bucket named `aws-task-manager-state-<account-id>` in `us-east-1` for Terraform state. Versioning and all four public access blocks are enabled, and Terraform is prevented from destroying the bucket.

Bootstrap state is stored in the bucket at `bootstrap/terraform.tfstate`. The app uses a separate backend key, `app/terraform.tfstate`, which will hold state once app resources exist. Local state backups are ignored by Git.
