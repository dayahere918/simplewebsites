/**
 * CI/CD Visualizer — Core Logic
 */
const STAGE_TEMPLATES = {
  build: { icon: '🔨', name: 'Build', detail: 'npm install && npm run build', commands: ['npm ci', 'npm run build'] },
  test: { icon: '🧪', name: 'Test', detail: 'npm test --coverage', commands: ['npm test -- --coverage'] },
  lint: { icon: '📝', name: 'Lint', detail: 'npm run lint', commands: ['npm run lint'] },
  deploy: { icon: '🚀', name: 'Deploy', detail: 'Deploy to production', commands: ['npx wrangler deploy'] },
  notify: { icon: '📢', name: 'Notify', detail: 'Send notification', commands: ['curl -X POST $SLACK_WEBHOOK'] },
  custom: { icon: '⚙️', name: 'Custom Step', detail: 'echo "custom"', commands: ['echo "hello"'] }
};

let stages = [];

function addStage(type) {
  const tmpl = STAGE_TEMPLATES[type];
  if (!tmpl) return;
  stages.push({ ...tmpl, type, id: Date.now() + Math.random() });
  renderPipeline();
}

function removeStage(id) {
  stages = stages.filter(s => s.id !== id);
  renderPipeline();
}

function clearPipeline() {
  stages = [];
  renderPipeline();
  if (typeof document !== 'undefined') {
    document.getElementById('code-output-section')?.classList.add('hidden');
  }
}

function renderPipeline() {
  if (typeof document === 'undefined') return;
  const flow = document.getElementById('pipeline-flow');
  if (!flow) return;
  if (stages.length === 0) {
    flow.innerHTML = '<div class="empty-state" id="empty-state">Add stages above to build your pipeline →</div>';
    return;
  }
  flow.innerHTML = stages.map((s, i) => {
    const arrow = i < stages.length - 1 ? '<div class="stage-arrow">→</div>' : '';
    return `<div class="stage-node">
      <div class="stage-card ${s.type}">
        <button class="stage-remove" onclick="removeStage(${s.id})">✕</button>
        <div class="stage-icon">${s.icon}</div>
        <div class="stage-name">${s.name}</div>
        <div class="stage-detail">${s.detail}</div>
      </div>
    </div>${arrow}`;
  }).join('');
}

function exportPipeline() {
  if (typeof document === 'undefined') return '';
  const select = document.getElementById('format-select');
  const format = select ? select.value : 'github';
  let yaml = '';
  if (format === 'github') yaml = toGitHubActions();
  else if (format === 'gitlab') yaml = toGitLabCI();
  else yaml = toJenkinsfile();
  const section = document.getElementById('code-output-section');
  const output = document.getElementById('yaml-output');
  if (section) section.classList.remove('hidden');
  if (output) {
    const codeEl = output.querySelector('code');
    if (codeEl) codeEl.textContent = yaml;
  }
  return yaml;
}

function toGitHubActions() {
  if (stages.length === 0) return '# No stages added';
  let y = `name: CI/CD Pipeline\non:\n  push:\n    branches: [main]\n  pull_request:\n    branches: [main]\n\njobs:\n`;
  stages.forEach((s, i) => {
    const needs = i > 0 ? `\n    needs: ${stages[i-1].name.toLowerCase().replace(/\s+/g,'-')}` : '';
    y += `  ${s.name.toLowerCase().replace(/\s+/g,'-')}:\n    runs-on: ubuntu-latest${needs}\n    steps:\n      - uses: actions/checkout@v4\n      - uses: actions/setup-node@v4\n        with:\n          node-version: '20'\n`;
    s.commands.forEach(cmd => { y += `      - run: ${cmd}\n`; });
    y += '\n';
  });
  return y;
}

function toGitLabCI() {
  if (stages.length === 0) return '# No stages added';
  let y = `stages:\n`;
  stages.forEach(s => { y += `  - ${s.name.toLowerCase().replace(/\s+/g,'_')}\n`; });
  y += '\n';
  stages.forEach(s => {
    y += `${s.name.toLowerCase().replace(/\s+/g,'_')}:\n  stage: ${s.name.toLowerCase().replace(/\s+/g,'_')}\n  script:\n`;
    s.commands.forEach(cmd => { y += `    - ${cmd}\n`; });
    y += '\n';
  });
  return y;
}

function toJenkinsfile() {
  if (stages.length === 0) return '// No stages added';
  let j = `pipeline {\n  agent any\n  stages {\n`;
  stages.forEach(s => {
    j += `    stage('${s.name}') {\n      steps {\n`;
    s.commands.forEach(cmd => { j += `        sh '${cmd}'\n`; });
    j += `      }\n    }\n`;
  });
  j += `  }\n}\n`;
  return j;
}

function copyExport() {
  const code = document.getElementById('yaml-output')?.querySelector('code')?.textContent;
  if (code && typeof navigator !== 'undefined' && navigator.clipboard) navigator.clipboard.writeText(code);
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { STAGE_TEMPLATES, addStage, removeStage, clearPipeline, renderPipeline, exportPipeline, toGitHubActions, toGitLabCI, toJenkinsfile, copyExport,
    getStages: () => stages, setStages: s => { stages = s; } };
}
