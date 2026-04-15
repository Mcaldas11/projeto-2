<template>
  <div class="page-container">
    <nav class="navbar">
      <div class="logo-area">
        <img src="@/assets/logoP.png" alt="VC Comunica Logo" class="logo-img" />
      </div>
      <div class="nav-icons">
        <img
          :src="notifications.length === 0 ? notifOff : notifOn"
          class="icon notification"
          @click="toggleNotif($event)"
          ref="notifIcon"
        />
        <span class="icon menu-trigger" @click="toggleMenu($event)" ref="menuIcon">☰</span>

        <div v-if="showMenu" class="hamburger-menu" ref="menuPanel">
          <div class="menu-list">
            <router-link to="/" class="menu-item" @click.prevent="navigateHome">
              Home <img src="@/assets/home.png" class="menu-icon" />
            </router-link>
            <router-link to="/ocorrencias" class="menu-item" @click="setWorkerRole">
              Ocorrências <img src="@/assets/ocorrencias.png" class="menu-icon" />
            </router-link>
            <router-link to="/conta" class="menu-item" @click="showMenu = false">
              Conta <img src="@/assets/conta.png" class="menu-icon" />
            </router-link>
          </div>
        </div>

        <div v-if="showNotif" class="notifications-panel" ref="notifPanel">
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
      <div class="dashboard-grid">
        <section class="tasks-section">
          <div class="section-header">
            <div class="icon-bg red">
              <img src="@/assets/ocorrencias.png" alt="Tasks" class="header-icon" />
            </div>
            <h2>Ocorrências</h2>
          </div>

          <div class="table-container">
            <table class="worker-table">
              <thead>
                <tr>
                  <th>Status ↕</th>
                  <th>Tipo de Ocorrência <span class="info-circle">?</span></th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="task in tasks" :key="task.id">
                  <td>
                    <span :class="['status-badge', task.statusClass]">{{ task.status }}</span>
                  </td>
                  <td :class="['type-cell', task.typeClass]">
                    {{ task.type }}
                  </td>
                  <td class="action-cell">
                    <router-link :to="`/ocorrencia/${task.id}`">
                      <img src="@/assets/detalhes.png" alt="Ver" class="info-btn" />
                    </router-link>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section class="route-section">
          <div class="section-header">
            <div class="icon-bg red">
              <img src="@/assets/ocorrencias.png" alt="Route" class="header-icon" />
            </div>
            <h2>Rota</h2>
          </div>

          <div class="map-wrapper">
            <div class="map-placeholder">
              <div class="route-line"></div>
              <div class="marker start-point" style="top: 70%; left: 55%"></div>
              <div class="marker task-node red" style="top: 45%; left: 60%"></div>
              <div class="marker task-node red" style="top: 35%; left: 63%"></div>
              <div class="marker task-node green" style="top: 32%; left: 70%"></div>
              <div class="marker task-node green" style="top: 25%; left: 82%"></div>
              <div class="marker task-node yellow" style="top: 20%; left: 85%"></div>
              <div class="marker end-point" style="top: 20%; left: 88%"></div>
            </div>
          </div>
        </section>
      </div>
    </main>

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
        <img src="@/assets/logoP.png" alt="Logo" class="logo-img-small" />
        <p class="copyright">© 2026 VC Comunica All rights reserved.</p>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import notifOn from '@/assets/notificationson.png'
import notifOff from '@/assets/notificationsoff.png'

const showNotif = ref(false)
const showMenu = ref(false)
const notifications = ref([
  { id: 1, title: 'Nova Tarefa', body: 'Foi atribuída uma nova ocorrência de <b>Iluminação</b>.' },
])

const tasks = ref([
  {
    id: 101,
    status: 'Resolvido',
    statusClass: 'resolvido',
    type: 'Iluminação',
    typeClass: 'type-yellow',
  },
  {
    id: 102,
    status: 'Em Resolução',
    statusClass: 'em-resolucao',
    type: 'Estrada e Passeios',
    typeClass: 'type-red',
  },
  {
    id: 103,
    status: 'À espera de equipa',
    statusClass: 'espera',
    type: 'Estrada e Passeios',
    typeClass: 'type-red',
  },
  {
    id: 104,
    status: 'Não Resolvido',
    statusClass: 'nao-resolvida',
    type: 'Parques e Jardins',
    typeClass: 'type-green',
  },
  {
    id: 105,
    status: 'Em Resolução',
    statusClass: 'em-resolucao',
    type: 'Parques e Jardins',
    typeClass: 'type-green',
  },
])

// Refs para fechar ao clicar fora
const notifPanel = ref(null)
const notifIcon = ref(null)
const menuPanel = ref(null)
const menuIcon = ref(null)

const router = useRouter()

const setWorkerRole = (e) => {
  // ensure role is set to trabalhador when navigating from worker menu
  localStorage.setItem('role', 'trabalhador')
  showMenu.value = false
}

const navigateHome = (e) => {
  if (e && e.preventDefault) e.preventDefault()
  const role = localStorage.getItem('role')
  if (role === 'trabalhador') {
    router.push({ name: 'trabalhador-home' })
  } else {
    router.push({ name: 'home' })
  }
  showMenu.value = false
}

const toggleNotif = (e) => {
  showNotif.value = !showNotif.value
  e.stopPropagation()
}
const toggleMenu = (e) => {
  showMenu.value = !showMenu.value
  e.stopPropagation()
}
const removeNotif = (i) => notifications.value.splice(i, 1)

