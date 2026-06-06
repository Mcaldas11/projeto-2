<template>
  <div class="page-container">
    <header class="hero-section">
      <div class="overlay"></div>
      <div class="content-wrapper">
        <nav class="navbar">
          <div class="logo-area">
            <img src="@/assets/logo.png" alt="VC Comunica Logo" class="logo-img" />
          </div>
          <div class="nav-icons" ref="navIcons">
            <router-link v-if="newOccurrenceRoute" :to="newOccurrenceRoute" class="icon add"
              >+</router-link
            >
            
            <span class="icon" ref="menuIcon" @click="toggleMenu">☰</span>

            <AdminSidebarMenu v-if="userRole === 'admin'" v-model="showMenu" />
            <ResponsavelSidebarMenu v-else-if="userRole === 'responsavel'" v-model="showMenu" />
            <SidebarMenu v-else v-model="showMenu" />

            
          </div>
        </nav>

        <div class="hero-main">
          <h1 class="hero-title">A sua cidade,<br />a sua voz!</h1>
          <p class="hero-subtitle">
            A VC Comunica é a sua plataforma para reportar problemas urbanos. Junte-se a nós e
            construa uma cidade mais eficiente e ligada.
          </p>
        </div>

        <div class="stats-container">
          <div class="stat-card">
            <h2 class="stat-number">{{ totalOccurrences }}</h2>
            <p class="stat-label">Ocorrências reportadas</p>
          </div>
          <div class="stat-card">
            <h2 class="stat-number">{{ resolvedCount }}</h2>
            <p class="stat-label">Ocorrências resolvidas</p>
          </div>
          <div class="stat-card">
            <h2 class="stat-number">{{ inAnalysisCount }}</h2>
            <p class="stat-label">Ocorrências em análise</p>
          </div>
        </div>
        <div style="margin-top: 12px; color: #fff">
          <span v-if="loadingStats">A carregar estatísticas...</span>
          <span v-if="statsError" style="color: #ffb4b4">{{ statsError }}</span>
        </div>
      </div>
    </header>

    <section class="about-section">
      <div class="about-text">
        <h2 class="section-title">Sobre Nós</h2>
        <br />
        <p>A VC Comunica é uma plataforma inovadora, criada para ligar cidadãos e autoridades.</p>
        <p>
          O nosso objetivo é facilitar a comunicação de ocorrências, promover a transparência e
          construir uma cidade mais segura e eficiente para todos.
        </p>
      </div>
      <div class="about-gallery">
        <img src="@/assets/about1.png" alt="Ocorrência 1" class="about-img" />
        <img src="@/assets/about2.png" alt="Ocorrência 2" class="about-img" />
        <img src="@/assets/about3.png" alt="Ocorrência 3" class="about-img" />
      </div>
    </section>

    <section class="freguesias-section">
      <div class="freguesias-content-card">
        <div class="section-heading-row">
          <h2 class="section-title-freguesia">Freguesias Aderentes</h2>
        </div>

        <div v-if="loadingParishes" style="color: #666; margin-bottom: 20px">
          A carregar freguesias aderentes...
        </div>
        <div v-else class="teams-slider">
          <div
            v-for="parish in parishes"
            :key="parish.idFreguesia || parish.idMunicipio"
            class="team-card"
          >
            <h3 class="freguesia-nome">{{ parish.nome }}</h3>
          </div>
          <div v-if="parishes.length === 0 && !loadingParishes" style="color: #666">
            Nenhuma freguesia registada de momento.
          </div>
        </div>
      </div>
    </section>

    <section class="how-to-section">
      <h2 class="section-title-large">Como reportar uma ocorrência</h2>
      <div class="steps-grid">
        <div class="step">
          <h3>1. Escolha o tipo de ocorrência</h3>
          <p>
            Escolha a categoria da ocorrência que pretende reportar. Estas podem ser de 5 tipos
            diferentes: Estradas e passeios, Sinalização de trânsito, Iluminação, Higiene e limpeza
            e Parques e jardins.
          </p>
        </div>
        <div class="step">
          <h3>2. Descrição da ocorrência e dados pessoais</h3>
          <p>Descreva a ocorrência com o máximo de pormenores possível.</p>
        </div>
        <div class="step">
          <h3>3. Adicionar fotografias</h3>
          <p>
            Para adicionar fotografias, basta seleccionar as imagens relevantes do seu dispositivo.
            Certifique-se de que as fotografias são nítidas e ilustram claramente a ocorrência.
          </p>
        </div>
      </div>
    </section>

    <FooterHome />
  </div>
