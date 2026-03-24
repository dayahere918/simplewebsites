output "website_urls" {
  description = "The root URL of each deployed tool website"
  value       = { for name, project in cloudflare_pages_project.sites : name => "https://${project.subdomain}" }
}

output "subdomain_urls" {
  description = "Custom subdomain URLs (if configured)"
  value       = { for name, domain in cloudflare_pages_domain.subdomains : name => "https://${domain.domain}" }
}

output "email_routing_addresses" {
  description = "Email addresses configured for routing"
  value = var.cloudflare_zone_id != "" ? [
    "contact@${var.custom_domain}",
    "support@${var.custom_domain}"
  ] : []
}
