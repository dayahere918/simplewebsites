/**
 * PDF Toolkit Core Logic utilizing pdf-lib
 * Enhanced: page count display, drag reorder, handleSplitUpload export, resetFiles
 */

let mergeFiles = [];
let splitFile = null;

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

// --- DOM Functions ---

function resetFiles() {
    mergeFiles = [];
    splitFile = null;
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

function handleSplitUpload(event) {
    const file = event?.target?.files?.[0];
    if (!file || !filterPdfFiles([file]).length) return;
    splitFile = file;
    const info = document.getElementById('split-file-info');
    if (info) info.textContent = `📄 ${file.name} (${(file.size / 1024).toFixed(1)}KB)`;
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

async function executeSplit() {
    if (!splitFile) return;

    const PDFLibObj = typeof PDFLib !== 'undefined' ? PDFLib : (typeof global !== 'undefined' && global.PDFLib ? global.PDFLib : null);
    if (!PDFLibObj) return;

    const status = document.getElementById('processing-status');
    if (status) { status.textContent = '🔄 Splitting PDF...'; status.classList.remove('hidden'); }

    try {
        const { PDFDocument } = PDFLibObj;
        const arrayBuffer = await splitFile.arrayBuffer();
        const pdfDoc = await PDFDocument.load(arrayBuffer);
        const pageCount = pdfDoc.getPageCount();

        const list = document.getElementById('output-list');
        const results = document.getElementById('results');
        if (list) list.innerHTML = '';
        if (results) results.classList.remove('hidden');

        const pageCountEl = document.getElementById('split-page-count');
        if (pageCountEl) pageCountEl.textContent = `${pageCount} pages found`;

        for (let i = 0; i < pageCount; i++) {
            const newPdf = await PDFDocument.create();
            const [page] = await newPdf.copyPages(pdfDoc, [i]);
            newPdf.addPage(page);
            const pdfBytes = await newPdf.save();
            const blob = new Blob([pdfBytes], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);

            if (list) {
                const item = document.createElement('div');
                item.className = 'split-item';
                item.innerHTML = `
                    <span>📄 Page ${i + 1}</span>
                    <a href="${url}" download="page-${i + 1}.pdf" class="btn btn-sm btn-primary">Download</a>
                `;
                list.appendChild(item);
            }
        }

        if (status) { status.textContent = `✅ Split into ${pageCount} pages!`; }

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
        filterPdfFiles, moveItem, formatFileCount,
        switchMode, handleMergeUpload, renderMergeList, removeMergeFile, reorderMergeFiles,
        handleSplitUpload, executeMerge, executeSplit, downloadBlob, resetFiles,
        setMergeFiles: (files) => { mergeFiles = files; },
        setSplitFile: (file) => { splitFile = file; },
        getMergeFiles: () => mergeFiles,
        getSplitFile: () => splitFile
    };
}
