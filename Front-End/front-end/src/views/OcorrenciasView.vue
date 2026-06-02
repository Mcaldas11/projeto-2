<template>
  <div class="page-container">
    <nav class="navbar">
      <router-link to="/">
        <div class="logo-area">
          <img src="@/assets/logo.svg" alt="VC Comunica Logo" class="logo-img" />
        </div>
      </router-link>

      <div class="nav-icons" ref="navIcons">
        <router-link :to="newOccurrenceRoute" class="icon add">+</router-link>
        <img
          :src="notifications.length === 0 ? notifOff : notifOn"
          alt="notifications"
          class="icon notification"
          @click="toggleNotif"
          ref="notifIcon"
        />
        <span class="icon" ref="menuIcon" @click="toggleMenu">☰</span>

        <SidebarMenu v-model="showMenu" />

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
        <div class="icon-main-bg">
          <img src="@/assets/ocorrencias.png" alt="Ocorrências" class="icon-main-img" />
        </div>
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
        <div
          v-if="ocorrenciasError"
          class="error-banner"
          style="color: #9b1c1c; margin-bottom: 12px"
        >
          {{ ocorrenciasError }}
        </div>
        <div
          v-if="
            fetchInfo.allCount !== null ||
            fetchInfo.byStateCount !== null ||
            fetchInfo.fallbackCount !== null
          "
          style="font-size: 0.9rem; color: #6b7280; margin-bottom: 8px"
        ></div>
        <table class="occ-table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Situação ↕</th>
              <th>
                Tipo de Problema <img src="@/assets/detalhes.png" alt="Detalhes" class="th-icon" />
              </th>
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
                <router-link :to="`/ocorrencia/${occ.id}`">
                  <img src="@/assets/detalhes.png" alt="Detalhes" class="info-btn" />
                </router-link>
              </td>
            </tr>
          </tbody>
        </table>
      </section>

      <section v-else class="map-view">
        <div class="map-container">
          <div class="map-placeholder">
            <div ref="mapElement" class="map-leaflet"></div>
          </div>

          <div class="map-info-card" :class="{ empty: !selectedOccurrence }">
            <template v-if="selectedOccurrence">
              <div class="card-header">
                <img
                  :src="selectedOccurrenceMeta.icon"
                  :alt="selectedOccurrenceMeta.label"
                  class="icon-type"
                />
                <h3>{{ selectedOccurrenceMeta.label }}</h3>
              </div>
              <p>
                <strong>Status:</strong>
                <span :class="['status-badge', selectedOccurrence.statusClass]">{{
                  selectedOccurrence.situacao
                }}</span>
              </p>
              <p>
                <strong>Localização:</strong><br />{{
                  selectedOccurrence.location || 'Local não disponível'
                }}
              </p>
              <p><strong>Descrição:</strong><br />{{ selectedOccurrence.detalhes }}</p>
              <div class="reported-by">
                <strong>Reportado por:</strong>
                <div class="user-chip">
                  <img :src="selectedOccurrence.userImg" class="avatar-xs" alt="Reportado por" />
                  <span>{{ selectedOccurrence.nome }}</span>
                </div>
              </div>
            </template>
            <template v-else>
              <div class="card-header">
                <h3>Selecione uma ocorrência</h3>
              </div>
              <p>Clique num marcador no mapa para ver os detalhes da ocorrência.</p>
            </template>
          </div>
        </div>
      </section>
    </main>

    <Footer />
  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, onBeforeUnmount, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import Footer from '@/components/footer.vue'
import SidebarMenu from '@/components/SidebarMenu.vue'
import notifOn from '@/assets/notificationson.png'
import notifOff from '@/assets/notificationsoff.png'
import {
  listOccurrences,
  listAllOccurrences,
  listOccurrencesByState,
} from '@/services/occurrenceService'
import { getAuthUserType } from '@/utils/auth'
import { getOccurrenceStatusColor, getOccurrenceTypeMeta } from '@/utils/occurrenceTypes'
import { resolveOccurrenceCoordinates } from '@/utils/occurrenceStorage'
import { getNewOccurrenceRoute } from '@/utils/auth'

const route = useRoute()
const viewMode = ref('lista')
const showNotif = ref(false)
const showMenu = ref(false)
const notifications = ref([])

