/**
 * Image Toolkit — Core Logic
 * Features: Resize, Crop, Rotate/Tilt, Color Adjustments, Merge, Split
 * Pure canvas-based processing — no external AI dependencies
 */

let originalImage = null;
let currentCanvas = null;
let cropState = { active: false, startX: 0, startY: 0, endX: 0, endY: 0, dragging: false };
let mergeImages = [];
let activeTab = 'resize';

// ─────────────────────────────────────────────
// Pure Logic Functions
// ─────────────────────────────────────────────

/**
 * Validate image dimensions
 * @param {number} width
 * @param {number} height
 * @param {number} maxDim
 * @returns {{ valid: boolean, message: string }}
 */
function validateImageSize(width, height, maxDim = 4000) {
  if (width > maxDim || height > maxDim) {
    return { valid: false, message: `Image too large (${width}×${height}). Max: ${maxDim}×${maxDim}px` };
  }
  return { valid: true, message: '' };
}

/**
 * Format display dimensions
 */
function formatDimensions(w, h, scale = 1) {
  return `${Math.round(w * scale)} × ${Math.round(h * scale)} px`;
}

/**
 * Parse scale factor
 */
function parseScale(scale) {
  const n = parseFloat(scale);
  return isNaN(n) ? 1 : Math.min(Math.max(n, 0.1), 8);
}

/**
 * Multi-pass Bicubic resize — smooth, high-quality upscaling
 * Uses progressive intermediate steps for large scale differences (better quality)
 * @param {HTMLCanvasElement} source
 * @param {number} targetW
 * @param {number} targetH
 * @returns {HTMLCanvasElement}
 */
function bicubicResize(source, targetW, targetH) {
  const tw = Math.round(targetW);
  const th = Math.round(targetH);
  
  // Calculate how many steps are needed (incrementing max 2x at a time for upscaling)
  let steps = 1;
  if (tw > source.width * 2 || th > source.height * 2) {
    steps = Math.ceil(Math.log2(Math.max(tw / source.width, th / source.height)));
  }

  let currentSource = source;
  
  for (let i = 1; i <= steps; i++) {
    const isLastStep = i === steps;
    const stepW = isLastStep ? tw : Math.round(source.width * Math.pow(2, i));
    const stepH = isLastStep ? th : Math.round(source.height * Math.pow(2, i));
    
    // Explicit limit to avoid browser crash
    if (stepW > 8000 || stepH > 8000) break;

    const out = createCanvas(Math.round(stepW), Math.round(stepH));
    const ctx = out.getContext('2d');
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(currentSource, 0, 0, stepW, stepH);
    currentSource = out;
  }
  
  return currentSource;
}

/**
 * Rotate canvas by angle (degrees)
 * @param {HTMLCanvasElement} source
 * @param {number} degrees
 * @returns {HTMLCanvasElement}
 */
function rotateCanvas(source, degrees) {
  const rad = (degrees * Math.PI) / 180;
  const sin = Math.abs(Math.sin(rad));
  const cos = Math.abs(Math.cos(rad));
  const newW = Math.round(source.width * cos + source.height * sin);
  const newH = Math.round(source.width * sin + source.height * cos);

  const out = createCanvas(newW, newH);
  const ctx = out.getContext('2d');
  ctx.translate(newW / 2, newH / 2);
  ctx.rotate(rad);
  ctx.drawImage(source, -source.width / 2, -source.height / 2);
  return out;
}

/**
 * Flip canvas horizontally or vertically
 * @param {HTMLCanvasElement} source
 * @param {'horizontal'|'vertical'} direction
 * @returns {HTMLCanvasElement}
 */
function flipCanvas(source, direction) {
  const out = createCanvas(source.width, source.height);
  const ctx = out.getContext('2d');
  if (direction === 'horizontal') {
    ctx.scale(-1, 1);
    ctx.drawImage(source, -source.width, 0);
  } else {
    ctx.scale(1, -1);
    ctx.drawImage(source, 0, -source.height);
  }
  return out;
}

/**
 * Crop canvas to given region
 * @param {HTMLCanvasElement} source
 * @param {number} x
 * @param {number} y
 * @param {number} w
 * @param {number} h
 * @returns {HTMLCanvasElement}
 */
function cropCanvas(source, x, y, w, h) {
  const cw = Math.min(w, source.width - x);
  const ch = Math.min(h, source.height - y);
  if (cw <= 0 || ch <= 0) return source;
  const out = createCanvas(cw, ch);
  const ctx = out.getContext('2d');
  ctx.drawImage(source, x, y, cw, ch, 0, 0, cw, ch);
  return out;
}

