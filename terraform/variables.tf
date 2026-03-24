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
    "pet-breed-identifier"
  ]
}
