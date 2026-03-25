variable "cloudflare_api_token" {
  description = "Cloudflare API token"
  type        = string
  sensitive   = true
  default     = ""
}

variable "cloudflare_account_id" {
  description = "Cloudflare account ID"
  type        = string
  sensitive   = true
}

variable "cloudflare_zone_id" {
  description = "Cloudflare zone ID for the custom domain (leave empty to skip domain/email/security config)"
  type        = string
  default     = ""
}

variable "custom_domain" {
  description = "Custom domain name (e.g., stackytools.xyz)"
  type        = string
  default     = ""
}

variable "contact_email" {
  description = "Destination email for contact@ and support@ forwarding"
  type        = string
  default     = "dayahere@gmail.com"
}

variable "subdomain_config" {
  description = "Map of site project names to their subdomain prefixes (e.g., picker-wheel = picker)"
  type        = map(string)
  default     = {}
}

variable "site_names" {
  description = "List of site project names for Cloudflare Pages"
  type        = list(string)
  default = [
    "picker-wheel",
    "festival-countdown",
    "bill-splitter",
    "emoji-translator",
    "sleep-calculator",
    "startup-idea-generator",
    "loan-visualizer",
    "height-comparison",
    "color-palette-extractor",
    "typing-speed-race",
    "noise-meter",
    "voice-to-text-counter",
    "mood-board-generator",
    "aws-cost-estimator",
    "terraform-snippet-generator",
    "cicd-visualizer",
    "cloud-service-comparison",
    "resume-ats-checker",
    "face-shape-detector",
    "baby-face-generator",
    "pet-breed-identifier",
    "awesome-free-tools"
  ]
}