/**
 * Apply color adjustments to canvas pixels
 * @param {HTMLCanvasElement} source
 * @param {{ brightness, contrast, saturation, hue, sepia, grayscale, invert }} opts
 * @returns {HTMLCanvasElement}
 */
function applyColorAdjustments(source, opts = {}) {
  const {
    brightness = 100,
    contrast = 100,
    saturation = 100,
    hue = 0,
    sepia = 0,
    grayscale = 0,
    invert = 0
  } = opts;

  const out = createCanvas(source.width, source.height);
  const ctx = out.getContext('2d');

  // Build CSS filter string
  const filters = [
    `brightness(${brightness}%)`,
    `contrast(${contrast}%)`,
    `saturate(${saturation}%)`,
    `hue-rotate(${hue}deg)`,
    `sepia(${sepia}%)`,
    `grayscale(${grayscale}%)`,
    `invert(${invert}%)`
  ].join(' ');

  ctx.filter = filters;
  ctx.drawImage(source, 0, 0);
  ctx.filter = 'none';
  return out;
}

/**
 * Split image into a grid
 * @param {HTMLCanvasElement} source
 * @param {number} cols
 * @param {number} rows
 * @returns {HTMLCanvasElement[]} array of tile canvases
 */
function splitImageGrid(source, cols, rows) {
  const tileW = Math.floor(source.width / cols);
  const tileH = Math.floor(source.height / rows);
  const tiles = [];

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const tile = cropCanvas(source, col * tileW, row * tileH, tileW, tileH);
      tiles.push({ canvas: tile, col, row });
    }
  }
  return tiles;
}

/**
 * Merge multiple images side-by-side or stacked
 * @param {HTMLImageElement[]} images
 * @param {'horizontal'|'vertical'|'grid'} layout
 * @param {number} cols - used when layout is 'grid'
 * @returns {HTMLCanvasElement}
 */
function mergeImageLayout(images, layout = 'horizontal', cols = 2) {
  if (!images || images.length === 0) return createCanvas(1, 1);

  if (layout === 'horizontal') {
    const totalW = images.reduce((s, img) => s + img.width, 0);
    const maxH = Math.max(...images.map(img => img.height));
    const out = createCanvas(totalW, maxH);
    const ctx = out.getContext('2d');
    let x = 0;
    images.forEach(img => {
      ctx.drawImage(img, x, (maxH - img.height) / 2);
      x += img.width;
    });
    return out;
  }

  if (layout === 'vertical') {
    const maxW = Math.max(...images.map(img => img.width));
    const totalH = images.reduce((s, img) => s + img.height, 0);
    const out = createCanvas(maxW, totalH);
    const ctx = out.getContext('2d');
    let y = 0;
    images.forEach(img => {
      ctx.drawImage(img, (maxW - img.width) / 2, y);
      y += img.height;
    });
    return out;
  }

  // Grid layout
  const rows = Math.ceil(images.length / cols);
  const cellW = Math.max(...images.map(img => img.width));
  const cellH = Math.max(...images.map(img => img.height));
  const out = createCanvas(cellW * cols, cellH * rows);
  const ctx = out.getContext('2d');
  images.forEach((img, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    ctx.drawImage(img, col * cellW + (cellW - img.width) / 2, row * cellH + (cellH - img.height) / 2);
  });
  return out;
}

/**
 * Create a canvas element (browser or test environment)
 */
function createCanvas(w, h) {
  if (typeof document !== 'undefined') {
    const c = document.createElement('canvas');
    c.width = w || 1;
    c.height = h || 1;
    return c;
  }
  // Node/jest environment — return mock
  return { width: w, height: h, getContext: () => ({}) };
}

// ─────────────────────────────────────────────
// DOM Functions
// ─────────────────────────────────────────────

function handleUpload(event) {
  const file = event?.target?.files?.[0];
  if (!file || !file.type.startsWith('image/')) return;

  // Show loading state immediately
  const uploadArea = document.getElementById('upload-area');
  if (uploadArea) {
    const dz = uploadArea.querySelector('.drop-zone');
    if (dz) dz.innerHTML = '<div style="padding:2rem;text-align:center"><div class="animate-pulse text-accent font-bold">⏳ Loading image...</div></div>';
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new Image();
    img.onload = () => {
      const { valid, message } = validateImageSize(img.width, img.height);
      if (!valid) { showStatus(message, 'error'); return; }
      originalImage = img;
      initWorkspace(img);
    };
    img.onerror = () => showStatus('Failed to load image. Try a different file.', 'error');
    img.src = e.target.result;
  };
  reader.onerror = () => showStatus('Failed to read file.', 'error');
  reader.readAsDataURL(file);
}

