/**
 * QR Code Generator Core Logic using node-qrcode (browser build)
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
            document.getElementById('remove-logo').classList.remove('hidden');
            generateQR();
        };
        img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
}

function clearLogo() {
    logoImage = null;
    document.getElementById('remove-logo').classList.add('hidden');
    document.getElementById('logo-input').value = '';
    generateQR();
}

async function generateQR() {
    const data = document.getElementById('qr-data').value || ' ';
    const colorDark = document.getElementById('qr-dark').value;
    const colorLight = document.getElementById('qr-light').value;
    const canvas = document.getElementById('qr-canvas');
    const ctx = canvas.getContext('2d');
    
    // We render the QR code with high error correction (H) so removing a chunk in the center for a logo won't break it
    try {
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
            // Draw logo in the center (approx 25% of the total size)
            const size = 300;
            const logoSize = size * 0.25;
            const offset = (size - logoSize) / 2;
            
            // Draw a white absolute background behind logo to ensure readability of the QR code regardless of logo transparency
            ctx.fillStyle = colorLight;
            ctx.beginPath();
            ctx.roundRect((size - (logoSize+10))/2, (size - (logoSize+10))/2, logoSize+10, logoSize+10, 8);
            ctx.fill();
            
            ctx.drawImage(logoImage, offset, offset, logoSize, logoSize);
        }
    } catch (e) {
        console.error(e);
    }
}

function downloadQR() {
    const canvas = document.getElementById('qr-canvas');
    const link = document.createElement('a');
    link.download = `qrcode-${Date.now()}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
}

if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', generateQR);
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { debounceGenerate, handleLogoUpload, clearLogo, generateQR, downloadQR };
}
