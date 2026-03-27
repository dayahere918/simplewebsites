/**
 * Video Compressor Core Logic using ffmpeg.wasm
 */

let videoFile = null;
let quality = 'medium';
let outputBlob = null;
let ffmpeg = null;

async function initFFmpeg() {
  if (ffmpeg) return;
  const { FFmpeg } = window.FFmpeg || {};
  if (!FFmpeg) throw new Error('FFmpeg failed to load from CDN');
  
  ffmpeg = new FFmpeg();
  ffmpeg.on('log', ({ message }) => console.log(message));
  ffmpeg.on('progress', ({ progress, time }) => {
      const el = document.getElementById('processing-status');
      if (el) el.textContent = `Compressing... ${Math.round(progress * 100)}%`;
  });

  const coreURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.js';
  const wasmURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.wasm';
  
  const statusEl = document.getElementById('processing-status');
  if(statusEl) { statusEl.textContent = 'Loading WASM models...'; statusEl.classList.remove('hidden'); }
  
  await ffmpeg.load({
      coreURL,
      wasmURL
  });
  
  if(statusEl) statusEl.classList.add('hidden');
}

function handleUpload(event) {
    const file = event.target.files[0];
    if (!file || !file.type.startsWith('video/')) return;
    videoFile = file;
    
    document.getElementById('upload-area').classList.add('hidden');
    document.getElementById('compress-ui').classList.remove('hidden');
    document.getElementById('result-ui').classList.add('hidden');
    
    // Start lazy loading ffmpeg in the background
    initFFmpeg().catch(err => {
        console.error("FFmpeg init error:", err);
        alert("Your browser does not fully support WebAssembly needed for this tool.");
    });
}

function setQuality(q) {
    quality = q;
    ['high', 'medium', 'low'].forEach(lvl => {
        const btn = document.getElementById(`btn-${lvl === 'high' ? 'hq' : lvl === 'medium' ? 'mq' : 'lq'}`);
        if(btn) {
            btn.classList.remove('active');
            btn.classList.toggle('btn-primary', lvl === q);
            btn.classList.toggle('btn-secondary', lvl !== q);
        }
    });
}

async function executeCompression() {
    if (!videoFile) return;
    
    const status = document.getElementById('processing-status');
    const btn = document.getElementById('do-compress-btn');
    btn.disabled = true;
    status.classList.remove('hidden');
    status.textContent = 'Preparing video...';
    
    try {
        await initFFmpeg(); // ensure loaded
        const { fetchFile } = window.FFmpegUtil;
        
        const inputName = 'input.' + (videoFile.name.split('.').pop() || 'mp4');
        const outputName = 'output.mp4';
        
        await ffmpeg.writeFile(inputName, await fetchFile(videoFile));
        
        // Map preset to CRF (Constant Rate Factor) - higher = more compression
        let crfValue = '28';
        if (quality === 'high') crfValue = '23';
        if (quality === 'low') crfValue = '34';

        // simple fast compression
        await ffmpeg.exec(['-i', inputName, '-vcodec', 'libx264', '-crf', crfValue, '-preset', 'ultrafast', outputName]);
        
        const data = await ffmpeg.readFile(outputName);
        outputBlob = new Blob([data.buffer], { type: 'video/mp4' });
        
        status.classList.add('hidden');
        document.getElementById('result-ui').classList.remove('hidden');
        
        const origSize = (videoFile.size / (1024 * 1024)).toFixed(2);
        const newSize = (outputBlob.size / (1024 * 1024)).toFixed(2);
        const saved = 100 - Math.round((outputBlob.size / videoFile.size) * 100);
        
        document.getElementById('saved-space').textContent = `Went from ${origSize}MB to ${newSize}MB! (Saved ${saved}%)`;
        
    } catch (e) {
        console.error(e);
        status.textContent = '❌ Compression failed. The file might be too complex or large for memory.';
        btn.disabled = false;
    }
}

function downloadVideo() {
    if (!outputBlob) return;
    const link = document.createElement('a');
    link.href = URL.createObjectURL(outputBlob);
    link.download = `compressed-${Date.now()}.mp4`;
    link.click();
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { handleUpload, setQuality, executeCompression };
}
