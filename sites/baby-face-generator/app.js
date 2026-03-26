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
async function initFaceAPI() {
  if (typeof window === 'undefined' || !window.faceapi) return;
  try {
    await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
  } catch (e) {
    console.error("Failed to load FaceAPI models:", e);
  }
}
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', initFaceAPI);
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
      const scale = Math.max(200 / img.width, 200 / img.height);
      const w = img.width * scale, h = img.height * scale;
      ctx.drawImage(img, (200 - w) / 2, (200 - h) / 2, w, h);
      
      if (window.faceapi && faceapi.nets.tinyFaceDetector.isLoaded) {
          const detections = await faceapi.detectAllFaces(canvas, new faceapi.TinyFaceDetectorOptions());
          if (detections.length === 0) {
              alert('No human face detected! Please upload a clear photo of a human face.');
              ctx.clearRect(0,0,200,200);
              const input = document.getElementById(`parent${num}-input`);
              if(input) input.value = '';
              return;
          }
      }

      canvas.classList.remove('hidden');
      const slot = canvas.closest('.upload-slot');
      const dz = slot ? slot.querySelector('.drop-zone') : null;
      if (dz) dz.classList.add('hidden');
      if (num === 1) parent1Loaded = true;
      if (num === 2) parent2Loaded = true;
      const btn = document.getElementById('generate-btn');
      if (btn) btn.disabled = !(parent1Loaded && parent2Loaded);
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
  // Sample center 40% of the image (likely face region)
  const margin = Math.floor(size * 0.3);
  const sampleSize = size - margin * 2;
  const data = ctx.getImageData(margin, margin, sampleSize, sampleSize).data;
  let r = 0, g = 0, b = 0, count = 0;
  for (let i = 0; i < data.length; i += 16) { // sample every 4th pixel for speed
    r += data[i]; g += data[i+1]; b += data[i+2]; count++;
  }
  if (count === 0) return { r: 200, g: 170, b: 150 };
  return { r: Math.round(r / count), g: Math.round(g / count), b: Math.round(b / count) };
}

/**
 * Apply baby-ification filter: soften, warm, brighten
 */
function applyBabyFilter(ctx, size) {
  if (!ctx) return;
  // Warm overlay: slight pink/warm tint
  ctx.globalCompositeOperation = 'overlay';
  ctx.fillStyle = 'rgba(255, 220, 200, 0.12)';
  ctx.fillRect(0, 0, size, size);
  ctx.globalCompositeOperation = 'source-over';

  // Apply softening via blur + brightness
  ctx.filter = 'blur(1.5px) brightness(1.08) saturate(1.1)';
  ctx.drawImage(ctx.canvas, 0, 0);
  ctx.filter = 'none';

  // Oval vignette mask for face shape
  ctx.globalCompositeOperation = 'destination-in';
  const gradient = ctx.createRadialGradient(size/2, size/2, size*0.2, size/2, size/2, size*0.48);
  gradient.addColorStop(0, 'rgba(255,255,255,1)');
  gradient.addColorStop(0.7, 'rgba(255,255,255,1)');
  gradient.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  ctx.globalCompositeOperation = 'source-over';

  // Soft background behind oval
  const bgGrad = ctx.createRadialGradient(size/2, size/2, size*0.35, size/2, size/2, size*0.5);
  bgGrad.addColorStop(0, 'rgba(255,235,220,0)');
  bgGrad.addColorStop(1, 'rgba(255,235,220,0.6)');
  ctx.globalCompositeOperation = 'destination-over';
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, size, size);
  ctx.globalCompositeOperation = 'source-over';
}