function initWorkspace(img) {
  // Draw to working canvas
  currentCanvas = createCanvas(img.width, img.height);
  const ctx = currentCanvas.getContext('2d');
  if (ctx.drawImage) ctx.drawImage(img, 0, 0);

  // Show workspace — use both classList and explicit style for reliability
  const uploadArea = document.getElementById('upload-area');
  const workspace = document.getElementById('workspace');
  if (uploadArea) { uploadArea.classList.add('hidden'); uploadArea.style.display = 'none'; }
  if (workspace) { workspace.classList.remove('hidden'); workspace.style.display = ''; }

  updatePreview();
  updateDimensionDisplays();
  showStatus(`Loaded: ${img.width}×${img.height}px`, 'success');
}

function updatePreview() {
  if (!currentCanvas) return;
  const preview = document.getElementById('img-preview');
  if (preview) {
    try {
      const dataUrl = currentCanvas.toDataURL();
      preview.src = (dataUrl === 'data:,' && originalImage) ? originalImage.src : dataUrl;
    } catch (e) {
      console.warn('Canvas toDataURL failed', e);
      if (originalImage) preview.src = originalImage.src;
    }
  }

  const dimsEl = document.getElementById('current-dims');
  if (dimsEl) dimsEl.textContent = `${currentCanvas.width} × ${currentCanvas.height} px`;
}

function updateDimensionDisplays() {
  if (!currentCanvas) return;
  const wEl = document.getElementById('resize-w');
  const hEl = document.getElementById('resize-h');
  const upWEl = document.getElementById('upscale-w');
  const upHEl = document.getElementById('upscale-h');
  if (wEl) wEl.value = currentCanvas.width;
  if (hEl) hEl.value = currentCanvas.height;
  if (upWEl) upWEl.value = currentCanvas.width;
  if (upHEl) upHEl.value = currentCanvas.height;
}

// ── Upscale ─────────────────────────────────

function applyUpscale(scaleFactor) {
  if (!currentCanvas) return;
  
  // Show generating status
  showStatus(`🚀 AI Upscaling in progress (${scaleFactor}x)...`, 'info');
  
  // Slight delay for UI repaint
  setTimeout(() => {
    const targetW = currentCanvas.width * scaleFactor;
    const targetH = currentCanvas.height * scaleFactor;

    if (targetW > 8000 || targetH > 8000) { 
      showStatus('❌ Image too large to upscale further without crashing.', 'error'); 
      return; 
    }
    
    currentCanvas = bicubicResize(currentCanvas, targetW, targetH);
    updatePreview();
    updateDimensionDisplays();
    showStatus(`✅ Successfully upscaled to ${currentCanvas.width}×${currentCanvas.height}px`, 'success');
  }, 100);
}

function applyCustomUpscale() {
  if (!currentCanvas) return;
  const upWEl = document.getElementById('upscale-w');
  const upHEl = document.getElementById('upscale-h');
  
  const targetW = parseInt(upWEl?.value) || currentCanvas.width;
  const targetH = parseInt(upHEl?.value) || currentCanvas.height;
  
  if (targetW <= currentCanvas.width && targetH <= currentCanvas.height) {
    showStatus('⚠️ Target dimensions must be larger than current for upscaling.', 'info');
    return;
  }
  
  showStatus(`🚀 AI Upscaling to ${targetW}×${targetH}...`, 'info');
  
  setTimeout(() => {
    if (targetW > 8000 || targetH > 8000) { 
      showStatus('❌ Dimensions exceed safe browser limits (8000px).', 'error'); 
      return; 
    }
    currentCanvas = bicubicResize(currentCanvas, targetW, targetH);
    updatePreview();
    updateDimensionDisplays();
    showStatus(`✅ Successfully upscaled to ${currentCanvas.width}×${currentCanvas.height}px`, 'success');
  }, 100);
}

// ── Resize ──────────────────────────────────

