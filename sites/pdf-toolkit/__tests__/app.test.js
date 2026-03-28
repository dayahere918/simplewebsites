/**
 * Updated comprehensive tests for pdf-toolkit
 * Tests: filterPdfFiles, moveItem, formatFileCount, parsePageRange,
 *        switchMode, handleSplitUpload (split-ui reveal), executeSplit with page range
 */
const {
  filterPdfFiles, moveItem, formatFileCount, parsePageRange,
  switchMode, handleMergeUpload, renderMergeList, removeMergeFile, reorderMergeFiles,
  handleSplitUpload, executeMerge, executeSplit, downloadBlob, resetFiles,
  setMergeFiles, setSplitFile, setSplitPageCount, getMergeFiles, getSplitFile, getSplitPageCount, setSelectedPages
} = require('../app');

const DOM_HTML = `
  <button id="tab-merge"></button><button id="tab-split"></button>
  <div id="mode-merge"></div><div id="mode-split" class="hidden"></div>
  <div id="processing-status" class="hidden"></div>
  <div id="merge-list"></div><button id="do-merge-btn" class="hidden"></button>
  <div id="merge-count"></div>
  <div id="split-file-info"></div><button id="do-split-btn" class="hidden"></button>
  <div id="split-drop"></div>
  <div id="split-ui" class="hidden"></div>
  <div id="split-page-count-info"></div>
  <input id="split-pages" type="text" value="" />
  <div id="split-results" class="hidden"></div>
  <div id="output-list"></div>
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
        getPageCount: jest.fn().mockReturnValue(5),
        getPageIndices: jest.fn().mockReturnValue([0, 1, 2, 3, 4]),
        copyPages: jest.fn().mockResolvedValue([{}, {}, {}, {}, {}])
      })
    }
  };
  if (!File.prototype.arrayBuffer) {
    File.prototype.arrayBuffer = () => Promise.resolve(new ArrayBuffer(8));
  }
  resetFiles();
});

// ── Pure Logic ────────────────────────────────────────────

describe('PDF Toolkit — Pure Logic', () => {
  test('filterPdfFiles returns only PDFs', () => {
    const pdf = new File([''], 'file.pdf', { type: 'application/pdf' });
    const img = new File([''], 'file.png', { type: 'image/png' });
    expect(filterPdfFiles([pdf, img]).length).toBe(1);
    expect(filterPdfFiles([]).length).toBe(0);
    expect(filterPdfFiles(null).length).toBe(0);
  });

  test('filterPdfFiles accepts .pdf by extension', () => {
    const pdf = new File([''], 'doc.pdf', { type: 'text/plain' }); // wrong type but right extension
    expect(filterPdfFiles([pdf]).length).toBe(1);
  });

  test('moveItem reorders array correctly', () => {
    const arr = ['a', 'b', 'c'];
    expect(moveItem(arr, 0, 2)).toEqual(['b', 'c', 'a']);
    expect(moveItem(arr, 2, 0)).toEqual(['c', 'a', 'b']);
  });

  test('moveItem does not mutate original array', () => {
    const arr = ['x', 'y'];
    moveItem(arr, 0, 1);
    expect(arr).toEqual(['x', 'y']);
  });

  test('formatFileCount formats labels', () => {
    expect(formatFileCount(0)).toBe('No files selected');
    expect(formatFileCount(1)).toBe('1 PDF selected');
    expect(formatFileCount(3)).toBe('3 PDFs selected');
  });
});

// ── parsePageRange ────────────────────────────────────────

describe('parsePageRange()', () => {
  test('returns all pages for empty string', () => {
    const pages = parsePageRange('', 5);
    expect(pages).toEqual([0, 1, 2, 3, 4]);
  });

  test('returns all pages for null input', () => {
    const pages = parsePageRange(null, 3);
    expect(pages).toEqual([0, 1, 2]);
  });

  test('parses single page number', () => {
    expect(parsePageRange('2', 5)).toEqual([1]); // 0-indexed
  });

  test('parses comma-separated pages', () => {
    expect(parsePageRange('1, 3, 5', 5)).toEqual([0, 2, 4]);
  });

  test('parses page range with dash', () => {
    expect(parsePageRange('2-4', 5)).toEqual([1, 2, 3]);
  });

  test('parses mixed: pages and ranges', () => {
    const pages = parsePageRange('1, 3-5', 5);
    expect(pages).toEqual([0, 2, 3, 4]);
  });

  test('ignores out-of-bounds page numbers', () => {
    const pages = parsePageRange('1, 10, 100', 5);
    expect(pages).toEqual([0]); // only page 1 is in bounds (1-5)
  });

  test('deduplicates page numbers', () => {
    const pages = parsePageRange('1, 1, 2', 5);
    expect(pages).toEqual([0, 1]);
  });

  test('returns sorted result', () => {
    const pages = parsePageRange('5, 1, 3', 5);
    expect(pages).toEqual([0, 2, 4]);
  });

  test('handles invalid characters gracefully', () => {
    const pages = parsePageRange('abc, 2, xyz', 5);
    expect(pages).toEqual([1]); // only page 2 is valid
  });
});

// ── switchMode ────────────────────────────────────────────

describe('PDF Toolkit — switchMode', () => {
  test('switches to split mode', () => {
    switchMode('split');
    expect(document.getElementById('mode-split').classList.contains('hidden')).toBe(false);
    expect(document.getElementById('mode-merge').classList.contains('hidden')).toBe(true);
  });

  test('switches back to merge mode', () => {
    switchMode('split');
    switchMode('merge');
    expect(document.getElementById('mode-merge').classList.contains('hidden')).toBe(false);
    expect(document.getElementById('mode-split').classList.contains('hidden')).toBe(true);
  });
});

// ── Merge Operations ──────────────────────────────────────

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
    expect(document.getElementById('processing-status').textContent).toContain('Error');
  });
});

// ── Split Operations ──────────────────────────────────────

describe('PDF Toolkit — Split Operations', () => {
  test('handleSplitUpload sets split file and REVEALS split-ui', async () => {
    const pdf = new File([''], 'split.pdf', { type: 'application/pdf' });
    pdf.arrayBuffer = () => Promise.resolve(new ArrayBuffer(8));
    await handleSplitUpload({ target: { files: [pdf] } });
    expect(getSplitFile()).toBeTruthy();
    expect(document.getElementById('split-file-info').textContent).toContain('split.pdf');
    expect(document.getElementById('split-ui').classList.contains('hidden')).toBe(false);
  });

  test('handleSplitUpload ignores non-PDFs', async () => {
    const img = new File([''], 'img.png', { type: 'image/png' });
    await handleSplitUpload({ target: { files: [img] } });
    expect(getSplitFile()).toBeNull();
  });

  test('executeSplit extracts all visually selected pages', async () => {
    const pdf = new File([''], 'test.pdf', { type: 'application/pdf' });
    pdf.arrayBuffer = () => Promise.resolve(new ArrayBuffer(8));
    setSplitFile(pdf);
    setSelectedPages([0, 1, 2, 3, 4]); // 5 pages from mock
    await executeSplit();
    expect(document.getElementById('split-results').classList.contains('hidden')).toBe(false);
    expect(document.getElementById('output-list').children.length).toBe(5); // 5 pages from mock
  });

  test('executeSplit extracts only specified selection', async () => {
    const pdf = new File([''], 'test.pdf', { type: 'application/pdf' });
    pdf.arrayBuffer = () => Promise.resolve(new ArrayBuffer(8));
    setSplitFile(pdf);
    setSelectedPages([0, 2]); // Pages 1 and 3 (0-indexed)
    await executeSplit();
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

  test('executeSplit extracts all pages when selection is empty (fallback behavior)', async () => {
    const pdf = new File([''], 'test.pdf', { type: 'application/pdf' });
    pdf.arrayBuffer = () => Promise.resolve(new ArrayBuffer(8));
    setSplitFile(pdf);
    setSelectedPages([]); // No pages selected — should default to all pages
    await executeSplit();
    // Should extract all 5 pages (from mock), not show an error
    expect(document.getElementById('split-results').classList.contains('hidden')).toBe(false);
    expect(document.getElementById('output-list').children.length).toBe(5);
  });
});

// ── downloadBlob ──────────────────────────────────────────

describe('PDF Toolkit — downloadBlob', () => {
  test('creates download link with correct blob', () => {
    const blob = new Blob(['data'], { type: 'application/pdf' });
    downloadBlob(blob, 'test.pdf');
    expect(global.URL.createObjectURL).toHaveBeenCalledWith(blob);
  });
});
