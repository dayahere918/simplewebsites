/**
 * Glassmorphism Generator Core Logic
 */

function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : { r: 255, g: 255, b: 255 };
}

function updateGlass() {
    const blur = document.getElementById('blur').value;
    const opa = document.getElementById('opa').value;
    const out = document.getElementById('out').value;
    const colorHex = document.getElementById('glass-color').value;
    
    document.getElementById('val-blur').textContent = blur + 'px';
    document.getElementById('val-opa').textContent = opa;
    document.getElementById('val-out').textContent = out;
    
    const rgb = hexToRgb(colorHex);
    const bgRgba = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opa})`;
    const borderRgba = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${out})`;
    
    const box = document.getElementById('glass-box');
    
    box.style.backdropFilter = `blur(${blur}px)`;
    box.style.webkitBackdropFilter = `blur(${blur}px)`;
    box.style.background = bgRgba;
    box.style.border = `1px solid ${borderRgba}`;
    
    const cssCode = `/* Glassmorphism Effect */
.glass {
    background: ${bgRgba};
    border-radius: 16px;
    box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
    backdrop-filter: blur(${blur}px);
    -webkit-backdrop-filter: blur(${blur}px);
    border: 1px solid ${borderRgba};
}`;

    document.getElementById('css-output').textContent = cssCode;
}

function changeBg() {
    const val = document.getElementById('bg-image').value;
    const area = document.getElementById('preview-area');
    
    if (val === 'gradient') {
        area.style.background = 'linear-gradient(45deg, #ff00cc, #333399)';
    } else {
        area.style.background = `url(${val}) center/cover no-repeat`;
    }
}

function copyCSS() {
    const text = document.getElementById('css-output').textContent;
    if (!text) return;
    navigator.clipboard.writeText(text);
    const btn = event.target;
    btn.textContent = '✅ Copied!';
    setTimeout(() => { btn.textContent = '📋 Copy CSS'; }, 2000);
}

if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', updateGlass);
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { hexToRgb, updateGlass, changeBg, copyCSS };
}
