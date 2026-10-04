resource "aws_cognito_user_pool" "app" {
  name           = "aws-task-manager"
  user_pool_tier = "LITE"

  username_attributes      = ["email"]
  auto_verified_attributes = ["email"]

  username_configuration {
    case_sensitive = false
  }

  admin_create_user_config {
    allow_admin_create_user_only = false
  }

  email_configuration {
    email_sending_account = "COGNITO_DEFAULT"
  }

  verification_message_template {
    default_email_option = "CONFIRM_WITH_CODE"
  }

  account_recovery_setting {
    recovery_mechanism {
      name     = "verified_email"
      priority = 1
    }
  }

  tags = {
    Project = "aws-task-manager"
  }
}

resource "aws_cognito_user_pool_client" "frontend" {
  name         = "aws-task-manager-frontend"
  user_pool_id = aws_cognito_user_pool.app.id

  generate_secret = false

  allowed_oauth_flows_user_pool_client = true
  allowed_oauth_flows                  = ["code"]
  allowed_oauth_scopes                 = ["email", "openid", "profile"]
  supported_identity_providers         = ["COGNITO"]

  callback_urls = [
    "http://localhost:3000/callback",
    "https://${aws_cloudfront_distribution.frontend.domain_name}/callback"
  ]

  logout_urls = [
    "http://localhost:3000/",
    "https://${aws_cloudfront_distribution.frontend.domain_name}/"
  ]

  explicit_auth_flows           = ["ALLOW_REFRESH_TOKEN_AUTH"]
  prevent_user_existence_errors = "ENABLED"
  enable_token_revocation       = true
}

resource "aws_cognito_user_pool_domain" "app" {
  domain = "task-manager-${data.aws_caller_identity.current.account_id}"

  user_pool_id          = aws_cognito_user_pool.app.id
  managed_login_version = 1
}