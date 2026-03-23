/**
 * Mood Board Generator — Core Logic
 */
const THEMES = {
  'tropical paradise': { colors: ['#FF6B6B','#FFA07A','#FFD700','#00CED1','#20B2AA','#228B22'], fonts: ['Pacifico','Montserrat','Raleway'], keywords: ['beach','sunset','palm trees','ocean','vibrant','warm','turquoise','paradise','relaxation'], patterns: ['waves','palm fronds','coral'] },
  'cyberpunk neon': { colors: ['#FF00FF','#00FFFF','#FF1493','#7B68EE','#1a1a2e','#0d0d1a'], fonts: ['Orbitron','Rajdhani','Share Tech Mono'], keywords: ['neon','futuristic','dark','electric','glow','tech','circuit','dystopian','holographic'], patterns: ['grid','circuits','glitch'] },
  'minimalist zen': { colors: ['#F5F5DC','#D2B48C','#8B7D6B','#556B2F','#2F4F4F','#FFFFFF'], fonts: ['Quicksand','Lora','Nunito'], keywords: ['calm','simple','clean','nature','balance','harmony','serenity','space','elegance'], patterns: ['stone','ripple','bamboo'] },
  'vintage retro': { colors: ['#CD853F','#DEB887','#D2691E','#8B4513','#DAA520','#F4A460'], fonts: ['Playfair Display','Cormorant','Libre Baskerville'], keywords: ['antique','nostalgic','warm','classic','rustic','aged','film','grain','timeless'], patterns: ['grain','halftone','lace'] },
  'forest nature': { colors: ['#228B22','#006400','#32CD32','#8FBC8F','#2E8B57','#3CB371'], fonts: ['Merriweather','Source Serif Pro','Bitter'], keywords: ['trees','leaves','moss','earthy','organic','growth','wild','fresh','woodland'], patterns: ['leaves','bark','stream'] },
  'space galaxy': { colors: ['#0B0B45','#1B1B6F','#6A0DAD','#9B59B6','#00CED1','#FFD700'], fonts: ['Space Mono','Exo 2','Barlow'], keywords: ['stars','nebula','cosmic','infinite','dark','ethereal','celestial','aurora','orbit'], patterns: ['stars','nebula','rings'] },
  'ocean sunset': { colors: ['#FF4500','#FF6347','#FF8C00','#1E90FF','#4169E1','#000080'], fonts: ['Josefin Sans','Open Sans','Poppins'], keywords: ['horizon','waves','golden hour','tranquil','gradient','warm','reflections','sky','glow'], patterns: ['waves','clouds','horizon'] },
};

function getThemeData(input) {
  if (!input) return null;
  const key = input.toLowerCase().trim();
  for (const [k, v] of Object.entries(THEMES)) {
    if (key.includes(k) || k.includes(key)) return { name: input, ...v };
  }
  // Generate a pseudo-random theme from input
  const hash = key.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const allColors = Object.values(THEMES).flatMap(t => t.colors);
  const allFonts = [...new Set(Object.values(THEMES).flatMap(t => t.fonts))];
  const colors = [];
  for (let i = 0; i < 6; i++) colors.push(allColors[(hash + i * 7) % allColors.length]);
  const fonts = [allFonts[hash % allFonts.length], allFonts[(hash + 3) % allFonts.length], allFonts[(hash + 7) % allFonts.length]];
  const keywords = key.split(/\s+/).concat(['creative','inspiration','mood','design','aesthetic']);
  return { name: input, colors, fonts, keywords, patterns: ['abstract','texture','gradient'] };
}

function generateGradient(colors, idx) {
  const c1 = colors[idx % colors.length];
  const c2 = colors[(idx + 1) % colors.length];
  const angle = (idx * 45) % 360;
  return `linear-gradient(${angle}deg, ${c1}, ${c2})`;
}

function generateBoard() {
  if (typeof document === 'undefined') return;
  const input = document.getElementById('theme-input')?.value;
  if (!input) return;
  const theme = getThemeData(input);
  if (!theme) return;
  renderBoard(theme);
}

function quickGenerate(name) {
  if (typeof document === 'undefined') return;
  const input = document.getElementById('theme-input');
  if (input) input.value = name;
  const theme = getThemeData(name);
  if (theme) renderBoard(theme);
}

function renderBoard(theme) {
  if (typeof document === 'undefined') return;
  const container = document.getElementById('board-container');
  const grid = document.getElementById('board-grid');
  const paletteRow = document.getElementById('palette-row');
  const fontSuggestions = document.getElementById('font-suggestions');
  const keywordTags = document.getElementById('keyword-tags');
  if (container) container.classList.remove('hidden');

  // Board tiles
  if (grid) {
    const tiles = [];
    const layouts = ['', 'span-2', '', 'tall', '', '', 'span-2', ''];
    for (let i = 0; i < 8; i++) {
      const bg = generateGradient(theme.colors, i);
      const cls = layouts[i] || '';
      const label = theme.keywords[i % theme.keywords.length] || '';
      tiles.push(`<div class="board-tile ${cls}" style="background:${bg}"><div class="tile-text">${label}</div></div>`);
    }
    grid.innerHTML = tiles.join('');
  }

  // Palette
  if (paletteRow) {
    paletteRow.innerHTML = theme.colors.map(c =>
      `<div class="palette-color" style="background:${c}" onclick="navigator.clipboard?.writeText('${c}')"><span class="hex-label">${c}</span></div>`
    ).join('');
  }

  // Fonts
  if (fontSuggestions) {
    fontSuggestions.innerHTML = theme.fonts.map(f =>
      `<div class="font-sample"><div class="font-name">${f}</div><div class="font-preview" style="font-family:'${f}',sans-serif">The quick brown fox jumps over the lazy dog</div></div>`
    ).join('');
  }

  // Keywords
  if (keywordTags) {
    keywordTags.innerHTML = theme.keywords.map(k => `<span class="keyword-tag">${k}</span>`).join('');
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { THEMES, getThemeData, generateGradient, generateBoard, quickGenerate, renderBoard };
}
