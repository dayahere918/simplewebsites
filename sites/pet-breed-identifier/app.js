/**
 * Pet Breed Identifier — Core Logic
 * Breed detection using MobileNet AI with human/non-pet detection guard
 */
const DOG_BREEDS = [
  { name: 'Golden Retriever', size: 'Large', life: '10-12 years', temperament: 'Friendly, Reliable, Trustworthy', origin: 'Scotland', group: 'Sporting', care: ['Regular brushing 2-3x/week', 'Daily exercise (1-2 hours)', 'Prone to hip dysplasia — regular vet checks', 'Love swimming — great for water activities'], colorProfile: { brightness: 'high', warmth: 'warm', contrast: 'low' } },
  { name: 'Labrador Retriever', size: 'Large', life: '10-12 years', temperament: 'Outgoing, Active, Gentle', origin: 'Canada', group: 'Sporting', care: ['Easy to groom, weekly brushing', 'Very active — needs lots of exercise', 'Watch diet — prone to obesity', 'Great with families and children'], colorProfile: { brightness: 'medium', warmth: 'warm', contrast: 'low' } },
  { name: 'German Shepherd', size: 'Large', life: '9-13 years', temperament: 'Courageous, Confident, Smart', origin: 'Germany', group: 'Herding', care: ['Heavy shedding — brush daily', 'Mental stimulation needed', 'Training early is essential', 'Prone to joint issues'], colorProfile: { brightness: 'medium', warmth: 'warm', contrast: 'high' } },
  { name: 'French Bulldog', size: 'Small', life: '10-12 years', temperament: 'Playful, Adaptable, Smart', origin: 'France', group: 'Non-Sporting', care: ['Minimal exercise needs', 'Clean facial wrinkles daily', 'Sensitive to heat', 'Short walks preferred'], colorProfile: { brightness: 'medium', warmth: 'neutral', contrast: 'medium' } },
  { name: 'Poodle', size: 'Medium', life: '12-15 years', temperament: 'Intelligent, Active, Alert', origin: 'Germany/France', group: 'Non-Sporting', care: ['Professional grooming every 6-8 weeks', 'Hypoallergenic — minimal shedding', 'Highly trainable', 'Regular dental care needed'], colorProfile: { brightness: 'medium', warmth: 'cool', contrast: 'low' } },
  { name: 'Beagle', size: 'Small-Medium', life: '12-15 years', temperament: 'Merry, Friendly, Curious', origin: 'England', group: 'Hound', care: ['Moderate exercise daily', 'Prone to weight gain', 'Strong nose — keep on leash outdoors', 'Regular ear cleaning needed'], colorProfile: { brightness: 'medium', warmth: 'warm', contrast: 'medium' } },
  { name: 'Siberian Husky', size: 'Medium-Large', life: '12-14 years', temperament: 'Outgoing, Mischievous, Loyal', origin: 'Siberia', group: 'Working', care: ['Very heavy shedding twice yearly', 'Needs extensive exercise', 'Escape artists — secure fencing needed', 'Do well in cold climates'], colorProfile: { brightness: 'high', warmth: 'cool', contrast: 'high' } },
  { name: 'Corgi', size: 'Small', life: '12-15 years', temperament: 'Affectionate, Smart, Alert', origin: 'Wales', group: 'Herding', care: ['Moderate exercise daily', 'Watch for back issues', 'Double coat — regular brushing', 'Mental stimulation important'], colorProfile: { brightness: 'medium', warmth: 'warm', contrast: 'medium' } },
  { name: 'Pekinese', size: 'Small', life: '12-14 years', temperament: 'Confident, Loyal, Stubborn', origin: 'China', group: 'Toy', care: ['Daily brushing required', 'Not suited for hot climates', 'Moderate, low-impact walks', 'Regular eye cleaning'], colorProfile: { brightness: 'medium', warmth: 'warm', contrast: 'low' } },
];

