<template>
  <div class="page-container">
    <nav class="navbar">
      <div class="logo-area">
        <img src="@/assets/logoP.png" alt="VC Comunica Logo" class="logo-img" />
      </div>
      <div class="nav-icons">
        
        <span class="icon menu-trigger" @click="toggleMenu($event)" ref="menuIcon">☰</span>

        <AdminSidebarMenu v-if="userRole === 'admin'" v-model="showMenu" />
        <ResponsavelSidebarMenu v-else-if="userRole === 'responsavel'" v-model="showMenu" />
        <SidebarMenu v-else v-model="showMenu" />

        
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
                  <th>Status</th>
                  <th>Tipo de Ocorrência </th>
                  <th>Avaliação</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="task in tasks" :key="task.id">
                  <td>
                    <span :class="['status-badge', task.statusClass]">{{ task.situacao }}</span>
                  </td>
                  <td :class="['type-cell', task.typeClass]">
                    {{ task.tipo || 'Sem tipo' }}
                  </td>
                  <td>
                    <div v-if="task.mensagens && task.mensagens.length > 0" class="worker-eval-info">
                      <span class="stars">⭐ {{ task.mensagens[0].classificacao }}/5</span>
                      <p class="eval-preview" :title="task.mensagens[0].texto">{{ task.mensagens[0].texto }}</p>
                    </div>
                    <span v-else class="no-eval">-</span>
                  </td>
                  <td class="action-cell">
                    <router-link :to="`/ocorrencia/${task.id}`">
                      <img src="@/assets/detalhes.png" alt="Ver" class="info-btn" />
                    </router-link>
                  </td>
                </tr>
                <tr v-if="tasks.length === 0">
                  <td colspan="4" class="empty-state">Sem ocorrências disponíveis.</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="quick-stats">
            <article class="stat-card">
              <p class="stat-label">Ocorrências aceites</p>
              <p class="stat-value">{{ tasks.length }}</p>
            </article>
            <article class="stat-card">
              <p class="stat-label">Recursos da equipa</p>
              <p class="stat-value">{{ teamResources.length }}</p>
            </article>
            <article class="stat-card">
              <p class="stat-label">Colegas ativos</p>
              <p class="stat-value">{{ teamMates.length }}</p>
            </article>
          </div>

          <div class="team-info-grid">
            <article class="team-card">
              <h3>Recursos da Equipa</h3>
              <ul v-if="teamResources.length" class="resource-grid">
                <li v-for="resource in teamResources" :key="resource.id" class="resource-item">
                  <div class="team-item-main">{{ resource.tipo }}</div>
                  <div class="team-item-sub">{{ resource.localizacao }}</div>
                  <span class="resource-state">{{ resource.estado }}</span>
                </li>
              </ul>
              <p v-else class="empty-substate">Sem recursos atribuídos à equipa.</p>
            </article>

            <article class="team-card">
              <h3>Colegas de Equipa</h3>
              <ul v-if="teamMates.length" class="mates-grid">
                <li v-for="mate in teamMates" :key="mate.id" class="mate-item">
                  <img
                    class="mate-avatar"
                    :src="mate.fotoPerfil || defaultAvatar"
                    :alt="`Foto de ${mate.nome}`"
                    @error="onAvatarError"
                  />
                  <div class="mate-content">
                    <div class="team-item-main mate-name" :title="mate.nome">{{ mate.nome }}</div>
                    <div class="team-item-sub mate-email" :title="mate.email">{{ mate.email }}</div>
                  </div>
                </li>
              </ul>
              <p v-else class="empty-substate">Sem colegas atribuídos à equipa.</p>
            </article>
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
              <div ref="mapElement" class="map-embed map-leaflet"></div>
            </div>
          </div>

          <div class="map-legend" v-if="acceptedTypeSummary.length">
            <article v-for="item in acceptedTypeSummary" :key="item.key" class="map-legend-item">
              <div class="map-legend-bar" :style="{ backgroundColor: item.color }"></div>
              <div class="map-legend-text">
                <strong>{{ item.label }}</strong>
                <span>{{ item.count }} ocorrência(s)</span>
              </div>
            </article>
          </div>
        </section>
      </div>
    </main>

    <Footer :columns="workerFooterColumns" :logo-src="workerFooterLogo" />
  </div>
