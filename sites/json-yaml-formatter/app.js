/**
 * Formatter & Validator Core Logic using js-yaml
 * Enhanced: Tab auto-fix, Diff View, pure processData, better error messages
 */

// --- Pure Logic (Testable, DOM-free) ---

/**
 * Sanitize YAML input by replacing leading tabs with spaces
 * YAML spec (1.1/1.2) forbids tab characters for indentation.
 * This converts tab-indented input to 2-space indent before parsing.
 * @param {string} str
 * @returns {{ sanitized: string, hadTabs: boolean }}
 */
function sanitizeYamlInput(str) {
  if (typeof str !== 'string') return { sanitized: '', hadTabs: false };
  let hadTabs = false;
  const sanitized = str.split('\n').map(line => {
    // Count leading tabs and replace each with 2 spaces
    const match = line.match(/^(\t+)/);
    if (match) {
      hadTabs = true;
      return '  '.repeat(match[1].length) + line.slice(match[1].length);
    }
    return line;
  }).join('\n');
  return { sanitized, hadTabs };
}

/**
 * Parse input string based on type
 * @param {string} inputStr
 * @param {string} inputType - 'json' | 'yaml' | 'xml' | 'auto'
 * @param {object} yamlLib - js-yaml library (injectable for testing)
 * @returns {{ parsed: any, detectedType: string, error: string|null, notice: string|null }}
 */
function parseInput(inputStr, inputType, yamlLib) {
  let parsed = null;
  let detectedType = inputType;
  let error = null;
  let notice = null;

  try {
    if (inputType === 'auto') {
      const trimmed = inputStr.trim();
      if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
        parsed = JSON.parse(inputStr);
        detectedType = 'json';
      } else if (trimmed.startsWith('<')) {
        detectedType = 'xml';
        const parser = new DOMParser();
        const dom = parser.parseFromString(inputStr, 'application/xml');
        if (dom.querySelector('parsererror')) throw new Error('Invalid XML Syntax');
        parsed = inputStr;
      } else {
        // Try YAML — auto-sanitize tabs first
        const { sanitized, hadTabs } = sanitizeYamlInput(inputStr);
        if (hadTabs) notice = '⚠️ Tab indentation replaced with spaces for YAML compatibility.';
        parsed = yamlLib.load(sanitized);
        detectedType = 'yaml';
      }
    } else if (inputType === 'json') {
      parsed = JSON.parse(inputStr);
    } else if (inputType === 'yaml') {
      const { sanitized, hadTabs } = sanitizeYamlInput(inputStr);
      if (hadTabs) notice = '⚠️ Tab indentation replaced with spaces for YAML compatibility.';
      parsed = yamlLib.load(sanitized);
    } else if (inputType === 'xml') {
      const parser = new DOMParser();
      const dom = parser.parseFromString(inputStr, 'application/xml');
      const parseErr = dom.querySelector('parsererror');
      if (parseErr) throw new Error(parseErr.textContent || 'Invalid XML');
      parsed = inputStr;
    }
  } catch (e) {
    error = e.message;
  }

  return { parsed, detectedType, error, notice };
}

/**
 * Format parsed data to output string
 * @param {any} parsed
 * @param {string} detectedType - 'json' | 'yaml' | 'xml'
 * @param {string} outputType - 'json' | 'yaml' | 'min' | 'xml'
 * @param {string} rawInput - original string (needed for xml passthrough)
 * @param {object} yamlLib - js-yaml library
 * @returns {{ outStr: string, langClass: string }}
 */
