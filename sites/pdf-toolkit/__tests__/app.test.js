const app = require('../app');
const { executeMerge, executeSplit, setMergeFiles, setSplitFile, switchMode, handleMergeUpload, handleSplitUpload, removeMergeFile } = app;

beforeEach(() => {
    document.body.innerHTML = `
        <button id="tab-merge"></button><button id="tab-split"></button>
        <div id="mode-merge"></div><div id="mode-split"></div>
        <div id="processing-status"></div>
        <div id="merge-list"></div><button id="do-merge-btn"></button>
        <div id="split-file-info"></div><button id="do-split-btn"></button>
        <div id="results"></div><div id="output-list"></div>
    `;
    if (!File.prototype.arrayBuffer) {
        File.prototype.arrayBuffer = function() { return Promise.resolve(new ArrayBuffer(8)); };
    }
    global.PDFLib = { PDFDocument: { 
        create: jest.fn().mockResolvedValue({ copyPages: jest.fn().mockResolvedValue([{}]), addPage: jest.fn(), save: jest.fn().mockResolvedValue(new Uint8Array(8)) }),
        load: jest.fn().mockResolvedValue({ getPageIndices: jest.fn().mockReturnValue([0]), getPageCount: jest.fn().mockReturnValue(1) })
    }};
    global.URL.createObjectURL = jest.fn().mockReturnValue('blob:test');
    setMergeFiles([]); setSplitFile(null);
});

describe('PDF Toolkit Exhaustive Final', () => {
    test('switchMode workflow', () => {
        switchMode('split');
        expect(document.getElementById('mode-split').classList.contains('hidden')).toBe(false);
    });

    test('handleMergeUpload logic', () => {
        const file = new File([''], '1.pdf', { type: 'application/pdf' });
        handleMergeUpload({ target: { files: [file] } });
        expect(document.getElementById('merge-list').innerHTML).toContain('1.pdf');
    });

    test('removeMergeFile workflow', () => {
        setMergeFiles([new File([], '1.pdf')]);
        removeMergeFile(0);
        expect(document.getElementById('merge-list').innerHTML).toBe('');
    });

    test('executeSplit success', async () => {
        setSplitFile(new File([''], '1.pdf', { type: 'application/pdf' }));
        await executeSplit();
        expect(document.getElementById('results').classList.contains('hidden')).toBe(false);
    });
});
