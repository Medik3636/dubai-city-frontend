import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/', // Render’da to‘g‘ri ishlashi uchun
  build: {
    outDir: 'dist', // Build natijasi dist papkasida bo‘lishi kerak
  },
});