</template>

<style scoped>
/* Reset básico e tipografia */
.page-container {
  font-family: Arial, sans-serif;
  color: #1a1a1a;
  line-height: 1.5;
}

/* Header & Hero */
.hero-section {
  position: relative;
  min-height: 100vh;
  background-image: url('@/assets/home_fundo.png');
  background-size: cover;
  background-position: center;
  color: white;
  padding: 40px 80px;
}

.overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: 1;
}

.content-wrapper {
  position: relative;
  z-index: 2;
}

.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 100px;
}

.logo-area {
  display: flex;
  align-items: center;
  gap: 10px;
}

.logo-img {
  height: 40px;
}
.logo-text {
  font-weight: bold;
  font-size: 1.5rem;
}

.nav-icons {
  display: flex;
  gap: 20px;
  font-size: 1.2rem;
  cursor: pointer;
  position: relative;
}

.nav-icons .icon.add {
  background: #730000;
  color: #fff;
  width: 28px;
  height: 28px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  font-weight: 700;
  font-size: 16px;
  line-height: 1;
}

.nav-icons .icon.notification {
  width: 28px;
  height: 28px;
  display: inline-block;
  object-fit: contain;
}

.notifications {
  position: absolute;
  top: 44px;
  right: 0;
  width: 320px;
  background: #ffffff;
  color: #0b2b2b;
  border-radius: 12px;
  padding: 12px;
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.15);
  z-index: 60;
}

.hamburger-menu {
  position: absolute;
  top: 44px;
  right: 0;
  width: 200px;
  background: #ffffff;
  color: #0b2b2b;
  border-radius: 12px;
  padding: 8px;
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.15);
  z-index: 70;
  display: flex;
  flex-direction: column;
  gap: 6px;
  transition:
    transform 0.18s ease,
    opacity 0.18s ease;
  transform-origin: top right;
}

.menu-item {
  display: block;
  padding: 10px 12px;
  color: #0b2b2b;
  text-decoration: none;
  border-radius: 8px;
  font-weight: 700;
}

.menu-item:hover {
  background: rgba(0, 0, 0, 0.05);
}

.menu-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: flex-end;
  padding: 6px 6px;
}

.menu-item {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  padding: 8px 10px;
}

.menu-label {
  font-size: 13px;
  margin-right: 8px;
}
.menu-icon {
  width: 14px;
  height: 14px;
  object-fit: contain;
}

.notifications h4 {
  margin: 0 0 10px 0;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
}

.notif-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.notif-item {
  background: #dff3ec;
  padding: 12px;
  border-radius: 8px;
  cursor: pointer;
}
.notif-title {
  font-weight: 700;
  margin-bottom: 6px;
}
.notif-body {
  color: rgba(0, 0, 0, 0.7);
  font-size: 14px;
}

.notif-empty {
  color: #666;
  font-size: 14px;
  text-align: center;
  padding: 12px;
}

.hero-main {
  margin-bottom: 80px;
}

.hero-title {
  font-size: 5rem;
  font-weight: 900;
  line-height: 1;
  margin-bottom: 20px;
}

.hero-subtitle {
  font-size: 1.2rem;
  max-width: 500px;
}

/* Stats Cards */
.stats-container {
  display: flex;
  gap: 20px;
}

.stat-card {
  background-color: #e0b751;
  color: #1a330a;
  padding: 30px;
  border-radius: 20px;
  flex: 1;
  max-width: 250px;
}

.stat-number {
  color: rgb(80, 65, 29);
  font-size: 3rem;
  font-weight: 900;
  margin: 0 0 10px 0;
}

.team-card .freguesia-nome {
  color: rgb(80, 65, 29);

  margin: 0 0 10px 0;
}

.stat-label {
  color: rgb(80, 65, 29);
}

