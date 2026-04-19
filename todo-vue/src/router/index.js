// ROUTER: Defines all application routes and navigation guards
//
// Vue Router turns our app into a Single Page Application (SPA):
// - One HTML file, but URL changes show different components
// - No full page reloads - just component swapping
// - Browser back/forward buttons work naturally

import { createRouter, createWebHistory } from 'vue-router'
import { isAuthenticated } from '../services/auth.js'

// Import view components (page-level components)
import LoginView from '../views/LoginView.vue'
import RegisterView from '../views/RegisterView.vue'
import TodoView from '../views/TodoView.vue'

// ROUTES: Maps URL paths to components
// 'meta' is custom data we attach to routes (used here to mark protected routes)
const routes = [
  {
    path: '/',
    name: 'todos',
    component: TodoView,
    meta: { requiresAuth: true }  // Must be logged in to access
  },
  {
    path: '/login',
    name: 'login',
    component: LoginView,
    meta: { requiresGuest: true }  // Only for non-logged-in users
  },
  {
    path: '/register',
    name: 'register',
    component: RegisterView,
    meta: { requiresGuest: true }  // Only for non-logged-in users
  }
]

// Create the router instance
// createWebHistory() uses HTML5 history mode (clean URLs without #)
const router = createRouter({
  history: createWebHistory(),
  routes
})

// NAVIGATION GUARD: Runs before every route change
// This is how we enforce authentication - much cleaner than the old requireAuth() approach
router.beforeEach((to, from, next) => {
  const authed = isAuthenticated()

  // Trying to access a protected route without being logged in?
  if (to.meta.requiresAuth && !authed) {
    return next({ name: 'login' })
  }

  // Already logged in and trying to view login/register? Send to todos
  if (to.meta.requiresGuest && authed) {
    return next({ name: 'todos' })
  }

  // Otherwise, proceed normally
  next()
})

export default router
