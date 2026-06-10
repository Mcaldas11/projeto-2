<template>
  <div class="page-container">
    <nav class="navbar">
      <div class="logo-area">
        <router-link to="/trabalhador/perfil">
          <img src="@/assets/logoP.png" alt="VC Comunica Logo" class="logo-img" />
        </router-link>
      </div>
      <div class="nav-right">
        <span class="icon menu-trigger" @click="toggleMenu">☰</span>

        <AdminSidebarMenu v-model="showMenu" />
      </div>
    </nav>

    <main class="main-content">
      <h1 class="page-title">Rotas Globais</h1>

      <!-- Indicators Grid -->
      <section class="indicators-grid">
        <div class="indicator-card">
          <div class="indicator-icon-bg progress">
            <img src="@/assets/ocorrencias.png" class="indicator-icon" />
          </div>
          <div class="indicator-info">
            <span class="indicator-value">{{ allRoutes.length }}</span>
            <span class="indicator-label">Rotas Ativas</span>
          </div>
        </div>
      </section>

      <!-- Rotas Ativas -->
      <section class="rotas-ativas">
        <div class="rotas-grid">
          <div class="map-placeholder">
            <div ref="mapElement" class="route-map-canvas map-leaflet"></div>
          </div>

          <div class="rotas-legend">
            <h3 class="legend-title legend-title-secondary">Ocorrências Ativas nas Rotas</h3>
            <div class="occ-legend-grid">
              <div
                v-for="type in activeOccurrenceTypes"
                :key="type.key"
                :class="[
                  'occ-legend-item',
                  { 'occ-legend-item--active': selectedOccurrenceType === type.key },
                ]"
                @click="toggleOccurrenceFilter(type.key)"
              >
                <div class="occ-legend-bar" :style="{ background: type.color }"></div>
                <div class="legend-text">
                  <strong>{{ type.label }}</strong>
                  <span>{{ type.count }} ocorrências</span>
                </div>
              </div>
            </div>
            <p v-if="activeOccurrenceTypes.length === 0" class="no-occs-msg">
              Nenhuma ocorrência incluída nas rotas atuais.
            </p>
          </div>
        </div>
      </section>

      <!-- Todas as Rotas do Município -->
      <section class="proximas-rotas">
        <h2 class="section-subtitle">Todas as Rotas Geradas</h2>
        <p class="espera-label">Rotas ativas em todas as freguesias</p>
        <div class="category-cards">
          <div
            v-for="route in allRoutes"
            :key="route.idRota || route.id"
            :class="['category-card', { selected: isSelectedRoute(route) }]"
          >
            <div class="card-bar" :style="{ background: route.color || route.cor }"></div>
            <div class="card-content">
              <strong>{{ route.nome }}</strong>
              <span>{{ route.waypoints?.length || 0 }} pontos</span>
            </div>
            <img
              src="@/assets/delete_icon.svg"
              class="delete-route-icon"
              title="Apagar rota"
              @click.stop="apagarRota(route.idRota || route.id)"
            />
          </div>
        </div>
        <p v-if="allRoutes.length === 0" class="no-routes-msg">Nenhuma rota guardada no sistema.</p>
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
import adminFooterLogo from '@/assets/logo_footer.png'
import { listRoutesWithGeometry, deleteRota } from '@/services/routeService'
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
]

const showNotif = ref(false)
const showMenu = ref(false)
const notifPanel = ref(null)
const notifIcon = ref(null)
const mapElement = ref(null)
const mapInstance = ref(null)
const routeLayer = ref(null)
const occurrenceLayer = ref(null)
const occurrenceMarkers = ref([]) // Todos os marcadores de ocorrência
const allRoutes = ref([]) // Todas as rotas carregadas do backend
const displayedRoutes = ref([]) // Rotas atualmente visíveis no mapa
const currentRoute = useRoute()
const selectedRouteId = computed(() =>
  Number(currentRoute.query.routeId || currentRoute.query.selectedRoute || 0),
)

