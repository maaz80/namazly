import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => ({
  plugins: [react()],

  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: process.env.VITE_API_TARGET || 'http://localhost:5001',
        changeOrigin: true,
      },
    },
  },

  build: {
    // Target modern browsers — smaller bundle, no legacy polyfills
    target: 'es2020',

    // Remove console.log / debugger in production
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: mode === 'production',
        drop_debugger: true,
        pure_funcs: mode === 'production' ? ['console.log', 'console.info', 'console.debug'] : [],
      },
    },

    // Split CSS per chunk for better caching
    cssCodeSplit: true,

    // No sourcemaps in production (reduces bundle size, hides source)
    sourcemap: mode !== 'production',

    // Raise chunk warning limit slightly (default 500kb is aggressive)
    chunkSizeWarningLimit: 600,

    rollupOptions: {
      output: {
        // Manual chunk splitting for optimal caching
        // React core — changes rarely, cached long-term
        manualChunks(id) {
          if (id.includes('node_modules/react-dom') || id.includes('node_modules/react/')) {
            return 'vendor-react';
          }
          if (id.includes('node_modules/react-router-dom') || id.includes('node_modules/react-router/') || id.includes('node_modules/@remix-run/')) {
            return 'vendor-router';
          }
          if (id.includes('node_modules/@react-oauth')) {
            return 'vendor-oauth';
          }
          if (id.includes('node_modules/axios')) {
            return 'vendor-axios';
          }
        },

        // Predictable asset filenames with content hash
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          const ext = assetInfo.name?.split('.').pop();
          if (['woff', 'woff2', 'ttf', 'eot'].includes(ext)) {
            return 'assets/fonts/[name]-[hash][extname]';
          }
          if (['png', 'jpg', 'jpeg', 'svg', 'gif', 'webp'].includes(ext)) {
            return 'assets/images/[name]-[hash][extname]';
          }
          if (ext === 'css') {
            return 'assets/css/[name]-[hash][extname]';
          }
          return 'assets/[name]-[hash][extname]';
        },
      },

      // Tree-shake unused exports
      treeshake: {
        moduleSideEffects: false,
        propertyReadSideEffects: false,
      },
    },
  },

  // Optimize dependencies pre-bundling
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'axios', '@react-oauth/google'],
  },
}));
