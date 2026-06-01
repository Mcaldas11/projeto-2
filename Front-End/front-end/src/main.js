import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

// Preserve existing auth and profile data on app start.
// Only clear the temporary registration session storage key used during the multi-step flow.
sessionStorage.removeItem('vc-comunica-register')

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
