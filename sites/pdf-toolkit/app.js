/**
 * PDF Toolkit Core Logic utilizing pdf-lib
 * Enhanced: page range selection UI, drag reorder, parsePageRange, visual page picker
 */

let mergeFiles = [];
let splitFile = null;
let splitPageCount = 0;

// --- Pure Logic ---

/**
 * Filter files to only PDFs
 * @param {File[]} files
 * @returns {File[]}
 */
function filterPdfFiles(files) {
  return Array.from(files || []).filter(f => f.type === 'application/pdf' || f.name.endsWith('.pdf'));
}

/**
 * Move item in array (for drag reorder)
 * @param {any[]} arr
 * @param {number} fromIdx
 * @param {number} toIdx
 * @returns {any[]} new array
 */
function moveItem(arr, fromIdx, toIdx) {
  const result = [...arr];
  const [item] = result.splice(fromIdx, 1);
  result.splice(toIdx, 0, item);
  return result;
}

/**
 * Format file count label
 * @param {number} count
 * @returns {string}
 */
function formatFileCount(count) {
  if (count === 0) return 'No files selected';
  if (count === 1) return '1 PDF selected';
  return `${count} PDFs selected`;
}

/**
 * Parse a page range string into a sorted array of 0-indexed page numbers.
 * Supports comma-separated values and ranges e.g. "1, 3, 5-7" → [0, 2, 4, 5, 6]
 * @param {string} str - user input like "1, 3, 5-7"
 * @param {number} total - total page count for bounds checking
 * @returns {number[]} sorted unique 0-indexed page indices
 */
function parsePageRange(str, total) {
  if (!str || !str.trim()) {
    // Empty = all pages
    return Array.from({ length: total }, (_, i) => i);
  }

  const indices = new Set();
  const parts = str.split(',');

  for (const part of parts) {
    const trimmed = part.trim();
    const rangeMatch = trimmed.match(/^(\d+)\s*[-–]\s*(\d+)$/);
    if (rangeMatch) {
      const start = parseInt(rangeMatch[1], 10);
      const end = parseInt(rangeMatch[2], 10);
      for (let i = start; i <= end; i++) {
        if (i >= 1 && i <= total) indices.add(i - 1); // convert to 0-indexed
      }
    } else {
      const num = parseInt(trimmed, 10);
      if (!isNaN(num) && num >= 1 && num <= total) {
        indices.add(num - 1); // convert to 0-indexed
      }
    }
  }

  return [...indices].sort((a, b) => a - b);
}

// --- DOM Functions ---

function resetFiles() {
  mergeFiles = [];
  splitFile = null;
  splitPageCount = 0;
}

function switchMode(mode) {
  const tabMerge = document.getElementById('tab-merge');
  const tabSplit = document.getElementById('tab-split');
  const modeMerge = document.getElementById('mode-merge');
  const modeSplit = document.getElementById('mode-split');
  const status = document.getElementById('processing-status');

  if (tabMerge) tabMerge.className = mode === 'merge' ? 'btn btn-primary active' : 'btn btn-secondary';
  if (tabSplit) tabSplit.className = mode === 'split' ? 'btn btn-primary active' : 'btn btn-secondary';
  if (modeMerge) modeMerge.classList.toggle('hidden', mode !== 'merge');
  if (modeSplit) modeSplit.classList.toggle('hidden', mode !== 'split');
  if (status) status.classList.add('hidden');
}

function handleMergeUpload(event) {
  const files = filterPdfFiles(event?.target?.files);
  if (files.length === 0) return;
  mergeFiles = mergeFiles.concat(files);
  renderMergeList();
}

function renderMergeList() {
  const list = document.getElementById('merge-list');
  const countEl = document.getElementById('merge-count');
  if (!list) return;

  list.innerHTML = mergeFiles.map((f, i) => `
    <div class="merge-item" draggable="true" data-index="${i}">
      <span class="drag-handle">⠿</span>
      <span class="file-name">${f.name}</span>
      <span class="file-size">${(f.size / 1024).toFixed(1)}KB</span>
      <button class="remove-btn" onclick="removeMergeFile(${i})">✖</button>
    </div>
  `).join('');

  if (countEl) countEl.textContent = formatFileCount(mergeFiles.length);

  const btn = document.getElementById('do-merge-btn');
  if (btn) btn.classList.toggle('hidden', mergeFiles.length < 2);
}

function removeMergeFile(idx) {
  mergeFiles.splice(idx, 1);
  renderMergeList();
}

function reorderMergeFiles(fromIdx, toIdx) {
  mergeFiles = moveItem(mergeFiles, fromIdx, toIdx);
  renderMergeList();
}

/**
 * Handle split file upload — reveals the split UI with page selection
 */
