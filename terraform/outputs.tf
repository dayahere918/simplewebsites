output "site_urls" {
  description = "Cloudflare Pages deployment URLs for each site"
  value = {
    for name, project in cloudflare_pages_project.sites :
    name => "https://${project.subdomain}"
  }
}
