resource "aws_dynamodb_table" "project_invitations" {
  name         = "aws-task-manager-project-invitations"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "projectId"
  range_key    = "email"

  attribute {
    name = "projectId"
    type = "S"
  }

  attribute {
    name = "email"
    type = "S"
  }

  global_secondary_index {
    name            = "email-index"
    hash_key        = "email"
    range_key       = "projectId"
    projection_type = "ALL"
  }

  ttl {
    attribute_name = "expiresAt"
    enabled        = true
  }

  tags = {
    Project = "aws-task-manager"
  }
}
