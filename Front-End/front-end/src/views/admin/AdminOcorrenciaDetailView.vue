<template>
  <div class="page-container">
    <nav class="navbar">
      <div class="logo-area">
        <router-link to="/admin/perfil">
          <img src="@/assets/logoP.png" alt="VC Comunica Logo" class="logo-img" />
        </router-link>
      </div>
      <div class="nav-right">
        <span class="admin-label">Admin</span>
        <!-- <img
          :src="notifications.length === 0 ? notifOff : notifOn"
          alt="notifications"
          class="icon notification"
          @click="toggleNotif"
          ref="notifIcon"
        /> -->
        <span class="icon menu-trigger" @click="toggleMenu">☰</span>

        <AdminSidebarMenu v-model="showMenu" />

        <!-- <div v-if="showNotif" class="notifications" ref="notifPanel">
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
        </div> -->
      </div>
    </nav>

    <main class="content-wrapper">
      <div v-if="loadError" class="load-error">{{ loadError }}</div>
      <div v-else-if="isLoading" class="load-state"></div>
      <template v-else>
        <div class="breadcrumb-header">
          <div class="icon-main-bg">
            <img src="@/assets/ocorrencias.png" alt="Ocorrências" class="icon-main-img" />
          </div>
          <h1>
            Ocorrências <span class="breadcrumb-sep">&gt;</span>
            <span class="breadcrumb-current">{{ occurrence?.tipo || 'Detalhe' }}</span>
          </h1>
        </div>

        <div class="alert-banner">
          <div class="alert-content">
            <div class="alert-left">
              <div class="alert-title-row">
                <img src="@/assets/warning_icon.svg" alt="alerta" class="alert-icon" />
                <strong>{{ occurrence?.situacao || 'Ocorrência' }}</strong>
              </div>
              <div class="alert-body">
                <p><strong>Descrição:</strong></p>
                <p>{{ occurrence?.detalhes || 'Sem descrição disponível.' }}</p>
                <div class="alert-actions">
                  <strong>Ações:</strong>
                  <div class="alert-buttons">
                    <button class="btn-action dark">Fechar Ocorrência</button>
                    <button class="btn-action dark">Contactar Cidadão</button>
                  </div>
                </div>
              </div>
            </div>
            <div class="alert-right">
              <p><strong>Reportado por:</strong> {{ citizen?.nome || occurrence?.nome || '-' }}</p>
              <p><strong>Data:</strong> {{ formattedOccurrenceDate }}</p>
              <p><strong>Hora:</strong> {{ formattedOccurrenceTime }}</p>
            </div>
          </div>
        </div>

        <div class="main-details-grid">
          <section class="image-gallery">
            <div class="main-image-container">
              <img :src="activeImage" class="featured-image" />
              <div class="gallery-nav">
                <button :disabled="gallery.length <= 1" @click="prevImg">‹</button>
                <div class="thumbnails">
                  <img
                    v-for="(img, index) in gallery"
                    :key="`${img}-${index}`"
                    :src="img"
                    :class="{ active: activeImageIndex === index }"
                    @click="activeImageIndex = index"
                  />
                </div>
                <button :disabled="gallery.length <= 1" @click="nextImg">›</button>
              </div>
            </div>
          </section>

          <section class="info-sidebar">
            <div class="category-header">
              <span class="icon-yellow">{{ categoryIcon }}</span>
              <h3>{{ occurrence?.tipo || 'Ocorrência' }}</h3>
            </div>

            <div class="info-group">
              <p>
                <strong>Status:</strong>
                <span :class="['status-badge', occurrence?.statusClass || 'em-resolucao']">
                  {{ occurrence?.situacao || 'Sem estado' }}
                </span>
              </p>
              <p>
                <strong>Localização:</strong><br />
                {{ occurrence?.location || occurrence?.detalhes || 'Sem localização disponível.' }}<br />
                <button @click="viewOnMap" class="map-link-btn">
                 Ver no mapa
                </button>
              </p>
              <p>
                <strong>Descrição:</strong><br />
                {{ occurrence?.detalhes || 'Sem descrição disponível.' }}
              </p>
              <p v-if="assignedTeamName"><strong>Equipa:</strong><br />{{ assignedTeamName }}</p>
            </div>
          </section>
        </div>

        <section class="cidadao-section">
          <h2>Informação Cidadão:</h2>
          <div class="cidadao-card">
            <img :src="citizenAvatar" alt="Cidadão" class="cidadao-avatar" />
            <div class="cidadao-details">
              <h3>{{ citizen?.nome || occurrence?.nome || 'Cidadão' }}</h3>
              <div class="cidadao-grid">
                <div>
                  <p><strong>Nº Telemóvel:</strong> {{ citizen?.nrTelemovel || '-' }}</p>
                  <p><strong>Freguesia:</strong> {{ municipalityName }}</p>
                </div>
                <div>
                  <p><strong>Email:</strong> {{ citizen?.email || '-' }}</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </template>
    </main>

    <Footer :columns="adminFooterColumns" :logo-src="adminFooterLogo" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Footer from '@/components/footer.vue'
