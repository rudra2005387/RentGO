import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom'],
    exclude: ['react-router-dom'],
    esbuildOptions: {
      target: 'es2020',
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom'],
          'vendor-ui': ['framer-motion'],
          'vendor-icons': ['react-icons'],
          'feature-auth': ['./src/context/AuthContext.jsx'],
          'feature-notifications': ['./src/context/NotificationContext.jsx'],
          'feature-theme': ['./src/context/ThemeContext.jsx'],
        },
      },
    },
    minify: 'terser',
    terserOptions: { compress: { drop_console: true, drop_debugger: true } },
    cssCodeSplit: true,
    sourcemap: false,
    chunkSizeWarningLimit: 1000,
    assetsInlineLimit: 4096,
  },
  esbuild: { drop: ['console', 'debugger'] },
})
