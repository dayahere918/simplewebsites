const fs = require('fs');
const path = require('path');

const sitesDir = path.join(__dirname, 'sites');
const sites = fs.existsSync(sitesDir)
  ? fs.readdirSync(sitesDir).filter(f =>
      fs.statSync(path.join(sitesDir, f)).isDirectory()
    )
  : [];

const projects = sites.map(site => ({
  displayName: site,
  testMatch: [`<rootDir>/sites/${site}/__tests__/**/*.test.js`],
  testEnvironment: 'jsdom',
  coverageDirectory: `<rootDir>/coverage/${site}`,
  collectCoverageFrom: [`sites/${site}/app.js`],
  coverageThreshold: {
    global: {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90
    }
  }
}));

module.exports = {
  projects: projects.length > 0 ? projects : [{
    testMatch: ['<rootDir>/sites/**/__tests__/**/*.test.js'],
    testEnvironment: 'jsdom'
  }],
  coverageThreshold: {
    global: {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90
    }
  }
};
