resource "cloudflare_pages_project" "sites" {
  for_each = toset(var.sites)

  account_id        = var.cloudflare_account_id
  name              = each.value
  production_branch = "main"

  build_config {
    build_command   = ""
    destination_dir = ""
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
