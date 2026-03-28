/**
 * QR Code Generator Core Logic using node-qrcode (browser build)
 * Fixed: roundRect browser compatibility, error feedback, logo embed
 */

let logoImage = null;
let generateTimer = null;

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
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} x
 * @param {number} y
 * @param {number} w
 * @param {number} h
 * @param {number} r - corner radius
 */
function roundRectFallback(ctx, x, y, w, h, r) {
  if (typeof ctx.roundRect === 'function') {
    ctx.roundRect(x, y, w, h, r);
    return;
  }
  // Polyfill using arc
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
    showQrError('QR library not loaded. Please check your internet connection.');
    return;
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
  document.addEventListener('DOMContentLoaded', generateQR);
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    debounceGenerate, handleLogoUpload, clearLogo, generateQR, downloadQR,
    roundRectFallback, showQrError, showQrSuccess
  };
}
