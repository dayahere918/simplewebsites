# Simple Tool Websites Monorepo — Requirements Document

## 1. Project Overview
The goal is to build a single GitHub monorepo containing 21 simple, high-quality tool websites. All sites are hosted under a single brand at [stacky.pages.dev](https://stacky.pages.dev).

## 2. Global Technical Requirements
- **Monorepo Structure**: Organized under `sites/` with a `shared/` directory for common assets.
- **Unified Deployment**: All 21 sites are deployed as subdirectories of a single Cloudflare Pages project (`stacky.pages.dev`).
- **Automated CI/CD**: Unified GitHub Actions pipeline for testing, building, and deploying all sites.
- **Premium Aesthetics**: High-end dark theme by default with glassmorphism, vibrant gradients, and smooth animations.
- **Theme Support**: Seamless toggle between Dark and Light modes using a shared component.
- **No Local Installs**: All testing and builds must run within Docker to keep the host system clean.
- **Performance**: Near-perfect Lighthouse scores and 100% test pass rate.
- **Revenue**: Pre-integrated Google AdSense slots in every site.

## 3. Shared System Requirements
- **SEO Module**: Automated generation of Meta Tags, JSON-LD Schema, Sitemap.xml, and Robots.txt.
- **Ads Module**: Dynamic insertion of AdSense banners, sidebars, and in-article ads.
- **Analytics Module**: Integrated Google Analytics 4 tracking.
- **Design System**: Centralized CSS with consistent variables for colors, typography, and spacing.
- **Theme Engine**: Persistence via `localStorage` and smooth transitions.

## 4. Website-Specific Requirements (Summary of 21 Sites)
- **Batch 1 (Core Tools)**: PickerWheel, FestivalCountdown, BillSplitter, EmojiTranslator, SleepCalculator, StartupIdeaGenerator, LoanVisualizer.
- **Batch 2 (Analysis & Interaction)**: HeightComparison, ColorPaletteExtractor, TypingSpeedRace, NoiseMeter, VoiceToTextCounter, MoodBoardGenerator, AWSCostEstimator.
- **Batch 3 (Developer & Professional)**: TerraformSnippetGenerator, CICDVisualizer, CloudServiceComparison, ResumeATSChecker, FaceShapeDetector, BabyFaceGenerator, PetBreedIdentifier.

## 5. Testing & Quality Assurance
- **Unit Testing**: 100% coverage of core logic using Jest.
- **E2E Testing**: Critical flow verification using Playwright.
- **Coverage Threshold**: Cumulative code coverage must exceed 90%.
- **Zero Failures**: CI must block merges if any test fails or coverage drops below threshold.
