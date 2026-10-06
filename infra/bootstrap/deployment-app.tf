locals {
  frontend_bucket_arn = "arn:aws:s3:::aws-task-manager-frontend-${data.aws_caller_identity.current.account_id}"
  health_role_arn     = "arn:aws:iam::${data.aws_caller_identity.current.account_id}:role/aws-task-manager-health"
  health_lambda_arn   = "arn:aws:lambda:us-east-1:${data.aws_caller_identity.current.account_id}:function:aws-task-manager-health"
  health_log_arn      = "arn:aws:logs:us-east-1:${data.aws_caller_identity.current.account_id}:log-group:/aws/lambda/aws-task-manager-health"
  me_role_arn         = "arn:aws:iam::${data.aws_caller_identity.current.account_id}:role/aws-task-manager-me"
  me_lambda_arn       = "arn:aws:lambda:us-east-1:${data.aws_caller_identity.current.account_id}:function:aws-task-manager-me"
  me_log_arn          = "arn:aws:logs:us-east-1:${data.aws_caller_identity.current.account_id}:log-group:/aws/lambda/aws-task-manager-me"
  dynamodb_table_arns = [
    for table_name in ["users", "projects", "milestones", "tasks"] :
    "arn:aws:dynamodb:us-east-1:${data.aws_caller_identity.current.account_id}:table/aws-task-manager-${table_name}"
  ]
  cognito_pool_arn    = "arn:aws:cognito-idp:us-east-1:${data.aws_caller_identity.current.account_id}:userpool/*"
  projects_role_arn   = "arn:aws:iam::${data.aws_caller_identity.current.account_id}:role/aws-task-manager-projects"
  projects_lambda_arn = "arn:aws:lambda:us-east-1:${data.aws_caller_identity.current.account_id}:function:aws-task-manager-projects"
  projects_log_arn    = "arn:aws:logs:us-east-1:${data.aws_caller_identity.current.account_id}:log-group:/aws/lambda/aws-task-manager-projects"
}

