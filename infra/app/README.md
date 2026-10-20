# App infrastructure

## Collaboration foundation

Collaboration will share individual projects. This first step adds two DynamoDB tables using the same on-demand billing and project tag as the existing tables:

| Table | Partition key | Sort key | Index | Purpose |
| --- | --- | --- | --- | --- |
| `aws-task-manager-project-members` | `projectId` | `userId` | `userId-index`: `userId`, `projectId` | Check membership, list a project's members, and list a user's shared projects. |
| `aws-task-manager-project-invitations` | `projectId` | `email` | `email-index`: `email`, `projectId` | Keep one invitation per project and recipient, list a project's invitations, and list invitations for an email address. |

Both indexes project the full item. Invitation records will use a normalized email address and an `expiresAt` number containing Unix time in seconds. DynamoDB TTL removes expired invitations in the background. The backend must also reject expired invitations because [TTL deletion is asynchronous](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/TTL.html).

The existing projects, milestones, tasks, users, authentication, and API configuration stay unchanged. The new tables start empty and no Lambda uses them yet, so personal projects continue to use the current ownership checks. No data migration is needed for this infrastructure step.

Membership records will need an `ownerId` pointing to the project's existing `userId`, plus a `role`. After checking membership with a consistent read from the base table, the backend can read the project using `{ userId: ownerId, projectId }`. This keeps the existing project keys and avoids copying project records for each member. Index results are for listing; authorization must use current base-table records.

Fields such as `ownerId`, `role`, invitation metadata, and `expiresAt` are item data written by the backend. They do not need Terraform `attribute` blocks because they are not table or index keys.

## Deployment order

Apply the permission changes in `infra/bootstrap` before deploying `infra/app`. The deployment role can manage the two new tables and configure TTL only on the invitations table. This does not grant the existing Lambdas access to collaboration data.

Merge this infrastructure work and the later backend and frontend changes into `dev`, then merge the complete release into `main`. The app workflow applies Terraform when it is started manually on `main`.

## Next steps

1. Implement project membership checks while retaining the owner path for existing projects. Add member management and invitation creation, listing, acceptance, and revocation. Use verified account email for invitation acceptance, check expiry in code, and make acceptance atomic. Clean up memberships and invitations when deleting a project.
2. Add the Terraform Lambda configuration, table/index permissions, and authenticated API routes together with those handlers. Grant only the access each handler uses. Email delivery infrastructure can be added if invitation emails are introduced.
3. Add the frontend for shared projects, members, and invitations. Test owner and member access with separate accounts, including revocation, expired invitations, deletion, and the existing personal project workflow before release.
