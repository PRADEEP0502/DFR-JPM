import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/selsoft': {
        target: 'http://103.168.241.16/BillpassingApplication/api/approval',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/selsoft/, ''),
      },
    },
  },
});
