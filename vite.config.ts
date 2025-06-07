import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './vitest.setup.ts',
  },
  css: {
    postcss: './postcss.config.js'
  },
  server: {
    port: 3000,
    strictPort: true, // Empêche Vite d'essayer un autre port si 3000 est occupé
    host: true, // Écoute sur toutes les interfaces réseau
  }
})
