/**
 * Video Compressor Core Logic using ffmpeg.wasm
 * Enhanced: drag-and-drop, quality presets, progress bar, error handling
 */

let videoFile = null;
let quality = 'medium';
let outputBlob = null;
let ffmpegInstance = null;

// --- Pure Logic (Testable) ---

/**
 * Map quality preset to CRF value (lower = better quality, larger file)
 * @param {string} q - 'high' | 'medium' | 'low'
 * @returns {string} CRF value as string
 */
function qualityToCRF(q) {
    if (q === 'high') return '23';
    if (q === 'low') return '34';
    return '28'; // medium default
}

/**
 * Format file size in human-readable form
 * @param {number} bytes
 * @returns {string}
 */
function formatSize(bytes) {
    if (bytes === 0) return '0 B';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

/**
 * Calculate compression savings percentage
 * @param {number} originalSize
 * @param {number} compressedSize
 * @returns {number} percentage saved (0-100)
 */
function calcSavings(originalSize, compressedSize) {
    if (!originalSize || originalSize <= 0) return 0;
    return Math.max(0, Math.round(100 - (compressedSize / originalSize) * 100));
}

/**
 * Validate a file is a video
 * @param {File} file
 * @returns {boolean}
 */
function isVideoFile(file) {
    return !!(file && file.type && file.type.startsWith('video/'));
}

// --- DOM Logic ---

async function initFFmpeg() {
    if (ffmpegInstance) return ffmpegInstance;

    const FFmpegLib = window.FFmpeg;
    if (!FFmpegLib || !FFmpegLib.FFmpeg) {
        throw new Error('FFmpeg library not available. Please check your internet connection.');
    }

    const ff = new FFmpegLib.FFmpeg();
    
    ff.on('log', ({ message }) => {
        const logEl = document.getElementById('ffmpeg-log');
        if (logEl) logEl.textContent = message;
    });
    
    ff.on('progress', ({ progress }) => {
        const pct = Math.min(100, Math.round(progress * 100));
        const bar = document.getElementById('progress-bar');
        const statusEl = document.getElementById('processing-status');
        if (bar) bar.style.width = pct + '%';
        if (statusEl) statusEl.textContent = `Compressing... ${pct}%`;
    });

    const coreURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.js';
    const wasmURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.wasm';

    const statusEl = document.getElementById('processing-status');
    if (statusEl) { statusEl.textContent = 'Loading compression engine...'; statusEl.classList.remove('hidden'); }

    await ff.load({ coreURL, wasmURL });
    
    if (statusEl) statusEl.classList.add('hidden');
    ffmpegInstance = ff;
    return ff;
}

function handleUpload(event) {
    const file = event?.target?.files?.[0] || event?.dataTransfer?.files?.[0];
    if (!isVideoFile(file)) {
        showError('Please upload a valid video file (MP4, WebM, MOV, etc.)');
        return;
    }
    setVideoFile(file);
}

function setVideoFile(file) {
    videoFile = file;
    const uploadArea = document.getElementById('upload-area');
    const compressUI = document.getElementById('compress-ui');
    const resultUI = document.getElementById('result-ui');
    const fileInfo = document.getElementById('file-info');
    
    if (uploadArea) uploadArea.classList.add('hidden');
    if (compressUI) compressUI.classList.remove('hidden');
    if (resultUI) resultUI.classList.add('hidden');
    if (fileInfo) fileInfo.textContent = `📹 ${file.name} (${formatSize(file.size)})`;

    // Pre-load FFmpeg in background
    initFFmpeg().catch(err => console.warn('FFmpeg pre-load failed:', err.message));
}

function setQuality(q) {
    quality = q;
    const levels = ['high', 'medium', 'low'];
    levels.forEach(lvl => {
        const id = lvl === 'high' ? 'btn-hq' : lvl === 'medium' ? 'btn-mq' : 'btn-lq';
        const btn = document.getElementById(id);
        if (btn) {
            btn.classList.toggle('active', lvl === q);
            btn.classList.toggle('btn-primary', lvl === q);
            btn.classList.toggle('btn-secondary', lvl !== q);
        }
    });
}

function showError(msg) {
    const statusEl = document.getElementById('processing-status');
    if (statusEl) {
        statusEl.textContent = '❌ ' + msg;
        statusEl.classList.remove('hidden');
    }
}

function setupDragDrop() {
    const dropZone = document.getElementById('upload-area');
    if (!dropZone) return;
    
    dropZone.addEventListener('dragover', e => {
        e.preventDefault();
        dropZone.classList.add('drag-over');
    });
    dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drag-over'));
    dropZone.addEventListener('drop', e => {
        e.preventDefault();
        dropZone.classList.remove('drag-over');
        handleUpload(e);
    });
}

async function executeCompression() {
    if (!videoFile) return;

    const statusEl = document.getElementById('processing-status');
    const btn = document.getElementById('do-compress-btn');
    const bar = document.getElementById('progress-bar');
    const barWrap = document.getElementById('progress-wrap');

    if (btn) btn.disabled = true;
    if (statusEl) { statusEl.classList.remove('hidden'); statusEl.textContent = 'Preparing...'; }
    if (barWrap) barWrap.classList.remove('hidden');
    if (bar) bar.style.width = '0%';

    try {
        const ff = await initFFmpeg();
        const { fetchFile } = window.FFmpegUtil || {};
        if (!fetchFile) throw new Error('FFmpegUtil not available');

        const ext = (videoFile.name.split('.').pop() || 'mp4').toLowerCase();
        const inputName = `input.${ext}`;
        const outputName = 'output.mp4';
        const crf = qualityToCRF(quality);

        await ff.writeFile(inputName, await fetchFile(videoFile));
        await ff.exec(['-i', inputName, '-vcodec', 'libx264', '-crf', crf, '-preset', 'ultrafast', '-movflags', '+faststart', outputName]);

        const data = await ff.readFile(outputName);
        outputBlob = new Blob([data.buffer], { type: 'video/mp4' });

        if (barWrap) barWrap.classList.add('hidden');
        if (statusEl) statusEl.classList.add('hidden');

        const resultUI = document.getElementById('result-ui');
        if (resultUI) resultUI.classList.remove('hidden');

        const savings = calcSavings(videoFile.size, outputBlob.size);
        const savedEl = document.getElementById('saved-space');
        if (savedEl) {
            savedEl.innerHTML = `
                <span>Original: <strong>${formatSize(videoFile.size)}</strong></span>
                <span>Compressed: <strong>${formatSize(outputBlob.size)}</strong></span>
                <span class="savings-badge">Saved ${savings}% 🎉</span>
            `;
        }

    } catch (e) {
        console.error('Compression error:', e);
        showError('Compression failed: ' + e.message);
        if (btn) btn.disabled = false;
        if (barWrap) barWrap.classList.add('hidden');
    }
}

function downloadVideo() {
    if (!outputBlob) return;
    const link = document.createElement('a');
    link.href = URL.createObjectURL(outputBlob);
    link.download = `compressed-video-${Date.now()}.mp4`;
    link.click();
}

function resetCompressor() {
    videoFile = null;
    outputBlob = null;
    const uploadArea = document.getElementById('upload-area');
    const compressUI = document.getElementById('compress-ui');
    const resultUI = document.getElementById('result-ui');
    if (uploadArea) uploadArea.classList.remove('hidden');
    if (compressUI) compressUI.classList.add('hidden');
    if (resultUI) resultUI.classList.add('hidden');
}

if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', setupDragDrop);
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        qualityToCRF, formatSize, calcSavings, isVideoFile,
        handleUpload, setVideoFile, setQuality, executeCompression,
        downloadVideo, resetCompressor, showError,
        // For testing
        resetFFmpeg: () => { ffmpegInstance = null; },
        getFFmpeg: () => ffmpegInstance,
        getVideoFile: () => videoFile,
        getQuality: () => quality,
        getOutputBlob: () => outputBlob,
        setOutputBlob: (b) => { outputBlob = b; }
    };
}
