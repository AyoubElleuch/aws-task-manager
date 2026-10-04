resource "aws_dynamodb_table" "projects" {
  name         = "aws-task-manager-projects"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "userId"
  range_key    = "projectId"

  attribute {
    name = "userId"
    type = "S"
  }
  attribute {
    name = "projectId"
    type = "S"
  }

  tags = {
    Project = "aws-task-manager"
  }
}