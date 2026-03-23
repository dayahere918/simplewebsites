# Simple Tool Websites Monorepo — Implementation Plan

Build a monorepo at `H:\simplewebsites` containing 21 independent tool websites with shared CI/CD, Terraform-based Cloudflare Pages deployment, SEO, ads, and >90% test coverage.

## User Review Required

> [!IMPORTANT]
> **Scope & Phasing**: This is a very large project (21 websites + infrastructure). I propose building it in phases — infrastructure first, then websites in 3 batches of 7. Each website is a standalone HTML/CSS/JS app (no framework) for simplicity and fast load times. Shall I proceed this way, or do you want a framework like Vite?

> [!IMPORTANT]
> **AI-Based Features**: Websites 3 (FaceShapeDetector), 14 (BabyFaceGenerator), and 10 (PetBreedIdentifier) require AI/ML models. I'll implement these as client-side TensorFlow.js apps using pre-trained models where available, and mock/simulated results where not. Real production AI would need a backend API. Is that acceptable?

> [!WARNING]
> **Google AdSense**: Integration requires your AdSense publisher ID (`ca-pub-XXXXXXX`). I'll add placeholder slots that you can configure with your real ID. You'll also need to verify each domain in the AdSense console.

> [!WARNING]
> **Terraform Cloudflare**: Requires your Cloudflare API token and account ID as GitHub Secrets. I'll create the Terraform configs assuming those secrets exist.

---

## Proposed Changes

### Monorepo Root

Root-level configuration files and shared resources.

#### [NEW] [package.json](file:///H:/simplewebsites/package.json)
- Workspace-aware `package.json` with scripts to run all tests, lint all projects, build all projects.

#### [NEW] [jest.config.js](file:///H:/simplewebsites/jest.config.js)
- Root Jest config with project-level overrides. Coverage threshold set to 90%.

#### [NEW] [playwright.config.js](file:///H:/simplewebsites/playwright.config.js)
- Root Playwright config for E2E tests across all sites.

#### [NEW] [README.md](file:///H:/simplewebsites/README.md)
- Documentation with project structure, development guide, deployment instructions.

---

### Shared Assets (`shared/`)

Reusable modules injected into each website at build time.

#### [NEW] [shared/seo.js](file:///H:/simplewebsites/shared/seo.js)
- Utility to inject `<meta>`, Open Graph, Twitter Card, and JSON-LD schema.org markup into pages.

#### [NEW] [shared/ads.js](file:///H:/simplewebsites/shared/ads.js)
- Google AdSense loader with configurable ad slots and responsive ad units.

#### [NEW] [shared/analytics.js](file:///H:/simplewebsites/shared/analytics.js)
- Google Analytics 4 integration helper.

#### [NEW] [shared/styles.css](file:///H:/simplewebsites/shared/styles.css)
- Shared CSS reset, typography (Google Fonts), color tokens, dark mode support, ad container styles.

#### [NEW] [shared/build.js](file:///H:/simplewebsites/shared/build.js)
- Node.js build script: copies shared assets into each project's `dist/`, generates `sitemap.xml` and `robots.txt`, injects SEO/ad scripts.

---

### CI/CD (`.github/workflows/`)

#### [NEW] [deploy.yml](file:///H:/simplewebsites/.github/workflows/deploy.yml)
- Matrix-based workflow: detects changed projects → runs tests → builds → terraform plan/apply → deploys to Cloudflare Pages.
- Steps: checkout → install deps → jest (with coverage gate) → playwright → build → terraform → wrangler deploy.

---

### Terraform (`terraform/`)

#### [NEW] [terraform/main.tf](file:///H:/simplewebsites/terraform/main.tf)
- Cloudflare Pages project resources for all 21 sites using `for_each`.

#### [NEW] [terraform/variables.tf](file:///H:/simplewebsites/terraform/variables.tf)
- Variables: `cloudflare_api_token`, `cloudflare_account_id`, project name list.

#### [NEW] [terraform/outputs.tf](file:///H:/simplewebsites/terraform/outputs.tf)
- Output deployment URLs for each project.

#### [NEW] [terraform/providers.tf](file:///H:/simplewebsites/terraform/providers.tf)
- Cloudflare provider configuration.

---

### Website Structure (each site follows this pattern)

Each website folder `sites/<name>/` contains:

