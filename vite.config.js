import {defineConfig} from 'vite';
export default defineConfig({
  server: {
    hmr: {
      overlay: false
    },
    watch: {
      usePolling: true
    }
  },

  base: './'
});
