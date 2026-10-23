// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite'; // <-- Новый импорт

export default defineConfig({
  plugins: [react(), tailwindcss()], // <-- Добавлен плагин
  server: { port: 5173, open: true },
});
