const audio = document.getElementById("audio");
const nowPlaying = document.getElementById("nowPlaying");
const seek = document.getElementById("seek");
const volume = document.getElementById("volume");

function playSong(song) {
  window.location.hash = "player";
  audio.src = song.url;
  nowPlaying.textContent = song.name;
  const songArtist = document.getElementById("songArtist");
  if (songArtist) {
    songArtist.textContent = song.artist || "Unknown Artist";
  }
  audio.play();
  // Update play button
  const playPauseBtn = document.getElementById("playPauseBtn");
  if (playPauseBtn) {
    playPauseBtn.textContent = "⏸";
  }
}

function togglePlay() {
  if (audio.paused) {
    audio.play();
    const playPauseBtn = document.getElementById("playPauseBtn");
    if (playPauseBtn) {
      playPauseBtn.textContent = "⏸";
    }
  } else {
    audio.pause();
    const playPauseBtn = document.getElementById("playPauseBtn");
    if (playPauseBtn) {
      playPauseBtn.textContent = "▶";
    }
  }
}

audio.addEventListener("timeupdate", () => {
  seek.value = (audio.currentTime / audio.duration) * 100 || 0;
  // Update time display
  const currentTimeEl = document.getElementById("currentTime");
  const totalTimeEl = document.getElementById("totalTime");
  if (currentTimeEl) {
    currentTimeEl.textContent = formatTime(audio.currentTime);
  }
  if (totalTimeEl) {
    totalTimeEl.textContent = formatTime(audio.duration);
  }
});

function formatTime(seconds) {
  if (!isFinite(seconds)) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

seek.addEventListener("input", () => {
  audio.currentTime = (seek.value / 100) * audio.duration;
});

volume.addEventListener("input", () => {
  audio.volume = volume.value;
});