const notifPanel = ref(null)
const notifIcon = ref(null)
const menuPanel = ref(null)
const menuIcon = ref(null)
const mapElement = ref(null)
const newOccurrenceRoute = computed(() => getNewOccurrenceRoute())

const selectedOccurrence = ref(null)
const mapCenter = [41.36405, -8.73894]
let mapInstance = null
let markerLayer = null
const geocodeCache = new Map()

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

const ocorrencias = ref([])
const ocorrenciasError = ref('')
const fetchInfo = ref({ allCount: null, byStateCount: null, fallbackCount: null, errors: [] })

const selectedOccurrenceMeta = computed(() => getOccurrenceTypeMeta(selectedOccurrence.value?.tipo))

function createMarkerIcon(occurrence) {
  const typeMeta = getOccurrenceTypeMeta(occurrence.tipo)
  const markerColor = getOccurrenceStatusColor(occurrence.statusClass)
  const typeBackgroundColor = typeMeta.backgroundColor || '#f59e0b'

  return L.divIcon({
    className: 'occurrence-marker-icon',
    html: `
      <span class="occurrence-marker-pin" style="--marker-color: ${markerColor}">
        <span class="occurrence-marker-content">
          <span class="occurrence-marker-badge" style="--type-color: ${typeBackgroundColor}">
            <img src="${typeMeta.icon}" alt="${typeMeta.label}" class="occurrence-marker-symbol" />
          </span>
        </span>
      </span>
    `,
    iconSize: [34, 48],
    iconAnchor: [17, 48],
    popupAnchor: [0, -42],
  })
}

async function geocodeLocation(locationValue) {
  const query = String(locationValue || '').trim()
  if (!query) return null

  if (geocodeCache.has(query)) {
    return geocodeCache.get(query)
  }

  const endpoint = new URL('https://nominatim.openstreetmap.org/search')
  endpoint.searchParams.set('format', 'jsonv2')
  endpoint.searchParams.set('limit', '1')
  endpoint.searchParams.set('countrycodes', 'pt')
  endpoint.searchParams.set('q', query)

  try {
    const response = await fetch(endpoint.toString(), {
      headers: {
        Accept: 'application/json',
        'Accept-Language': 'pt-PT,pt;q=0.9,en;q=0.7',
      },
    })

    if (!response.ok) {
      throw new Error('Nominatim request failed')
    }

    const result = await response.json()
    const firstResult = Array.isArray(result) ? result[0] : null

    if (!firstResult) {
      geocodeCache.set(query, null)
      return null
    }

    const resolved = {
      latitude: Number(firstResult.lat),
      longitude: Number(firstResult.lon),
      displayName: firstResult.display_name,
    }

    geocodeCache.set(query, resolved)
    return resolved
  } catch {
    geocodeCache.set(query, null)
    return null
  }
}

async function enrichOccurrence(occurrence) {
  const locationQuery = occurrence.location || occurrence.tipo || occurrence.detalhes
  const geocoded = await geocodeLocation(locationQuery)

  if (geocoded) {
    return {
      ...occurrence,
      latitude: geocoded.latitude,
      longitude: geocoded.longitude,
      location: occurrence.location || geocoded.displayName,
    }
  }

  return {
    ...occurrence,
    ...resolveOccurrenceCoordinates(occurrence),
  }
}

function fitMarkers() {
  if (!mapInstance || !markerLayer) return

  const markerBounds = []
  ocorrencias.value.forEach((occurrence) => {
    if (occurrence.latitude == null || occurrence.longitude == null) return
    markerBounds.push([occurrence.latitude, occurrence.longitude])
  })

  if (markerBounds.length === 0) {
    mapInstance.setView(mapCenter, 14)
    return
  }

  if (markerBounds.length === 1) {
    mapInstance.setView(markerBounds[0], 16)
    return
  }

  mapInstance.fitBounds(markerBounds, { padding: [40, 40] })
}

