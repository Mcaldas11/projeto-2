<template>
  <div class="page-container">
    <!-- NAVBAR ALINHADA (SEM BOTÃO LIGADO A OCORRÊNCIAS) -->
    <nav class="navbar">
      <div class="logo-area">
        <img src="@/assets/logoP.png" alt="VC Comunica Logo" class="logo-img" />
      </div>
      <div class="nav-icons">
        <!-- Notificações e Menu Hambúrguer juntos no lado direito -->
        <!-- <img
          :src="notifications.length === 0 ? notifOff : notifOn"
          alt="notifications"
          class="icon notification"
          @click="toggleNotif"
        /> -->
        <span class="icon menu-hamburger" @click="toggleMenu">☰</span>

        <SidebarMenu v-model="showMenu" />

        <!-- <div v-if="showNotif" class="notifications">
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

    <!-- CONTEÚDO PRINCIPAL NO NOVO DESIGN -->
    <main class="content-wrapper">
      <h1 class="page-title">Perfil do Trabalhador</h1>

      <!-- Cabeçalho do Perfil (Estilo Identidade Visual Nova) -->
      <section class="profile-header">
        <div class="user-info">
          <div class="avatar-container clickable" @click="triggerPhotoUpload">
            <img v-if="worker.avatar" :src="worker.avatar" alt="Avatar" class="profile-avatar" />
            <div v-else class="profile-avatar-placeholder">
              {{ worker.nome?.[0] || '' }}{{ worker.apelido?.[0] || '' }}
            </div>
            <div class="avatar-overlay">
              <span class="camera-icon">📷</span>
            </div>
            <input
              type="file"
              ref="photoInput"
              style="display: none"
              accept="image/*"
              @change="handlePhotoChange"
            />
          </div>
          <div class="user-text">
            <h2>{{ worker.nome }} {{ worker.apelido }}</h2>
            <p>{{ worker.email }}</p>
          </div>
        </div>
        <button @click="openEditModal" class="btn-edit">Editar</button>
      </section>

      <!-- Detalhes e Informações Técnicas do Trabalhador -->
      <section class="profile-details">
        <div class="details-grid">
          <div class="detail-field">
            <label>Equipa Designada</label>
            <div class="display-box disabled-box">{{ worker.equipa }}</div>
          </div>

          <div class="detail-field">
            <label>Freguesia de Atuação</label>
            <div class="display-box disabled-box">{{ worker.freguesia }}</div>
          </div>

          <div class="detail-field">
            <label>Média de Avaliações</label>
            <div class="display-box rating-box">⭐ {{ worker.ratingMedia }} / 5.0</div>
          </div>
        </div>
      </section>

      <section class="worker-dashboard-bottom">
        <div class="dashboard-block user-occurrences">
          <h3>Ocorrências aceites em {{ worker.freguesia }}</h3>
          <div class="table-container">
            <table class="occ-table">
              <thead>
                <tr>
                  <th>Situação</th>
                  <th>Tipo de Problema</th>
                  <th>Localização</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="occ in ocorrencias" :key="occ.id">
                  <td>
                    <span :class="['status-badge', occ.statusClass]">{{ occ.status }}</span>
                  </td>
                  <td>{{ occ.tipo }}</td>
                  <td class="details-cell">{{ occ.local }}</td>
                  <td class="actions-cell">
                    <router-link :to="`/ocorrencia/${occ.id}`" class="details-link">
                      Ver detalhes
                    </router-link>
                    <button class="resolve-btn" @click="markAsResolved(occ)">Resolvida</button>
                  </td>
                </tr>
                <tr v-if="ocorrencias.length === 0">
                  <td colspan="4" class="empty-state">Sem ocorrências aceites no momento.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Listagem de Rotas & Agendamentos -->
        <div class="dashboard-block worker-routes">
          <h3>Rotas & Agendamentos Semanais</h3>
          <div class="routes-list-wrapper">
            <div v-for="route in rotas" :key="route.id" class="route-minimal-card">
              <div class="route-info-side">
                <h4>{{ route.nome }}</h4>
                <p>{{ route.descricao }}</p>
              </div>
              <div class="route-date-side">
                <span class="r-date">{{ route.data }}</span>
                <span class="r-time">⏰ {{ route.hora }}</span>
              </div>
            </div>
            <div v-if="rotas.length === 0" class="empty-routes">Nenhuma rota planeada.</div>
          </div>
        </div>
      </section>

      <div class="account-actions-row">
        <button class="btn-logout half-button" @click="showLogoutModal = true">Terminar Sessão</button>
        <button class="btn-delete-account half-button" @click="showDeleteModal = true">Apagar conta</button>
      </div>
    </main>

    <!-- MODAL: EDITAR PERFIL (MATRICULADO NO SEU DESIGN NOVO) -->
    <div v-if="showEditModal" class="modal-overlay" @click.self="showEditModal = false">
      <div class="modal-card">
        <h3>Editar Perfil</h3>
        <div class="modal-form-body">
          <label>Nome:</label>
          <input v-model="editFirstName" class="display-box" />

          <label>Apelido:</label>
          <input v-model="editLastName" class="display-box" />

          <label>Email:</label>
          <input v-model="editEmail" class="display-box" />

          <label>Telemóvel:</label>
          <input v-model="editPhone" class="display-box" />
        </div>
        <div class="modal-actions">
          <button class="modal-btn cancel" @click="showEditModal = false">VOLTAR</button>
          <button class="modal-btn confirm" @click="handleSaveEdit">SALVAR</button>
        </div>
      </div>
    </div>

    <!-- MODAL: TERMINAR SESSÃO -->
    <div v-if="showLogoutModal" class="modal-overlay" @click.self="showLogoutModal = false">
      <div class="modal-card confirmation-card">
        <h3>Terminar Sessão</h3>
        <p>Tens a certeza que queres terminar sessão do painel técnico?</p>
        <div class="modal-actions">
          <button class="modal-btn cancel" @click="showLogoutModal = false">Cancelar</button>
          <button class="modal-btn confirm" @click="handleLogout">Sim, sair</button>
        </div>
      </div>
    </div>

    <!-- MODAL: APAGAR CONTA -->
    <div v-if="showDeleteModal" class="modal-overlay" @click.self="showDeleteModal = false">
      <div class="modal-card confirmation-card">
        <h3>Apagar conta</h3>
        <p>Esta ação elimina a conta e a foto de perfil do Cloudinary. Queres continuar?</p>
        <div class="modal-actions">
          <button class="modal-btn cancel" @click="showDeleteModal = false">Cancelar</button>
          <button class="modal-btn confirm" @click="handleDeleteAccount">Sim, apagar</button>
        </div>
      </div>
    </div>

    <Footer :columns="workerFooterColumns" />
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import Footer from '@/components/footer.vue'
import SidebarMenu from '@/components/SidebarMenu.vue'
// import notifOn from '@/assets/notificationson.png'
// import notifOff from '@/assets/notificationsoff.png'
import avatarImg from '@/assets/avatar.png'
import { getAuthToken, getAuthUserId } from '@/utils/auth'
import { listFreguesias } from '@/services/municipalityService'
import {
  API_BASE_URL,
  listWorkerOccurrencesInResolution,
  listWorkerResolvedOccurrences,
  resolveOccurrence,
} from '@/services/occurrenceService'

