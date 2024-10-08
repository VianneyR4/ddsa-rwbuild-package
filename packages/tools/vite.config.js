import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDocsPlugin from '../../src/plugins/vue-docs-plugin'
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  esbuild: {
    keepNames: true,
    minifyIdentifiers: false
  },
  optimizeDeps: {
    esbuildOptions: {
      minifyIdentifiers: false,
      keepNames: true,
    },
  },
  plugins: [vue(), vueDocsPlugin],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  build: {
    lib: {
      // Could also be a dictionary or array of multiple entry points
      entry: resolve(__dirname, 'index.js'),
      name: '@openclinical/proformajs-vue3-tools',
      // the proper extensions will be added
      fileName: 'proformajs-vue3-tools',
    },
    rollupOptions: {
      // make sure to externalize deps that shouldn't be bundled
      // into your library
      external: ['vue', 'bootstrap'],
      output: {
        // Provide global variables to use in the UMD build
        // for externalized deps
        globals: {
          vue: 'vue'
        },
      },
    }
  },
})
