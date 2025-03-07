import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import Katex from "vue-katex-auto-render"

createApp(App).directive('katex', Katex).mount('#app')