const ACTIVE_OCCURRENCE_STATES = new Set(['em-resolucao', 'espera'])
const OCC_PALETTE = ['#06b6d4', '#7c3aed', '#ef4444', '#f59e0b', '#10b981', '#ef76b2']

const totalOccurrencesInRoutes = computed(() => {
  // Somar todos os waypoints (excluindo o ponto de partida na junta, que é o index 0)
  return allRoutes.value.reduce((acc, route) => {
    const waypoints = Array.isArray(route.waypoints) ? route.waypoints : []
    return acc + Math.max(0, waypoints.length - 1)
  }, 0)
})

const activeOccurrenceTypes = computed(() => {
  const summary = new Map()

  // Criar um set de coordenadas únicas que estão presentes em TODAS as rotas
  const routePointsSet = new Set()
  allRoutes.value.forEach((route) => {
    const waypoints = Array.isArray(route.waypoints) ? route.waypoints : []
    // Ignoramos o waypoint[0] porque é a Junta de Freguesia
    waypoints.slice(1).forEach((wp) => {
      routePointsSet.add(`${wp.latitude.toFixed(6)},${wp.longitude.toFixed(6)}`)
    })
  })

  occurrenceMarkers.value.forEach((marker) => {
    // Verificar se este marcador está em alguma rota
    const markerCoords = `${Number(marker.latitude).toFixed(6)},${Number(marker.longitude).toFixed(6)}`
    if (!routePointsSet.has(markerCoords)) return

    const key = String(marker.typeKey || normalizeTypeKey(marker.tipo || '')).trim()
    const meta = getOccurrenceTypeMeta(marker.tipo || key)

    if (!summary.has(key)) {
      summary.set(key, {
        key,
        label: meta.label,
        icon: meta.icon,
        color: '',
        count: 0,
      })
    }

    summary.get(key).count += 1
  })

  const sorted = Array.from(summary.values())
    .sort((left, right) => right.count - left.count)
    .slice(0, 6)

  sorted.forEach((type, i) => {
    type.color = OCC_PALETTE[i % OCC_PALETTE.length]
  })

  return sorted
})

const selectedOccurrenceType = ref(null)

function toggleOccurrenceFilter(key) {
  if (selectedOccurrenceType.value === key) {
    selectedOccurrenceType.value = null
    displayedRoutes.value = allRoutes.value // Mostrar todas as rotas
    fitMapToContent() // Ajustar zoom para todas as rotas
    return
  }

  selectedOccurrenceType.value = key

  const filtered = allRoutes.value.filter((route) => {
    const waypoints = Array.isArray(route.waypoints) ? route.waypoints : []
    // Ignoramos o waypoint[0] (Junta) e verificamos os restantes
    return waypoints.slice(1).some((wp) => {
      return occurrenceMarkers.value.some((m) => {
        const isSameLoc =
          Math.abs(Number(m.latitude) - wp.latitude) < 0.0001 &&
          Math.abs(Number(m.longitude) - wp.longitude) < 0.0001
        return isSameLoc && normalizeTypeKey(m.tipo || '') === key
      })
    })
  })

  displayedRoutes.value = filtered // Atualizar rotas exibidas

  // Se encontramos rotas filtradas, fazemos zoom nelas
  if (filtered.length > 0 && mapInstance.value) {
    const allPoints = filtered.flatMap((r) => formatRoutePoints(r))
    mapInstance.value.fitBounds(allPoints, {
      padding: [50, 50],
      maxZoom: 16,
    })
  } else {
    // Se não houver rotas para o tipo selecionado, ajustar para a vista padrão
    fitMapToContent()
  }
}

const toggleMenu = (e) => {
  e.stopPropagation()
  showMenu.value = !showMenu.value
  showNotif.value = false
}

