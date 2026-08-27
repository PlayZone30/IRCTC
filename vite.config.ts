import path from 'node:path'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'RailIndia',
        short_name: 'RailIndia',
        description: 'IRCTC booking journey, rebuilt — POC',
        theme_color: '#181D2A',
        background_color: '#E8EBED',
        display: 'standalone',
        start_url: '/',
        icons: [],
      },
      workbox: {
        // Cache the ticket route content so /ticket/:pnr can be viewed offline
        // after one online visit, per PLAN.md §7 (Offline ticket).
        navigateFallback: '/index.html',
        runtimeCaching: [
          {
            urlPattern: /^https?:\/\/.*\/ticket\/.*/,
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'railindia-tickets' },
          },
        ],
      },
    }),
  ],
})
