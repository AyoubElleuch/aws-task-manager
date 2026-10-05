resource "aws_iam_role" "health" {
  name = "aws-task-manager-health"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_role_policy" "health_logs" {
  name = "write-health-logs"
  role = aws_iam_role.health.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = [
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ]
        Effect   = "Allow"
        Resource = "${trimsuffix(aws_cloudwatch_log_group.health.arn, ":*")}:log-stream:*"
      }
    ]
  })
}

resource "aws_iam_role" "me" {
  name = "aws-task-manager-me"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_role_policy" "me_logs" {
  name = "write-me-logs"
  role = aws_iam_role.me.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = [
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ]
        Effect   = "Allow"
        Resource = "${trimsuffix(aws_cloudwatch_log_group.me.arn, ":*")}:log-stream:*"
      }
    ]
  })
}
