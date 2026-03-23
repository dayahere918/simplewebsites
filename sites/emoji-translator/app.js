/**
 * Emoji Translator — Core Logic
 */

const EMOJI_MAP = {
  // Emotions
  happy: '😊', sad: '😢', angry: '😠', love: '❤️', heart: '❤️', laugh: '😂', cry: '😭',
  smile: '😄', wink: '😉', cool: '😎', scared: '😱', sick: '🤒', tired: '😴',
  thinking: '🤔', confused: '😕', surprised: '😮', excited: '🤩', worried: '😟',

  // People & Actions
  hello: '👋', hi: '👋', bye: '👋', yes: '👍', no: '👎', ok: '👌', please: '🙏',
  thanks: '🙏', thank: '🙏', sorry: '😔', run: '🏃', walk: '🚶', dance: '💃',
  sleep: '😴', eat: '🍽️', drink: '🥤', sing: '🎤', work: '💼', study: '📚',
  read: '📖', write: '✍️', think: '💭', talk: '💬', listen: '👂', look: '👀',
  see: '👀', watch: '👀', play: '🎮', win: '🏆', lose: '😞', fight: '👊',

  // Food & Drink
  pizza: '🍕', burger: '🍔', taco: '🌮', sushi: '🍣', rice: '🍚', noodle: '🍜',
  bread: '🍞', cake: '🎂', cookie: '🍪', ice: '🍦', candy: '🍬', chocolate: '🍫',
  fruit: '🍎', apple: '🍎', banana: '🍌', grape: '🍇', orange: '🍊', lemon: '🍋',
  watermelon: '🍉', strawberry: '🍓', peach: '🍑', tomato: '🍅',
  coffee: '☕', tea: '🍵', beer: '🍺', wine: '🍷', water: '💧', milk: '🥛',
  food: '🍽️', breakfast: '🥞', lunch: '🥪', dinner: '🍽️',

  // Animals
  dog: '🐕', cat: '🐈', bird: '🐦', fish: '🐟', horse: '🐴', cow: '🐄',
  pig: '🐷', monkey: '🐒', bear: '🐻', lion: '🦁', tiger: '🐯', rabbit: '🐰',
  mouse: '🐭', snake: '🐍', frog: '🐸', bee: '🐝', butterfly: '🦋',

  // Nature & Weather
  sun: '☀️', moon: '🌙', star: '⭐', cloud: '☁️', rain: '🌧️', snow: '❄️',
  wind: '💨', fire: '🔥', tree: '🌳', flower: '🌸', plant: '🌱', mountain: '⛰️',
  ocean: '🌊', beach: '🏖️', rainbow: '🌈', earth: '🌍', world: '🌍',

  // Objects
  car: '🚗', bus: '🚌', train: '🚆', plane: '✈️', rocket: '🚀', bike: '🚲',
  house: '🏠', home: '🏠', school: '🏫', hospital: '🏥', church: '⛪',
  phone: '📱', computer: '💻', camera: '📷', clock: '🕐', time: '⏰',
  money: '💰', dollar: '💵', diamond: '💎', gift: '🎁', key: '🔑', lock: '🔒',
  book: '📕', music: '🎵', movie: '🎬', game: '🎮', ball: '⚽', trophy: '🏆',

  // Concepts
  good: '👍', bad: '👎', great: '🎉', amazing: '🤩', beautiful: '✨',
  hot: '🔥', cold: '🥶', fast: '⚡', slow: '🐢', big: '🐘', small: '🐜',
  new: '✨', old: '📜', right: '✅', wrong: '❌', true: '✅', false: '❌',
  idea: '💡', magic: '✨', power: '💪', peace: '✌️', war: '⚔️',
  party: '🎉', birthday: '🎂', christmas: '🎄', wedding: '💒',

  // Common words → emoji
  i: '👤', me: '👤', you: '👉', we: '👥', they: '👥',
  and: '➕', the: '', a: '', is: '', are: '', was: '', were: '',
  to: '➡️', in: '📥', on: '🔛', at: '📍', for: '🔄', with: '🤝',
  not: '🚫', dont: '🚫', like: '👍', want: '🙏', need: '❗', have: '✋',
  go: '🏃', come: '🔜', get: '📥', give: '🎁', take: '✋', make: '🔨',
  know: '🧠', feel: '💓', day: '📅', night: '🌙', today: '📅', tomorrow: '🔜',
  morning: '🌅', evening: '🌆', up: '⬆️', down: '⬇️', left: '⬅️'
};

/**
 * Translate a single word to emoji
 * @param {string} word
 * @returns {string}
 */
function wordToEmoji(word) {
  if (typeof word !== 'string' || !word) return '';
  const clean = word.toLowerCase().replace(/[^a-z]/g, '');
  if (!clean) return word; // Keep punctuation as-is
  return EMOJI_MAP[clean] !== undefined ? EMOJI_MAP[clean] : word;
}

/**
 * Translate a full text to emojis
 * @param {string} text
 * @returns {string}
 */
function translateText(text) {
  if (typeof text !== 'string' || !text.trim()) return '';

  const words = text.split(/\s+/);
  const translated = words.map(word => {
    const emoji = wordToEmoji(word);
    return emoji;
  }).filter(w => w.length > 0);

  return translated.join(' ');
}

/**
 * Count characters in text
 * @param {string} text
 * @returns {number}
 */
function countChars(text) {
  if (typeof text !== 'string') return 0;
  return text.length;
}

/**
 * Count words in text
 * @param {string} text
 * @returns {number}
 */
function countWords(text) {
  if (typeof text !== 'string' || !text.trim()) return 0;
  return text.trim().split(/\s+/).length;
}

/**
 * Handle real-time translation
 */
function translate() {
  if (typeof document === 'undefined') return;
  const input = document.getElementById('text-input');
  const output = document.getElementById('emoji-output');
  const charCount = document.getElementById('char-count');
  if (!input) return;

  const text = input.value;
  const translated = translateText(text);

  if (output) {
    output.textContent = translated || '🔤 Start typing to see emojis...';
  }
  if (charCount) {
    charCount.textContent = `${countChars(text)} characters · ${countWords(text)} words`;
  }
}

/**
 * Copy emoji output to clipboard
 */
function copyOutput() {
  if (typeof document === 'undefined') return;
  const output = document.getElementById('emoji-output');
  if (!output) return;

  const text = output.textContent;
  if (typeof navigator !== 'undefined' && navigator.clipboard) {
    navigator.clipboard.writeText(text);
  }
}

/**
 * Clear all fields
 */
function clearAll() {
  if (typeof document === 'undefined') return;
  const input = document.getElementById('text-input');
  const output = document.getElementById('emoji-output');
  const charCount = document.getElementById('char-count');

  if (input) input.value = '';
  if (output) output.textContent = '🔤 Start typing to see emojis...';
  if (charCount) charCount.textContent = '0 characters';
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    EMOJI_MAP, wordToEmoji, translateText, countChars, countWords,
    translate, copyOutput, clearAll
  };
}
