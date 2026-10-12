resource "aws_apigatewayv2_integration" "tasks" {
  api_id                 = aws_apigatewayv2_api.task_manager.id
  integration_type       = "AWS_PROXY"
  integration_uri        = aws_lambda_function.tasks.invoke_arn
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_route" "tasks_get" {
  api_id               = aws_apigatewayv2_api.task_manager.id
  route_key            = "GET /tasks"
  target               = "integrations/${aws_apigatewayv2_integration.tasks.id}"
  authorization_type   = "JWT"
  authorizer_id        = aws_apigatewayv2_authorizer.cognito.id
  authorization_scopes = ["aws.cognito.signin.user.admin"]
}

resource "aws_lambda_permission" "tasks_get_api" {
  statement_id  = "AllowTasksGetApiInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.tasks.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.task_manager.execution_arn}/*/GET/tasks"
}

resource "aws_apigatewayv2_route" "tasks_post" {
  api_id               = aws_apigatewayv2_api.task_manager.id
  route_key            = "POST /tasks"
  target               = "integrations/${aws_apigatewayv2_integration.tasks.id}"
  authorization_type   = "JWT"
  authorizer_id        = aws_apigatewayv2_authorizer.cognito.id
  authorization_scopes = ["aws.cognito.signin.user.admin"]
}

resource "aws_lambda_permission" "tasks_post_api" {
  statement_id  = "AllowTasksPostApiInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.tasks.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.task_manager.execution_arn}/*/POST/tasks"
}

resource "aws_apigatewayv2_route" "tasks_patch" {
  api_id               = aws_apigatewayv2_api.task_manager.id
  route_key            = "PATCH /tasks"
  target               = "integrations/${aws_apigatewayv2_integration.tasks.id}"
  authorization_type   = "JWT"
  authorizer_id        = aws_apigatewayv2_authorizer.cognito.id
  authorization_scopes = ["aws.cognito.signin.user.admin"]
}

resource "aws_lambda_permission" "tasks_patch_api" {
  statement_id  = "AllowTasksPatchApiInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.tasks.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.task_manager.execution_arn}/*/PATCH/tasks"
}

resource "aws_apigatewayv2_route" "tasks_delete" {
  api_id               = aws_apigatewayv2_api.task_manager.id
  route_key            = "DELETE /tasks"
  target               = "integrations/${aws_apigatewayv2_integration.tasks.id}"
  authorization_type   = "JWT"
  authorizer_id        = aws_apigatewayv2_authorizer.cognito.id
  authorization_scopes = ["aws.cognito.signin.user.admin"]
}

resource "aws_lambda_permission" "tasks_delete_api" {
  statement_id  = "AllowTasksDeleteApiInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.tasks.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.task_manager.execution_arn}/*/DELETE/tasks"
}
