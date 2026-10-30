import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import process from 'node:process'
import { demoPaymentsPlugin } from './server/demo-payments/vitePlugin.js'

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiBaseUrl = env.VITE_API_BASE_URL
  // Demo payments exist only on the dev server. Refuse to build a bundle that
  // would show the demo gateway instead of the real one.
  if (command === 'build' && env.VITE_PAYMENT_MODE === 'demo') {
    throw new Error('VITE_PAYMENT_MODE=demo is development-only. Remove it before building.')
  }
  const apiOrigin = (() => {
    try { return apiBaseUrl ? new URL(apiBaseUrl).origin : null } catch { return null }
  })()
  // The proxy forwards the browser's User-Agent, so ngrok would answer proxied
  // requests (including <img> loads from /uploads) with its HTML warning page.
  const proxyHeaders = apiOrigin && /\.ngrok(-free)?\.(app|dev|io)$/i.test(new URL(apiOrigin).hostname)
    ? { 'ngrok-skip-browser-warning': 'true' }
    : undefined

  return {
    plugins: [
      react(),
      tailwindcss(),
      demoPaymentsPlugin({ enabled: env.DEMO_PAYMENTS_ENABLED === 'true' }),
    ],
    server: {
      port: 5173,
      strictPort: true,
      // Uploaded files (profile photos) are served same-origin through this
      // proxy during development.
      // See resolvePhotoUrl in src/shared/services/profilePhotoService.js.
      proxy: apiOrigin ? {
        '/uploads': {
          target: apiOrigin,
          changeOrigin: true,
          headers: proxyHeaders,
        },
        // Dev only: the landing forms call relative /api paths in development
        // (src/landing/shared/services/apiClient.js), because the backend's
        // CORS does not allow localhost. Production uses nginx's /api proxy.
        '/api': {
          target: apiOrigin,
          changeOrigin: true,
          headers: proxyHeaders,
        },
      } : undefined,
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@app': path.resolve(__dirname, './src/app'),
        '@features': path.resolve(__dirname, './src/features'),
        '@shared': path.resolve(__dirname, './src/shared'),
        '@styles': path.resolve(__dirname, './src/styles'),
        '@assets': path.resolve(__dirname, './src/assets'),
        // The merged landing page (src/landing) used '@shared'/'@features'
        // for its own folders; those names already belong to the app.
        '@landing-shared': path.resolve(__dirname, './src/landing/shared'),
        '@landing-features': path.resolve(__dirname, './src/landing/features'),
      },
    },
  }
})
