let playlists = JSON.parse(localStorage.getItem("playlists")) || {};
const playlistList = document.getElementById("playlistList");
const playlistName = document.getElementById("playlistName");

function createPlaylist() {
  const name = playlistName.value.trim();
  if (!name) return;

  playlists[name] = [];
  localStorage.setItem("playlists", JSON.stringify(playlists));
  playlistName.value = "";
  renderPlaylists();
}

function renderPlaylists() {
  playlistList.innerHTML = "";
  if (Object.keys(playlists).length === 0) {
    playlistList.innerHTML = `
      <div class="col-span-full text-center py-12">
        <div class="text-6xl mb-4">📋</div>
        <p class="text-xl text-gray-400">No playlists yet. Create your first playlist above!</p>
      </div>
    `;
    return;
  }
  Object.keys(playlists).forEach(p => {
    const div = document.createElement("div");
    div.className = "glass-effect rounded-xl p-6 card-hover group";
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
        <button onclick="deletePlaylist('${p}')" class="opacity-0 group-hover:opacity-100 transition-opacity px-4 py-2 bg-red-600/20 hover:bg-red-600/40 rounded-lg text-red-400 hover:text-red-300">
          🗑️
        </button>
      </div>
    `;
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

renderPlaylists();