</template>

<script setup>
import { computed, nextTick, ref, onMounted, onBeforeUnmount, watch } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import Footer from '@/components/footer.vue'
import SidebarMenu from '@/components/SidebarMenu.vue'
import AdminSidebarMenu from '@/components/AdminSidebarMenu.vue'
import ResponsavelSidebarMenu from '@/components/ResponsavelSidebarMenu.vue'
import defaultAvatar from '@/assets/avatar.png'
import workerFooterLogo from '@/assets/logoP.png'
import { API_BASE_URL, listWorkerPendingOccurrences } from '@/services/occurrenceService'
import { getAuthToken } from '@/utils/auth'
import { resolveOccurrenceCoordinates } from '@/utils/occurrenceStorage'
import {
  getOccurrenceStatusColor,
  getOccurrenceTypeMeta,
  normalizeTypeKey,
} from '@/utils/occurrenceTypes'

const workerFooterColumns = [
  [
    { label: 'Home', to: '/trabalhador' },
    { label: 'Ocorrências', to: '/ocorrencias' },
    { label: 'Perfil', to: '/trabalhador/perfil' },
  ],
]

const showMenu = ref(false)

const tasks = ref([])
const teamResources = ref([])
const teamMates = ref([])
const mapElement = ref(null)
const mapInstance = ref(null)
const acceptedLayer = ref(null)

const userRole = computed(() => localStorage.getItem('role'))

const acceptedTypeSummary = computed(() => {
  const summary = new Map()

  tasks.value.forEach((occurrence) => {
    const key = normalizeTypeKey(occurrence.tipo || '')
    const meta = getOccurrenceTypeMeta(occurrence.tipo || key)

    if (!summary.has(key)) {
      summary.set(key, {
        key,
        label: meta.label,
        color: getOccurrenceStatusColor(occurrence.statusClass || 'em-resolucao'),
        count: 0,
      })
    }

    summary.get(key).count += 1
  })

  return Array.from(summary.values()).sort((left, right) => right.count - left.count)
})

