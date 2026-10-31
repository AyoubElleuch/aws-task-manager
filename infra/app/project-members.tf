resource "aws_dynamodb_table" "project_members" {
  name         = "aws-task-manager-project-members"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "projectId"
  range_key    = "userId"

  attribute {
    name = "projectId"
    type = "S"
  }

  attribute {
    name = "userId"
    type = "S"
  }

  global_secondary_index {
    name            = "userId-index"
    hash_key        = "userId"
    range_key       = "projectId"
    projection_type = "ALL"
  }

  tags = {
    Project = "aws-task-manager"
  }
}
