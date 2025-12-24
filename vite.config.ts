// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react'; // assuming you have this installed
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
});
