output "health_url" {
    description = "URL for the health check endpoint"
    value = "${aws_apigatewayv2_api.task_manager.api_endpoint}/health"
}

output "frontend_bucket_name" {
  description = "Name of the S3 bucket for the frontend"
  value       = aws_s3_bucket.frontend.id
}

output "website_url" {
  description = "Public HTTPS URL of the frontend"
  value       = "https://${aws_cloudfront_distribution.frontend.domain_name}"
}

output "frontend_distribution_id" {
  description = "CloudFront distribution ID used during deployment"
  value       = aws_cloudfront_distribution.frontend.id
}