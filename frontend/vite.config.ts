import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Configura el base path para GitHub Pages
  base: '/Cohorsfunnel/',
  build: {
    outDir: 'dist',
    sourcemap: false,
  }
})
