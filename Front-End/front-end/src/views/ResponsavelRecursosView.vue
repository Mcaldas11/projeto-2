<template>
  <div class="page-container">
    <nav class="navbar">
      <div class="logo-area">
        <router-link to="/responsavel/perfil">
          <img src="@/assets/logoP.png" alt="VC Comunica Logo" class="logo-img" />
        </router-link>
      </div>
      <div class="nav-right">
        <!-- <img
          :src="notifications.length === 0 ? notifOff : notifOn"
          alt="notifications"
          class="icon notification"
          @click="toggleNotif"
          ref="notifIcon"
        /> -->
        <span class="icon menu-trigger" @click="toggleMenu">☰</span>

        <ResponsavelSidebarMenu v-model="showMenu" />

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

    <main class="main-content">
      <div class="title-filter">
        <h1 class="page-title">Recursos</h1>
        <div class="filter-info" v-if="responsibleFreguesiaName">
          <span
            >Freguesia: <strong>{{ responsibleFreguesiaName }}</strong></span
          >
        </div>
      </div>

      <div v-if="loadError" class="load-error">{{ loadError }}</div>

      <div v-else-if="isLoading" class="load-state"></div>

      <div v-else class="table-container">
        <table class="workers-table">
          <thead>
            <tr>
              <th>Recurso</th>
              <th>Estado</th>
              <th>Equipa</th>
              <th>Localização</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="resource in filteredResources" :key="resource.idRecurso">
              <td class="user-cell">
                {{ resource.tipo }}
              </td>
              <td class="desc-cell">
                <span :class="['team-tag', getStatusColor(resource.estado)]">{{
                  resource.estado
                }}</span>
              </td>
              <td class="teams-cell">
                <span class="team-tag tag-blue">{{ resource.teamName }}</span>
              </td>
              <td class="desc-cell">{{ resource.localizacao }}</td>
              <td class="actions-cell">
                <img
                  src="@/assets/edit_btn_icon.svg"
                  alt="edit"
                  class="btn-icon"
                  title="Editar Estado"
                  @click="openEditModal(resource)"
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </main>

    <!-- Edit Resource Modal -->
    <div v-if="showEditModal" class="modal-overlay" @click.self="closeEditModal">
      <div class="modal-card">
        <h3>Editar estado do recurso</h3>
        <p class="modal-subtitle">
          {{ editResourceData?.tipo }} · {{ editResourceData?.teamName }}
        </p>

        <div class="modal-form">
          <div class="form-row">
            <label class="modal-label">Estado</label>
            <select v-model="selectedStatus" class="modal-select">
              <option value="Operacional">Operacional</option>
              <option value="Disponível">Disponível</option>
              <option value="Em uso">Em uso</option>
              <option value="Manutenção">Manutenção</option>
              <option value="Avariado">Avariado</option>
            </select>
          </div>
        </div>

        <p v-if="editError" class="modal-error">{{ editError }}</p>

        <div class="modal-actions">
          <button class="modal-btn cancel" @click="closeEditModal" :disabled="isSaving">
            Cancelar
          </button>
          <button class="modal-btn confirm" @click="handleUpdateStatus" :disabled="isSaving">
            {{ isSaving ? 'A guardar...' : 'Guardar' }}
          </button>
        </div>
      </div>
    </div>

    <Footer :columns="responsavelFooterColumns" :logo-src="adminFooterLogo" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import Footer from '@/components/footer.vue'
import ResponsavelSidebarMenu from '@/components/ResponsavelSidebarMenu.vue'
/* import notifOn from '@/assets/notificationson.png'
import notifOff from '@/assets/notificationsoff.png' */
import adminFooterLogo from '@/assets/logo_footer.png'
import { listFreguesias, API_BASE_URL } from '@/services/municipalityService'
import { getAuthToken } from '@/utils/auth'
import { listTeams, listResources, updateResource } from '@/services/teamService'

const responsavelFooterColumns = [
  [
    { label: 'Home', to: '/responsavel/perfil' },
    { label: 'Ocorrências', to: '/ocorrencias' },
    { label: 'Rotas', to: '/responsavel/rotas' },
    { label: 'Equipas', to: '/responsavel/equipas' },
    { label: 'Funcionários', to: '/responsavel/trabalhadores' },
  ],
]

const showNotif = ref(false)
const showMenu = ref(false)
const notifPanel = ref(null)
const notifIcon = ref(null)
const isLoading = ref(true)
const loadError = ref('')
const responsibleFreguesiaId = ref(null)
const responsibleWorkerId = ref(null)
const responsibleFreguesiaName = ref('')

