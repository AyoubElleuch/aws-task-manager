resource "aws_dynamodb_table" "tasks" {
    name = "aws-task-manager-tasks"
    billing_mode = "PAY_PER_REQUEST"
    hash_key = "milestoneKey"
    range_key = "taskId"

    attribute {
        name = "milestoneKey"
        type = "S"
    }

    attribute {
        name = "taskId"
        type = "S"
    }

    tags = {
        Project = "aws-task-manager"
    }
}