function renderMarkers() {
  if (!mapInstance || !markerLayer) return

  markerLayer.clearLayers()

  ocorrencias.value.forEach((occurrence) => {
    if (occurrence.latitude == null || occurrence.longitude == null) return

    const marker = L.marker([occurrence.latitude, occurrence.longitude], {
      icon: createMarkerIcon(occurrence),
      riseOnHover: true,
    })

    marker.bindPopup(`
      <strong>${occurrence.nome}</strong><br />
      ${occurrence.situacao}
    `)

    marker.on('click', () => {
      selectOccurrence(occurrence)
    })

    marker.addTo(markerLayer)
  })

  // Se houver uma ocorrência selecionada, vamos centrar nela em vez de fazer fitBounds em todas
  if (selectedOccurrence.value && selectedOccurrence.value.latitude && selectedOccurrence.value.longitude) {
    mapInstance.setView([selectedOccurrence.value.latitude, selectedOccurrence.value.longitude], 16)
  } else {
    fitMarkers()
  }
}

function initializeMap() {
  if (mapInstance || !mapElement.value) return

  mapInstance = L.map(mapElement.value, {
    zoomControl: true,
    scrollWheelZoom: true,
  }).setView(mapCenter, 14)

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors',
  }).addTo(mapInstance)

  markerLayer = L.layerGroup().addTo(mapInstance)
  renderMarkers()
}

function destroyMap() {
  if (markerLayer) {
    markerLayer.clearLayers()
    markerLayer = null
  }

  if (mapInstance) {
    mapInstance.remove()
    mapInstance = null
  }
}

async function loadOccurrences() {
  const role = getAuthUserType() || ''
  let data = []

  try {
    if (/^trabalhador/.test(String(role)) || role === 'trabalhador') {
      // Logic for workers (assuming they still want specific filtering or access)
      try {
        const all = await listAllOccurrences()
        data = (all || []).filter((o) => {
          const situRaw = String(o.situacao || o.estado || '')
          const situ = situRaw.toLowerCase()
          const status = String(o.statusClass || '').toLowerCase()
          const waitingByText =
            (situ.includes('espera') && situ.includes('equip')) ||
            /a\s*espera\s*(da|de)?\s*equip/i.test(situRaw)
          const waitingByStatus = status.includes('espera')
          return waitingByText || waitingByStatus
        })
        fetchInfo.value.allCount = Array.isArray(all) ? all.length : 0
      } catch (e) {
        console.error('listAllOccurrences failed:', e)
        const byState = await listOccurrencesByState('À espera da equipa')
        data = byState || []
      }
    } else {
      // Guests and Citizens
      data = await listOccurrences()
    }
  } catch (error) {
    console.error('Error loading occurrences:', error)
    ocorrenciasError.value = `Erro ao carregar ocorrências: ${error.message || error}`
    data = []
  }

  const enrichedOccurrences = await Promise.all(
    data.map((occurrence) => enrichOccurrence(occurrence)),
  )

  ocorrencias.value = enrichedOccurrences

  if (route.query.id) {
    const found = enrichedOccurrences.find((o) => String(o.id) === String(route.query.id))
    if (found) {
      selectedOccurrence.value = found
    }
  } else if (selectedOccurrence.value) {
    selectedOccurrence.value =
      enrichedOccurrences.find((occurrence) => occurrence.id === selectedOccurrence.value.id) ||
      null
  }

  renderMarkers()
}

function selectOccurrence(marker) {
  selectedOccurrence.value = marker
}

watch(viewMode, async (mode) => {
  if (mode === 'mapa') {
    await nextTick()
    initializeMap()
    mapInstance?.invalidateSize()
    renderMarkers()
  } else {
    destroyMap()
  }
})

function handleDocClick(e) {
  if (
    showNotif.value &&
    notifPanel.value &&
    !notifPanel.value.contains(e.target) &&
    !notifIcon.value.contains(e.target)
  ) {
    showNotif.value = false
  }
  if (
    showMenu.value &&
    menuPanel.value &&
    !menuPanel.value.contains(e.target) &&
    !menuIcon.value.contains(e.target)
  ) {
    showMenu.value = false
  }
}

onMounted(async () => {
  document.addEventListener('click', handleDocClick)

  if (route.query.mode === 'mapa') {
    viewMode.value = 'mapa'
  }

  await loadOccurrences()

  if (viewMode.value === 'mapa') {
    await nextTick()
    initializeMap()
    mapInstance?.invalidateSize()
  }
})
onBeforeUnmount(() => {
  document.removeEventListener('click', handleDocClick)
  destroyMap()
})
</script>

