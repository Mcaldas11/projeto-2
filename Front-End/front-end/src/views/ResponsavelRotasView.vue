<!-- base errada -->
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

        <ResponsavelSidebarMenu v-model="showMenu" />

       
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
            <h3 class="legend-title legend-title-secondary">Ocorrências Ativas</h3>
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
            :key="route.idRota || route.id"
            :class="['category-card', { selected: isSelectedRoute(route) }]"
          >
            <div class="card-bar" :style="{ background: route.color || route.cor }"></div>
            <div class="card-content">
              <strong>{{ route.teamName || route.nome }}</strong>
              <span>{{ route.waypoints.length }} pontos</span>
            </div>
            <span class="info-icon" title="Mais informações">ⓘ</span>
          </div>
        </div>
        <button class="btn-gerar-rotas" :disabled="isGenerating" @click="gerarRotas">
          {{ isGenerating ? 'A gravar...' : 'Gerar Rotas' }}
        </button>
      </section>
    </main>

    <Footer :columns="responsavelFooterColumns" :logo-src="adminFooterLogo" />
  </div>
</template>

<script setup>
import { computed, nextTick, ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { useRoute } from 'vue-router'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import Footer from '@/components/footer.vue'
import ResponsavelSidebarMenu from '@/components/ResponsavelSidebarMenu.vue'
import adminFooterLogo from '@/assets/logo_footer.png'
import { listRoutesWithGeometry, buildRouteGeometry, createRota } from '@/services/routeService'
import { listOccurrenceMarkers } from '@/services/occurrenceService'
import { getOccurrenceTypeMeta, normalizeTypeKey } from '@/utils/occurrenceTypes'
import { getAuthUserId } from '@/utils/auth'
import { API_BASE_URL } from '@/services/occurrenceService'

const responsavelFooterColumns = [
  [
    { label: 'Home', to: '/responsavel/perfil' },
    { label: 'Ocorrências', to: '/ocorrencias' },
    { label: 'Rotas', to: '/responsavel/rotas' },
    { label: 'Equipas', to: '/responsavel/equipas' },
    { label: 'Trabalhadores', to: '/responsavel/trabalhadores' },
  ],
]

const showMenu = ref(false)
const mapElement = ref(null)
const mapInstance = ref(null)
const routeLayer = ref(null)
const occurrenceLayer = ref(null)
const occurrenceMarkers = ref([])
const routes = ref([])
const userFreguesiaId = ref(null)
const currentRoute = useRoute()
const selectedRouteId = computed(() =>
  Number(currentRoute.query.routeId || currentRoute.query.selectedRoute || 0),
)

const ACTIVE_OCCURRENCE_STATES = new Set(['em-resolucao', 'espera'])
const OCC_PALETTE = ['#06b6d4', '#7c3aed', '#ef4444', '#f59e0b', '#10b981', '#ef76b2']

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
        color: '',
        count: 0,
      })
    }

    summary.get(key).count += 1
  })

  const sorted = Array.from(summary.values())
    .sort((left, right) => right.count - left.count)
    .slice(0, 6)

  // Assign colors by index
  sorted.forEach((type, i) => {
    type.color = OCC_PALETTE[i % OCC_PALETTE.length]
  })

  return sorted
})

const selectedOccurrenceType = ref(null)

function toggleOccurrenceFilter(key) {
  selectedOccurrenceType.value = selectedOccurrenceType.value === key ? null : key
  drawOccurrences()
}


const toggleMenu = (e) => {
  e.stopPropagation()
  showMenu.value = !showMenu.value
}

function formatRoutePoints(route) {
  // Garantir que usamos a geometria detalhada (caminho das ruas) se existir
  const points = route.geometry && route.geometry.length > 0 
    ? route.geometry 
    : (route.waypoints || [])

  return points.map((point) => [
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
      color: route.color || route.cor || '#3b82f6',
      weight: isSelectedRoute(route) ? 8 : 5,
      opacity: isSelectedRoute(route) ? 1 : 0.95,
      lineJoin: 'round',
    })

    polyline.addTo(routeLayer.value)
    bounds.push(...points)

    // Desenhar marcadores de início e fim apenas para as waypoints originais
    const originalPoints = (route.waypoints || []).map(wp => [wp.latitude, wp.longitude])
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

  fitMapToContent(selectedRoute)
}

function isSelectedRoute(route) {
  const rid = route.idRota || route.id
  return selectedRouteId.value > 0 && String(rid) === String(selectedRouteId.value)
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
    drawOccurrences()
  } catch {
    occurrenceMarkers.value = []
  }
}

function createPinIcon(color, iconUrl) {
  const img = iconUrl
    ? `<img src="${iconUrl}" style="width:16px;height:16px;object-fit:contain;filter:brightness(0) invert(1);margin-bottom:2px;" />`
    : ''
  return L.divIcon({
    className: '',
    iconSize: [32, 40],
    iconAnchor: [16, 40],
    popupAnchor: [0, -42],
    html: `
      <div style="
        width:32px;
        height:32px;
        border-radius:50% 50% 50% 0;
        transform:rotate(-45deg);
        background:${color};
        display:flex;
        align-items:center;
        justify-content:center;
        box-shadow:0 2px 6px rgba(0,0,0,0.3);
      ">
        <div style="transform:rotate(45deg);display:flex;align-items:center;justify-content:center;">
          ${img}
        </div>
      </div>
    `,
  })
}

