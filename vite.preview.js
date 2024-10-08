import { fileURLToPath, URL } from 'node:url'
import { resolve } from 'path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDocsPlugin from './src/plugins/vue-docs-plugin'

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
    vueDocsPlugin
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '~bootstrap': resolve(__dirname , 'node_modules/bootstrap')
    }
  }
})
