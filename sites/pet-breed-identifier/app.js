/**
 * Pet Breed Identifier — Core Logic
 * Simulated breed detection using image hash
 */
const DOG_BREEDS = [
  { name: 'Golden Retriever', size: 'Large', life: '10-12 years', temperament: 'Friendly, Reliable, Trustworthy', origin: 'Scotland', group: 'Sporting', care: ['Regular brushing 2-3x/week', 'Daily exercise (1-2 hours)', 'Prone to hip dysplasia — regular vet checks', 'Love swimming — great for water activities'] },
  { name: 'Labrador Retriever', size: 'Large', life: '10-12 years', temperament: 'Outgoing, Active, Gentle', origin: 'Canada', group: 'Sporting', care: ['Easy to groom, weekly brushing', 'Very active — needs lots of exercise', 'Watch diet — prone to obesity', 'Great with families and children'] },
  { name: 'German Shepherd', size: 'Large', life: '9-13 years', temperament: 'Courageous, Confident, Smart', origin: 'Germany', group: 'Herding', care: ['Heavy shedding — brush daily', 'Mental stimulation needed', 'Training early is essential', 'Prone to joint issues'] },
  { name: 'French Bulldog', size: 'Small', life: '10-12 years', temperament: 'Playful, Adaptable, Smart', origin: 'France', group: 'Non-Sporting', care: ['Minimal exercise needs', 'Clean facial wrinkles daily', 'Sensitive to heat', 'Short walks preferred'] },
  { name: 'Poodle', size: 'Medium', life: '12-15 years', temperament: 'Intelligent, Active, Alert', origin: 'Germany/France', group: 'Non-Sporting', care: ['Professional grooming every 6-8 weeks', 'Hypoallergenic — minimal shedding', 'Highly trainable', 'Regular dental care needed'] },
  { name: 'Beagle', size: 'Small-Medium', life: '12-15 years', temperament: 'Merry, Friendly, Curious', origin: 'England', group: 'Hound', care: ['Moderate exercise daily', 'Prone to weight gain', 'Strong nose — keep on leash outdoors', 'Regular ear cleaning needed'] },
  { name: 'Siberian Husky', size: 'Medium-Large', life: '12-14 years', temperament: 'Outgoing, Mischievous, Loyal', origin: 'Siberia', group: 'Working', care: ['Very heavy shedding twice yearly', 'Needs extensive exercise', 'Escape artists — secure fencing needed', 'Do well in cold climates'] },
  { name: 'Corgi', size: 'Small', life: '12-15 years', temperament: 'Affectionate, Smart, Alert', origin: 'Wales', group: 'Herding', care: ['Moderate exercise daily', 'Watch for back issues', 'Double coat — regular brushing', 'Mental stimulation important'] },
];

const CAT_BREEDS = [
  { name: 'Persian', size: 'Medium', life: '12-17 years', temperament: 'Quiet, Sweet, Gentle', origin: 'Iran', group: 'Longhair', care: ['Daily brushing required', 'Clean eyes regularly', 'Indoor living preferred', 'Regular dental care'] },
  { name: 'Maine Coon', size: 'Large', life: '12-15 years', temperament: 'Gentle, Intelligent, Playful', origin: 'USA', group: 'Longhair', care: ['Brush 2-3x/week', 'Provide climbing spaces', 'Regular vet checkups', 'Love interactive toys'] },
  { name: 'Siamese', size: 'Medium', life: '15-20 years', temperament: 'Social, Vocal, Affectionate', origin: 'Thailand', group: 'Shorthair', care: ['Minimal grooming needed', 'Needs lots of attention', 'Interactive play daily', 'Can be trained to fetch'] },
  { name: 'British Shorthair', size: 'Medium-Large', life: '12-20 years', temperament: 'Calm, Patient, Easy-going', origin: 'UK', group: 'Shorthair', care: ['Weekly brushing sufficient', 'Watch weight — prone to obesity', 'Moderate exercise needs', 'Independent but affectionate'] },
  { name: 'Bengal', size: 'Medium-Large', life: '12-16 years', temperament: 'Energetic, Playful, Intelligent', origin: 'USA', group: 'Shorthair', care: ['Minimal grooming', 'Very active — needs play space', 'Love water and climbing', 'Mental stimulation essential'] },
  { name: 'Ragdoll', size: 'Large', life: '12-15 years', temperament: 'Docile, Calm, Affectionate', origin: 'USA', group: 'Longhair', care: ['Regular brushing', 'Indoor cat recommended', 'Gentle handling preferred', 'Loves to be held'] },
  { name: 'Scottish Fold', size: 'Medium', life: '11-15 years', temperament: 'Sweet, Quiet, Adaptable', origin: 'Scotland', group: 'Shorthair', care: ['Easy grooming', 'Check ear folds for issues', 'Moderate exercise', 'Great apartment cat'] },
  { name: 'Sphynx', size: 'Medium', life: '12-14 years', temperament: 'Lively, Friendly, Energetic', origin: 'Canada', group: 'Hairless', care: ['Weekly baths needed', 'Keep warm in cold weather', 'Clean ears regularly', 'Sunscreen for outdoor time'] },
];

