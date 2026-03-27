/**
 * PDF Toolkit Core Logic utilizing pdf-lib
 */

let mergeFiles = [];
let splitFile = null;

function switchMode(mode) {
    document.getElementById('tab-merge').className = mode === 'merge' ? 'btn btn-primary active' : 'btn btn-secondary';
    document.getElementById('tab-split').className = mode === 'split' ? 'btn btn-primary active' : 'btn btn-secondary';
    
    document.getElementById('mode-merge').classList.toggle('hidden', mode !== 'merge');
    document.getElementById('mode-split').classList.toggle('hidden', mode !== 'split');
    document.getElementById('processing-status').classList.add('hidden');
}

function handleMergeUpload(event) {
    const files = Array.from(event.target.files).filter(f => f.type === 'application/pdf');
    if (files.length === 0) return;
    mergeFiles = mergeFiles.concat(files);
    renderMergeList();
}

function renderMergeList() {
    const list = document.getElementById('merge-list');
    list.innerHTML = mergeFiles.map((f, i) => `
        <div class="flex justify-between p-2" style="background:var(--color-surface);border:1px solid var(--color-border);border-radius:4px">
            <span class="truncate">${f.name}</span>
            <button style="color:red;cursor:pointer;background:none;border:none" onclick="removeMergeFile(${i})">✖</button>
        </div>
    `).join('');
    
    document.getElementById('do-merge-btn').classList.toggle('hidden', mergeFiles.length < 2);
}

function removeMergeFile(idx) {
    mergeFiles.splice(idx, 1);
    renderMergeList();
}

async function executeMerge() {
    if (mergeFiles.length < 2 || typeof PDFLib === 'undefined') return;
    
    const status = document.getElementById('processing-status');
    status.textContent = 'Merging PDFs...';
    status.classList.remove('hidden');
    
    try {
        const { PDFDocument } = PDFLib;
        const mergedPdf = await PDFDocument.create();
        
        for (const file of mergeFiles) {
            const arrayBuffer = await file.arrayBuffer();
            const pdfDoc = await PDFDocument.load(arrayBuffer);
            const copiedPages = await mergedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
            copiedPages.forEach((page) => mergedPdf.addPage(page));
        }
        
        const pdfBytes = await mergedPdf.save();
        downloadBlob(new Blob([pdfBytes], { type: 'application/pdf' }), `merged-${Date.now()}.pdf`);
        status.textContent = '✅ Merged Successfully!';
    } catch (e) {
        console.error(e);
        status.textContent = '❌ Error merging PDFs.';
    }
}

function handleSplitUpload(event) {
    const file = event.target.files[0];
    if (!file || file.type !== 'application/pdf') return;
    splitFile = file;
    
    document.getElementById('split-drop').classList.add('hidden');
    const ui = document.getElementById('split-ui');
    ui.classList.remove('hidden');
    document.getElementById('split-filename').textContent = file.name;
}

function parsePageRanges(str, maxPages) {
    const pages = new Set();
    const parts = str.split(',').map(s => s.trim());
    for (const part of parts) {
        if (!part) continue;
        if (part.includes('-')) {
            let [start, end] = part.split('-').map(Number);
            if (isNaN(start) || isNaN(end)) continue;
            start = Math.max(1, start);
            end = Math.min(maxPages, end);
            for (let i = start; i <= end; i++) pages.add(i - 1); // zero-indexed
        } else {
            const num = Number(part);
            if (!isNaN(num) && num > 0 && num <= maxPages) pages.add(num - 1);
        }
    }
    return Array.from(pages).sort((a,b)=>a-b);
}

async function executeSplit() {
    if (!splitFile || typeof PDFLib === 'undefined') return;
    const rangeInput = document.getElementById('split-pages').value;
    if (!rangeInput) return alert('Please enter page numbers to extract.');
    
    const status = document.getElementById('processing-status');
    status.textContent = 'Extracting pages...';
    status.classList.remove('hidden');
    
    try {
        const { PDFDocument } = PDFLib;
        const arrayBuffer = await splitFile.arrayBuffer();
        const pdfDoc = await PDFDocument.load(arrayBuffer);
        
        const pageCount = pdfDoc.getPageCount();
        const pagesToExtract = parsePageRanges(rangeInput, pageCount);
        if (pagesToExtract.length === 0) {
            status.textContent = '❌ Invalid page range.';
            return;
        }
        
        const newPdf = await PDFDocument.create();
        const copiedPages = await newPdf.copyPages(pdfDoc, pagesToExtract);
        copiedPages.forEach((page) => newPdf.addPage(page));
        
        const pdfBytes = await newPdf.save();
        downloadBlob(new Blob([pdfBytes], { type: 'application/pdf' }), `extracted-${Date.now()}.pdf`);
        status.textContent = '✅ Extracted Successfully!';
    } catch (e) {
        console.error(e);
        status.textContent = '❌ Error extracting pages.';
    }
}

function downloadBlob(blob, filename) {
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { switchMode, handleMergeUpload, executeMerge, handleSplitUpload, executeSplit, parsePageRanges };
}