/* const notifications = ref([])

const toggleNotif = (e) => {
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

const allResources = ref([])
const allTeams = ref([])
const showEditModal = ref(false)
const editResourceData = ref(null)
const selectedStatus = ref('')
const editError = ref('')
const isSaving = ref(false)

const filteredResources = computed(() => {
  if (responsibleFreguesiaId.value === null) return []
  return allResources.value.filter(
    (r) => Number(r.freguesiaId) === Number(responsibleFreguesiaId.value),
  )
})

const openEditModal = (resource) => {
  editResourceData.value = { ...resource }
  selectedStatus.value = resource.estado
  editError.value = ''
  showEditModal.value = true
}

const closeEditModal = () => {
  showEditModal.value = false
  editResourceData.value = null
}

const handleUpdateStatus = async () => {
  isSaving.value = true
  editError.value = ''
  try {
    // O backend exige todos os campos obrigatórios (tipo, estado, localizacao, equipaResponsavel)
    const payload = {
      tipo: editResourceData.value.tipo,
      estado: selectedStatus.value,
      localizacao: editResourceData.value.localizacao,
      equipaResponsavel: editResourceData.value.equipaResponsavel,
    }
    await updateResource(editResourceData.value.idRecurso, payload)
    await loadResourcesFromBackend()
    closeEditModal()
  } catch (error) {
    editError.value = error.message || 'Erro ao atualizar o estado do recurso.'
  } finally {
    isSaving.value = false
  }
}

const getStatusColor = (status) => {
  if (/operacional|disponivel/i.test(status)) return 'tag-green'
  if (/manutenção|manutencao|em uso/i.test(status)) return 'tag-orange'
  return 'tag-purple'
}

async function loadResponsibleParish() {
  const token = getAuthToken()
  if (!token || !API_BASE_URL) return

  try {
    const response = await fetch(`${API_BASE_URL}/trabalhadores/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (response.ok) {
      const data = await response.json()
      responsibleFreguesiaId.value = data.idFreguesia
      responsibleWorkerId.value = data.idTrabalhador
    }
  } catch (err) {
    console.error('Erro ao carregar freguesia do responsável:', err)
  }
}

async function loadResourcesFromBackend() {
  isLoading.value = true
  loadError.value = ''

  try {
    await loadResponsibleParish()

    const [loadedTeams, loadedResources, loadedFreguesias] = await Promise.all([
      listTeams(),
      listResources(),
      listFreguesias(),
    ])

    if (responsibleFreguesiaId.value) {
      const freg = loadedFreguesias.find(
        (f) => Number(f.idFreguesia || f.idMunicipio) === Number(responsibleFreguesiaId.value),
      )
      responsibleFreguesiaName.value = freg?.nome || ''
    }

    allTeams.value = loadedTeams

    const teamMap = new Map(loadedTeams.map((t) => [String(t.id), t]))

    allResources.value = loadedResources.map((r) => {
      const team = teamMap.get(String(r.equipaResponsavel))
      return {
        ...r,
        teamName: team?.name || 'Sem equipa',
        freguesiaId: team?.freguesiaId || null,
      }
    })
  } catch (error) {
    loadError.value = error?.message || 'Não foi possível carregar os recursos.'
  } finally {
    isLoading.value = false
  }
}

onMounted(async () => {
  await loadResourcesFromBackend()
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
  margin: 0 0 30px 0;
}

.title-filter {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
}

.btn-create-worker {
  background: #22c55e;
  color: #fff;
  border: none;
  padding: 10px 20px;
  border-radius: 10px;
  font-weight: 800;
  cursor: pointer;
  font-family: 'Montserrat', sans-serif;
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

/* TABLE */
.table-container {
  border: 1px solid #f1f5f9;
  border-radius: 15px;
  overflow: hidden;
}
.workers-table {
  width: 100%;
  border-collapse: collapse;
}
.workers-table th {
  text-align: left;
  padding: 15px 20px;
  border-bottom: 1px solid #eee;
  color: #64748b;
  font-size: 14px;
  font-weight: 600;
}
.workers-table td {
  padding: 15px 20px;
  border-bottom: 1px solid #f8fafc;
  font-size: 14px;
  vertical-align: middle;
}
.user-cell {
  display: flex;
  align-items: center;
  gap: 12px;
  font-weight: 600;
}
.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}
.desc-cell {
  color: #64748b;
}

/* TEAM TAGS */
.teams-cell {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.team-tag {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
}
.tag-blue {
  background: #dbeafe;
  color: #1e40af;
}
.tag-green {
  background: #dcfce7;
  color: #166534;
}
.tag-purple {
  background: #ede9fe;
  color: #5b21b6;
}
.tag-orange {
  background: #ffedd5;
  color: #9a3412;
}

/* ACTIONS */
.actions-cell {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}
.btn-icon {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 18px;
  padding: 4px;
  opacity: 0.6;
  transition: opacity 0.15s;
}
.btn-icon:hover {
  opacity: 1;
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

/* MODAL */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
}
.modal-card {
  background: #fff;
  width: 420px;
  max-width: calc(100% - 32px);
  padding: 28px 24px;
  border-radius: 16px;
  box-shadow: 0 20px 50px rgba(15, 23, 42, 0.25);
}
.modal-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin: 15px 0;
}
.modal-input {
  width: 100%;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 10px 12px;
  box-sizing: border-box;
}
.pin-display {
  background: #f1f5f9;
  padding: 12px;
  border-radius: 10px;
  text-align: center;
}
.generated-pin {
  font-size: 24px;
  font-weight: 900;
  letter-spacing: 4px;
  color: #730000;
  margin: 5px 0;
}
.modal-subtitle {
  color: #64748b;
  margin: 6px 0 16px;
}
.modal-label {
  display: block;
  font-size: 13px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 8px;
}
.modal-select {
  width: 100%;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 10px 12px;
  font-size: 14px;
}
.modal-hint {
  color: #94a3b8;
  font-size: 13px;
  margin-top: 8px;
}
.modal-error {
  color: #b91c1c;
  font-size: 13px;
  margin-top: 8px;
}
.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}
.modal-btn {
  border: none;
  border-radius: 8px;
  padding: 10px 16px;
  font-weight: 700;
  cursor: pointer;
}
.modal-btn.cancel {
  background: #e2e8f0;
  color: #1e293b;
}
.modal-btn.confirm {
  background: #730000;
  color: #fff;
}
.modal-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (max-width: 1024px) {
  .navbar,
  .main-content,
  .main-footer {
    padding: 20px;
  }
}
</style>
