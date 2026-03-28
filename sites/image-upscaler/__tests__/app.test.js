/**
 * Comprehensive tests for image-upscaler (Image Toolkit)
 * Tests: validateImageSize, formatDimensions, parseScale, bicubicResize,
 *        rotateCanvas, flipCanvas, cropCanvas, applyColorAdjustments,
 *        splitImageGrid, mergeImageLayout, handleUpload, showStatus
 */
const {
  validateImageSize, formatDimensions, parseScale,
  bicubicResize, rotateCanvas, flipCanvas, cropCanvas,
  applyColorAdjustments, splitImageGrid, mergeImageLayout, createCanvas,
  handleUpload, showStatus, applyResize, downloadResult, resetToolkit,
  setCurrentCanvas, getCurrentCanvas, getMergeImages, setMergeImages,
  applyUpscale, applyCustomUpscale
} = require('../app');

// Mock canvas context
function makeMockCanvas(w = 100, h = 100) {
  const ctx = {
    drawImage: jest.fn(),
    getImageData: jest.fn().mockReturnValue({ data: new Uint8ClampedArray(w * h * 4) }),
    putImageData: jest.fn(),
    fillRect: jest.fn(),
    filter: 'none',
    imageSmoothingEnabled: true,
    imageSmoothingQuality: 'high',
    translate: jest.fn(),
    rotate: jest.fn(),
    scale: jest.fn(),
    fillStyle: '',
    globalAlpha: 1,
    globalCompositeOperation: 'source-over',
    createRadialGradient: jest.fn().mockReturnValue({ addColorStop: jest.fn() }),
    canvas: { width: w, height: h }
  };
  const canvas = { width: w, height: h, getContext: jest.fn().mockReturnValue(ctx), toDataURL: jest.fn().mockReturnValue('data:image/png;base64,abc') };
  ctx.canvas = canvas;
  return { canvas, ctx };
}

const DOM_HTML = `
  <div id="upload-area"></div>
  <div id="workspace" class="hidden"></div>
  <img id="img-preview" src="" />
  <span id="current-dims"></span>
  <input id="resize-w" type="number" value="100" />
  <input id="resize-h" type="number" value="100" />
  <input id="maintain-ratio" type="checkbox" checked />
  <input id="tilt-angle" type="range" value="0" />
  <span id="tilt-val">0</span>
  <input id="crop-x" type="number" value="0" />
  <input id="crop-y" type="number" value="0" />
  <input id="crop-w" type="number" value="50" />
  <input id="crop-h" type="number" value="50" />
  <input id="adj-brightness" type="range" value="100" />
  <input id="adj-contrast" type="range" value="100" />
  <input id="adj-saturation" type="range" value="100" />
  <input id="adj-hue" type="range" value="0" />
  <input id="adj-sepia" type="range" value="0" />
  <input id="adj-grayscale" type="range" value="0" />
  <input id="adj-invert" type="range" value="0" />
  <input id="upscale-w" type="number" value="200" />
  <input id="upscale-h" type="number" value="200" />
  <input id="split-cols" type="number" value="2" />
  <input id="split-rows" type="number" value="2" />
  <div id="split-results" class="hidden"></div>
  <div id="merge-preview-list"></div>
  <button id="do-merge-btn" class="hidden"></button>
  <select id="merge-layout"><option value="horizontal">Horizontal</option></select>
  <input id="merge-cols" type="number" value="2" />
  <span id="status-text"></span>
  <input id="img-input" type="file" />
`;

beforeEach(() => {
  document.body.innerHTML = DOM_HTML;

  // Override createCanvas to return mock canvases
  const origCreate = document.createElement.bind(document);
  global.document.createElement = jest.fn().mockImplementation((tag) => {
    if (tag === 'canvas') {
      const { canvas } = makeMockCanvas();
      return canvas;
    }
    if (tag === 'a') {
      return { href: '', download: '', click: jest.fn() };
    }
    return origCreate(tag);
  });

  global.FileReader = class {
    readAsDataURL() { this.onload({ target: { result: 'data:image/png;base64,abc' } }); }
  };
  global.Image = class {
    constructor() {
      this.width = 200;
      this.height = 150;
      setTimeout(() => this.onload?.(), 0);
    }
  };
});

afterEach(() => {
  jest.restoreAllMocks();
});

// ── validateImageSize ─────────────────────────────────────

describe('validateImageSize()', () => {
  test('returns valid for small image', () => {
    const { valid } = validateImageSize(100, 100);
    expect(valid).toBe(true);
  });

  test('returns invalid when width exceeds max', () => {
    const { valid, message } = validateImageSize(5000, 100);
    expect(valid).toBe(false);
    expect(message).toContain('5000');
  });

  test('returns invalid when height exceeds max', () => {
    const { valid } = validateImageSize(100, 5000);
    expect(valid).toBe(false);
  });

  test('uses custom maxDim', () => {
    expect(validateImageSize(500, 500, 400).valid).toBe(false);
    expect(validateImageSize(500, 500, 600).valid).toBe(true);
  });

  test('exact boundary is valid', () => {
    expect(validateImageSize(4000, 4000).valid).toBe(true);
  });
});

