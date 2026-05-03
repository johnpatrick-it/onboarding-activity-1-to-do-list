// VITE CONFIG: Configures the Vite build tool for our Vue project
// Vite is a modern build tool that provides:
// - Lightning-fast dev server with Hot Module Replacement (HMR)
// - Optimized production builds
// - Native ES modules support

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  // The Vue plugin tells Vite how to handle .vue single-file components
  plugins: [vue()],

  // Dev server configuration
  server: {
    port: 5173,  // Default Vite port (change if needed)
    open: true   // Automatically open browser when running 'npm run dev'
  }
})
