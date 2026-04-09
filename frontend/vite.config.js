import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    host: '0.0.0.0',
    hmr: {
      port: 5173,
      host: 'localhost',
    },
  },
  optimizeDeps: {
    include: ['@tabler/icons-react'],
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) {
            return;
          }

          if (id.includes('/@mantine/') || id.includes('/@emotion/')) {
            return 'mantine-vendor';
          }

          if (id.includes('/framer-motion/')) {
            return 'motion-vendor';
          }

          if (id.includes('/@tabler/icons-react/')) {
            return 'icons-vendor';
          }

          if (
            id.includes('/axios/') ||
            id.includes('/zustand/') ||
            id.includes('/formik/') ||
            id.includes('/yup/') ||
            id.includes('/libphonenumber-js/') ||
            id.includes('/qrcode/')
          ) {
            return 'app-vendor';
          }
        },
      },
    },
  },
});
