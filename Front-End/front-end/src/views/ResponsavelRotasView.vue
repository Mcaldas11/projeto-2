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
      <h1 class="page-title">Rotas de {{ userFreguesiaNome || 'Freguesia' }}</h1>

      <!-- Rotas Ativas -->
      <section class="rotas-ativas">
        <div class="rotas-grid">
          <div class="map-placeholder">
            <div ref="mapElement" class="route-map-canvas map-leaflet"></div>
          </div>

          <div class="rotas-sidebar">
            <h3 class="legend-title">Filtrar por Tipo</h3>
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
            
            <h3 class="legend-title legend-title-secondary">
              Selecionar Ocorrências ({{ selectedOccurrenceIds.length }})
            </h3>
            <div v-if="filteredOccurrences.length > 0" class="occ-selection-actions">
              <button class="btn-small-link" @click="selectAllFiltered">Selecionar Todas</button>
              <button class="btn-small-link" @click="selectedOccurrenceIds = []">Limpar Seleção</button>
            </div>
            <div class="occ-list-scroll">
              <div 
                v-for="occ in filteredOccurrences" 
                :key="occ.id"
                :class="['occ-list-item', { 'occ-list-item--selected': isOccSelected(occ.id) }]"
                @click="toggleOccSelection(occ.id)"
              >
                <input type="checkbox" :checked="isOccSelected(occ.id)" @click.stop="toggleOccSelection(occ.id)" />
                <div class="occ-list-item-text">
                  <strong>{{ occ.tipo }}</strong>
                  <span>{{ occ.location || occ.localizacao }}</span>
                </div>
              </div>
              <p v-if="filteredOccurrences.length === 0" class="no-occs-msg">
                Não existem ocorrências ativas para selecionar.
              </p>
            </div>
          </div>
        </div>
      </section>

      <!-- Proximas Rotas Otimizadas -->
      <section class="proximas-rotas">
        <div class="header-with-action">
          <div class="header-text">
            <h2 class="section-subtitle">Rotas da Junta de Freguesia</h2>
            <p class="espera-label">Cria uma rota com as ocorrências selecionadas acima</p>
          </div>
          <button 
            class="btn-gerar-rotas" 
            :disabled="isGenerating || selectedOccurrenceIds.length === 0" 
            @click="gerarRotas"
          >
            {{ isGenerating ? 'A gravar rota...' : 'Gerar Rota Selecionada' }}
          </button>
        </div>

        <div class="category-cards">
          <div
            v-for="route in routes"
            :key="route.idRota || route.id"
            :class="['category-card', { selected: isSelectedRoute(route) }]"
            @click="router.push({ query: { routeId: route.idRota || route.id } })"
          >
            <div class="card-bar" :style="{ background: route.color || route.cor }"></div>
            <div class="card-content">
              <strong>{{ route.nome }}</strong>
              <span>{{ route.waypoints?.length || 0 }} pontos de paragem</span>
            </div>
            <img 
              src="@/assets/delete_icon.svg" 
              class="delete-route-icon" 
              title="Apagar rota"
              @click.stop="apagarRota(route.idRota || route.id)" 
            />
          </div>
          <div v-if="routes.length === 0" class="no-occs-msg" style="grid-column: 1/-1;">
            Nenhuma rota guardada para esta freguesia.
          </div>
        </div>
      </section>
    </main>

    <Footer :columns="responsavelFooterColumns" :logo-src="adminFooterLogo" />
  </div>
</template>

<script setup>
import { computed, nextTick, ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import Footer from '@/components/footer.vue'
import ResponsavelSidebarMenu from '@/components/ResponsavelSidebarMenu.vue'
import adminFooterLogo from '@/assets/logo_footer.png'
import { listRoutesWithGeometry, buildRouteGeometry, createRota, deleteRota, geocodeParishHall } from '@/services/routeService'
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

const router = useRouter()
const showMenu = ref(false)
const mapElement = ref(null)
const mapInstance = ref(null)
const routeLayer = ref(null)
const occurrenceLayer = ref(null)
const occurrenceMarkers = ref([])
const routes = ref([])
const userFreguesiaId = ref(null)
const userFreguesiaNome = ref('')
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

  sorted.forEach((type, i) => {
    type.color = OCC_PALETTE[i % OCC_PALETTE.length]
  })

  return sorted
})

