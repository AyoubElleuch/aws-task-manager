resource "aws_apigatewayv2_api" "task_manager" {
  name          = "aws-task-manager-api"
  protocol_type = "HTTP"

  cors_configuration {
    allow_origins = [
      "https://${aws_cloudfront_distribution.frontend.domain_name}",
      "http://localhost:3000",
    ]

    allow_methods = [
      "GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"
    ]

    allow_headers = [
      "content-type",
      "authorization"
    ]
  }
}

resource "aws_apigatewayv2_authorizer" "cognito" {
  api_id           = aws_apigatewayv2_api.task_manager.id
  name             = "cognito"
  authorizer_type  = "JWT"
  identity_sources = ["$request.header.Authorization"]

  jwt_configuration {
    issuer   = "https://${aws_cognito_user_pool.app.endpoint}"
    audience = [aws_cognito_user_pool_client.frontend.id]
  }
}

resource "aws_apigatewayv2_stage" "default" {
  api_id      = aws_apigatewayv2_api.task_manager.id
  name        = "$default"
  auto_deploy = true
}