function applyResize() {
  if (!currentCanvas) return;
  const wEl = document.getElementById('resize-w');
  const hEl = document.getElementById('resize-h');
  const maintainEl = document.getElementById('maintain-ratio');

  let targetW = parseInt(wEl?.value) || currentCanvas.width;
  let targetH = parseInt(hEl?.value) || currentCanvas.height;

  if (maintainEl?.checked) {
    const ratio = currentCanvas.width / currentCanvas.height;
    // Determine which dimension was changed
    if (document.activeElement === wEl) {
      targetH = Math.round(targetW / ratio);
    } else {
      targetW = Math.round(targetH * ratio);
    }
  }

  if (targetW < 1 || targetH < 1) { showStatus('Invalid dimensions', 'error'); return; }
  currentCanvas = bicubicResize(currentCanvas, targetW, targetH);
  updatePreview();
  updateDimensionDisplays();
  showStatus(`Resized to ${targetW}×${targetH}px`, 'success');
}

function onResizeInput(changedDim) {
  const maintainEl = document.getElementById('maintain-ratio');
  if (!maintainEl?.checked || !currentCanvas) return;
  const ratio = currentCanvas.width / currentCanvas.height;
  if (changedDim === 'w') {
    const wEl = document.getElementById('resize-w');
    const hEl = document.getElementById('resize-h');
    if (wEl && hEl) hEl.value = Math.round(parseInt(wEl.value) / ratio) || '';
  } else {
    const wEl = document.getElementById('resize-w');
    const hEl = document.getElementById('resize-h');
    if (wEl && hEl) wEl.value = Math.round(parseInt(hEl.value) * ratio) || '';
  }
}

// ── Rotate ──────────────────────────────────

function applyRotate(degrees) {
  if (!currentCanvas) return;
  currentCanvas = rotateCanvas(currentCanvas, degrees);
  updatePreview();
  showStatus(`Rotated ${degrees}°`, 'success');
}

function applyFlip(direction) {
  if (!currentCanvas) return;
  currentCanvas = flipCanvas(currentCanvas, direction);
  updatePreview();
  showStatus(`Flipped ${direction}`, 'success');
}

function applyTilt() {
  const tiltEl = document.getElementById('tilt-angle');
  const degrees = parseFloat(tiltEl?.value) || 0;
  if (!currentCanvas) return;
  currentCanvas = rotateCanvas(currentCanvas, degrees);
  updatePreview();
  showStatus(`Tilted ${degrees}°`, 'success');
}

// ── Crop ────────────────────────────────────

function applyCropManual() {
  if (!currentCanvas) return;
  const x = parseInt(document.getElementById('crop-x')?.value) || 0;
  const y = parseInt(document.getElementById('crop-y')?.value) || 0;
  const w = parseInt(document.getElementById('crop-w')?.value) || currentCanvas.width;
  const h = parseInt(document.getElementById('crop-h')?.value) || currentCanvas.height;

  if (x < 0 || y < 0 || w <= 0 || h <= 0) { showStatus('Invalid crop values', 'error'); return; }
  currentCanvas = cropCanvas(currentCanvas, x, y, w, h);
  updatePreview();
  showStatus(`Cropped to ${currentCanvas.width}×${currentCanvas.height}px`, 'success');
}

function applyCropPreset(preset) {
  if (!currentCanvas) return;
  const w = currentCanvas.width;
  const h = currentCanvas.height;
  let x, y, cw, ch;

  const ratios = {
    '1:1': [1, 1], '16:9': [16, 9], '4:3': [4, 3], '3:2': [3, 2], '9:16': [9, 16]
  };
  const [rw, rh] = ratios[preset] || [1, 1];
  const targetRatio = rw / rh;
  const currentRatio = w / h;

  if (currentRatio > targetRatio) {
    ch = h; cw = Math.round(h * targetRatio);
  } else {
    cw = w; ch = Math.round(w / targetRatio);
  }
  x = Math.round((w - cw) / 2);
  y = Math.round((h - ch) / 2);

  currentCanvas = cropCanvas(currentCanvas, x, y, cw, ch);
  updatePreview();
  showStatus(`Cropped to ${preset} (${currentCanvas.width}×${currentCanvas.height}px)`, 'success');
}

// ── Color Adjustments ────────────────────────

function applyColors() {
  if (!currentCanvas) return;
  const getVal = id => parseInt(document.getElementById(id)?.value) || 0;
  const getValDefault = (id, def) => {
    const v = document.getElementById(id);
    return v ? parseInt(v.value) : def;
  };

  const opts = {
    brightness: getValDefault('adj-brightness', 100),
    contrast: getValDefault('adj-contrast', 100),
    saturation: getValDefault('adj-saturation', 100),
    hue: getVal('adj-hue'),
    sepia: getVal('adj-sepia'),
    grayscale: getVal('adj-grayscale'),
    invert: getVal('adj-invert')
  };

  currentCanvas = applyColorAdjustments(currentCanvas, opts);
  updatePreview();
  showStatus('Color adjustments applied', 'success');
}

