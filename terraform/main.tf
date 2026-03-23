resource "cloudflare_pages_project" "stacky" {
  account_id        = var.cloudflare_account_id
  name              = "stacky"
  production_branch = "main"

  build_config {
    build_command   = "npm run build"
    destination_dir = "dist"
  }

  deployment_configs {
    production {
      compatibility_date = "2024-01-01"
    }
    preview {
      compatibility_date = "2024-01-01"
    }
  }
}
