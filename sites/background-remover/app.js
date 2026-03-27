/**
 * Background Remover Core Logic using @imgly/background-removal
 */

let originalImageURL = null;
let currentBlob = null;

async function handleUpload(event) {
  const file = event?.target?.files?.[0];
  if (!file || !file.type.startsWith('image/')) return;
  
  if (originalImageURL) URL.revokeObjectURL(originalImageURL);
  originalImageURL = URL.createObjectURL(file);
  
  document.getElementById('upload-area').classList.add('hidden');
  document.getElementById('results').classList.remove('hidden');
  document.getElementById('processing-status').textContent = 'Removing background... (This might take a few seconds)';
  
  const canvas = document.getElementById('bg-canvas');
  const ctx = canvas.getContext('2d');
  
  // Render original temp so the user knows working
  const img = new Image();
  img.onload = () => {
    // scale to max 1000px for speed
    const max = 800;
    let w = img.width, h = img.height;
    if (w > max || h > max) {
        if (w > h) { h = Math.round(h * max/w); w = max; }
        else { w = Math.round(w * max/h); h = max; }
    }
    canvas.width = w;
    canvas.height = h;
    ctx.drawImage(img, 0, 0, w, h);
  };
  img.src = originalImageURL;

  try {
    // Process with Img.ly
    if (typeof imglyRemoveBackground === 'undefined') {
      throw new Error("Imgly script not loaded. Please wait and try again.");
    }
    currentBlob = await imglyRemoveBackground(originalImageURL, {
        progress: (key, current, total) => {
            document.getElementById('processing-status').textContent = `Removing background... (${Math.round((current/total)*100)}%)`;
        }
    });

    const resultURL = URL.createObjectURL(currentBlob);
    const resultImg = new Image();
    resultImg.onload = () => {
        ctx.clearRect(0,0, canvas.width, canvas.height);
        ctx.drawImage(resultImg, 0, 0, canvas.width, canvas.height);
        document.getElementById('processing-status').textContent = '✨ Background removed successfully!';
        document.getElementById('download-btn').disabled = false;
    };
    resultImg.src = resultURL;

  } catch (error) {
    console.error("BG Removal failed", error);
    document.getElementById('processing-status').textContent = '❌ Error removing background. Ensure you are online.';
  }
}

function downloadImage() {
    if (!currentBlob) return;
    const link = document.createElement('a');
    link.href = URL.createObjectURL(currentBlob);
    link.download = `bg-removed-${Date.now()}.png`;
    link.click();
}

function resetApp() {
    document.getElementById('upload-area').classList.remove('hidden');
    document.getElementById('results').classList.add('hidden');
    document.getElementById('file-input').value = '';
    document.getElementById('download-btn').disabled = true;
    currentBlob = null;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { handleUpload, downloadImage, resetApp };
}
