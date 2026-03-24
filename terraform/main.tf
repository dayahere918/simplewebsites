# ========================================
# Cloudflare Pages Projects
# ========================================
resource "cloudflare_pages_project" "sites" {
  for_each          = toset(var.site_names)
  account_id        = var.cloudflare_account_id
  name              = each.key
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

# ========================================
# Custom Subdomains (only if custom_domain is set)
# ========================================
resource "cloudflare_pages_domain" "subdomains" {
  for_each     = { for k, v in var.subdomain_config : k => v if var.custom_domain != "" }
  account_id   = var.cloudflare_account_id
  project_name = each.key
  domain       = "${each.value}.${var.custom_domain}"
  depends_on   = [cloudflare_pages_project.sites]
}

resource "cloudflare_record" "subdomain_cnames" {
  for_each = { for k, v in var.subdomain_config : k => v if var.cloudflare_zone_id != "" }
  zone_id  = var.cloudflare_zone_id
  name     = each.value
  content  = "${each.key}.pages.dev"
  type     = "CNAME"
  proxied  = true
}

# ========================================
# Email Routing (contact@ & support@ → personal email)
# ========================================
resource "cloudflare_email_routing_settings" "main" {
  count   = var.cloudflare_zone_id != "" ? 1 : 0
  zone_id = var.cloudflare_zone_id
  enabled = true
}

resource "cloudflare_email_routing_address" "destination" {
  count      = var.cloudflare_zone_id != "" ? 1 : 0
  account_id = var.cloudflare_account_id
  email      = var.contact_email
}

resource "cloudflare_email_routing_rule" "contact" {
  count   = var.cloudflare_zone_id != "" ? 1 : 0
  zone_id = var.cloudflare_zone_id
  name    = "contact-forward"
  enabled = true

  matcher {
    type  = "literal"
    field = "to"
    value = "contact@${var.custom_domain}"
  }

  action {
    type  = "forward"
    value = [var.contact_email]
  }
}

resource "cloudflare_email_routing_rule" "support" {
  count   = var.cloudflare_zone_id != "" ? 1 : 0
  zone_id = var.cloudflare_zone_id
  name    = "support-forward"
  enabled = true

  matcher {
    type  = "literal"
    field = "to"
    value = "support@${var.custom_domain}"
  }

  action {
    type  = "forward"
    value = [var.contact_email]
  }
}

# ========================================
# Cloudflare Security & Performance (Free Tier)
# ========================================
resource "cloudflare_zone_settings_override" "security" {
  count   = var.cloudflare_zone_id != "" ? 1 : 0
  zone_id = var.cloudflare_zone_id

  settings {
    ssl                      = "full"
    always_use_https         = "on"
    min_tls_version          = "1.2"
    browser_check            = "on"
    hotlink_protection       = "on"
    security_level           = "medium"
    challenge_ttl            = 1800
    automatic_https_rewrites = "on"
    opportunistic_encryption = "on"
    brotli                   = "on"

    minify {
      css  = "on"
      js   = "on"
      html = "on"
    }
  }
}
