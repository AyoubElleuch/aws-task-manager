resource "aws_apigatewayv2_integration" "projects" {
  api_id                 = aws_apigatewayv2_api.task_manager.id
  integration_type       = "AWS_PROXY"
  integration_uri        = aws_lambda_function.projects.invoke_arn
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_route" "projects_get" {
  api_id               = aws_apigatewayv2_api.task_manager.id
  route_key            = "GET /projects"
  target               = "integrations/${aws_apigatewayv2_integration.projects.id}"
  authorization_type   = "JWT"
  authorizer_id        = aws_apigatewayv2_authorizer.cognito.id
  authorization_scopes = ["aws.cognito.signin.user.admin"]
}

resource "aws_apigatewayv2_route" "projects_post" {
  api_id               = aws_apigatewayv2_api.task_manager.id
  route_key            = "POST /projects"
  target               = "integrations/${aws_apigatewayv2_integration.projects.id}"
  authorization_type   = "JWT"
  authorizer_id        = aws_apigatewayv2_authorizer.cognito.id
  authorization_scopes = ["aws.cognito.signin.user.admin"]
}

resource "aws_lambda_permission" "projects_get_api" {
  statement_id  = "AllowProjectsGetApiInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.projects.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.task_manager.execution_arn}/*/GET/projects"
}

resource "aws_lambda_permission" "projects_post_api" {
  statement_id  = "AllowProjectsPostApiInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.projects.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.task_manager.execution_arn}/*/POST/projects"
}

resource "aws_apigatewayv2_route" "projects_patch" {
  api_id               = aws_apigatewayv2_api.task_manager.id
  route_key            = "PATCH /projects"
  target               = "integrations/${aws_apigatewayv2_integration.projects.id}"
  authorization_type   = "JWT"
  authorizer_id        = aws_apigatewayv2_authorizer.cognito.id
  authorization_scopes = ["aws.cognito.signin.user.admin"]
}

resource "aws_lambda_permission" "projects_patch_api" {
  statement_id  = "AllowProjectsPatchApiInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.projects.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.task_manager.execution_arn}/*/PATCH/projects"
}

resource "aws_apigatewayv2_route" "projects_delete" {
  api_id               = aws_apigatewayv2_api.task_manager.id
  route_key            = "DELETE /projects"
  target               = "integrations/${aws_apigatewayv2_integration.projects.id}"
  authorization_type   = "JWT"
  authorizer_id        = aws_apigatewayv2_authorizer.cognito.id
  authorization_scopes = ["aws.cognito.signin.user.admin"]
}

resource "aws_lambda_permission" "projects_delete_api" {
  statement_id  = "AllowProjectsDeleteApiInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.projects.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.task_manager.execution_arn}/*/DELETE/projects"
}
