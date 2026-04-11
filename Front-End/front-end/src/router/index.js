import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import LoginView from '../views/LoginView.vue'
import RegisterEmail from '../views/RegisterEmail.vue'
import RegisterPassword from '../views/RegisterPassword.vue'
import RegisterMunicipio from '../views/RegisterMunicipio.vue'
import NewOcorrencia from '../views/NewOcorrenciaView.vue'
import OcorrenciasView from '../views/OcorrenciasView.vue'
import DetailsOcorrenciaView from '../views/DetailsOcorrenciaView.vue'
import ContaView from '../views/ContaView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    { path: '/login', name: 'login', component: LoginView },
    { path: '/ocorrencia/:id', name: 'detalhes', component: DetailsOcorrenciaView },
    { path: '/register/email', name: 'register-email', component: RegisterEmail },
    { path: '/register-password', name: 'register-password', component: RegisterPassword },
    { path: '/register/municipio', name: 'register-municipio', component: RegisterMunicipio },
    {
      path: '/new-ocorrencia',
      name: 'new-ocorrencia',
      component: NewOcorrencia,
      alias: '/nova-ocorrencia',
    },
    { path: '/ocorrencias', name: 'ocorrencias', component: OcorrenciasView },
    { path: '/conta', name: 'conta', component: ContaView },
  ],
})

export default router