const workerFooterColumns = [
  [
    { label: 'Home', to: '/trabalhador' },
    { label: 'Ocorrências', to: '/ocorrencias' },
    { label: 'Perfil', to: '/trabalhador/perfil' },
  ],
]

const router = useRouter()

// Sistema de Notificações e Menu
const showNotif = ref(false)
const showMenu = ref(false)
// const notifications = ref([])

// const toggleNotif = () => {
//   showNotif.value = !showNotif.value
//   showMenu.value = false
// }
const toggleMenu = () => {
  showMenu.value = !showMenu.value
  showNotif.value = false
}
// const removeNotif = (i) => notifications.value.splice(i, 1)

// Estado reativo do Perfil Técnico do Trabalhador
const storedProfile = JSON.parse(localStorage.getItem('userProfile') || 'null')
const worker = ref({
  nome: storedProfile?.firstName || '',
  apelido: storedProfile?.lastName || '',
  email: storedProfile?.email || '',
  equipa: '',
  idEquipa: storedProfile?.idEquipa || null,
  freguesia: '',
  idFreguesia: storedProfile?.idFreguesia || storedProfile?.fregCidadao || null,
  credenciais: '',
  avatar: storedProfile?.fotoPerfil || avatarImg,
  ratingMedia: '',
})

const splitName = (fullName = '') => {
  const parts = String(fullName).trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) {
    return { firstName: '', lastName: '' }
  }

  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(' '),
  }
}

