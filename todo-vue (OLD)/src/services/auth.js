// AUTH SERVICE: Authentication utilities
// Ported from the original auth.js - now uses ES module exports instead of global functions
//
// KEY DIFFERENCE FROM CDN VERSION:
// - Before: Functions were global (just defined in a script tag)
// - Now: Functions are exported and must be imported where used
// - This is cleaner - each file explicitly declares what it depends on

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
// NOTE: In Vue Router version, navigation is handled by the router guard,
// not a hard page redirect like the old version
export function logout() {
  localStorage.removeItem('authToken')
  localStorage.removeItem('userInfo')
}
