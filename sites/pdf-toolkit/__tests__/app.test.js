/**
 * Comprehensive tests for pdf-toolkit
 * Tests all pure logic and async PDF operations
 */
const {
    filterPdfFiles, moveItem, formatFileCount,
    switchMode, handleMergeUpload, renderMergeList, removeMergeFile, reorderMergeFiles,
    handleSplitUpload, executeMerge, executeSplit, downloadBlob, resetFiles,
    setMergeFiles, setSplitFile, getMergeFiles, getSplitFile
} = require('../app');

const DOM_HTML = `
    <button id="tab-merge"></button><button id="tab-split"></button>
    <div id="mode-merge"></div><div id="mode-split" class="hidden"></div>
    <div id="processing-status" class="hidden"></div>
    <div id="merge-list"></div><button id="do-merge-btn" class="hidden"></button>
    <div id="merge-count"></div>
    <div id="split-file-info"></div><button id="do-split-btn" class="hidden"></button>
    <div id="results" class="hidden"></div><div id="output-list"></div>
    <div id="split-page-count"></div>
`;

beforeEach(() => {
    document.body.innerHTML = DOM_HTML;
    global.URL.createObjectURL = jest.fn().mockReturnValue('blob:test');
    global.PDFLib = {
        PDFDocument: {
            create: jest.fn().mockResolvedValue({
                copyPages: jest.fn().mockResolvedValue([{}]),
                addPage: jest.fn(),
                save: jest.fn().mockResolvedValue(new Uint8Array([1, 2, 3])),
                getPageIndices: jest.fn().mockReturnValue([0, 1])
            }),
            load: jest.fn().mockResolvedValue({
                getPageCount: jest.fn().mockReturnValue(2),
                getPageIndices: jest.fn().mockReturnValue([0, 1]),
                copyPages: jest.fn().mockResolvedValue([{}, {}])
            })
        }
    };
    if (!File.prototype.arrayBuffer) {
        File.prototype.arrayBuffer = () => Promise.resolve(new ArrayBuffer(8));
    }
    resetFiles();
});

describe('PDF Toolkit — Pure Logic', () => {
    test('filterPdfFiles returns only PDFs', () => {
        const pdf = new File([''], 'file.pdf', { type: 'application/pdf' });
        const img = new File([''], 'file.png', { type: 'image/png' });
        expect(filterPdfFiles([pdf, img]).length).toBe(1);
        expect(filterPdfFiles([]).length).toBe(0);
        expect(filterPdfFiles(null).length).toBe(0);
    });

    test('moveItem reorders array correctly', () => {
        const arr = ['a', 'b', 'c'];
        expect(moveItem(arr, 0, 2)).toEqual(['b', 'c', 'a']);
        expect(moveItem(arr, 2, 0)).toEqual(['c', 'a', 'b']);
    });

    test('formatFileCount formats labels', () => {
        expect(formatFileCount(0)).toBe('No files selected');
        expect(formatFileCount(1)).toBe('1 PDF selected');
        expect(formatFileCount(3)).toBe('3 PDFs selected');
    });
});

describe('PDF Toolkit — switchMode', () => {
    test('switch to split mode', () => {
        switchMode('split');
        expect(document.getElementById('mode-split').classList.contains('hidden')).toBe(false);
        expect(document.getElementById('mode-merge').classList.contains('hidden')).toBe(true);
    });

    test('switch to merge mode', () => {
        switchMode('merge');
        expect(document.getElementById('mode-merge').classList.contains('hidden')).toBe(false);
        expect(document.getElementById('mode-split').classList.contains('hidden')).toBe(true);
    });
});

