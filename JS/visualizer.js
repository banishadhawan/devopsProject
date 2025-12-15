const canvas = document.getElementById("visualizer");
const ctx = canvas.getContext("2d");

canvas.width = 500;
canvas.height = 120;

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < 25; i++) {
    ctx.fillStyle = "#6366f1";
    ctx.fillRect(i * 20, canvas.height, 10, -Math.random() * 120);
  }
  requestAnimationFrame(animate);
}

animate();
