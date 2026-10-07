resource "aws_cloudwatch_log_group" "health" {
  name              = "/aws/lambda/aws-task-manager-health"
  retention_in_days = 14
}

resource "aws_cloudwatch_log_group" "me" {
  name              = "/aws/lambda/aws-task-manager-me"
  retention_in_days = 14
}

resource "aws_cloudwatch_log_group" "projects" {
  name              = "/aws/lambda/aws-task-manager-projects"
  retention_in_days = 14
}

resource "aws_cloudwatch_log_group" "milestones" {
  name              = "/aws/lambda/aws-task-manager-milestones"
  retention_in_days = 14
}

resource "aws_cloudwatch_log_group" "tasks" {
  name              = "/aws/lambda/aws-task-manager-tasks"
  retention_in_days = 14
}