const syncWorkerProfileFromBackend = async () => {
  if (!API_BASE_URL) return

  const token = getAuthToken()
  if (!token) return

  const response = await fetch(`${API_BASE_URL}/trabalhadores/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!response.ok) return

  const profile = await response.json()
  const fullName = profile.nomeTrabalhador || profile.nome || ''
  const { firstName, lastName } = splitName(fullName)

  worker.value.nome = firstName
  worker.value.apelido = lastName
  worker.value.email = profile.emailTrabalhador || profile.email || worker.value.email
  worker.value.avatar = profile.fotoPerfil || worker.value.avatar
  worker.value.idFreguesia = profile.idFreguesia || profile.fregCidadao || worker.value.idFreguesia
  worker.value.idEquipa = profile.idEquipa ?? worker.value.idEquipa

  localStorage.setItem(
    'userProfile',
    JSON.stringify({
      firstName: worker.value.nome,
      lastName: worker.value.apelido,
      email: worker.value.email,
      fotoPerfil: worker.value.avatar,
      idEquipa: worker.value.idEquipa,
      idFreguesia: worker.value.idFreguesia,
      fregCidadao: worker.value.idFreguesia,
    }),
  )
}

const resolveEquipaName = async () => {
  if (!API_BASE_URL) return

  const teamId = worker.value.idEquipa
  if (!teamId) {
    worker.value.equipa = 'Sem equipa'
    return
  }

  try {
    const response = await fetch(`${API_BASE_URL}/equipas`)
    if (!response.ok) return

    const teams = await response.json()
    const match = (Array.isArray(teams) ? teams : []).find(
      (team) => String(team.idEquipa || team.id) === String(teamId),
    )
    worker.value.equipa = match?.especializacao || match?.name || `Equipa ${teamId}`
  } catch {
    // ignore errors, keep existing value
  }
}

const resolveFreguesiaName = async () => {
  try {
    const backendFreguesias = await listFreguesias()
    const fid = worker.value.idFreguesia
    if (!fid) return

    const match = backendFreguesias.find(
      (f) => String(f.idFreguesia) === String(fid) || String(f.id) === String(fid),
    )
    worker.value.freguesia = match ? match.nome : ''
  } catch {
    // ignore errors, keep existing value
  }
}

const photoInput = ref(null)

const triggerPhotoUpload = () => {
  photoInput.value?.click()
}

async function handlePhotoChange(event) {
  const file = event.target.files?.[0]
  if (!file) return

  const trabalhadorId = getAuthUserId()
  const token = getAuthToken()

  if (!API_BASE_URL || !trabalhadorId || !token) {
    alert('Não foi possível atualizar a foto. Erro de autenticação.')
    return
  }

  const formData = new FormData()
  formData.append('file', file)

  try {
    const response = await fetch(`${API_BASE_URL}/trabalhadores/${trabalhadorId}/foto`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || 'Falha ao atualizar foto no servidor.')
    }

    const data = await response.json()
    if (data.success && data.fotoPerfil) {
      worker.value.avatar = data.fotoPerfil
      // Update localStorage
      const profile = JSON.parse(localStorage.getItem('userProfile') || '{}')
      profile.fotoPerfil = data.fotoPerfil
      localStorage.setItem('userProfile', JSON.stringify(profile))
    }
  } catch (error) {
    alert(error.message || 'Não foi possível atualizar a foto.')
  }
}

// Modais de Edição de Dados
const showEditModal = ref(false)
const editFirstName = ref('')
const editLastName = ref('')
const editEmail = ref('')

const openEditModal = () => {
  editFirstName.value = worker.value.nome
  editLastName.value = worker.value.apelido
  editEmail.value = worker.value.email
  showEditModal.value = true
}

async function handleSaveEdit() {
  if (!editFirstName.value.trim() || !editLastName.value.trim()) {
    alert('Nome e apelido não podem ficar vazios.')
    return
  }

  const token = getAuthToken()
  if (!API_BASE_URL || !token) {
    alert('Não foi possível guardar o perfil. Erro de autenticação.')
    return
  }

  try {
    const response = await fetch(`${API_BASE_URL}/trabalhadores/me`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        firstName: editFirstName.value.trim(),
        lastName: editLastName.value.trim(),
        email: editEmail.value.trim(),
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || 'Falha ao guardar perfil no servidor.')
    }

    const updatedProfile = await response.json()
    const { firstName, lastName } = splitName(updatedProfile.nomeTrabalhador)

    worker.value.nome = firstName
    worker.value.apelido = lastName
    worker.value.email = updatedProfile.emailTrabalhador

    localStorage.setItem(
      'userProfile',
      JSON.stringify({
        firstName: worker.value.nome,
        lastName: worker.value.apelido,
        email: worker.value.email,
        fotoPerfil: updatedProfile.fotoPerfil || worker.value.avatar,
        idEquipa: updatedProfile.idEquipa,
        idFreguesia: updatedProfile.idFreguesia,
      }),
    )

    showEditModal.value = false
  } catch (error) {
    alert(error.message || 'Não foi possível guardar o perfil.')
  }
}

// Ocorrências vinculadas à freguesia do funcionário
const ocorrencias = ref([])

// Rotas exclusivas do Trabalhador
const rotas = ref([])

const showDeleteModal = ref(false)

function normalizeOccurrenceRow(occurrence) {
  return {
    id: occurrence.id,
    status: occurrence.situacao || 'Em resolução',
    statusClass: occurrence.statusClass || 'em-resolucao',
    tipo: occurrence.tipo || 'Ocorrência',
    local: occurrence.location || occurrence.detalhes || '-',
  }
}

const loadOccurrencesInResolution = async () => {
  try {
    const data = await listWorkerOccurrencesInResolution()
    ocorrencias.value = data.map(normalizeOccurrenceRow)
  } catch {
    ocorrencias.value = []
  }
}

async function loadTeamAverageRating() {
  try {
    const resolved = await listWorkerResolvedOccurrences()
    const ratings = []
    
    resolved.forEach(occ => {
      if (occ.mensagens && occ.mensagens.length > 0) {
        occ.mensagens.forEach(msg => {
          if (msg.classificacao != null) {
            ratings.push(Number(msg.classificacao))
          }
        })
      }
    })

    if (ratings.length > 0) {
      const sum = ratings.reduce((a, b) => a + b, 0)
      worker.value.ratingMedia = (sum / ratings.length).toFixed(1)
    } else {
      worker.value.ratingMedia = '0.0'
    }
  } catch (error) {
    console.error('Erro ao calcular média de avaliações:', error)
    worker.value.ratingMedia = '0.0'
  }
}

async function markAsResolved(occurrence) {
  const confirmed = window.confirm(`Marcar a ocorrência ${occurrence.id} como resolvida?`)
  if (!confirmed) return

  try {
    await resolveOccurrence(occurrence.id, {
      estado: 'Resolvido',
      dataResolucao: new Date().toISOString(),
    })
    await loadOccurrencesInResolution()
  } catch (error) {
    alert(error?.message || 'Não foi possível marcar a ocorrência como resolvida.')
  }
}

async function handleDeleteAccount() {
  const trabalhadorId = getAuthUserId()
  const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken')

  if (!API_BASE_URL || !trabalhadorId || !token) {
    alert('Não foi possível apagar a conta.')
    return
  }

  try {
    const response = await fetch(`${API_BASE_URL}/trabalhadores/${trabalhadorId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok && response.status !== 204) {
      throw new Error('Falha ao apagar a conta.')
    }

    showDeleteModal.value = false
    handleLogout()
  } catch (error) {
    alert(error?.message || 'Não foi possível apagar a conta.')
  }
}

