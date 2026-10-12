resource "aws_apigatewayv2_integration" "milestones" {
  api_id                 = aws_apigatewayv2_api.task_manager.id
  integration_type       = "AWS_PROXY"
  integration_uri        = aws_lambda_function.milestones.invoke_arn
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_route" "milestones_get" {
  api_id               = aws_apigatewayv2_api.task_manager.id
  route_key            = "GET /milestones"
  target               = "integrations/${aws_apigatewayv2_integration.milestones.id}"
  authorization_type   = "JWT"
  authorizer_id        = aws_apigatewayv2_authorizer.cognito.id
  authorization_scopes = ["aws.cognito.signin.user.admin"]
}

resource "aws_lambda_permission" "milestones_get_api" {
  statement_id  = "AllowMilestonesGetApiInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.milestones.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.task_manager.execution_arn}/*/GET/milestones"
}

resource "aws_apigatewayv2_route" "milestones_post" {
  api_id               = aws_apigatewayv2_api.task_manager.id
  route_key            = "POST /milestones"
  target               = "integrations/${aws_apigatewayv2_integration.milestones.id}"
  authorization_type   = "JWT"
  authorizer_id        = aws_apigatewayv2_authorizer.cognito.id
  authorization_scopes = ["aws.cognito.signin.user.admin"]
}

resource "aws_lambda_permission" "milestones_post_api" {
  statement_id  = "AllowMilestonesPostApiInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.milestones.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.task_manager.execution_arn}/*/POST/milestones"
}

resource "aws_apigatewayv2_route" "milestones_delete" {
  api_id               = aws_apigatewayv2_api.task_manager.id
  route_key            = "DELETE /milestones"
  target               = "integrations/${aws_apigatewayv2_integration.milestones.id}"
  authorization_type   = "JWT"
  authorizer_id        = aws_apigatewayv2_authorizer.cognito.id
  authorization_scopes = ["aws.cognito.signin.user.admin"]
}

resource "aws_lambda_permission" "milestones_delete_api" {
  statement_id  = "AllowMilestonesDeleteApiInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.milestones.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.task_manager.execution_arn}/*/DELETE/milestones"
}

resource "aws_apigatewayv2_route" "milestones_patch" {
  api_id               = aws_apigatewayv2_api.task_manager.id
  route_key            = "PATCH /milestones"
  target               = "integrations/${aws_apigatewayv2_integration.milestones.id}"
  authorization_type   = "JWT"
  authorizer_id        = aws_apigatewayv2_authorizer.cognito.id
  authorization_scopes = ["aws.cognito.signin.user.admin"]
}

resource "aws_lambda_permission" "milestones_patch_api" {
  statement_id  = "AllowMilestonesPatchApiInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.milestones.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.task_manager.execution_arn}/*/PATCH/milestones"
}
