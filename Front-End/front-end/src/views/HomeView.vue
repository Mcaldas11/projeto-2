<template>
  <div class="page-container">
    <header class="hero-section">
      <div class="overlay"></div>
      <div class="content-wrapper">
        <nav class="navbar">
          <div class="logo-area">
            <img src="@/assets/logo.png" alt="VC Comunica Logo" class="logo-img">
          </div>
          <div class="nav-icons" ref="navIcons">
            <span class="icon add">+</span>
            <img :src="notifications.length === 0 ? notifOff : notifOn" alt="notifications" class="icon notification" @click="toggleNotif" ref="notifIcon" />
            <span class="icon">☰</span>

            <div v-if="showNotif" class="notifications" ref="notifPanel">
              <h4>Notificações</h4>
              <div class="notif-list">
                <div v-for="(n, i) in notifications" :key="n.id" class="notif-item" @click.stop="removeNotif(i)">
                  <div class="notif-title">{{ n.title }}</div>
                  <div class="notif-body" v-html="n.body"></div>
                </div>
                <div v-if="notifications.length === 0" class="notif-empty">Sem notificações</div>
              </div>
            </div>
          </div>
        </nav>

        <div class="hero-main">
          <h1 class="hero-title">A sua cidade,<br>a sua voz!</h1>
          <p class="hero-subtitle">
            A VC Comunica é a sua plataforma para reportar problemas urbanos.
            Junte-se a nós e construa uma cidade mais eficiente e conectada.
          </p>
        </div>

        <div class="stats-container">
          <div class="stat-card">
            <h2 class="stat-number">146</h2>
            <p class="stat-label">Ocorrências reportadas</p>
          </div>
          <div class="stat-card">
            <h2 class="stat-number">125</h2>
            <p class="stat-label">Ocorrências resolvidas</p>
          </div>
          <div class="stat-card">
            <h2 class="stat-number">31</h2>
            <p class="stat-label">Ocorrências em análise</p>
          </div>
        </div>
      </div>
    </header>

    <section class="about-section">
      <div class="about-text">
        <h2 class="section-title">Sobre<br>Nós</h2>
        <p>A VC Comunica é uma plataforma inovadora, criada para conectar cidadãos e autoridades.</p>
        <p>Nosso objetivo é facilitar a comunicação de ocorrências, promover a transparência e construir uma cidade mais segura e eficiente para todos.</p>
      </div>
      <div class="about-gallery">
        <img src="@/assets/about1.png" alt="Ocorrência 1" class="about-img">
        <img src="@/assets/about2.png" alt="Ocorrência 2" class="about-img">
        <img src="@/assets/about3.png" alt="Ocorrência 3" class="about-img">
      </div>
    </section>

    <section class="how-to-section">
      <h2 class="section-title-large">Como reportar uma ocorrência</h2>
      <div class="steps-grid">
        <div class="step">
          <h3>1. Escolhe o tipo de ocorrência</h3>
          <p>Escolha a categoria da ocorrência que pretende reportar. Estas podem ser de 5 tipos diferentes, sendo estes: Estradas e passeios, Sinalização e trânsito, Iluminação, Higiene Pública e Parques e Jardins.</p>
        </div>
        <div class="step">
          <h3>2. Descrição da ocorrência e detalhes pessoais</h3>
          <p>Descreva a ocorrência com o máximo de detalhes possível.</p>
        </div>
        <div class="step">
          <h3>3. Adicionar fotos</h3>
          <p>Para adicionar fotos, basta selecionar as imagens relevantes do seu dispositivo. Certifique-se de que as fotos são nítidas e ilustram claramente a ocorrência.</p>
        </div>
      </div>
    </section>

    <footer class="main-footer">
      <div class="footer-links">
        <div class="col">
          <a href="#">Home</a>
          <a href="#">Ocorrências</a>
          <a href="#">Mapa Ocorrências</a>
        </div>
        <div class="col">
          <a href="#">Sobre</a>
          <a href="#">Conta</a>
        </div>
      </div>
      <div class="footer-brand">
        <div class="logo-area">
          <img src="@/assets/logo_footer.png" alt="Logo" class="logo-img-small">
        </div>
      </div>
    </footer>
  </div>
</template>

<style scoped>
/* Reset básico e tipografia */
.page-container {
  font-family: Arial, sans-serif; /* Substitua por Inter se tiver importado */
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
  top: 0; left: 0; right: 0; bottom: 0;
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

.logo-img { height: 40px; }
.logo-text { font-weight: bold; font-size: 1.5rem; }

.nav-icons {
  display: flex;
  gap: 20px;
  font-size: 1.2rem;
  cursor: pointer;
  position: relative;
}

.nav-icons .icon.add {
  background: #730000; /* red */
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
  box-shadow: 0 12px 30px rgba(0,0,0,0.15);
  z-index: 60;
}

.notifications h4 {
  margin: 0 0 10px 0;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
}

.notif-list { display: flex; flex-direction: column; gap: 12px }
.notif-item { background: #dff3ec; padding: 12px; border-radius: 8px; cursor: pointer }
.notif-title { font-weight: 700; margin-bottom: 6px }
.notif-body { color: rgba(0,0,0,0.7); font-size: 14px }

.notif-empty { color: #666; font-size: 14px; text-align: center; padding: 12px }

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
  background-color: #b9f397; /* Verde limão do design */
  color: #1a330a;
  padding: 30px;
  border-radius: 20px;
  flex: 1;
  max-width: 250px;
}

.stat-number {
  font-size: 3rem;
  font-weight: 900;
  margin: 0 0 10px 0;
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

/* Como Reportar */
.how-to-section {
  padding: 80px;
  background-color: #fafafa;
}

.section-title-large {
  font-size: 3.5rem;
  font-weight: 900;
  margin-bottom: 60px;
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
  background-color: #f5f1e9; /* Cor bege do fundo */
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

.logo-img-small { height: 80px; }

.copyright {
  font-size: 0.8rem;
  color: #888;
  margin-top: 10px;
}

/* Responsividade Básica */
@media (max-width: 1024px) {
  .hero-title { font-size: 3.5rem; }
  .about-section, .steps-grid { flex-direction: column; grid-template-columns: 1fr; }
  .stats-container { flex-direction: column; }
}
</style>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import notifOn from '@/assets/notificationson.png'
import notifOff from '@/assets/notificationsoff.png'

const showNotif = ref(false)
const notifPanel = ref(null)
const notifIcon = ref(null)

const notifications = ref([
  { id: 1, title: 'Estado da ocorrência', body: 'O estado da sua ocorrência foi alterado para <strong>Resolvido</strong>' },
  { id: 2, title: 'Estado da ocorrência', body: 'O estado da sua ocorrência foi alterado para <strong>Resolvido</strong>' },
])

function toggleNotif(event) {
  showNotif.value = !showNotif.value
  event.stopPropagation()
}

function removeNotif(index) {
  notifications.value.splice(index, 1)
}

function handleDocClick(e) {
  const panel = notifPanel.value
  const icon = notifIcon.value
  if (!showNotif.value) return
  if (panel && !panel.contains(e.target) && icon && !icon.contains(e.target)) {
    showNotif.value = false
  }
}

onMounted(() => document.addEventListener('click', handleDocClick))
onBeforeUnmount(() => document.removeEventListener('click', handleDocClick))
</script>