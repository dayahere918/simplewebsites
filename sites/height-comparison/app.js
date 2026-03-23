/**
 * Height Comparison — Core Logic
 */
const PRESETS = {
  basketball: [
    { name: 'LeBron James', height: 206, color: '#6c5ce7' },
    { name: 'Stephen Curry', height: 188, color: '#00cec9' },
    { name: 'Kevin Durant', height: 208, color: '#e17055' },
    { name: 'Average Man', height: 175, color: '#fdcb6e' }
  ],
  actors: [
    { name: 'Dwayne Johnson', height: 196, color: '#6c5ce7' },
    { name: 'Tom Cruise', height: 170, color: '#00cec9' },
    { name: 'Chris Hemsworth', height: 190, color: '#e17055' },
    { name: 'Danny DeVito', height: 147, color: '#fdcb6e' }
  ],
  average: [
    { name: 'Netherlands', height: 183, color: '#e17055' },
    { name: 'USA', height: 177, color: '#0984e3' },
    { name: 'India', height: 166, color: '#00b894' },
    { name: 'Japan', height: 172, color: '#fdcb6e' },
    { name: 'Indonesia', height: 158, color: '#6c5ce7' }
  ]
};

let people = [];
const MAX_DISPLAY_HEIGHT = 320;

function cmToFeetInches(cm) {
  if (typeof cm !== 'number' || cm <= 0) return "0'0\"";
  const totalInches = cm / 2.54;
  const feet = Math.floor(totalInches / 12);
  const inches = Math.round(totalInches % 12);
  return `${feet}'${inches}"`;
}

function getPixelHeight(cm) {
  const maxCm = Math.max(...people.map(p => p.height), 200);
  return (cm / maxCm) * MAX_DISPLAY_HEIGHT;
}

function addPerson() {
  if (typeof document === 'undefined') return;
  const nameInput = document.getElementById('person-name');
  const heightInput = document.getElementById('person-height');
  const colorInput = document.getElementById('person-color');
  const name = (nameInput?.value || '').trim();
  const height = parseFloat(heightInput?.value);
  const color = colorInput?.value || '#6c5ce7';
  if (!name || isNaN(height) || height < 50 || height > 300) return;
  people.push({ name, height, color, id: Date.now() });
  if (nameInput) nameInput.value = '';
  if (heightInput) heightInput.value = '';
  render();
}

function removePerson(id) {
  people = people.filter(p => p.id !== id);
  render();
}

function clearAll() {
  people = [];
  render();
}

function loadPreset(name) {
  const preset = PRESETS[name];
  if (!preset) return;
  people = preset.map((p, i) => ({ ...p, id: Date.now() + i }));
  render();
}

function render() {
  renderFigures();
  renderRuler();
  renderPeopleList();
}

function renderFigures() {
  if (typeof document === 'undefined') return;
  const row = document.getElementById('figures-row');
  const empty = document.getElementById('empty-state');
  if (!row) return;
  if (people.length === 0) {
    row.innerHTML = '<div class="empty-state" id="empty-state">Add people above to compare heights</div>';
    return;
  }
  row.innerHTML = people.map(p => {
    const px = getPixelHeight(p.height);
    return `<div class="figure">
      <div class="figure-head" style="background:${p.color};"></div>
      <div class="figure-body" style="height:${px}px; background:${p.color}; opacity:0.85;">
        <span style="color:#fff;font-size:11px;font-weight:700;">${p.height}cm</span>
      </div>
      <div class="figure-name">${escapeHtml(p.name)}</div>
      <div class="figure-height">${cmToFeetInches(p.height)}</div>
    </div>`;
  }).join('');
}

function renderRuler() {
  if (typeof document === 'undefined') return;
  const ruler = document.getElementById('ruler');
  if (!ruler || people.length === 0) { if (ruler) ruler.innerHTML = ''; return; }
  const maxCm = Math.max(...people.map(p => p.height));
  const marks = [];
  for (let cm = 0; cm <= maxCm + 10; cm += 20) {
    const pct = (cm / maxCm) * MAX_DISPLAY_HEIGHT;
    marks.push(`<div class="ruler-mark" style="bottom:${pct}px;">${cm}cm</div>`);
  }
  ruler.innerHTML = marks.join('');
}

function renderPeopleList() {
  if (typeof document === 'undefined') return;
  const list = document.getElementById('people-list');
  if (!list) return;
  list.innerHTML = people.map(p =>
    `<div class="card person-card">
      <div class="color-dot" style="background:${p.color}"></div>
      <div class="info"><div class="name">${escapeHtml(p.name)}</div><div class="height">${p.height} cm · ${cmToFeetInches(p.height)}</div></div>
      <button class="remove-btn" onclick="removePerson(${p.id})">✕</button>
    </div>`
  ).join('');
}

function escapeHtml(s) { return typeof s === 'string' ? s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;') : ''; }

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { PRESETS, people, cmToFeetInches, getPixelHeight, addPerson, removePerson, clearAll, loadPreset, render, escapeHtml,
    getPeople: () => people, setPeople: (p) => { people = p; } };
}
