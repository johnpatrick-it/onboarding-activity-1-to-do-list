// MAIN.JS: Application entry point
// This file bootstraps the Vue application and wires up core dependencies

// Import Vue's createApp function to create an app instance
import { createApp } from 'vue'

// Import the root App component (contains <router-view />)
import App from './App.vue'

// Import the Vue Router instance (defines all routes + auth guards)
import router from './router'

// Import global styles (used across all components)
import './assets/main.css'

// Create the Vue application instance
const app = createApp(App)

// Tell Vue to use the router - makes <router-link>, <router-view>, and $router available everywhere
app.use(router)

// Mount the app to the #app div in index.html
app.mount('#app')
