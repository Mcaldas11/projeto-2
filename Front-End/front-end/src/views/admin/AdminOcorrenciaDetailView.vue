<template>
  <div class="page-container">
    <nav class="navbar">
      <div class="logo-area">
        <img src="@/assets/logoP.png" alt="VC Comunica Logo" class="logo-img" />
      </div>
      <div class="nav-right">
        <span class="admin-label">Admin</span>
        <img
          :src="notifications.length === 0 ? notifOff : notifOn"
          alt="notifications"
          class="icon notification"
          @click="toggleNotif"
          ref="notifIcon"
        />
        <span class="icon menu-trigger" ref="menuIcon" @click="toggleMenu">☰</span>

        <div v-if="showMenu" class="hamburger-menu" ref="menuPanel">
          <div class="menu-list">
            <router-link to="/admin" class="menu-item" @click="showMenu = false">
              <span class="menu-label">Home</span>
              <img src="@/assets/home.png" alt="home" class="menu-icon" />
            </router-link>
            <router-link to="/admin" class="menu-item" @click="showMenu = false">
              <span class="menu-label">Ocorrências</span>
              <img src="@/assets/ocorrencias.png" alt="ocorrencias" class="menu-icon" />
            </router-link>
            <router-link to="/admin/rotas" class="menu-item" @click="showMenu = false">
              <span class="menu-label">Rotas</span>
              <img src="@/assets/ocorrencias.png" alt="rotas" class="menu-icon" />
            </router-link>
            <router-link to="/admin/equipas" class="menu-item" @click="showMenu = false">
              <span class="menu-label">Equipas</span>
              <img src="@/assets/ocorrencias.png" alt="equipas" class="menu-icon" />
            </router-link>
            <router-link to="/admin/trabalhadores" class="menu-item" @click="showMenu = false">
              <span class="menu-label">Funcionarios</span>
              <img src="@/assets/conta.png" alt="funcionarios" class="menu-icon" />
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
      <!-- Breadcrumb -->
      <div class="breadcrumb-header">
        <div class="icon-main-bg">
          <img src="@/assets/ocorrencias.png" alt="Ocorrências" class="icon-main-img" />
        </div>
        <h1>
          Ocorrências <span class="breadcrumb-sep">&gt;</span>
          <span class="breadcrumb-current">Ocorrencia...</span>
        </h1>
      </div>

      <!-- Alert Banner -->
      <div class="alert-banner">
        <div class="alert-content">
          <div class="alert-left">
            <div class="alert-title-row">
              <span class="alert-icon">⚠</span>
              <strong>Localização Errada</strong>
            </div>
            <div class="alert-body">
              <p><strong>Descrição:</strong></p>
              <p>
                Deslocação ao local efetuada para verificação de anomalia na iluminação pública.
                Após inspeção técnica no ponto indicado, confirmou-se que o sistema se encontra em
                pleno estado de funcionamento, não tendo sido detetada qualquer irregularidade ou
                falha no momento da visita.
              </p>
              <div class="alert-actions">
                <strong>Ações:</strong>
                <div class="alert-buttons">
                  <button class="btn-action dark">Fechar Ocorrência</button>
                  <button class="btn-action dark">Contactar Cidadão</button>
                </div>
              </div>
            </div>
          </div>
          <div class="alert-right">
            <p><strong>Reportado por:</strong> Sofia Pereira</p>
            <p><strong>Data:</strong> 12/07/2023</p>
            <p><strong>Hora:</strong> 14:43</p>
          </div>
        </div>
      </div>

      <!-- Main Details Grid -->
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
                  :class="{ active: activeImageIndex === index }"
                  @click="activeImageIndex = index"
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
              <strong>Status:</strong>
              <span class="status-badge em-resolucao">Em Resolução</span>
              <span class="edit-icon" title="Editar status">✏️</span>
            </p>
            <p><strong>Localização:</strong><br />R. Dom Sancho I 981, 4480-876 Vila do Conde</p>
            <p>
              <strong>Descrição:</strong><br />A iluminação junto à entrada do campus universitário
              está muito fraca e com várias lâmpadas fundidas. Solicito a reparação para garantir a
              segurança dos estudantes que circulam no local à noite.
            </p>
          </div>
        </section>
      </div>

      <!-- Informação Cidadão -->
      <section class="cidadao-section">
        <h2>Informação Cidadão:</h2>
        <div class="cidadao-card">
          <img src="@/assets/avatar.png" alt="Cidadão" class="cidadao-avatar" />
          <div class="cidadao-details">
            <h3>Miguel Silva</h3>
            <div class="cidadao-grid">
              <div>
                <p><strong>Nº Telemóvel:</strong> (+351) 912 345 678</p>
                <p><strong>Municipio:</strong> Vila do Conde</p>
              </div>
              <div>
                <p><strong>Email:</strong> miguel.silva@example.com</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>

    <footer class="main-footer">
      <div class="footer-links">
        <div class="col">
          <router-link to="/admin">Home</router-link>
          <router-link to="/admin">Ocorrências</router-link>
          <router-link to="/admin/rotas">Rotas</router-link>
          <router-link to="/admin/equipas">Equipas</router-link>
          <router-link to="/admin/trabalhadores">Funcionarios</router-link>
        </div>
        <div class="col">
          <router-link to="/sobre">Sobre</router-link>
        </div>
      </div>
      <div class="footer-brand">
        <img src="@/assets/logo_footer.png" alt="Logo" class="logo-img-small" />
        <p class="copyright">© 2026 VC Comunica All rights reserved.</p>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import notifOn from '@/assets/notificationson.png'
