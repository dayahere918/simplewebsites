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

// Mock clipboard
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

  describe('Core Pipeline Logic', () => {
    test('addStage adds a stage and renders', () => {
      app.addStage('build');
      const stages = app.getStages();
      expect(stages.length).toBe(1);
      expect(stages[0].type).toBe('build');
      
      app.addStage('invalid-stage');
      expect(app.getStages().length).toBe(1); // Should not add invalid
    });

    test('removeStage removes a stage by id', () => {
      app.addStage('test');
      const stageId = app.getStages()[0].id;
      app.removeStage(stageId);
      expect(app.getStages().length).toBe(0);
    });

    test('clearPipeline resets everything', () => {
      app.addStage('lint');
      expect(app.getStages().length).toBe(1);
      app.clearPipeline();
      expect(app.getStages().length).toBe(0);
      expect(document.getElementById('code-output-section').classList.contains('hidden')).toBeTruthy();
    });

    test('renderPipeline handles missing DOM elements gracefully', () => {
      document.body.innerHTML = '';
      expect(() => app.renderPipeline()).not.toThrow();
    });
  });

  describe('Export Formats', () => {
    test('exportPipeline generates GitHub Actions', () => {
      document.getElementById('format-select').value = 'github';
      app.addStage('build');
      const yaml = app.exportPipeline();
      expect(yaml).toContain('runs-on: ubuntu-latest');
      expect(document.getElementById('code-output-section').classList.contains('hidden')).toBeFalsy();
    });

    test('exportPipeline generates GitLab CI', () => {
      document.getElementById('format-select').value = 'gitlab';
      app.addStage('test');
      const yaml = app.exportPipeline();
      expect(yaml).toContain('stage: test');
    });

    test('exportPipeline generates Jenkinsfile', () => {
      document.getElementById('format-select').value = 'jenkins';
      app.addStage('deploy');
      const yaml = app.exportPipeline();
      expect(yaml).toContain('pipeline {');
    });

    test('Empty formats return defaults', () => {
      expect(app.toGitHubActions()).toBe('# No stages added');
      expect(app.toGitLabCI()).toBe('# No stages added');
      expect(app.toJenkinsfile()).toBe('// No stages added');
    });

    test('exportPipeline handles missing DOM appropriately', () => {
      document.body.innerHTML = '';
      const yaml = app.exportPipeline();
      expect(yaml).toContain('# No stages added'); // Defaults to github with empty stages
    });
  });

  describe('Clipboard operations', () => {
    test('copyExport writes to clipboard when code exists', () => {
      app.addStage('build');
      app.exportPipeline(); // Generates code in DOM
      app.copyExport();
      expect(mockClipboard.writeText).toHaveBeenCalled();
    });

    test('copyExport handles empty DOM or code safely', () => {
      document.body.innerHTML = '';
      app.copyExport();
      expect(mockClipboard.writeText).not.toHaveBeenCalled();
    });
  });
});