const selectedOccurrenceType = ref(null)

const selectedOccurrenceIds = ref([])

const filteredOccurrences = computed(() => {
  return occurrenceMarkers.value.filter((m) => {
    const isActive = ACTIVE_OCCURRENCE_STATES.has(String(m.statusClass || ''))
    if (!isActive) return false

    if (selectedOccurrenceType.value) {
      const key = String(m.typeKey || normalizeTypeKey(m.tipo || '')).trim()
      return key === selectedOccurrenceType.value
    }
    return true
  })
})

function isOccSelected(id) {
  return selectedOccurrenceIds.value.includes(id)
}

function toggleOccSelection(id) {
  const idx = selectedOccurrenceIds.value.indexOf(id)
  if (idx > -1) {
    selectedOccurrenceIds.value.splice(idx, 1)
  } else {
    selectedOccurrenceIds.value.push(id)
  }
  drawOccurrences()
}

function selectAllFiltered() {
  filteredOccurrences.value.forEach((occ) => {
    if (!isOccSelected(occ.id)) {
      selectedOccurrenceIds.value.push(occ.id)
    }
  })
  drawOccurrences()
}

function toggleOccurrenceFilter(key) {
  selectedOccurrenceType.value = selectedOccurrenceType.value === key ? null : key
  drawOccurrences()
}

const toggleMenu = (e) => {
  e.stopPropagation()
  showMenu.value = !showMenu.value
}

