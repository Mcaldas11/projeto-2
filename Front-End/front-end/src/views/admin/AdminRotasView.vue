<template>
  <div class="page-container">
    <nav class="navbar">
      <div class="logo-area">
        <router-link to="/admin/perfil">
          <img src="@/assets/logoP.png" alt="VC Comunica Logo" class="logo-img" />
        </router-link>
      </div>
      <div class="nav-right">
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
      <h1 class="page-title">Rotas</h1>

      <!-- Rotas Ativas -->
      <section class="rotas-ativas">
        <div class="rotas-grid">
          <div class="map-placeholder">
            <div ref="mapElement" class="route-map-canvas map-leaflet"></div>
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

            <h3 class="legend-title legend-title-secondary">Ocorrências Ativas</h3>
            <div class="occurrence-types-grid">
              <div v-for="type in activeOccurrenceTypes" :key="type.key" class="occurrence-type-card">
                <div class="occurrence-type-icon" :style="{ background: type.color }">
                  <img :src="type.icon" :alt="type.label" />
                </div>
                <div class="occurrence-type-text">
                  <strong>{{ type.label }}</strong>
                  <span>{{ type.count }} ocorrências</span>
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
          <div
            v-for="route in routes"
            :key="route.id"
            :class="['category-card', { selected: isSelectedRoute(route) }]"
          >
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
import { computed, nextTick, ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { useRoute } from 'vue-router'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import Footer from '@/components/footer.vue'
import AdminSidebarMenu from '@/components/AdminSidebarMenu.vue'
import notifOn from '@/assets/notificationson.png'
import notifOff from '@/assets/notificationsoff.png'
import adminFooterLogo from '@/assets/logo_footer.png'
import { listRoutesWithGeometry } from '@/services/routeService'
import { listOccurrenceMarkers } from '@/services/occurrenceService'
import { getOccurrenceTypeMeta, normalizeTypeKey } from '@/utils/occurrenceTypes'

const adminFooterColumns = [
  [
    { label: 'Home', to: '/admin' },
    { label: 'Ocorrências', to: '/admin' },
    { label: 'Rotas', to: '/admin/rotas' },
    { label: 'Equipas', to: '/admin/equipas' },
    { label: 'Funcionarios', to: '/admin/trabalhadores' },
  ],
  [{ label: 'Sobre', to: '/sobre' }],
]

const showNotif = ref(false)
const showMenu = ref(false)
const notifPanel = ref(null)
const notifIcon = ref(null)
const mapElement = ref(null)
const mapInstance = ref(null)
const routeLayer = ref(null)
const occurrenceLayer = ref(null)
const occurrenceMarkers = ref([])
const routes = ref([])
const currentRoute = useRoute()
const selectedRouteId = computed(() =>
  Number(currentRoute.query.routeId || currentRoute.query.selectedRoute || 0),
)

const ACTIVE_OCCURRENCE_STATES = new Set(['em-resolucao', 'espera'])

const activeOccurrenceTypes = computed(() => {
  const summary = new Map()

  occurrenceMarkers.value.forEach((marker) => {
    if (!ACTIVE_OCCURRENCE_STATES.has(String(marker.statusClass || ''))) {
      return
    }

    const key = String(marker.typeKey || normalizeTypeKey(marker.tipo || '')).trim()
    const meta = getOccurrenceTypeMeta(marker.tipo || key)

    if (!summary.has(key)) {
      summary.set(key, {
        key,
        label: meta.label,
        icon: meta.icon,
        color: meta.backgroundColor,
        count: 0,
      })
    }

    summary.get(key).count += 1
  })

  return Array.from(summary.values())
    .sort((left, right) => right.count - left.count)
    .slice(0, 6)
})

const notifications = ref([])

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
  return (route.geometry?.length ? route.geometry : route.waypoints || []).map((point) => [
    point.latitude,
    point.longitude,
  ])
}

function drawRoutes() {
  if (!mapInstance.value || !routeLayer.value) return

  routeLayer.value.clearLayers()

  const bounds = []
  const selectedRoute = routes.value.find((route) => isSelectedRoute(route))

  routes.value.forEach((route) => {
    const points = formatRoutePoints(route)
    if (points.length < 2) return

    const polyline = L.polyline(points, {
      color: route.color,
      weight: isSelectedRoute(route) ? 8 : 5,
      opacity: isSelectedRoute(route) ? 1 : 0.95,
      lineJoin: 'round',
    })

    polyline.addTo(routeLayer.value)
    bounds.push(...points)

    const startPoint = points[0]
    const endPoint = points[points.length - 1]
    L.circleMarker(startPoint, {
      radius: 6,
      color: route.color,
      fillColor: '#fff',
      fillOpacity: 1,
      weight: 3,
    }).addTo(routeLayer.value)
    L.circleMarker(endPoint, {
      radius: 7,
      color: route.color,
      fillColor: route.color,
      fillOpacity: 1,
      weight: 2,
    }).addTo(routeLayer.value)
  })

  fitMapToContent(selectedRoute)
}