import AdminSidebarMenu from '@/components/AdminSidebarMenu.vue'
/* import notifOn from '@/assets/notificationson.png'
import notifOff from '@/assets/notificationsoff.png' */
import adminFooterLogo from '@/assets/logo_footer.png'
import avatarImg from '@/assets/avatar.png'
import { API_BASE_URL } from '@/services/municipalityService'
import { getOccurrence } from '@/services/occurrenceService'

const route = useRoute()
const router = useRouter()

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
const isLoading = ref(true)
const loadError = ref('')
const occurrence = ref(null)
const citizen = ref(null)
const municipalityName = ref('Sem freguesia')
const assignedTeamName = ref('')
const gallery = ref([])
const activeImageIndex = ref(0)

/* const notifications = ref([])
 */
function viewOnMap() {
  if (!occurrence.value) return
  router.push({
    path: '/ocorrencias',
    query: {
      id: occurrence.value.id,
      mode: 'mapa'
    }
  })
}

/* const toggleNotif = (e) => {
  e.stopPropagation()
  showNotif.value = !showNotif.value
  showMenu.value = false
} */
const toggleMenu = (e) => {
  e.stopPropagation()
  showMenu.value = !showMenu.value
  showNotif.value = false
}
/* const removeNotif = (i) => notifications.value.splice(i, 1) */

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

onMounted(() => document.addEventListener('click', handleDocClick))
onBeforeUnmount(() => document.removeEventListener('click', handleDocClick))

const activeImage = computed(() => gallery.value[activeImageIndex.value] || avatarImg)
const citizenAvatar = computed(() => citizen.value?.fotoPerfil || avatarImg)

const categoryIcon = computed(() => {
  const type = String(occurrence.value?.tipo || '').toLowerCase()
  if (type.includes('ilum')) return '💡'
  if (type.includes('via') || type.includes('estrada')) return '🛣'
  if (type.includes('verde')) return '🌳'
  if (type.includes('hig')) return '🧹'
  return '📍'
})

const formattedOccurrenceDate = computed(() => {
  const value = occurrence.value?.dataOcorrencia
  if (!value) return '-'
  return new Date(value).toLocaleDateString('pt-PT')
})

const formattedOccurrenceTime = computed(() => {
  const value = occurrence.value?.dataOcorrencia
  if (!value) return '-'
  return new Date(value).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })
})

const nextImg = () => {
  if (!gallery.value.length) return
  activeImageIndex.value = (activeImageIndex.value + 1) % gallery.value.length
}
const prevImg = () => {
  if (!gallery.value.length) return
  activeImageIndex.value =
    (activeImageIndex.value - 1 + gallery.value.length) % gallery.value.length
}

const fetchJson = async (path) => {
  const response = await fetch(`${API_BASE_URL}${path}`)
  if (!response.ok) {
    throw new Error(`Falha ao carregar ${path}`)
  }

  return response.json()
}

async function loadDetail() {
  isLoading.value = true
  loadError.value = ''

  try {
    const occurrenceId = route.params.id
    if (!occurrenceId) {
      throw new Error('Ocorrência inválida.')
    }

    const loadedOccurrence = await getOccurrence(occurrenceId)
    occurrence.value = loadedOccurrence

    const nextGallery =
      Array.isArray(loadedOccurrence?.photos) && loadedOccurrence.photos.length
        ? loadedOccurrence.photos
            .map((photo) => (typeof photo === 'string' ? photo : photo.url || photo.secure_url))
            .filter(Boolean)
        : loadedOccurrence?.image
          ? [loadedOccurrence.image]
          : []
    gallery.value = nextGallery.length ? nextGallery : [avatarImg]
    activeImageIndex.value = 0

    const relatedRequests = []
    if (loadedOccurrence?.idCidadao != null) {
      relatedRequests.push(fetchJson(`/cidadaos/${loadedOccurrence.idCidadao}`))
    }
    if (loadedOccurrence?.idFreguesia != null) {
      relatedRequests.push(fetchJson(`/municipios/${loadedOccurrence.idFreguesia}`))
    }
    if (loadedOccurrence?.idEquipa != null) {
      relatedRequests.push(fetchJson(`/equipas/${loadedOccurrence.idEquipa}`))
    }

    const [loadedCitizen, loadedMunicipality, loadedTeam] = await Promise.all(relatedRequests)
    citizen.value = loadedCitizen || null
    municipalityName.value = loadedMunicipality?.nome || 'Sem freguesia'
    assignedTeamName.value = loadedTeam?.especializacao || loadedTeam?.name || ''
  } catch (error) {
    loadError.value = error?.message || 'Não foi possível carregar os detalhes da ocorrência.'
  } finally {
    isLoading.value = false
  }
}

watch(() => route.params.id, loadDetail, { immediate: true })
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