function blendImages(canvas1, canvas2, outputCanvas) {
  if (!canvas1 || !canvas2 || !outputCanvas) return;
  const SIZE = 200;
  const ctx = outputCanvas.getContext('2d');
  outputCanvas.width = SIZE; outputCanvas.height = SIZE;

  // Step 1: Extract skin tones from both parents
  const tone1 = extractSkinTone(canvas1, SIZE);
  const tone2 = extractSkinTone(canvas2, SIZE);

  // Step 2: Create baby skin tone (interpolated + warmer)
  const babyTone = {
    r: Math.round((tone1.r + tone2.r) / 2 + 5),
    g: Math.round((tone1.g + tone2.g) / 2 + 3),
    b: Math.round((tone1.b + tone2.b) / 2 - 2)
  };

  // Step 3: Get pixel data from both parents
  const d1 = canvas1.getContext('2d').getImageData(0, 0, SIZE, SIZE);
  const d2 = canvas2.getContext('2d').getImageData(0, 0, SIZE, SIZE);
  const out = ctx.createImageData(SIZE, SIZE);

  // Step 4: Advanced blend — use facial zones with different weights
  // Randomize which parent dominates which zone
  const seed = Math.random();
  const p1Eyes = seed > 0.5;  // parent1 contributes eyes region
  const p1Mouth = seed <= 0.5; // parent1 contributes mouth region

  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      const i = (y * SIZE + x) * 4;
      const cx = SIZE / 2, cy = SIZE / 2;
      const dx = x - cx, dy = y - cy;

      // Distance from center (normalized 0-1)
      const dist = Math.sqrt(dx*dx + dy*dy) / (SIZE / 2);

      // Define facial zone weights
      let p1Weight;
      const isEyeRegion = (dy < -10 && dy > -50 && Math.abs(dx) < 60); // upper-mid face
      const isMouthRegion = (dy > 20 && dy < 60 && Math.abs(dx) < 40); // lower-mid face
      const isNoseRegion = (Math.abs(dy) < 25 && Math.abs(dx) < 25); // center
      const isForehead = (dy < -40); // top
      const isChin = (dy > 50); // bottom

      if (isEyeRegion) {
        p1Weight = p1Eyes ? 0.7 : 0.3;
      } else if (isMouthRegion) {
        p1Weight = p1Mouth ? 0.7 : 0.3;
      } else if (isNoseRegion) {
        p1Weight = 0.5; // equal blend for nose
      } else if (isForehead) {
        p1Weight = p1Eyes ? 0.6 : 0.4;
      } else if (isChin) {
        p1Weight = p1Mouth ? 0.6 : 0.4;
      } else {
        p1Weight = 0.5;
      }

      // Blend outside face oval toward baby skin tone
      const faceFade = dist > 0.7 ? Math.min(1, (dist - 0.7) / 0.3) : 0;

      // Raw blended pixel
      let r = d1.data[i] * p1Weight + d2.data[i] * (1 - p1Weight);
      let g = d1.data[i+1] * p1Weight + d2.data[i+1] * (1 - p1Weight);
      let b = d1.data[i+2] * p1Weight + d2.data[i+2] * (1 - p1Weight);

      // Apply skin tone tinting (subtle)
      const tintStrength = 0.15;
      r = r * (1 - tintStrength) + babyTone.r * tintStrength;
      g = g * (1 - tintStrength) + babyTone.g * tintStrength;
      b = b * (1 - tintStrength) + babyTone.b * tintStrength;

      // Fade edges to warm background
      r = r * (1 - faceFade) + 255 * faceFade;
      g = g * (1 - faceFade) + 235 * faceFade;
      b = b * (1 - faceFade) + 220 * faceFade;

      out.data[i] = Math.min(255, Math.round(r));
      out.data[i+1] = Math.min(255, Math.round(g));
      out.data[i+2] = Math.min(255, Math.round(b));
      out.data[i+3] = 255;
    }
  }

  ctx.putImageData(out, 0, 0);

  // Step 5: Apply baby-ification filter
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

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { 
    TRAITS, blendImages, generateTraits, generateBaby, downloadResult, resetAll, loadParent,
    extractSkinTone, applyBabyFilter,
    getState: () => ({ parent1Loaded, parent2Loaded }), 
    setParent1: v => { parent1Loaded = v; }, 
    setParent2: v => { parent2Loaded = v; } 
  };
}
