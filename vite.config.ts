import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Remove base path for Vercel - it will be deployed to root domain
  base: '/',
  build: {
    rollupOptions: {
      output: {
        manualChunks: undefined,
      }
    },
  }
})
