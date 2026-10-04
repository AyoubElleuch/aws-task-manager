resource "aws_dynamodb_table" "users" {
  name         = "aws-task-manager-users"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "id"

  attribute {
    name = "id"
    type = "S"
  }

  tags = {
    Project = "aws-task-manager"
  }
}