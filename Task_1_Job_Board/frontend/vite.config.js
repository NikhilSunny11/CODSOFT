import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api': 'https://codsoft-x4s0.onrender.com',
      '/uploads': 'https://codsoft-x4s0.onrender.com',
    },
  },
})
