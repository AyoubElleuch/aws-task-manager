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

  filename         = data.archive_file.projects.output_path
  source_code_hash = data.archive_file.projects.output_base64sha256

  environment {
    variables = {
      PROJECTS_TABLE = aws_dynamodb_table.projects.name
    }
  }

  depends_on = [
    aws_iam_role_policy.projects_logs,
    aws_iam_role_policy.projects_dynamodb,
  ]
}