/* Sobre Nós */
.about-section {
  padding: 100px 80px;
  display: flex;
  gap: 100px;
  align-items: center;
}

.section-title {
  font-size: 4rem;
  font-weight: 900;
  line-height: 1;
  margin-bottom: 30px;
}

.about-text {
  flex: 1;
}

.about-text p {
  font-size: 1.2rem;
  margin-bottom: 20px;
  color: #4a4a4a;
}

.about-gallery {
  flex: 1.5;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
}

.about-img {
  width: 100%;
  height: 400px;
  object-fit: cover;
  border-radius: 25px;
}

.teams-freguesias-section {
  padding: 40px 80px 100px;
}

.section-heading-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-title-small {
  font-size: 2rem;
  font-weight: 900;
  line-height: 1;
}

.section-link {
  color: #730000;
  font-weight: 800;
  text-decoration: none;
}

.teams-slider {
  display: flex;
  overflow-x: auto;
  gap: 20px;
  padding: 10px 5px 30px;
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch; /* Suavidade no iOS */
}

/* Estilização da barra de scroll para ser discreta */
.teams-slider::-webkit-scrollbar {
  height: 6px;
}
.teams-slider::-webkit-scrollbar-track {
  background: #f5f1e9;
  border-radius: 10px;
}
.teams-slider::-webkit-scrollbar-thumb {
  background: #e0b751;
  border-radius: 10px;
}

.team-card {
  flex: 0 0 280px;
  background: #f5f1e9;
  border: 1px solid #e2e8f0;
  border-radius: 18px;
  padding: 20px;
  scroll-snap-align: start;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.team-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}

.team-card h3 {
  margin: 0 0 8px 0;
  font-size: 1.1rem;
  font-weight: 800;
  color: #1e293b;
}

.team-card p {
  margin: 0;
  color: #64748b;
  font-weight: 600;
}

.freguesias-section {
  position: relative;
  padding: 90px;
  margin-bottom: -60px;
  /* O gradiente abaixo funciona como uma camada de cor por cima da imagem.
     rgba(255, 255, 255, 0.7) adiciona uma película branca com 70% de opacidade. */
  background-image:
    linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url('@/assets/fundo_freguesias.jpg');
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  overflow: hidden;
}

.freguesias-content-card {
  background: rgba(206, 206, 206, 0.15);
  padding-bottom: 40px;
  padding-left: 40px;
  padding-right: 40px;
  padding-top: 10px;
  border-radius: 30px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(10px);
}

/* Como Reportar */
.how-to-section {
  padding: 80px;
  background-color: #fafafa;
  padding-top: 100px;
  margin-top: 70px;
  padding-bottom: 160px;
  margin-bottom: -60px;
}

.section-title-large {
  font-size: 3.5rem;
  font-weight: 900;
  margin-bottom: 60px;
}

.section-title-freguesia {
  font-size: 3.5rem;
  font-weight: 900;
  margin-bottom: 40px;
  color: #e0b751;
}

.steps-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 40px;
}

.step h3 {
  font-size: 1.5rem;
  font-weight: 800;
  margin-bottom: 20px;
}

.step p {
  color: #666;
}

/* Footer */
.main-footer {
  padding: 60px 80px;
  background-color: #f5f1e9;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
}

.footer-links {
  display: flex;
  gap: 60px;
}

