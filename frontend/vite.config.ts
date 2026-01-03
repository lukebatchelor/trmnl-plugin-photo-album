import { defineConfig, loadEnv } from 'vite'
import { resolve } from 'path'

export default defineConfig(({ mode }) => {
  // Load env from parent directory
  const env = loadEnv(mode, resolve(__dirname, '..'), '')

  // Extract BASE_URL from parent .env (defaults to localhost:3000)
  const backendUrl = env.BASE_URL || 'http://localhost:3000'

  return {
    server: {
      port: 5173,
      proxy: {
        '/upload': backendUrl,
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
