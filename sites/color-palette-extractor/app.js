/**
 * Color Palette Extractor — Core Logic
 * Uses k-means clustering to extract dominant colors from images
 */
const NUM_COLORS = 8;
const MAX_ITERATIONS = 20;
let extractedColors = [];

function rgbToHex(r, g, b) {
  return '#' + [r, g, b].map(c => Math.round(c).toString(16).padStart(2, '0')).join('');
}

function colorDistance(c1, c2) {
  return Math.sqrt(Math.pow(c1[0]-c2[0],2) + Math.pow(c1[1]-c2[1],2) + Math.pow(c1[2]-c2[2],2));
}

function kMeansClustering(pixels, k, maxIter) {
  if (!pixels || pixels.length === 0) return [];
  const centers = [];
  const step = Math.max(1, Math.floor(pixels.length / k));
  for (let i = 0; i < k; i++) centers.push([...pixels[Math.min(i * step, pixels.length - 1)]]);

  for (let iter = 0; iter < maxIter; iter++) {
    const clusters = Array.from({ length: k }, () => []);
    for (const pixel of pixels) {
      let minDist = Infinity, minIdx = 0;
      for (let i = 0; i < centers.length; i++) {
        const d = colorDistance(pixel, centers[i]);
        if (d < minDist) { minDist = d; minIdx = i; }
      }
      clusters[minIdx].push(pixel);
    }
    let converged = true;
    for (let i = 0; i < k; i++) {
      if (clusters[i].length === 0) continue;
      const newCenter = [0, 0, 0];
      for (const p of clusters[i]) { newCenter[0] += p[0]; newCenter[1] += p[1]; newCenter[2] += p[2]; }
      newCenter[0] /= clusters[i].length; newCenter[1] /= clusters[i].length; newCenter[2] /= clusters[i].length;
      if (colorDistance(centers[i], newCenter) > 1) converged = false;
      centers[i] = newCenter;
    }
    if (converged) break;
  }
  return centers.map(c => [Math.round(c[0]), Math.round(c[1]), Math.round(c[2])]);
}

function extractColors(canvas) {
  if (!canvas) return [];
  const ctx = canvas.getContext('2d');
  if (!ctx) return [];
  const { width, height } = canvas;
  const imageData = ctx.getImageData(0, 0, width, height);
  const pixels = [];
  const sampleRate = Math.max(1, Math.floor((width * height) / 10000));
  for (let i = 0; i < imageData.data.length; i += 4 * sampleRate) {
    pixels.push([imageData.data[i], imageData.data[i+1], imageData.data[i+2]]);
  }
  return kMeansClustering(pixels, NUM_COLORS, MAX_ITERATIONS);
}

function handleFile(event) {
  const file = event?.target?.files?.[0];
  if (!file || !file.type.startsWith('image/')) return;
  const reader = new FileReader();
  reader.onload = (e) => loadImage(e.target.result);
  reader.readAsDataURL(file);
}

function loadImage(src) {
  if (typeof document === 'undefined') return;
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.onload = () => {
    const canvas = document.getElementById('image-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const maxW = 600, maxH = 400;
    let w = img.width, h = img.height;
    if (w > maxW) { h = h * maxW / w; w = maxW; }
    if (h > maxH) { w = w * maxH / h; h = maxH; }
    canvas.width = w; canvas.height = h;
    ctx.drawImage(img, 0, 0, w, h);
    extractedColors = extractColors(canvas);
    renderPalette(extractedColors);
    document.getElementById('upload-area')?.classList.add('hidden');
    document.getElementById('preview-section')?.classList.remove('hidden');
  };
  img.src = src;
}

function renderPalette(colors) {
  if (typeof document === 'undefined') return;
  const grid = document.getElementById('palette-grid');
  if (!grid) return;
  grid.innerHTML = colors.map(c => {
    const hex = rgbToHex(c[0], c[1], c[2]);
    return `<div class="color-swatch" onclick="copyColor('${hex}')">
      <div class="swatch-color" style="background:${hex}"></div>
      <div class="swatch-info">
        <div class="swatch-hex">${hex}</div>
        <div class="swatch-rgb">rgb(${c[0]}, ${c[1]}, ${c[2]})</div>
      </div>
    </div>`;
  }).join('');
}

function copyColor(hex) {
  if (typeof navigator !== 'undefined' && navigator.clipboard) navigator.clipboard.writeText(hex);
}

function exportPalette() {
  const css = extractedColors.map((c, i) => `  --color-${i+1}: ${rgbToHex(c[0],c[1],c[2])};`).join('\n');
  const output = `:root {\n${css}\n}`;
  if (typeof navigator !== 'undefined' && navigator.clipboard) navigator.clipboard.writeText(output);
}

function resetUpload() {
  if (typeof document === 'undefined') return;
  document.getElementById('upload-area')?.classList.remove('hidden');
  document.getElementById('preview-section')?.classList.add('hidden');
  document.getElementById('file-input').value = '';
  extractedColors = [];
}

// Drag and drop
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    const dz = document.getElementById('drop-zone');
    if (!dz) return;
    dz.addEventListener('dragover', e => { e.preventDefault(); dz.classList.add('dragover'); });
    dz.addEventListener('dragleave', () => dz.classList.remove('dragover'));
    dz.addEventListener('drop', e => { e.preventDefault(); dz.classList.remove('dragover');
      const file = e.dataTransfer.files[0];
      if (file?.type.startsWith('image/')) { const r = new FileReader(); r.onload = ev => loadImage(ev.target.result); r.readAsDataURL(file); }
    });
  });
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { 
    rgbToHex, colorDistance, kMeansClustering, extractColors, renderPalette, copyColor, exportPalette, resetUpload, 
    handleFile, loadImage, NUM_COLORS, MAX_ITERATIONS,
    getExtractedColors: () => extractedColors, 
    setExtractedColors: (c) => { extractedColors = c; } 
  };
}
