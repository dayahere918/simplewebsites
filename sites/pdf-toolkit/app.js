/**
 * PDF Toolkit Core Logic utilizing pdf-lib
 */

let mergeFiles = [];
let splitFile = null;

function switchMode(mode) {
    const tm = document.getElementById('tab-merge');
    if (tm) tm.className = mode === 'merge' ? 'btn btn-primary active' : 'btn btn-secondary';
    const ts = document.getElementById('tab-split');
    if (ts) ts.className = mode === 'split' ? 'btn btn-primary active' : 'btn btn-secondary';
    
    const mm = document.getElementById('mode-merge');
    if (mm) mm.classList.toggle('hidden', mode !== 'merge');
    const ms = document.getElementById('mode-split');
    if (ms) ms.classList.toggle('hidden', mode !== 'split');
    
    const status = document.getElementById('processing-status');
    if (status) status.classList.add('hidden');
}

function handleMergeUpload(event) {
    const files = Array.from(event.target.files).filter(f => f.type === 'application/pdf');
    if (files.length === 0) return;
    mergeFiles = mergeFiles.concat(files);
    renderMergeList();
}

function renderMergeList() {
    const list = document.getElementById('merge-list');
    if (!list) return;
    list.innerHTML = mergeFiles.map((f, i) => `
        <div class="flex justify-between p-2" style="background:var(--color-surface);border:1px solid var(--color-border);border-radius:4px">
            <span class="truncate">${f.name}</span>
            <button style="color:red;cursor:pointer;background:none;border:none" onclick="removeMergeFile(${i})">✖</button>
        </div>
    `).join('');
    
    const btn = document.getElementById('do-merge-btn');
    if (btn) btn.classList.toggle('hidden', mergeFiles.length < 2);
}

function removeMergeFile(idx) {
    mergeFiles.splice(idx, 1);
    renderMergeList();
}

async function executeMerge() {
    if (mergeFiles.length < 2 || typeof PDFLib === 'undefined') return;
    
    const status = document.getElementById('processing-status');
    if (status) {
        status.textContent = 'Merging PDFs...';
        status.classList.remove('hidden');
    }
    
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
        if (status) status.classList.add('hidden');
    } catch (e) {
        console.error(e);
        if (status) {
            status.textContent = `❌ Error: ${e.message}`;
            status.classList.remove('hidden');
        }
    }
}

function handleSplitUpload(event) {
    const file = event.target.files[0];
    if (!file || file.type !== 'application/pdf') return;
    splitFile = file;
    const info = document.getElementById('split-file-info');
    if (info) info.textContent = `Selected: ${file.name}`;
    const btn = document.getElementById('do-split-btn');
    if (btn) btn.classList.remove('hidden');
}

async function executeSplit() {
    if (!splitFile || typeof PDFLib === 'undefined') return;
    
    const status = document.getElementById('processing-status');
    if (status) {
        status.textContent = 'Splitting PDF...';
        status.classList.remove('hidden');
    }
    
    try {
        const { PDFDocument } = PDFLib;
        const arrayBuffer = await splitFile.arrayBuffer();
        const pdfDoc = await PDFDocument.load(arrayBuffer);
        const pageCount = pdfDoc.getPageCount();
        
        const list = document.getElementById('output-list');
        const res = document.getElementById('results');
        if (list) list.innerHTML = '';
        if (res) res.classList.remove('hidden');
        
        for (let i = 0; i < pageCount; i++) {
            const newPdf = await PDFDocument.create();
            const [page] = await newPdf.copyPages(pdfDoc, [i]);
            newPdf.addPage(page);
            const pdfBytes = await newPdf.save();
            const blob = new Blob([pdfBytes], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            
            if (list) {
                const item = document.createElement('div');
                item.className = 'flex justify-between items-center p-2 mb-2 bg-surface border border-border rounded';
                item.innerHTML = `
                    <span>Page ${i + 1}</span>
                    <a href="${url}" download="page-${i+1}.pdf" class="btn btn-sm btn-primary">Download</a>
                `;
                list.appendChild(item);
            }
        }
        if (status) status.classList.add('hidden');
    } catch (e) {
        console.error(e);
        if (status) {
            status.textContent = `❌ Error: ${e.message}`;
        }
    }
}

function parsePageRanges(str, total) {
    if (!str.trim()) return [];
    // placeholder logic
    return [0];
}

function downloadBlob(blob, filename) {
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { 
        executeMerge, executeSplit, switchMode, handleMergeUpload, removeMergeFile,
        setMergeFiles: (files) => { mergeFiles = files; },
        setSplitFile: (file) => { splitFile = file; }
    };
}
