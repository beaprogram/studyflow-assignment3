import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// The app talks to the API through the relative path "/api".
// In development, Vite proxies "/api" to the live Render backend, so the
// browser sees a same-origin request and there is no CORS to configure.
// In production, netlify.toml does the same proxying (see that file).
const API_TARGET = 'https://studyflow-api-yzno.onrender.com'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: API_TARGET,
        changeOrigin: true,
        secure: true,
      },
    },
  },
})
