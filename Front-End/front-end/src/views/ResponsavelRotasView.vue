<template>
  <div class="page-container">
    <nav class="navbar">
      <div class="logo-area">
        <router-link to="/responsavel/perfil">
          <img src="@/assets/logoP.png" alt="VC Comunica Logo" class="logo-img" />
        </router-link>
      </div>
      <div class="nav-right">
        <span class="icon menu-trigger" @click="toggleMenu">☰</span>
        <SidebarMenu v-model="showMenu" />
      </div>
    </nav>

    <main class="main-content">
      <h1 class="page-title">Rotas</h1>

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

      <section class="proximas-rotas">
        <h2 class="section-subtitle">Próximas Rotas Agendadas</h2>
        <p class="espera-label">Selecione uma rota para a visualizar no mapa</p>
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
      </section>
    </main>
  </div>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { listRoutesWithGeometry } from '@/services/routeService'
import SidebarMenu from '@/components/SidebarMenu.vue'

const currentRoute = useRoute()
const selectedRouteId = computed(() => Number(currentRoute.query.routeId || 0))

const mapElement = ref(null)
const mapInstance = ref(null)
const routeLayer = ref(null)
const routes = ref([])
const showMenu = ref(false)

const toggleMenu = () => {
  showMenu.value = !showMenu.value
}

function formatRoutePoints(route) {
  return (route.geometry?.length ? route.geometry : route.waypoints || []).map((point) => [
    point.latitude,
    point.longitude,
  ])
}

function isSelectedRoute(route) {
  return selectedRouteId.value > 0 && Number(route.id) === selectedRouteId.value
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

  if (bounds.length > 0) {
    if (selectedRoute) {
      const selectedPoints = formatRoutePoints(selectedRoute)
      if (selectedPoints.length > 0) {
        mapInstance.value.fitBounds(selectedPoints, { padding: [36, 36] })
        return
      }
    }

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

onMounted(async () => {
  await loadRoutes()
  await initMap()
})

watch([routes, selectedRouteId], () => {
  drawRoutes()
})

onBeforeUnmount(() => {
  if (mapInstance.value) {
    mapInstance.value.remove()
    mapInstance.value = null
  }
})
</script>

<style scoped>
.page-container {
  font-family: Arial, sans-serif;
  color: #1a1a1a;
  background: #fff;
}
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
.worker-label {
  font-weight: 700;
  font-size: 16px;
  color: #1a1a1a;
}
.icon {
  cursor: pointer;
  user-select: none;
}
.menu-trigger {
  font-size: 1.4rem;
  line-height: 1;
}
.main-content {
  padding: 40px 80px;
  min-height: 70vh;
}
.page-title {
  font-size: 36px;
  font-weight: 800;
  margin: 0 0 40px 0;
}
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

@media (max-width: 1024px) {
  .navbar,
  .main-content {
    padding: 20px;
  }
  .rotas-grid {
    grid-template-columns: 1fr;
  }
  .category-cards {
    grid-template-columns: 1fr 1fr;
  }
}
</style>
