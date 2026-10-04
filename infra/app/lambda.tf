resource "aws_lambda_function" "health" {
  function_name = "aws-task-manager-health"
  runtime       = "nodejs22.x"
  handler       = "main.handler"
  role          = aws_iam_role.health.arn

  filename         = data.archive_file.health.output_path
  source_code_hash = data.archive_file.health.output_base64sha256

  depends_on = [aws_iam_role_policy.health_logs]
}