const CAT_BREEDS = [
  { name: 'Persian', size: 'Medium', life: '12-17 years', temperament: 'Quiet, Sweet, Gentle', origin: 'Iran', group: 'Longhair', care: ['Daily brushing required', 'Clean eyes regularly', 'Indoor living preferred', 'Regular dental care'], colorProfile: { brightness: 'high', warmth: 'warm', contrast: 'low' } },
  { name: 'Maine Coon', size: 'Large', life: '12-15 years', temperament: 'Gentle, Intelligent, Playful', origin: 'USA', group: 'Longhair', care: ['Brush 2-3x/week', 'Provide climbing spaces', 'Regular vet checkups', 'Love interactive toys'], colorProfile: { brightness: 'medium', warmth: 'warm', contrast: 'medium' } },
  { name: 'Siamese', size: 'Medium', life: '15-20 years', temperament: 'Social, Vocal, Affectionate', origin: 'Thailand', group: 'Shorthair', care: ['Minimal grooming needed', 'Needs lots of attention', 'Interactive play daily', 'Can be trained to fetch'], colorProfile: { brightness: 'high', warmth: 'cool', contrast: 'high' } },
  { name: 'British Shorthair', size: 'Medium-Large', life: '12-20 years', temperament: 'Calm, Patient, Easy-going', origin: 'UK', group: 'Shorthair', care: ['Weekly brushing sufficient', 'Watch weight — prone to obesity', 'Moderate exercise needs', 'Independent but affectionate'], colorProfile: { brightness: 'medium', warmth: 'cool', contrast: 'low' } },
  { name: 'Bengal', size: 'Medium-Large', life: '12-16 years', temperament: 'Energetic, Playful, Intelligent', origin: 'USA', group: 'Shorthair', care: ['Minimal grooming', 'Very active — needs play space', 'Love water and climbing', 'Mental stimulation essential'], colorProfile: { brightness: 'medium', warmth: 'warm', contrast: 'high' } },
  { name: 'Ragdoll', size: 'Large', life: '12-15 years', temperament: 'Docile, Calm, Affectionate', origin: 'USA', group: 'Longhair', care: ['Regular brushing', 'Indoor cat recommended', 'Gentle handling preferred', 'Loves to be held'], colorProfile: { brightness: 'high', warmth: 'neutral', contrast: 'medium' } },
  { name: 'Scottish Fold', size: 'Medium', life: '11-15 years', temperament: 'Sweet, Quiet, Adaptable', origin: 'Scotland', group: 'Shorthair', care: ['Easy grooming', 'Check ear folds for issues', 'Moderate exercise', 'Great apartment cat'], colorProfile: { brightness: 'medium', warmth: 'neutral', contrast: 'low' } },
  { name: 'Sphynx', size: 'Medium', life: '12-14 years', temperament: 'Lively, Friendly, Energetic', origin: 'Canada', group: 'Hairless', care: ['Weekly baths needed', 'Keep warm in cold weather', 'Clean ears regularly', 'Sunscreen for outdoor time'], colorProfile: { brightness: 'medium', warmth: 'warm', contrast: 'low' } },
];

/**
 * Keywords that indicate a human is in the image — MobileNet class names
 * Used to guard against false pet identifications on human photos
 */
const HUMAN_KEYWORDS = [
  'person', 'man', 'woman', 'boy', 'girl', 'human', 'face', 'suit', 'shirt',
  'tie', 'jersey', 'gown', 'dress', 'hair', 'people', 'portrait', 'bodybuilder',
  'bridegroom', 'sarong', 'miniskirt', 'bikini', 'swimming cap', 'cowboy hat',
  'mortarboard', 'academic', 'military', 'police', 'lab coat', 'apron'
];

/**
 * Keywords that indicate a non-pet object in the image
 */
const NON_PET_KEYWORDS = [
  'car', 'truck', 'vehicle', 'building', 'house', 'food', 'pizza', 'burger',
  'tree', 'plant', 'phone', 'computer', 'laptop', 'table', 'chair', 'desk',
  'television', 'screen', 'aircraft', 'ship', 'boat', 'weapon', 'gun'
];

/**
 * Check if MobileNet predictions indicate a human is in the image
 * @param {Array} predictions - MobileNet prediction array [{className, probability}]
 * @returns {boolean}
 */
function isHumanImage(predictions) {
  if (!predictions || predictions.length === 0) return false;
  // Check top 3 predictions (highest confidence)
  const topPreds = predictions.slice(0, 3);
  return topPreds.some(pred => {
    const name = (pred.className || '').toLowerCase();
    return HUMAN_KEYWORDS.some(kw => name.includes(kw));
  });
}

/**
 * Check if MobileNet predictions indicate non-pet content
 * @param {Array} predictions
 * @returns {boolean}
 */
function isNonPetImage(predictions) {
  if (!predictions || predictions.length === 0) return false;
  const topPreds = predictions.slice(0, 2);
  // Only flag non-pet if confidence is high (>50%) and no animal-like terms
  return topPreds.some(pred => {
    const name = (pred.className || '').toLowerCase();
    const isHighConf = pred.probability > 0.5;
    return isHighConf && NON_PET_KEYWORDS.some(kw => name.includes(kw));
  });
}

let petType = 'dog';

function setPetType(type) {
  petType = type;
  if (typeof document === 'undefined') return;
  document.querySelectorAll('.pet-btn').forEach(b => { b.classList.remove('active'); b.classList.remove('btn-primary'); b.classList.add('btn-secondary'); });
  const btn = document.getElementById(`btn-${type}`);
  if (btn) { btn.classList.add('active'); btn.classList.remove('btn-secondary'); btn.classList.add('btn-primary'); }
}

