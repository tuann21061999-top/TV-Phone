import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    target: 'esnext',
    minify: 'esbuild',
    cssCodeSplit: true,
    reportCompressedSize: false, // Tăng tốc build
    chunkSizeWarningLimit: 1000,
    assetsInlineLimit: 4096, // Inline các file nhỏ < 4kb vào CSS/JS để giảm request
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react')) return 'vendor-react';
            if (id.includes('lucide')) return 'vendor-ui';
            if (id.includes('axios')) return 'vendor-utils';
            return 'vendor'; // Các thư viện khác gộp vào vendor chung
          }
        }
      }
    }
  }
})
