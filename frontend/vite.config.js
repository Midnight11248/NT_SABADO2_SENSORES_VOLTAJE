import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
  },
  server: {
    port: 3000,
    proxy: {
      '/usuarios':   { target: 'http://localhost:8080', changeOrigin: true },
      '/sensores':   { target: 'http://localhost:8080', changeOrigin: true },
      '/mediciones': { target: 'http://localhost:8080', changeOrigin: true },
      '/roles':      { target: 'http://localhost:8080', changeOrigin: true },
    }
  }
})