resource "aws_lambda_function" "health" {
  function_name = "aws-task-manager-health"
  runtime       = "nodejs22.x"
  handler       = "main.handler"
  role          = aws_iam_role.health.arn

  filename         = data.archive_file.health.output_path
  source_code_hash = data.archive_file.health.output_base64sha256

  depends_on = [aws_iam_role_policy.health_logs]
}

resource "aws_lambda_function" "me" {
  function_name = "aws-task-manager-me"
  runtime       = "nodejs22.x"
  handler       = "me.handler"
  role          = aws_iam_role.me.arn

  filename         = data.archive_file.me.output_path
  source_code_hash = data.archive_file.me.output_base64sha256

  depends_on = [aws_iam_role_policy.me_logs]
}

resource "aws_lambda_function" "projects" {
  function_name = "aws-task-manager-projects"
  runtime       = "nodejs22.x"
  handler       = "projects.handler"
  role          = aws_iam_role.projects.arn
  timeout       = 30

  filename         = data.archive_file.projects.output_path
  source_code_hash = data.archive_file.projects.output_base64sha256

  environment {
    variables = {
      PROJECTS_TABLE   = aws_dynamodb_table.projects.name
      MILESTONES_TABLE = aws_dynamodb_table.milestones.name
      TASKS_TABLE      = aws_dynamodb_table.tasks.name
    }
  }

  depends_on = [
    aws_iam_role_policy.projects_logs,
    aws_iam_role_policy.projects_dynamodb,
  ]
}

resource "aws_lambda_function" "milestones" {
  function_name = "aws-task-manager-milestones"
  runtime       = "nodejs22.x"
  handler       = "milestones.handler"
  role          = aws_iam_role.milestones.arn
  timeout       = 30

  filename         = data.archive_file.milestones.output_path
  source_code_hash = data.archive_file.milestones.output_base64sha256

  environment {
    variables = {
      MILESTONES_TABLE = aws_dynamodb_table.milestones.name
      PROJECTS_TABLE   = aws_dynamodb_table.projects.name
      TASKS_TABLE      = aws_dynamodb_table.tasks.name
    }
  }

  depends_on = [
    aws_iam_role_policy.milestones_logs,
    aws_iam_role_policy.milestones_dynamodb,
  ]
}

resource "aws_lambda_function" "tasks" {
  function_name = "aws-task-manager-tasks"
  runtime       = "nodejs22.x"
  handler       = "tasks.handler"
  role          = aws_iam_role.tasks.arn

  filename         = data.archive_file.tasks.output_path
  source_code_hash = data.archive_file.tasks.output_base64sha256

  environment {
    variables = {
      TASKS_TABLE      = aws_dynamodb_table.tasks.name
      PROJECTS_TABLE   = aws_dynamodb_table.projects.name
      MILESTONES_TABLE = aws_dynamodb_table.milestones.name
    }
  }

  depends_on = [
    aws_iam_role_policy.tasks_logs,
    aws_iam_role_policy.tasks_dynamodb,
  ]
}
