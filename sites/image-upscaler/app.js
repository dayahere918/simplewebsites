/**
 * AI Image Upscaler Core Logic using UpscalerJS
 */

let originalImage = null;
let upscaler = null;
let resultDataURL = null;

function handleUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
            // Memory safety check - upscaling large images in WASM/WebGL fails often
            if (img.width > 800 || img.height > 800) {
                alert("Image is too large! Client-side AI currently supports up to 800x800 input to prevent crashing your browser.");
                return;
            }
            originalImage = img;
            document.getElementById('img-preview').src = img.src;
            
            document.getElementById('upload-area').classList.add('hidden');
            document.getElementById('workspace').classList.remove('hidden');
            document.getElementById('workspace').classList.add('grid');
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

async function startUpscale(scale) {
    if (!originalImage) return;
    
    const status = document.getElementById('status-text');
    status.textContent = 'Loading AI Model (This takes a moment)...';
    const btns = document.querySelectorAll('#loading .btn');
    
    try {
        // Hide buttons, show loading
        btns.forEach(b => b.classList.add('hidden'));
        
        // Initialize Upscaler 
        // Using default model which is currently a 2x ESPCN model out of the box in upscaler umd bundle
        if (!upscaler) {
            upscaler = new window.Upscaler();
        }

        status.textContent = 'Upscaling image pixels...';
        
        // We pass the IMG element directly to Upscaler
        resultDataURL = await upscaler.upscale(originalImage, {
            patchSize: 64,   // breaks image into chunks to save memory
            padding: 2,
            progress: (amount) => {
                status.textContent = `Upscaling... ${Math.round(amount * 100)}%`;
            }
        });

        // Show result
        document.getElementById('loading').classList.add('hidden');
        const resImg = document.getElementById('img-result');
        resImg.src = resultDataURL;
        resImg.classList.remove('hidden');
        
        document.getElementById('download-area').classList.remove('hidden');

    } catch (e) {
        console.error(e);
        status.textContent = '❌ Error upscaling. Your device might lack memory for this image.';
        btns.forEach(b => b.classList.remove('hidden'));
    }
}

function downloadImage() {
    if (!resultDataURL) return;
    const link = document.createElement('a');
    link.download = `upscaled-${Date.now()}.png`;
    link.href = resultDataURL;
    link.click();
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { handleUpload, startUpscale, downloadImage };
}