function isSelectedRoute(route) {
  return selectedRouteId.value > 0 && Number(route.id) === selectedRouteId.value
}

function getActiveOccurrencePoints() {
  return occurrenceMarkers.value
    .filter((marker) => ACTIVE_OCCURRENCE_STATES.has(String(marker.statusClass || '')))
    .map((marker) => [Number(marker.latitude), Number(marker.longitude)])
    .filter(([latitude, longitude]) => !Number.isNaN(latitude) && !Number.isNaN(longitude))
}

function fitMapToContent(selectedRoute = null) {
  if (!mapInstance.value) return

  const routePoints = selectedRoute
    ? formatRoutePoints(selectedRoute)
    : routes.value.flatMap((route) => formatRoutePoints(route))
  const occurrencePoints = getActiveOccurrencePoints()
  const bounds = [...routePoints, ...occurrencePoints]

  if (bounds.length > 0) {
    mapInstance.value.fitBounds(bounds, { padding: [28, 28] })
  }
}

async function initMap() {
  if (!mapElement.value || mapInstance.value) return

  mapInstance.value = L.map(mapElement.value, { zoomControl: true }).setView([41.3649, -8.7389], 14)

  const TILE_URL = import.meta.env.VITE_MAP_TILES_URL || 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
  const TILE_ATTR = import.meta.env.VITE_MAP_TILES_ATTR || '&copy; OpenStreetMap contributors'

  L.tileLayer(TILE_URL, {
    attribution: TILE_ATTR,
    maxZoom: 19,
  }).addTo(mapInstance.value)

  console.debug('initMap: mapElement=', mapElement.value, 'TILE_URL=', TILE_URL)

  routeLayer.value = L.layerGroup().addTo(mapInstance.value)
  occurrenceLayer.value = L.layerGroup().addTo(mapInstance.value)
  await nextTick()
  drawRoutes()
    console.debug('initMap: added tileLayer')
}

  async function loadOccurrences() {
    try {
      const markers = await listOccurrenceMarkers()
      occurrenceMarkers.value = Array.isArray(markers) ? markers : []
      drawOccurrences()
    } catch {
      occurrenceMarkers.value = []
    }
  }

  function drawOccurrences() {
    if (!mapInstance.value || !occurrenceLayer.value) return
    occurrenceLayer.value.clearLayers()

    occurrenceMarkers.value.forEach((markerData) => {
      if (!ACTIVE_OCCURRENCE_STATES.has(String(markerData.statusClass || ''))) {
        return
      }

      const lat = Number(markerData.latitude)
      const lng = Number(markerData.longitude)
      if (Number.isNaN(lat) || Number.isNaN(lng)) return

      const meta = getOccurrenceTypeMeta(markerData.tipo)
      const markerColor = meta.backgroundColor

      const marker = L.circleMarker([lat, lng], {
        radius: 6,
        color: markerColor,
        fillColor: markerColor,
        fillOpacity: 1,
        weight: 2,
      })

      marker.bindPopup(`<strong>${markerData.tipo || ''}</strong><br/>${markerData.detalhes || ''}`)
      marker.addTo(occurrenceLayer.value)
    })

    fitMapToContent(routes.value.find((route) => isSelectedRoute(route)) || null)
  }

async function loadRoutes() {
  routes.value = await listRoutesWithGeometry()
  drawRoutes()
}

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
}

onMounted(async () => {
  document.addEventListener('click', handleDocClick)
  // Initialize map first so backend fetches (which may fail or be slow)
  // do not block rendering the map container.
  try {
    await initMap()
  } catch {
    // ignore init errors here
  }

  // Load routes and occurrences in background; they will draw when ready.
  loadRoutes().catch(() => {})
  loadOccurrences().catch(() => {})
})
watch([routes, selectedRouteId], () => {
  drawRoutes()
})

watch(occurrenceMarkers, () => {
  drawOccurrences()
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
.map-leaflet {
  width: 100%;
  height: 100%;
  min-height: 420px;
  border-radius: 14px;
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

.legend-title-secondary {
  margin-top: 28px;
}

.occurrence-types-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.occurrence-type-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
}

.occurrence-type-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.occurrence-type-icon img {
  width: 22px;
  height: 22px;
  object-fit: contain;
  filter: brightness(0) invert(1);
}

.occurrence-type-text {
  display: flex;
  flex-direction: column;
}

.occurrence-type-text strong {
  font-size: 14px;
  font-weight: 700;
}

.occurrence-type-text span {
  font-size: 12px;
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
.category-card.selected {
  border-color: #730000;
  box-shadow: 0 0 0 3px rgba(115, 0, 0, 0.08);
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
  .main-content,
  .main-footer {
    padding: 20px;
  }
  .rotas-grid {
    grid-template-columns: 1fr;
  }
  .category-cards {
    grid-template-columns: 1fr 1fr;
  }
  .occurrence-types-grid {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 640px) {
  .occurrence-types-grid {
    grid-template-columns: 1fr;
  }
}
</style>
