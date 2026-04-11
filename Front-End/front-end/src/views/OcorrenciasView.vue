<template>
  <div class="page-container">
    <nav class="navbar">
      <div class="logo-area">
        <img src="@/assets/logoP.png" alt="VC Comunica Logo" class="logo-img" />
      </div>
      <div class="nav-icons">
        <router-link to="/new-ocorrencia" class="icon add">+</router-link>
        <img
          :src="notifications.length === 0 ? notifOff : notifOn"
          class="icon notification"
          @click="toggleNotif($event)"
          ref="notifIcon"
        />
        <span class="icon" @click="toggleMenu($event)" ref="menuIcon">☰</span>

        <div v-if="showMenu" class="hamburger-menu" ref="menuPanel">
          <div class="menu-list">
            <router-link to="/" class="menu-item"
              >Home <img src="@/assets/home.png" class="menu-icon"
            /></router-link>
            <router-link to="/ocorrencias" class="menu-item"
              >Ocorrências <img src="@/assets/ocorrencias.png" class="menu-icon"
            /></router-link>
            <router-link to="/conta" class="menu-item"
              >Conta <img src="@/assets/conta.png" class="menu-icon"
            /></router-link>
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
        <img src="@/assets/ocorrencias.png" alt="Ocorrências" class="icon-title-img" />
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
              <th>Tipo de Problema <img src="@/assets/detalhes.png" alt="Detalhes" class="th-icon" /></th>
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
                <img src="@/assets/detalhes.png" alt="Detalhes" class="info-btn" />
              </td>
            </tr>
          </tbody>
        </table>
      </section>

      <section v-else class="map-view">
        <div class="map-container">
          <div class="map-placeholder">
<!--             <img src="@/assets/mapa_fundo.png" alt="Mapa" />
 -->            <div class="marker red" style="top: 40%; left: 45%">3</div>
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
              <div class="reporter">
                <img src="@/assets/avatar.png" class="avatar-small" />
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
import notifOn from '@/assets/notificationson.png'
import notifOff from '@/assets/notificationsoff.png'

const viewMode = ref('lista') // 'lista' ou 'mapa'
const showNotif = ref(false)
const showMenu = ref(false)
const notifications = ref([{ id: 1, title: 'Estado', body: 'Resolvido' }])

// refs for panels/icons
const notifPanel = ref(null)
const notifIcon = ref(null)
const menuPanel = ref(null)
const menuIcon = ref(null)

const toggleNotif = (e) => { showNotif.value = !showNotif.value; e?.stopPropagation() }
const toggleMenu = (e) => { showMenu.value = !showMenu.value; e?.stopPropagation() }

const removeNotif = (i) => notifications.value.splice(i, 1)

// Dados de exemplo para a lista
const ocorrencias = ref([
  {
    id: 1,
    nome: 'Mariana Silva',
    situacao: 'Resolvido',
    statusClass: 'resolvido',
    tipo: 'Sinalização',
    detalhes: 'Necessária a poda de árvores...',
    userImg: '/path/to/img1.png',
  },
  {
    id: 2,
    nome: 'Ricardo Pereira',
    situacao: 'Em Resolução',
    statusClass: 'em-resolucao',
    tipo: 'Buracos na Via',
    detalhes: 'Reparação urgente de buraco...',
    userImg: '/path/to/img2.png',
  },
  {
    id: 3,
    nome: 'Beatriz Costa',
    situacao: 'À espera de equipa',
    statusClass: 'espera',
    tipo: 'Iluminação Pública',
    detalhes: 'Substituição de lâmpada...',
    userImg: '/path/to/img3.png',
  },
])

function handleDocClick(e) {
  const nPanel = notifPanel.value
  const nIcon = notifIcon.value
  if (showNotif.value) {
    if (nPanel && !nPanel.contains(e.target) && nIcon && !nIcon.contains(e.target)) {
      showNotif.value = false
    }
  }

  const mPanel = menuPanel.value
  const mIcon = menuIcon.value
  if (showMenu.value) {
    if (mPanel && !mPanel.contains(e.target) && mIcon && !mIcon.contains(e.target)) {
      showMenu.value = false
    }
  }
}

onMounted(() => document.addEventListener('click', handleDocClick))
onBeforeUnmount(() => document.removeEventListener('click', handleDocClick))
</script>

<style scoped>
/* ESTRUTURA E NAVBAR */
.page-container {
  font-family: sans-serif;
}
.navbar {
  display: flex;
  justify-content: space-between;
  padding: 20px 80px;
  align-items: center;
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
.icon.add {
  background: #730000;
  color: white;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  text-decoration: none;
  font-weight: bold;
}

/* TITULO E TOGGLE */
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
.icon-title-bg {
  background: #730000;
  color: white;
  padding: 10px;
  border-radius: 8px;
}

.icon-title-img {
  width: 40px;
  height: 40px;
  object-fit: contain;
  background: #730000;
  padding: 6px;
  border-radius: 10px;
  display: inline-block;
}

.view-toggle {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 30px;
  font-size: 0.9rem;
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
  padding: 6px 15px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: bold;
  transition: 0.3s;
}
.toggle-btn.active {
  background: #3b82f6;
  color: white;
}

/* VISTA DE LISTA (TABELA) */
.occ-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
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
  width: 34px;
  height: 34px;
  object-fit: contain;
  cursor: pointer;
  border-radius: 6px;
}

.th-icon {
  width: 18px;
  height: 18px;
  object-fit: contain;
  vertical-align: middle;
  margin-left: 8px;
}

/* BADGES DE STATUS */
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
.nao-resolvida {
  background: #fee2e2;
  color: #991b1b;
}

/* VISTA DE MAPA */
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
.map-placeholder img {
  width: 100%;
  height: 100%;
  object-fit: cover;
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

/* Hamburger menu and notifications (match HomeView) */
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
  transition: transform 0.18s ease, opacity 0.18s ease;
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

.menu-item:hover { background: rgba(0,0,0,0.05); }

.menu-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: flex-end;
  padding: 6px 6px;
}

.menu-item { display: flex; align-items: center; justify-content: flex-end; gap: 8px; padding: 8px 10px }
.menu-label { font-size: 13px; margin-right: 8px }
.menu-icon { width: 14px; height: 14px; object-fit: contain }

.notifications {
  position: absolute;
  top: 44px;
  right: 0;
  width: 320px;
  background: #fff;
  color: #0b2b2b;
  border-radius: 12px;
  padding: 12px;
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.15);
  z-index: 60;
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
  height: 80px;
}
</style>
