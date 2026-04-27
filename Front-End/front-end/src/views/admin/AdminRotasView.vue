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
            <div v-for="(n, i) in notifications" :key="n.id" class="notif-item" @click.stop="removeNotif(i)">
              <div class="notif-title">{{ n.title }}</div>
              <div class="notif-body" v-html="n.body"></div>
            </div>
            <div v-if="notifications.length === 0" class="notif-empty">Sem notificações</div>
          </div>
        </div>
      </div>
    </nav>

    <main class="main-content">
      <h1 class="page-title">Rotas</h1>

      <!-- Rotas Ativas -->
      <section class="rotas-ativas">
        <div class="rotas-grid">
          <div class="map-placeholder">
            <svg viewBox="0 0 500 400" class="route-map-svg">
              <!-- Background grid / streets -->
              <rect width="500" height="400" fill="#e8ede4" />
              <!-- Park areas -->
              <rect x="0" y="0" width="120" height="80" fill="#c5ddb8" rx="5" />
              <rect x="350" y="280" width="150" height="120" fill="#c5ddb8" rx="5" />
              <rect x="0" y="280" width="100" height="120" fill="#c5ddb8" rx="5" />
              <!-- Streets -->
              <line x1="0" y1="120" x2="500" y2="120" stroke="#d4d4d4" stroke-width="3" />
              <line x1="0" y1="250" x2="500" y2="250" stroke="#d4d4d4" stroke-width="3" />
              <line x1="160" y1="0" x2="160" y2="400" stroke="#d4d4d4" stroke-width="3" />
              <line x1="320" y1="0" x2="320" y2="400" stroke="#d4d4d4" stroke-width="3" />
              <!-- Water -->
              <line x1="100" y1="0" x2="200" y2="400" stroke="#bfdbfe" stroke-width="4" opacity="0.6" />

              <!-- Route: Engenharia e vias (orange) -->
              <polyline points="50,80 100,55 150,70" fill="none" stroke="#f59e0b" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" />
              <rect x="58" y="42" width="14" height="14" fill="#f59e0b" rx="3" />

              <!-- Route: Higiene Urbana (green) -->
              <polyline points="140,130 220,100 310,120 380,100" fill="none" stroke="#22c55e" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" />
              <polygon points="390,95 396,108 384,108" fill="#22c55e" />

              <!-- Route: Iluminação pública (purple) -->
              <polyline points="130,200 200,170 290,215 350,185" fill="none" stroke="#8b5cf6" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" />
              <rect x="347" y="178" width="14" height="14" fill="#8b5cf6" rx="3" />

              <!-- Route: Espaços Verdes (red/dark) -->
              <polyline points="200,280 310,310 410,340 460,350" fill="none" stroke="#730000" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" />
              <polygon points="460,345 466,358 454,358" fill="#730000" />
            </svg>
          </div>

          <div class="rotas-legend">
            <h3 class="legend-title">Rotas Ativas</h3>
            <div class="legend-items">
              <div class="legend-item">
                <div class="legend-bar" style="background: #730000"></div>
                <div class="legend-text">
                  <strong>Engenharia e vias</strong>
                  <span>4 ocorrências</span>
                </div>
              </div>
              <div class="legend-item">
                <div class="legend-bar" style="background: #8b5cf6"></div>
                <div class="legend-text">
                  <strong>Higiene Urbana</strong>
                  <span>7 ocorrências</span>
                </div>
              </div>
              <div class="legend-item">
                <div class="legend-bar" style="background: #f59e0b"></div>
                <div class="legend-text">
                  <strong>Iluminação pública</strong>
                  <span>5 ocorrências</span>
                </div>
              </div>
              <div class="legend-item">
                <div class="legend-bar" style="background: #22c55e"></div>
                <div class="legend-text">
                  <strong>Espaços Verdes</strong>
                  <span>9 ocorrências</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Proximas Rotas Otimizadas -->
      <section class="proximas-rotas">
        <h2 class="section-subtitle">Proximas Rotas Otimizadas</h2>
        <p class="espera-label">Nº Ocorrências em espera</p>
        <div class="category-cards">
          <div class="category-card">
            <div class="card-bar" style="background: #730000"></div>
            <div class="card-content">
              <strong>Engenharia e vias</strong>
              <span>4 ocorrências</span>
            </div>
            <span class="info-icon" title="Mais informações">ⓘ</span>
          </div>
          <div class="category-card">
            <div class="card-bar" style="background: #8b5cf6"></div>
            <div class="card-content">
              <strong>Higiene Urbana</strong>
              <span>7 ocorrências</span>
            </div>
            <span class="info-icon" title="Mais informações">ⓘ</span>
          </div>
          <div class="category-card">
            <div class="card-bar" style="background: #f59e0b"></div>
            <div class="card-content">
              <strong>Iluminação pública</strong>
              <span>5 ocorrências</span>
            </div>
            <span class="info-icon" title="Mais informações">ⓘ</span>
          </div>
          <div class="category-card">
            <div class="card-bar" style="background: #22c55e"></div>
            <div class="card-content">
              <strong>Espaços Verdes</strong>
              <span>9 ocorrências</span>
            </div>
            <span class="info-icon" title="Mais informações">ⓘ</span>
          </div>
        </div>
        <button class="btn-gerar-rotas" @click="gerarRotas">Gerar Rotas</button>
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
import { ref, onMounted, onBeforeUnmount } from 'vue'
import notifOn from '@/assets/notificationson.png'
import notifOff from '@/assets/notificationsoff.png'

const showNotif = ref(false)
const showMenu = ref(false)
const notifPanel = ref(null)
const notifIcon = ref(null)
const menuPanel = ref(null)
const menuIcon = ref(null)

