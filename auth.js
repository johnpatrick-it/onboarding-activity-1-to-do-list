// Authentication Utility Functions

// Get JWT token from localStorage
function getToken() {
    return localStorage.getItem('authToken');
}

// Get user info from localStorage
function getUserInfo() {
    const userInfo = localStorage.getItem('userInfo');
    return userInfo ? JSON.parse(userInfo) : null;
}

// Save authentication data
function saveAuth(token, username, email, expiresAt) {
    localStorage.setItem('authToken', token);
    localStorage.setItem('userInfo', JSON.stringify({
        username,
        email,
        expiresAt
    }));
}

// Check if user is authenticated
function isAuthenticated() {
    const token = getToken();
    if (!token) return false;

    // Optional: Check token expiration
    const userInfo = getUserInfo();
    if (userInfo && userInfo.expiresAt) {
        const expirationDate = new Date(userInfo.expiresAt);
        if (expirationDate < new Date()) {
            // Token expired, clear it
            logout();
            return false;
        }
    }

    return true;
}

// Logout - clear token and user info
function logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userInfo');
    window.location.href = 'login.html';
}

// Redirect to login if not authenticated
function requireAuth() {
    if (!isAuthenticated()) {
        window.location.href = 'login.html';
    }
}

// Display user info in the UI
function displayUserInfo() {
    const userInfo = getUserInfo();
    if (userInfo) {
        const userInfoElement = document.getElementById('userInfo');
        if (userInfoElement) {
            userInfoElement.textContent = `Logged in as: ${userInfo.username}`;
        }
    }
}