/* CONTENT */
.content-wrapper {
  max-width: 1100px;
  margin: 40px auto;
  padding: 0 20px;
}

.load-state,
.load-error {
  margin: 12px 0 24px;
  padding: 14px 16px;
  border-radius: 12px;
  font-weight: 600;
}

.load-state {
  background: #eff6ff;
  color: #1d4ed8;
}

.load-error {
  background: #fef2f2;
  color: #b91c1c;
  border: 1px solid #fecaca;
}

/* BREADCRUMB */
.breadcrumb-header {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 30px;
}
.breadcrumb-header h1 {
  font-size: 28px;
  font-weight: 800;
  margin: 0;
}
.breadcrumb-sep {
  color: #1a1a1a;
  margin: 0 4px;
}
.breadcrumb-current {
  color: #64748b;
  font-weight: 600;
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

/* ALERT BANNER */
.alert-banner {
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 15px;
  padding: 25px;
  margin-bottom: 40px;
}
.alert-content {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 30px;
}
.alert-title-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}
.alert-icon {
  background: #730000;
  padding: 8px;
  border-radius: 6px;
  font-size: 16px;
}
.alert-title-row strong {
  font-size: 18px;
}
.alert-body p {
  margin: 0 0 8px 0;
  font-size: 14px;
  color: #475569;
  line-height: 1.6;
}
.alert-actions {
  margin-top: 12px;
}
.alert-actions strong {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
}
.alert-buttons {
  display: flex;
  gap: 10px;
}
.btn-action {
  border: none;
  padding: 8px 18px;
  border-radius: 8px;
  font-weight: 700;
  font-size: 13px;
  cursor: pointer;
  transition: opacity 0.15s;
}
.btn-action.dark {
  background: #1e293b;
  color: #fff;
}
.btn-action:hover {
  opacity: 0.85;
}
.alert-right {
  min-width: 180px;
}
.alert-right p {
  margin: 0 0 6px 0;
  font-size: 14px;
  color: #475569;
}

/* MAIN DETAILS GRID */
.main-details-grid {
  display: grid;
  grid-template-columns: 1.2fr 0.8fr;
  gap: 40px;
  margin-bottom: 50px;
}
.featured-image {
  width: 100%;
  border-radius: 15px;
  height: 380px;
  object-fit: cover;
  background: #111;
}
.gallery-nav {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
  margin-top: 15px;
}
.gallery-nav button {
  background: #fff;
  border: 1px solid #e6e6e6;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  font-size: 20px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s;
}
.gallery-nav button:hover {
  background: #f3f4f6;
}
.thumbnails img {
  width: 60px;
  height: 45px;
  border-radius: 6px;
  cursor: pointer;
  opacity: 0.5;
  transition: opacity 0.15s;
}
.thumbnails img.active {
  opacity: 1;
  border: 2px solid #730000;
}

/* INFO SIDEBAR */
.info-sidebar {
  background: white;
  border: 1px solid #f1f5f9;
  border-radius: 20px;
  padding: 30px;
}
.category-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
}
.category-header h3 {
  font-size: 20px;
  font-weight: 700;
  margin: 0;
}
.icon-yellow {
  background: #facc15;
  padding: 8px;
  border-radius: 8px;
}
.info-group p {
  margin: 0 0 15px 0;
  font-size: 14px;
  line-height: 1.6;
  color: #475569;
}
.status-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-weight: 700;
  font-size: 13px;
}

.map-link-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  color: #334155;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  margin-top: 8px;
  transition: all 0.2s;
}
.map-link-btn:hover {
  background: #e2e8f0;
  color: #0f172a;
}

.em-resolucao {
  background: #fef9c3;
  color: #ca8a04;
}
.edit-icon {
  width: 18px;
  height: 18px;
  margin-left: 8px;
  cursor: pointer;
}

/* CIDADÃO SECTION */
.cidadao-section {
  border-top: 1px solid #f1f5f9;
  padding-top: 30px;
  margin-bottom: 40px;
}
.cidadao-section h2 {
  font-size: 22px;
  font-weight: 800;
  margin: 0 0 25px 0;
}
.cidadao-card {
  display: flex;
  align-items: flex-start;
  gap: 25px;
}
.cidadao-avatar {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  object-fit: cover;
}
.cidadao-details h3 {
  font-size: 18px;
  font-weight: 800;
  margin: 0 0 12px 0;
}
.cidadao-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px 60px;
}
.cidadao-grid p {
  margin: 0 0 8px 0;
  font-size: 14px;
  color: #475569;
}

/* FOOTER */
.main-footer {
  padding: 60px 80px;
  background-color: #f5f1e9;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-top: 60px;
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
  .main-footer {
    padding: 20px;
  }
  .main-details-grid {
    grid-template-columns: 1fr;
  }
  .alert-content {
    grid-template-columns: 1fr;
  }
  .cidadao-grid {
    grid-template-columns: 1fr;
  }
}
</style>