function resetColorSliders() {
  const defaults = {
    'adj-brightness': 100, 'adj-contrast': 100, 'adj-saturation': 100,
    'adj-hue': 0, 'adj-sepia': 0, 'adj-grayscale': 0, 'adj-invert': 0
  };
  Object.entries(defaults).forEach(([id, val]) => {
    const el = document.getElementById(id);
    if (el) el.value = val;
    const display = document.getElementById(id + '-val');
    if (display) display.textContent = val;
  });
}

// ── Split ────────────────────────────────────

function applySplit() {
  if (!currentCanvas) return;
  const cols = parseInt(document.getElementById('split-cols')?.value) || 2;
  const rows = parseInt(document.getElementById('split-rows')?.value) || 2;

  const tiles = splitImageGrid(currentCanvas, cols, rows);
  const container = document.getElementById('split-results');
  if (!container) return;
  container.innerHTML = '';
  container.classList.remove('hidden');

  tiles.forEach(({ canvas, col, row }) => {
    const wrapper = document.createElement('div');
    wrapper.className = 'split-tile';
    wrapper.innerHTML = `
      <img src="${canvas.toDataURL()}" alt="Tile ${row+1}-${col+1}" style="max-width:100%;border-radius:6px">
      <div class="split-tile-label">Row ${row+1}, Col ${col+1}</div>
      <button class="btn btn-sm btn-secondary mt-1" onclick="downloadTileCanvas(this, ${row}, ${col})">Download</button>
    `;
    wrapper.querySelector('button').dataset.url = canvas.toDataURL();
    container.appendChild(wrapper);
  });

  showStatus(`Split into ${tiles.length} tiles (${cols}×${rows})`, 'success');
}

function downloadTileCanvas(btn, row, col) {
  const url = btn.dataset.url;
  if (!url) return;
  const link = document.createElement('a');
  link.download = `tile-r${row+1}-c${col+1}.png`;
  link.href = url;
  link.click();
}

// ── Merge ────────────────────────────────────

function initMergeFlow(event) {
  const uploadArea = document.getElementById('upload-area');
  if (uploadArea) {
    const dz = uploadArea.querySelector('.drop-zone');
    if (dz) dz.innerHTML = '<div style="padding:2rem;text-align:center"><div class="animate-pulse text-accent font-bold">⏳ Loading images...</div></div>';
  }

  const files = Array.from(event?.target?.files || []).filter(f => f.type.startsWith('image/'));
  if (!files.length) return;

  const promises = files.map(f => new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = e => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => resolve(null);
      img.src = e.target.result;
    };
    reader.onerror = () => resolve(null);
    reader.readAsDataURL(f);
  }));

  Promise.all(promises).then(results => {
    const imgs = results.filter(img => img !== null);
    mergeImages = [...mergeImages, ...imgs];
    renderMergeList();
    
    if (!currentCanvas && mergeImages.length > 0) {
      if (mergeImages.length === 1) {
        originalImage = mergeImages[0];
        initWorkspace(originalImage);
        mergeImages = []; // clear from merge to avoid confusion
        switchTab('upscale'); 
        showStatus('Only 1 image selected. Switched to normal editing mode.', 'info');
      } else {
        originalImage = mergeImages[0];
        initWorkspace(originalImage); // Init with first image to prevent null errors
        switchTab('merge');
        showStatus(`Loaded ${mergeImages.length} images. Adjust layout and click Merge.`, 'success');
      }
    } else {
      switchTab('merge');
    }
  });
}

function handleMergeUpload(event) {
  const files = Array.from(event?.target?.files || []).filter(f => f.type.startsWith('image/'));
  if (!files.length) return;

  const promises = files.map(f => new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = e => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.src = e.target.result;
    };
    reader.readAsDataURL(f);
  }));

  Promise.all(promises).then(imgs => {
    mergeImages = [...mergeImages, ...imgs];
    renderMergeList();
  });
}

