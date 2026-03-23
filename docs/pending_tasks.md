# Detailed Pending Tasks (Testing & Final Cleanup)

## 1. Dockerization & Environment Setup
- [ ] **Create `Dockerfile`**: Define Node.js environment with all dependencies for testing.
- [ ] **Create `docker-compose.yml`**: Orchestrate test runs in a containerized manner.
- [ ] **Automated Test Script**: Create a script that boots the container, runs all tests, and extracts coverage reports before shutting down.

## 2. Unit Test Improvements (Goal: >90% Coverage)
- [ ] **Coverage Audit**: Run a full Joint report to identify missing lines across all 21 sites.
- [ ] **Site-Specific Fixes**:
  - [ ] PickerWheel: Complete branch coverage (currently ~85%).
  - [ ] LoanVisualizer: Add edge case tests for 0% interest or negative inputs.
  - [ ] ResumeATSChecker: Test keyword extraction for non-English characters.
  - [ ] PetBreedIdentifier: Add tests for cat breed identification logic.
- [ ] **Shared Module Tests**:
  - [ ] Add unit tests for `shared/seo.js`.
  - [ ] Add unit tests for `shared/build.js`.
  - [ ] Add unit tests for `shared/theme-toggle.js` (DOM mocking).

## 3. End-to-End Testing (Playwright)
- [ ] **Smoke Tests**: Verify all 21 sites load their shared styles and theme toggle correctly.
- [ ] **Interactive Flows**:
  - [ ] Test PickerWheel spin and winner modal.
  - [ ] Test BillSplitter per-item calculations.
  - [ ] Test VoiceToText recording permission handling (mocked).
- [ ] **Theme Persistence**: Verify theme state persists across page refreshes in a real browser.

## 4. Final Deployment Validation
- [ ] **Terraform Dry-Run**: Run `terraform plan` for all 21 sites to ensure Cloudflare resources are correctly mapped.
- [ ] **GitHub Secrets Check**: Ensure `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` are correctly configured for CI.
- [ ] **Build Artifact Audit**: Verify `dist/` contains all necessary icons, shared assets, and generated SEO files for each site.

## 5. Maintenance & Handover
- [ ] **Project Walkthrough**: Create a video/screenshot artifact showing the 21 unique sites.
- [ ] **Documentation Cleanup**: Final update of `requirements.md` and `architecture.md`.
