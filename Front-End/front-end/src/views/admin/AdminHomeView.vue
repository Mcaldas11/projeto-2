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
      <!-- Ocorrências Section -->
      <div class="title-header">
        <div class="icon-main-bg">
          <img src="@/assets/ocorrencias.png" alt="Ocorrências" class="icon-main-img" />
        </div>
        <div
          style="
            display: flex;
            align-items: center;
            gap: 20px;
            justify-content: space-between;
            width: 100%;
          "
        >
          <h1>Ocorrências</h1>
          <div class="filter-select">
            <label>Freguesia</label>
            <select v-model="selectedFreguesia">
              <option value="Todas">Todas</option>
              <option v-for="f in freguesias" :key="f" :value="f">{{ f }}</option>
            </select>
          </div>
        </div>
      </div>

      <div class="table-container">
        <table class="occ-table">
          <thead>
            <tr>
              <th>Nome</th>
              <th class="sortable" @click="toggleSort">
                Situação 
              </th>
              <th>
                Tipo de Problema
              </th>
              <th>Detalhes</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="occ in paginatedOcorrencias"
              :key="occ.id"
              :class="{ 'row-highlight-red': occ.statusClass === 'nao-resolvido' }"
            >
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
                <router-link :to="`/admin/ocorrencia/${occ.id}`" class="details-link-btn">
                  Ver detalhes
                </router-link>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="pagination" v-if="totalPages > 1">
        <button class="page-btn nav-btn" :disabled="currentPage === 1" @click="goToPreviousPage">
          ← Previous
        </button>

        <div class="page-numbers">
          <button
            v-for="page in visiblePages"
            :key="page"
            class="page-btn"
            :class="{ active: page === currentPage }"
            @click="goToPage(page)"
          >
            {{ page }}
          </button>
        </div>

        <button class="page-btn nav-btn" :disabled="currentPage === totalPages" @click="goToNextPage">
          Next →
        </button>
      </div>

      <!-- Rotas Section -->
      <section class="rotas-section">
        <h2 class="section-title">Rotas</h2>
        <div class="rotas-grid">
          <div class="map-container">
            <div class="map-placeholder">
              <div ref="mapElement" class="map-leaflet"></div>
            </div>
          </div>
          <div class="rotas-legend legend-grid">
            <div
              v-for="t in typesSummary.slice(0, 6)"
              :key="t.key"
              class="legend-item"
              :class="{ selected: selectedTypeFilter === t.key }"
              @click="selectedTypeFilter = selectedTypeFilter === t.key ? null : t.key"
            >
              <div class="legend-bar" :style="{ background: t.color }"></div>
              <div class="legend-text">
                <strong>{{ t.label }}</strong>
                <span>{{ t.count }} ocorrências</span>
              </div>
            </div>
            <router-link to="/admin/rotas" class="btn-ver-mais">Ver mais</router-link>
          </div>
        </div>
      </section>
    </main>

    <Footer :columns="adminFooterColumns" :logo-src="adminFooterLogo" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { listRoutesWithGeometry } from '@/services/routeService'
import { listOccurrences, listOccurrenceMarkers } from '@/services/occurrenceService'
import { normalizeTypeKey, getOccurrenceTypeMeta } from '@/utils/occurrenceTypes'
import { listFreguesias } from '@/services/municipalityService'
import Footer from '@/components/footer.vue'
import AdminSidebarMenu from '@/components/AdminSidebarMenu.vue'
import adminFooterLogo from '@/assets/logo_footer.png'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const mapCenter = [41.36405, -8.73894]
let mapInstance = null
let routeLayer = null
let occurrenceLayer = null
const mapElement = ref(null)

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


const freguesias = ref([])
const freguesiaLabelById = ref(new Map())
const occurrenceMarkers = ref([])
const typesSummary = ref([])
const selectedTypeFilter = ref(null)
const typeColorByKey = ref(new Map())