// Logout do Operador
const showLogoutModal = ref(false)
function handleLogout() {
  localStorage.removeItem('role')
  localStorage.removeItem('authToken')
  localStorage.removeItem('authUserType')
  localStorage.removeItem('authUserId')
  localStorage.removeItem('rememberMe')
  localStorage.removeItem('userProfile')
  sessionStorage.removeItem('authToken')
  sessionStorage.removeItem('authUserType')
  sessionStorage.removeItem('authUserId')
  sessionStorage.removeItem('vc-comunica-register')
  showLogoutModal.value = false
  router.replace({ name: 'login' })
}

onMounted(async () => {
  await loadOccurrencesInResolution()
  await loadTeamAverageRating()
  await syncWorkerProfileFromBackend()
  await resolveFreguesiaName()
  await resolveEquipaName()
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;800&display=swap');

.page-container {
  font-family: Arial, sans-serif;
  color: #1a1a1a;
  line-height: 1.5;
  background-color: #fff;
}

/* NAVBAR EQUILIBRADA COM ÍCONES À DIREITA */
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 80px;
  border-bottom: 1px solid #f1f5f9;
}
.logo-img {
  height: 40px;
}
.nav-icons {
  display: flex;
  align-items: center;
  gap: 24px;
  position: relative;
}
.icon {
  cursor: pointer;
  user-select: none;
}
.icon.notification {
  width: 26px;
  height: 26px;
  object-fit: contain;
}
.menu-hamburger {
  font-size: 24px;
  color: #1e293b;
}

/* NOTIFICAÇÕES */
.notifications {
  position: absolute;
  top: 40px;
  right: 0;
  width: 320px;
  background: #ffffff;
  color: #0b2b2b;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  z-index: 100;
}
.notifications h4 {
  margin: 0 0 12px 0;
  font-size: 16px;
  font-weight: 800;
}
.notif-list {
  display: flex;
  flex-direction: column;
}
.notif-item {
  background: #dff3ec;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 8px;
  font-size: 13px;
}
.notif-title {
  font-weight: 700;
  margin-bottom: 2px;
}
.notif-empty,
.empty-routes {
  color: #94a3b8;
  text-align: center;
  font-size: 13px;
  padding: 10px 0;
}

/* CONTEÚDO EMBALADO NO MODELO */
.content-wrapper {
  max-width: 1000px;
  margin: 40px auto;
  padding: 0 40px;
}
.page-title {
  font-size: 42px;
  font-weight: 900;
  color: #1e293b;
  margin-bottom: 40px;
}

/* HEADER COM AVATAR */
.profile-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40px;
  background: #f8fafc;
  padding: 24px;
  border-radius: 16px;
}
.user-info {
  display: flex;
  align-items: center;
  gap: 20px;
}
.profile-avatar,
.profile-avatar-placeholder {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
}
.avatar-container {
  position: relative;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  overflow: hidden;
}
.avatar-container.clickable {
  cursor: pointer;
}
.avatar-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s;
}
.avatar-container:hover .avatar-overlay {
  opacity: 1;
}
.camera-icon {
  color: #fff;
  font-size: 20px;
}
.profile-avatar-placeholder {
  background: #cfe8df;
  color: #0b2b2b;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 24px;
}
.user-text h2 {
  margin: 0;
  font-size: 22px;
  font-weight: 800;
  color: #1e293b;
}
.user-text p {
  margin: 4px 0 0 0;
  color: #64748b;
}
.btn-edit {
  background: #d1dfdb;
  color: #1e293b;
  border: none;
  padding: 10px 24px;
  border-radius: 8px;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s;
}
.btn-edit:hover {
  background: #c3d3cf;
}

