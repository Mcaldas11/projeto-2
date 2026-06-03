<template>
  <div class="page-container">
    <nav class="navbar">
      <div class="logo-area">
        <router-link to="/admin/perfil">
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

    <main class="main-content">
      <div class="title-filter">
        <h1 class="page-title">Trabalhadores</h1>
        <div class="filter-select">
          <label>Freguesia</label>
          <select v-model="selectedFreguesia">
            <option v-for="f in freguesiasOptions" :key="f" :value="f">{{ f }}</option>
          </select>
        </div>
      </div>

      <div v-if="loadError" class="load-error">{{ loadError }}</div>

      <div v-else-if="isLoading" class="load-state"></div>

      <div v-else class="table-container">
        <table class="workers-table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Email</th>
              <th>Equipa</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="worker in paginatedWorkers" :key="worker.id">
              <td class="user-cell">
                <img :src="worker.avatar" class="avatar" />
                {{ worker.nome }}
              </td>
              <td class="desc-cell">{{ worker.email }}</td>
              <td class="teams-cell">
                <span
                  v-for="(team, idx) in worker.teams"
                  :key="idx"
                  :class="['team-tag', team.colorClass]"
                >
                  {{ team.name }}
                </span>
              </td>
              <td class="actions-cell">
                <img
                  src="@/assets/edit_btn_icon.svg"
                  alt="edit"
                  class="btn-icon"
                  title="Editar"
                  @click="editWorker(worker.id)"
                />
                <img
                  src="@/assets/delete_icon.svg"
                  alt="delete"
                  class="btn-icon"
                  title="Eliminar"
                  @click="deleteWorker(worker.id)"
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="pagination">
        <button class="page-btn nav-btn" :disabled="currentPage === 1" @click="currentPage--">
          ← Previous
        </button>
        <div class="page-numbers">
          <button
            v-for="p in visiblePages"
            :key="p"
            :class="['page-btn', { active: currentPage === p, ellipsis: p === '...' }]"
            :disabled="p === '...'"
            @click="p !== '...' && (currentPage = p)"
          >
            {{ p }}
          </button>
        </div>
        <button
          class="page-btn nav-btn"
          :disabled="currentPage === totalPages"
          @click="currentPage++"
        >
          Next →
        </button>
      </div>
    </main>

    <!-- Edit Worker Modal -->
    <div v-if="showEditModal" class="modal-overlay" @click.self="closeEditModal">
      <div class="modal-card">
        <h3>Editar trabalhador</h3>
        <p class="modal-subtitle">{{ editWorkerData?.nome }} · {{ editWorkerData?.freguesia }}</p>

        <label class="modal-label">Equipa (da mesma freguesia)</label>
        <select v-model="editTeamId" class="modal-select">
          <option value="">Sem equipa</option>
          <option v-for="team in availableTeams" :key="team.id" :value="String(team.id)">
            {{ team.name }}
          </option>
        </select>

        <p v-if="availableTeams.length === 0" class="modal-hint">
          Não existem equipas para esta freguesia.
        </p>
        <p v-if="editError" class="modal-error">{{ editError }}</p>

        <div class="modal-actions">
          <button class="modal-btn cancel" @click="closeEditModal" :disabled="isSaving">
            Cancelar
          </button>
          <button class="modal-btn confirm" @click="saveWorkerTeam" :disabled="isSaving">
            {{ isSaving ? 'A guardar...' : 'Guardar' }}
          </button>
        </div>
      </div>
    </div>

    <Footer :columns="adminFooterColumns" :logo-src="adminFooterLogo" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import Footer from '@/components/footer.vue'
import AdminSidebarMenu from '@/components/AdminSidebarMenu.vue'
/* import notifOn from '@/assets/notificationson.png'
import notifOff from '@/assets/notificationsoff.png' */
import avatarImg from '@/assets/avatar.png'
import adminFooterLogo from '@/assets/logo_footer.png'
import { listFreguesias } from '@/services/municipalityService'
import {
  listTeams,
  listWorkers,
  assignWorkerToTeam,
  unassignWorkerFromTeam,
  deleteWorker as removeWorker,
} from '@/services/teamService'

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
const freguesiasOptions = ref(['Todas'])

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

const allWorkers = ref([])
const allTeams = ref([])

const selectedFreguesia = ref('Todas')

const showEditModal = ref(false)
const editWorkerData = ref(null)
const editTeamId = ref('')
const editError = ref('')
const isSaving = ref(false)

