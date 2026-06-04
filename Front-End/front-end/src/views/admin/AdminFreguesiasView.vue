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
      <div class="title-filter">
        <h1 class="page-title">Freguesias</h1>
      </div>

      <div v-if="loadError" class="load-error">{{ loadError }}</div>

      <div v-else-if="isLoading" class="load-state"></div>

      <div v-else class="table-container">
        <table class="workers-table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Nr Trabalhadores</th>
              <th>Equipas</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="f in paginatedFreguesias" :key="f.idFreguesia">
              <td class="user-cell">{{ f.nome }}</td>
              <td class="desc-cell">{{ getWorkerCount(f.idFreguesia) }}</td>
              <td class="teams-cell">
                <span class="teams-summary">{{ getTeamCount(f.idFreguesia) }} equipas</span>
                <span
                  v-for="team in getTeamNames(f.idFreguesia)"
                  :key="team.id"
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
                  @click="editFreguesia(f)"
                />
                <img
                  src="@/assets/delete_icon.svg"
                  alt="delete"
                  class="btn-icon"
                  title="Eliminar"
                  @click="deleteFreguesia(f)"
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

    <Footer :columns="adminFooterColumns" :logo-src="adminFooterLogo" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import Footer from '@/components/footer.vue'
import AdminSidebarMenu from '@/components/AdminSidebarMenu.vue'
import adminFooterLogo from '@/assets/logo_footer.png'
import { API_BASE_URL } from '@/services/municipalityService'

const freguesias = ref([])
const workers = ref([])
const teams = ref([])
const isLoading = ref(true)
const loadError = ref('')

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


const toggleMenu = (e) => {
  e.stopPropagation()
  showMenu.value = !showMenu.value
  showNotif.value = false
}

const fetchJson = async (path) => {
  const response = await fetch(`${API_BASE_URL}${path}`)
  if (!response.ok) {
    throw new Error(`Falha ao carregar ${path}`)
  }

  return response.json()
}

const normalizeTeamName = (team) =>
  team.especializacao || team.name || `Equipa ${team.idEquipa ?? team.id}`

const teamColorClasses = ['tag-blue', 'tag-green', 'tag-purple', 'tag-orange']

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

const currentPage = ref(1)
const perPage = 10
const totalPages = computed(() => Math.max(1, Math.ceil(freguesias.value.length / perPage)))

const getWorkerCount = (idFreguesia) => {
  const target = String(idFreguesia)
  return workers.value.reduce((acc, worker) => {
    // direct freguesia on worker
    if (String(worker.idFreguesia) === target) return acc + 1

    // fallback: check worker's team and that team's fregEquipa
    const workerTeamId = worker.idEquipa ?? worker.idEquipa ?? worker.idEquipa
    if (workerTeamId != null) {
      const team = teams.value.find((t) => String(t.idEquipa ?? t.id) === String(workerTeamId))
      if (team && String(team.fregEquipa) === target) return acc + 1
    }

    return acc
  }, 0)
}

const getTeamCount = (idFreguesia) =>
  teams.value.filter((team) => String(team.fregEquipa) === String(idFreguesia)).length

const getTeamNames = (idFreguesia) =>
  teams.value
    .filter((team) => String(team.fregEquipa) === String(idFreguesia))
    .map((team, index) => ({
      id: team.idEquipa ?? team.id ?? `${idFreguesia}-${index}`,
      name: normalizeTeamName(team),
      colorClass: teamColorClasses[index % teamColorClasses.length],
    }))

const paginatedFreguesias = computed(() => {
  const start = (currentPage.value - 1) * perPage
  return freguesias.value.slice(start, start + perPage)
})

const visiblePages = computed(() => {
  return Array.from({ length: totalPages.value }, (_, index) => index + 1)
})

const deleteFreguesia = (freguesia) => {
  console.log('Delete freguesia:', freguesia.idFreguesia)
}
const editFreguesia = (freguesia) => {
  console.log('Edit freguesia:', freguesia.idFreguesia)
}

async function loadFreguesiasFromBackend() {
  if (!API_BASE_URL) {
    throw new Error('Define VITE_API_URL para carregar as freguesias da base de dados.')
  }

  const [loadedFreguesias, loadedWorkers, loadedTeams] = await Promise.all([
    fetchJson('/municipios'),
    fetchJson('/trabalhadores'),
    fetchJson('/equipas'),
  ])

  freguesias.value = Array.isArray(loadedFreguesias) ? loadedFreguesias : []
  workers.value = Array.isArray(loadedWorkers) ? loadedWorkers : []
  teams.value = Array.isArray(loadedTeams) ? loadedTeams : []
}

onMounted(async () => {
  isLoading.value = true
  loadError.value = ''

  try {
    await loadFreguesiasFromBackend()
  } catch (error) {
    loadError.value = error?.message || 'Não foi possível carregar as freguesias.'
  } finally {
    isLoading.value = false
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
  align-items: center;
}
.teams-summary {
  margin-right: 8px;
  font-size: 12px;
  font-weight: 700;
  color: #64748b;
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

@media (max-width: 1024px) {
  .navbar,
  .main-content,
  .main-footer {
    padding: 20px;
  }
}
</style>
