<!--
  LOGIN VIEW: Login page component
  Converts login.html + login.js into a single .vue component
-->

<template>
  <div class="auth-container">
    <div class="auth-card">
      <h1>Login</h1>
      <p class="auth-subtitle">Welcome back! Please enter your credentials.</p>

      <!--
        v-if shows the error message only when errorMessage is not empty
        This replaces the manual .style.display logic from the old code
      -->
      <div v-if="errorMessage" class="error-message">
        {{ errorMessage }}
      </div>

      <!--
        @submit.prevent runs handleLogin AND prevents default form submission
        (old code used e.preventDefault() manually)
      -->
      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label for="email">Email</label>
          <!-- v-model creates two-way binding - email is updated as user types -->
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
            autocomplete="current-password"
          />
        </div>

        <!--
          :disabled is a shorthand for v-bind:disabled - binds the attribute reactively
          Button is disabled while login is in progress
        -->
        <button type="submit" class="btn btn-primary" :disabled="isLoading">
          {{ isLoading ? 'Logging in...' : 'Login' }}
        </button>
      </form>

      <div class="auth-footer">
        <!--
          <router-link> replaces <a href> for SPA navigation.
          It doesn't reload the page - just changes the route.
        -->
        Don't have an account?
        <router-link to="/register">Register here</router-link>
      </div>
    </div>
  </div>
</template>

<script>
// Import the API service (singleton instance)
import { apiService } from '../services/api.js'
// Import auth utility to save login data
import { saveAuth } from '../services/auth.js'

export default {
  name: 'LoginView',

  // data(): Reactive state for this component
  data() {
    return {
      email: '',           // Bound to email input via v-model
      password: '',        // Bound to password input via v-model
      errorMessage: '',    // Shown when login fails
      isLoading: false     // Controls button disabled state
    }
  },

  methods: {
    // Called when user submits the login form
    async handleLogin() {
      // Clear any previous error
      this.errorMessage = ''
      this.isLoading = true

      try {
        // Call API service to authenticate
        const data = await apiService.login(this.email, this.password)

        // Save token and user info to localStorage
        saveAuth(data.token, data.username, data.email, data.expiresAt)

        // Navigate to todos page
        // this.$router is available because we did app.use(router) in main.js
        this.$router.push('/')
      } catch (error) {
        // Show error message to user
        this.errorMessage = error.message || 'Login failed. Please try again.'
      } finally {
        // Re-enable button whether success or failure
        this.isLoading = false
      }
    }
  }
}
</script>

<!--
  <style scoped>: Styles only apply to THIS component
  Vue adds a unique attribute to elements and matching CSS rules
  This prevents CSS from leaking and affecting other components
-->
<style scoped>
/* No component-specific styles needed - using global auth-container styles */
</style>
