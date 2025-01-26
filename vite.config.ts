import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig(({ command }) => ({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./"),
    },
  },
  // Use base: '/rga/' only for production builds
  base: command === 'build' ? '/rga/' : '/',
  build: {
    sourcemap: true
  }
})) 