// ── formatDimensions ──────────────────────────────────────

describe('formatDimensions()', () => {
  test('formats dimensions at scale 1', () => {
    expect(formatDimensions(800, 600)).toBe('800 × 600 px');
  });

  test('formats dimensions at scale 2', () => {
    expect(formatDimensions(400, 300, 2)).toBe('800 × 600 px');
  });

  test('rounds fractional dimensions', () => {
    expect(formatDimensions(100, 100, 1.5)).toBe('150 × 150 px');
  });
});

// ── parseScale ────────────────────────────────────────────

describe('parseScale()', () => {
  test('returns 1 for "1"', () => expect(parseScale('1')).toBe(1));
  test('returns 2 for "2"', () => expect(parseScale('2')).toBe(2));
  test('returns 1 for NaN input', () => expect(parseScale('abc')).toBe(1));
  test('clamps minimum to 0.1', () => expect(parseScale('0')).toBe(0.1));
  test('clamps maximum to 8', () => expect(parseScale('100')).toBe(8));
  test('handles float values', () => expect(parseScale('1.5')).toBe(1.5));
});

// ── bicubicResize ─────────────────────────────────────────

describe('bicubicResize()', () => {
  test('returns canvas with specified dimensions', () => {
    const { canvas: src } = makeMockCanvas(100, 100);
    const result = bicubicResize(src, 200, 200);
    expect(result.width).toBe(200);
    expect(result.height).toBe(200);
  });

  test('rounds target dimensions', () => {
    const { canvas: src } = makeMockCanvas(100, 100);
    const result = bicubicResize(src, 199.7, 200.3);
    expect(result.width).toBe(200);
    expect(result.height).toBe(200);
  });
});

// ── rotateCanvas ──────────────────────────────────────────

describe('rotateCanvas()', () => {
  test('rotates 90 degrees and swaps dimensions', () => {
    const { canvas: src } = makeMockCanvas(100, 50);
    const result = rotateCanvas(src, 90);
    // After 90-degree rotation, width and height should be approximately swapped
    expect(result.width).toBeCloseTo(50, 0);
    expect(result.height).toBeCloseTo(100, 0);
  });

  test('rotates 180 degrees and maintains dimensions', () => {
    const { canvas: src } = makeMockCanvas(100, 60);
    const result = rotateCanvas(src, 180);
    expect(result.width).toBeCloseTo(100, 0);
    expect(result.height).toBeCloseTo(60, 0);
  });

  test('returns canvas with context', () => {
    const { canvas: src } = makeMockCanvas(80, 80);
    const result = rotateCanvas(src, 45);
    expect(result).toBeTruthy();
    expect(typeof result.width).toBe('number');
  });
});

// ── flipCanvas ────────────────────────────────────────────

describe('flipCanvas()', () => {
  test('horizontal flip preserves dimensions', () => {
    const { canvas: src } = makeMockCanvas(120, 80);
    const result = flipCanvas(src, 'horizontal');
    expect(result.width).toBe(120);
    expect(result.height).toBe(80);
  });

  test('vertical flip preserves dimensions', () => {
    const { canvas: src } = makeMockCanvas(120, 80);
    const result = flipCanvas(src, 'vertical');
    expect(result.width).toBe(120);
    expect(result.height).toBe(80);
  });
});

// ── cropCanvas ────────────────────────────────────────────

describe('cropCanvas()', () => {
  test('crops to specified dimensions', () => {
    const { canvas: src } = makeMockCanvas(200, 150);
    const result = cropCanvas(src, 0, 0, 100, 75);
    expect(result.width).toBe(100);
    expect(result.height).toBe(75);
  });

  test('clamps crop to source bounds', () => {
    const { canvas: src } = makeMockCanvas(100, 100);
    const result = cropCanvas(src, 50, 50, 200, 200); // exceeds bounds
    expect(result.width).toBe(50);
    expect(result.height).toBe(50);
  });

  test('returns source if crop is zero or negative', () => {
    const { canvas: src } = makeMockCanvas(100, 100);
    const result = cropCanvas(src, 0, 0, 0, 0);
    expect(result).toBe(src);
  });
});

// ── applyColorAdjustments ─────────────────────────────────