let mobilenetModel = null;

async function loadAIModel() {
  if (typeof window !== 'undefined' && window.mobilenet) {
    try {
      mobilenetModel = await window.mobilenet.load();
      console.log('MobileNet model loaded successfully.');
    } catch (e) {
      console.error('Failed to load MobileNet model:', e);
    }
  }
}

if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', loadAIModel);
}

function getImageHash(canvas) {
  if (!canvas) return Date.now();
  const ctx = canvas.getContext('2d');
  if (!ctx || !ctx.getImageData) return Date.now();
  const data = ctx.getImageData(0, 0, Math.min(canvas.width, 50), Math.min(canvas.height, 50)).data;
  let hash = 0;
  for (let i = 0; i < data.length; i += 40) hash = ((hash << 5) - hash + data[i]) | 0;
  return Math.abs(hash);
}

/**
 * Show "no pet detected" message in the results area
 */
function showNoPetDetected(reason) {
  if (typeof document === 'undefined') return;
  const badge = document.getElementById('breed-badge');
  const conf = document.getElementById('confidence-text');
  const barsEl = document.getElementById('breed-bars');
  const infoEl = document.getElementById('breed-info');
  const tipsEl = document.getElementById('care-tips');

  if (badge) {
    badge.textContent = '⚠️ No Pet Detected';
    badge.style.background = 'linear-gradient(135deg, #f97316, #ef4444)';
  }
  if (conf) conf.textContent = reason || 'Please upload a clear photo of a dog or cat.';
  if (barsEl) barsEl.innerHTML = `<div class="no-pet-msg" style="text-align:center;padding:2rem;color:var(--muted)">
    <div style="font-size:3rem;margin-bottom:1rem">🐾</div>
    <p>Upload a photo of a dog or cat for breed identification.</p>
  </div>`;
  if (infoEl) infoEl.innerHTML = '';
  if (tipsEl) tipsEl.innerHTML = '';

  document.getElementById('upload-area')?.classList.add('hidden');
  document.getElementById('results')?.classList.remove('hidden');
}

/**
 * Score breeds based on AI predictions
 */
function identifyBreed(predictions, hash) {
  const breeds = petType === 'dog' ? DOG_BREEDS : CAT_BREEDS;
  const scores = {};

  // Baseline scores to ensure all bars show something
  breeds.forEach((breed, i) => {
    scores[breed.name] = 2 + (hash % (i + 1));
  });

  if (predictions && predictions.length > 0) {
    let matchedAny = false;

    predictions.forEach(pred => {
      const predName = pred.className.toLowerCase();
      const probScore = Math.round(pred.probability * 100);

      breeds.forEach(breed => {
        const bName = breed.name.toLowerCase();
        const matches = predName.includes(bName) ||
                        bName.includes(predName) ||
                        (bName.includes('poodle') && predName.includes('poodle')) ||
                        (bName.includes('corgi') && predName.includes('corgi')) ||
                        (bName === 'german shepherd' && predName.includes('shepherd')) ||
                        (bName === 'pekinese' && predName.includes('pekingese'));

        if (matches) {
          scores[breed.name] += (probScore * 5);
          matchedAny = true;
        }
      });

      // Cat-specific keyword boosting
      if (petType === 'cat' && !matchedAny) {
        if (predName.includes('tabby') || predName.includes('tiger cat')) {
           scores['British Shorthair'] += probScore * 2;
           scores['Bengal'] += probScore * 2;
        }
        if (predName.includes('siamese')) scores['Siamese'] += probScore * 3;
        if (predName.includes('persian')) scores['Persian'] += probScore * 3;
      }
    });

    // Inject dynamic AI-detected breed if confident and unmatched
    if (!matchedAny && predictions[0].probability > 0.15) {
        const injectedName = predictions[0].className.split(',')[0].trim();
        const formattedName = injectedName.replace(/\b\w/g, l => l.toUpperCase());
        scores[formattedName] = Math.round(predictions[0].probability * 100 * 5);

        const breedList = petType === 'dog' ? DOG_BREEDS : CAT_BREEDS;
        if (!breedList.find(b => b.name === formattedName)) {
            breedList.push({
                name: formattedName,
                size: 'Variable',
                life: '10-15 years',
                temperament: 'Identified by AI Model',
                origin: 'Unknown',
                group: 'AI Detected',
                care: ['Routine veterinary visits', 'Regular exercise and balanced diet', 'Standard grooming based on coat type', 'Mental stimulation and training'],
                colorProfile: { brightness: 'medium', warmth: 'neutral', contrast: 'medium' }
            });
        }
    }
  }

  // Normalize to valid percentages
  const total = Object.values(scores).reduce((a, b) => a + b, 0);
  Object.keys(scores).forEach(k => { scores[k] = Math.round((scores[k] / total) * 100); });

  // Fix rounding to ensure exactly 100%
  const diff = 100 - Object.values(scores).reduce((a, b) => a + b, 0);
  const topBreed = Object.keys(scores).sort((a, b) => scores[b] - scores[a])[0];
  scores[topBreed] += diff;

  return scores;
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
    const canvas = document.getElementById('pet-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const maxW = 300, maxH = 300;
    let w = img.width, h = img.height;
    if (w > maxW) { h = h * maxW / w; w = maxW; }
    if (h > maxH) { w = w * maxH / h; h = maxH; }
    canvas.width = w; canvas.height = h;
    ctx.drawImage(img, 0, 0, w, h);

    document.getElementById('upload-area')?.classList.add('hidden');
    document.getElementById('results')?.classList.remove('hidden');
    const badge = document.getElementById('breed-badge');
    if (badge) {
      badge.textContent = 'Analyzing...';
      badge.style.background = '';
    }

    setTimeout(() => {
      identifyFromImage(canvas);
    }, 800);
  };
  img.src = src;
}