function formatRoutePoints(route) {
  const points =
    route.geometry && route.geometry.length > 0 ? route.geometry : route.waypoints || []

  return points.map((point) => [point.latitude, point.longitude])
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

    const originalPoints = (route.waypoints || []).map((wp) => [wp.latitude, wp.longitude])
    if (originalPoints.length >= 2) {
      const startPoint = originalPoints[0]
      const endPoint = originalPoints[originalPoints.length - 1]

      L.circleMarker(startPoint, {
        radius: 8,
        color: '#16a34a',
        fillColor: '#fff',
        fillOpacity: 1,
        weight: 3,
      })
        .addTo(routeLayer.value)
        .bindPopup(`Junta de Freguesia de ${userFreguesiaNome.value} (Início)`)

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
  setTimeout(() => {
    if (mapInstance.value) {
      mapInstance.value.invalidateSize()
    }
  }, 200)
  
  drawRoutes()
}

async function loadOccurrences() {
  try {
    const markers = await listOccurrenceMarkers()
    // Filtro adicional de segurança: garantir que as ocorrências são da freguesia do user
    occurrenceMarkers.value = Array.isArray(markers)
      ? markers.filter((m) => Number(m.idFreguesia) === Number(userFreguesiaId.value))
      : []
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

    const isSelected = isOccSelected(markerData.id)
    const markerColor = isSelected ? '#730000' : colorByKey.get(key) || '#64748b'
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

async function getFreguesiaInfo() {
  try {
    const userId = getAuthUserId()
    const response = await fetch(`${API_BASE_URL}/trabalhadores/${userId}`)
    if (!response.ok) return
    const user = await response.json()
    userFreguesiaId.value = user?.idFreguesia

    if (user?.idFreguesia) {
      const munResp = await fetch(`${API_BASE_URL}/municipios/${user.idFreguesia}`)
      if (munResp.ok) {
        const mun = await munResp.json()
        userFreguesiaNome.value = mun.nome
      }
    }
  } catch (err) {
    console.warn('Failed to fetch user parish info', err)
  }
}

const isGenerating = ref(false)

async function gerarRotas() {
  if (isGenerating.value || !userFreguesiaNome.value) return

  const selectedOccs = occurrenceMarkers.value.filter((m) => selectedOccurrenceIds.value.includes(m.id))

  if (selectedOccs.length === 0) {
    alert('Por favor, seleciona pelo menos uma ocorrência para gerar a rota.')
    return
  }

  isGenerating.value = true

  try {
    const startCoords = await geocodeParishHall(userFreguesiaNome.value)

    const waypoints = [
      { latitude: startCoords.latitude, longitude: startCoords.longitude },
      ...selectedOccs.map((o) => ({ latitude: o.latitude, longitude: o.longitude })),
    ]

    const routePayload = {
      nome: `Rota ${userFreguesiaNome.value} - ${selectedOccs.length} pontos`,
      idFreguesia: Number(userFreguesiaId.value),
      waypoints,
      cor: OCC_PALETTE[routes.value.length % OCC_PALETTE.length],
    }

    routePayload.geometry = await buildRouteGeometry({ waypoints })

    const savedRoute = await createRota(routePayload)
    routes.value = [
      ...routes.value,
      {
        ...savedRoute,
        color: savedRoute.cor || routePayload.cor,
      },
    ]
    drawRoutes()

    // Limpar seleção após gerar
    selectedOccurrenceIds.value = []
    drawOccurrences()

    alert(`Rota gerada com sucesso para ${selectedOccs.length} ocorrências!`)
  } catch (error) {
    console.error('Erro ao gerar rotas:', error)
    alert('Erro ao gerar rotas.')
  } finally {
    isGenerating.value = false
  }
}

async function apagarRota(id) {
  if (!confirm('Tens a certeza que pretendes apagar esta rota?')) return

  try {
    await deleteRota(id)
    routes.value = routes.value.filter(r => (r.idRota || r.id) !== id)
    drawRoutes()
  } catch (error) {
    console.error('Erro ao apagar rota:', error)
    alert('Não foi possível apagar a rota.')
  }
}

onMounted(async () => {
  try {
    await initMap()
  } catch {
    // ignore
  }

  await getFreguesiaInfo()
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
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;800&display=swap');

.page-container {
  font-family: 'Montserrat', sans-serif;
  color: #1e293b;
  background: #ffffff;
  min-height: 100vh;
}

/* NAVBAR */
.navbar {
  display: flex;
  justify-content: space-between;
  padding: 24px 80px;
  align-items: center;
  background: white;
  border-bottom: 1px solid #f1f5f9;
}
.logo-img {
  height: 42px;
}
.nav-right {
  display: flex;
  gap: 24px;
  align-items: center;
  position: relative;
}
.icon {
  cursor: pointer;
  font-size: 1.5rem;
  color: #1e293b;
}

/* MAIN CONTENT */
.main-content {
  padding: 60px 80px;
  max-width: 1400px;
  margin: 0 auto;
}
.page-title {
  font-size: 42px;
  font-weight: 900;
  margin: 0 0 48px 0;
  color: #1e293b;
}

/* ROTAS ATIVAS GRID */
.rotas-ativas {
  margin-bottom: 80px;
}
.rotas-grid {
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 48px;
  align-items: start;
}
.map-placeholder {
  background: #f8fafc;
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
  border: 1px solid #f1f5f9;
  height: 550px;
  position: relative;
  z-index: 1;
}
.route-map-canvas {
  width: 100%;
  height: 100%;
}
.map-leaflet {
  width: 100%;
  height: 100%;
}

/* SIDEBAR / LEGEND */
.rotas-sidebar {
  background: #ffffff;
  padding: 32px;
  border-radius: 24px;
  border: 1px solid #f1f5f9;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
}
.legend-title {
  font-size: 18px;
  font-weight: 800;
  color: #1e293b;
  margin: 0 0 20px 0;
  display: flex;
  align-items: center;
  gap: 10px;
}
.legend-title::before {
  content: '';
  width: 4px;
  height: 20px;
  background: #22c55e;
  border-radius: 2px;
}
.legend-title-secondary {
  margin-top: 40px;
}
.legend-title-secondary::before {
  background: #730000;
}

.occ-legend-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.occ-legend-item {
  display: flex;
  align-items: center;
  gap: 16px;
  cursor: pointer;
  padding: 12px 16px;
  border-radius: 12px;
  background: #f8fafc;
  border: 1px solid transparent;
  transition: all 0.2s;
}
.occ-legend-item:hover {
  background: #f1f5f9;
  transform: translateX(4px);
}
.occ-legend-item--active {
  background: #ffffff;
  border-color: #cbd5e1;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}
.occ-legend-bar {
  width: 4px;
  height: 32px;
  border-radius: 2px;
  flex-shrink: 0;
}
.legend-text {
  display: flex;
  flex-direction: column;
}
.legend-text strong {
  font-size: 14px;
  font-weight: 700;
  color: #334155;
}
.legend-text span {
  font-size: 12px;
  color: #64748b;
  font-weight: 600;
}

/* LISTA DE SELEÇÃO */
.occ-selection-actions {
  display: flex;
  justify-content: space-between;
  margin-bottom: 16px;
}
.btn-small-link {
  background: #f1f5f9;
  border: none;
  color: #475569;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  padding: 6px 12px;
  border-radius: 6px;
  transition: all 0.2s;
}
.btn-small-link:hover {
  background: #e2e8f0;
  color: #1e293b;
}

.occ-list-scroll {
  max-height: 320px;
  overflow-y: auto;
  padding-right: 4px;
}
.occ-list-scroll::-webkit-scrollbar {
  width: 5px;
}
.occ-list-scroll::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 10px;
}
.occ-list-scroll::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 10px;
}

.occ-list-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px;
  margin-bottom: 8px;
  background: #f8fafc;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid transparent;
}
.occ-list-item:hover {
  background: #f1f5f9;
}
.occ-list-item--selected {
  background: #ffffff;
  border-color: #730000;
  box-shadow: 0 4px 12px rgba(115, 0, 0, 0.05);
}
.occ-list-item-text {
  display: flex;
  flex-direction: column;
  flex: 1;
}
.occ-list-item-text strong {
  font-size: 13px;
  font-weight: 700;
  color: #1e293b;
}
.occ-list-item-text span {
  font-size: 11px;
  color: #64748b;
  font-weight: 600;
  display: block;
  margin-top: 2px;
}

.no-occs-msg {
  color: #94a3b8;
  font-style: italic;
  font-size: 13px;
  text-align: center;
  padding: 20px;
}

/* PROXIMAS ROTAS SECTION */
.proximas-rotas {
  margin-top: 20px;
  padding-top: 60px;
  border-top: 1px solid #f1f5f9;
}
.header-with-action {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 32px;
}
.section-subtitle {
  font-size: 28px;
  font-weight: 800;
  margin: 0;
  color: #1e293b;
}
.espera-label {
  font-size: 15px;
  color: #64748b;
  margin: 6px 0 0 0;
  font-weight: 500;
}

.category-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
}
.category-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: #ffffff;
  border: 1px solid #f1f5f9;
  border-radius: 16px;
  position: relative;
  transition: all 0.3s ease;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.02);
}
.category-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
  border-color: #e2e8f0;
}
.category-card.selected {
  border-color: #730000;
  background: #fffcfc;
}
.card-bar {
  width: 5px;
  height: 44px;
  border-radius: 3px;
  flex-shrink: 0;
}
.card-content {
  display: flex;
  flex-direction: column;
  flex: 1;
}
.card-content strong {
  font-size: 15px;
  font-weight: 800;
  color: #1e293b;
}
.card-content span {
  font-size: 13px;
  color: #64748b;
  font-weight: 600;
  margin-top: 4px;
}
.delete-route-icon {
  width: 20px;
  height: 20px;
  cursor: pointer;
  opacity: 0.4;
  transition: all 0.2s;
  padding: 4px;
  border-radius: 4px;
}
.delete-route-icon:hover {
  opacity: 1;
  background: #fee2e2;
  transform: scale(1.1);
}

.btn-gerar-rotas {
  background: #22c55e;
  color: #fff;
  border: none;
  padding: 14px 32px;
  border-radius: 12px;
  font-family: 'Montserrat', sans-serif;
  font-weight: 700;
  font-size: 15px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 14px rgba(34, 197, 94, 0.3);
}
.btn-gerar-rotas:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(34, 197, 94, 0.4);
  background: #16a34a;
}
.btn-gerar-rotas:disabled {
  background: #f1f5f9;
  color: #94a3b8;
  box-shadow: none;
  cursor: not-allowed;
}

@media (max-width: 1200px) {
  .rotas-grid {
    grid-template-columns: 1fr;
  }
  .rotas-sidebar {
    max-width: none;
  }
}

@media (max-width: 768px) {
  .navbar,
  .main-content {
    padding: 24px 32px;
  }
  .page-title {
    font-size: 32px;
  }
  .category-cards {
    grid-template-columns: 1fr;
  }
  .header-with-action {
    flex-direction: column;
    align-items: flex-start;
    gap: 20px;
  }
  .btn-gerar-rotas {
    width: 100%;
  }
}
</style>
