import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/', // Resurslar root dan yuklanishini ta'minlaydi
  server: {
    host: '0.0.0.0', // Barcha interfeyslardan kirishga ruxsat beradi
    port: 5173,
  },
});