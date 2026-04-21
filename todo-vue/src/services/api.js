// API SERVICE: Handles all communication with the .NET backend
// Ported from the original api-service.js - now uses ES module imports/exports
//

import { getToken, logout } from './auth.js'

// Base URL for the .NET backend API
const API_BASE_URL = 'http://localhost:5282/api'

// ApiService class - encapsulates all HTTP calls to the backend
class ApiService {
  constructor() {
    this.baseUrl = `${API_BASE_URL}/todos`
  }

  // Build request headers with auth token
  getHeaders() {
    const token = getToken()
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    }
  }

  // Handle 401 Unauthorized - clear auth and return true if handled
  // NOTE: Caller is responsible for navigation (using router.push('/login'))
  handleUnauthorized(response) {
    if (response.status === 401) {
      logout()
      return true
    }
    return false
  }

  // GET: Fetch all todos
  async fetchTodos() {
    const response = await fetch(this.baseUrl, {
      headers: this.getHeaders()
    })

    if (this.handleUnauthorized(response)) return []

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return await response.json()
  }

  // POST: Create a new todo
  async createTodo(todoData) {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(todoData)
    })

    if (this.handleUnauthorized(response)) return null

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return await response.json()
  }

  // PUT: Update an existing todo
  async updateTodo(id, todoData) {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(todoData)
    })

    if (this.handleUnauthorized(response)) return null

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return await response.json()
  }

  // DELETE: Remove a todo by id
  async deleteTodo(id) {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders()
    })

    if (this.handleUnauthorized(response)) return false

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return true
  }

  // POST: Login with email/password
  async login(email, password) {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Login failed')
    }

    return data
  }

  // POST: Register a new user
  async register(userData) {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Registration failed')
    }

    return data
  }
}

// Export a single instance (singleton pattern)
// All components import the same apiService - no need to instantiate it multiple times
export const apiService = new ApiService()
