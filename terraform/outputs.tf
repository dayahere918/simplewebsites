output "site_url" {
  description = "The root URL of the monolithic tools deployment"
  value       = "https://${cloudflare_pages_project.stacky.subdomain}"
}
