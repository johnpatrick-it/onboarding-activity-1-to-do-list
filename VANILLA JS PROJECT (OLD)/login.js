// Login Page Logic

const API_BASE_URL = 'http://localhost:5282/api';

// Redirect to todos if already logged in
if (isAuthenticated()) {
    window.location.href = 'index.html';
}

const loginForm = document.getElementById('loginForm');
const errorMessage = document.getElementById('errorMessage');
const loginBtn = document.getElementById('loginBtn');

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Get form values
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    // Clear previous errors
    errorMessage.style.display = 'none';
    errorMessage.textContent = '';

    // Disable button during request
    loginBtn.disabled = true;
    loginBtn.textContent = 'Logging in...';

    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: email,
                password: password
            })
        });

        const data = await response.json();

        if (response.ok) {
            // Login successful - save token and redirect
            console.log('Login successful, received data:', {
                hasToken: !!data.token,
                username: data.username,
                email: data.email,
                expiresAt: data.expiresAt
            });

            saveAuth(data.token, data.username, data.email, data.expiresAt);

            // Verify token was saved
            const savedToken = localStorage.getItem('authToken');
            const savedUserInfo = localStorage.getItem('userInfo');
            console.log('Token saved check:', {
                tokenSaved: !!savedToken,
                userInfoSaved: !!savedUserInfo,
                userInfo: savedUserInfo ? JSON.parse(savedUserInfo) : null
            });

            // Small delay to ensure localStorage is committed
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 100);
        } else {
            // Login failed - display error
            showError(data.message || 'Login failed. Please check your credentials.');
        }
    } catch (error) {
        console.error('Login error:', error);
        showError('An error occurred. Please try again.');
    } finally {
        // Re-enable button
        loginBtn.disabled = false;
        loginBtn.textContent = 'Login';
    }
});

function showError(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
}