async function handleSplitUpload(event) {
  const file = event?.target?.files?.[0];
  if (!file || !filterPdfFiles([file]).length) return;
  splitFile = file;

  // Show loading state
  const splitDrop = document.getElementById('split-drop');
  if (splitDrop) splitDrop.classList.add('hidden');

  const splitFileInfo = document.getElementById('split-file-info');
  if (splitFileInfo) splitFileInfo.textContent = `📄 ${file.name} (${(file.size / 1024).toFixed(1)}KB)`;

  // Try to get actual page count if pdf-lib is available
  const splitUi = document.getElementById('split-ui');
  const pageCountEl = document.getElementById('split-page-count-info');

  try {
    const PDFLibObj = typeof PDFLib !== 'undefined' ? PDFLib : (typeof global !== 'undefined' && global.PDFLib ? global.PDFLib : null);
    if (PDFLibObj && file.arrayBuffer) {
      const buf = await file.arrayBuffer();
      const pdfDoc = await PDFLibObj.PDFDocument.load(buf);
      splitPageCount = pdfDoc.getPageCount();
      if (pageCountEl) pageCountEl.textContent = `${splitPageCount} pages total — leave blank to extract all`;
    }
  } catch (e) {
    splitPageCount = 0;
    if (pageCountEl) pageCountEl.textContent = 'Leave blank to extract all pages';
  }

  // ✅ CRITICAL FIX: Reveal the split UI (was always hidden)
  if (splitUi) splitUi.classList.remove('hidden');

  const btn = document.getElementById('do-split-btn');
  if (btn) btn.classList.remove('hidden');
}

async function executeMerge() {
  if (mergeFiles.length < 2) return;

  const PDFLibObj = typeof PDFLib !== 'undefined' ? PDFLib : (typeof global !== 'undefined' && global.PDFLib ? global.PDFLib : null);
  if (!PDFLibObj) return;

  const status = document.getElementById('processing-status');
  if (status) { status.textContent = '🔄 Merging PDFs...'; status.classList.remove('hidden'); }

  try {
    const { PDFDocument } = PDFLibObj;
    const mergedPdf = await PDFDocument.create();

    for (const file of mergeFiles) {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const copiedPages = await mergedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
      copiedPages.forEach(page => mergedPdf.addPage(page));
    }

    const pdfBytes = await mergedPdf.save();
    downloadBlob(new Blob([pdfBytes], { type: 'application/pdf' }), `merged-${Date.now()}.pdf`);
    if (status) { status.textContent = '✅ Merged successfully!'; }

  } catch (e) {
    console.error('PDF Merge error:', e);
    if (status) status.textContent = `❌ Error: ${e.message}`;
  }
}

/**
 * Split PDF by page range — reads split-pages input for range selection
 */
async function executeSplit() {
  if (!splitFile) return;

  const PDFLibObj = typeof PDFLib !== 'undefined' ? PDFLib : (typeof global !== 'undefined' && global.PDFLib ? global.PDFLib : null);
  if (!PDFLibObj) return;

  const status = document.getElementById('processing-status');
  const outputList = document.getElementById('output-list');
  const resultsEl = document.getElementById('split-results');
  const splitPagesInput = document.getElementById('split-pages');
  const pageRangeStr = splitPagesInput ? splitPagesInput.value.trim() : '';

  if (status) { status.textContent = '🔄 Splitting PDF...'; status.classList.remove('hidden'); }
  if (outputList) outputList.innerHTML = '';
  if (resultsEl) resultsEl.classList.remove('hidden');

  try {
    const { PDFDocument } = PDFLibObj;
    const arrayBuffer = await splitFile.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    const total = pdfDoc.getPageCount();

    // Parse user-specified page range or default to all pages
    const pageIndices = parsePageRange(pageRangeStr, total);

    if (pageIndices.length === 0) {
      if (status) status.textContent = '❌ No valid pages in range. Check your input.';
      return;
    }

    const splitCountEl = document.getElementById('split-page-count');
    if (splitCountEl) splitCountEl.textContent = `Extracting ${pageIndices.length} of ${total} pages`;

    for (const idx of pageIndices) {
      const newPdf = await PDFDocument.create();
      const [page] = await newPdf.copyPages(pdfDoc, [idx]);
      newPdf.addPage(page);
      const pdfBytes = await newPdf.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);

      if (outputList) {
        const item = document.createElement('div');
        item.className = 'split-item';
        item.innerHTML = `
          <span>📄 Page ${idx + 1}</span>
          <a href="${url}" download="page-${idx + 1}.pdf" class="btn btn-sm btn-primary">Download</a>
        `;
        outputList.appendChild(item);
      }
    }

    if (status) { status.textContent = `✅ Extracted ${pageIndices.length} page(s) successfully!`; }

  } catch (e) {
    console.error('PDF Split error:', e);
    if (status) status.textContent = `❌ Error: ${e.message}`;
  }
}

function downloadBlob(blob, filename) {
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    filterPdfFiles, moveItem, formatFileCount, parsePageRange,
    switchMode, handleMergeUpload, renderMergeList, removeMergeFile, reorderMergeFiles,
    handleSplitUpload, executeMerge, executeSplit, downloadBlob, resetFiles,
    setMergeFiles: (files) => { mergeFiles = files; },
    setSplitFile: (file) => { splitFile = file; },
    setSplitPageCount: (n) => { splitPageCount = n; },
    getMergeFiles: () => mergeFiles,
    getSplitFile: () => splitFile,
    getSplitPageCount: () => splitPageCount
  };
}
