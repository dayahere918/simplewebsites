const ads = require('../ads');
const analytics = require('../analytics');
const seo = require('../seo');
const build = require('../build');
const bf = require('../../sites/baby-face-generator/app');
const pb = require('../../sites/pet-breed-identifier/app');
const pt = require('../../sites/pdf-toolkit/app');
const vc = require('../../sites/video-compressor/app');
const jf = require('../../sites/json-yaml-formatter/app');
const gl = require('../../sites/glassmorphism-generator/app');
const ie = require('../../sites/image-upscaler/app');

describe('ULTIMATE BOOSTER v27: BRANCH COVERAGE PUSH', () => {
    beforeEach(() => {
        document.body.innerHTML = `
            <div id="app"></div><canvas id="baby-canvas"></canvas><canvas id="pet-canvas"></canvas>
            <div id="breed-badge"></div><div id="confidence-text"></div><div id="breed-bars"></div><div id="breed-info"></div><div id="care-tips"></div>
            <div id="baby-traits"></div><textarea id="raw-input"></textarea>
            <select id="input-type"><option value="json">JSON</option><option value="yaml">YAML</option><option value="xml">XML</option><option value="auto">Auto</option></select>
            <select id="output-type"><option value="json">JSON</option><option value="yaml">YAML</option><option value="min">Min</option></select>
            <code id="formatted-output"></code><div id="error-box" class="hidden"></div><span id="status-label"></span>
            <div id="preview-area"></div><div id="glass-box"></div>
            <input id="blur" value="16"><input id="opa" value="0.25"><input id="out" value="0.3">
            <input id="glass-color" value="#ffffff"><input id="radius" value="16">
            <span id="val-blur"></span><span id="val-opa"></span><span id="val-out"></span><span id="val-radius"></span>
            <code id="css-output"></code>
            <button id="bg-gradient" class="bg-btn"></button>
            <div id="upload-area"></div><div id="workspace" class="hidden"></div>
            <img id="img-preview" src=""><img id="img-result" class="hidden">
            <div id="status-text"></div><div id="loading"></div>
            <div id="download-area" class="hidden"></div>
            <div id="orig-dimensions"></div><div id="new-dimensions"></div>
            <div id="comparison-wrap" class="hidden"></div>
            <input id="comparison-slider" type="range" value="50">
        `;
        global.window = global;
        global.mobilenet = { load: jest.fn().mockResolvedValue({ classify: jest.fn().mockResolvedValue([{ className: 'Dog', probability: 0.9 }]) }) };
        global.jsyaml = { load: jest.fn().mockReturnValue({ a: 1 }), dump: jest.fn().mockReturnValue('a: 1') };
    });

    test('Shared Infrastructure Density', () => {
        expect(seo.generateMetaTags({title:'T',description:'D',keywords:'k',url:'u',image:'i',siteName:'S',type:'App'})).toContain('T');
        expect(build.formatSiteName('site-one')).toBe('Site One');
        expect(analytics.getGA4Script('G-TEST')).toContain('G-TEST');
        expect(ads.getAdSenseScript()).toContain('adsbygoogle');
    });

    test('Core Sites Dense Branch Coverage', async () => {
        // Baby Face
        expect(bf.generateTraits().length).toBe(5);
        bf.setParent1(false);
        bf.setParent2(false);
        // PDF Toolkit - pure logic branches
        expect(pt.filterPdfFiles(null).length).toBe(0);
        expect(pt.filterPdfFiles([]).length).toBe(0);
        expect(pt.moveItem(['a','b','c'], 2, 0)).toEqual(['c','a','b']);
        expect(pt.formatFileCount(0)).toBe('No files selected');
        expect(pt.formatFileCount(1)).toBe('1 PDF selected');
        expect(pt.formatFileCount(5)).toBe('5 PDFs selected');
        // Video Compressor pure logic
        expect(vc.qualityToCRF('high')).toBe('23');
        expect(vc.qualityToCRF('low')).toBe('34');
        expect(vc.qualityToCRF('invalid')).toBe('28');
        expect(vc.formatSize(0)).toBe('0 B');
        expect(vc.calcSavings(0, 10)).toBe(0);
        expect(vc.isVideoFile({ type: 'video/mp4' })).toBe(true);
        expect(vc.isVideoFile(null)).toBe(false);
        // JSON Formatter pure logic
        const m = { load: jest.fn().mockReturnValue({a:1}), dump: jest.fn().mockReturnValue('a:1') };
        expect(jf.parseInput('{"a":1}', 'json', m).error).toBeNull();
        expect(jf.parseInput('bad json', 'json', m).error).toBeTruthy();
        expect(jf.parseInput('key: val', 'yaml', m).error).toBeNull();
        expect(jf.parseInput('{"a":1}', 'auto', m).detectedType).toBe('json');
        expect(jf.parseInput('[1,2]', 'auto', m).detectedType).toBe('json');
        expect(jf.parseInput('<root/>', 'auto', m).detectedType).toBe('xml');
        expect(jf.parseInput('key: val', 'auto', m).detectedType).toBe('yaml');
        expect(jf.escapeHtml('<>&"')).toContain('&lt;');
        // Glassmorphism
        expect(gl.hexToRgb('#ff0000')).toEqual({ r: 255, g: 0, b: 0 });
        expect(gl.hexToRgb('notahex')).toEqual({ r: 255, g: 255, b: 255 });
        expect(gl.buildGlassCSS({ blur:12, opacity:0.2, borderOpacity:0.3, colorHex:'#000000', shadow:true })).toContain('box-shadow');
        expect(gl.buildGlassCSS({ blur:12, opacity:0.2, borderOpacity:0.3, colorHex:'#000000', shadow:false })).not.toContain('box-shadow');
        ['purple','sunset','ocean','forest','rose','gradient','unknown'].forEach(p => {
            expect(gl.getBackgroundForPreset(p)).toContain('gradient');
        });
        // Image Upscaler 
        expect(ie.validateImageSize(400, 400).valid).toBe(true);
        expect(ie.validateImageSize(1000, 100).valid).toBe(false);
        expect(ie.formatDimensions(800, 600)).toBe('800 × 600 px');
        expect(ie.formatDimensions(400, 300, 2)).toBe('800 × 600 px');
        expect(ie.parseScale(0)).toBe(1);
        expect(ie.parseScale(10)).toBe(4);
        expect(ie.parseScale('xyz')).toBe(2);
        // Pet Breed - test finalizeResults branch
        pb.finalizeResults({ 'Cat': 80, 'Siamese': 70 });
        expect(document.getElementById('breed-badge').textContent).toBe('Cat');
    });

    test('JSON Formatter formatOutput branches', () => {
        const m = { dump: jest.fn().mockReturnValue('yaml: output') };
        const json = jf.formatOutput({a: 1}, 'json', 'json', '', m);
        expect(json.outStr).toContain('"a"');
        expect(json.langClass).toBe('language-json');
        const yaml = jf.formatOutput({a: 1}, 'json', 'yaml', '', m);
        expect(yaml.langClass).toBe('language-yaml');
        const min = jf.formatOutput({a: 1, b: 'x'}, 'json', 'min', '', m);
        expect(min.outStr).not.toContain('\n');
        const xml = jf.formatOutput('<root/>', 'xml', 'json', '<root/>', m);
        expect(xml.langClass).toBe('language-markup');
    });

    test('generateDiff all branch paths', () => {
        const dSame = jf.generateDiff('a\nb', 'a\nb');
        expect(dSame).toContain('diff-same');
        const dRemoved = jf.generateDiff('a\nb', 'a');
        expect(dRemoved).toContain('diff-removed');
        const dAdded = jf.generateDiff('a', 'a\nb');
        expect(dAdded).toContain('diff-added');
        const dChanged = jf.generateDiff('a', 'b');
        expect(dChanged).toContain('diff-removed');
        expect(dChanged).toContain('diff-added');
    });

    test('Video compressor setVideoFile calls initFFmpeg', () => {
        // Without FFmpeg global, setVideoFile should still work (catch error)
        delete global.window.FFmpeg;
        const mockFile = { name: 'test.mp4', size: 1024, type: 'video/mp4' };
        document.body.innerHTML += `<div id="compress-ui" class="hidden"></div><div id="file-info"></div><div id="processing-status" class="hidden"></div>`;
        vc.setVideoFile(mockFile);
        expect(document.getElementById('compress-ui').classList.contains('hidden')).toBe(false);
        vc.resetCompressor();
        expect(document.getElementById('upload-area').classList.contains('hidden')).toBe(false);
    });
});
