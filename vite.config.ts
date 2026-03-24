import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import basicSsl from '@vitejs/plugin-basic-ssl'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), basicSsl()],
  server: {
    host: true
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('router')) return 'vendor-react';
            if (id.includes('lucide') || id.includes('framer-motion') || id.includes('react-icons')) return 'vendor-ui';
            if (id.includes('supabase') || id.includes('zustand') || id.includes('jspdf') || id.includes('html2canvas')) return 'vendor-utils';
            return 'vendor-others';
          }
        }
      }
    },

    chunkSizeWarningLimit: 1000
  }
})