describe('PDF Toolkit — Merge Operations', () => {
    test('handleMergeUpload adds PDFs to list', () => {
        const pdf = new File([''], '1.pdf', { type: 'application/pdf' });
        handleMergeUpload({ target: { files: [pdf] } });
        expect(getMergeFiles().length).toBe(1);
        expect(document.getElementById('merge-list').innerHTML).toContain('1.pdf');
    });

    test('handleMergeUpload ignores non-PDFs', () => {
        const img = new File([''], 'img.png', { type: 'image/png' });
        handleMergeUpload({ target: { files: [img] } });
        expect(getMergeFiles().length).toBe(0);
    });

    test('removeMergeFile removes by index', () => {
        setMergeFiles([new File([], '1.pdf'), new File([], '2.pdf')]);
        removeMergeFile(0);
        expect(getMergeFiles().length).toBe(1);
        expect(document.getElementById('merge-list').innerHTML).toContain('2.pdf');
    });

    test('reorderMergeFiles changes order', () => {
        const f1 = new File([], '1.pdf'); const f2 = new File([], '2.pdf');
        setMergeFiles([f1, f2]);
        reorderMergeFiles(0, 1);
        expect(getMergeFiles()[0].name).toBe('2.pdf');
    });

    test('executeMerge succeeds with 2+ files', async () => {
        const f1 = new File([''], '1.pdf', { type: 'application/pdf' });
        const f2 = new File([''], '2.pdf', { type: 'application/pdf' });
        f1.arrayBuffer = () => Promise.resolve(new ArrayBuffer(8));
        f2.arrayBuffer = () => Promise.resolve(new ArrayBuffer(8));
        setMergeFiles([f1, f2]);
        await executeMerge();
        expect(global.PDFLib.PDFDocument.create).toHaveBeenCalled();
    });

    test('executeMerge returns early with < 2 files', async () => {
        setMergeFiles([new File([''], '1.pdf')]);
        await executeMerge();
        expect(global.PDFLib.PDFDocument.create).not.toHaveBeenCalled();
    });

    test('executeMerge handles error gracefully', async () => {
        global.PDFLib.PDFDocument.create = jest.fn().mockRejectedValue(new Error('Fail'));
        const f1 = new File([''], '1.pdf', { type: 'application/pdf' });
        const f2 = new File([''], '2.pdf', { type: 'application/pdf' });
        f1.arrayBuffer = () => Promise.resolve(new ArrayBuffer(8));
        f2.arrayBuffer = () => Promise.resolve(new ArrayBuffer(8));
        setMergeFiles([f1, f2]);
        await executeMerge();
        const status = document.getElementById('processing-status');
        expect(status.textContent).toContain('Error');
    });
});

describe('PDF Toolkit — Split Operations', () => {
    test('handleSplitUpload sets split file', () => {
        const pdf = new File([''], 'split.pdf', { type: 'application/pdf' });
        handleSplitUpload({ target: { files: [pdf] } });
        expect(getSplitFile()).toBeTruthy();
        expect(document.getElementById('split-file-info').textContent).toContain('split.pdf');
        expect(document.getElementById('do-split-btn').classList.contains('hidden')).toBe(false);
    });

    test('handleSplitUpload ignores non-PDFs', () => {
        const img = new File([''], 'img.png', { type: 'image/png' });
        handleSplitUpload({ target: { files: [img] } });
        expect(getSplitFile()).toBeNull();
    });

    test('executeSplit splits into pages', async () => {
        const pdf = new File([''], 'test.pdf', { type: 'application/pdf' });
        pdf.arrayBuffer = () => Promise.resolve(new ArrayBuffer(8));
        setSplitFile(pdf);
        await executeSplit();
        expect(document.getElementById('results').classList.contains('hidden')).toBe(false);
        expect(document.getElementById('output-list').children.length).toBe(2);
    });

    test('executeSplit returns early without file', async () => {
        await executeSplit();
        expect(global.PDFLib.PDFDocument.load).not.toHaveBeenCalled();
    });

    test('executeSplit handles parse error', async () => {
        global.PDFLib.PDFDocument.load = jest.fn().mockRejectedValue(new Error('Corrupt PDF'));
        const pdf = new File([''], 'bad.pdf', { type: 'application/pdf' });
        pdf.arrayBuffer = () => Promise.resolve(new ArrayBuffer(8));
        setSplitFile(pdf);
        await executeSplit();
        expect(document.getElementById('processing-status').textContent).toContain('Error');
    });
});

describe('PDF Toolkit — downloadBlob', () => {
    test('creates download link', () => {
        const blob = new Blob(['data'], { type: 'application/pdf' });
        downloadBlob(blob, 'test.pdf');
        expect(global.URL.createObjectURL).toHaveBeenCalledWith(blob);
    });
});
