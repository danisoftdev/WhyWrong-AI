import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve('./src'),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react-router-dom') || id.includes('react-dom') || id.includes('react')) {
              return 'react-vendor';
            }
            if (id.includes('lucide-react') || id.includes('framer-motion')) {
              return 'ui-vendor';
            }
            if (id.includes('recharts') || id.includes('reactflow')) {
              return 'chart-vendor';
            }
            if (id.includes('katex')) {
              return 'math-vendor';
            }
            return 'vendor';
          }
        },
      },
    },
  },
})