resource "aws_iam_role_policy" "github_app_deploy" {
  name = "aws-task-manager-app-deploy"
  role = aws_iam_role.github_main.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid      = "ListAppState"
        Effect   = "Allow"
        Action   = ["s3:ListBucket"]
        Resource = aws_s3_bucket.terraform_state.arn
        Condition = {
          StringLike = {
            "s3:prefix" = ["app/terraform.tfstate*"]
          }
        }
      },
      {
        Sid      = "ReadWriteAppState"
        Effect   = "Allow"
        Action   = ["s3:GetObject", "s3:PutObject"]
        Resource = "${aws_s3_bucket.terraform_state.arn}/app/terraform.tfstate"
      },
      {
        Sid      = "ManageAppStateLock"
        Effect   = "Allow"
        Action   = ["s3:GetObject", "s3:PutObject", "s3:DeleteObject"]
        Resource = "${aws_s3_bucket.terraform_state.arn}/app/terraform.tfstate.tflock"
      },
      {
        Sid      = "ManageFrontendBucket"
        Effect   = "Allow"
        Action   = ["s3:*"]
        Resource = [local.frontend_bucket_arn, "${local.frontend_bucket_arn}/*"]
      },
      {
        Sid    = "ManageFrontendCloudFront"
        Effect = "Allow"
        Action = [
          "cloudfront:CreateOriginAccessControl",
          "cloudfront:GetOriginAccessControl",
          "cloudfront:GetOriginAccessControlConfig",
          "cloudfront:UpdateOriginAccessControl",
          "cloudfront:DeleteOriginAccessControl",
          "cloudfront:ListOriginAccessControls",
          "cloudfront:CreateDistribution",
          "cloudfront:GetDistribution",
          "cloudfront:GetDistributionConfig",
          "cloudfront:UpdateDistribution",
          "cloudfront:DeleteDistribution",
          "cloudfront:ListDistributions",
          "cloudfront:CreateInvalidation",
          "cloudfront:GetCachePolicy",
          "cloudfront:ListCachePolicies",
          "cloudfront:ListTagsForResource",
          "cloudfront:TagResource",
          "cloudfront:UntagResource",
        ]
        Resource = "*"
      },
      {
        Sid      = "ManageHttpApi"
        Effect   = "Allow"
        Action   = ["apigateway:GET", "apigateway:POST", "apigateway:PUT", "apigateway:PATCH", "apigateway:DELETE"]
        Resource = ["arn:aws:apigateway:us-east-1::/apis", "arn:aws:apigateway:us-east-1::/apis/*"]
      },
      {
        Sid      = "ManageHealthLambda"
        Effect   = "Allow"
        Action   = ["lambda:*"]
        Resource = [local.health_lambda_arn, local.me_lambda_arn, local.projects_lambda_arn]
      },
      {
        Sid      = "ManageHealthExecutionRole"
        Effect   = "Allow"
        Action   = ["iam:CreateRole", "iam:DeleteRole", "iam:GetRole", "iam:UpdateAssumeRolePolicy", "iam:PutRolePolicy", "iam:GetRolePolicy", "iam:DeleteRolePolicy", "iam:ListRolePolicies", "iam:ListAttachedRolePolicies", "iam:ListInstanceProfilesForRole", "iam:ListRoleTags", "iam:TagRole", "iam:UntagRole"]
        Resource = [local.health_role_arn, local.me_role_arn, local.projects_role_arn]
      },
      {
        Sid      = "PassHealthRoleToLambda"
        Effect   = "Allow"
        Action   = ["iam:PassRole"]
        Resource = [local.health_role_arn, local.me_role_arn, local.projects_role_arn]
        Condition = {
          StringEquals = {
            "iam:PassedToService" = "lambda.amazonaws.com"
          }
        }
      },
      {
        Sid      = "ManageHealthLogs"
        Effect   = "Allow"
        Action   = ["logs:*"]
        Resource = [local.health_log_arn, "${local.health_log_arn}:*", local.me_log_arn, "${local.me_log_arn}:*", local.projects_log_arn, "${local.projects_log_arn}:*"]
      },
      {
        Sid      = "ListLogGroups"
        Effect   = "Allow"
        Action   = ["logs:DescribeLogGroups"]
        Resource = "*"
      },
      {
        Sid    = "ManageAppDynamoDBTables"
        Effect = "Allow"
        Action = [
          "dynamodb:CreateTable",
          "dynamodb:DescribeTable",
          "dynamodb:UpdateTable",
          "dynamodb:DeleteTable",
          "dynamodb:DescribeContinuousBackups",
          "dynamodb:DescribeTimeToLive",
          "dynamodb:ListTagsOfResource",
          "dynamodb:TagResource",
          "dynamodb:UntagResource"
        ]
        Resource = local.dynamodb_table_arns
      },
      {
        Sid      = "CreateAppCognitoPool"
        Effect   = "Allow"
        Action   = ["cognito-idp:CreateUserPool"]
        Resource = "*"

        Condition = {
          StringEquals = {
            "aws:RequestedRegion"    = "us-east-1"
            "aws:RequestTag/Project" = "aws-task-manager"
          }
        }
      },
      {
        Sid      = "DescribeCognitoDomains"
        Effect   = "Allow"
        Action   = ["cognito-idp:DescribeUserPoolDomain"]
        Resource = "*"

        Condition = {
          StringEquals = {
            "aws:RequestedRegion" = "us-east-1"
          }
        }
      },
      {
        Sid    = "ManageAppCognitoResources"
        Effect = "Allow"
        Action = [
          "cognito-idp:DescribeUserPool",
          "cognito-idp:UpdateUserPool",
          "cognito-idp:DeleteUserPool",
          "cognito-idp:GetUserPoolMfaConfig",
          "cognito-idp:SetUserPoolMfaConfig",
          "cognito-idp:CreateUserPoolClient",
          "cognito-idp:DescribeUserPoolClient",
          "cognito-idp:UpdateUserPoolClient",
          "cognito-idp:DeleteUserPoolClient",
          "cognito-idp:CreateUserPoolDomain",
          "cognito-idp:UpdateUserPoolDomain",
          "cognito-idp:DeleteUserPoolDomain",
          "cognito-idp:ListTagsForResource",
          "cognito-idp:TagResource",
          "cognito-idp:UntagResource"
        ]
        Resource = local.cognito_pool_arn
      },
    ]
  })
}
