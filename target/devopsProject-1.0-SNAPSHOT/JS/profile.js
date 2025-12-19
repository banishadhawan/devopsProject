// Profile page functionality with localStorage

// Initialize profile data on page load
document.addEventListener('DOMContentLoaded', () => {
    loadProfileData();
    setupAutoSave();
});

// Load profile data from localStorage
function loadProfileData() {
    // Prefer authenticated user from auth.js, fallback to userProfile
    const currentUser = (typeof getCurrentUser === 'function') ? getCurrentUser() : null;
    const storedProfile = JSON.parse(localStorage.getItem('userProfile')) || {};
    const profileData = {
        name: storedProfile.name || currentUser?.username || '',
        email: storedProfile.email || currentUser?.email || '',
        password: storedProfile.password || currentUser?.password || ''
    };

    // Populate form fields with saved data
    document.getElementById('nameInput').value = profileData.name || '';
    document.getElementById('emailInput').value = profileData.email || '';
    document.getElementById('passwordInput').value = profileData.password || '';

    // Update display name
    updateDisplayName(profileData.name);
}

// Toggle edit mode for email or password
function toggleEditMode(field) {
    if (field === 'email') {
        const input = document.getElementById('emailInput');
        const saveBtn = document.getElementById('emailSaveBtn');
        const editIcon = document.getElementById('emailEditIcon');
        input.disabled = !input.disabled ? true : false; // ensure toggle enables editing
        input.disabled = false;
        saveBtn.classList.remove('hidden');
        editIcon.classList.add('hidden');
        input.focus();
    } else if (field === 'password') {
        const input = document.getElementById('passwordInput');
        const saveBtn = document.getElementById('passwordSaveBtn');
        const editIcon = document.getElementById('passwordEditIcon');
        input.disabled = false;
        saveBtn.classList.remove('hidden');
        editIcon.classList.add('hidden');
        input.focus();
    }
}

// Update the display name at the top
function updateDisplayName(name) {
    const displayName = document.getElementById('displayName');
    if (displayName) {
        displayName.textContent = name ? `Welcome, ${name}` : 'Welcome, User';
    }
}

// Setup auto-save for name field
function setupAutoSave() {
    const nameInput = document.getElementById('nameInput');
    let saveTimeout;

    nameInput.addEventListener('input', (e) => {
        const name = e.target.value;

        // Clear previous timeout
        clearTimeout(saveTimeout);

        // Show saving status
        showSaveStatus('Saving...');

        // Save after 500ms of no typing
        saveTimeout = setTimeout(() => {
            if (name.trim()) {
                const profileData = JSON.parse(localStorage.getItem('userProfile')) || {};
                profileData.name = name;
                localStorage.setItem('userProfile', JSON.stringify(profileData));

                // Update display name
                updateDisplayName(name);

                // Show saved status
                showSaveStatus('Saved');
                setTimeout(() => showSaveStatus(''), 2000);
            }
        }, 500);
    });
}

// Show save status indicator
function showSaveStatus(status) {
    const statusEl = document.getElementById('nameStatus');
    if (statusEl) {
        statusEl.textContent = status;
        if (status === 'Saved') {
            statusEl.className = 'text-xs text-green-400';
        } else if (status === 'Saving...') {
            statusEl.className = 'text-xs text-yellow-400';
        }
    }
}

// Save email to localStorage
function saveEmail() {
    const email = document.getElementById('emailInput').value;
    
    if (!email.trim()) {
        alert('Please enter an email');
        return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        alert('Please enter a valid email address');
        return;
    }

    const profileData = JSON.parse(localStorage.getItem('userProfile')) || {};
    profileData.email = email;
    localStorage.setItem('userProfile', JSON.stringify(profileData));

    // If auth is in use, also update the current user and users list
    try {
        if (typeof getCurrentUser === 'function' && typeof getUsers === 'function') {
            const CURRENT_USER_KEY = 'musicvault_current_user';
            const USERS_KEY = 'musicvault_users';
            const current = getCurrentUser();
            if (current) {
                // Update users array
                const users = getUsers();
                const idx = users.findIndex(u => u.id === current.id);
                if (idx !== -1) {
                    users[idx].email = email;
                    localStorage.setItem(USERS_KEY, JSON.stringify(users));
                }
                // Update current user
                current.email = email;
                localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(current));
            }
        }
    } catch {}

    // Disable edit mode
    document.getElementById('emailInput').disabled = true;
    document.getElementById('emailSaveBtn').classList.add('hidden');
    document.getElementById('emailEditIcon').classList.remove('hidden');

    showNotification('Email saved successfully!');
}

// Save password to localStorage
function savePassword() {
    const password = document.getElementById('passwordInput').value;
    
    if (!password.trim()) {
        alert('Please enter a password');
        return;
    }

    if (password.length < 6) {
        alert('Password must be at least 6 characters long');
        return;
    }

    const profileData = JSON.parse(localStorage.getItem('userProfile')) || {};
    profileData.password = password;
    localStorage.setItem('userProfile', JSON.stringify(profileData));

    // Disable edit mode
    document.getElementById('passwordInput').disabled = true;
    document.getElementById('passwordSaveBtn').classList.add('hidden');
    document.getElementById('passwordEditIcon').classList.remove('hidden');

    showNotification('Password saved successfully!');
}

// Toggle password visibility
function togglePasswordVisibility() {
    const input = document.getElementById('passwordInput');
    const icon = document.getElementById('passwordToggleIcon');

    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        input.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
}

// Show temporary notification
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-semibold shadow-lg animate-fade-in z-50';
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transition = 'opacity 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Optional: Add Enter key support for saving
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('nameInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !document.getElementById('nameInput').disabled) saveName();
    });
    document.getElementById('emailInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !document.getElementById('emailInput').disabled) saveEmail();
    });
    document.getElementById('passwordInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !document.getElementById('passwordInput').disabled) savePassword();
    });
});

// Explicit save for name when pressing Enter
function saveName() {
    const nameInput = document.getElementById('nameInput');
    const name = nameInput.value;
    if (!name.trim()) return;
    const profileData = JSON.parse(localStorage.getItem('userProfile')) || {};
    profileData.name = name;
    localStorage.setItem('userProfile', JSON.stringify(profileData));
    updateDisplayName(name);
    showSaveStatus('Saved');
    setTimeout(() => showSaveStatus(''), 2000);
}
