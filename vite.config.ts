import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  optimizeDeps: {
    exclude: ['sql.js'],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('firebase')) return 'vendor_firebase';
            if (id.includes('sql.js')) return 'vendor_sqljs';
            if (id.includes('react')) return 'vendor_react';
            if (id.includes('lucide-react')) return 'vendor_icons';
            return 'vendor_misc';
          }
        }
      }
    }
  }
});
