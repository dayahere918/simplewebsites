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
  moduleDirectories: ['node_modules', `<rootDir>/sites/${site}`],
  coverageDirectory: `<rootDir>/coverage/${site}`,
  collectCoverageFrom: [`sites/${site}/app.js`]
}));

projects.push({
  displayName: 'shared',
  testMatch: ['<rootDir>/shared/__tests__/**/*.test.js'],
  testEnvironment: 'jsdom',
  collectCoverageFrom: ['shared/*.js', '!shared/build.js']
});

module.exports = {
  projects,
  coverageThreshold: {
    global: {
      branches: 85,
      functions: 90,
      lines: 90,
      statements: 90
    }
  }
};
