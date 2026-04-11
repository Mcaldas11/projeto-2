import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import LoginView from '../views/LoginView.vue'
import RegisterEmail from '../views/RegisterEmail.vue'
import RegisterPassword from '../views/RegisterPassword.vue'
import RegisterMunicipio from '../views/RegisterMunicipio.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
    },
    {
      path: '/register/email',
      name: 'register-email',
      component: RegisterEmail,
    },
    {
      path: '/register-password',
      name: 'register-password',
      component: RegisterPassword,
    },
    {
      path: '/register/municipio',
      name: 'register-municipio',
      component: RegisterMunicipio,
    },
  ],
})

export default router
