/**
 * @jest-environment jsdom
 */
const { STAGE_TEMPLATES, addStage, removeStage, clearPipeline, renderPipeline, exportPipeline, toGitHubActions, toGitLabCI, toJenkinsfile, setStages, getStages } = require('../app');

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

describe('CI/CD Visualizer', () => {
  beforeEach(() => {
    setupDOM();
    clearPipeline();
  });

  test('addStage adds a stage and renders it', () => {
    addStage('build');
    expect(getStages().length).toBe(1);
    expect(document.getElementById('pipeline-flow').innerHTML).toContain('Build');
  });

  test('removeStage removes the correct stage', () => {
    addStage('build');
    const id = getStages()[0].id;
    addStage('test');
    removeStage(id);
    expect(getStages().length).toBe(1);
    expect(getStages()[0].type).toBe('test');
  });

  test('exportPipeline updates the output section', () => {
    addStage('build');
    document.getElementById('format-select').value = 'github';
    exportPipeline();
    const code = document.querySelector('#yaml-output code').textContent;
    expect(code).toContain('name: CI/CD Pipeline');
    expect(code).toContain('npm run build');
    expect(document.getElementById('code-output-section').classList.contains('hidden')).toBe(false);
  });

  test('toGitLabCI handles multiple stages', () => {
    setStages([
      { ...STAGE_TEMPLATES.build, name: 'Build', id: 1 },
      { ...STAGE_TEMPLATES.test, name: 'Test', id: 2 }
    ]);
    const yaml = toGitLabCI();
    expect(yaml).toContain('stages:\n  - build\n  - test');
  });
});