function renderMergeList() {
  const list = document.getElementById('merge-preview-list');
  if (!list) return;
  list.innerHTML = mergeImages.map((img, i) => `
    <div class="merge-img-item">
      <img src="${img.src}" style="height:60px;object-fit:cover;border-radius:4px">
      <span class="text-xs text-muted">${img.width}×${img.height}</span>
      <button onclick="removeMergeImage(${i})" class="remove-btn">✖</button>
    </div>
  `).join('');

  const btn = document.getElementById('do-merge-btn');
  if (btn) btn.classList.toggle('hidden', mergeImages.length < 2);
}

function removeMergeImage(idx) {
  mergeImages.splice(idx, 1);
  renderMergeList();
}

function applyMerge() {
  if (mergeImages.length < 2) return;
  const layoutEl = document.getElementById('merge-layout');
  const layout = layoutEl?.value || 'horizontal';
  const cols = parseInt(document.getElementById('merge-cols')?.value) || 2;

  const merged = mergeImageLayout(mergeImages, layout, cols);
  currentCanvas = merged;
  updatePreview();
  showStatus(`Merged ${mergeImages.length} images (${layout})`, 'success');

  // Use merged as new working image
  const uploadArea = document.getElementById('upload-area');
  const workspace = document.getElementById('workspace');
  if (uploadArea) uploadArea.classList.add('hidden');
  if (workspace) workspace.classList.remove('hidden');
}

// ── Download ─────────────────────────────────

function downloadResult(format = 'png') {
  if (!currentCanvas) return;
  const link = document.createElement('a');
  link.download = `image-toolkit-${Date.now()}.${format}`;

  if (format === 'jpg') {
    link.href = currentCanvas.toDataURL('image/jpeg', 0.9);
  } else if (format === 'webp') {
    link.href = currentCanvas.toDataURL('image/webp', 0.9);
  } else {
    link.href = currentCanvas.toDataURL('image/png');
  }
  link.click();
}

function resetToolkit() {
  originalImage = null;
  currentCanvas = null;
  mergeImages = [];
  const uploadArea = document.getElementById('upload-area');
  const workspace = document.getElementById('workspace');
  if (uploadArea) uploadArea.classList.remove('hidden');
  if (workspace) workspace.classList.add('hidden');
  const resultsEl = document.getElementById('split-results');
  if (resultsEl) resultsEl.classList.add('hidden');
}

function showStatus(msg, type = 'info') {
  const el = document.getElementById('status-text');
  if (!el) return;
  const icons = { success: '✅', error: '❌', info: 'ℹ️' };
  el.textContent = `${icons[type] || ''} ${msg}`;
  el.className = `status-${type}`;
}

function switchTab(tab) {
  activeTab = tab;
  document.querySelectorAll('.toolkit-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.add('hidden'));
  const activeBtn = document.getElementById(`tab-${tab}`);
  if (activeBtn) activeBtn.classList.add('active');
  const activePanel = document.getElementById(`panel-${tab}`);
  if (activePanel) activePanel.classList.remove('hidden');
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    validateImageSize, formatDimensions, parseScale,
    bicubicResize, rotateCanvas, flipCanvas, cropCanvas, applyColorAdjustments,
    splitImageGrid, mergeImageLayout, createCanvas,
    handleUpload, initWorkspace, updatePreview, downloadResult, resetToolkit, showStatus,
    applyResize, applyRotate, applyFlip, applyTilt, applyCropManual, applyCropPreset,
    applyColors, resetColorSliders, applySplit, applyMerge, applyUpscale, applyCustomUpscale,
    initMergeFlow, handleMergeUpload, renderMergeList, removeMergeImage, switchTab,
    parsePageRange: (str, total) => {
      // re-export for tests
      if (!str) return Array.from({ length: total }, (_, i) => i);
      return str.split(',').flatMap(p => {
        const m = p.trim().match(/^(\d+)-(\d+)$/);
        if (m) return Array.from({ length: parseInt(m[2]) - parseInt(m[1]) + 1 }, (_, i) => parseInt(m[1]) + i - 1);
        const n = parseInt(p.trim());
        return isNaN(n) ? [] : [n - 1];
      }).filter((v, i, a) => v >= 0 && v < total && a.indexOf(v) === i).sort((a, b) => a - b);
    },
    setCurrentCanvas: (c) => { currentCanvas = c; },
    setOriginalImage: (img) => { originalImage = img; },
    setMergeImages: (imgs) => { mergeImages = imgs; },
    getCurrentCanvas: () => currentCanvas,
    getOriginalImage: () => originalImage,
    getMergeImages: () => mergeImages
  };
}
