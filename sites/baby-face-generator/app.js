/**
 * Baby Face Generator — Core Logic
 * Blends two parent photos to simulate a "baby" face
 */
const TRAITS = {
  eyes: ['Big brown eyes', 'Bright blue eyes', 'Hazel eyes', 'Green eyes', 'Dark eyes'],
  nose: ['Button nose', 'Small nose', 'Defined nose'],
  hair: ['Curly hair', 'Straight hair', 'Wavy hair', 'Thick hair', 'Fine hair'],
  features: ['Dimples', 'Full lips', 'Round cheeks', 'Fair skin', 'Olive skin', 'Deep skin tone', 'Freckles']
};

let parent1Loaded = false, parent2Loaded = false;

function loadParent(event, num) {
  const file = event?.target?.files?.[0];
  if (!file || !file.type.startsWith('image/')) return;
  const reader = new FileReader();
  reader.onload = e => {
    if (typeof document === 'undefined') return;
    const img = new Image();
    img.onload = () => {
      const canvas = document.getElementById(`parent${num}-canvas`);
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      canvas.width = 200; canvas.height = 200;
      const scale = Math.max(200 / img.width, 200 / img.height);
      const w = img.width * scale, h = img.height * scale;
      ctx.drawImage(img, (200 - w) / 2, (200 - h) / 2, w, h);
      canvas.classList.remove('hidden');
      const dz = canvas.previousElementSibling;
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

function blendImages(canvas1, canvas2, outputCanvas) {
  if (!canvas1 || !canvas2 || !outputCanvas) return;
  const ctx = outputCanvas.getContext('2d');
  outputCanvas.width = 200; outputCanvas.height = 200;
  const d1 = canvas1.getContext('2d').getImageData(0, 0, 200, 200);
  const d2 = canvas2.getContext('2d').getImageData(0, 0, 200, 200);
  const out = ctx.createImageData(200, 200);
  const blend = 0.5 + (Math.random() * 0.2 - 0.1); // ~50% blend with slight randomness
  for (let i = 0; i < d1.data.length; i += 4) {
    out.data[i] = Math.round(d1.data[i] * blend + d2.data[i] * (1 - blend));
    out.data[i+1] = Math.round(d1.data[i+1] * blend + d2.data[i+1] * (1 - blend));
    out.data[i+2] = Math.round(d1.data[i+2] * blend + d2.data[i+2] * (1 - blend));
    out.data[i+3] = 255;
  }
  ctx.putImageData(out, 0, 0);
  // Apply slight softening
  ctx.filter = 'blur(1px) brightness(1.05)';
  ctx.drawImage(outputCanvas, 0, 0);
  ctx.filter = 'none';
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
    const dz = canvas?.previousElementSibling;
    if (canvas) canvas.classList.add('hidden');
    if (dz) dz.classList.remove('hidden');
    if (input) input.value = '';
  });
  document.getElementById('result-section')?.classList.add('hidden');
  const btn = document.getElementById('generate-btn');
  if (btn) btn.disabled = true;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { TRAITS, blendImages, generateTraits, generateBaby, downloadResult, resetAll,
    getState: () => ({ parent1Loaded, parent2Loaded }), setParent1: v => { parent1Loaded = v; }, setParent2: v => { parent2Loaded = v; } };
}
