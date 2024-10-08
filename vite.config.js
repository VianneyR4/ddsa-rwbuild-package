import { fileURLToPath, URL } from 'node:url'
import { resolve } from 'path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDocsPlugin from './src/plugins/vue-docs-plugin'

// see https://github.com/vitejs/vite/issues/1579
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js';

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
  plugins: [
    vue(),
    vueDocsPlugin,
    cssInjectedByJsPlugin()
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '~bootstrap': resolve(__dirname , 'node_modules/bootstrap')
    }
  },
  build: {
    lib: {
      // Could also be a dictionary or array of multiple entry points
      entry: resolve(__dirname, 'index.js'),
      name: '@openclinical/proformajs-vue3',
      // the proper extensions will be added
      fileName: 'proformajs-vue3',
    },
    rollupOptions: {
      // make sure to externalize deps that shouldn't be bundled
      // into your library
      external: ['vue', '@openclinical/proformajs', 'moment', 'file-saver', 'marked', 'dompurify', '@fortawesome/fontawesome-svg-core', '@fortawesome/free-solid-svg-icons', '@fortawesome/vue-fontawesome', 'hammerjs', 'vue3-ace-editor','bootstrap'],
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
          '@fortawesome/vue-fontawesome': 'FontAwesomeIcon',
          hammerjs: 'Hammer',
          'vue3-ace-editor': 'VAceEditor'
        },
      },
    }
  },
})
