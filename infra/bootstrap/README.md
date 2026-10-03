# AWS bootstrap

This Terraform configuration creates:

- A GitHub OIDC provider and a role trusted by this repository's `main` branch. The role has no AWS resource permissions yet.
- An S3 bucket named `aws-task-manager-state-<account-id>` in `us-east-1` for Terraform state. Versioning and all four public access blocks are enabled, and Terraform is prevented from destroying the bucket.

Bootstrap currently keeps its own Terraform state locally. Creating the bucket does not migrate that state or configure another Terraform directory to use the S3 backend.
