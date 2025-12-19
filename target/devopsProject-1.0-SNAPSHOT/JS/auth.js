// JS/auth.js

const USERS_KEY = "musicvault_users";
const CURRENT_USER_KEY = "musicvault_current_user";

// Helper to get all users
function getUsers() {
    return JSON.parse(localStorage.getItem(USERS_KEY)) || [];
}

// Helper to get current user
function getCurrentUser() {
    return JSON.parse(localStorage.getItem(CURRENT_USER_KEY));
}

// REGISTER
function registerUser(username, email, password) {
    const users = getUsers();

    // Validation
    if (users.find(u => u.email === email)) {
        throw new Error("Email already registered");
    }
    if (users.find(u => u.username === username)) {
        throw new Error("Username already taken");
    }

    const newUser = {
        id: Date.now(),
        username,
        email,
        password, // In a real app, hash this!
        joinedDate: new Date().toLocaleDateString()
    };

    users.push(newUser);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    return newUser;
}

// LOGIN
function loginUser(email, password) {
    const users = getUsers();
    const user = users.find(u => u.email === email && u.password === password);

    if (!user) {
        throw new Error("Invalid email or password");
    }

    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    return user;
}

// LOGOUT
function logoutUser() {
    localStorage.removeItem(CURRENT_USER_KEY);
    window.location.href = "login.html";
}

// CHECK AUTH & UPDATE UI
function checkAuth() {
    const user = getCurrentUser();
    const authLinks = document.getElementById("authLinks");

    // Auth Guard for protected pages
    const path = window.location.pathname;
    const isProtected = path.includes("Lib.html") || path.includes("Playlist.html") || path.includes("Profile.html");
    // player.html is semi-protected but let's allow it for now or redirect

    if (!user && isProtected) {
        window.location.href = "login.html";
        return;
    }

    // Update Navbar if exists
    // We assume Navbar structure: <div id="authLinks">...</div>
    // But our current navbar is static text. We need to grab the container.
    // Let's modify the navbar HTML to have an ID or selectable area.

    // Finding the navigation container (last div in flex)
    const navContainer = document.querySelector("nav .flex.space-x-6");
    if (navContainer) {
        if (user) {
            // Logged in view
            // Remove Login/Signup if matched by text, though we don't have them yet.
            // We will rebuild the nav or just append/modify.

            // Let's replace the last link if it's "Profile" or append "Logout"
            // Actually, let's just rewrite the end of the nav for simplicity in this demo.

            // Check if Logout button already exists to avoid duplicates
            if (!document.getElementById("logoutBtn")) {
                const logoutBtn = document.createElement("button");
                logoutBtn.id = "logoutBtn";
                logoutBtn.className = "nav-link px-3 py-2 rounded-lg hover:bg-white/10 transition-all font-medium text-red-300";
                logoutBtn.textContent = "Logout";
                logoutBtn.onclick = logoutUser;
                navContainer.appendChild(logoutBtn);
            }

            // Update Profile link text to Username
            const profileLink = document.querySelector('a[href="Profile.html"]');
            if (profileLink) {
                profileLink.textContent = `👤 ${user.username}`;
            }

        } else {
            // Logged out View
            // Modify links to point to Login where appropriate or hide protected ones?
            // For this UI, let's just Add Login button if not present.

            // In a better implementation, we would hide Library/Playlist/Player until login.
            // Let's hide them?
            const guardedLinks = document.querySelectorAll('a[href="Lib.html"], a[href="Playlist.html"], a[href="player.html"]');
            guardedLinks.forEach(link => link.style.display = 'none');

            // Check if Login link exists
            if (!document.querySelector('a[href="login.html"]')) {
                const loginLink = document.createElement("a");
                loginLink.href = "login.html";
                loginLink.className = "nav-link px-3 py-2 rounded-lg hover:bg-white/10 transition-all font-medium bg-purple-600/50 hover:bg-purple-600";
                loginLink.textContent = "Login";
                navContainer.appendChild(loginLink);
            }
        }
    }
}

// Run on load
window.addEventListener('DOMContentLoaded', checkAuth);
