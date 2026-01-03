import { defineConfig, loadEnv } from 'vite'
import { resolve } from 'path'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig(({ mode }) => {
  // Load env from parent directory
  const env = loadEnv(mode, resolve(__dirname, '..'), '')

  // Extract BASE_URL from parent .env (defaults to localhost:3000)
  const backendUrl = env.BASE_URL || 'http://localhost:3000'

  return {
    plugins: [
      VitePWA({
        registerType: 'autoUpdate',
        injectRegister: 'auto',
        includeAssets: ['*.png', '*.svg', '*.ico'],
        manifest: {
          name: 'Photo Album',
          short_name: 'Album',
          description: 'Photo album for uploading and managing images',
          theme_color: '#ffffff',
          background_color: '#ffffff',
          display: 'standalone',
          icons: [
            {
              src: '/icon-192.png',
              sizes: '192x192',
              type: 'image/png'
            },
            {
              src: '/icon-512.png',
              sizes: '512x512',
              type: 'image/png'
            },
            {
              src: '/icon-512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any maskable'
            }
          ],
          share_target: {
            action: '/share',
            method: 'POST',
            enctype: 'multipart/form-data',
            params: {
              files: [
                {
                  name: 'media',
                  accept: ['image/*']
                }
              ]
            }
          }
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,jpg,jpeg}'],
          cleanupOutdatedCaches: true,
          skipWaiting: true,
          clientsClaim: true,
          navigateFallback: null, // Disable navigation fallback to let API routes through
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/.*\/image\/.*/,
              handler: 'CacheFirst',
              options: {
                cacheName: 'images-cache',
                expiration: {
                  maxEntries: 100,
                  maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
                }
              }
            }
          ]
        }
      })
    ],
    server: {
      port: 5173,
      proxy: {
        '/upload': backendUrl,
        '/share': backendUrl,
        '/images': backendUrl,
        '/image': backendUrl,
        '/delete': backendUrl,
        '/random': backendUrl,
      }
    },
    build: {
      outDir: 'dist',
    }
  }
})
