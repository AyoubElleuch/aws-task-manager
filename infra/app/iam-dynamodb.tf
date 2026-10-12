resource "aws_iam_role_policy" "projects_dynamodb" {
  name = "projects-table-access"
  role = aws_iam_role.projects.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect   = "Allow"
        Action   = ["dynamodb:Query", "dynamodb:GetItem", "dynamodb:PutItem", "dynamodb:UpdateItem", "dynamodb:DeleteItem"]
        Resource = aws_dynamodb_table.projects.arn
      },
      {
        Effect   = "Allow"
        Action   = ["dynamodb:Query", "dynamodb:DeleteItem"]
        Resource = [aws_dynamodb_table.milestones.arn, aws_dynamodb_table.tasks.arn]
      }
    ]
  })
}

resource "aws_iam_role_policy" "milestones_dynamodb" {
  name = "milestones-table-access"
  role = aws_iam_role.milestones.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect   = "Allow"
        Action   = ["dynamodb:Query", "dynamodb:GetItem", "dynamodb:PutItem", "dynamodb:UpdateItem", "dynamodb:DeleteItem"]
        Resource = aws_dynamodb_table.milestones.arn
      },
      {
        Effect   = "Allow"
        Action   = ["dynamodb:GetItem"]
        Resource = aws_dynamodb_table.projects.arn
      },
      {
        Effect   = "Allow"
        Action   = ["dynamodb:Query", "dynamodb:UpdateItem", "dynamodb:DeleteItem"]
        Resource = aws_dynamodb_table.tasks.arn
      }
    ]
  })
}

resource "aws_iam_role_policy" "tasks_dynamodb" {
  name = "tasks-table-access"
  role = aws_iam_role.tasks.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect   = "Allow"
        Action   = ["dynamodb:Query", "dynamodb:GetItem", "dynamodb:PutItem", "dynamodb:UpdateItem", "dynamodb:DeleteItem"]
        Resource = aws_dynamodb_table.tasks.arn
      },
      {
        Effect   = "Allow"
        Action   = ["dynamodb:GetItem"]
        Resource = [aws_dynamodb_table.projects.arn, aws_dynamodb_table.milestones.arn]
      },
      {
        Effect   = "Allow"
        Action   = ["dynamodb:UpdateItem"]
        Resource = aws_dynamodb_table.milestones.arn
      }
    ]
  })
}
