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
import TrabalhadorHomeView from '../views/TrabalhadorHomeView.vue'

// Admin Views
import AdminHomeView from '../views/admin/AdminHomeView.vue'
import AdminOcorrenciaDetailView from '../views/admin/AdminOcorrenciaDetailView.vue'
import AdminTrabalhadoresView from '../views/admin/AdminTrabalhadoresView.vue'
import AdminEquipasView from '../views/admin/AdminEquipasView.vue'
import AdminRotasView from '../views/admin/AdminRotasView.vue'

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
    { path: '/trabalhador', name: 'trabalhador-home', component: TrabalhadorHomeView, meta: { requiresWorker: true } },

    // Admin Routes
    { path: '/admin', name: 'admin-home', component: AdminHomeView, meta: { requiresAdmin: true } },
    { path: '/admin/ocorrencia/:id', name: 'admin-ocorrencia-detail', component: AdminOcorrenciaDetailView, meta: { requiresAdmin: true } },
    { path: '/admin/trabalhadores', name: 'admin-trabalhadores', component: AdminTrabalhadoresView, meta: { requiresAdmin: true } },
    { path: '/admin/equipas', name: 'admin-equipas', component: AdminEquipasView, meta: { requiresAdmin: true } },
    { path: '/admin/rotas', name: 'admin-rotas', component: AdminRotasView, meta: { requiresAdmin: true } },
  ],
})

router.beforeEach((to, from, next) => {
  if (to.meta && to.meta.requiresWorker) {
    const role = localStorage.getItem('role')
    if (role === 'trabalhador') return next()
    return next({ name: 'login' })
  }
  if (to.meta && to.meta.requiresAdmin) {
    const role = localStorage.getItem('role')
    if (role === 'admin') return next()
    return next({ name: 'login' })
  }
  return next()
})

export default router
