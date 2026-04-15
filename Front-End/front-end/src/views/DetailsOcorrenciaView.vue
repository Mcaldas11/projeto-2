<template>
  <div class="page-container">
    <nav class="navbar">
      <div class="logo-area">
        <img src="@/assets/logoP.png" alt="VC Comunica Logo" class="logo-img" />
      </div>
      <div class="nav-icons" ref="navIcons">
        <router-link to="/new-ocorrencia" class="icon add">+</router-link>
        <img
          :src="notifications.length === 0 ? notifOff : notifOn"
          alt="notifications"
          class="icon notification"
          @click="toggleNotif"
          ref="notifIcon"
        />
        <span class="icon" ref="menuIcon" @click="toggleMenu">☰</span>

        <div v-if="showMenu" class="hamburger-menu" ref="menuPanel">
          <div class="menu-list">
            <router-link to="/" class="menu-item" @click.prevent="navigateHome">
              <span class="menu-label">Home</span>
              <img src="@/assets/home.png" alt="home" class="menu-icon" />
            </router-link>

            <router-link to="/ocorrencias" class="menu-item" @click="showMenu = false">
              <span class="menu-label">Ocorrências</span>
              <img src="@/assets/ocorrencias.png" alt="ocorrencias" class="menu-icon" />
            </router-link>

            <router-link to="/conta" class="menu-item" @click="showMenu = false">
              <span class="menu-label">Conta</span>
              <img src="@/assets/conta.png" alt="conta" class="menu-icon" />
            </router-link>
          </div>
        </div>

        <div v-if="showNotif" class="notifications" ref="notifPanel">
          <h4>Notificações</h4>
          <div class="notif-list">
            <div
              v-for="(n, i) in notifications"
              :key="n.id"
              class="notif-item"
              @click.stop="removeNotif(i)"
            >
              <div class="notif-title">{{ n.title }}</div>
              <div class="notif-body" v-html="n.body"></div>
            </div>
            <div v-if="notifications.length === 0" class="notif-empty">Sem notificações</div>
          </div>
        </div>
      </div>
    </nav>

    <main class="content-wrapper">
      <div class="breadcrumb-header">
        <div class="icon-main-bg">
          <img src="@/assets/ocorrencias.png" alt="Ocorrências" class="icon-main-img" />
        </div>
        <h1>Ocorrências > <span>Ocorrência 35</span></h1>
      </div>

      <div class="main-details-grid">
        <section class="image-gallery">
          <div class="main-image-container">
            <img :src="activeImage" class="featured-image" />
            <div class="gallery-nav">
              <button @click="prevImg">‹</button>
              <div class="thumbnails">
                <img
                  v-for="(img, index) in gallery"
                  :key="index"
                  :src="img"
                  :class="{ active: activeImage === img }"
                  @click="activeImage = img"
                />
              </div>
              <button @click="nextImg">›</button>
            </div>
          </div>
        </section>

        <section class="info-sidebar">
          <div class="category-header">
            <span class="icon-yellow">💡</span>
            <h3>Iluminação</h3>
          </div>

          <div class="info-group">
            <p>
              <strong>Status:</strong> <span class="status-badge em-resolucao">Em Resolução</span>
            </p>
            <p><strong>Localização:</strong><br />R. Dom Sancho I 981, 4480-876 Vila do Conde</p>
            <p>
              <strong>Descrição:</strong><br />A iluminação junto à entrada do campus universitário
              está muito fraca e com várias lâmpadas fundidas. Solicito a reparação para garantir a
              segurança dos estudantes que circulam no local à noite.
            </p>

            <div class="reporter-info">
              <p><strong>Reportado por:</strong></p>
              <div class="user-chip">
                <img src="@/assets/avatar.png" class="avatar-xs" />
                <span>Miguel Silva</span>
              </div>
            </div>
            <div v-if="isWorker" class="worker-actions">
              <button class="report-btn" @click="reportError">Reportar Erro</button>
            </div>
          </div>
        </section>
      </div>

      <section class="team-section">
        <div class="section-title">
          <span class="team-icon">👷</span>
          <h3>Informação da equipa:</h3>
        </div>

        <div class="team-content">
          <div class="workers-list">
            <p><strong>Trabalhadores alocados:</strong></p>
            <div class="workers-grid">
              <div class="worker-card">
                <img src="@/assets/trabalhador1.png" alt="José Almeida" />
                <span>José Almeida</span>
              </div>
              <div class="worker-card">
                <img src="@/assets/trabalhador2.png" alt="Nuno Martins" />
                <span>Nuno Martins</span>
              </div>
            </div>
          </div>

          <div class="tech-info">
            <p><strong>Especialização:</strong> Eletricista</p>
            <p><strong>Município:</strong> Vila do Conde</p>
          </div>
        </div>
      </section>
    </main>

    <footer class="main-footer">
      <div class="footer-links">
        <div class="col">
          <router-link to="/">Home</router-link>
          <router-link to="/ocorrencias">Ocorrências</router-link>
          <router-link to="/mapa">Mapa Ocorrências</router-link>
        </div>
        <div class="col">
          <router-link to="/sobre">Sobre</router-link>
          <router-link to="/conta">Conta</router-link>
        </div>
      </div>
      <div class="footer-brand">
        <img src="@/assets/logo_footer.png" alt="Logo" class="logo-img-small" />
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import notifOn from '@/assets/notificationson.png'
import notifOff from '@/assets/notificationsoff.png'

