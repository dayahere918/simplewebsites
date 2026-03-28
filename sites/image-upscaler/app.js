/**
 * AI Image Upscaler Core Logic
 * Enhanced: before/after comparison slider, error handling, size limits
 */

let originalImage = null;
let upscalerInstance = null;
let resultDataURL = null;

// --- Pure Logic ---

/**
 * Validate image dimensions
 * @param {number} width
 * @param {number} height
 * @param {number} maxDim - maximum allowed dimension
 * @returns {{ valid: boolean, message: string }}
 */
function validateImageSize(width, height, maxDim = 800) {
    if (width > maxDim || height > maxDim) {
        return {
            valid: false,
            message: `Image is too large (${width}x${height}). Maximum supported size is ${maxDim}x${maxDim}px for browser-based AI processing.`
        };
    }
    return { valid: true, message: '' };
}

/**
 * Format pixel dimensions for display
 * @param {number} w
 * @param {number} h
 * @param {number} scale
 * @returns {string}
 */
function formatDimensions(w, h, scale = 1) {
    return `${Math.round(w * scale)} × ${Math.round(h * scale)} px`;
}

/**
 * Calculate scale factor from select value
 * @param {number|string} scale
 * @returns {number}
 */
function parseScale(scale) {
    const n = parseFloat(scale);
    return isNaN(n) ? 2 : Math.min(Math.max(n, 1), 4);
}

// --- DOM Functions ---

function handleUpload(event) {
    const file = event?.target?.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
            const { valid, message } = validateImageSize(img.width, img.height);
            if (!valid) {
                showUpscalerError(message);
                return;
            }
            originalImage = img;
            setupWorkspace(img);
        };
        img.onerror = () => showUpscalerError('Failed to load image');
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

function setupWorkspace(img) {
    const preview = document.getElementById('img-preview');
    const origDims = document.getElementById('orig-dimensions');
    const uploadArea = document.getElementById('upload-area');
    const workspace = document.getElementById('workspace');

    if (preview) preview.src = img.src;
    if (origDims) origDims.textContent = formatDimensions(img.width, img.height);
    if (uploadArea) uploadArea.classList.add('hidden');
    if (workspace) { workspace.classList.remove('hidden'); workspace.classList.add('grid'); }

    // Reset result area
    const resImg = document.getElementById('img-result');
    const downloadArea = document.getElementById('download-area');
    if (resImg) resImg.classList.add('hidden');
    if (downloadArea) downloadArea.classList.add('hidden');
    resultDataURL = null;
}

async function startUpscale(scale) {
    if (!originalImage) return;

    const parsedScale = parseScale(scale);
    const statusEl = document.getElementById('status-text');
    const loadingEl = document.getElementById('loading');
    const btns = document.querySelectorAll('#loading .btn');
    const newDims = document.getElementById('new-dimensions');

    if (statusEl) statusEl.textContent = 'Loading AI model...';
    if (btns) btns.forEach(b => b.classList.add('hidden'));

    try {
        if (!upscalerInstance) {
            if (!window.Upscaler) throw new Error('UpscalerJS library not loaded');
            upscalerInstance = new window.Upscaler();
        }

        if (statusEl) statusEl.textContent = 'Upscaling pixels...';

        resultDataURL = await upscalerInstance.upscale(originalImage, {
            patchSize: 64,
            padding: 2,
            progress: (amount) => {
                if (statusEl) statusEl.textContent = `Upscaling... ${Math.round(amount * 100)}%`;
            }
        });

        if (loadingEl) loadingEl.classList.add('hidden');

        const resImg = document.getElementById('img-result');
        if (resImg) { resImg.src = resultDataURL; resImg.classList.remove('hidden'); }

        const downloadArea = document.getElementById('download-area');
        if (downloadArea) downloadArea.classList.remove('hidden');

        if (newDims) {
            newDims.textContent = formatDimensions(originalImage.width, originalImage.height, parsedScale);
        }

        setupComparisonSlider();

    } catch (e) {
        console.error('Upscale error:', e);
        showUpscalerError('Upscaling failed: ' + e.message);
        if (btns) btns.forEach(b => b.classList.remove('hidden'));
    }
}

function setupComparisonSlider() {
    const slider = document.getElementById('comparison-slider');
    const beforeImg = document.getElementById('img-preview');
    const afterImg = document.getElementById('img-result');
    const wrapper = document.getElementById('comparison-wrap');

    if (!slider || !wrapper) return;
    wrapper.classList.remove('hidden');

    slider.addEventListener('input', () => {
        const pct = slider.value + '%';
        if (beforeImg) beforeImg.style.clipPath = `inset(0 ${100 - parseInt(slider.value)}% 0 0)`;
        if (afterImg) afterImg.style.clipPath = `inset(0 0 0 ${slider.value}%)`;
    });
}

function downloadImage() {
    if (!resultDataURL) return;
    const link = document.createElement('a');
    link.download = `upscaled-${Date.now()}.png`;
    link.href = resultDataURL;
    link.click();
}

function showUpscalerError(msg) {
    const statusEl = document.getElementById('status-text');
    if (statusEl) statusEl.textContent = '❌ ' + msg;
}

function resetUpscaler() {
    originalImage = null;
    upscalerInstance = null;
    resultDataURL = null;
    const uploadArea = document.getElementById('upload-area');
    const workspace = document.getElementById('workspace');
    if (uploadArea) uploadArea.classList.remove('hidden');
    if (workspace) { workspace.classList.add('hidden'); workspace.classList.remove('grid'); }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        validateImageSize, formatDimensions, parseScale,
        handleUpload, setupWorkspace, startUpscale, downloadImage,
        resetUpscaler, showUpscalerError, setupComparisonSlider,
        setOriginalImage: (img) => { originalImage = img; },
        setResultDataURL: (url) => { resultDataURL = url; },
        getOriginalImage: () => originalImage,
        getResultDataURL: () => resultDataURL
    };
}