const notifications = ref([
  { id: 1, title: 'Nova ocorrência', body: 'Uma nova ocorrência foi reportada em <strong>Vila do Conde</strong>' },
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
  if (showNotif.value && notifPanel.value && !notifPanel.value.contains(e.target) && notifIcon.value && !notifIcon.value.contains(e.target)) {
    showNotif.value = false
  }
  if (showMenu.value && menuPanel.value && !menuPanel.value.contains(e.target) && menuIcon.value && !menuIcon.value.contains(e.target)) {
    showMenu.value = false
  }
}

onMounted(() => document.addEventListener('click', handleDocClick))
onBeforeUnmount(() => document.removeEventListener('click', handleDocClick))

const gerarRotas = () => {
  console.log('Gerar Rotas clicked')
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
.logo-img { height: 40px; }
.nav-right {
  display: flex; gap: 15px; align-items: center; position: relative;
}
.admin-label { font-weight: 700; font-size: 16px; color: #1a1a1a; }
.icon { cursor: pointer; font-size: 1.2rem; }
.icon.notification { width: 28px; height: 28px; object-fit: contain; cursor: pointer; }
.menu-trigger { font-size: 1.4rem; }

/* MENU & NOTIFICATIONS */
.hamburger-menu, .notifications {
  position: absolute; top: 44px; right: 0;
  background: #fff; border-radius: 12px; padding: 12px;
  box-shadow: 0 12px 30px rgba(0,0,0,0.15); z-index: 70;
}
.hamburger-menu { width: 220px; }
.menu-list { display: flex; flex-direction: column; gap: 4px; align-items: flex-end; }
.menu-item {
  display: flex; align-items: center; justify-content: flex-end; gap: 8px;
  text-decoration: none; color: #0b2b2b; font-weight: 700;
  padding: 8px 10px; border-radius: 8px; width: 100%; transition: background 0.15s;
}
.menu-item:hover { background: rgba(0,0,0,0.05); }
.menu-label { font-size: 13px; }
.menu-icon { width: 14px; height: 14px; object-fit: contain; }
.notifications { width: 320px; }
.notifications h4 { margin: 0 0 10px 0; font-size: 18px; }
.notif-list { display: flex; flex-direction: column; gap: 8px; }
.notif-item { background: #dff3ec; padding: 12px; border-radius: 8px; cursor: pointer; }
.notif-title { font-weight: 700; margin-bottom: 4px; }
.notif-body { color: rgba(0,0,0,0.7); font-size: 14px; }
.notif-empty { color: #666; font-size: 14px; text-align: center; padding: 12px; }

/* MAIN CONTENT */
.main-content {
  padding: 40px 80px;
  min-height: 70vh;
}
.page-title {
  font-size: 36px;
  font-weight: 800;
  margin: 0 0 40px 0;
}

/* ROTAS ATIVAS */
.rotas-ativas {
  margin-bottom: 60px;
}
.rotas-grid {
  display: grid;
  grid-template-columns: 1.2fr 0.8fr;
  gap: 50px;
  align-items: center;
}
.map-placeholder {
  background: #e8ede4;
  border-radius: 20px;
  overflow: hidden;
  aspect-ratio: 5/4;
}
.route-map-svg {
  width: 100%;
  height: 100%;
}
.legend-title {
  font-size: 18px;
  font-weight: 800;
  color: #22c55e;
  margin: 0 0 25px 0;
}
.legend-items {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.legend-item {
  display: flex;
  align-items: center;
  gap: 15px;
}
.legend-bar {
  width: 5px;
  height: 45px;
  border-radius: 3px;
}
.legend-text {
  display: flex;
  flex-direction: column;
}
.legend-text strong {
  font-size: 16px;
  font-weight: 700;
}
.legend-text span {
  font-size: 14px;
  color: #64748b;
}

/* PROXIMAS ROTAS */
.proximas-rotas {
  margin-top: 40px;
}
.section-subtitle {
  font-size: 22px;
  font-weight: 800;
  margin: 0 0 8px 0;
}
.espera-label {
  font-size: 14px;
  color: #64748b;
  margin: 0 0 25px 0;
}
.category-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 25px;
}
.category-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 15px;
  background: #fff;
  border: 1px solid #f1f5f9;
  border-radius: 12px;
}
.card-bar {
  width: 4px;
  height: 40px;
  border-radius: 2px;
  flex-shrink: 0;
}
.card-content {
  display: flex;
  flex-direction: column;
  flex: 1;
}
.card-content strong {
  font-size: 14px;
  font-weight: 700;
}
.card-content span {
  font-size: 13px;
  color: #64748b;
}
.info-icon {
  font-size: 18px;
  color: #94a3b8;
  cursor: pointer;
}
.btn-gerar-rotas {
  background: #22c55e;
  color: #fff;
  border: none;
  padding: 10px 24px;
  border-radius: 8px;
  font-weight: 700;
  font-size: 14px;
  cursor: pointer;
  transition: opacity 0.15s;
}
.btn-gerar-rotas:hover {
  opacity: 0.9;
}

/* FOOTER */
.main-footer {
  padding: 60px 80px;
  background-color: #f5f1e9;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-top: 80px;
}
.footer-links { display: flex; gap: 60px; }
.col { display: flex; flex-direction: column; gap: 10px; }
.col a { text-decoration: none; color: #2d5a27; font-weight: 600; }
.logo-img-small { height: 80px; }
.copyright { font-size: 0.8rem; color: #888; margin-top: 10px; }

@media (max-width: 1024px) {
  .navbar, .main-content, .main-footer { padding: 20px; }
  .rotas-grid { grid-template-columns: 1fr; }
  .category-cards { grid-template-columns: 1fr 1fr; }
}
</style>
