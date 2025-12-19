const canvas = document.getElementById("visualizer");
const vizAudio = document.getElementById("audio");

if (canvas && vizAudio) {
  const ctx = canvas.getContext("2d");
  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;

  // Audio Context setup
  // Note: AudioContext needs user interaction to start.
  // It will start when user plays the song.
  let audioCtx;
  let analyser;
  let source;
  let isInitialized = false;

  function initAudioContext() {
    if (isInitialized) return;

    // Create AudioContext
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    analyser = audioCtx.createAnalyser();

    // Connect audio element to analyser
    try {
      source = audioCtx.createMediaElementSource(vizAudio);
      source.connect(analyser);
      analyser.connect(audioCtx.destination);
    } catch (e) {
      // This might fail if the audio is already connected or CORS issues (not applicable for blobs)
      console.error("Visualizer connection error:", e);
    }

    analyser.fftSize = 256;
    isInitialized = true;
    animate();
  }

  // Initialize on play
  vizAudio.addEventListener('play', () => {
    if (!audioCtx) initAudioContext();
    if (audioCtx.state === 'suspended') audioCtx.resume();
  });

  function animate() {
    if (!isInitialized) return;

    requestAnimationFrame(animate);

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyser.getByteFrequencyData(dataArray);

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const barWidth = (canvas.width / bufferLength) * 2.5;
    let barHeight;
    let x = 0;

    for (let i = 0; i < bufferLength; i++) {
      barHeight = dataArray[i] / 2; // Scale down

      // Gradient color based on frequency
      const r = barHeight + (25 * (i / bufferLength));
      const g = 250 * (i / bufferLength);
      const b = 50;

      ctx.fillStyle = `rgb(${r},${g},${b})`;
      ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);

      x += barWidth + 1;
    }
  }
}
