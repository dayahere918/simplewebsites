/**
 * Background Remover Core Logic using img.ly
 */

function handleUpload(event) {
    const file = event.target.files[0];
    if (!file || !file.type.startsWith('image/')) return;
    
    const status = document.getElementById('processing-status');
    if (status) {
        status.textContent = 'Removing background...';
        status.classList.remove('hidden');
    }
    
    if (document.getElementById('upload-area')) {
        document.getElementById('upload-area').classList.add('hidden');
    }
    
    const img = new Image();
    img.onload = async () => {
        try {
            if (typeof imglyRemoveBackground !== 'function') {
                throw new Error("imglyRemoveBackground not loaded");
            }
            const resultBlob = await imglyRemoveBackground(img);
            const url = URL.createObjectURL(resultBlob);
            
            const rImg = document.getElementById('result-img');
            if (rImg) rImg.src = url;
            const dLink = document.getElementById('download-link');
            if (dLink) dLink.href = url;
            
            if (status) status.classList.add('hidden');
            const rUi = document.getElementById('result-ui');
            if (rUi) rUi.classList.remove('hidden');
        } catch (e) {
            console.error("BG Removal Error:", e);
            if (status) {
                status.textContent = "❌ Error: Background removal failed.";
                status.classList.remove('hidden');
            }
        }
    };
    img.src = URL.createObjectURL(file);
}

function resetApp() {
    location.reload(); 
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { handleUpload, resetApp };
}
