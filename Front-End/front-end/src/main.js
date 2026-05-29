import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

localStorage.removeItem('role')
localStorage.removeItem('authToken')
localStorage.removeItem('authUserType')
localStorage.removeItem('authUserId')
localStorage.removeItem('rememberMe')
localStorage.removeItem('userProfile')
sessionStorage.removeItem('authToken')
sessionStorage.removeItem('authUserType')
sessionStorage.removeItem('authUserId')
sessionStorage.removeItem('vc-comunica-register')

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
