<template>
  <div class="page-container">
    <nav class="navbar">
      <div class="logo-area">
        <router-link to="/admin/perfil">
          <img src="@/assets/logoP.png" alt="VC Comunica Logo" class="logo-img" />
        </router-link>
      </div>
      <div class="nav-right">
        <img
          :src="notifications.length === 0 ? notifOff : notifOn"
          alt="notifications"
          class="icon notification"
          @click="toggleNotif"
          ref="notifIcon"
        />
        <span class="icon menu-trigger" @click="toggleMenu">☰</span>

        <AdminSidebarMenu v-model="showMenu" />

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
      <div class="title-filter">
        <h1 class="page-title">Equipas</h1>
        <div class="filter-select">
          <label>Freguesia</label>
          <select v-model="selectedFreguesia">
            <option v-for="f in availableFreguesias" :key="f" :value="f">{{ f }}</option>
          </select>
        </div>
      </div>

      <div v-if="loadError" class="load-error">
        {{ loadError }}
      </div>

      <div v-else-if="isLoading" class="load-state"></div>

      <div v-else-if="selectedFreguesia" class="teams-list">
        <div v-for="team in filteredTeams" :key="team.id" class="team-card">
          <div class="team-layout">
            <!-- Left side: Team members -->
            <div class="team-left">
              <div class="team-header">
                <h2 class="team-name">{{ team.name }}</h2>
              </div>
              <div class="members-list">
                <div v-for="member in team.members" :key="member.id" class="member-row">
                  <img :src="member.avatar" class="member-avatar" />
                  <span class="member-name">{{ member.name }}</span>
                  <button
                    class="btn-delete-member"
                    title="Remover"
                    @click="handleRemoveMember(team.id, member.id)"
                  >
                    🗑
                  </button>
                </div>
              </div>
            </div>

            <!-- Right side: Stats & Controls -->
            <div class="team-right">
              <div class="stats-row">
                <div class="stat-card stat-green">
                  <span class="stat-label">Ocorrências Ativas</span>
                  <span class="stat-number">{{ team.stats.ativas }}</span>
                </div>
                <div class="stat-card stat-teal">
                  <span class="stat-label">Ocorrências Concluídas</span>
                  <span class="stat-number">{{ team.stats.concluidas }}</span>
                </div>
                <div class="stat-card stat-pink">
                  <span class="stat-label">Ocorrências Não Resolvidas</span>
                  <span class="stat-number">{{ team.stats.naoResolvidas }}</span>
                </div>
              </div>

              <div class="max-routes">
                <span class="max-label">Nº máximo de ocorrências por rota</span>
                <div class="counter-control">
                  <button class="counter-btn minus" @click="decrementMax(team)">−</button>
                  <span class="counter-value">{{ team.maxPerRoute }}</span>
                  <button class="counter-btn plus" @click="incrementMax(team)">+</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <div v-if="showWorkerModal" class="modal-overlay" @click.self="closeWorkerModal">
      <div class="worker-modal">
        <div class="worker-modal-header">
          <div>
            <p class="modal-kicker">Adicionar trabalhador</p>
            <h3>{{ activeTeam?.name }}</h3>
            <p class="modal-subtitle">Filtro ativo: {{ selectedFreguesia }}</p>
          </div>
          <button class="modal-close" @click="closeWorkerModal">✕</button>
        </div>

        <div v-if="workerNotice" class="worker-notice">{{ workerNotice }}</div>

        <div class="worker-modal-list">
          <div v-for="worker in visibleWorkers" :key="worker.id" class="worker-card">
            <img :src="worker.avatar" alt="worker avatar" class="worker-avatar" />
            <div class="worker-card-body">
              <strong>{{ worker.name }}</strong>
              <span>{{ worker.email }}</span>
              <span>{{ worker.freguesia }}</span>
              <small>{{ workerAssignmentLabel(worker) }}</small>
            </div>
            <button
              class="worker-add-btn"
              :disabled="!canAddWorker(worker)"
              @click="handleAddWorker(worker)"
            >
              {{ canAddWorker(worker) ? 'Adicionar' : 'Já alocado' }}
            </button>
          </div>

          <div v-if="visibleWorkers.length === 0" class="worker-empty">
            Não existem trabalhadores para este filtro.
          </div>
        </div>
      </div>
    </div>

    <Footer :columns="adminFooterColumns" :logo-src="adminFooterLogo" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import Footer from '@/components/footer.vue'
