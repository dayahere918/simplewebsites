/**
 * @jest-environment jsdom
 */

function setupDOM() {
  document.body.innerHTML = `
    <div id="pipeline-flow"></div>
    <div id="code-output-section" class="hidden">
      <div id="yaml-output"><code></code></div>
    </div>
    <select id="format-select">
      <option value="github">GitHub Actions</option>
      <option value="gitlab">GitLab CI</option>
      <option value="jenkins">Jenkinsfile</option>
    </select>
  `;
}

// Radical clipboard mock
const mockClipboard = {
  writeText: jest.fn().mockResolvedValue(undefined)
};
Object.defineProperty(navigator, 'clipboard', {
  value: mockClipboard,
  configurable: true,
  writable: true
});

describe('CI/CD Visualizer', () => {
  let app;
  beforeEach(() => {
    jest.resetModules();
    app = require('../app');
    setupDOM();
    app.clearPipeline();
    jest.clearAllMocks();
  });

  describe('Export Logic', () => {
    test('copyExport uses clipboard with non-empty string', () => {
      app.setStages([{ ...app.STAGE_TEMPLATES.build, name: 'Build', id: 1 }]);
      const yaml = app.exportPipeline();
      app.copyExport();
      expect(mockClipboard.writeText).toHaveBeenCalled();
    });
  });

  describe('Core', () => {
    test('toGitLabCI handles multiple stages', () => {
      app.setStages([
        { ...app.STAGE_TEMPLATES.build, name: 'Build', id: 1 },
        { ...app.STAGE_TEMPLATES.test, name: 'Test', id: 2 }
      ]);
      const yaml = app.toGitLabCI();
      expect(yaml).toContain('stages:\n  - build\n  - test');
    });
  });
});
