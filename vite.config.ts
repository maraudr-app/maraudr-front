import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  server: {
    port: 3000,
    // Optionnel: forcer HTTPS en développement (génère un certificat auto-signé)
    // https: true
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  // S'assurer que le mode production est bien défini
  define: {
    'import.meta.env.MODE': JSON.stringify(mode),
    'import.meta.env.PROD': mode === 'production'
  }
}))