const resolvePhotoUrl = (photo) => {
  if (!photo || typeof photo !== 'string') return ''
  if (/^https?:\/\//i.test(photo) || photo.startsWith('data:')) return photo
  if (!API_BASE_URL) return photo
  return `${API_BASE_URL}${photo.startsWith('/') ? '' : '/'}${photo}`
}

const onAvatarError = (event) => {
  event.target.src = defaultAvatar
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

function drawAcceptedOccurrencesOnMap() {
  if (!mapInstance.value || !acceptedLayer.value) return

  acceptedLayer.value.clearLayers()
  const bounds = []

  tasks.value.forEach((occurrence) => {
    const coords = resolveOccurrenceCoordinates(occurrence)
    const lat = Number(coords.latitude)
    const lng = Number(coords.longitude)
    if (Number.isNaN(lat) || Number.isNaN(lng)) return

    const markerColor = getOccurrenceStatusColor(occurrence.statusClass || 'em-resolucao')
    const typeMeta = getOccurrenceTypeMeta(occurrence.tipo || '')
    const marker = L.marker([lat, lng], {
      icon: createPinIcon(markerColor, typeMeta.icon),
    })

    marker.bindPopup(`
      <div style="min-width:160px;">
        <strong style="font-size:13px;">${occurrence.tipo || 'Ocorrência'}</strong><br/>
        <span style="font-size:12px;">${occurrence.detalhes || occurrence.location || 'Sem detalhes'}</span>
      </div>
    `)
    marker.addTo(acceptedLayer.value)
    bounds.push([lat, lng])
  })

  if (bounds.length) {
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

  acceptedLayer.value = L.layerGroup().addTo(mapInstance.value)
  await nextTick()
  drawAcceptedOccurrencesOnMap()
}


const menuPanel = ref(null)
const menuIcon = ref(null)


const toggleMenu = (e) => {
  showMenu.value = !showMenu.value
  e.stopPropagation()
}

function handleDocClick(e) {
  
  if (showMenu.value && !menuPanel.value?.contains(e.target) && !menuIcon.value?.contains(e.target))
    showMenu.value = false
}

onMounted(() => document.addEventListener('click', handleDocClick))
onMounted(async () => {
  try {
    await initMap()

    const token = getAuthToken()
    const headers = token ? { Authorization: `Bearer ${token}` } : {}

    const workerOccurrences = await listWorkerPendingOccurrences()
    tasks.value = Array.isArray(workerOccurrences) ? workerOccurrences : []
    drawAcceptedOccurrencesOnMap()

    if (!API_BASE_URL || !token) {
      teamResources.value = []
      teamMates.value = []
      return
    }

    const meResponse = await fetch(`${API_BASE_URL}/trabalhadores/me`, { headers })
    if (!meResponse.ok) {
      teamResources.value = []
      teamMates.value = []
      return
    }

    const me = await meResponse.json()
    const myTeamId = Number(me.idEquipa)
    const myWorkerId = Number(me.idTrabalhador)

    if (!myTeamId) {
      teamResources.value = []
      teamMates.value = []
      return
    }

    const [resourcesResponse, workersResponse] = await Promise.all([
      fetch(`${API_BASE_URL}/recursos`, { headers }),
      fetch(`${API_BASE_URL}/trabalhadores`, { headers }),
    ])

    const resources = resourcesResponse.ok ? await resourcesResponse.json() : []
    const workers = workersResponse.ok ? await workersResponse.json() : []

    teamResources.value = Array.isArray(resources)
      ? resources
          .filter((resource) => Number(resource.equipaResponsavel) === myTeamId)
          .map((resource) => ({
            id: resource.idRecurso,
            tipo: resource.tipo || 'Recurso',
            estado: resource.estado || 'Sem estado',
            localizacao: resource.localizacao || 'Sem localização',
          }))
      : []

    teamMates.value = Array.isArray(workers)
      ? workers
          .filter(
            (worker) =>
              Number(worker.idEquipa) === myTeamId && Number(worker.idTrabalhador) !== myWorkerId,
          )
          .map((worker) => ({
            id: worker.idTrabalhador,
            nome: worker.nomeTrabalhador || 'Trabalhador',
            email: worker.emailTrabalhador || 'Sem email',
            fotoPerfil: resolvePhotoUrl(worker.fotoPerfil),
          }))
      : []
  } catch {
    tasks.value = []
    teamResources.value = []
    teamMates.value = []
    drawAcceptedOccurrencesOnMap()
  }
})

watch(
  () => tasks.value,
  () => {
    drawAcceptedOccurrencesOnMap()
  },
  { deep: true },
)

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
  font-family: 'Inter', sans-serif;
  background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
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
  grid-template-columns: minmax(0, 1.15fr) minmax(0, 1fr);
  grid-template-areas: 'route tasks';
  gap: 28px;
  align-items: start;
}

.tasks-section,
.route-section {
  min-width: 0;
  border: 1px solid #eef0f3;
  border-radius: 18px;
  padding: 18px;
  background: #fff;
  box-shadow: 0 8px 28px rgba(2, 8, 20, 0.03);
}

.tasks-section {
  grid-area: tasks;
}

.route-section {
  grid-area: route;
}

/* SECTIONS COMMON */
.section-header {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 18px;
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
  box-shadow: 0 8px 30px rgba(15, 23, 42, 0.04);
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

.worker-table tbody tr {
  transition: background-color 0.2s ease;
}

.worker-table tbody tr:hover {
  background: #fafafa;
}

.worker-table th:last-child,
.worker-table td:last-child {
  width: 56px;
  text-align: center;
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
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
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

.worker-eval-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.stars {
  font-weight: 700;
  color: #166534;
  font-size: 13px;
}
.eval-preview {
  margin: 0;
  font-size: 12px;
  color: #64748b;
  max-width: 200px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.no-eval {
  color: #cbd5e1;
  font-size: 12px;
}

.empty-state {
  text-align: center;
  color: #6b7280;
  font-weight: 600;
}

.quick-stats {
  margin-top: 16px;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.stat-card {
  background: linear-gradient(180deg, #ffffff 0%, #f9fafb 100%);
  border: 1px solid #ebedf0;
  border-radius: 12px;
  padding: 12px;
}

.stat-label {
  margin: 0;
  font-size: 12px;
  color: #6b7280;
}

.stat-value {
  margin: 6px 0 0;
  font-size: 24px;
  font-weight: 800;
  color: #111827;
}

.team-info-grid {
  margin-top: 20px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.team-card {
  background: #fff;
  border: 1px solid #e9ecef;
  border-radius: 14px;
  padding: 16px;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.03);
}

.team-card h3 {
  margin: 0 0 10px;
  font-size: 16px;
  color: #1f2937;
}

.team-list {
  margin: 0;
  padding: 0;
  list-style: none;
}

.resource-grid {
  margin: 0;
  padding: 0;
  list-style: none;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
  gap: 10px;
}

.resource-item {
  border: 1px solid #edf2f7;
  border-radius: 12px;
  padding: 10px;
  background: #f9fbfd;
}

.resource-state {
  margin-top: 6px;
  display: inline-block;
  font-size: 11px;
  font-weight: 700;
  color: #155e75;
  background: #ecfeff;
  border: 1px solid #cffafe;
  border-radius: 999px;
  padding: 3px 8px;
}

.mates-grid {
  margin: 0;
  padding: 0;
  list-style: none;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
  gap: 10px;
}

.mate-item {
  border: 1px solid #edf2f7;
  border-radius: 12px;
  padding: 10px;
  display: flex;
  align-items: center;
  gap: 10px;
  background: #fff;
}

.mate-content {
  min-width: 0;
}

.mate-name,
.mate-email {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.mate-avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #f3f4f6;
  flex-shrink: 0;
}

.team-list-item {
  padding: 8px 0;
  border-top: 1px solid #f1f5f9;
}

.team-list-item:first-child {
  border-top: 0;
  padding-top: 0;
}

.team-item-main {
  font-size: 14px;
  font-weight: 700;
  color: #1f2937;
}

.team-item-sub {
  font-size: 13px;
  color: #6b7280;
}

.empty-substate {
  margin: 0;
  color: #6b7280;
  font-size: 13px;
}

/* MAP REPRESENTATION */
.map-wrapper {
  background: #f8fafc;
  border-radius: 20px;
  height: clamp(420px, 56vh, 620px);
  position: relative;
  overflow: hidden;
  border: 1px solid #e5e7eb;
}
.map-placeholder {
  width: 100%;
  height: 100%;
  background: #e2e8f0;
}
.map-embed {
  width: 100%;
  height: 100%;
  border: 0;
  display: block;
}
.map-leaflet {
  width: 100%;
  height: 100%;
  border-radius: 14px;
}

.map-legend {
  margin-top: 12px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 10px;
}

.map-legend-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  background: #fff;
}

.map-legend-bar {
  width: 4px;
  height: 34px;
  border-radius: 99px;
}

.map-legend-text {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.map-legend-text strong {
  font-size: 14px;
  color: #0f172a;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.map-legend-text span {
  font-size: 12px;
  color: #64748b;
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
    grid-template-areas:
      'tasks'
      'route';
  }

  .team-info-grid,
  .quick-stats,
  .resource-grid,
  .mates-grid {
    grid-template-columns: 1fr;
  }

  .navbar,
  .main-content,
  .main-footer {
    padding: 20px;
  }
}

@media (max-width: 1280px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
    grid-template-areas:
      'tasks'
      'route';
  }
}
</style>
