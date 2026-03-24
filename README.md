# Simple Websites Monorepo
This monorepo contains 21 premium utility websites built with high quality in mind.

## 🚀 Key Features
- **>90% Test Coverage**: Verified across every single site.
- **100% Pass Rate**: Continuous Integration (CI) and Deployment (CD) stabilized.
- **Zero-Install Automation**: Infrastructure is managed via GitHub Actions and Terraform Cloud—no local binary installation needed.
- **Multi-Account Sync**: Automatically pushes to dual GitHub repositories.

## 🛠️ Global Commands
- `npm ci`: Install all dependencies.
- `npm run test:ci`: Run all 21 test suites with coverage.
- `npm run build`: Build all 21 sites into a unified `dist/` folder.

## ☁️ Infrastructure & Deployment
Deployment is fully automated via GitHub Actions to Cloudflare Pages.
- **Backend**: Terraform Cloud (`dayashimoga-org/simplewebsites-prod`).
- **Secrets Required**: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`, and `TF_API_TOKEN`.

## Cloudflare Integration

This project is configured to automatically deploy to Cloudflare Pages via GitHub Actions when changes are pushed to the `main` branch.

### 1. Get your Cloudflare Account ID
1. Log in to the [Cloudflare Dashboard](https://dash.cloudflare.com/).
2. Select your account.
3. On the **Overview** page (the sidebar), find the **Account ID** in the right-hand column (usually at the bottom of the "API" section).

### 2. Create a Cloudflare API Token
1. Go to **My Profile** > **API Tokens**.
2. Click **Create Token**.
3. You can use the **Edit Cloudflare Pages** template, or create a custom token with the following permissions:
   - **Account** | **Cloudflare Pages** | **Edit**
4. Set the **Account Resources** to "Include" your specific account.
5. Click **Continue to summary** and then **Create Token**.
6. **Copy and save** the token immediately; you won't be able to see it again.

### 3. Configure GitHub Secrets
To enable automated deployments, add your credentials as [Secrets](https://docs.github.com/en/actions/security-guides/using-secrets-in-github-actions) in your GitHub repository:

1. Go to your repository on GitHub.
2. Click **Settings** > **Secrets and variables** > **Actions**.
3. Create a **New repository secret** for each of the following:
   - `CLOUDFLARE_API_TOKEN`: The API token you created in Step 2.
   - `CLOUDFLARE_ACCOUNT_ID`: Your Account ID from Step 1.

### 4. Deployment Flow
Once these secrets are configured:
1. Pushing to `main` triggers the `CI/CD — Test, Build & Deploy` workflow.
2. The workflow will:
   - Run tests for all projects (ensure they pass/maintain >90% coverage).
   - Build the modified sites.
   - Use **Terraform** to ensure the Cloudflare Pages projects exist.
   - Deploy the builds to Cloudflare Pages.

## Testing
Run the full test suite locally using Docker:
```bash
docker-compose run --rm tester npm run test:ci
```
