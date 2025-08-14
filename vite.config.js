import { defineConfig } from 'vite'
import react_stylizer from "react-type-toastify"
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(), 
    react_stylizer()
  ],
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './vitest.setup.js'
  },
  resolve: {
    alias: {
      '@components': '/src/components',  // Alias for components
      '@utils': '/src/utils',            // Alias for utility functions
    }
  },
  define: {
    'process.env.API_URL': JSON.stringify(process.env.API_URL || 'http://localhost:5000'),
  }
})