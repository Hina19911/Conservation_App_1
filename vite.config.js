import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/uploads': 'http://localhost:3500',
      '/api': 'http://localhost:3500',
      '/login': 'http://localhost:3500',
      '/upload': 'http://localhost:3500'
    }
  }
})
