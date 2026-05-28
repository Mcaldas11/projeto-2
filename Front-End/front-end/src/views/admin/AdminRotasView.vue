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
        <span class="icon menu-trigger" @click="toggleMenu">☰</span>

        <AdminSidebarMenu v-model="showMenu" />

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
            <div ref="mapElement" class="route-map-canvas"></div>
          </div>

          <div class="rotas-legend">
            <h3 class="legend-title">Rotas Ativas</h3>
            <div class="legend-items">
              <div v-for="route in routes" :key="route.id" class="legend-item">
                <div class="legend-bar" :style="{ background: route.color }"></div>
                <div class="legend-text">
                  <strong>{{ route.teamName }}</strong>
                  <span>{{ route.waypoints.length }} pontos</span>
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
          <div v-for="route in routes" :key="route.id" class="category-card">
            <div class="card-bar" :style="{ background: route.color }"></div>
            <div class="card-content">
              <strong>{{ route.teamName }}</strong>
              <span>{{ route.waypoints.length }} pontos</span>
            </div>
            <span class="info-icon" title="Mais informações">ⓘ</span>
          </div>
        </div>
        <button class="btn-gerar-rotas" @click="gerarRotas">Gerar Rotas</button>
      </section>
    </main>

    <Footer :columns="adminFooterColumns" :logo-src="adminFooterLogo" />
  </div>
</template>

<script setup>
import { nextTick, ref, onMounted, onBeforeUnmount } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import Footer from '@/components/footer.vue'
import AdminSidebarMenu from '@/components/AdminSidebarMenu.vue'
import notifOn from '@/assets/notificationson.png'
import notifOff from '@/assets/notificationsoff.png'
import adminFooterLogo from '@/assets/logo_footer.png'
import { listRoutesWithGeometry } from '@/services/routeService'

const adminFooterColumns = [
  [
    { label: 'Home', to: '/admin' },
    { label: 'Ocorrências', to: '/admin' },
    { label: 'Rotas', to: '/admin/rotas' },
    { label: 'Equipas', to: '/admin/equipas' },
    { label: 'Funcionarios', to: '/admin/trabalhadores' },
  ],
  [
    { label: 'Sobre', to: '/sobre' },
  ],
]

const showNotif = ref(false)
const showMenu = ref(false)
const notifPanel = ref(null)
const notifIcon = ref(null)
const mapElement = ref(null)
const mapInstance = ref(null)
const routeLayer = ref(null)
const routes = ref([])

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

function formatRoutePoints(route) {
  return (route.geometry?.length ? route.geometry : route.waypoints || []).map((point) => [point.latitude, point.longitude])
}

function drawRoutes() {
  if (!mapInstance.value || !routeLayer.value) return

  routeLayer.value.clearLayers()

  const bounds = []

  routes.value.forEach((route) => {
    const points = formatRoutePoints(route)
    if (points.length < 2) return

    const polyline = L.polyline(points, {
      color: route.color,
      weight: 5,
      opacity: 0.95,
      lineJoin: 'round',
    })

    polyline.addTo(routeLayer.value)
    bounds.push(...points)

    const startPoint = points[0]
    const endPoint = points[points.length - 1]
    L.circleMarker(startPoint, { radius: 6, color: route.color, fillColor: '#fff', fillOpacity: 1, weight: 3 }).addTo(routeLayer.value)
    L.circleMarker(endPoint, { radius: 7, color: route.color, fillColor: route.color, fillOpacity: 1, weight: 2 }).addTo(routeLayer.value)
  })

  if (bounds.length > 0) {
    mapInstance.value.fitBounds(bounds, { padding: [24, 24] })
  }
}

async function initMap() {
  if (!mapElement.value || mapInstance.value) return

  mapInstance.value = L.map(mapElement.value, { zoomControl: true }).setView([41.3649, -8.7389], 14)

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors',
    maxZoom: 19,
  }).addTo(mapInstance.value)

  routeLayer.value = L.layerGroup().addTo(mapInstance.value)
  await nextTick()
  drawRoutes()
}

async function loadRoutes() {
  routes.value = await listRoutesWithGeometry()
  drawRoutes()
}

function handleDocClick(e) {
  if (showNotif.value && notifPanel.value && !notifPanel.value.contains(e.target) && notifIcon.value && !notifIcon.value.contains(e.target)) {
    showNotif.value = false
  }
}

onMounted(async () => {
  document.addEventListener('click', handleDocClick)
  await loadRoutes()
  await initMap()
})
onBeforeUnmount(() => {
  document.removeEventListener('click', handleDocClick)
  if (mapInstance.value) {
    mapInstance.value.remove()
    mapInstance.value = null
  }
})

const gerarRotas = () => {
  loadRoutes()
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
.notifications {
  position: absolute; top: 44px; right: 0;
  background: #fff; border-radius: 12px; padding: 12px;
  box-shadow: 0 12px 30px rgba(0,0,0,0.15); z-index: 70;
}
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
.route-map-canvas {
  width: 100%;
  height: 100%;
  min-height: 420px;
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
