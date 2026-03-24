/**
 * Cloudflare Project Cleanup Script
 * Automatically deletes stale Pages projects to clear account slots.
 * Run with: $env:CLOUDFLARE_API_TOKEN="..."; $env:CLOUDFLARE_ACCOUNT_ID="..."; node scripts/cleanup-cloudflare.js
 */

const API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;
const ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;

const SITES_TO_CLEAN = [
  "picker-wheel", "festival-countdown", "bill-splitter", "emoji-translator",
  "sleep-calculator", "startup-idea-generator", "loan-visualizer",
  "height-comparison", "color-palette-extractor", "typing-speed-race",
  "noise-meter", "voice-to-text-counter", "mood-board-generator",
  "aws-cost-estimator", "terraform-snippet-generator", "cicd-visualizer",
  "cloud-service-comparison", "resume-ats-checker", "face-shape-detector",
  "baby-face-generator", "pet-breed-identifier"
];

async function deleteProject(name) {
  console.log(`🗑️  Deleting project: ${name}...`);
  try {
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/pages/projects/${name}`,
      {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${API_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const data = await response.json();
    if (data.success) {
      console.log(`✅ Successfully deleted ${name}`);
    } else {
      // If it doesn't exist, that's fine too
      if (data.errors && data.errors.some(e => e.code === 8000007)) {
        console.log(`ℹ️  Project ${name} does not exist. Skipping.`);
      } else {
        console.error(`❌ Failed to delete ${name}:`, JSON.stringify(data.errors));
      }
    }
  } catch (err) {
    console.error(`❌ Error deleting ${name}:`, err.message);
  }
}

async function cleanup() {
  if (!API_TOKEN || !ACCOUNT_ID) {
    console.error("❌ CLOUDFLARE_API_TOKEN and CLOUDFLARE_ACCOUNT_ID must be set in environment.");
    process.exit(1);
  }

  console.log("🚀 Starting Cloudflare project cleanup...");
  for (const site of SITES_TO_CLEAN) {
    await deleteProject(site);
    // Brief delay to avoid rate limiting
    await new Promise(r => setTimeout(r, 200));
  }
  console.log("🏁 Cleanup complete!");
}

cleanup();
