/**
 * Face Shape Detector — Core Logic
 * Client-side simulated face shape analysis (no backend required)
 */
const SHAPES = ['Oval', 'Round', 'Square', 'Heart', 'Oblong', 'Diamond', 'Triangle'];

const RECOMMENDATIONS = {
  Oval: { hairstyles: ['Long layers', 'Side bangs', 'Pixie cut', 'Waves'], accessories: ['Round sunglasses', 'Aviators', 'Any earring style'] },
  Round: { hairstyles: ['Long straight', 'Side part', 'Asymmetric bob', 'High bun'], accessories: ['Angular frames', 'Long earrings', 'V-neck tops'] },
  Square: { hairstyles: ['Soft layers', 'Side-swept bangs', 'Textured bob', 'Long waves'], accessories: ['Round glasses', 'Hoop earrings', 'Crew necklines'] },
  Heart: { hairstyles: ['Chin-length bob', 'Side bangs', 'Long layers', 'Textured lob'], accessories: ['Cat-eye frames', 'Teardrop earrings', 'Scoop necklines'] },
  Oblong: { hairstyles: ['Full bangs', 'Chin-length bob', 'Waves at sides', 'Layered medium'], accessories: ['Oversized frames', 'Stud earrings', 'Boat necklines'] },
  Diamond: { hairstyles: ['Chin-length layers', 'Side-swept bangs', 'Textured pixie', 'Half-up'], accessories: ['Oval frames', 'Linear earrings', 'Narrow glasses'] },
  Triangle: { hairstyles: ['Volume at top', 'Side-swept bangs', 'Layered bob', 'Short textured'], accessories: ['Cat-eye glasses', 'Wide earrings', 'Off-shoulder tops'] }
};

function generateAnalysis(imageHash) {
  // Simulate AI analysis using image data hash
  const scores = {};
  let total = 0;
  SHAPES.forEach((shape, i) => {
    const raw = ((imageHash * (i + 3) * 17 + i * 31) % 100 + 10);
    scores[shape] = raw;
    total += raw;
  });
  // Normalize to 100%
  Object.keys(scores).forEach(k => { scores[k] = Math.round((scores[k] / total) * 100); });
  // Correct rounding
  const diff = 100 - Object.values(scores).reduce((a, b) => a + b, 0);
  const topShape = Object.keys(scores).sort((a, b) => scores[b] - scores[a])[0];
  scores[topShape] += diff;
  return scores;
}

function getImageHash(canvas) {
  if (!canvas) return Date.now();
  const ctx = canvas.getContext('2d');
  const data = ctx.getImageData(0, 0, Math.min(canvas.width, 50), Math.min(canvas.height, 50)).data;
  let hash = 0;
  for (let i = 0; i < data.length; i += 40) {
    hash = ((hash << 5) - hash + data[i]) | 0;
  }
  return Math.abs(hash);
}

function getTopShape(scores) {
  return Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0];
}

function handleUpload(event) {
  const file = event?.target?.files?.[0];
  if (!file || !file.type.startsWith('image/')) return;
  const reader = new FileReader();
  reader.onload = e => analyzeImage(e.target.result);
  reader.readAsDataURL(file);
}

function analyzeImage(src) {
  if (typeof document === 'undefined') return;
  const img = new Image();
  img.onload = () => {
    const canvas = document.getElementById('face-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const maxW = 300, maxH = 300;
    let w = img.width, h = img.height;
    if (w > maxW) { h = h * maxW / w; w = maxW; }
    if (h > maxH) { w = w * maxH / h; h = maxH; }
    canvas.width = w; canvas.height = h;
    ctx.drawImage(img, 0, 0, w, h);

    const hash = getImageHash(canvas);
    const scores = generateAnalysis(hash);
    const topShape = getTopShape(scores);

    document.getElementById('upload-area')?.classList.add('hidden');
    document.getElementById('results')?.classList.remove('hidden');
    document.getElementById('shape-badge').textContent = `${topShape} Shape`;
    document.getElementById('confidence').textContent = `${scores[topShape]}% confidence`;

    renderBars(scores, topShape);
    renderRecommendations(topShape);
  };
  img.src = src;
}

function renderBars(scores, topShape) {
  if (typeof document === 'undefined') return;
  const el = document.getElementById('shape-bars');
  if (!el) return;
  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  el.innerHTML = sorted.map(([shape, pct]) =>
    `<div class="bar-item"><div class="bar-label"><span class="bar-name">${shape}</span><span class="bar-pct">${pct}%</span></div><div class="bar-track"><div class="bar-fill ${shape === topShape ? 'top' : ''}" style="width:${pct}%"></div></div></div>`
  ).join('');
}

function renderRecommendations(shape) {
  if (typeof document === 'undefined') return;
  const recs = RECOMMENDATIONS[shape] || RECOMMENDATIONS.Oval;
  const icons = { hairstyles: ['💇', '💇‍♀️', '✂️', '🎀'], accessories: ['👓', '💎', '👔'] };
  const hairEl = document.getElementById('hairstyle-recs');
  const accEl = document.getElementById('accessory-recs');
  if (hairEl) hairEl.innerHTML = recs.hairstyles.map((h, i) => `<div class="rec-card"><div class="icon">${icons.hairstyles[i % icons.hairstyles.length]}</div><div class="name">${h}</div></div>`).join('');
  if (accEl) accEl.innerHTML = recs.accessories.map((a, i) => `<div class="rec-card"><div class="icon">${icons.accessories[i % icons.accessories.length]}</div><div class="name">${a}</div></div>`).join('');
}

function resetAnalysis() {
  if (typeof document === 'undefined') return;
  document.getElementById('upload-area')?.classList.remove('hidden');
  document.getElementById('results')?.classList.add('hidden');
  document.getElementById('file-input').value = '';
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { 
    SHAPES, RECOMMENDATIONS, generateAnalysis, getImageHash, getTopShape, renderBars, renderRecommendations, resetAnalysis,
    handleUpload, analyzeImage
  };
}
