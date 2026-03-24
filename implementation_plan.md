# SimpleWebsites — Comprehensive Enhancement & Fix Plan

This plan covers critical bug fixes, Terraform subdomain automation, SEO/monetization improvements, UI/UX enhancements, CI/CD pipeline fixes, test coverage upgrade to >90%, domain strategy, and free Cloudflare service integration.

## User Review Required

> [!IMPORTANT]
> **Google AdSense Publisher ID**: The codebase currently uses placeholder `ca-pub-XXXXXXXXXXXXXXXX`. You need to provide your real AdSense publisher ID and ad slot IDs so ads can actually generate revenue. Without this, ads will not render.

> [!IMPORTANT]
> **Google Analytics**: The [analytics.js](file:///j:/simplewebsites/simplewebsites/shared/analytics.js) module exists but is **not integrated** into any site. Please provide your GA4 measurement ID (format: `G-XXXXXXXXXX`) to enable tracking.

> [!IMPORTANT]
> **Custom Domain for Subdomains**: Terraform subdomain automation requires a Cloudflare zone ID and domain name. Please confirm your domain (e.g., `dayashimoga.com`) and the zone ID from your Cloudflare dashboard.

> [!IMPORTANT]
> **Domain Purchase**: Please review the domain name suggestions below and confirm which one you'd like to proceed with. You'll need to purchase it via Cloudflare Registrar (cheapest renewal, at-cost pricing) and provide the zone ID.

> [!WARNING]
> **Revenue Strategies Beyond AdSense**: See the "Alternative Revenue" section at the bottom for additional earning options (affiliate links, donation buttons, featured listings). These are suggestions for your consideration.

---

## Domain Name Strategy

Generic, future-proof domain names that work for utility tools and any future projects:

| Domain | TLD | Est. Cost/yr | Why |
|--------|-----|-------------|-----|
| `quickstacky.xyz` | .xyz | ~$12 | Cheapest renewal, memorable, extends "Stacky" brand |
| `stackytools.xyz` | .xyz | ~$12 | Clear purpose, cheap, SEO-friendly |
| `utilverse.xyz` | .xyz | ~$12 | "Utility Universe" — generic enough for any tools |
| `toolplex.xyz` | .xyz | ~$12 | Short, brandable, works for any tool collection |
| `webplex.dev` | .dev | ~$15 | Premium feel, HTTPS enforced, tech-credible |
| `dailyutil.xyz` | .xyz | ~$12 | Implies daily-use tools, SEO keyword rich |

> [!TIP]
> **Recommendation**: Buy via **Cloudflare Registrar** — at-cost pricing, cheapest renewals. `.xyz` is best value at ~$12/yr.

---

## Free Cloudflare Services Integration

All free on Cloudflare's free plan, automated via Terraform:

| Service | What It Does | How We'll Use It |
|---------|-------------|------------------|
| **Email Routing** | Forward `contact@` and `support@` → `dayahere@gmail.com` | Terraform-automated |
| **WAF (Free Managed Ruleset)** | Blocks Log4J, Shellshock, common exploits | Auto-enabled via zone settings |
| **DDoS Protection** | Free L3/L4/L7 DDoS mitigation | Enabled by default when proxied |
| **Universal SSL** | Free SSL certificates | Active via Cloudflare Pages |
| **CDN + Caching** | Global edge caching with Brotli compression | Terraform cache/minify rules |
| **Page Rules (3 free)** | Force HTTPS, cache everything | Terraform-configured |
| **Web Analytics** | Privacy-first analytics, no JS needed | Enable via Cloudflare dashboard |
| **Bot Fight Mode** | Block known bad bots | Terraform zone settings |
| **Browser Integrity Check** | Block suspicious request headers | Terraform zone settings |
| **Hotlink Protection** | Prevent image hotlinking | Terraform zone settings |
| **Rocket Loader** | Async JS loading for faster pages | Terraform zone settings |
| **Auto Minify** | Minify HTML, CSS, JS at edge | Terraform zone settings |

---

## Proposed Changes

### Phase 1: Critical Bug Fixes

#### [MODIFY] [app.js](file:///j:/simplewebsites/simplewebsites/sites/picker-wheel/app.js)

**Bug: Popup can't be closed** — The modal only has an inline `onclick="closeModal()"` on the ✕ button and explicit Close/Spin Again buttons. Missing:
1. **Overlay click to dismiss**: Clicking the dark overlay behind the modal should close it
2. **Escape key to dismiss**: Pressing Escape should close the modal

```diff
+// Add overlay click handler
+if (typeof document !== 'undefined') {
+  document.addEventListener('DOMContentLoaded', () => {
+    const modal = document.getElementById('result-modal');
+    if (modal) {
+      modal.addEventListener('click', (e) => {
+        if (e.target === modal) closeModal();
+      });
+    }
+    document.addEventListener('keydown', (e) => {
+      if (e.key === 'Escape') closeModal();
+    });
+  });
+}
```

---

#### [MODIFY] [app.js](file:///j:/simplewebsites/simplewebsites/sites/baby-face-generator/app.js)

**Bug: Baby face not generating** — The [loadParent](file:///j:/simplewebsites/simplewebsites/sites/baby-face-generator/app.js#14-42) function uses `canvas.previousElementSibling` to find the drop-zone. In the actual HTML, the structure is:

```html
<div class="drop-zone" onclick="...">...</div>
<input type="file" ... class="hidden">
<canvas id="parent1-canvas" class="hidden">
```

So `canvas.previousElementSibling` returns the `<input>`, **not** the `<div class="drop-zone">`. The drop-zone never gets hidden, so the upload appears broken.

Fix: Use `querySelector` to find the drop-zone within the parent slot instead of `previousElementSibling`:

```diff
-      const dz = canvas.previousElementSibling;
-      if (dz) dz.classList.add('hidden');
+      const slot = canvas.closest('.upload-slot');
+      const dz = slot ? slot.querySelector('.drop-zone') : null;
+      if (dz) dz.classList.add('hidden');
```

Also fix [resetAll()](file:///j:/simplewebsites/simplewebsites/sites/baby-face-generator/app.js#91-107) with the same pattern:

```diff
-    const dz = canvas?.previousElementSibling;
+    const slot = canvas?.closest('.upload-slot');
+    const dz = slot ? slot.querySelector('.drop-zone') : null;
```

---

#### [MODIFY] [theme-toggle.js](file:///j:/simplewebsites/simplewebsites/shared/theme-toggle.js)

**Bug**: Line 9 has `saved || (prefersDark ? 'dark' : 'dark')` — the ternary always returns `'dark'`, ignoring light preference.

```diff
-  const theme = saved || (prefersDark ? 'dark' : 'dark'); // default dark
+  const theme = saved || (prefersDark ? 'dark' : 'light');
```

---

#### All 21 Sites — Common Issues to Fix

| Site | Issue | Fix |
|------|-------|-----|
| **picker-wheel** | Modal not closable via overlay/Escape | Add event listeners |
| **baby-face-generator** | `previousElementSibling` targets wrong element | Use `closest()` + `querySelector()` |
| **face-shape-detector** | [resetAnalysis](file:///j:/simplewebsites/simplewebsites/sites/face-shape-detector/app.js#108-115) uses direct `.value = ''` without null check | Add null check |
| **noise-meter** | [toggleMeter](file:///j:/simplewebsites/simplewebsites/sites/noise-meter/app.js#33-57) uses bare `alert()` for mic denial | Replace with in-page error message |
| **voice-to-text-counter** | [startRecording](file:///j:/simplewebsites/simplewebsites/sites/voice-to-text-counter/app.js#47-82) uses bare `alert()` | Replace with in-page error message |
| **pet-breed-identifier** | [resetAnalysis](file:///j:/simplewebsites/simplewebsites/sites/face-shape-detector/app.js#108-115) uses direct `.value = ''` without null check | Add null check |
| **All sites** | Missing viewport meta on some, inconsistent `data-theme` | Standardize all HTML |
| **All sites** | `shared-styles.css` link may break if not built | Ensure build copies properly |

---

### Phase 2: Terraform — Subdomains, Email Routing & Cloudflare Services

#### [MODIFY] [variables.tf](file:///j:/simplewebsites/simplewebsites/terraform/variables.tf)

Add new variables for domain, subdomains, email routing, and security:

```hcl
variable "cloudflare_zone_id" {
  description = "Cloudflare zone ID for the custom domain"
  type        = string
  default     = ""
}

variable "custom_domain" {
  description = "Custom domain name (e.g., dayashimoga.com)"
  type        = string
  default     = ""
}

variable "subdomain_config" {
  description = "Map of site names to their subdomain prefixes"
  type        = map(string)
  default     = {}
}

variable "contact_email" {
  description = "Destination email for contact@ forwarding"
  type        = string
  default     = "dayahere@gmail.com"
}
```

#### [MODIFY] [main.tf](file:///j:/simplewebsites/simplewebsites/terraform/main.tf)

Add subdomain, email routing, and security resources:

```hcl
# --- Custom Subdomains ---
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

# --- Email Routing (contact@domain → dayahere@gmail.com) ---
resource "cloudflare_email_routing_settings" "main" {
  count   = var.cloudflare_zone_id != "" ? 1 : 0
  zone_id = var.cloudflare_zone_id
  enabled = true
}

resource "cloudflare_email_routing_address" "contact" {
  count      = var.cloudflare_zone_id != "" ? 1 : 0
  account_id = var.cloudflare_account_id
  email      = var.contact_email
}

resource "cloudflare_email_routing_rule" "contact" {
  count   = var.cloudflare_zone_id != "" ? 1 : 0
  zone_id = var.cloudflare_zone_id
  name    = "contact-forward"
  enabled = true
  matcher { type = "literal" field = "to" value = "contact@${var.custom_domain}" }
  action  { type = "forward" value = [var.contact_email] }
}

resource "cloudflare_email_routing_rule" "support" {
  count   = var.cloudflare_zone_id != "" ? 1 : 0
  zone_id = var.cloudflare_zone_id
  name    = "support-forward"
  enabled = true
  matcher { type = "literal" field = "to" value = "support@${var.custom_domain}" }
  action  { type = "forward" value = [var.contact_email] }
}

# --- Cloudflare Security (Free Tier) ---
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
    minify { css = "on" js = "on" html = "on" }
    rocket_loader            = "on"
  }
}
```

#### [MODIFY] [outputs.tf](file:///j:/simplewebsites/simplewebsites/terraform/outputs.tf)

Add subdomain URLs and email routing outputs.

#### [MODIFY] [providers.tf](file:///j:/simplewebsites/simplewebsites/terraform/providers.tf)

Update Cloudflare provider to `~> 4.0` (already set) — ensure API token has Email Routing and Zone Settings permissions.

---

### Phase 3: SEO & Monetization Enhancements

#### [MODIFY] [ads.js](file:///j:/simplewebsites/simplewebsites/shared/ads.js)

Make publisher ID configurable via environment variable during build:

```diff
 const AD_CONFIG = {
-  publisherId: 'ca-pub-XXXXXXXXXXXXXXXX',
+  publisherId: (typeof process !== 'undefined' && process.env?.ADSENSE_PUB_ID) || 'ca-pub-XXXXXXXXXXXXXXXX',
```

#### [MODIFY] [build.js](file:///j:/simplewebsites/simplewebsites/shared/build.js)

Enhance build to:
1. Inject AdSense publisher ID from env into HTML during build
2. Inject GA4 script into all sites
3. Add [ads.txt](file:///j:/simplewebsites/simplewebsites/shared/ads.txt) to each site's dist
4. Copy [analytics.js](file:///j:/simplewebsites/simplewebsites/shared/analytics.js) and [ads.js](file:///j:/simplewebsites/simplewebsites/shared/ads.js) to each site's dist
5. Generate enhanced sitemap with all site URLs

#### [MODIFY] [seo.js](file:///j:/simplewebsites/simplewebsites/shared/seo.js)

Add:
- FAQ schema generation ([generateFAQSchema](file:///j:/simplewebsites/simplewebsites/shared/seo.js#99-122))
- Breadcrumb schema generation ([generateBreadcrumbSchema](file:///j:/simplewebsites/simplewebsites/shared/seo.js#123-144))
- `hreflang` tag generation

#### All 21 Sites — SEO Improvements

For each site's [index.html](file:///j:/simplewebsites/simplewebsites/sites/noise-meter/index.html) and footer:
- Ensure consistent canonical URLs
- Add missing OG image tags (use a generated default OG image per site)
- Add FAQ section to high-traffic sites (picker-wheel, baby-face-generator, sleep-calculator)
- Add `contact@yourdomain.com` email link in footer for user issues (routed via Cloudflare Email Routing)

---

### Phase 4: UI/UX & Performance Enhancements

#### [MODIFY] [styles.css](file:///j:/simplewebsites/simplewebsites/shared/styles.css)

Add:
- Loading spinner/skeleton component CSS
- Cross-site navigation header CSS
- Improved focus styles for accessibility
- `preconnect` recommendation in comments

#### [MODIFY] [build.js](file:///j:/simplewebsites/simplewebsites/shared/build.js)

Inject a shared navigation bar into each site with:
- Back-to-hub link
- Site title
- Theme toggle

#### All 21 Sites — HTML Improvements

- Add `loading="lazy"` to any `<img>` tags
- Add `<link rel="preconnect" href="https://fonts.googleapis.com">` to all `<head>` sections
- Ensure all interactive elements have unique [id](file:///j:/simplewebsites/simplewebsites/sites/festival-countdown/app.js#183-204) attributes
- Add ARIA labels to buttons without text content

---

### Phase 5: CI/CD & Infrastructure Fixes

#### [MODIFY] [deploy.yml](file:///j:/simplewebsites/simplewebsites/.github/workflows/deploy.yml)

**Bug: Terraform plan exit code masking** — Lines 116-123 use `||` which masks the exit code:

```yaml
terraform plan -detailed-exitcode -out=tfplan || export EXIT=$?
```

The `|| export EXIT=$?` means if `terraform plan` succeeds (exit 0), the `||` branch is NOT taken and `EXIT` is never set. If it exits 2 (changes), the `||` branch IS taken with `EXIT=2`. But the subsequent [if](file:///j:/simplewebsites/simplewebsites/sites/pet-breed-identifier/app.js#47-58) checks `$EXIT` which may be uninitialized.

Fix:

```diff
-          terraform plan -detailed-exitcode -out=tfplan || export EXIT=$?
-          if [ "$EXIT" == "0" ]; then 
-            echo "changes=false" >> $GITHUB_OUTPUT
-          elif [ "$EXIT" == "2" ]; then 
-            echo "changes=true" >> $GITHUB_OUTPUT
-          else 
-            exit $EXIT
-          fi
+          set +e
+          terraform plan -detailed-exitcode -out=tfplan
+          EXIT=$?
+          set -e
+          if [ "$EXIT" -eq 0 ]; then 
+            echo "changes=false" >> $GITHUB_OUTPUT
+          elif [ "$EXIT" -eq 2 ]; then 
+            echo "changes=true" >> $GITHUB_OUTPUT
+          else 
+            exit $EXIT
+          fi
```

Also update the `deploy` job artifacts path from `sites/` to `dist/` since build output goes to `dist/`:

```diff
 - name: Upload build artifacts
   uses: actions/upload-artifact@v4
   with:
     name: dist
-    path: sites/
+    path: dist/
```

And fix the deploy job to download artifacts correctly.

#### [MODIFY] [Dockerfile](file:///j:/simplewebsites/simplewebsites/Dockerfile)

Add [.dockerignore](file:///j:/simplewebsites/simplewebsites/.dockerignore) awareness and optimize layer caching:

```diff
 COPY package.json jest.config.js playwright.config.js ./
+COPY package-lock.json ./
-RUN npm install
+RUN npm ci
```

#### [NEW] [.dockerignore](file:///j:/simplewebsites/simplewebsites/.dockerignore)

```
.git
node_modules
dist
coverage
*.md
```

---

### Phase 6: Testing Enhancement (>90% Coverage, 100% Pass)

#### [MODIFY] [jest.config.js](file:///j:/simplewebsites/simplewebsites/jest.config.js)

Increase coverage thresholds:

```diff
   coverageThreshold: {
     global: {
-      branches: 40,
-      functions: 65,
-      lines: 65,
-      statements: 65
+      branches: 85,
+      functions: 90,
+      lines: 90,
+      statements: 90
     }
   }
```

Also add shared modules to `collectCoverageFrom`:

```js
projects.push({
  displayName: 'shared',
  testMatch: ['<rootDir>/shared/__tests__/**/*.test.js'],
  testEnvironment: 'jsdom',
  collectCoverageFrom: ['shared/*.js'],
  coverageThreshold: { global: { branches: 85, functions: 90, lines: 90, statements: 90 } }
});
```

#### [NEW] `shared/__tests__/` directory

Add test files for:
- `seo.test.js` — Test all SEO functions (meta tags, JSON-LD, sitemap, robots.txt)
- `ads.test.js` — Test ad slot creation, publisher ID management
- `analytics.test.js` — Test GA4 script generation, event tracking
- `theme-toggle.test.js` — Test theme persistence, toggle, button creation
- `build.test.js` — Test build functions (copyFileSync, buildSite, buildAll)

#### All 21 sites' `__tests__/app.test.js`

Enhance each test file to cover:
- All exported functions
- Edge cases (empty inputs, null values, missing DOM elements)
- New functionality added by bug fixes (overlay click, Escape key)
- Error handling paths
- DOM manipulation verification

---

## Alternative Revenue Strategies

Beyond Google AdSense, consider:

1. **Affiliate Links**: Add relevant tool/product affiliate links (e.g., AWS links in aws-cost-estimator)
2. **Buy Me a Coffee / Ko-fi**: Add donation button to footer across all sites
3. **Premium Features**: Lock advanced features (export, save history) behind optional payment
4. **Sponsored Content**: Add "Powered by" or "Sponsored" sections
5. **Email List**: Add newsletter signup to collect email addresses for future monetization

---

## Verification Plan

### Automated Tests

1. **Run full Jest suite via Docker** (no global installs):
   ```bash
   docker-compose run --rm tester npm run test:ci
   ```
   Expected: All 21+ test suites pass, coverage >90% on branches/functions/lines/statements.

2. **Run build and verify output**:
   ```bash
   docker-compose run --rm tester npm run build
   ```
   Expected: `dist/` folder with all 21 sites, each containing `robots.txt`, `sitemap.xml`, `shared-styles.css`.

3. **Terraform validation** (requires TF credentials — CI only):
   ```bash
   cd terraform && terraform validate
   ```
   Expected: Valid configuration.

### Browser Testing

4. **Picker Wheel Modal Fix** — Open `sites/picker-wheel/index.html` in browser:
   - Spin the wheel, wait for result modal
   - Click the dark overlay area → modal should close
   - Spin again, press Escape → modal should close
   - Click ✕ button → modal should close

5. **Baby Face Generator Fix** — Open `sites/baby-face-generator/index.html`:
   - Upload Parent 1 photo → drop-zone should hide, canvas should show preview
   - Upload Parent 2 photo → same behavior
   - Click "Generate Baby Face" → result section should appear with blended image

6. **All Sites Smoke Test** — Open each site's `index.html` locally and verify:
   - Page loads without console errors
   - Core functionality works (inputs, buttons, results)
   - Theme toggle works
   - Responsive layout at 768px and 480px breakpoints

---

## Phase 7: Git & SSH Configuration

### SSH & Multi-Account Setup

#### [NEW] SSH Keys and Config
- Generate two SSH keys for the two GitHub accounts:
  - `id_rsa_dayashimoga` (Account 1)
  - `id_rsa_dayahere918` (Account 2)
- Configure `~/.ssh/config` to use aliases:
  ```text
  Host github.com-acc1
      HostName github.com
      User git
      IdentityFile ~/.ssh/id_rsa_dayashimoga

  Host github.com-acc2
      HostName github.com
      User git
      IdentityFile ~/.ssh/id_rsa_dayahere918
  ```

#### [MODIFY] [.gitignore](file:///j:/simplewebsites/simplewebsites/.gitignore)
- Standardize with common ignored patterns (Node, OS, IDE).

### Automation Execution
1. Run `./scripts/setup-multi-push.ps1` to configure the `all` remote for simultaneous pushing.
2. Verify connectivity via `ssh -T github.com-acc1` and `ssh -T github.com-acc2`.