function handleDocClick(e) {
  if (
    showNotif.value &&
    !notifPanel.value?.contains(e.target) &&
    !notifIcon.value?.contains(e.target)
  )
    showNotif.value = false
  if (showMenu.value && !menuPanel.value?.contains(e.target) && !menuIcon.value?.contains(e.target))
    showMenu.value = false
}

onMounted(() => document.addEventListener('click', handleDocClick))
onBeforeUnmount(() => document.removeEventListener('click', handleDocClick))
</script>

<style scoped>
.page-container {
  font-family: 'Inter', sans-serif;
  background-color: #fff;
}

/* NAVBAR */
.navbar {
  display: flex;
  justify-content: space-between;
  padding: 20px 80px;
  align-items: center;
  border-bottom: 1px solid #f0f0f0;
}
.logo-img {
  height: 40px;
}
.nav-icons {
  display: flex;
  gap: 15px;
  align-items: center;
  position: relative;
}
.icon {
  cursor: pointer;
  font-size: 1.2rem;
}
.notification {
  width: 28px;
  height: 28px;
  display: inline-block;
  object-fit: contain;
}

/* Menu list + icon sizing (match HomeView) */
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

/* DASHBOARD LAYOUT */
.main-content {
  padding: 60px 80px;
  min-height: 80vh;
}
.dashboard-grid {
  display: grid;
  grid-template-columns: 1fr 1.2fr;
  gap: 40px;
  align-items: start;
}

/* SECTIONS COMMON */
.section-header {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 25px;
}
.icon-bg.red {
  background-color: #730000;
  padding: 10px;
  border-radius: 10px;
  display: flex;
}
.header-icon {
  width: 25px;
  height: 25px;
  filter: brightness(0) invert(1);
}
h2 {
  font-size: 32px;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0;
}

/* TABLE STYLES */
.table-container {
  background: white;
  border: 1px solid #eee;
  border-radius: 15px;
  overflow: hidden;
}
.worker-table {
  width: 100%;
  border-collapse: collapse;
}
.worker-table th {
  text-align: left;
  padding: 15px;
  background: #fcfcfc;
  color: #888;
  font-size: 14px;
}
.worker-table td {
  padding: 15px;
  border-top: 1px solid #eee;
}
.info-circle {
  border: 1px solid #ccc;
  border-radius: 50%;
  padding: 0 5px;
  font-size: 10px;
  margin-left: 5px;
}

/* TYPE CELLS COLORS */
.type-cell {
  font-weight: 500;
}
.type-yellow {
  background-color: #fff8e1;
}
.type-red {
  background-color: #ffebee;
}
.type-green {
  background-color: #e8f5e9;
}

/* STATUS BADGES */
.status-badge {
  padding: 5px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}
.resolvido {
  background: #e6f7ed;
  color: #2d8a54;
}
.em-resolucao {
  background: #fff9db;
  color: #b8860b;
}
.espera {
  background: #fff4e6;
  color: #d9480f;
}
.nao-resolvida {
  background: #fff0f0;
  color: #c92a2a;
}

.info-btn {
  width: 28px;
  height: 28px;
  cursor: pointer;
}

/* MAP REPRESENTATION */
.map-wrapper {
  background: #f0f0f0;
  border-radius: 20px;
  height: 450px;
  position: relative;
  overflow: hidden;
  border: 1px solid #ddd;
}
.map-placeholder {
  width: 100%;
  height: 100%;
  background-image:
    linear-gradient(#e0e0e0 1px, transparent 1px),
    linear-gradient(90deg, #e0e0e0 1px, transparent 1px);
  background-size: 40px 40px;
  background-color: #e5e9e0; /* Tom esverdeado leve como no figma */
}
.route-line {
  position: absolute;
  width: 40%;
  height: 40%;
  border-left: 4px solid #730000;
  border-top: 4px solid #730000;
  top: 30%;
  left: 55%;
  transform: skewX(-15deg);
}
.marker {
  position: absolute;
  width: 15px;
  height: 15px;
  border-radius: 50%;
  border: 2px solid white;
}
.task-node.red {
  background: #e03131;
}
.task-node.green {
  background: #2f9e44;
}
.task-node.yellow {
  background: #f08c00;
}
.start-point {
  width: 0;
  height: 0;
  border-left: 10px solid transparent;
  border-right: 10px solid transparent;
  border-bottom: 18px solid #730000;
  background: none;
  border-radius: 0;
}
.end-point {
  width: 12px;
  height: 12px;
  background: #730000;
  border-radius: 2px;
}

/* PANELS (MENU & NOTIF) */
.hamburger-menu,
.notifications-panel {
  position: absolute;
  top: 45px;
  right: 0;
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  padding: 15px;
  z-index: 100;
  width: 250px;
}
.menu-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  text-decoration: none;
  color: #333;
  font-weight: 600;
}
.notif-item {
  background: #f8f9fa;
  padding: 10px;
  border-radius: 8px;
  margin-bottom: 8px;
  font-size: 13px;
}

/* FOOTER */
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
.logo-img-small {
  height: 60px;
}
.copyright {
  font-size: 12px;
  color: #888;
  margin-top: 10px;
}

@media (max-width: 1024px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
  }
  .navbar,
  .main-content,
  .main-footer {
    padding: 20px;
  }
}
</style>
