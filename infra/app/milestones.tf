resource "aws_dynamodb_table" "milestones" {
  name         = "aws-task-manager-milestones"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "projectId"
  range_key    = "milestoneId"

  attribute {
    name = "projectId"
    type = "S"
  }

  attribute {
    name = "milestoneId"
    type = "S"
  }

  tags = {
    Project = "aws-task-manager"
  }
}