import AdminSidebarMenu from '@/components/AdminSidebarMenu.vue'
import notifOn from '@/assets/notificationson.png'
import notifOff from '@/assets/notificationsoff.png'
import adminFooterLogo from '@/assets/logo_footer.png'
import { FREGUESIAS } from '@/utils/freguesias'
import {
  assignWorkerToTeam,
  listTeams,
  listWorkers,
  unassignWorkerFromTeam,
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
const teams = ref([])
const workers = ref([])
const showWorkerModal = ref(false)
const activeTeamId = ref(null)
const workerNotice = ref('')
const isLoading = ref(true)
const loadError = ref('')

const notifications = ref([])

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

const activeTeam = computed(
  () => teams.value.find((team) => String(team.id) === String(activeTeamId.value)) || null,
)

const selectedFreguesia = ref('')

const availableFreguesias = computed(() => FREGUESIAS.filter((f) => f !== 'Todas'))

const filteredTeams = computed(() => {
  if (!selectedFreguesia.value) return []

  return teams.value.filter((team) => team.freguesia === selectedFreguesia.value)
})

const visibleWorkers = computed(() => {
  if (!selectedFreguesia.value) return []
  return workers.value.filter((worker) => worker.freguesia === selectedFreguesia.value)
})

const workerAssignments = computed(() => {
  const map = new Map()
  teams.value.forEach((team) => {
    team.members.forEach((member) => {
      map.set(String(member.id), team.name)
    })
  })
  return map
})

const workerAssignmentLabel = (worker) => {
  const teamName = workerAssignments.value.get(String(worker.id))
  if (!teamName) return 'Disponível'
  if (activeTeam.value && teamName === activeTeam.value.name) return 'Já pertence a esta equipa'
  return `Já alocado a ${teamName}`
}

const canAddWorker = (worker) => {
  const assignedTeam = workerAssignments.value.get(String(worker.id))
  if (!assignedTeam) return true
  return activeTeam.value ? assignedTeam !== activeTeam.value.name : false
}

function closeWorkerModal() {
  showWorkerModal.value = false
  workerNotice.value = ''
}

async function handleAddWorker(worker) {
  if (!activeTeam.value) return

  try {
    const result = await assignWorkerToTeam(activeTeam.value.id, worker.id)
    if (result?.added) {
      teams.value = result.teams || teams.value
      workerNotice.value = `${worker.name} foi adicionado a ${activeTeam.value.name}.`
      return
    }

    if (result?.reason === 'already-assigned') {
      workerNotice.value = `${worker.name} já está alocado noutra equipa.`
      return
    }

    workerNotice.value = 'Não foi possível adicionar o trabalhador.'
  } catch (error) {
    workerNotice.value = error?.message || 'Não foi possível adicionar o trabalhador.'
  }
}

async function handleRemoveMember(teamId, memberId) {
  try {
    teams.value = await unassignWorkerFromTeam(teamId, memberId)
  } catch (error) {
    workerNotice.value = error?.message || 'Não foi possível remover o trabalhador.'
  }
}

async function loadInitialTeamsAndWorkers() {
  isLoading.value = true
  loadError.value = ''

  try {
    const [loadedTeams, loadedWorkers] = await Promise.all([listTeams(), listWorkers()])
    teams.value = loadedTeams
    workers.value = loadedWorkers
  } catch (error) {
    loadError.value = error?.message || 'Não foi possível carregar os dados da base de dados.'
  } finally {
    isLoading.value = false
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
  await loadInitialTeamsAndWorkers()
  // select first available freguesia by default
  if (!selectedFreguesia.value) {
    const first =
      availableFreguesias.value && availableFreguesias.value.length > 0
        ? availableFreguesias.value[0]
        : ''
    if (first) selectedFreguesia.value = first
  }
  document.addEventListener('click', handleDocClick)
})
onBeforeUnmount(() => document.removeEventListener('click', handleDocClick))

const decrementMax = (team) => {
  if (team.maxPerRoute > 1) team.maxPerRoute--
}
const incrementMax = (team) => {
  team.maxPerRoute++
}
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
.empty-state {
  margin-top: 8px;
  padding: 18px;
  border-radius: 12px;
  background: #f8fafc;
  color: #475569;
  border: 1px dashed #cbd5e1;
  font-weight: 600;
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

/* TEAM CARDS */
.teams-list {
  display: flex;
  flex-direction: column;
  gap: 30px;
}
.team-card {
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 30px;
  background: #fff;
}
.team-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
}
.team-header {
  margin-bottom: 20px;
}
.team-name {
  font-size: 22px;
  font-weight: 800;
  margin: 0;
}

/* MEMBERS */
.members-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.member-row {
  display: flex;
  align-items: center;
  gap: 12px;
}
.member-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
}
.member-name {
  font-size: 15px;
  font-weight: 500;
  flex: 1;
}
.btn-delete-member {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 16px;
  opacity: 0.5;
  transition: opacity 0.15s;
}
.btn-delete-member:hover {
  opacity: 1;
}

