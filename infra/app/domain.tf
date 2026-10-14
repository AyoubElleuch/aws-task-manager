variable "domain_name" {
  description = "Optional lowercase frontend hostname, without a scheme or path. Set together with acm_certificate_arn."
  type        = string
  default     = ""
  nullable    = false

  validation {
    condition = var.domain_name == "" || (
      length(var.domain_name) <= 253 &&
      can(regex("^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?(\\.[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)+$", var.domain_name))
    )
    error_message = "domain_name must be a lowercase DNS hostname, such as taskmanager.mohamedayoubeleuch.com, without https://, a path, or a trailing dot."
  }

  validation {
    condition     = (var.domain_name == "") == (var.acm_certificate_arn == "")
    error_message = "Set domain_name and acm_certificate_arn together, or leave both empty to use the CloudFront hostname."
  }
}

variable "acm_certificate_arn" {
  description = "Optional ARN of an issued ACM certificate in us-east-1 covering domain_name."
  type        = string
  default     = ""
  nullable    = false

  validation {
    condition     = var.acm_certificate_arn == "" || can(regex("^arn:aws:acm:us-east-1:[0-9]{12}:certificate/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$", var.acm_certificate_arn))
    error_message = "acm_certificate_arn must be an ACM certificate ARN in us-east-1, the region required by CloudFront."
  }
}

locals {
  custom_domain_enabled = var.domain_name != ""
  frontend_url          = local.custom_domain_enabled ? "https://${var.domain_name}" : "https://${aws_cloudfront_distribution.frontend.domain_name}"
  frontend_origins = concat(
    ["https://${aws_cloudfront_distribution.frontend.domain_name}", "http://localhost:3000"],
    local.custom_domain_enabled ? ["https://${var.domain_name}"] : []
  )
}