// Estados do Header
const showNotif = ref(false)
const showMenu = ref(false)
const notifPanel = ref(null)
const notifIcon = ref(null)
const menuPanel = ref(null)
const menuIcon = ref(null)

const notifications = ref([
  {
    id: 1,
    title: 'Estado da ocorrência',
    body: 'O estado foi alterado para <strong>Resolvido</strong>',
  },
])

const toggleNotif = (e) => {
  e.stopPropagation()
  showNotif.value = !showNotif.value
  showMenu.value = false
}

const toggleMenu = (e) => {
  e.stopPropagation()
  showMenu.value = !showMenu.value
  showNotif.value = false
}

const removeNotif = (i) => notifications.value.splice(i, 1)

// Fechar ao clicar fora
function handleDocClick(e) {
  if (
    showNotif.value &&
    notifPanel.value &&
    !notifPanel.value.contains(e.target) &&
    !notifIcon.value.contains(e.target)
  ) {
    showNotif.value = false
  }
  if (
    showMenu.value &&
    menuPanel.value &&
    !menuPanel.value.contains(e.target) &&
    !menuIcon.value.contains(e.target)
  ) {
    showMenu.value = false
  }
}

onMounted(() => document.addEventListener('click', handleDocClick))
onBeforeUnmount(() => document.removeEventListener('click', handleDocClick))

// Galeria
const gallery = ['/img/iluminacao1.jpg', '/img/iluminacao2.jpg', '/img/iluminacao3.jpg']
const activeImage = ref(gallery[0])

const isWorker = ref(false)

onMounted(() => {
  // existing onMounted already used to register click handler earlier; ensure role check runs after mount
  isWorker.value = localStorage.getItem('role') === 'trabalhador'
})

const router = useRouter()

const navigateHome = (e) => {
  if (e && e.preventDefault) e.preventDefault()
  const role = localStorage.getItem('role')
  if (role === 'trabalhador') router.push({ name: 'trabalhador-home' })
  else router.push({ name: 'home' })
  showMenu.value = false
}

const nextImg = () => {
  const idx = gallery.indexOf(activeImage.value)
  activeImage.value = gallery[(idx + 1) % gallery.length]
}
const prevImg = () => {
  const idx = gallery.indexOf(activeImage.value)
  activeImage.value = gallery[(idx - 1 + gallery.length) % gallery.length]
}
const reportError = () => {
  // placeholder action for reporting an error from worker
  console.log('Reportar Erro clicked')
  alert('Reportar Erro: ação simulada (só visível a trabalhadores)')
}
</script>

<style scoped>
.page-container {
  font-family: Arial, sans-serif;
  color: #1a1a1a;
}