function formatRoutePoints(route) {
  const points =
    route.geometry && route.geometry.length > 0 ? route.geometry : route.waypoints || []

  return points.map((point) => [point.latitude, point.longitude])
}

function drawRoutes() {
  // Não recebe mais argumentos, usa displayedRoutes.value
  if (!mapInstance.value || !routeLayer.value) return

  routeLayer.value.clearLayers()

  displayedRoutes.value.forEach((route) => {
    const points = formatRoutePoints(route)
    if (points.length < 2) return

    const polyline = L.polyline(points, {
      color: route.color || route.cor || '#3b82f6',
      weight: isSelectedRoute(route) ? 8 : 5,
      opacity: isSelectedRoute(route) ? 1 : 0.95,
      lineJoin: 'round',
    })

    polyline.addTo(routeLayer.value)

    const originalPoints = (route.waypoints || []).map((wp) => [wp.latitude, wp.longitude])
    if (originalPoints.length >= 2) {
      const startPoint = originalPoints[0]
      const endPoint = originalPoints[originalPoints.length - 1]

      L.circleMarker(startPoint, {
        radius: 6,
        color: route.color || route.cor || '#3b82f6',
        fillColor: '#fff',
        fillOpacity: 1,
        weight: 3,
      }).addTo(routeLayer.value)

      L.circleMarker(endPoint, {
        radius: 7,
        color: route.color || route.cor || '#3b82f6',
        fillColor: route.color || route.cor || '#3b82f6',
        fillOpacity: 1,
        weight: 2,
      }).addTo(routeLayer.value)
    }
  })

  fitMapToContent() // Ajustar o mapa para o conteúdo atual
}

function isSelectedRoute(route) {
  const rid = route.idRota || route.id
  return selectedRouteId.value > 0 && String(rid) === String(selectedRouteId.value)
}

function fitMapToContent() {
  if (!mapInstance.value) return

  let pointsToFit = []

  const selectedRoute = allRoutes.value.find((route) => isSelectedRoute(route))
  if (selectedRoute) {
    pointsToFit = formatRoutePoints(selectedRoute)
  } else if (displayedRoutes.value.length > 0) {
    pointsToFit = displayedRoutes.value.flatMap((route) => formatRoutePoints(route))
  }

  if (pointsToFit.length > 0) {
    mapInstance.value.fitBounds(pointsToFit, { padding: [28, 28] })
  }
}

async function initMap() {
  if (!mapElement.value || mapInstance.value) return

  mapInstance.value = L.map(mapElement.value, { zoomControl: true }).setView([41.3649, -8.7389], 14)

  const TILE_URL =
    import.meta.env.VITE_MAP_TILES_URL || 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
  const TILE_ATTR = import.meta.env.VITE_MAP_TILES_ATTR || '&copy; OpenStreetMap contributors'

  L.tileLayer(TILE_URL, {
    attribution: TILE_ATTR,
    maxZoom: 19,
  }).addTo(mapInstance.value)

  routeLayer.value = L.layerGroup().addTo(mapInstance.value)
  occurrenceLayer.value = L.layerGroup().addTo(mapInstance.value)
  await nextTick()
  drawRoutes()
}

async function loadOccurrences() {
  try {
    const markers = await listOccurrenceMarkers()
    occurrenceMarkers.value = Array.isArray(markers) ? markers : []
  } catch {
    occurrenceMarkers.value = []
  }
}

async function loadRoutes() {
  const existingRoutes = await listRoutesWithGeometry()
  allRoutes.value = existingRoutes.map((r) => ({
    ...r,
  }))
  displayedRoutes.value = allRoutes.value // Inicialmente, exibir todas as rotas
  drawRoutes()
  fitMapToContent()
}