let petType = 'dog';
let ml5Classifier = null;
let ml5Loaded = false;

function setPetType(type) {
  petType = type;
  if (typeof document === 'undefined') return;
  document.querySelectorAll('.pet-btn').forEach(b => { b.classList.remove('active'); b.classList.remove('btn-primary'); b.classList.add('btn-secondary'); });
  const btn = document.getElementById(`btn-${type}`);
  if (btn) { btn.classList.add('active'); btn.classList.remove('btn-secondary'); btn.classList.add('btn-primary'); }
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

function identifyBreed(hash) {
  const breeds = petType === 'dog' ? DOG_BREEDS : CAT_BREEDS;
  const scores = {};
  let total = 0;
  breeds.forEach((b, i) => { const raw = ((hash * (i + 3) * 13 + i * 29) % 100 + 5); scores[b.name] = raw; total += raw; });
  Object.keys(scores).forEach(k => { scores[k] = Math.round((scores[k] / total) * 100); });
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
    if (badge) badge.textContent = "Analyzing ML Model...";

    if (typeof window !== 'undefined' && window.ml5) {
      if (!ml5Classifier) {
        ml5Classifier = ml5.imageClassifier('MobileNet', () => {
          ml5Loaded = true;
          ml5Classifier.classify(canvas, (err, results) => {
            if (err || !results) return fallbackIdentify(canvas);
            processMLResults(results);
          });
        });
      } else if (ml5Loaded) {
        ml5Classifier.classify(canvas, (err, results) => {
          if (err || !results) return fallbackIdentify(canvas);
          processMLResults(results);
        });
      } else {
        fallbackIdentify(canvas);
      }
    } else {
      fallbackIdentify(canvas);
    }
  };
  img.src = src;
}

function fallbackIdentify(canvas) {
    const hash = getImageHash(canvas);
    const scores = identifyBreed(hash);
    finalizeResults(scores);
}

function processMLResults(results) {
  const breeds = petType === 'dog' ? DOG_BREEDS : CAT_BREEDS;
  const scores = {};
  breeds.forEach(b => scores[b.name] = Math.floor(Math.random() * 10) + 1);
  
  for (let res of results) {
    let l = res.label.toLowerCase();
    for (let b of breeds) {
      if (l.includes(b.name.toLowerCase()) || b.name.toLowerCase().includes(l.split(',')[0])) {
         scores[b.name] += Math.round(res.confidence * 80);
      }
    }
  }
  
  let total = Object.values(scores).reduce((a,b)=>a+b,0);
  Object.keys(scores).forEach(k => scores[k] = Math.round((scores[k]/total)*100));
  
  const diff = 100 - Object.values(scores).reduce((a, b) => a + b, 0);
  const topBreed = Object.keys(scores).sort((a, b) => scores[b] - scores[a])[0];
  scores[topBreed] += diff;
  finalizeResults(scores);
}

function finalizeResults(scores) {
  const topBreed = Object.keys(scores).sort((a, b) => scores[b] - scores[a])[0];
  const badge = document.getElementById('breed-badge');
  const conf = document.getElementById('confidence-text');
  if (badge) badge.textContent = topBreed;
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
    DOG_BREEDS, CAT_BREEDS, setPetType, getImageHash, identifyBreed, 
    renderBreedBars, renderBreedInfo, resetAnalysis, handleUpload, analyzeImage,
    getPetType: () => petType, 
    setPetTypeVal: t => { petType = t; } 
  };
}