function formatOutput(parsed, detectedType, outputType, rawInput, yamlLib) {
  let outStr = '';
  let langClass = 'language-json';

  if (detectedType === 'xml') {
    outStr = rawInput.replace(/>(<)(\/*)(\\w)/g, '>\n$1$2$3');
    langClass = 'language-markup';
  } else {
    if (outputType === 'json') {
      outStr = JSON.stringify(parsed, null, 2);
      langClass = 'language-json';
    } else if (outputType === 'yaml') {
      outStr = yamlLib.dump(parsed, { lineWidth: -1, noRefs: true });
      langClass = 'language-yaml';
    } else if (outputType === 'min') {
      outStr = JSON.stringify(parsed);
      langClass = 'language-json';
    }
  }

  return { outStr, langClass };
}

/**
 * Generate a simple diff between two strings
 * Returns HTML string showing differences
 * @param {string} textA
 * @param {string} textB
 * @returns {string} HTML diff
 */
function generateDiff(textA, textB) {
  const linesA = textA.split('\n');
  const linesB = textB.split('\n');
  const maxLen = Math.max(linesA.length, linesB.length);

  let html = '';
  for (let i = 0; i < maxLen; i++) {
    const a = linesA[i] !== undefined ? linesA[i] : '';
    const b = linesB[i] !== undefined ? linesB[i] : '';

    if (a === b) {
      html += `<div class="diff-same">${escapeHtml(a)}</div>`;
    } else if (a && !b) {
      html += `<div class="diff-removed">- ${escapeHtml(a)}</div>`;
    } else if (!a && b) {
      html += `<div class="diff-added">+ ${escapeHtml(b)}</div>`;
    } else {
      html += `<div class="diff-removed">- ${escapeHtml(a)}</div>`;
      html += `<div class="diff-added">+ ${escapeHtml(b)}</div>`;
    }
  }
  return html;
}

/**
 * Escape HTML entities for safe display
 */
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// --- DOM Functions ---

function processData() {
  const rawInput = document.getElementById('raw-input');
  const inputTypeEl = document.getElementById('input-type');
  const outputTypeEl = document.getElementById('output-type');
  const outputEl = document.getElementById('formatted-output');
  const errorBox = document.getElementById('error-box');
  const noticeBox = document.getElementById('notice-box');
  const statusLabel = document.getElementById('status-label');

  if (!rawInput || !outputEl) return;

  const inputStr = rawInput.value.trim();
  const inputType = inputTypeEl ? inputTypeEl.value : 'json';
  const outputType = outputTypeEl ? outputTypeEl.value : 'json';

  if (!inputStr) {
    outputEl.innerHTML = '';
    if (errorBox) errorBox.classList.add('hidden');
    if (noticeBox) noticeBox.classList.add('hidden');
    if (statusLabel) { statusLabel.textContent = 'Empty'; statusLabel.className = 'status-empty'; }
    return;
  }

  const yamlLib = (typeof jsyaml !== 'undefined') ? jsyaml : (typeof global !== 'undefined' ? global.jsyaml : null);
  if (!yamlLib) { showFormatterError(errorBox, statusLabel, 'js-yaml library not loaded'); return; }

  const { parsed, detectedType, error, notice } = parseInput(inputStr, inputType, yamlLib);

  if (error) {
    showFormatterError(errorBox, statusLabel, `Parse Error: ${error}`);
    if (noticeBox) noticeBox.classList.add('hidden');
    return;
  }

  if (errorBox) errorBox.classList.add('hidden');

  // Show notice if tabs were auto-fixed
  if (noticeBox) {
    if (notice) {
      noticeBox.textContent = notice;
      noticeBox.classList.remove('hidden');
    } else {
      noticeBox.classList.add('hidden');
    }
  }

  if (statusLabel) {
    statusLabel.textContent = `✅ Valid ${detectedType.toUpperCase()}`;
    statusLabel.className = 'status-valid';
  }

  const { outStr, langClass } = formatOutput(parsed, detectedType, outputType, inputStr, yamlLib);
  outputEl.textContent = outStr;
  outputEl.className = langClass;

  if (typeof window !== 'undefined' && window.Prism) {
    window.Prism.highlightElement(outputEl);
  }
}

function showFormatterError(errorBox, statusLabel, msg) {
  if (errorBox) { errorBox.textContent = '❌ ' + msg; errorBox.classList.remove('hidden'); }
  if (statusLabel) { statusLabel.textContent = 'Invalid'; statusLabel.className = 'status-error'; }
}

function copyOutput() {
  const el = document.getElementById('formatted-output');
  const text = el ? el.textContent : '';
  if (!text) return;
  navigator.clipboard.writeText(text).catch(() => {});
  const btn = document.getElementById('copy-btn');
  if (btn) {
    btn.textContent = '✅ Copied!';
    setTimeout(() => { btn.textContent = '📋 Copy'; }, 2000);
  }
}

function toggleDiffView() {
  const diffPanel = document.getElementById('diff-panel');
  if (!diffPanel) return;
  diffPanel.classList.toggle('hidden');
}

function runDiff() {
  const a = document.getElementById('diff-input-a')?.value || '';
  const b = document.getElementById('diff-input-b')?.value || '';
  const result = document.getElementById('diff-result');
  if (result) result.innerHTML = generateDiff(a, b);
}

if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    const rawInput = document.getElementById('raw-input');
    if (rawInput) rawInput.addEventListener('input', processData);
  });
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    processData, copyOutput, parseInput, formatOutput, generateDiff,
    escapeHtml, toggleDiffView, runDiff, sanitizeYamlInput
  };
}
