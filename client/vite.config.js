import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Code splitting configuration
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-ui': ['framer-motion'],
          'vendor-icons': ['react-icons'],
          
          // Feature chunks
          'feature-auth': ['./src/context/AuthContext.jsx'],
          'feature-notifications': ['./src/context/NotificationContext.jsx'],
          'feature-theme': ['./src/context/ThemeContext.jsx'],
        },
      },
    },
    // Optimization settings
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    // CSS code splitting
    cssCodeSplit: true,
    // Source maps for production debugging
    sourcemap: false,
    // Chunk size warnings
    chunkSizeWarningLimit: 1000,
    // Asset inlining limit (convert to base64 if < 4kb)
    assetsInlineLimit: 4096,
  },
  // Optimization config
  esbuild: {
    drop: ['console', 'debugger'],
  },
})

