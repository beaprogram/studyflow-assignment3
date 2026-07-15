import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// The app talks to the API through the relative path "/api".
// In development, Vite proxies "/api" to the live Render backend, so the
// browser sees a same-origin request and there is no CORS to configure.
// In production, netlify.toml does the same proxying (see that file).
const API_TARGET = 'https://studyflow-api-yzno.onrender.com'

// Security headers used by both the development server and the local
// production preview. Netlify applies the same policy in production (see
// netlify.toml). Keeping the local preview aligned makes the OWASP ZAP
// before/after scan reproducible instead of relying on deployment-only headers.
const securityHeaders = {
  'Content-Security-Policy':
    "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self'; font-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'",
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'no-referrer',
  'Permissions-Policy': 'geolocation=(), microphone=(), camera=(), payment=()',
  'Cross-Origin-Embedder-Policy': 'require-corp',
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Cross-Origin-Resource-Policy': 'same-origin',
}

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    allowedHosts: ['host.docker.internal'],
    headers: securityHeaders,
    proxy: {
      '/api': {
        target: API_TARGET,
        changeOrigin: true,
        secure: true,
      },
    },
  },
  preview: {
    port: 4173,
    allowedHosts: ['host.docker.internal'],
    headers: securityHeaders,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:5050',
        changeOrigin: true,
      },
    },
  },
})
