import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// Dev: mọi request /api/* được proxy sang NestJS (mặc định http://localhost:3000)
// => không bị lỗi CORS khi phát triển.
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react()],
    server: {
      port: 5173,
      proxy: {
        '/api': {
          target: env.VITE_PROXY_TARGET || 'http://localhost:3000',
          changeOrigin: true,
        },
      },
    },
  };
});
