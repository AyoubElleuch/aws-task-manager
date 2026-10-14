# All runs use mocked providers and plan only; no AWS resources are changed.
mock_provider "aws" {
  mock_data "aws_caller_identity" {
    defaults = {
      account_id = "123456789012"
    }
  }

  override_resource {
    target          = aws_cloudfront_distribution.frontend
    override_during = plan
    values = {
      domain_name = "example.cloudfront.net"
      arn         = "arn:aws:cloudfront::123456789012:distribution/EXAMPLE"
    }
  }
}

mock_provider "archive" {}

run "cloudfront_hostname_by_default" {
  command = plan

  assert {
    condition     = length(aws_cloudfront_distribution.frontend.aliases) == 0 && aws_cloudfront_distribution.frontend.viewer_certificate[0].cloudfront_default_certificate
    error_message = "Without domain inputs, CloudFront must retain its default hostname and certificate."
  }

  assert {
    condition     = output.website_url == "https://example.cloudfront.net" && output.cloudfront_domain_name == "example.cloudfront.net"
    error_message = "The default website URL and DNS target must use the CloudFront hostname."
  }

  assert {
    condition     = toset(aws_apigatewayv2_api.task_manager.cors_configuration[0].allow_origins) == toset(["https://example.cloudfront.net", "http://localhost:3000"])
    error_message = "Default API CORS must allow only the CloudFront and local frontend origins."
  }

  assert {
    condition = (
      toset(aws_cognito_user_pool_client.frontend.callback_urls) == toset(["https://example.cloudfront.net/callback", "http://localhost:3000/callback"]) &&
      toset(aws_cognito_user_pool_client.frontend.logout_urls) == toset(["https://example.cloudfront.net/", "http://localhost:3000/"])
    )
    error_message = "Default Cognito URLs must retain the CloudFront and local origins."
  }
}

run "custom_hostname_with_https_and_auth" {
  command = plan

  variables {
    domain_name         = "taskmanager.mohamedayoubeleuch.com"
    acm_certificate_arn = "arn:aws:acm:us-east-1:123456789012:certificate/00000000-0000-0000-0000-000000000000"
  }

  assert {
    condition = (
      toset(aws_cloudfront_distribution.frontend.aliases) == toset([var.domain_name]) &&
      !aws_cloudfront_distribution.frontend.viewer_certificate[0].cloudfront_default_certificate &&
      aws_cloudfront_distribution.frontend.viewer_certificate[0].acm_certificate_arn == var.acm_certificate_arn &&
      aws_cloudfront_distribution.frontend.viewer_certificate[0].ssl_support_method == "sni-only" &&
      aws_cloudfront_distribution.frontend.viewer_certificate[0].minimum_protocol_version == "TLSv1.2_2021"
    )
    error_message = "The custom hostname must use its ACM certificate, SNI, and TLS 1.2."
  }

  assert {
    condition     = output.website_url == "https://${var.domain_name}" && output.cloudfront_domain_name == "example.cloudfront.net"
    error_message = "The website URL must use the custom hostname while DNS still targets CloudFront."
  }

  assert {
    condition     = toset(aws_apigatewayv2_api.task_manager.cors_configuration[0].allow_origins) == toset(["https://${var.domain_name}", "https://example.cloudfront.net", "http://localhost:3000"])
    error_message = "API CORS must allow the custom hostname as well as the existing origins."
  }

  assert {
    condition = (
      toset(aws_cognito_user_pool_client.frontend.callback_urls) == toset(["https://${var.domain_name}/callback", "https://example.cloudfront.net/callback", "http://localhost:3000/callback"]) &&
      toset(aws_cognito_user_pool_client.frontend.logout_urls) == toset(["https://${var.domain_name}/", "https://example.cloudfront.net/", "http://localhost:3000/"])
    )
    error_message = "Cognito must include the custom callback and logout URLs and retain existing URLs."
  }
}

run "reject_hostname_without_certificate" {
  command = plan
  variables {
    domain_name = "taskmanager.mohamedayoubeleuch.com"
  }
  expect_failures = [var.domain_name]
}

run "reject_certificate_without_hostname" {
  command = plan
  variables {
    acm_certificate_arn = "arn:aws:acm:us-east-1:123456789012:certificate/00000000-0000-0000-0000-000000000000"
  }
  expect_failures = [var.domain_name]
}

run "reject_certificate_in_wrong_region" {
  command = plan
  variables {
    domain_name         = "taskmanager.mohamedayoubeleuch.com"
    acm_certificate_arn = "arn:aws:acm:eu-west-1:123456789012:certificate/00000000-0000-0000-0000-000000000000"
  }
  expect_failures = [var.acm_certificate_arn]
}

run "reject_url_as_hostname" {
  command = plan
  variables {
    domain_name         = "https://taskmanager.mohamedayoubeleuch.com/"
    acm_certificate_arn = "arn:aws:acm:us-east-1:123456789012:certificate/00000000-0000-0000-0000-000000000000"
  }
  expect_failures = [var.domain_name]
}
