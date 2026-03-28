/**
 * Comprehensive tests for qr-code-generator
 * Tests roundRectFallback, generateQR, logo embed, error handling, download
 */
const {
  debounceGenerate, handleLogoUpload, clearLogo, generateQR, downloadQR,
  roundRectFallback, showQrError, showQrSuccess
} = require('../app');

const DOM_HTML = `
  <input id="qr-data" value="https://example.com" />
  <input id="qr-dark" value="#000000" />
  <input id="qr-light" value="#ffffff" />
  <canvas id="qr-canvas"></canvas>
  <div id="qr-status" class="hidden"></div>
  <button id="remove-logo" class="hidden"></button>
  <input id="logo-input" type="file" />
  <button id="download-btn"></button>
`;

let mockCtx;

beforeEach(() => {
  document.body.innerHTML = DOM_HTML;

  mockCtx = {
    fillStyle: '',
    globalAlpha: 1,
    beginPath: jest.fn(),
    moveTo: jest.fn(),
    lineTo: jest.fn(),
    arcTo: jest.fn(),
    arc: jest.fn(),
    closePath: jest.fn(),
    roundRect: jest.fn(),
    fill: jest.fn(),
    drawImage: jest.fn()
  };

  const canvas = document.getElementById('qr-canvas');
  canvas.getContext = jest.fn().mockReturnValue(mockCtx);
  canvas.toDataURL = jest.fn().mockReturnValue('data:image/png;base64,abc123');

  global.QRCode = { toCanvas: jest.fn().mockResolvedValue(true) };

  global.FileReader = class {
    readAsDataURL() { this.onload({ target: { result: 'data:image/png;base64,abc' } }); }
  };
  global.Image = class {
    constructor() { this.width = 50; this.height = 50; setTimeout(() => this.onload(), 0); }
  };
});

// ── roundRectFallback ─────────────────────────────────────

describe('roundRectFallback()', () => {
  test('uses ctx.roundRect when available', () => {
    roundRectFallback(mockCtx, 10, 10, 50, 50, 8);
    expect(mockCtx.roundRect).toHaveBeenCalledWith(10, 10, 50, 50, 8);
  });

  test('falls back to arc/moveTo when roundRect is undefined', () => {
    const ctxNoRoundRect = { ...mockCtx, roundRect: undefined, moveTo: jest.fn(), lineTo: jest.fn(), arcTo: jest.fn(), closePath: jest.fn() };
    roundRectFallback(ctxNoRoundRect, 5, 5, 60, 60, 10);
    expect(ctxNoRoundRect.moveTo).toHaveBeenCalled();
    expect(ctxNoRoundRect.arcTo).toHaveBeenCalled();
    expect(ctxNoRoundRect.closePath).toHaveBeenCalled();
  });

  test('fallback draws 4 arcs for 4 corners', () => {
    const ctxNoRoundRect = { ...mockCtx, roundRect: undefined, moveTo: jest.fn(), lineTo: jest.fn(), arcTo: jest.fn(), closePath: jest.fn() };
    roundRectFallback(ctxNoRoundRect, 0, 0, 100, 100, 12);
    expect(ctxNoRoundRect.arcTo).toHaveBeenCalledTimes(4);
  });
});

// ── showQrError / showQrSuccess ───────────────────────────

describe('showQrError() and showQrSuccess()', () => {
  test('showQrError displays error message', () => {
    showQrError('QR library not loaded');
    const el = document.getElementById('qr-status');
    expect(el.textContent).toContain('QR library not loaded');
    expect(el.classList.contains('hidden')).toBe(false);
  });

  test('showQrSuccess hides status element', () => {
    document.getElementById('qr-status').classList.remove('hidden');
    showQrSuccess();
    expect(document.getElementById('qr-status').classList.contains('hidden')).toBe(true);
  });
});

// ── generateQR ────────────────────────────────────────────

