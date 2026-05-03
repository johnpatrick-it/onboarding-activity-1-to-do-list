// AUTH SERVICE: Authentication utilities
// SAME as Vue version - vanilla JavaScript works perfectly in React!

// Get JWT token from localStorage
export function getToken() {
  return localStorage.getItem('authToken')
}

// Get user info from localStorage (parsed from JSON)
export function getUserInfo() {
  const userInfo = localStorage.getItem('userInfo')
  return userInfo ? JSON.parse(userInfo) : null
}

// Save authentication data after successful login
export function saveAuth(token, username, email, expiresAt) {
  localStorage.setItem('authToken', token)
  localStorage.setItem(
    'userInfo',
    JSON.stringify({ username, email, expiresAt })
  )
}

// Check if user is authenticated (has valid, non-expired token)
export function isAuthenticated() {
  const token = getToken()
  if (!token) return false

  // Check token expiration
  const userInfo = getUserInfo()
  if (userInfo && userInfo.expiresAt) {
    const expirationDate = new Date(userInfo.expiresAt)
    if (expirationDate < new Date()) {
      // Token expired - clear it and return false
      logout()
      return false
    }
  }

  return true
}

// Clear auth data (used on logout or expired token)
// NOTE: In React Router version, navigation is handled by useNavigate() hook,
// not Vue Router like the old version
export function logout() {
  localStorage.removeItem('authToken')
  localStorage.removeItem('userInfo')
}