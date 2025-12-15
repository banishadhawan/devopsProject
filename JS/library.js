const upload = document.getElementById("upload");
const songList = document.getElementById("songList");
const uploadLabel = upload?.parentElement?.querySelector("label");

let songs = JSON.parse(localStorage.getItem("songs")) || [];

function addFiles(files) {
  [...files].forEach(file => {
    if (file.type.startsWith("audio/")) {
      songs.push({
        id: Date.now() + Math.random(),
        name: file.name,
        url: URL.createObjectURL(file)
      });
    }
  });

  localStorage.setItem("songs", JSON.stringify(songs));
  renderSongs();
}

upload?.addEventListener("change", () => {
  addFiles(upload.files);
});

// Drag and drop functionality
if (uploadLabel) {
  uploadLabel.addEventListener("dragover", (e) => {
    e.preventDefault();
    uploadLabel.style.borderColor = "#a855f7";
    uploadLabel.style.backgroundColor = "rgba(168, 85, 247, 0.1)";
  });

  uploadLabel.addEventListener("dragleave", () => {
    uploadLabel.style.borderColor = "rgba(168, 85, 247, 0.5)";
    uploadLabel.style.backgroundColor = "transparent";
  });

  uploadLabel.addEventListener("drop", (e) => {
    e.preventDefault();
    uploadLabel.style.borderColor = "rgba(168, 85, 247, 0.5)";
    uploadLabel.style.backgroundColor = "transparent";
    
    if (e.dataTransfer.files.length > 0) {
      addFiles(e.dataTransfer.files);
    }
  });
}

function renderSongs() {
  songList.innerHTML = "";
  if (songs.length === 0) {
    songList.innerHTML = `
      <div class="col-span-full text-center py-12">
        <div class="text-6xl mb-4">🎵</div>
        <p class="text-xl text-gray-400">No songs yet. Upload some music to get started!</p>
      </div>
    `;
    return;
  }
  songs.forEach(song => {
    const div = document.createElement("div");
    div.className = "glass-effect rounded-xl p-4 cursor-pointer card-hover group";
    div.innerHTML = `
      <div class="flex items-center gap-4">
        <div class="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
          🎵
        </div>
        <div class="flex-1 min-w-0">
          <h3 class="font-semibold text-lg truncate group-hover:text-purple-400 transition-colors">${song.name}</h3>
          <p class="text-sm text-gray-400 truncate">${song.artist || "Unknown Artist"}</p>
        </div>
        <button class="opacity-0 group-hover:opacity-100 transition-opacity px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg hover:from-purple-500 hover:to-pink-500">
          ▶ Play
        </button>
      </div>
    `;
    div.onclick = () => playSong(song);
    songList.appendChild(div);
  });
}

renderSongs();