/* TEAM ACTIONS */
.team-actions {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  justify-content: flex-end;
}
.btn-add-worker {
  background: #fff;
  border: 1px solid #e2e8f0;
  padding: 8px 18px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
  transition: background 0.15s;
}
.btn-add-worker:hover {
  background: #f8fafc;
}

/* STATS */
.stats-row {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
}
.stat-card {
  flex: 1;
  padding: 15px;
  border-radius: 12px;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.stat-label {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
}
.stat-number {
  font-size: 28px;
  font-weight: 900;
}
.stat-green {
  background: #dcfce7;
  color: #166534;
}
.stat-teal {
  background: #d1fae5;
  color: #065f46;
}
.stat-pink {
  background: #fce4ec;
  color: #9a3412;
}

/* MAX PER ROUTE */
.max-routes {
  display: flex;
  align-items: center;
  gap: 15px;
}
.max-label {
  font-size: 14px;
  font-weight: 700;
}
.counter-control {
  display: flex;
  align-items: center;
  gap: 10px;
}
.counter-btn {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  border: none;
  font-size: 18px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity 0.15s;
}
.counter-btn.minus {
  background: #1e293b;
  color: #fff;
}
.counter-btn.plus {
  background: #22c55e;
  color: #fff;
}
.counter-btn:hover {
  opacity: 0.8;
}
.counter-value {
  font-size: 20px;
  font-weight: 800;
  min-width: 30px;
  text-align: center;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(11, 43, 43, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 120;
  padding: 24px;
}

.worker-modal {
  width: min(920px, 100%);
  max-height: min(78vh, 760px);
  overflow: hidden;
  background: #ffffff;
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 18px 50px rgba(0, 0, 0, 0.24);
  display: flex;
  flex-direction: column;
  gap: 16px;
  font-family: Montserrat, sans-serif;
}

.worker-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
}

.modal-kicker {
  margin: 0 0 6px;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  color: #7b7b7b;
}

.worker-modal-header h3 {
  margin: 0;
  font-size: 26px;
  font-weight: 800;
}

.modal-subtitle {
  margin: 6px 0 0;
  color: #64748b;
  font-size: 14px;
}

.modal-close {
  border: none;
  background: #f1f5f9;
  color: #0f172a;
  width: 38px;
  height: 38px;
  border-radius: 12px;
  cursor: pointer;
  font-size: 18px;
  font-weight: 700;
}

.worker-notice {
  padding: 12px 14px;
  border-radius: 12px;
  background: #ecfdf5;
  color: #166534;
  font-weight: 600;
}

.worker-modal-list {
  overflow-y: auto;
  display: grid;
  gap: 12px;
  padding-right: 4px;
}

.worker-card {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 14px;
  align-items: center;
  padding: 14px 16px;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  background: #f8fafc;
}

.worker-avatar {
  width: 54px;
  height: 54px;
  border-radius: 50%;
  object-fit: cover;
}

.worker-card-body {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.worker-card-body strong {
  font-size: 16px;
}

.worker-card-body span,
.worker-card-body small {
  color: #64748b;
  font-size: 13px;
}

.worker-add-btn {
  border: none;
  border-radius: 999px;
  padding: 10px 16px;
  font-weight: 700;
  cursor: pointer;
  background: #730000;
  color: #fff;
  transition:
    transform 0.15s,
    opacity 0.15s;
}

.worker-add-btn:hover:not(:disabled) {
  transform: translateY(-1px);
}

.worker-add-btn:disabled {
  background: #cbd5e1;
  cursor: not-allowed;
}

.worker-empty {
  padding: 20px;
  text-align: center;
  color: #64748b;
  border: 1px dashed #cbd5e1;
  border-radius: 16px;
  background: #f8fafc;
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
  .team-layout {
    grid-template-columns: 1fr;
  }
  .stats-row {
    flex-direction: column;
  }
}
</style>
