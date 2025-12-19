const playlistList = document.getElementById("playlistList");
const playlistName = document.getElementById("playlistName");
const pageTitle = document.querySelector("h2");
const pageDesc = document.querySelector("p");

// Data
let playlists = {};
let allSongs = [];

// Initialize
try {
  const stored = JSON.parse(localStorage.getItem("playlists"));
  if (stored && typeof stored === 'object' && !Array.isArray(stored)) {
    playlists = stored;
  } else {
    playlists = {};
  }
} catch (e) {
  console.error("Error parsing playlists", e);
  playlists = {};
}

try {
  allSongs = JSON.parse(localStorage.getItem("songs")) || [];
} catch (e) {
  allSongs = [];
}

// Global variable for current view
let currentPlaylist = null;

function createPlaylist() {
  const name = playlistName.value.trim();
  if (!name) return;

  if (playlists[name]) {
    alert("Playlist already exists!");
    return;
  }

  playlists[name] = [];
  localStorage.setItem("playlists", JSON.stringify(playlists));
  playlistName.value = "";
  renderPlaylists();
}

// Expose safely
window.createPlaylist = createPlaylist;

function renderPlaylists() {
  currentPlaylist = null;
  // Reset View
  playlistList.className = "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4";
  playlistList.innerHTML = "";

  // Reset Header
  pageTitle.innerHTML = `Your Playlists`;
  pageDesc.innerHTML = `Create and organize your music collections`;

  // Show Create Input
  playlistName.parentElement.parentElement.style.display = "block"; // Show the create box

  const keys = Object.keys(playlists);

  if (keys.length === 0) {
    playlistList.innerHTML = `
        <div class="col-span-full text-center py-12">
            <div class="text-6xl mb-4">📋</div>
            <p class="text-xl text-gray-400">No playlists yet. Create your first playlist above!</p>
        </div>
        `;
    return;
  }

  keys.forEach(p => {
    const div = document.createElement("div");
    div.className = "glass-effect rounded-xl p-6 card-hover group cursor-pointer";
    const songCount = playlists[p].length;

    div.innerHTML = `
        <div class="flex items-center justify-between">
            <div class="flex items-center gap-4">
            <div class="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                📋
            </div>
            <div>
                <h3 class="font-bold text-xl mb-1 group-hover:text-purple-400 transition-colors">${p}</h3>
                <p class="text-gray-400">${songCount} ${songCount === 1 ? 'song' : 'songs'}</p>
            </div>
            </div>
            <button class="delete-btn opacity-0 group-hover:opacity-100 transition-opacity px-4 py-2 bg-red-600/20 hover:bg-red-600/40 rounded-lg text-red-400 hover:text-red-300">
            🗑️
            </button>
        </div>
        `;

    // Click to open
    div.onclick = () => openPlaylist(p);

    // Delete
    const deleteBtn = div.querySelector('.delete-btn');
    deleteBtn.onclick = (e) => {
      e.stopPropagation();
      deletePlaylist(p);
    };

    playlistList.appendChild(div);
  });
}

function deletePlaylist(name) {
  if (confirm(`Are you sure you want to delete "${name}"?`)) {
    delete playlists[name];
    localStorage.setItem("playlists", JSON.stringify(playlists));
    renderPlaylists();
  }
}

// --- Playlist Detail View ---