import notifOff from '@/assets/notificationsoff.png'

const showNotif = ref(false)
const showMenu = ref(false)
const notifPanel = ref(null)
const notifIcon = ref(null)
const menuPanel = ref(null)
const menuIcon = ref(null)

const notifications = ref([
  {
    id: 1,
    title: 'Nova ocorrência',
    body: 'Uma nova ocorrência foi reportada em <strong>Vila do Conde</strong>',
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

function handleDocClick(e) {
  if (
    showNotif.value &&
    notifPanel.value &&
    !notifPanel.value.contains(e.target) &&
    notifIcon.value &&
    !notifIcon.value.contains(e.target)
  ) {
    showNotif.value = false
  }
  if (
    showMenu.value &&
    menuPanel.value &&
    !menuPanel.value.contains(e.target) &&
    menuIcon.value &&
    !menuIcon.value.contains(e.target)
  ) {
    showMenu.value = false
  }
}

onMounted(() => document.addEventListener('click', handleDocClick))
onBeforeUnmount(() => document.removeEventListener('click', handleDocClick))

// Gallery
const gallery = ['/img/iluminacao1.jpg', '/img/iluminacao2.jpg', '/img/iluminacao3.jpg']
const activeImageIndex = ref(0)
const activeImage = computed(() => gallery[activeImageIndex.value])

const nextImg = () => {
  activeImageIndex.value = (activeImageIndex.value + 1) % gallery.length
}
const prevImg = () => {
  activeImageIndex.value = (activeImageIndex.value - 1 + gallery.length) % gallery.length
}
</script>

<style scoped>
.page-container {
  font-family: Arial, sans-serif;
  color: #1a1a1a;
  background: #fff;
}

/* NAVBAR */
.navbar {
  display: flex;
  justify-content: space-between;
  padding: 20px 80px;
  align-items: center;
  background: white;
  border-bottom: 1px solid #f0f0f0;
}
.logo-img {
  height: 40px;
}
.nav-right {
  display: flex;
  gap: 15px;
  align-items: center;
  position: relative;
}
.admin-label {
  font-weight: 700;
  font-size: 16px;
  color: #1a1a1a;
}
.icon {
  cursor: pointer;
  font-size: 1.2rem;
}
.icon.notification {
  width: 28px;
  height: 28px;
  object-fit: contain;
  cursor: pointer;
}
.menu-trigger {
  font-size: 1.4rem;
}

/* MENU & NOTIFICATIONS */
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
  width: 220px;
}
.menu-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
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
  padding: 8px 10px;
  border-radius: 8px;
  width: 100%;
  transition: background 0.15s;
}
.menu-item:hover {
  background: rgba(0, 0, 0, 0.05);
}
.menu-label {
  font-size: 13px;
}
.menu-icon {
  width: 14px;
  height: 14px;
  object-fit: contain;
}
.notifications {
  width: 320px;
}
.notifications h4 {
  margin: 0 0 10px 0;
  font-size: 18px;
}
.notif-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.notif-item {
  background: #dff3ec;
  padding: 12px;
  border-radius: 8px;
  cursor: pointer;
}
.notif-title {
  font-weight: 700;
  margin-bottom: 4px;
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

/* CONTENT */
.content-wrapper {
  max-width: 1100px;
  margin: 40px auto;
  padding: 0 20px;
}

/* BREADCRUMB */
.breadcrumb-header {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 30px;
}
.breadcrumb-header h1 {
  font-size: 28px;
  font-weight: 800;
  margin: 0;
}
.breadcrumb-sep {
  color: #1a1a1a;
  margin: 0 4px;
}
.breadcrumb-current {
  color: #64748b;
  font-weight: 600;
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

/* ALERT BANNER */
.alert-banner {
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 15px;
  padding: 25px;
  margin-bottom: 40px;
}
.alert-content {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 30px;
}
.alert-title-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}
.alert-icon {
  background: #fbbf24;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 16px;
}
.alert-title-row strong {
  font-size: 18px;
}
.alert-body p {
  margin: 0 0 8px 0;
  font-size: 14px;
  color: #475569;
  line-height: 1.6;
}
.alert-actions {
  margin-top: 12px;
}
.alert-actions strong {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
}
.alert-buttons {
  display: flex;
  gap: 10px;
}
.btn-action {
  border: none;
  padding: 8px 18px;
  border-radius: 8px;
  font-weight: 700;
  font-size: 13px;
  cursor: pointer;
  transition: opacity 0.15s;
}
.btn-action.dark {
  background: #1e293b;
  color: #fff;
}
.btn-action:hover {
  opacity: 0.85;
}
.alert-right {
  min-width: 180px;
}
.alert-right p {
  margin: 0 0 6px 0;
  font-size: 14px;
  color: #475569;
}

/* MAIN DETAILS GRID */
.main-details-grid {
  display: grid;
  grid-template-columns: 1.2fr 0.8fr;
  gap: 40px;
  margin-bottom: 50px;
}
.featured-image {
  width: 100%;
  border-radius: 15px;
  height: 380px;
  object-fit: cover;
  background: #111;
}
.gallery-nav {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
  margin-top: 15px;
}
.gallery-nav button {
  background: #fff;
  border: 1px solid #e6e6e6;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  font-size: 20px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s;
}
.gallery-nav button:hover {
  background: #f3f4f6;
}
.thumbnails img {
  width: 60px;
  height: 45px;
  border-radius: 6px;
  cursor: pointer;
  opacity: 0.5;
  transition: opacity 0.15s;
}
.thumbnails img.active {
  opacity: 1;
  border: 2px solid #730000;
}

/* INFO SIDEBAR */
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
.category-header h3 {
  font-size: 20px;
  font-weight: 700;
  margin: 0;
}
.icon-yellow {
  background: #facc15;
  padding: 8px;
  border-radius: 8px;
}
.info-group p {
  margin: 0 0 15px 0;
  font-size: 14px;
  line-height: 1.6;
  color: #475569;
}
.status-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-weight: 700;
  font-size: 13px;
}
.em-resolucao {
  background: #fef9c3;
  color: #ca8a04;
}
.edit-icon {
  margin-left: 8px;
  cursor: pointer;
  font-size: 16px;
}

/* CIDADÃO SECTION */
.cidadao-section {
  border-top: 1px solid #f1f5f9;
  padding-top: 30px;
  margin-bottom: 40px;
}
.cidadao-section h2 {
  font-size: 22px;
  font-weight: 800;
  margin: 0 0 25px 0;
}
.cidadao-card {
  display: flex;
  align-items: flex-start;
  gap: 25px;
}
.cidadao-avatar {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  object-fit: cover;
}
.cidadao-details h3 {
  font-size: 18px;
  font-weight: 800;
  margin: 0 0 12px 0;
}
.cidadao-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px 60px;
}
.cidadao-grid p {
  margin: 0 0 8px 0;
  font-size: 14px;
  color: #475569;
}

/* FOOTER */
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

@media (max-width: 1024px) {
  .navbar,
  .main-footer {
    padding: 20px;
  }
  .main-details-grid {
    grid-template-columns: 1fr;
  }
  .alert-content {
    grid-template-columns: 1fr;
  }
  .cidadao-grid {
    grid-template-columns: 1fr;
  }
}
</style>
