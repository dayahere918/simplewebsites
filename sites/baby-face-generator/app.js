/**
 * Baby Face Generator — Core Logic
 * Blends two parent photos using advanced face morphing to simulate a "baby" face
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
    console.log("FaceAPI models loaded successfully.");
  } catch (e) {
    console.error("Failed to load FaceAPI models:", e);
  }
}
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', initFaceAPI);
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
      
      if (typeof window !== 'undefined' && window.faceapi && faceapi.nets.tinyFaceDetector.isLoaded) {
          const detections = await faceapi.detectAllFaces(canvas, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks();
          if (detections.length === 0) {
              alert('No human face detected! Please upload a clear photo of a human face.');
              ctx.clearRect(0,0,200,200);
              const input = document.getElementById(`parent${num}-input`);
              if(input) input.value = '';
              return;
          }
          globalLandmarks[`parent${num}`] = detections[0].landmarks.positions;
      }

      canvas.classList.remove('hidden');
      const slot = canvas.closest('.upload-slot');
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
  const sampleSize = size - margin * 2;
  const data = ctx.getImageData(margin, margin, sampleSize, sampleSize).data;
  let r = 0, g = 0, b = 0, count = 0;
  for (let i = 0; i < data.length; i += 16) {
    r += data[i]; g += data[i+1]; b += data[i+2]; count++;
  }
  if (count === 0) return { r: 200, g: 170, b: 150 };
  return { r: Math.round(r / count), g: Math.round(g / count), b: Math.round(b / count) };
}

/**
 * Apply baby-ification filter: strong softening, warmth, round face
 */
function applyBabyFilter(ctx, size) {
  if (!ctx) return;
  // Warm overlay
  ctx.globalCompositeOperation = 'overlay';
  ctx.fillStyle = 'rgba(255, 220, 200, 0.12)';
  ctx.fillRect(0, 0, size, size);
  ctx.globalCompositeOperation = 'source-over';

  // Strong softening — babies have very soft features
  ctx.filter = 'blur(2.5px) brightness(1.1) saturate(1.15)';
  ctx.drawImage(ctx.canvas, 0, 0);
  ctx.filter = 'none';

  // Oval vignette for face shape
  ctx.globalCompositeOperation = 'destination-in';
  const gradient = ctx.createRadialGradient(size/2, size/2, size*0.15, size/2, size/2, size*0.45);
  gradient.addColorStop(0, 'rgba(255,255,255,1)');
  gradient.addColorStop(0.6, 'rgba(255,255,255,1)');
  gradient.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  ctx.globalCompositeOperation = 'source-over';

  // Soft warm background behind oval
  const bgGrad = ctx.createRadialGradient(size/2, size/2, size*0.3, size/2, size/2, size*0.5);
  bgGrad.addColorStop(0, 'rgba(255,230,215,0)');
  bgGrad.addColorStop(1, 'rgba(255,230,215,0.7)');
  ctx.globalCompositeOperation = 'destination-over';
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, size, size);
  ctx.globalCompositeOperation = 'source-over';
}

function getCenter(points) {
  let x = 0, y = 0;
  points.forEach(p => { x += p.x; y += p.y; });
  return { x: x/points.length, y: y/points.length };
}

