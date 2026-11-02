import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import UnoCSS from 'unocss/vite';

export default defineConfig(({ mode }) => ({
  plugins: [tailwindcss(), UnoCSS()],
  define: { __WDEX_DEMO_BUILD__: JSON.stringify(mode === 'demo') },
}));
