# API

Base URL: the `api_base_url` Terraform output in `infra/app`.

## Auth

Everything except `/health` needs a Cognito access token. Sign in through Amplify and send:

```http
Authorization: Bearer <access-token>
```

Use the access token with the `aws.cognito.signin.user.admin` scope. The API gets your user ID from the token and checks that the project belongs to you.

## Endpoints

| Request | What it does |
| --- | --- |
| `GET /health` | Returns `{"status":"ok"}` |
| `GET /me` | Returns your user ID as `{"sub":"..."}` |
| `GET /projects` | List your projects |
| `GET /projects?projectId=<id>` | Get one project |
| `POST /projects` | Create a project |
| `PATCH /projects?projectId=<id>` | Rename a project |
| `DELETE /projects?projectId=<id>` | Delete a project |
| `GET /milestones?projectId=<id>` | List milestones |
| `GET /milestones?projectId=<id>&milestoneId=<id>` | Get one milestone |
| `POST /milestones?projectId=<id>` | Create a milestone |
| `PATCH /milestones?projectId=<id>&milestoneId=<id>` | Rename a milestone |
| `DELETE /milestones?projectId=<id>&milestoneId=<id>` | Delete a milestone |
| `GET /tasks?projectId=<id>&milestoneId=<id>` | List tasks |
| `GET /tasks?projectId=<id>&milestoneId=<id>&taskId=<id>` | Get one task |
| `POST /tasks?projectId=<id>&milestoneId=<id>` | Create a task |
| `PATCH /tasks?projectId=<id>&milestoneId=<id>&taskId=<id>` | Rename a task |
| `DELETE /tasks?projectId=<id>&milestoneId=<id>&taskId=<id>` | Delete a task |

Replace `<id>` with the actual ID. Creating or renaming any of these uses the same JSON body:

```json
{"name":"Write the README"}
```

Send `Content-Type: application/json`. Names are trimmed and can't be empty. The API generates IDs when creating items.

Lists come back under `projects`, `milestones`, or `tasks`. Getting or renaming one item returns it under `project`, `milestone`, or `task`. Creation returns the new item directly with `201`; the other successful requests return `200`.

Deleting a project also deletes its milestones and tasks. Deleting a milestone also deletes its tasks.

## Errors

`400` means a bad request, `401` or `403` means an auth issue, and `404` means the item wasn't found or the project isn't yours. Milestone and task creation can also return `409` if the generated storage key already exists.

Handler errors return a message, like `{"message":"Project not found"}`.