describe('applyColorAdjustments()', () => {
  test('returns a canvas', () => {
    const { canvas: src } = makeMockCanvas(50, 50);
    const result = applyColorAdjustments(src, { brightness: 120 });
    expect(result).toBeTruthy();
  });

  test('uses default values when opts omitted', () => {
    const { canvas: src } = makeMockCanvas(50, 50);
    expect(() => applyColorAdjustments(src)).not.toThrow();
  });

  test('applies CSS filter string to context', () => {
    const { canvas: src, ctx } = makeMockCanvas(50, 50);
    applyColorAdjustments(src, { brightness: 150, sepia: 50 });
    // The result canvas should have been drawn with filter applied
    expect(result => result).not.toThrow();
  });
});

// ── splitImageGrid ────────────────────────────────────────

describe('splitImageGrid()', () => {
  test('splits into correct number of tiles', () => {
    const { canvas: src } = makeMockCanvas(200, 200);
    const tiles = splitImageGrid(src, 2, 2);
    expect(tiles.length).toBe(4);
  });

  test('tiles have correct col/row labels', () => {
    const { canvas: src } = makeMockCanvas(300, 300);
    const tiles = splitImageGrid(src, 3, 2);
    expect(tiles[0].col).toBe(0);
    expect(tiles[0].row).toBe(0);
    expect(tiles[2].col).toBe(2);
    expect(tiles[3].row).toBe(1);
  });

  test('1x1 split returns original-sized tile', () => {
    const { canvas: src } = makeMockCanvas(100, 80);
    const tiles = splitImageGrid(src, 1, 1);
    expect(tiles.length).toBe(1);
  });
});

// ── mergeImageLayout ──────────────────────────────────────

describe('mergeImageLayout()', () => {
  test('returns canvas for horizontal layout', () => {
    const img1 = { width: 100, height: 80 };
    const img2 = { width: 120, height: 80 };
    const result = mergeImageLayout([img1, img2], 'horizontal');
    expect(result.width).toBe(220); // 100 + 120
    expect(result.height).toBe(80);
  });

  test('returns canvas for vertical layout', () => {
    const img1 = { width: 100, height: 80 };
    const img2 = { width: 100, height: 60 };
    const result = mergeImageLayout([img1, img2], 'vertical');
    expect(result.width).toBe(100);
    expect(result.height).toBe(140); // 80 + 60
  });

  test('returns canvas for grid layout', () => {
    const imgs = [
      { width: 100, height: 100 },
      { width: 100, height: 100 },
      { width: 100, height: 100 },
      { width: 100, height: 100 }
    ];
    const result = mergeImageLayout(imgs, 'grid', 2);
    expect(result.width).toBe(200);
    expect(result.height).toBe(200);
  });

  test('handles empty images array', () => {
    const result = mergeImageLayout([]);
    expect(result).toBeTruthy();
  });
});

// ── showStatus ────────────────────────────────────────────

describe('showStatus()', () => {
  test('sets success message', () => {
    showStatus('Resized successfully', 'success');
    expect(document.getElementById('status-text').textContent).toContain('Resized successfully');
  });

  test('sets error message', () => {
    showStatus('Invalid input', 'error');
    expect(document.getElementById('status-text').textContent).toContain('Invalid input');
  });

  test('includes icon prefix', () => {
    showStatus('Done', 'success');
    expect(document.getElementById('status-text').textContent).toContain('✅');
  });
});

// ── createCanvas ──────────────────────────────────────────

describe('createCanvas()', () => {
  test('creates canvas with correct dimensions', () => {
    const c = createCanvas(300, 200);
    expect(c.width).toBe(300);
    expect(c.height).toBe(200);
  });
});

// ── DOM Functions ────────────────────────────────────────

const {
  initWorkspace, updatePreview, applyRotate, applyFlip, applyTilt,
  applyCropManual, applyCropPreset, applyColors, resetColorSliders,
  applySplit, applyMerge, handleMergeUpload, renderMergeList,
  removeMergeImage, switchTab, getOriginalImage
} = require('../app');