const toggleMenu = (e) => {
  e.stopPropagation()
  showMenu.value = !showMenu.value
  showNotif.value = false
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

// ─── Pin icon (igual ao AdminRotasView) ───────────────────────────────────────
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

onMounted(() => {
  document.addEventListener('click', handleDocClick)

  const el = mapElement.value || document.querySelector('.map-leaflet')
  if (el) {
    mapInstance = L.map(el).setView(mapCenter, 13)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(mapInstance)

    routeLayer = L.layerGroup().addTo(mapInstance)
    occurrenceLayer = L.layerGroup().addTo(mapInstance)
    ;(async () => {
      try {
        const routes = await listRoutesWithGeometry()
        if (routes && routes.length) {
          routeLayer.clearLayers()
          const allBounds = []
          routes.forEach((r) => {
            if (!r.geometry || !r.geometry.coordinates) return
            const coords = r.geometry.coordinates.map((c) => [c[1], c[0]])
            const poly = L.polyline(coords, {
              color: r.color || '#3388ff',
              weight: 5,
              opacity: 0.9,
            })
            poly.addTo(routeLayer)
            allBounds.push(...coords)
          })
          if (allBounds.length) mapInstance.fitBounds(allBounds, { padding: [40, 40] })
        }
      } catch {
        // fallback: leave empty map
      }
    })()
  }
})

// ─── Occurrence markers ───────────────────────────────────────────────────────
async function loadOccurrenceMarkers() {
  try {
    const markers = await listOccurrenceMarkers()
    occurrenceMarkers.value = Array.isArray(markers) ? markers : []
    buildTypesSummary()
    drawOccurrenceMarkers()
  } catch {
    occurrenceMarkers.value = []
  }
}

function colorForType(key) {
  const palette = ['#730000', '#8b5cf6', '#f59e0b', '#22c55e', '#06b6d4', '#fb7185', '#a3e635']
  let h = 0
  for (let i = 0; i < key.length; i++) h = (h << 5) - h + key.charCodeAt(i)
  return palette[Math.abs(h) % palette.length]
}

function buildTypesSummary() {
  const map = new Map()
  occurrenceMarkers.value.forEach((m) => {
    const rawKey = m.typeKey != null ? String(m.typeKey) : null
    const rawLabel = m.tipo != null ? String(m.tipo) : rawKey || 'outro'
    const key = String(rawKey || rawLabel).trim()
    const label = rawLabel.trim()
    if (!map.has(key)) map.set(key, { key, label, count: 0, color: colorForType(key) })
    map.get(key).count += 1
  })

  const arr = Array.from(map.values()).sort((a, b) => b.count - a.count)

  const palette = ['#06b6d4', '#7c3aed', '#ef4444', '#f59e0b', '#10b981', '#ef76b2']
  arr.forEach((t, i) => {
    t.color = palette[i % palette.length]
  })

  const colorMap = new Map()
  arr.forEach((t) => colorMap.set(String(t.key), t.color))
  typeColorByKey.value = colorMap
  typesSummary.value = arr
}

function drawOccurrenceMarkers() {
  if (!mapInstance || !occurrenceLayer) return
  occurrenceLayer.clearLayers()
  const bounds = []

  // Agrupar ocorrências por coordenadas exatas
  const grouped = new Map()
  occurrenceMarkers.value.forEach((m) => {
    if (m.latitude == null || m.longitude == null) return
    const key = `${Number(m.latitude).toFixed(6)},${Number(m.longitude).toFixed(6)}`
    if (!grouped.has(key)) grouped.set(key, [])
    grouped.get(key).push(m)
  })

  grouped.forEach((occs, coords) => {
    const [lat, lng] = coords.split(',').map(Number)
    const count = occs.length
    
    // Usamos os dados da primeira ocorrência para o ícone, ou um ícone genérico se forem várias
    const first = occs[0]
    const rawKey = first.typeKey != null ? String(first.typeKey) : null
    const rawLabel = first.tipo != null ? String(first.tipo) : rawKey || 'outro'
    const typeKey = String(rawKey || rawLabel).trim()
    
    // Se houver filtro de tipo e nenhuma ocorrência do grupo corresponder, ignoramos
    if (selectedTypeFilter.value) {
      const hasMatch = occs.some(o => {
        const oKey = String(o.typeKey || o.tipo || 'outro').trim()
        return oKey === selectedTypeFilter.value
      })
      if (!hasMatch) return
    }

    const color = typeColorByKey.value.get(typeKey) || colorForType(typeKey)
    const meta = getOccurrenceTypeMeta(first.tipo || typeKey)
    
    // Se houver mais de uma, adicionamos um badge com o número
    const pinIcon = createPinIconWithCount(color, meta.icon, count)

    const marker = L.marker([lat, lng], { icon: pinIcon })
    
    let popupContent = `<div style="min-width:160px; max-height: 200px; overflow-y: auto;">`
    if (count > 1) {
      popupContent += `<strong style="color: #730000; font-size: 14px;">${count} Ocorrências neste local</strong><hr style="margin: 8px 0; border: 0; border-top: 1px solid #eee;"/>`
    }
    
    occs.forEach((o, idx) => {
      popupContent += `
        <div style="margin-bottom: ${idx === occs.length - 1 ? '0' : '10px'};">
          <strong style="font-size:13px;">${o.tipo || ''}</strong><br/>
          <span style="font-size:12px; color: #64748b;">${o.detalhes || ''}</span>
        </div>
      `
    })
    popupContent += `</div>`

    marker.bindPopup(popupContent)
    marker.addTo(occurrenceLayer)
    bounds.push([lat, lng])
  })

  if (bounds.length) {
    mapInstance.fitBounds(bounds, { padding: [30, 30] })
  }
}

function createPinIconWithCount(color, iconUrl, count) {
  const img = iconUrl
    ? `<img src="${iconUrl}" style="width:16px;height:16px;object-fit:contain;filter:brightness(0) invert(1);margin-bottom:2px;" />`
    : ''
  
  const badge = count > 1 
    ? `<div style="
        position: absolute;
        top: -10px;
        right: -10px;
        background: #730000;
        color: white;
        border-radius: 10px;
        padding: 2px 6px;
        font-size: 11px;
        font-weight: bold;
        border: 2px solid white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        transform: rotate(45deg);
      ">${count}</div>` 
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
        position: relative;
      ">
        <div style="transform:rotate(45deg);display:flex;align-items:center;justify-content:center;">
          ${img}
        </div>
        ${badge}
      </div>
    `,
  })
}

onBeforeUnmount(() => {
  document.removeEventListener('click', handleDocClick)
  if (mapInstance) {
    mapInstance.remove()
    mapInstance = null
  }
})

// ─── Tabela de ocorrências ────────────────────────────────────────────────────
const allOcorrencias = ref([])
const currentPage = ref(1)
const perPage = 5
const selectedFreguesia = ref('Todas')

const filteredOcorrencias = computed(() => {
  if (!selectedFreguesia.value || selectedFreguesia.value === 'Todas') return allOcorrencias.value
  return allOcorrencias.value.filter((o) => o.freguesia === selectedFreguesia.value)
})

const paginatedOcorrencias = computed(() => {
  const start = (currentPage.value - 1) * perPage
  return filteredOcorrencias.value.slice(start, start + perPage)
})

const totalPages = computed(() => Math.max(1, Math.ceil(filteredOcorrencias.value.length / perPage)))

const visiblePages = computed(() => {
  const total = totalPages.value
  const current = currentPage.value
  const pages = []

  if (total <= 7) {
    for (let i = 1; i <= total; i++) pages.push(i)
    return pages
  }

  pages.push(1)

  if (current > 4) {
    pages.push('...')
  }

  let start = Math.max(2, current - 2)
  let end = Math.min(total - 1, current + 2)

  if (current <= 4) {
    start = 2
    end = 5
  } else if (current >= total - 3) {
    start = total - 4
    end = total - 1
  }

  for (let i = start; i <= end; i++) {
    pages.push(i)
  }

  if (current < total - 3) {
    pages.push('...')
  }

  pages.push(total)

  return pages
})

function goToPage(page) {
  currentPage.value = page
}

function goToPreviousPage() {
  if (currentPage.value > 1) {
    currentPage.value -= 1
  }
}

function goToNextPage() {
  if (currentPage.value < totalPages.value) {
    currentPage.value += 1
  }
}

const toggleSort = () => {
  allOcorrencias.value.reverse()
}

const normalizeBackendOccurrence = (occurrence) => ({
  id: occurrence.id,
  nome: occurrence.nome,
  freguesia: freguesiaLabelById.value.get(String(occurrence.idFreguesia)) || 'Sem freguesia',
  situacao: occurrence.situacao,
  statusClass: occurrence.statusClass,
  tipo: occurrence.tipo,
  detalhes: occurrence.detalhes,
  userImg: occurrence.userImg,
})

onMounted(async () => {
  try {
    const backendFreguesias = await listFreguesias()
    freguesias.value = backendFreguesias
      .map((freguesia) => freguesia?.nome)
      .filter((nome) => nome && nome !== 'Todas')
    freguesiaLabelById.value = new Map(
      backendFreguesias
        .filter((freguesia) => freguesia?.idFreguesia != null && freguesia?.nome)
        .map((freguesia) => [String(freguesia.idFreguesia), freguesia.nome]),
    )

    const occurrences = await listOccurrences()
    allOcorrencias.value = occurrences.map(normalizeBackendOccurrence)
    await loadOccurrenceMarkers()
  } catch {
    allOcorrencias.value = []
  }
})

watch([selectedFreguesia, selectedTypeFilter], () => {
  drawOccurrenceMarkers()
})

watch(selectedFreguesia, () => {
  currentPage.value = 1
})

watch(filteredOcorrencias, () => {
  if (currentPage.value > totalPages.value) {
    currentPage.value = totalPages.value
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
}
.notif-empty {
  color: #666;
  font-size: 14px;
  text-align: center;
  padding: 12px;
}

.title-filter {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
}
.filter-select {
  display: flex;
  align-items: center;
  gap: 10px;
}
.filter-select select {
  padding: 8px 10px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

/* MAIN CONTENT */
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
  margin: 0;
}

/* TABLE */
.table-container {
  border: 1px solid #f1f5f9;
  border-radius: 15px;
  overflow: hidden;
}
.occ-table {
  width: 100%;
  border-collapse: collapse;
}
.occ-table th {
  text-align: left;
  padding: 15px;
  border-bottom: 1px solid #eee;
  color: #64748b;
  font-size: 14px;
  font-weight: 600;
}
.occ-table td {
  padding: 15px;
  border-bottom: 1px solid #f8fafc;
  font-size: 14px;
}
.sortable {
  cursor: pointer;
  user-select: none;
}
.sort-arrow {
  font-size: 12px;
  margin-left: 4px;
}
.th-icon {
  width: 18px;
  height: 18px;
  object-fit: contain;
  vertical-align: middle;
  margin-left: 6px;
}
.user-cell {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 500;
}
.avatar {
  width: 35px;
  height: 35px;
  border-radius: 50%;
  object-fit: cover;
}
.details-cell {
  color: #64748b;
  max-width: 350px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.info-btn {
  width: 28px;
  height: 28px;
  cursor: pointer;
}
.row-highlight-red {
  border-left: 4px solid #dc2626;
}

/* STATUS BADGES */
.status-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 700;
  white-space: nowrap;
}
.resolvido {
  background: #dff3ec;
  color: #059669;
}
.em-resolucao {
  background: #fef9c3;
  color: #ca8a04;
}
.espera {
  background: #ffedd5;
  color: #ea580c;
}
.nao-resolvido {
  background: #fee2e2;
  color: #dc2626;
}

/* PAGINATION */
.pagination {
  display: flex;
  justify-content: center;
  gap: 12px;
  align-items: center;
  margin-top: 30px;
  padding: 10px 0;
  flex-wrap: wrap;
}
.page-numbers {
  display: flex;
  gap: 4px;
}
.page-btn {
  border: 1px solid #e2e8f0;
  background: #fff;
  padding: 8px 14px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-size: 14px;
  color: #475569;
  transition: all 0.15s;
}
.page-btn:hover:not(:disabled):not(.active) {
  background: #f8fafc;
}
.page-btn.active {
  background: #730000;
  color: #fff;
  border-color: #730000;
}
.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.page-btn.ellipsis {
  border: none;
  cursor: default;
  background: none;
}
.nav-btn {
  display: flex;
  align-items: center;
  gap: 6px;
}


/* Botao detalhes */
.details-link-btn {
  display: inline-block;
  background-color: #b1ffb1;
  color: #0b2b2b;
  padding: 8px 16px;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 700;
  font-size: 0.85rem;
  transition: background-color 0.2s;
}

.details-link-btn:hover {
  background-color: #98fb98;
}


/* ROTAS SECTION */
.rotas-section {
  margin-top: 80px;
}
.section-title {
  font-size: 32px;
  font-weight: 800;
  margin-bottom: 30px;
}
.rotas-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
  align-items: center;
}
.map-placeholder {
  background: #e8ede4;
  border-radius: 20px;
  overflow: hidden;
  aspect-ratio: 4/3;
}
.map-leaflet {
  width: 100%;
  height: 100%;
  min-height: 420px;
}
.rotas-legend {
  display: block;
  gap: 20px;
}
.rotas-legend.legend-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 18px 28px;
  align-items: start;
}
.legend-item {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  padding: 6px 4px;
  border-radius: 8px;
  transition: background 0.12s, transform 0.08s;
}
.legend-item.selected {
  background: rgba(0, 0, 0, 0.03);
  transform: translateX(2px);
}
.legend-bar {
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
.btn-ver-mais {
  display: inline-block;
  background: #22c55e;
  color: #fff;
  padding: 8px 24px;
  border-radius: 20px;
  text-decoration: none;
  font-weight: 700;
  font-size: 14px;
  width: fit-content;
  margin-top: 10px;
  transition: opacity 0.15s;
}
.btn-ver-mais:hover {
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
}
</style>