```
sites/<name>/
├── index.html          # Main page with SEO meta, schema.org, ad slots
├── style.css           # Site-specific styles (imports shared/styles.css)
├── app.js              # Core logic
├── __tests__/
│   ├── app.test.js     # Jest unit tests (>90% coverage)
│   └── e2e.spec.js     # Playwright E2E tests
├── package.json        # Site-level deps and scripts
└── jest.config.js      # Coverage config
```

---

### Batch 1 — Simple Tools (7 sites)

#### [NEW] sites/picker-wheel/
- **Spin wheel** with HTML5 Canvas, input list editor, animated spin with easing, result modal.
- Uses CSS custom properties for theming. Glassmorphism card design.

#### [NEW] sites/festival-countdown/
- **Countdown timers** for festivals (Diwali, Holi, Christmas, Eid, etc.).
- Flip-clock animation, festival selector dropdown, dynamic background themes.

#### [NEW] sites/bill-splitter/
- **Expense splitter** with item-by-item entry, tip calculator, share via URL.
- Clean card UI, animated totals.

#### [NEW] sites/emoji-translator/
- **Text → emoji converter** using keyword-to-emoji mapping dictionary.
- Split-pane layout, copy-to-clipboard, dark mode.

#### [NEW] sites/sleep-calculator/
- **Sleep cycle calculator** based on 90-min cycles.
- Input wake-up time, shows optimal bedtimes. Gradient night-sky theme.

#### [NEW] sites/startup-idea-generator/
- **Random startup idea** from category + problem + solution templates.
- Card reveal animation, share button, save favorites.

#### [NEW] sites/loan-visualizer/
- **Loan EMI calculator** with Chart.js amortization charts.
- Input principal/rate/term, pie chart + line chart. Premium financial UI.

---

### Batch 2 — Medium Complexity (7 sites)

#### [NEW] sites/height-comparison/
- SVG-based side-by-side height figures with labels.

#### [NEW] sites/color-palette-extractor/
- Canvas-based image analysis, k-means clustering for dominant colors.

#### [NEW] sites/typing-speed-race/
- Real-time typing test with WPM/accuracy tracking and leaderboard (localStorage).

#### [NEW] sites/noise-meter/
- Web Audio API microphone access, real-time dB visualization.

#### [NEW] sites/voice-to-text-counter/
- Web Speech API for transcription, word/filler counters.

#### [NEW] sites/mood-board-generator/
- Unsplash API keyword search, grid layout collage builder.

#### [NEW] sites/aws-cost-estimator/
- AWS service pricing data, input-driven cost breakdown with charts.

---

### Batch 3 — DevOps & AI Tools (7 sites)

#### [NEW] sites/terraform-snippet-generator/
- Template-based Terraform code generation with syntax highlighting.

#### [NEW] sites/cicd-visualizer/
- Drag-and-drop pipeline builder, export as YAML.

#### [NEW] sites/cloud-service-comparison/
- Comparison table for AWS/Azure/GCP services with filtering.

#### [NEW] sites/resume-ats-checker/
- PDF.js for parsing, keyword matcher, ATS scoring algorithm.

#### [NEW] sites/face-shape-detector/
- TensorFlow.js face-api for landmark detection, shape classification.

#### [NEW] sites/baby-face-generator/
- Canvas-based face blending (simulated AI).

#### [NEW] sites/pet-breed-identifier/
- TensorFlow.js MobileNet for image classification.

---

## Verification Plan

### Automated Tests

Each website will have:
1. **Jest unit tests** covering core logic functions (>90% line coverage).
2. **Playwright E2E tests** verifying page load, user interactions, and outputs.

Commands:
```bash
# Run all tests with coverage
npm test

# Run tests for a specific site
npm test -- --project=picker-wheel

# Run Playwright E2E tests
npx playwright test

# Check coverage report
npm run test:coverage
```

Coverage is enforced at 90% in `jest.config.js` with `coverageThreshold`.

### Manual Verification
- Open each site's `index.html` in the browser to verify UI renders correctly.
- Test interactive features (spin wheel, countdown, calculators, etc.).
- Verify ad placeholder slots appear in correct positions.
- Verify SEO meta tags in page source.

> [!NOTE]
> I'll start with **Phase 1 (infrastructure) + Phase 2 (Batch 1 — 7 simpler websites)** and verify they work before continuing with Batches 2 and 3. This keeps PRs reviewable and ensures the pattern is right before scaling.
