import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'REACT_APP_');
  return {
    plugins: [svgr({ include: '**/*.svg', svgrOptions: { exportType: 'named', namedExport: 'ReactComponent' } }), react()],
    define: { 'process.env.REACT_APP_BACKEND_URL': JSON.stringify(env.REACT_APP_BACKEND_URL || '') },
    build: { outDir: 'build' },
    test: { environment: 'jsdom', globals: true, setupFiles: ['./src/setupTests.js'] },
  };
});
