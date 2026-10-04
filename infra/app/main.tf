terraform {
  required_version = ">= 1.10.0"

  backend "s3" {
    bucket       = "aws-task-manager-state-242668367599"
    key          = "app/terraform.tfstate"
    region       = "us-east-1"
    use_lockfile = true
  }

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = ">= 5.0.0"
    }

    archive = {
      source  = "hashicorp/archive"
      version = ">= 2.0.0"
    }
  }
}

provider "aws" {
  region = "us-east-1"
}
