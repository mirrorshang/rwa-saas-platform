import { defineConfig, presetUno } from 'unocss';

export default defineConfig({
  presets: [presetUno()],
  shortcuts: {
    'focus-ring': 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300',
  },
});
