/**
 * QR Code Generator Core Logic using node-qrcode (browser build)
 * Fixed: Library load timing, roundRect compatibility, clear UX instructions
 */

let logoImage = null;
let generateTimer = null;
let qrLibReady = false;

/**
 * Wait for QRCode library to be available (CDN load timing)
 * Polls every 200ms, max 25 attempts (5 seconds)
 * @returns {Promise<boolean>}
 */
function waitForQRLib(maxAttempts = 25) {
  return new Promise((resolve) => {
    if (typeof QRCode !== 'undefined') { qrLibReady = true; resolve(true); return; }
    let attempts = 0;
    const poll = setInterval(() => {
      attempts++;
      if (typeof QRCode !== 'undefined') {
        clearInterval(poll);
        qrLibReady = true;
        resolve(true);
      } else if (attempts >= maxAttempts) {
        clearInterval(poll);
        resolve(false);
      }
    }, 200);
  });
}

function debounceGenerate() {
  clearTimeout(generateTimer);
  generateTimer = setTimeout(generateQR, 300);
}

function handleLogoUpload(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (ev) => {
    const img = new Image();
    img.onload = () => {
      logoImage = img;
      const removeBtn = document.getElementById('remove-logo');
      if (removeBtn) removeBtn.classList.remove('hidden');
      generateQR();
    };
    img.src = ev.target.result;
  };
  reader.readAsDataURL(file);
}

function clearLogo() {
  logoImage = null;
  const removeBtn = document.getElementById('remove-logo');
  if (removeBtn) removeBtn.classList.add('hidden');
  const logoInput = document.getElementById('logo-input');
  if (logoInput) logoInput.value = '';
  generateQR();
}

/**
 * Cross-browser roundRect fallback using arc()
 * ctx.roundRect() is only supported in Chrome 99+/Firefox 112+
 */
function roundRectFallback(ctx, x, y, w, h, r) {
  if (typeof ctx.roundRect === 'function') {
    ctx.roundRect(x, y, w, h, r);
    return;
  }
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}

function showQrError(msg) {
  const statusEl = document.getElementById('qr-status');
  if (statusEl) {
    statusEl.textContent = '❌ ' + msg;
    statusEl.style.color = 'var(--red, #ef4444)';
    statusEl.classList.remove('hidden');
  }
}

function showQrSuccess() {
  const statusEl = document.getElementById('qr-status');
  if (statusEl) statusEl.classList.add('hidden');
}

function showQrLoading(msg) {
  const statusEl = document.getElementById('qr-status');
  if (statusEl) {
    statusEl.textContent = msg || '⏳ Loading QR engine...';
    statusEl.style.color = 'var(--accent, #6366f1)';
    statusEl.classList.remove('hidden');
  }
}

async function generateQR() {
  const dataEl = document.getElementById('qr-data');
  const darkEl = document.getElementById('qr-dark');
  const lightEl = document.getElementById('qr-light');
  const canvas = document.getElementById('qr-canvas');

  if (!canvas) return;

  const data = (dataEl ? dataEl.value : '') || ' ';
  const colorDark = darkEl ? darkEl.value : '#000000';
  const colorLight = lightEl ? lightEl.value : '#ffffff';
  const ctx = canvas.getContext('2d');

  if (typeof QRCode === 'undefined') {
    showQrLoading('⏳ Loading QR library...');
    const loaded = await waitForQRLib();
    if (!loaded) {
      showQrError('QR library failed to load. Please refresh the page.');
      return;
    }
  }

  try {
    // Render QR code with high error correction for logo overlay
    await QRCode.toCanvas(canvas, data, {
      width: 300,
      margin: 2,
      errorCorrectionLevel: logoImage ? 'H' : 'M',
      color: {
        dark: colorDark,
        light: colorLight
      }
    });

    if (logoImage) {
      // Draw logo in the center (~25% of total size)
      const size = 300;
      const logoSize = size * 0.25;
      const logoX = (size - logoSize) / 2;
      const logoY = (size - logoSize) / 2;
      const padSize = logoSize + 10;
      const padX = (size - padSize) / 2;
      const padY = (size - padSize) / 2;

      // White background behind logo for readability
      ctx.fillStyle = colorLight;
      ctx.beginPath();
      roundRectFallback(ctx, padX, padY, padSize, padSize, 8);
      ctx.fill();

      ctx.drawImage(logoImage, logoX, logoY, logoSize, logoSize);
    }

    showQrSuccess();
  } catch (e) {
    console.error('QR generation error:', e);
    showQrError('Failed to generate QR code. Please check your input.');
  }
}

function downloadQR() {
  const canvas = document.getElementById('qr-canvas');
  if (!canvas) return;
  const link = document.createElement('a');
  link.download = `qrcode-${Date.now()}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
}

if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', async () => {
    showQrLoading('⏳ Initializing QR engine...');
    const loaded = await waitForQRLib();
    if (loaded) {
      generateQR();
    } else {
      showQrError('QR library failed to load. Please check your internet connection and refresh.');
    }
  });
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    debounceGenerate, handleLogoUpload, clearLogo, generateQR, downloadQR,
    roundRectFallback, showQrError, showQrSuccess, showQrLoading, waitForQRLib
  };
}