/* FORMULÁRIO / GRID DE CAMPOS */
.details-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px 40px;
  margin-bottom: 50px;
}
.detail-field label {
  display: block;
  font-weight: 800;
  color: #475569;
  margin-bottom: 8px;
  font-size: 14px;
}
.display-box {
  background: #f8fafc;
  width: 100%;
  padding: 14px;
  border-radius: 10px;
  border: 1px solid #f1f5f9;
  color: #1e293b;
  font-weight: 600;
  box-sizing: border-box;
  font-size: 15px;
}
.select-box {
  appearance: none;
  background: #f8fafc
    url("data:image/svg+xml;utf8,<svg fill='%2394a3b8' height='24' viewBox='0 0 24 24' width='24' xmlns='http://www.w3.org/2000/svg'><path d='M7 10l5 5 5-5z'/></svg>")
    no-repeat right 12px center;
  cursor: pointer;
}
.disabled-box {
  background: #f1f5f9;
  color: #64748b;
}
.rating-box {
  color: #1e293b;
  font-weight: 700;
}
.full-width {
  grid-column: span 2;
}

/* SPOILER CREDENCIAIS MANTIDO E ADAPTADO */
.spoiler-credential {
  background: #1e293b;
  border-radius: 10px;
  padding: 14px;
  cursor: pointer;
  position: relative;
  min-height: 48px;
  display: flex;
  align-items: center;
  box-sizing: border-box;
}
.spoiler-credential .cred-text {
  color: transparent;
  font-family: monospace;
  font-size: 15px;
  user-select: none;
}
.spoiler-credential .spoiler-label {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  color: #f8fafc;
  font-size: 13px;
  font-weight: 600;
}
.spoiler-credential.revealed {
  background: #f8fafc;
  border: 1.5px dashed #730000;
}
.spoiler-credential.revealed .cred-text {
  color: #730000;
  font-weight: bold;
  user-select: text;
}

