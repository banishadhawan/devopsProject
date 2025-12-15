// Navigation is now handled by hash-based routing in index.html
// This function is kept for backward compatibility if needed
function navigate(page) {
  window.location.hash = page;
}
