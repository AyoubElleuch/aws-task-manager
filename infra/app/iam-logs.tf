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

resource "aws_iam_role_policy" "projects_logs" {
  name = "write-projects-logs"
  role = aws_iam_role.projects.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect   = "Allow"
      Action   = ["logs:CreateLogStream", "logs:PutLogEvents"]
      Resource = "${trimsuffix(aws_cloudwatch_log_group.projects.arn, ":*")}:log-stream:*"
    }]
  })
}

resource "aws_iam_role_policy" "milestones_logs" {
  name = "write-milestones-logs"
  role = aws_iam_role.milestones.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = [
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ]
        Effect   = "Allow"
        Resource = "${trimsuffix(aws_cloudwatch_log_group.milestones.arn, ":*")}:log-stream:*"
      }
    ]
  })
}

resource "aws_iam_role_policy" "tasks_logs" {
  name = "write-tasks-logs"
  role = aws_iam_role.tasks.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = [
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ]
        Effect   = "Allow"
        Resource = "${trimsuffix(aws_cloudwatch_log_group.tasks.arn, ":*")}:log-stream:*"
      }
    ]
  })
}
