// Registration Page Logic

const API_BASE_URL = 'http://localhost:5282/api';

// Redirect to todos if already logged in
if (isAuthenticated()) {
    window.location.href = 'index.html';
}

const registerForm = document.getElementById('registerForm');
const errorMessage = document.getElementById('errorMessage');
const registerBtn = document.getElementById('registerBtn');

registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Get form values
    const username = document.getElementById('username').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    // Clear previous errors
    errorMessage.style.display = 'none';
    errorMessage.innerHTML = '';

    // Client-side validation
    if (password !== confirmPassword) {
        showError('Passwords do not match');
        return;
    }

    if (password.length < 6) {
        showError('Password must be at least 6 characters long');
        return;
    }

    // Disable button during request
    registerBtn.disabled = true;
    registerBtn.textContent = 'Creating account...';

    try {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: username,
                email: email,
                password: password
            })
        });

        const data = await response.json();

        if (response.ok) {
            // Registration successful - save token and redirect
            saveAuth(data.token, data.username, data.email, data.expiresAt);
            window.location.href = 'index.html';
        } else {
            // Registration failed - display errors
            if (data.errors && Array.isArray(data.errors)) {
                // Display all validation errors
                const errorList = data.errors.map(err => `<li>${err}</li>`).join('');
                showError(`<ul>${errorList}</ul>`);
            } else {
                showError(data.message || 'Registration failed. Please try again.');
            }
        }
    } catch (error) {
        console.error('Registration error:', error);
        showError('An error occurred. Please try again.');
    } finally {
        // Re-enable button
        registerBtn.disabled = false;
        registerBtn.textContent = 'Register';
    }
});

function showError(message) {
    errorMessage.innerHTML = message;
    errorMessage.style.display = 'block';
}