function drawOccurrences() {
  if (!mapInstance.value || !occurrenceLayer.value) return
  occurrenceLayer.value.clearLayers()

  const colorByKey = new Map(activeOccurrenceTypes.value.map((t) => [t.key, t.color]))

  occurrenceMarkers.value.forEach((markerData) => {
    if (!ACTIVE_OCCURRENCE_STATES.has(String(markerData.statusClass || ''))) {
      return
    }

    const key = String(markerData.typeKey || normalizeTypeKey(markerData.tipo || '')).trim()

    if (selectedOccurrenceType.value && selectedOccurrenceType.value !== key) return

    const lat = Number(markerData.latitude)
    const lng = Number(markerData.longitude)
    if (Number.isNaN(lat) || Number.isNaN(lng)) return

    const markerColor = colorByKey.get(key) || '#64748b'
    const meta = getOccurrenceTypeMeta(markerData.tipo || key)
    const pinIcon = createPinIcon(markerColor, meta.icon)

    const marker = L.marker([lat, lng], { icon: pinIcon })
    marker.bindPopup(`
      <div style="min-width:140px;">
        <strong style="font-size:13px;">${markerData.tipo || ''}</strong><br/>
        <span style="font-size:12px;">${markerData.detalhes || ''}</span>
      </div>
    `)
    marker.addTo(occurrenceLayer.value)
  })

  fitMapToContent(routes.value.find((route) => isSelectedRoute(route)) || null)
}

async function loadRoutes() {
  const existingRoutes = await listRoutesWithGeometry()
  routes.value = existingRoutes.map((r, i) => ({
    ...r,
    color: r.color || r.cor || OCC_PALETTE[i % OCC_PALETTE.length],
  }))
  drawRoutes()
}

async function getFreguesiaCoords() {
  try {
    const userId = getAuthUserId()
    const response = await fetch(`${API_BASE_URL}/trabalhadores/${userId}`)
    if (!response.ok) return { latitude: 41.3649, longitude: -8.7389 }
    const user = await response.json()
    userFreguesiaId.value = user?.idFreguesia
    if (!user?.idFreguesia) return { latitude: 41.3649, longitude: -8.7389 }
    return { latitude: 41.3649, longitude: -8.7389 }
  } catch {
    return { latitude: 41.3649, longitude: -8.7389 }
  }
}

const isGenerating = ref(false)

async function gerarRotas() {
  if (isGenerating.value) return
  isGenerating.value = true

  try {
    const startCoords = await getFreguesiaCoords()
    const pendingOccs = occurrenceMarkers.value.filter(
      (m) => String(m.statusClass) === 'espera' || String(m.statusClass) === 'em-resolucao',
    )

    if (pendingOccs.length === 0) {
      alert('Não existem ocorrências pendentes para gerar rotas.')
      return
    }

    const grouped = pendingOccs.reduce((acc, occ) => {
      const type = occ.tipo || 'Geral'
      if (!acc[type]) acc[type] = []
      acc[type].push(occ)
      return acc
    }, {})

    const newRoutes = []
    let colorIdx = routes.value.length

    for (const [type, occs] of Object.entries(grouped)) {
      const waypoints = [
        { latitude: startCoords.latitude, longitude: startCoords.longitude },
        ...occs.map((o) => ({ latitude: o.latitude, longitude: o.longitude })),
      ]

      const routePayload = {
        nome: `Rota ${type} - ${new Date().toLocaleDateString()}`,
        idFreguesia: Number(userFreguesiaId.value || 1),
        waypoints,
        cor: OCC_PALETTE[colorIdx % OCC_PALETTE.length],
      }

      // Obter o caminho detalhado pelas estradas via OSRM
      routePayload.geometry = await buildRouteGeometry({ waypoints })
      
      const savedRoute = await createRota(routePayload)
      newRoutes.push(savedRoute)
      colorIdx++
    }

    routes.value = [...routes.value, ...newRoutes]
    drawRoutes()
    alert(`${newRoutes.length} novas rotas geradas e guardadas com sucesso!`)
  } catch (error) {
    console.error('Erro ao gerar rotas:', error)
    alert('Erro ao gerar rotas.')
  } finally {
    isGenerating.value = false
  }
}

onMounted(async () => {
  try {
    await initMap()
  } catch {
    // ignore
  }

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
  display: flex; gap: 15px; align-items: center; position: relative;
}
.icon {
  cursor: pointer; font-size: 1.2rem;
}
.menu-trigger {
  font-size: 1.4rem;
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
.btn-gerar-rotas:disabled {
  background: #94a3b8;
  cursor: not-allowed;
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
