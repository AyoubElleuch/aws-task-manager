resource "aws_apigatewayv2_api" "task_manager" {
  name          = "aws-task-manager-api"
  protocol_type = "HTTP"
}

resource "aws_apigatewayv2_integration" "health" {
  api_id                 = aws_apigatewayv2_api.task_manager.id
  integration_type       = "AWS_PROXY"
  integration_uri        = aws_lambda_function.health.invoke_arn
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_route" "health" {
  api_id    = aws_apigatewayv2_api.task_manager.id
  route_key = "GET /health"
  target    = "integrations/${aws_apigatewayv2_integration.health.id}"
}

resource "aws_apigatewayv2_stage" "default" {
  api_id      = aws_apigatewayv2_api.task_manager.id
  name        = "$default"
  auto_deploy = true
}

resource "aws_lambda_permission" "health_api" {
  statement_id  = "AllowHealthApiInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.health.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.task_manager.execution_arn}/*/GET/health"
}

output "health_url" {
  description = "Public health endpoint URL"
  value       = "${aws_apigatewayv2_api.task_manager.api_endpoint}/health"
}