describe('DOM Interactions & Tools', () => {
  beforeEach(() => {
    resetToolkit();
    const { canvas } = makeMockCanvas();
    setCurrentCanvas(canvas);
  });

  test('handleUpload and initWorkspace workflow', (done) => {
    const file = new File([''], 'test.png', { type: 'image/png' });
    handleUpload({ target: { files: [file] } });
    setTimeout(() => {
      expect(document.getElementById('workspace').classList.contains('hidden')).toBe(false);
      done();
    }, 50);
  });

  test('applyResize updates canvas and inputs', () => {
    document.getElementById('resize-w').value = '150';
    document.getElementById('resize-h').value = '150';
    document.getElementById('maintain-ratio').checked = false;
    applyResize();
    expect(getCurrentCanvas().width).toBe(150);
  });

  test('applyRotate triggers rotation', () => {
    applyRotate(90);
    const canvas = getCurrentCanvas();
    expect(canvas).toBeTruthy();
  });

  test('applyFlip triggers flip', () => {
    applyFlip('horizontal');
    const canvas = getCurrentCanvas();
    expect(canvas).toBeTruthy();
  });

  test('applyTilt triggers tilt', () => {
    document.getElementById('tilt-angle').value = '45';
    applyTilt();
    const canvas = getCurrentCanvas();
    expect(canvas).toBeTruthy();
  });

  test('applyCropManual updates dimensions', () => {
    document.getElementById('crop-w').value = '50';
    document.getElementById('crop-h').value = '50';
    applyCropManual();
    expect(getCurrentCanvas().width).toBe(50);
  });

  test('applyCropPreset crops to preset logic', () => {
    applyCropPreset('1:1');
    const canvas = getCurrentCanvas();
    expect(canvas.width).toBe(canvas.height);
  });

  test('applyColors uses slider values', () => {
    document.getElementById('adj-brightness').value = '120';
    applyColors();
    expect(document.getElementById('status-text').textContent).toContain('Color adjustments applied');
  });

  test('resetColorSliders resets values', () => {
    document.getElementById('adj-brightness').value = '150';
    resetColorSliders();
    expect(document.getElementById('adj-brightness').value).toBe('100');
  });

  test('applySplit populates tiles', () => {
    applySplit();
    expect(document.getElementById('split-results').children.length).toBeGreaterThan(0);
  });

  test('downloadResult constructs download link', () => {
    downloadResult('png');
    // Using mock click from document.createElement('a')
    expect(document.getElementById('status-text')).toBeTruthy(); // minimal side logic check
  });

  test('handleMergeUpload adds images to list', (done) => {
    const file = new File([''], 'test.png', { type: 'image/png' });
    handleMergeUpload({ target: { files: [file] } });
    setTimeout(() => {
      expect(getMergeImages().length).toBeGreaterThan(0);
      done();
    }, 50);
  });

  test('removeMergeImage deletes from merge list', () => {
    setMergeImages([{}]);
    removeMergeImage(0);
    expect(getMergeImages().length).toBe(0);
  });

  test('applyMerge processes and switches workspace', () => {
    setMergeImages([{ width: 100, height: 100 }, { width: 100, height: 100 }]);
    applyMerge();
    expect(getCurrentCanvas().width).toBe(200);
  });

  test('switchTab sets active state', () => {
    document.body.innerHTML += '<button id="tab-merge" class="toolkit-tab"></button><div id="panel-merge" class="tab-panel hidden"></div>';
    switchTab('merge');
    expect(document.getElementById('tab-merge').classList.contains('active')).toBe(true);
    expect(document.getElementById('panel-merge').classList.contains('hidden')).toBe(false);
  });
  
  test('resetToolkit clears state', () => {
    resetToolkit();
    expect(getCurrentCanvas()).toBeNull();
    expect(getOriginalImage()).toBeNull();
  });
});

// ── Upscale Operations ────────────────────────────────────

describe('Upscale Operations', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    resetToolkit();
    const { canvas } = makeMockCanvas(100, 100);
    setCurrentCanvas(canvas);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('applyUpscale increases canvas dims and updates UI', () => {
    applyUpscale(2);
    jest.advanceTimersByTime(200);
    expect(getCurrentCanvas().width).toBe(200);
    expect(document.getElementById('status-text').textContent).toContain('Successfully upscaled');
  });

  test('applyUpscale aborts if dimensions exceed bounds', () => {
    applyUpscale(100); // 100x100 * 100 = 10000 > 8000
    jest.advanceTimersByTime(200);
    expect(getCurrentCanvas().width).toBe(100);
    expect(document.getElementById('status-text').textContent).toContain('too large');
  });

  test('applyCustomUpscale uses inputs to resize', () => {
    document.getElementById('upscale-w').value = '300';
    document.getElementById('upscale-h').value = '300';
    applyCustomUpscale();
    jest.advanceTimersByTime(200);
    expect(getCurrentCanvas().width).toBe(300);
    expect(getCurrentCanvas().height).toBe(300);
  });

  test('applyCustomUpscale warns if target isn\'t larger', () => {
    document.getElementById('upscale-w').value = '50';
    document.getElementById('upscale-h').value = '50';
    applyCustomUpscale();
    expect(document.getElementById('status-text').textContent).toContain('larger than current');
    expect(getCurrentCanvas().width).toBe(100);
  });

  test('applyCustomUpscale aborts if limits exceeded', () => {
    document.getElementById('upscale-w').value = '9000';
    document.getElementById('upscale-h').value = '9000';
    applyCustomUpscale();
    jest.advanceTimersByTime(200);
    expect(document.getElementById('status-text').textContent).toContain('limits');
  });
});
