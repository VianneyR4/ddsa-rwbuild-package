import { createApp } from 'vue'
import App from './App.vue'

// Import our custom CSS
import './assets/styles.scss'

// not sure why I cant import from '@openclinical/proformajs-vue3'
import ProformajsVue from '../index'

createApp(App).use(ProformajsVue).mount('#app')