<style scoped>
.page-container {
  font-family: Arial, sans-serif;
  color: #1a1a1a;
}

/* NAVBAR (Styles da Home) */
.navbar {
  display: flex;
  justify-content: space-between;
  padding: 20px 80px;
  align-items: center;
  background: white;
}
.logo-img {
  height: 40px;
}
.nav-icons {
  display: flex;
  gap: 20px;
  align-items: center;
  position: relative;
  cursor: pointer;
}
.icon.add {
  background: #730000;
  color: white;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  text-decoration: none;
  font-weight: 700;
}
.icon.notification {
  width: 28px;
  height: 28px;
  object-fit: contain;
}

/* MENU & NOTIFICAÇÕES */
.hamburger-menu,
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
.hamburger-menu {
  width: 200px;
}
.menu-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: flex-end;
}
.menu-item {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  text-decoration: none;
  color: #0b2b2b;
  font-weight: 700;
  padding: 8px;
  width: 100%;
}
.menu-label {
  font-size: 13px;
}
.menu-icon {
  width: 14px;
  height: 14px;
}
.notif-item {
  background: #dff3ec;
  padding: 12px;
  border-radius: 8px;
  cursor: pointer;
  margin-bottom: 8px;
}
.notif-title {
  font-weight: 700;
}

/* CONTEÚDO ESPECÍFICO */
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
.icon-main-bg {
  background: #730000;
  padding: 10px;
  border-radius: 8px;
}
.icon-main-img {
  width: 30px;
  height: 30px;
  filter: brightness(0) invert(1);
}
.title-header h1 {
  font-size: 32px;
  font-weight: 800;
}

.view-toggle {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 30px;
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
  padding: 6px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: bold;
  transition: 0.3s;
}
.toggle-btn.active {
  background: #3b82f6;
  color: white;
}

/* TABELA */
.occ-table {
  width: 100%;
  border-collapse: collapse;
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
  width: 30px;
  height: 30px;
  cursor: pointer;
}

/* MAPA */
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
  height: 100%;
}
.map-leaflet {
  width: 100%;
  height: 100%;
}
.map-leaflet :deep(.leaflet-container) {
  width: 100%;
  height: 100%;
  font-family: inherit;
}
.map-leaflet :deep(.leaflet-div-icon.occurrence-marker-icon) {
  background: transparent;
  border: none;
}
.map-leaflet :deep(.occurrence-marker-pin) {
  width: 30px;
  height: 30px;
  margin-top: 5px;
  background: var(--marker-color, #dc2626);
  border-radius: 50% 50% 50% 0;
  transform: rotate(-45deg);
  box-shadow: 0 10px 18px rgba(0, 0, 0, 0.24);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}
.map-leaflet :deep(.occurrence-marker-content) {
  transform: rotate(45deg);
  position: relative;
  z-index: 1;
}
.map-leaflet :deep(.occurrence-marker-badge) {
  width: 18px;
  height: 18px;
  border-radius: 999px;
  background: var(--type-color, #f59e0b);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.12);
}
.map-leaflet :deep(.occurrence-marker-symbol) {
  width: 14px;
  height: 14px;
  object-fit: contain;
  display: block;
}
.icon-type {
  width: 40px;
  height: 40px;
  object-fit: contain;
  padding: 6px;
  border-radius: 8px;
  background: #facc15;
}
.map-info-card {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 15px;
  padding: 25px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  font-family: 'Montserrat', sans-serif;
  font-weight: 400;
  line-height: 1.6;
}
.map-info-card.empty {
  display: flex;
  flex-direction: column;
  justify-content: center;
  color: #64748b;
}
.card-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 22px;
}
.map-info-card p {
  margin: 0 0 18px;
  font-weight: 400;
}
.map-info-card strong {
  display: inline-block;
  margin-bottom: 6px;
  font-weight: 700;
}
.icon-yellow {
  background: #facc15;
  padding: 8px;
  border-radius: 8px;
}
.user-chip {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 5px;
}
.reported-by {
  margin-top: 8px;
}
.reported-by strong {
  margin-bottom: 10px;
}
.avatar-xs {
  width: 28px;
  height: 28px;
  border-radius: 50%;
}

/* STATUS BADGES */
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
</style>