function alignFace(canvas, landmarks, targetEyesScale = 85, targetEyesY = 90, targetEyesCX = 100) {
  if (!landmarks) return canvas;
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

  // Baby skin tone — average with warmth boost
  const babyTone = {
    r: Math.min(255, Math.round((tone1.r + tone2.r) / 2 + 8)),
    g: Math.min(255, Math.round((tone1.g + tone2.g) / 2 + 5)),
    b: Math.min(255, Math.round((tone1.b + tone2.b) / 2))
  };

  // Align faces perfectly based on landmarks so features don't ghost
  const c1Aligned = alignFace(canvas1, globalLandmarks.parent1, 55, 100, 100);
  const c2Aligned = alignFace(canvas2, globalLandmarks.parent2, 55, 100, 100);

  const tmpCanvas1 = (typeof document !== 'undefined') ? document.createElement('canvas') : null;
  const tmpCanvas2 = (typeof document !== 'undefined') ? document.createElement('canvas') : null;

  let d1, d2;
  if (tmpCanvas1 && tmpCanvas2) {
    tmpCanvas1.width = SIZE; tmpCanvas1.height = SIZE;
    tmpCanvas2.width = SIZE; tmpCanvas2.height = SIZE;
    const tc1 = tmpCanvas1.getContext('2d');
    const tc2 = tmpCanvas2.getContext('2d');
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

  // Randomize which parent contributes to which zone
  const seed = Math.random();
  const p1Eyes = seed > 0.5;
  const p1Mouth = seed <= 0.5;

  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      const i = (y * SIZE + x) * 4;
      const cx = SIZE / 2, cy = SIZE / 2;
      const dx = x - cx, dy = y - cy;
      const dist = Math.sqrt(dx*dx + dy*dy) / (SIZE / 2);

      // Facial zone weights — EVEN blend (closer to 50/50) makes it look less like either parent
      let p1Weight;
      const isEyeRegion = (dy < -5 && dy > -45 && Math.abs(dx) < 55);
      const isMouthRegion = (dy > 15 && dy < 55 && Math.abs(dx) < 35);
      const isNoseRegion = (Math.abs(dy) < 20 && Math.abs(dx) < 20);

      if (isEyeRegion) {
        p1Weight = p1Eyes ? 0.6 : 0.4;
      } else if (isMouthRegion) {
        p1Weight = p1Mouth ? 0.6 : 0.4;
      } else if (isNoseRegion) {
        p1Weight = 0.5;
      } else {
        p1Weight = 0.5;
      }

      // Face oval fade  
      const faceFade = dist > 0.55 ? Math.min(1, (dist - 0.55) / 0.25) : 0;

      // Blend the two parent images
      let r = d1.data[i] * p1Weight + d2.data[i] * (1 - p1Weight);
      let g = d1.data[i+1] * p1Weight + d2.data[i+1] * (1 - p1Weight);
      let b = d1.data[i+2] * p1Weight + d2.data[i+2] * (1 - p1Weight);

      // STRONG skin tone tinting — this is the key to making it look different from parents
      const tintStrength = 0.35;
      r = r * (1 - tintStrength) + babyTone.r * tintStrength;
      g = g * (1 - tintStrength) + babyTone.g * tintStrength;
      b = b * (1 - tintStrength) + babyTone.b * tintStrength;

      // Fade edges to warm background
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

  // Apply baby-ification filters (heavy blur + warmth)
  applyBabyFilter(ctx, SIZE);
}

function generateTraits() {
  const pick = arr => arr[Math.floor(Math.random() * arr.length)];
  return [pick(TRAITS.eyes), pick(TRAITS.nose), pick(TRAITS.hair), pick(TRAITS.features), pick(TRAITS.features)];
}

function generateBaby() {
  if (typeof document === 'undefined') return;
  if (!parent1Loaded || !parent2Loaded) return;
  const c1 = document.getElementById('parent1-canvas');
  const c2 = document.getElementById('parent2-canvas');
  const baby = document.getElementById('baby-canvas');
  blendImages(c1, c2, baby);
  const traits = generateTraits();
  document.getElementById('baby-traits').innerHTML = traits.map(t => `<span class="trait-chip">${t}</span>`).join('');
  document.getElementById('result-section')?.classList.remove('hidden');
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
    const slot = canvas?.closest('.upload-slot');
    const dz = slot ? slot.querySelector('.drop-zone') : null;
    if (canvas) canvas.classList.add('hidden');
    if (dz) dz.classList.remove('hidden');
    if (input) input.value = '';
  });
  document.getElementById('result-section')?.classList.add('hidden');
  const btn = document.getElementById('generate-btn');
  if (btn) btn.disabled = true;
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
    extractSkinTone, applyBabyFilter, alignFace, initFaceAPI, shareBaby,
    getState: () => ({ parent1Loaded, parent2Loaded, globalLandmarks }), 
    setParent1: v => { parent1Loaded = v; }, 
    setParent2: v => { parent2Loaded = v; },
    setLandmarks: (p, v) => { globalLandmarks[p] = v; },
    getDrawImageParams, updateParentState
  };
}