function openPlaylist(name) {
  currentPlaylist = name;

  // Update Header
  pageTitle.innerHTML = `<span class="cursor-pointer hover:text-purple-400" onclick="renderPlaylists()"><i class="fas fa-arrow-left mr-2"></i></span> ${name}`;
  pageDesc.innerHTML = `${playlists[name].length} songs`;

  // Hide Create Input
  playlistName.parentElement.parentElement.style.display = "none";

  // Changing grid to list layout for songs
  playlistList.className = "flex flex-col gap-4";
  playlistList.innerHTML = "";

  // Add Song Button
  const controlsDiv = document.createElement("div");
  controlsDiv.className = "mb-4";
  controlsDiv.innerHTML = `
        <button onclick="showAddSongModal()" class="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl font-semibold hover:from-purple-500 hover:to-pink-500 transform hover:scale-105 transition-all shadow-lg">
            <i class="fas fa-plus mr-2"></i>Add Songs
        </button>
    `;
  playlistList.appendChild(controlsDiv);

  const songIds = playlists[name];

  if (songIds.length === 0) {
    const emptyMsg = document.createElement("div");
    emptyMsg.className = "text-center py-12 text-gray-400";
    emptyMsg.innerHTML = "This playlist is empty.";
    playlistList.appendChild(emptyMsg);
    return;
  }

  songIds.forEach((id, index) => {
    // Find song in library
    const song = allSongs.find(s => s.id == id); // Loose equality for string/number ID mismatch

    const div = document.createElement("div");
    div.className = "glass-effect rounded-xl p-4 flex items-center justify-between group";

    if (song) {
      div.innerHTML = `
                <div class="flex items-center gap-4">
                    <div class="text-gray-400 font-mono w-8">${index + 1}</div>
                    <div>
                        <h4 class="font-semibold text-lg text-white">${song.name}</h4>
                        <p class="text-sm text-gray-400">${song.artist || "Unknown"}</p>
                    </div>
                </div>
                <div class="flex gap-2">
                     <button onclick="playSong('${song.id}')" class="px-3 py-2 bg-purple-600/20 text-purple-400 rounded-lg hover:bg-purple-600/40">
                        <i class="fas fa-play"></i>
                    </button>
                    <button onclick="removeFromPlaylist('${id}')" class="px-3 py-2 bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600/40 opacity-0 group-hover:opacity-100 transition-opacity">
                        <i class="fas fa-minus"></i>
                    </button>
                </div>
            `;
    } else {
      // Song deleted from library but still in playlist
      div.innerHTML = `
                <div class="flex items-center gap-4 text-gray-500">
                    <div class="font-mono w-8">${index + 1}</div>
                    <div>
                        <h4 class="font-semibold text-lg italic">Song unavailable (Deleted)</h4>
                    </div>
                </div>
                <button onclick="removeFromPlaylist('${id}')" class="px-3 py-2 bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600/40">
                    <i class="fas fa-trash"></i>
                </button>
            `;
    }
    playlistList.appendChild(div);
  });
}
window.openPlaylist = openPlaylist;

function removeFromPlaylist(songId) {
  if (!currentPlaylist) return;

  playlists[currentPlaylist] = playlists[currentPlaylist].filter(id => id != songId);
  localStorage.setItem("playlists", JSON.stringify(playlists));
  openPlaylist(currentPlaylist); // Re-render
}
window.removeFromPlaylist = removeFromPlaylist;

function playSong(id) {
  window.location.href = `player.html?id=${id}`;
}
window.playSong = playSong;


// --- Modal for Adding Songs ---
function showAddSongModal() {
  // Check if modal exists
  let modal = document.getElementById("addSongModal");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "addSongModal";
    modal.className = "fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 hidden";
    modal.innerHTML = `
            <div class="bg-[#1a1a2e] rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden border border-white/10 flex flex-col">
                <div class="p-6 border-b border-white/10 flex justify-between items-center">
                    <h3 class="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Add to Playlist</h3>
                    <button onclick="closeModal()" class="text-gray-400 hover:text-white"><i class="fas fa-times text-xl"></i></button>
                </div>
                <div class="p-4 overflow-y-auto flex-1" id="modalSongList">
                    <!-- Songs go here -->
                </div>
            </div>
        `;
    document.body.appendChild(modal);
  }

  const list = modal.querySelector("#modalSongList");
  list.innerHTML = "";

  // Filter songs already in playlist
  const currentIds = playlists[currentPlaylist] || [];
  const availableSongs = allSongs.filter(s => !currentIds.includes(s.id)); // ID types might need care

  if (availableSongs.length === 0) {
    list.innerHTML = `<p class="text-center text-gray-400 py-8">No available songs to add.</p>`;
  } else {
    availableSongs.forEach(song => {
      const div = document.createElement("div");
      div.className = "flex items-center justify-between p-3 hover:bg-white/5 rounded-lg border-b border-white/5 last:border-0";
      div.innerHTML = `
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded bg-gray-700 flex items-center justify-center">🎵</div>
                    <div>
                        <div class="font-medium text-white">${song.name}</div>
                        <div class="text-xs text-gray-400">${song.artist || "Unknown"}</div>
                    </div>
                </div>
                <button class="add-btn px-3 py-1 bg-purple-600 rounded text-sm hover:bg-purple-500">Add</button>
             `;

      div.querySelector(".add-btn").onclick = () => {
        addSongToPlaylist(song.id);
        div.remove(); // Remove from available list immediately
      };
      list.appendChild(div);
    });
  }

  modal.classList.remove("hidden");
}
window.showAddSongModal = showAddSongModal;

function closeModal() {
  const modal = document.getElementById("addSongModal");
  if (modal) modal.classList.add("hidden");
  // Re-render playlist to show added songs
  if (currentPlaylist) openPlaylist(currentPlaylist);
}
window.closeModal = closeModal;

function addSongToPlaylist(songId) {
  if (!currentPlaylist) return;
  playlists[currentPlaylist].push(songId);
  localStorage.setItem("playlists", JSON.stringify(playlists));
}

// Ensure init
document.addEventListener('DOMContentLoaded', () => {
  renderPlaylists();

  // Optional: Add Enter key support
  playlistName.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') createPlaylist();
  });
});
