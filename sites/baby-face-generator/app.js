/**
 * Baby Face Generator — Core Logic
 * Blends two parent photos using face morphing to preview a baby face
 * FIXED: Replaced destructive destination-in composite with non-destructive overlay approach
 */
const TRAITS = {
  eyes: ['Big brown eyes', 'Bright blue eyes', 'Hazel eyes', 'Green eyes', 'Dark eyes'],
  nose: ['Button nose', 'Small nose', 'Defined nose'],
  hair: ['Curly hair', 'Straight hair', 'Wavy hair', 'Thick hair', 'Fine hair'],
  features: ['Dimples', 'Full lips', 'Round cheeks', 'Fair skin', 'Olive skin', 'Deep skin tone', 'Freckles']
};

let parent1Loaded = false, parent2Loaded = false;

const MODEL_URL = 'https://vladmandic.github.io/face-api/model/';
let globalLandmarks = { parent1: null, parent2: null };

async function initFaceAPI() {
  if (typeof window === 'undefined' || !window.faceapi) return;
  try {
    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
      faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL)
    ]);
    console.log('FaceAPI models loaded successfully.');
  } catch (e) {
    console.error('Failed to load FaceAPI models:', e);
  }
}
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', initFaceAPI);
}

/**
 * Check if face landmark data is available for a given parent
 * @param {string} parent - 'parent1' | 'parent2'
 * @returns {boolean}
 */
function isLandmarkAvailable(parent) {
  return !!(globalLandmarks[parent] && globalLandmarks[parent].length > 0);
}

/**
 * Compute scaling and centering params for drawing an image onto a target square canvas
 */
function getDrawImageParams(imgW, imgH, targetSize) {
  const scale = Math.max(targetSize / imgW, targetSize / imgH);
  const w = imgW * scale;
  const h = imgH * scale;
  return {
    dx: (targetSize - w) / 2,
    dy: (targetSize - h) / 2,
    dw: w,
    dh: h
  };
}

function updateParentState(num, isLoaded) {
  if (num === 1) parent1Loaded = isLoaded;
  if (num === 2) parent2Loaded = isLoaded;
  const btn = typeof document !== 'undefined' ? document.getElementById('generate-btn') : null;
  if (btn) btn.disabled = !(parent1Loaded && parent2Loaded);
}