.col {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.col a {
  text-decoration: none;
  color: #2d5a27;
  font-weight: 600;
}

.footer-brand {
  text-align: right;
}

.logo-img-small {
  height: 80px;
}

.copyright {
  font-size: 0.8rem;
  color: #888;
  margin-top: 10px;
}

.home-actions {
  display: flex;
  justify-content: center;
  margin-top: 90px;
}

.login-btn {
  background: #730000;
  color: #fff;
  padding: 10px 20px;
  border-radius: 10px;
  font-weight: 800;
  text-decoration: none;
}

.login-btn:hover {
  opacity: 0.95;
}

/* Responsividade */
@media (max-width: 1024px) {
  .hero-title {
    font-size: 3.5rem;
  }
  .about-section,
  .steps-grid {
    flex-direction: column;
    grid-template-columns: 1fr;
  }
  .stats-container {
    flex-direction: column;
  }
  .teams-grid {
    grid-template-columns: 1fr;
  }
}
</style>

<script setup>
import { computed, ref, onMounted, onBeforeUnmount } from 'vue'
import FooterHome from '@/components/FooterHome.vue'
import SidebarMenu from '@/components/SidebarMenu.vue'
import AdminSidebarMenu from '@/components/AdminSidebarMenu.vue'
import ResponsavelSidebarMenu from '@/components/ResponsavelSidebarMenu.vue'
import { getNewOccurrenceRoute } from '@/utils/auth'
import { listAllOccurrences } from '@/services/occurrenceService'
import { listFreguesias } from '@/services/municipalityService'

const showMenu = ref(false)
const menuPanel = ref(null)
const menuIcon = ref(null)
const userRole = computed(() => localStorage.getItem('role'))
const newOccurrenceRoute = computed(() => getNewOccurrenceRoute())


// Stats from backend
const totalOccurrences = ref(0)
const resolvedCount = ref(0)
const inAnalysisCount = ref(0)
const loadingStats = ref(false)
const statsError = ref('')
let statsIntervalId = null

const parishes = ref([])
const loadingParishes = ref(false)

async function loadParishes() {
  loadingParishes.value = true
  try {
    const data = await listFreguesias()
    // Ordenamos as freguesias por nome para uma lista mais organizada
    parishes.value = data.sort((a, b) => a.nome.localeCompare(b.nome))
  } catch (error) {
    console.error('Failed to load parishes', error)
  } finally {
    loadingParishes.value = false
  }
}

async function loadStats() {
  loadingStats.value = true
  statsError.value = ''
  try {
    // Use listAllOccurrences to fetch occurrences for all citizens (global stats)
    const occs = await listAllOccurrences()
    totalOccurrences.value = Array.isArray(occs) ? occs.length : 0
    resolvedCount.value = Array.isArray(occs)
      ? occs.filter((o) => String(o.statusClass).toLowerCase().includes('resolvido')).length
      : 0
    inAnalysisCount.value = Array.isArray(occs)
      ? occs.filter((o) => {
          const cls = String(o.statusClass || '').toLowerCase()
          return cls === 'em-resolucao' || cls === 'espera'
        }).length
      : 0
  } catch (e) {
    console.error('Failed to load occurrence stats', e)
    statsError.value = 'Erro ao ligar ao backend'
    totalOccurrences.value = 0
    resolvedCount.value = 0
    inAnalysisCount.value = 0
  } finally {
    loadingStats.value = false
  }
}



function toggleMenu(event) {
  showMenu.value = !showMenu.value
  event.stopPropagation()
}



function handleDocClick(e) {
  

  const mPanel = menuPanel.value
  const mIcon = menuIcon.value
  if (showMenu.value) {
    if (mPanel && !mPanel.contains(e.target) && mIcon && !mIcon.contains(e.target)) {
      showMenu.value = false
    }
  }
}

onMounted(() => {
  // Verifica se é uma nova sessão de browser (a sessionStorage morre quando fechas o browser)
  // Se não existir o item 'session_initialized', significa que o browser foi reaberto.
  if (!sessionStorage.getItem('session_initialized')) {
    // Se não tiveres a opção "Lembrar-me" ativa, limpamos os dados persistentes
    if (localStorage.getItem('rememberMe') !== 'true') {
      localStorage.removeItem('authToken')
      localStorage.removeItem('userProfile')
      localStorage.removeItem('authUserId')
      localStorage.removeItem('authUserType')
      localStorage.removeItem('role')
    }
    // Marcamos a sessão como inicializada para não deslogar ao fazer refresh
    sessionStorage.setItem('session_initialized', 'true')
  }

  document.addEventListener('click', handleDocClick)
  void loadStats()
  void loadParishes()
  // Poll every 30s
  statsIntervalId = setInterval(() => {
    void loadStats()
  }, 30000)
})
onBeforeUnmount(() => {
  document.removeEventListener('click', handleDocClick)
  if (statsIntervalId) clearInterval(statsIntervalId)
})
</script>