/* NAVBAR (Styles da Home) */
.navbar {
  display: flex;
  justify-content: space-between;
  padding: 20px 80px;
  align-items: center;
  background: white;
}
.logo-img {
  height: 40px;
}
.nav-icons {
  display: flex;
  gap: 20px;
  align-items: center;
  position: relative;
  cursor: pointer;
}
.icon.add {
  background: #730000;
  color: white;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  text-decoration: none;
  font-weight: 700;
}
.icon.notification {
  width: 28px;
  height: 28px;
  object-fit: contain;
}

/* MENU & NOTIFICAÇÕES (Styles da Home) */
.hamburger-menu,
.notifications {
  position: absolute;
  top: 44px;
  right: 0;
  background: #fff;
  border-radius: 12px;
  padding: 12px;
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.15);
  z-index: 70;
}
.hamburger-menu {
  width: 200px;
}
.menu-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: flex-end;
}
.menu-item {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  text-decoration: none;
  color: #0b2b2b;
  font-weight: 700;
  padding: 8px;
  width: 100%;
}
.menu-label {
  font-size: 13px;
}
.menu-icon {
  width: 14px;
  height: 14px;
}
.notif-item {
  background: #dff3ec;
  padding: 12px;
  border-radius: 8px;
  cursor: pointer;
  margin-bottom: 8px;
}
.notif-title {
  font-weight: 700;
}

/* CONTEÚDO ESPECÍFICO */
.content-wrapper {
  max-width: 1100px;
  margin: 40px auto;
  padding: 0 20px;
}
.breadcrumb-header {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 30px;
}
.breadcrumb-header h1 {
  font-size: 28px;
  font-weight: 800;
}
.breadcrumb-header h1 span {
  color: #64748b;
  font-weight: 400;
}
.icon-main-bg {
  background: #730000;
  padding: 10px;
  border-radius: 8px;
}
.icon-main-img {
  width: 30px;
  height: 30px;
  filter: brightness(0) invert(1);
}

.main-details-grid {
  display: grid;
  grid-template-columns: 1.2fr 0.8fr;
  gap: 40px;
  margin-bottom: 50px;
}
.featured-image {
  width: 100%;
  border-radius: 15px;
  height: 400px;
  object-fit: cover;
  background: #000;
}
.gallery-nav {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
  margin-top: 15px;
}
.gallery-nav button {
  background: #ffffff;
  border: 1px solid #e6e6e6;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  font-size: 20px;
  line-height: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.15s ease, transform 0.08s ease;
  padding: 0;
}
.gallery-nav button:hover { background: #f3f4f6; transform: translateY(-1px); }
.gallery-nav button:active { transform: translateY(0); }
.gallery-nav button:disabled { opacity: 0.5; cursor: not-allowed; }
.thumbnails img {
  width: 60px;
  height: 45px;
  border-radius: 6px;
  cursor: pointer;
  opacity: 0.6;
}
.thumbnails img.active {
  opacity: 1;
  border: 2px solid #730000;
}

.info-sidebar {
  background: white;
  border: 1px solid #f1f5f9;
  border-radius: 20px;
  padding: 30px;
}
.category-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
}
.icon-yellow {
  background: #facc15;
  padding: 8px;
  border-radius: 8px;
}
.status-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-weight: bold;
  font-size: 13px;
}
.em-resolucao {
  background: #fef9c3;
  color: #ca8a04;
}
.user-chip {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 5px;
}
.avatar-xs {
  width: 28px;
  height: 28px;
  border-radius: 50%;
}

.team-section {
  border-top: 1px solid #f1f5f9;
  padding-top: 30px;
}
.workers-grid {
  display: flex;
  gap: 30px;
  margin-top: 15px;
}
.worker-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}
.worker-card img {
  width: 60px;
  height: 60px;
  border-radius: 50%;
}

.worker-actions { margin-top: 16px }
.report-btn {
  background: #730000;
  color: #fff;
  border: none;
  padding: 10px 14px;
  border-radius: 8px;
  font-weight: 700;
  cursor: pointer;
}


/* FOOTER (Styles da Home) */
.main-footer {
  padding: 60px 80px;
  background-color: #f5f1e9;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-top: 60px;
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
.logo-img-small {
  height: 80px;
}
.copyright {
  font-size: 0.8rem;
  color: #888;
  margin-top: 10px;
}
</style>
