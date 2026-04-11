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
            <router-link to="/" class="menu-item" @click="showMenu = false">
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

    <main class="main-content">
      <div class="title-header">
        <div class="icon-main-bg">
          <img src="@/assets/ocorrencias.png" alt="Ocorrências" class="icon-main-img" />
        </div>
        <h1>Ocorrências</h1>
      </div>

      <div class="view-toggle">
        <span>Ver como:</span>
        <div class="toggle-buttons">
          <button
            :class="['toggle-btn', { active: viewMode === 'lista' }]"
            @click="viewMode = 'lista'"
          >
            Lista
          </button>
          <button
            :class="['toggle-btn', { active: viewMode === 'mapa' }]"
            @click="viewMode = 'mapa'"
          >
            Mapa
          </button>
        </div>
      </div>

      <section v-if="viewMode === 'lista'" class="list-view">
        <table class="occ-table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Situação ↕</th>
              <th>
                Tipo de Problema <img src="@/assets/detalhes.png" alt="Detalhes" class="th-icon" />
              </th>
              <th>Detalhes</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="occ in ocorrencias" :key="occ.id">
              <td class="user-cell">
                <img :src="occ.userImg" class="avatar" />
                {{ occ.nome }}
              </td>
              <td>
                <span :class="['status-badge', occ.statusClass]">{{ occ.situacao }}</span>
              </td>
              <td>{{ occ.tipo }}</td>
              <td class="details-cell">{{ occ.detalhes }}</td>
              <td>
                <router-link :to="`/ocorrencia/${occ.id}`">
                  <img src="@/assets/detalhes.png" alt="Detalhes" class="info-btn" />
                </router-link>
              </td>
            </tr>
          </tbody>
        </table>
      </section>

      <section v-else class="map-view">
        <div class="map-container">
          <div class="map-placeholder">
            <div class="marker red" style="top: 40%; left: 45%">3</div>
            <div class="marker red-large" style="top: 55%; left: 25%">6</div>
            <div class="marker green" style="top: 75%; left: 75%">1</div>
          </div>

          <div class="map-info-card">
            <div class="card-header">
              <span class="icon-yellow">💡</span>
              <h3>Iluminação</h3>
            </div>
            <p>
              <strong>Status:</strong> <span class="status-badge em-resolucao">Em Resolução</span>
            </p>
            <p><strong>Localização:</strong><br />R. Dom Sancho I 981, 4480-876 Vila do Conde</p>
            <p>
              <strong>Descrição:</strong><br />A iluminação junto à entrada do campus universitário
              está muito fraca...
            </p>
            <div class="reported-by">
              <strong>Reportado por:</strong>
              <div class="user-chip">
                <img src="@/assets/avatar.png" class="avatar-xs" />
                <span>Miguel Silva</span>
              </div>
            </div>
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
        <p class="copyright">© 2026 VC Comunica All rights reserved.</p>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import notifOn from '@/assets/notificationson.png'
import notifOff from '@/assets/notificationsoff.png'

const viewMode = ref('lista')
const showNotif = ref(false)
const showMenu = ref(false)
const notifications = ref([
  {
    id: 1,
    title: 'Estado da ocorrência',
    body: 'O estado foi alterado para <strong>Resolvido</strong>',
  },
])

const notifPanel = ref(null)
const notifIcon = ref(null)
const menuPanel = ref(null)
const menuIcon = ref(null)

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

const ocorrencias = ref([
  {
    id: 1,
    nome: 'Mariana Silva',
    situacao: 'Resolvido',
    statusClass: 'resolvido',
    tipo: 'Sinalização',
    detalhes: 'Necessária a poda de árvores...',
    userImg: '/img/avatar1.png',
  },
  {
    id: 2,
    nome: 'Ricardo Pereira',
    situacao: 'Em Resolução',
    statusClass: 'em-resolucao',
    tipo: 'Buracos na Via',
    detalhes: 'Reparação urgente de buraco...',
    userImg: '/img/avatar2.png',
  },
  {
    id: 3,
    nome: 'Beatriz Costa',
    situacao: 'À espera de equipa',
    statusClass: 'espera',
    tipo: 'Iluminação Pública',
    detalhes: 'Substituição de lâmpada...',
    userImg: '/img/avatar3.png',
  },
])

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

/* MENU & NOTIFICAÇÕES */
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
.main-content {
  padding: 40px 80px;
  min-height: 70vh;
}
.title-header {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 30px;
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
.title-header h1 {
  font-size: 32px;
  font-weight: 800;
}

.view-toggle {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 30px;
  font-weight: bold;
}
.toggle-buttons {
  display: flex;
  background: #f1f5f9;
  border-radius: 8px;
  padding: 4px;
}
.toggle-btn {
  border: none;
  padding: 6px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: bold;
  transition: 0.3s;
}
.toggle-btn.active {
  background: #3b82f6;
  color: white;
}

/* TABELA */
.occ-table {
  width: 100%;
  border-collapse: collapse;
}
.occ-table th {
  text-align: left;
  padding: 15px;
  border-bottom: 1px solid #eee;
  color: #64748b;
}
.occ-table td {
  padding: 15px;
  border-bottom: 1px solid #f8fafc;
}
.avatar {
  width: 35px;
  height: 35px;
  border-radius: 50%;
  margin-right: 10px;
  vertical-align: middle;
}
.info-btn {
  width: 30px;
  height: 30px;
  cursor: pointer;
}

/* MAPA */
.map-container {
  display: grid;
  grid-template-columns: 1fr 350px;
  gap: 30px;
  height: 500px;
}
.map-placeholder {
  position: relative;
  background: #e2e8f0;
  border-radius: 15px;
  overflow: hidden;
}
.marker {
  position: absolute;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  border: 2px solid white;
}
.red {
  background: #ef4444;
}
.red-large {
  background: #b91c1c;
  width: 45px;
  height: 45px;
  font-size: 1.2rem;
}
.green {
  background: #22c55e;
}
.map-info-card {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 15px;
  padding: 25px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}
.card-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
}
.icon-yellow {
  background: #facc15;
  padding: 8px;
  border-radius: 8px;
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

/* STATUS BADGES */
.status-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: bold;
}
.resolvido {
  background: #dcfce7;
  color: #166534;
}
.em-resolucao {
  background: #fef9c3;
  color: #854d0e;
}
.espera {
  background: #ffedd5;
  color: #9a3412;
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