const filteredWorkers = computed(() => {
  if (!selectedFreguesia.value || selectedFreguesia.value === 'Todas') return allWorkers.value
  return allWorkers.value.filter((w) => w.freguesia === selectedFreguesia.value)
})

const availableTeams = computed(() => {
  if (!editWorkerData.value) return []
  const workerFreg = editWorkerData.value.idFreguesia
  if (!workerFreg) return []
  return allTeams.value.filter((team) => String(team.freguesiaId) === String(workerFreg))
})

// Pagination
const currentPage = ref(1)
const perPage = 10
const totalPages = computed(() => Math.max(1, Math.ceil(filteredWorkers.value.length / perPage)))

const paginatedWorkers = computed(() => {
  const start = (currentPage.value - 1) * perPage
  return filteredWorkers.value.slice(start, start + perPage)
})

const visiblePages = computed(() => {
  return Array.from({ length: totalPages.value }, (_, index) => index + 1)
})

const deleteWorker = async (id) => {
  const confirmed = window.confirm('Tens a certeza que queres apagar este trabalhador?')
  if (!confirmed) return

  try {
    await removeWorker(id)
    await loadWorkersFromBackend()
  } catch (error) {
    loadError.value = error?.message || 'Não foi possível apagar o trabalhador.'
  }
}

const editWorker = (id) => {
  const worker = allWorkers.value.find((item) => item.id === id)
  if (!worker) return

  editWorkerData.value = { ...worker }
  editTeamId.value = worker.idEquipa ? String(worker.idEquipa) : ''
  editError.value = ''
  showEditModal.value = true
}

const closeEditModal = () => {
  showEditModal.value = false
  editWorkerData.value = null
  editTeamId.value = ''
  editError.value = ''
}

const saveWorkerTeam = async () => {
  if (!editWorkerData.value) return

  if (editTeamId.value) {
    const isAllowed = availableTeams.value.some(
      (team) => String(team.id) === String(editTeamId.value),
    )
    if (!isAllowed) {
      editError.value = 'A equipa selecionada não pertence à freguesia do trabalhador.'
      return
    }
  }

  isSaving.value = true
  editError.value = ''

  try {
    if (!editTeamId.value) {
      await unassignWorkerFromTeam(editWorkerData.value.idEquipa || 0, editWorkerData.value.id)
    } else {
      await assignWorkerToTeam(editTeamId.value, editWorkerData.value.id)
    }
    await loadWorkersFromBackend()
    closeEditModal()
  } catch (error) {
    editError.value = error?.message || 'Não foi possível atualizar a equipa.'
  } finally {
    isSaving.value = false
  }
}

const teamColorClasses = ['tag-blue', 'tag-green', 'tag-purple', 'tag-orange']

function buildWorkerCards(workers, teams) {
  const teamById = new Map(
    teams.map((team) => [String(team.id), team.name || team.especializacao || `Equipa ${team.id}`]),
  )

  return workers.map((worker, index) => ({
    id: worker.id,
    nome: worker.name,
    email: worker.email,
    avatar: worker.avatar || avatarImg,
    freguesia: worker.freguesia || 'Sem freguesia',
    idFreguesia: worker.idFreguesia || null,
    idEquipa: worker.idEquipa || null,
    teams: worker.idEquipa
      ? [
          {
            name: teamById.get(String(worker.idEquipa)) || 'Sem equipa',
            colorClass: teamColorClasses[index % teamColorClasses.length],
          },
        ]
      : [{ name: 'Sem equipa', colorClass: 'tag-orange' }],
  }))
}

async function loadWorkersFromBackend() {
  isLoading.value = true
  loadError.value = ''

  try {
    const [loadedWorkers, loadedTeams, loadedFreguesias] = await Promise.all([
      listWorkers(),
      listTeams(),
      listFreguesias(),
    ])

    freguesiasOptions.value = [
      'Todas',
      ...loadedFreguesias.map((freguesia) => freguesia?.nome).filter(Boolean),
    ]

    allTeams.value = loadedTeams
    allWorkers.value = buildWorkerCards(loadedWorkers, loadedTeams)
  } catch (error) {
    loadError.value = error?.message || 'Não foi possível carregar os trabalhadores.'
  } finally {
    isLoading.value = false
  }
}

onMounted(async () => {
  await loadWorkersFromBackend()
})

watch(selectedFreguesia, () => {
  currentPage.value = 1
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

/* PAGINATION */
.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
  padding: 10px 0;
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
