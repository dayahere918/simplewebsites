# PowerShell script to import all 21 Cloudflare Projects into Terraform Cloud
$sites = @(
    "picker-wheel", "festival-countdown", "bill-splitter", "emoji-translator",
    "sleep-calculator", "startup-idea-generator", "loan-visualizer",
    "height-comparison", "color-palette-extractor", "typing-speed-race",
    "noise-meter", "voice-to-text-counter", "mood-board-generator",
    "aws-cost-estimator", "terraform-snippet-generator", "cicd-visualizer",
    "cloud-service-comparison", "resume-ats-checker", "face-shape-detector",
    "baby-face-generator", "pet-breed-identifier"
)

Write-Host "🚀 Starting Batch Import to Terraform Cloud..." -ForegroundColor Cyan

foreach ($site in $sites) {
    Write-Host "🔍 Importing $site..." -ForegroundColor Gray
    # The resource address must match the code: cloudflare_pages_project.sites["site-name"]
    # The ID for Cloudflare Pages project is just the project name.
    terraform import "cloudflare_pages_project.sites[`"$site`"]" "$site"
}

Write-Host "🏁 Import process complete! Review the output above for any errors." -ForegroundColor Green