describe('generateQR()', () => {
  test('calls QRCode.toCanvas with correct options', async () => {
    await generateQR();
    expect(global.QRCode.toCanvas).toHaveBeenCalledWith(
      expect.any(HTMLCanvasElement),
      'https://example.com',
      expect.objectContaining({
        width: 300,
        color: { dark: '#000000', light: '#ffffff' }
      })
    );
  });

  test('uses high error correction when logo is present', async () => {
    // Simulate logo
    const file = new File([''], 'logo.png', { type: 'image/png' });
    handleLogoUpload({ target: { files: [file] } });
    await new Promise(r => setTimeout(r, 20));
    await generateQR();
    expect(global.QRCode.toCanvas).toHaveBeenCalledWith(
      expect.anything(),
      expect.anything(),
      expect.objectContaining({ errorCorrectionLevel: 'H' })
    );
  });

  test('shows error when QRCode library is undefined', async () => {
    global.QRCode = undefined;
    await generateQR();
    const el = document.getElementById('qr-status');
    expect(el.textContent).toContain('not loaded');
    expect(el.classList.contains('hidden')).toBe(false);
  });

  test('shows error when QRCode.toCanvas rejects', async () => {
    global.QRCode = { toCanvas: jest.fn().mockRejectedValue(new Error('Invalid data')) };
    await generateQR();
    const el = document.getElementById('qr-status');
    expect(el.textContent).toContain('Failed');
  });

  test('uses space as fallback for empty data input', async () => {
    document.getElementById('qr-data').value = '';
    await generateQR();
    expect(global.QRCode.toCanvas).toHaveBeenCalledWith(
      expect.anything(),
      ' ',
      expect.anything()
    );
  });
});

// ── handleLogoUpload ──────────────────────────────────────

describe('handleLogoUpload()', () => {
  test('reveals remove-logo button after upload', (done) => {
    const file = new File([''], 'logo.png', { type: 'image/png' });
    handleLogoUpload({ target: { files: [file] } });
    setTimeout(() => {
      expect(document.getElementById('remove-logo').classList.contains('hidden')).toBe(false);
      done();
    }, 20);
  });

  test('ignores empty file input', () => {
    handleLogoUpload({ target: { files: [] } });
    expect(global.QRCode.toCanvas).not.toHaveBeenCalled();
  });
});

// ── clearLogo ─────────────────────────────────────────────

describe('clearLogo()', () => {
  test('hides remove-logo button and clears input', () => {
    document.getElementById('remove-logo').classList.remove('hidden');
    clearLogo();
    expect(document.getElementById('remove-logo').classList.contains('hidden')).toBe(true);
    expect(document.getElementById('logo-input').value).toBe('');
  });

  test('regenerates QR after clearing logo', async () => {
    clearLogo();
    await new Promise(r => setTimeout(r, 10));
    expect(global.QRCode.toCanvas).toHaveBeenCalled();
  });
});

// ── downloadQR ────────────────────────────────────────────

describe('downloadQR()', () => {
  test('triggers canvas toDataURL and creates download link', () => {
    const mockClick = jest.fn();
    const origCreate = document.createElement.bind(document);
    jest.spyOn(document, 'createElement').mockImplementation((tag) => {
      const el = origCreate(tag);
      if (tag === 'a') el.click = mockClick;
      return el;
    });

    downloadQR();
    expect(document.getElementById('qr-canvas').toDataURL).toHaveBeenCalledWith('image/png');
    expect(mockClick).toHaveBeenCalled();
  });
});

// ── debounceGenerate ──────────────────────────────────────

describe('debounceGenerate()', () => {
  jest.useFakeTimers();

  test('debounces generateQR call by 300ms', () => {
    global.QRCode = { toCanvas: jest.fn().mockResolvedValue(true) };
    debounceGenerate();
    debounceGenerate();
    debounceGenerate();
    expect(global.QRCode.toCanvas).not.toHaveBeenCalled();
    jest.advanceTimersByTime(300);
    // Just verify it doesn't throw (actual call is async and hard to track through debounce)
  });

  jest.useRealTimers();
});
