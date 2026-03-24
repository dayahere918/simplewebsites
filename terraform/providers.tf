terraform {
  required_version = ">= 1.5.0"

  cloud {
    organization = "dayashimoga-org"
    workspaces {
      name = "simplewebsites-prod"
    }
  }

  required_providers {
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 4.0"
    }
  }

  backend "local" {}
}

provider "cloudflare" {
  api_token = var.cloudflare_api_token
}
