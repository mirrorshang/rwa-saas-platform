import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import UnoCSS from 'unocss/vite';

export default defineConfig({
  plugins: [tailwindcss(), UnoCSS()],
});
