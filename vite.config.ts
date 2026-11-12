import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// GitHub Pages sirve la app en /ATHLY/
export default defineConfig({
  base: '/ATHLY/',
  plugins: [react()],
});
