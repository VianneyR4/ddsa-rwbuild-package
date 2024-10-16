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
      name: '@ddsa-vue3-views/perform',
      // the proper extensions will be added
      fileName: 'ddsa-vue3-views',
    },
    rollupOptions: {
      // make sure to externalize deps that shouldn't be bundled
      // into your library
      external: ['vue', '@openclinical/proformajs', 'moment', 'file-saver', 'marked', 'dompurify', '@fortawesome/fontawesome-svg-core', '@fortawesome/free-solid-svg-icons', '@fortawesome/vue-fontawesome', 'bootstrap', 
        '@ddsa-vue3-views/tools',
        '@ddsa-vue3-views/perform',
        '@ddsa-vue3-views/compose'
      ],
      output: {
        exports: 'named',
        // Provide global variables to use in the UMD build
        // for externalized deps
        globals: {
          vue: 'vue',
          moment: 'moment',
          'file-saver': 'FileSaver',
          dompurify: 'createDOMPurify',
          marked: 'marked',
          '@openclinical/proformajs': 'proformajs',
          '@fortawesome/fontawesome-svg-core': 'library',
          '@fortawesome/free-solid-svg-icons': 'FontAwesomeIcons',
          '@fortawesome/vue-fontawesome': 'FontAwesomeIcon'
        },
      },
    }
  },
})