async function identifyFromImage(canvas) {
  const hash = getImageHash(canvas);
  let predictions = null;

  if (mobilenetModel) {
    try {
      predictions = await mobilenetModel.classify(canvas, 5);
      console.log('MobileNet Predictions:', predictions);
    } catch (e) {
      console.error('MobileNet classification error:', e);
    }
  }

  // ✅ HUMAN/NON-PET DETECTION GUARD
  if (predictions) {
    if (isHumanImage(predictions)) {
      showNoPetDetected('Human face detected. Please upload a photo of a dog or cat.');
      return;
    }
    if (isNonPetImage(predictions)) {
      showNoPetDetected('No animal detected in this image. Please upload a pet photo.');
      return;
    }
  }

  const scores = identifyBreed(predictions, hash);
  finalizeResults(scores);
}

function finalizeResults(scores) {
  if (typeof document === 'undefined') return;
  const topBreed = Object.keys(scores).sort((a, b) => scores[b] - scores[a])[0];
  const badge = document.getElementById('breed-badge');
  const conf = document.getElementById('confidence-text');
  if (badge) { badge.textContent = topBreed; badge.style.background = ''; }
  if (conf) conf.textContent = `${scores[topBreed]}% confidence`;
  renderBreedBars(scores, topBreed);
  renderBreedInfo(topBreed);
}

function renderBreedBars(scores, topBreed) {
  if (typeof document === 'undefined') return;
  const el = document.getElementById('breed-bars');
  if (!el) return;
  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  el.innerHTML = sorted.map(([breed, pct]) =>
    `<div class="bar-item"><div class="bar-label"><span class="bar-name">${breed}</span><span class="bar-pct">${pct}%</span></div><div class="bar-track"><div class="bar-fill ${breed === topBreed ? 'top' : ''}" style="width:${pct}%"></div></div></div>`
  ).join('');
}

function renderBreedInfo(breedName) {
  if (typeof document === 'undefined') return;
  const breeds = petType === 'dog' ? DOG_BREEDS : CAT_BREEDS;
  const breed = breeds.find(b => b.name === breedName);
  if (!breed) return;
  const infoEl = document.getElementById('breed-info');
  const tipsEl = document.getElementById('care-tips');
  if (infoEl) {
    infoEl.innerHTML = ['Size','Life Span','Temperament','Origin','Group'].map(label => {
      const key = label === 'Life Span' ? 'life' : label.toLowerCase();
      return `<div class="info-row"><span class="info-label">${label}</span><span>${breed[key]}</span></div>`;
    }).join('');
  }
  if (tipsEl) tipsEl.innerHTML = breed.care.map(t => `<li>${t}</li>`).join('');
}

function resetAnalysis() {
  if (typeof document === 'undefined') return;
  document.getElementById('upload-area')?.classList.remove('hidden');
  document.getElementById('results')?.classList.add('hidden');
  const fileInput = document.getElementById('file-input');
  if (fileInput) fileInput.value = '';
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    DOG_BREEDS, CAT_BREEDS, HUMAN_KEYWORDS, NON_PET_KEYWORDS,
    setPetType, getImageHash, identifyBreed, isHumanImage, isNonPetImage,
    renderBreedBars, renderBreedInfo, resetAnalysis, handleUpload, analyzeImage,
    identifyFromImage, finalizeResults, loadAIModel, showNoPetDetected,
    getPetType: () => petType,
    setPetTypeVal: t => { petType = t; }
  };
}
