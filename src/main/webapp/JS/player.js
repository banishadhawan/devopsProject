const playerAudio = document.getElementById("audio");
const nowPlaying = document.getElementById("nowPlaying");
const seek = document.getElementById("seek");
const volume = document.getElementById("volume");
const playPauseBtn = document.getElementById("playPauseBtn");

// Initialize Player
window.addEventListener('DOMContentLoaded', async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const songId = urlParams.get('id');

  if (songId) {
    try {
      const songs = JSON.parse(localStorage.getItem("songs")) || [];
      const songMeta = songs.find(s => s.id == songId);

      if (songMeta) {
        updatePlayerUI(songMeta);
        const file = await getSongFromDB(songId);
        if (file) {
          const url = URL.createObjectURL(file);
          playerAudio.src = url;
          playerAudio.play()
            .then(() => updatePlayBtn(true))
            .catch(e => {
              if (e.name === 'NotAllowedError') {
                console.log("Auto-play blocked by browser policy. Waiting for user interaction.");
              } else {
                console.error("Auto-play blocked or failed:", e);
              }
              updatePlayBtn(false);
              // Don't show error text if just auto-play bloacked, 
              // logic handled by user clicking play.
            });
        } else {
          console.error("Song file not found in DB");
          nowPlaying.innerHTML = `<span class="text-red-400 text-xl">⚠️ File Corrupted</span><br><span class="text-sm text-gray-400">Please delete this song from library and re-upload.</span>`;
        }
      }
    } catch (e) {
      console.error("Error loading song:", e);
    }
  }
});

function updatePlayerUI(song) {
  nowPlaying.textContent = song.name;
  const songArtist = document.getElementById("songArtist");
  if (songArtist) {
    songArtist.textContent = song.artist || "Unknown Artist";
  }
}

function updatePlayBtn(isPlaying) {
  if (playPauseBtn) {
    playPauseBtn.textContent = isPlaying ? "⏸" : "▶";
  }
}

// Audio Error Handling
playerAudio.addEventListener('error', (e) => {
  console.error("Audio Error:", playerAudio.error);
  let msg = "Playback Error";
  switch (playerAudio.error.code) {
    case MediaError.MEDIA_ERR_ABORTED: msg = "Aborted"; break;
    case MediaError.MEDIA_ERR_NETWORK: msg = "Network Error"; break;
    case MediaError.MEDIA_ERR_DECODE: msg = "Decode Error (Bad Format)"; break;
    case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED: msg = "Format Not Supported"; break;
  }
  nowPlaying.innerHTML = `<span class="text-red-400 text-lg">⚠️ ${msg}</span>`;
  updatePlayBtn(false);
});

async function togglePlay() {
  if (playerAudio.paused) {
    try {
      await playerAudio.play();
      updatePlayBtn(true);
    } catch (e) {
      console.error("Play failed:", e);
      updatePlayBtn(false);
    }
  } else {
    playerAudio.pause();
    updatePlayBtn(false);
  }
}

playerAudio.addEventListener("timeupdate", () => {
  if (!seek.matches(':active')) { // Only update if user isn't dragging
    seek.value = (playerAudio.currentTime / playerAudio.duration) * 100 || 0;
  }

  // Update time display
  const currentTimeEl = document.getElementById("currentTime");
  const totalTimeEl = document.getElementById("totalTime");
  if (currentTimeEl) {
    currentTimeEl.textContent = formatTime(playerAudio.currentTime);
  }
  if (totalTimeEl) {
    totalTimeEl.textContent = formatTime(playerAudio.duration);
  }

  // Auto-play next logic could go here (check playlists)
});

function formatTime(seconds) {
  if (!isFinite(seconds)) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

seek.addEventListener("input", () => {
  const time = (seek.value / 100) * playerAudio.duration;
  if (isFinite(time)) playerAudio.currentTime = time;
});

volume.addEventListener("input", () => {
  playerAudio.volume = volume.value;
});