async function apagarRota(id) {
  if (!confirm('Tens a certeza que pretendes apagar esta rota global?')) return

  try {
    await deleteRota(id)
    allRoutes.value = allRoutes.value.filter((r) => (r.idRota || r.id) !== id)
    displayedRoutes.value = displayedRoutes.value.filter((r) => (r.idRota || r.id) !== id)
    drawRoutes()
    fitMapToContent()
  } catch (error) {
    console.error('Erro ao apagar rota:', error)
    alert('Não foi possível apagar a rota.')
  }
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
  try {
    await initMap()
  } catch {
    // ignore
  }

  await loadOccurrences() // Carregar ocorrências primeiro, pois as cores das rotas dependem delas
  loadRoutes().catch(() => {})
})

watch(
  [allRoutes, occurrenceMarkers, selectedRouteId, selectedOccurrenceType],
  () => {
    // Se um filtro de tipo estiver ativo, reaplicá-lo
    if (selectedOccurrenceType.value) {
      const key = selectedOccurrenceType.value
      const filtered = allRoutes.value.filter((route) => {
        const waypoints = Array.isArray(route.waypoints) ? route.waypoints : []
        return waypoints.slice(1).some((wp) => {
          return occurrenceMarkers.value.some((m) => {
            const isSameLoc =
              Math.abs(Number(m.latitude) - wp.latitude) < 0.00001 &&
              Math.abs(Number(m.longitude) - wp.longitude) < 0.00001
            return isSameLoc && normalizeTypeKey(m.tipo || '') === key
          })
        })
      })
      displayedRoutes.value = filtered
    } else {
      // Caso contrário, exibir todas as rotas
      displayedRoutes.value = allRoutes.value
    }
    drawRoutes()
    fitMapToContent()
  },
  { deep: true },
) // Observar profundamente allRoutes e occurrenceMarkers

onBeforeUnmount(() => {
  document.removeEventListener('click', handleDocClick)
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
.icon {
  cursor: pointer;
  font-size: 1.2rem;
}
.menu-trigger {
  font-size: 1.4rem;
}

/* INDICATORS */
.indicators-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
  margin-bottom: 40px;
}
.indicator-card {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 24px;
  background: #fff;
  border: 1px solid #f1f5f9;
  border-radius: 16px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}
.indicator-icon-bg {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.indicator-icon-bg.pending {
  background: #fee2e2;
}
.indicator-icon-bg.progress {
  background: #fef9c3;
}
.indicator-icon {
  width: 28px;
  height: 28px;
}
.indicator-info {
  display: flex;
  flex-direction: column;
}
.indicator-value {
  font-size: 28px;
  font-weight: 800;
  color: #0f172a;
  line-height: 1;
}
.indicator-label {
  font-size: 14px;
  color: #64748b;
  font-weight: 600;
  margin-top: 4px;
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

/* LEGEND */
.legend-title {
  font-size: 18px;
  font-weight: 800;
  color: #22c55e;
  margin: 0 0 25px 0;
}
.legend-title-secondary {
  margin-top: 36px;
}
.occ-legend-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px 28px;
}
.occ-legend-item {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  padding: 6px 4px;
  border-radius: 8px;
  transition: background 0.12s;
}
.occ-legend-item:hover {
  background: #f8fafc;
}
.occ-legend-item--active {
  background: #f1f5f9;
}
.occ-legend-bar {
  width: 5px;
  height: 45px;
  border-radius: 3px;
  flex-shrink: 0;
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
.no-occs-msg {
  color: #64748b;
  font-style: italic;
  margin-top: 20px;
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
  position: relative;
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
.delete-route-icon {
  width: 18px;
  height: 18px;
  cursor: pointer;
  opacity: 0.6;
  transition:
    opacity 0.2s,
    transform 0.2s;
}
.delete-route-icon:hover {
  opacity: 1;
  transform: scale(1.1);
}
.no-routes-msg {
  color: #64748b;
  font-style: italic;
  margin-top: 20px;
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
  .occ-legend-grid {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 640px) {
  .occ-legend-grid {
    grid-template-columns: 1fr;
  }
}
</style>
