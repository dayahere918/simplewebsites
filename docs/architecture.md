# Technical Architecture Document

## 1. Monorepo Structure
The project follows a modular monorepo architecture for independent development and deployment of 21 sites:
```text
/
├── sites/                  # Individual tool websites
│   ├── [site-name]/
│   │   ├── index.html      # Site structure & SEO
│   │   ├── style.css       # Site-specific styles
│   │   ├── app.js          # Core logic (modular export)
│   │   └── __tests__/      # Jest unit tests
├── shared/                 # Shared modules & assets
│   ├── styles.css          # Design system (Dark/Light)
│   ├── theme-toggle.js     # Shared component
│   ├── seo.js              # Meta & Schema generator
│   ├── ads.js              # AdSense integration
│   ├── analytics.js        # GA4 helper
│   └── build.js            # Unified build engine
├── terraform/              # Infra-as-code (Cloudflare)
├── .github/workflows/      # CI/CD pipelines
├── jest.config.js          # Global test configuration
└── docker-compose.yml       # Standardized dev environment
```

## 2. Infrastructure & Infrastructure-as-Code (IaC)
- **Terraform**: Automates the provisioning of the root `stacky` Cloudflare Pages project.
- **Cloudflare Pages**: High-performance static hosting for all tools.
- **CI/CD (GitHub Actions)**:
  - **Test Phase**: Runs Jest unit tests and Playwright E2E tests in a Dockerized environment.
  - **Build Phase**: Executes `shared/build.js` to process shared assets and SEO metadata.
  - **Deploy Phase**: Uses Terraform to ensure the `stacky` project exists and deploys the unified `dist/` folder via Wrangler.

## 3. Shared Modules Overview
- **Shared Styles (`shared/styles.css`)**: 
  - CSS Custom Properties for a dual-theme system.
  - Premium design system (Glassmorphism, Inter/JetBrains Mono fonts, smooth transitions).
- **SEO Engine (`shared/seo.js`)**: 
  - Dynamic meta-tag generation based on JSON configuration.
  - Automatic `sitemap.xml` and `robots.txt` generation during build.
- **AdSense integration (`shared/ads.js`)**: 
  - Dynamic ad slot generation using a centralized publisher ID.
- **Theme Toggle (`shared/theme-toggle.js`)**: 
  - Floating UI component that injects itself into every site's DOM.
  - Syncs with `data-theme` attribute and `localStorage`.

## 4. Key Architectural Patterns
- **Separation of Concerns**: Core logic in `app.js` is decoupled from DOM manipulation where possible to enable easy unit testing.
- **Shared Design Tokens**: All sites consume the same CSS variables, ensuring a unified brand identity across the entire monorepo.
- **Docker Isolation**: All tools and environments use Docker, ensuring "it works on my machine" consistency for all collaborators.
