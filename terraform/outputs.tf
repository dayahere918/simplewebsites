output "website_urls" {
  description = "The root URL of each deployed tool website"
  value       = { for name, project in cloudflare_pages_project.sites : name => "https://${project.subdomain}" }
}