/* LAYOUT INFERIOR: APENAS OCORRÊNCIAS E ROTAS */
.worker-dashboard-bottom {
  display: flex;
  flex-direction: column;
  gap: 40px;
  margin-top: 20px;
}
.dashboard-block h3 {
  font-size: 20px;
  font-weight: 800;
  color: #1e293b;
  margin-bottom: 16px;
}
.table-container {
  border: 1px solid #f1f5f9;
  border-radius: 15px;
  overflow: hidden;
}
.occ-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  font-size: 14px;
}
.occ-table th {
  padding: 15px;
  background: #f8fafc;
  color: #94a3b8;
  font-weight: 700;
  border-bottom: 1px solid #f1f5f9;
}
.occ-table td {
  padding: 15px;
  border-bottom: 1px solid #f1f5f9;
}
.actions-cell {
  display: flex;
  gap: 10px;
  align-items: center;
  flex-wrap: wrap;
}
.details-link {
  color: #0f766e;
  font-weight: 700;
  text-decoration: none;
}
.resolve-btn {
  background: #730000;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 8px 12px;
  font-weight: 700;
  cursor: pointer;
}
.empty-state {
  text-align: center;
  color: #64748b;
  font-weight: 600;
}

/* BADGES DE ESTADO EXCLUSIVOS */
.status-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 800;
  display: inline-block;
}
.em-resolucao {
  background: #fef9c3;
  color: #ca8a04;
}
.espera {
  background: #ffedd5;
  color: #ea580c;
}
.details-cell {
  color: #64748b;
}