function loadParent(event, num) {
  const file = event?.target?.files?.[0];
  if (!file || !file.type.startsWith('image/')) return;
  const reader = new FileReader();
  reader.onload = e => {
    if (typeof document === 'undefined') return;
    const img = new Image();
    img.onload = async () => {
      const canvas = document.getElementById(`parent${num}-canvas`);
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      canvas.width = 200; canvas.height = 200;

      const { dx, dy, dw, dh } = getDrawImageParams(img.width, img.height, 200);
      ctx.drawImage(img, dx, dy, dw, dh);

      // Attempt face detection — but don't block if FaceAPI fails
      if (typeof window !== 'undefined' && window.faceapi && faceapi.nets.tinyFaceDetector.isLoaded) {
        try {
          const detections = await faceapi.detectAllFaces(canvas, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks();
          if (detections.length === 0) {
            // Soft warning — don't block the upload, just clear landmarks
            console.warn(`No face detected in parent${num} — proceeding without landmark alignment`);
            globalLandmarks[`parent${num}`] = null;
          } else {
            globalLandmarks[`parent${num}`] = detections[0].landmarks.positions;
          }
        } catch (e) {
          console.warn('FaceAPI detection failed:', e.message);
          globalLandmarks[`parent${num}`] = null;
        }
      }

      canvas.classList.remove('hidden');
      const slot = canvas.closest?.('.upload-slot') || canvas.parentElement;
      const dz = slot ? slot.querySelector('.drop-zone') : null;
      if (dz) dz.classList.add('hidden');
      updateParentState(num, true);
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

/**
 * Extract average skin tone from the center region of a canvas
 */
function extractSkinTone(canvas, size) {
  if (!canvas) return { r: 200, g: 170, b: 150 };
  const ctx = canvas.getContext('2d');
  if (!ctx || !ctx.getImageData) return { r: 200, g: 170, b: 150 };
  const margin = Math.floor(size * 0.3);
  const sampleSize = Math.max(size - margin * 2, 1);
  const data = ctx.getImageData(margin, margin, sampleSize, sampleSize).data;
  let r = 0, g = 0, b = 0, count = 0;
  for (let i = 0; i < data.length; i += 16) {
    r += data[i]; g += data[i+1]; b += data[i+2]; count++;
  }
  if (count === 0) return { r: 200, g: 170, b: 150 };
  return { r: Math.round(r / count), g: Math.round(g / count), b: Math.round(b / count) };
}

/**
 * Apply a warm vignette to an existing canvas — NON-DESTRUCTIVE
 * Uses source-over (not destination-in) so existing pixels are preserved.
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} size
 */
function applyWarmVignette(ctx, size) {
  if (!ctx) return;
  // Warm color overlay at low alpha — softens the image slightly
  ctx.globalCompositeOperation = 'source-over';
  ctx.globalAlpha = 0.08;
  ctx.fillStyle = 'rgba(255, 220, 190, 1)';
  ctx.fillRect(0, 0, size, size);
  ctx.globalAlpha = 1.0;

  // Radial vignette darkening around edges (non-destructive multiply)
  ctx.globalCompositeOperation = 'multiply';
  const vignette = ctx.createRadialGradient(size/2, size/2, size * 0.2, size/2, size/2, size * 0.75);
  vignette.addColorStop(0, 'rgba(255,255,255,1)');  // center: no change
  vignette.addColorStop(1, 'rgba(200,185,175,1)');  // edge: warm soft darkening
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, size, size);
  ctx.globalCompositeOperation = 'source-over';
}

/**
 * Apply baby-face softening — NON-DESTRUCTIVE
 * Draws a soft-blurred copy ON TOP at low opacity instead of destroying content
 * @param {CanvasRenderingContext2D} ctx
 * @param {HTMLCanvasElement} canvas
 * @param {number} size
 */
function applyBabyFilter(ctx, size) {
  if (!ctx) return;
  const canvas = ctx.canvas;
  if (!canvas) return;

  // Create temp canvas with blur applied
  let tmp;
  if (typeof document !== 'undefined') {
    tmp = document.createElement('canvas');
    tmp.width = size;
    tmp.height = size;
  } else {
    return; // skip in non-DOM environments
  }

  const tmpCtx = tmp.getContext('2d');
  tmpCtx.filter = 'blur(1.5px) brightness(1.08) saturate(1.1)';
  tmpCtx.drawImage(canvas, 0, 0);
  tmpCtx.filter = 'none';

  // Blend the soft version OVER the original at low opacity (non-destructive)
  ctx.globalCompositeOperation = 'source-over';
  ctx.globalAlpha = 0.35;
  ctx.drawImage(tmp, 0, 0);
  ctx.globalAlpha = 1.0;

  // Add warm vignette on top
  applyWarmVignette(ctx, size);
}

function getCenter(points) {
  let x = 0, y = 0;
  points.forEach(p => { x += p.x; y += p.y; });
  return { x: x / points.length, y: y / points.length };
}

function alignFace(canvas, landmarks, targetEyesScale = 85, targetEyesY = 90, targetEyesCX = 100) {
  if (!landmarks) return canvas; // fallback: return original if no landmarks
  const leftEye = getCenter(landmarks.slice(36, 42));
  const rightEye = getCenter(landmarks.slice(42, 48));

  const dx = rightEye.x - leftEye.x;
  const dy = rightEye.y - leftEye.y;
  const currentDist = Math.sqrt(dx*dx + dy*dy);
  const angle = Math.atan2(dy, dx);

  const scale = targetEyesScale / Math.max(currentDist, 10);
  const currentCX = (leftEye.x + rightEye.x) / 2;
  const currentCY = (leftEye.y + rightEye.y) / 2;

  const alignedCanvas = (typeof document !== 'undefined') ? document.createElement('canvas') : null;
  if (!alignedCanvas) return canvas;
  alignedCanvas.width = 200;
  alignedCanvas.height = 200;
  const ctx = alignedCanvas.getContext('2d');

  ctx.translate(targetEyesCX, targetEyesY);
  ctx.rotate(-angle);
  ctx.scale(scale, scale);
  ctx.translate(-currentCX, -currentCY);
  ctx.drawImage(canvas, 0, 0);

  return alignedCanvas;
}

function blendImages(canvas1, canvas2, outputCanvas) {
  if (!canvas1 || !canvas2 || !outputCanvas) return;
  const SIZE = 200;
  const ctx = outputCanvas.getContext('2d');
  outputCanvas.width = SIZE; outputCanvas.height = SIZE;

  const tone1 = extractSkinTone(canvas1, SIZE);
  const tone2 = extractSkinTone(canvas2, SIZE);

  // Baby skin tone — average of parents with slight warmth boost
  const babyTone = {
    r: Math.min(255, Math.round((tone1.r + tone2.r) / 2 + 8)),
    g: Math.min(255, Math.round((tone1.g + tone2.g) / 2 + 5)),
    b: Math.min(255, Math.round((tone1.b + tone2.b) / 2))
  };

  // Align faces using landmarks if available, otherwise use as-is
  const c1Aligned = isLandmarkAvailable('parent1')
    ? alignFace(canvas1, globalLandmarks.parent1, 55, 95, 100)
    : canvas1;
  const c2Aligned = isLandmarkAvailable('parent2')
    ? alignFace(canvas2, globalLandmarks.parent2, 55, 95, 100)
    : canvas2;

  // Draw each parent onto temp canvases with baby tone background
  let d1, d2;
  if (typeof document !== 'undefined') {
    const tmp1 = document.createElement('canvas');
    const tmp2 = document.createElement('canvas');
    tmp1.width = SIZE; tmp1.height = SIZE;
    tmp2.width = SIZE; tmp2.height = SIZE;

    const tc1 = tmp1.getContext('2d');
    const tc2 = tmp2.getContext('2d');

    tc1.fillStyle = `rgb(${babyTone.r},${babyTone.g},${babyTone.b})`;
    tc1.fillRect(0, 0, SIZE, SIZE);
    tc1.drawImage(c1Aligned, 0, 0, SIZE, SIZE);

    tc2.fillStyle = `rgb(${babyTone.r},${babyTone.g},${babyTone.b})`;
    tc2.fillRect(0, 0, SIZE, SIZE);
    tc2.drawImage(c2Aligned, 0, 0, SIZE, SIZE);

    d1 = tc1.getImageData(0, 0, SIZE, SIZE);
    d2 = tc2.getImageData(0, 0, SIZE, SIZE);
  } else {
    d1 = c1Aligned.getContext('2d').getImageData(0, 0, SIZE, SIZE);
    d2 = c2Aligned.getContext('2d').getImageData(0, 0, SIZE, SIZE);
  }

  const out = ctx.createImageData(SIZE, SIZE);

  // Fix double-face ghosting by choosing a dominant structural parent
  // and blending the other's features (eyes/mouth) using soft masking instead of 50/50 pixel math.
  const baseP = Math.random() > 0.5 ? 1 : 2;
  const baseData = baseP === 1 ? d1 : d2;
  const featData = baseP === 1 ? d2 : d1;
  
  // Randomly select which features come from the other parent
  const useFeatEyes = Math.random() > 0.4;
  const useFeatMouth = !useFeatEyes;

  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      const i = (y * SIZE + x) * 4;
      const cx = SIZE / 2, cy = SIZE / 2;
      const rdx = x - cx, rdy = y - cy;
      const dist = Math.sqrt(rdx*rdx + rdy*rdy) / (SIZE / 2);

      // Define facial zones based on standard centered alignment (eyes at ~95y, mouth at ~145y)
      let featWeight = 0; // how much of the non-dominant parent to use
      
      const isEyeRegion = (rdy < -5 && rdy > -40 && Math.abs(rdx) < 55);
      const isMouthRegion = (rdy > 20 && rdy < 60 && Math.abs(rdx) < 35);
      const isSkinRegion = dist < 0.6; // Inner face

      if (isEyeRegion && useFeatEyes) {
        // Feathered edge for eyes
        const centerDist = Math.abs(rdx) < 20 ? 0 : 1;
        featWeight = 0.85; 
      } else if (isMouthRegion && useFeatMouth) {
        featWeight = 0.75;
      } else if (isSkinRegion) {
        // Blend skin tones 60/40
        featWeight = 0.4;
      } else {
        // Hair and background belong solely to the base parent to prevent ghosting
        featWeight = 0.05; 
      }

      // Smooth transition to baby skin tint around edges
      const faceFade = dist > 0.65 ? Math.min(1, (dist - 0.65) / 0.15) : 0;

      // Calculate final pixel values
      let r = baseData.data[i] * (1 - featWeight) + featData.data[i] * featWeight;
      let g = baseData.data[i+1] * (1 - featWeight) + featData.data[i+1] * featWeight;
      let b = baseData.data[i+2] * (1 - featWeight) + featData.data[i+2] * featWeight;

      // Baby skin tint — warming and smoothing
      const tint = 0.25;
      r = r * (1 - tint) + babyTone.r * tint;
      g = g * (1 - tint) + babyTone.g * tint;
      b = b * (1 - tint) + babyTone.b * tint;

      // Fade edges strictly to warm background to hide harsh cuts
      r = r * (1 - faceFade) + babyTone.r * faceFade;
      g = g * (1 - faceFade) + babyTone.g * faceFade;
      b = b * (1 - faceFade) + babyTone.b * faceFade;

      out.data[i] = Math.min(255, Math.round(r));
      out.data[i+1] = Math.min(255, Math.round(g));
      out.data[i+2] = Math.min(255, Math.round(b));
      out.data[i+3] = 255;
    }
  }

  ctx.putImageData(out, 0, 0);

  // Apply baby filter (softness, larger eyes illusion via brightness)
  applyBabyFilter(ctx, SIZE);
}

function generateTraits() {
  const pick = arr => arr[Math.floor(Math.random() * arr.length)];
  return [pick(TRAITS.eyes), pick(TRAITS.nose), pick(TRAITS.hair), pick(TRAITS.features), pick(TRAITS.features)];
}

function generateBaby() {
  if (typeof document === 'undefined') return;
  if (!parent1Loaded || !parent2Loaded) return;

  const btn = document.getElementById('generate-btn');
  if (btn) { btn.disabled = true; btn.innerHTML = '⏳ Sequence Initiated...'; }

  const c1 = document.getElementById('parent1-canvas');
  const c2 = document.getElementById('parent2-canvas');
  const baby = document.getElementById('baby-canvas');

  // Add scanning animation classes to canvases
  if (c1) c1.classList.add('scanning');
  if (c2) c2.classList.add('scanning');

  let textStatus = ['Extracting DNA...', 'Isolating Features...', 'Morphing Genetics...', 'Finalizing Portrait...'];
  let tick = 0;
  
  const scanInterval = setInterval(() => {
    if (btn) btn.innerHTML = `🧬 ${textStatus[tick] || 'Compiling...'}`;
    tick++;
  }, 600);

  // 2.5 second delay for "AI" generation feel
  setTimeout(() => {
    clearInterval(scanInterval);
    if (c1) c1.classList.remove('scanning');
    if (c2) c2.classList.remove('scanning');

    blendImages(c1, c2, baby);
    const traits = generateTraits();
    const traitsEl = document.getElementById('baby-traits');
    if (traitsEl) traitsEl.innerHTML = traits.map(t => `<span class="trait-chip">${t}</span>`).join('');
    document.getElementById('result-section')?.classList.remove('hidden');
    
    // Smooth scroll to result
    document.getElementById('result-section')?.scrollIntoView({ behavior: 'smooth' });

    if (btn) { btn.disabled = false; btn.innerHTML = '👶 Generate Sibling'; }
  }, 2500);
}

function downloadResult() {
  if (typeof document === 'undefined') return;
  const canvas = document.getElementById('baby-canvas');
  if (!canvas) return;
  const link = document.createElement('a');
  link.download = 'baby-prediction.png';
  link.href = canvas.toDataURL();
  link.click();
}

function resetAll() {
  parent1Loaded = false; parent2Loaded = false;
  if (typeof document === 'undefined') return;
  ['parent1', 'parent2'].forEach(p => {
    globalLandmarks[p] = null;
    const canvas = document.getElementById(p + '-canvas');
    const input = document.getElementById(p + '-input');
    const slot = canvas?.closest?.('.upload-slot') || canvas?.parentElement;
    const dz = slot ? slot.querySelector('.drop-zone') : null;
    if (canvas) canvas.classList.add('hidden');
    if (dz) dz.classList.remove('hidden');
    if (input) input.value = '';
  });
  document.getElementById('result-section')?.classList.add('hidden');
  const btn = document.getElementById('generate-btn');
  if (btn) { btn.disabled = true; btn.textContent = '👶 Generate Baby'; }
}

function shareBaby() {
  if (typeof navigator === 'undefined') return;
  const canvas = document.getElementById('baby-canvas');
  if (!canvas) return;
  canvas.toBlob(async (blob) => {
    const file = new File([blob], 'baby-prediction.png', { type: 'image/png' });
    if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({ files: [file], title: 'Our Baby Prediction!', text: 'Check out our AI baby prediction! 👶' });
      } catch (e) { console.warn('Share cancelled'); }
    } else {
      downloadResult();
    }
  });
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    TRAITS, blendImages, generateTraits, generateBaby, downloadResult, resetAll, loadParent,
    extractSkinTone, applyBabyFilter, applyWarmVignette, alignFace, initFaceAPI, shareBaby,
    isLandmarkAvailable,
    getState: () => ({ parent1Loaded, parent2Loaded, globalLandmarks }),
    setParent1: v => { parent1Loaded = v; },
    setParent2: v => { parent2Loaded = v; },
    setLandmarks: (p, v) => { globalLandmarks[p] = v; },
    getDrawImageParams, updateParentState
  };
}
