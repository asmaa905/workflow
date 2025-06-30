import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import '@vue-flow/core/dist/style.css'
import '@vue-flow/core/dist/theme-default.css'

import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