/* ROTAS VERTICAIS ALINHADAS */
.routes-list-wrapper {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.route-minimal-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f8fafc;
  border-left: 4px solid #730000;
  padding: 16px;
  border-radius: 8px;
}
.route-info-side h4 {
  margin: 0 0 4px 0;
  font-size: 15px;
  font-weight: 700;
  color: #1e293b;
}
.route-info-side p {
  margin: 0;
  font-size: 13px;
  color: #64748b;
}
.route-date-side {
  text-align: right;
  display: flex;
  flex-direction: column;
  gap: 2px;
  font-size: 13px;
}
.r-date {
  font-weight: 700;
  color: #730000;
}
.r-time {
  color: #475569;
}

/* BOTÃO SAIR (ESTILO ORIGINAL MONTSERRAT) */
.btn-logout {
  width: 100%;
  padding: 16px;
  background: #ff383c;
  color: #fff;
  border: none;
  border-radius: 12px;
  font-family: 'Montserrat', sans-serif;
  font-weight: 600;
  font-size: 16px;
  cursor: pointer;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    background 0.2s ease;
}

.btn-delete-account {
  width: 100%;
  padding: 16px;
  background: #ffffff;
  color: #b91c1c;
  border: 1px solid #fca5a5;
  border-radius: 12px;
  font-family: 'Montserrat', sans-serif;
  font-weight: 700;
  font-size: 16px;
  cursor: pointer;
}

.account-actions-row {
  display: flex;
  gap: 14px;
  margin-top: 50px;
}

.half-button {
  flex: 1;
  min-width: 0;
}
.btn-logout:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(255, 56, 60, 0.4);
  background: #e0292d;
}

/* MODAIS NO MODELO EXATO */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}
.modal-card {
  background: #fff;
  border-radius: 12px;
  padding: 40px;
  max-width: 440px;
  width: 90%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
  font-family: 'Montserrat', sans-serif;
  text-align: left;
}
.modal-card h3 {
  font-size: 26px;
  margin: 0 0 20px 0;
  font-weight: 700;
  color: #1e293b;
}
.modal-form-body {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 24px;
}
.modal-form-body label {
  font-weight: 700;
  color: #475569;
  font-size: 14px;
  margin-top: 6px;
}
.modal-card .display-box {
  background: #fff;
  border: 1.5px solid #cbd5e1;
  color: #475569;
}
.modal-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.modal-btn {
  padding: 12px 24px;
  border-radius: 10px;
  font-family: 'Montserrat', sans-serif;
  font-weight: 700;
  font-size: 14px;
  border: none;
  cursor: pointer;
}
.modal-btn.cancel {
  background: transparent;
  color: #1e293b;
}
.modal-btn.confirm {
  background: #cfe8df;
  color: #0b2b2b;
}
.confirmation-card {
  text-align: center;
}
.confirmation-card p {
  color: #64748b;
  margin-bottom: 24px;
}
.confirmation-card .modal-actions {
  justify-content: center;
  gap: 16px;
}
.confirmation-card .modal-btn.cancel {
  background: #f1f5f9;
  color: #475569;
}
.confirmation-card .modal-btn.confirm {
  background: #ff383c;
  color: #fff;
}

@media (max-width: 768px) {
  .details-grid {
    grid-template-columns: 1fr;
  }
  .full-width {
    grid-column: span 1;
  }
  .navbar,
  .content-wrapper {
    padding: 20px;
  }
}
</style>
