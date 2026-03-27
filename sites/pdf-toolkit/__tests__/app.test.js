const { switchMode, parsePageRanges, handleMergeUpload, executeMerge, handleSplitUpload, executeSplit } = require('../app');

beforeEach(() => {
    document.body.innerHTML = `
        <button id="tab-merge"></button>
        <button id="tab-split"></button>
        <div id="mode-merge"></div>
        <div id="mode-split"></div>
        <div id="processing-status"></div>
        <div id="merge-list"></div>
        <button id="do-merge-btn"></button>
        <div id="split-drop"></div>
        <div id="split-ui"></div>
        <span id="split-filename"></span>
        <input id="split-pages" value="1-2" />
        <button id="do-split-btn"></button>
    `;
    global.PDFLib = {
        PDFDocument: {
            create: jest.fn().mockResolvedValue({
                copyPages: jest.fn().mockResolvedValue([{}]),
                addPage: jest.fn(),
                save: jest.fn().mockResolvedValue(new Uint8Array(10))
            }),
            load: jest.fn().mockResolvedValue({
                getPageIndices: jest.fn().mockReturnValue([0,1]),
                getPageCount: jest.fn().mockReturnValue(5)
            })
        }
    };
    global.URL = { createObjectURL: jest.fn() };
    require('../app').mergeFiles = [];
    require('../app').splitFile = null;
});

describe('PDF Toolkit', () => {
    test('switchMode toggles UI modes', () => {
        switchMode('split');
        expect(document.getElementById('mode-split').classList.contains('hidden')).toBe(false);
    });

    test('parsePageRanges parses robustly', () => {
        const ranges = parsePageRanges('1-3, 5, 6-6', 10);
        expect(ranges).toEqual([0, 1, 2, 4, 5]);
    });

    test('executeMerge completes flow', async () => {
        const file1 = { name: '1.pdf', type: 'application/pdf', arrayBuffer: async () => new ArrayBuffer(10) };
        const file2 = { name: '2.pdf', type: 'application/pdf', arrayBuffer: async () => new ArrayBuffer(10) };
        handleMergeUpload({ target: { files: [file1, file2] } });
        await executeMerge();
        expect(document.getElementById('processing-status').textContent).toContain('Merged Successfully');
    });

    test('executeSplit handles split correctly', async () => {
        const file = { name: 's.pdf', type: 'application/pdf', arrayBuffer: async () => new ArrayBuffer(10) };
        handleSplitUpload({ target: { files: [file] } });
        await executeSplit();
        expect(document.getElementById('processing-status').textContent).toContain('Extracted Successfully');
    });
});
