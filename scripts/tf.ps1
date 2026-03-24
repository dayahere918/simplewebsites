param(
    [Parameter(ValueFromRemainingArguments=$true)]
    [string[]]$TerraformArgs
)

# Wrapper to run Terraform via Docker (Zero-Install)
# Usage: .\scripts\tf.ps1 plan, .\scripts\tf.ps1 apply, etc.

$CWD = Get-Location
$TERRAFORM_DIR = Join-Path $CWD "terraform"

# Ensure we have our environment variables if running locally
if ($null -eq $env:CLOUDFLARE_API_TOKEN) {
    Write-Warning "CLOUDFLARE_API_TOKEN is not set in your current session."
}

docker run --rm -it `
    -v "${TERRAFORM_DIR}:/workspace" `
    -v "${HOME}/.terraform.d:/root/.terraform.d" `
    -w /workspace `
    -e "TF_VAR_cloudflare_api_token=${env:CLOUDFLARE_API_TOKEN}" `
    -e "TF_VAR_cloudflare_account_id=${env:CLOUDFLARE_ACCOUNT_ID}" `
    hashicorp/terraform:latest `
    $TerraformArgs
