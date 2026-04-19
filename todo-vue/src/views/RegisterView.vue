<!--
  REGISTER VIEW: Registration page component
  Converts register.html + register.js into a single .vue component
-->

<template>
  <div class="auth-container">
    <div class="auth-card">
      <h1>Create Account</h1>
      <p class="auth-subtitle">Sign up to start managing your tasks.</p>

      <!--
        v-if shows the error block only when there are errors.
        For arrays of errors, we use v-for to render each one.
      -->
      <div v-if="errorMessage || errors.length" class="error-message">
        <!-- Single error message -->
        <p v-if="errorMessage">{{ errorMessage }}</p>
        <!-- List of validation errors from backend -->
        <ul v-if="errors.length">
          <li v-for="(err, index) in errors" :key="index">{{ err }}</li>
        </ul>
      </div>

      <form @submit.prevent="handleRegister">
        <div class="form-group">
          <label for="username">Username</label>
          <input
            id="username"
            type="text"
            v-model="username"
            required
            autocomplete="username"
          />
        </div>

        <div class="form-group">
          <label for="email">Email</label>
          <input
            id="email"
            type="email"
            v-model="email"
            required
            autocomplete="email"
          />
        </div>

        <div class="form-group">
          <label for="password">Password</label>
          <input
            id="password"
            type="password"
            v-model="password"
            required
            autocomplete="new-password"
          />
          <small class="form-hint">At least 6 characters</small>
        </div>

        <div class="form-group">
          <label for="confirmPassword">Confirm Password</label>
          <input
            id="confirmPassword"
            type="password"
            v-model="confirmPassword"
            required
            autocomplete="new-password"
          />
        </div>

        <button type="submit" class="btn btn-primary" :disabled="isLoading">
          {{ isLoading ? 'Creating account...' : 'Register' }}
        </button>
      </form>

      <div class="auth-footer">
        Already have an account?
        <router-link to="/login">Login here</router-link>
      </div>
    </div>
  </div>
</template>

<script>
import { apiService } from '../services/api.js'
import { saveAuth } from '../services/auth.js'

export default {
  name: 'RegisterView',

  data() {
    return {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      errorMessage: '',
      errors: [],         // Array of validation errors from backend
      isLoading: false
    }
  },

  methods: {
    async handleRegister() {
      // Clear previous errors
      this.errorMessage = ''
      this.errors = []

      // Client-side validation
      if (this.password !== this.confirmPassword) {
        this.errorMessage = 'Passwords do not match'
        return
      }

      if (this.password.length < 6) {
        this.errorMessage = 'Password must be at least 6 characters long'
        return
      }

      this.isLoading = true

      try {
        // Call API to register
        const data = await apiService.register({
          username: this.username,
          email: this.email,
          password: this.password
        })

        // Save auth data and navigate to todos
        saveAuth(data.token, data.username, data.email, data.expiresAt)
        this.$router.push('/')
      } catch (error) {
        // Handle backend errors (might be single message or array of errors)
        if (error.message) {
          this.errorMessage = error.message
        } else {
          this.errorMessage = 'Registration failed. Please try again.'
        }
      } finally {
        this.isLoading = false
      }
    }
  }
}
</script>

<style scoped>
/* Uses global auth styles from main.css */
</style>
