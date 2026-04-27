<template>
  <div class="page-container">
    <nav class="navbar">
      <div class="logo-area">
        <img src="@/assets/logoP.png" alt="VC Comunica Logo" class="logo-img" />
      </div>
      <div class="nav-right">
        <span class="admin-label">Admin</span>
        <img
          :src="notifications.length === 0 ? notifOff : notifOn"
          alt="notifications"
          class="icon notification"
          @click="toggleNotif"
          ref="notifIcon"
        />
        <span class="icon menu-trigger" ref="menuIcon" @click="toggleMenu">☰</span>

        <div v-if="showMenu" class="hamburger-menu" ref="menuPanel">
          <div class="menu-list">
            <router-link to="/admin" class="menu-item" @click="showMenu = false">
              <span class="menu-label">Home</span>
              <img src="@/assets/home.png" alt="home" class="menu-icon" />
            </router-link>
            <router-link to="/admin" class="menu-item" @click="showMenu = false">
              <span class="menu-label">Ocorrências</span>
              <img src="@/assets/ocorrencias.png" alt="ocorrencias" class="menu-icon" />
            </router-link>
            <router-link to="/admin/rotas" class="menu-item" @click="showMenu = false">
              <span class="menu-label">Rotas</span>
              <img src="@/assets/ocorrencias.png" alt="rotas" class="menu-icon" />
            </router-link>
            <router-link to="/admin/equipas" class="menu-item" @click="showMenu = false">
              <span class="menu-label">Equipas</span>
              <img src="@/assets/ocorrencias.png" alt="equipas" class="menu-icon" />
            </router-link>
            <router-link to="/admin/trabalhadores" class="menu-item" @click="showMenu = false">
              <span class="menu-label">Funcionarios</span>
              <img src="@/assets/conta.png" alt="funcionarios" class="menu-icon" />
            </router-link>
          </div>
        </div>

        <div v-if="showNotif" class="notifications" ref="notifPanel">
          <h4>Notificações</h4>
          <div class="notif-list">
            <div v-for="(n, i) in notifications" :key="n.id" class="notif-item" @click.stop="removeNotif(i)">
              <div class="notif-title">{{ n.title }}</div>
              <div class="notif-body" v-html="n.body"></div>
            </div>
            <div v-if="notifications.length === 0" class="notif-empty">Sem notificações</div>
          </div>
        </div>
      </div>
    </nav>

    <main class="main-content">
      <h1 class="page-title">Trabalhadores</h1>

      <div class="table-container">
        <table class="workers-table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Descrição</th>
              <th>Teams</th>
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
                <button class="btn-icon" title="Eliminar" @click="deleteWorker(worker.id)">🗑</button>
                <button class="btn-icon" title="Editar" @click="editWorker(worker.id)">✏️</button>
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
        <button class="page-btn nav-btn" :disabled="currentPage === totalPages" @click="currentPage++">
          Next →
        </button>
      </div>
    </main>

    <footer class="main-footer">
      <div class="footer-links">
        <div class="col">
          <router-link to="/admin">Home</router-link>
          <router-link to="/admin">Ocorrências</router-link>
          <router-link to="/admin/rotas">Rotas</router-link>
          <router-link to="/admin/equipas">Equipas</router-link>
          <router-link to="/admin/trabalhadores">Funcionarios</router-link>
        </div>
        <div class="col">
          <router-link to="/sobre">Sobre</router-link>
        </div>
      </div>
      <div class="footer-brand">
        <img src="@/assets/logo_footer.png" alt="Logo" class="logo-img-small" />
        <p class="copyright">© 2026 VC Comunica All rights reserved.</p>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import notifOn from '@/assets/notificationson.png'
import notifOff from '@/assets/notificationsoff.png'
import avatarImg from '@/assets/avatar.png'

const showNotif = ref(false)
const showMenu = ref(false)
const notifPanel = ref(null)
const notifIcon = ref(null)
const menuPanel = ref(null)
const menuIcon = ref(null)

const notifications = ref([
  { id: 1, title: 'Nova ocorrência', body: 'Uma nova ocorrência foi reportada em <strong>Vila do Conde</strong>' },
])

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

function handleDocClick(e) {
  if (showNotif.value && notifPanel.value && !notifPanel.value.contains(e.target) && notifIcon.value && !notifIcon.value.contains(e.target)) {
    showNotif.value = false
  }
  if (showMenu.value && menuPanel.value && !menuPanel.value.contains(e.target) && menuIcon.value && !menuIcon.value.contains(e.target)) {
    showMenu.value = false
  }
}

onMounted(() => document.addEventListener('click', handleDocClick))
onBeforeUnmount(() => document.removeEventListener('click', handleDocClick))

// Workers data
const allWorkers = ref([
  {
    id: 1, nome: 'Olivia Rhye', email: 'olivia@untitledul.com', avatar: avatarImg,
    teams: [
      { name: 'Higiene Urbana', colorClass: 'tag-blue' },
      { name: 'Técnico de Saneamento', colorClass: 'tag-blue' },
      { name: 'Coleta de resíduos', colorClass: 'tag-blue' },
    ],
  },
  {
    id: 2, nome: 'Phoenix Baker', email: 'phoenix@untitledul.com', avatar: avatarImg,
    teams: [
      { name: 'Espaços Verdes', colorClass: 'tag-green' },
      { name: 'Paisagista', colorClass: 'tag-green' },
    ],
  },
  {
    id: 3, nome: 'Lana Steiner', email: 'lana@untitledul.com', avatar: avatarImg,
    teams: [
      { name: 'Eletricidade', colorClass: 'tag-purple' },
      { name: 'Engenheiro Eletricista', colorClass: 'tag-purple' },
      { name: 'Instalações elétricas', colorClass: 'tag-purple' },
    ],
  },
  {
    id: 4, nome: 'Demi Wilkinson', email: 'demi@untitledul.com', avatar: avatarImg,
    teams: [
      { name: 'Engenharia e Vias', colorClass: 'tag-orange' },
      { name: 'Engenheiro de Estradas', colorClass: 'tag-orange' },
      { name: 'Pavimentações', colorClass: 'tag-orange' },
    ],
  },
  {
    id: 5, nome: 'Candice Wu', email: 'candice@untitledul.com', avatar: avatarImg,
    teams: [
      { name: 'Higiene Urbana', colorClass: 'tag-blue' },
      { name: 'Coordenador de Limpeza', colorClass: 'tag-blue' },
      { name: 'Gestão de resíduos', colorClass: 'tag-blue' },
    ],
  },
  {
    id: 6, nome: 'Natali Craig', email: 'natali@untitledul.com', avatar: avatarImg,
    teams: [
      { name: 'Espaços Verdes', colorClass: 'tag-green' },
      { name: 'Arborista', colorClass: 'tag-green' },
      { name: 'Manutenção de árvores', colorClass: 'tag-green' },
    ],
  },
  {
    id: 7, nome: 'Drew Cano', email: 'drew@untitledul.com', avatar: avatarImg,
    teams: [
      { name: 'Eletricidade', colorClass: 'tag-purple' },
      { name: 'Técnico Eletricista', colorClass: 'tag-purple' },
      { name: 'Manutenção elétrica', colorClass: 'tag-purple' },
    ],
  },
  {
    id: 8, nome: 'Orlando Diggs', email: 'orlando@untitledul.com', avatar: avatarImg,
    teams: [
      { name: 'Engenharia e Vias', colorClass: 'tag-orange' },
      { name: 'Engenheiro de Tráfego', colorClass: 'tag-orange' },
      { name: 'Análise de tráfego', colorClass: 'tag-orange' },
    ],
  },
  {
    id: 9, nome: 'Andi Lane', email: 'andi@untitledul.com', avatar: avatarImg,
    teams: [
      { name: 'Higiene Urbana', colorClass: 'tag-blue' },
      { name: 'Supervisor de Coleta', colorClass: 'tag-blue' },
      { name: 'Controle de equipe', colorClass: 'tag-blue' },
    ],
  },
  {
    id: 10, nome: 'Kate Morrison', email: 'kate@untitledul.com', avatar: avatarImg,
    teams: [
      { name: 'Espaços Verdes', colorClass: 'tag-green' },
      { name: 'Gestor Ambiental', colorClass: 'tag-green' },
      { name: 'Conservação de áreas verdes', colorClass: 'tag-green' },
    ],
  },
])

// Pagination
const currentPage = ref(1)
const perPage = 10
const totalPages = computed(() => Math.max(1, Math.ceil(allWorkers.value.length / perPage)))

const paginatedWorkers = computed(() => {
  const start = (currentPage.value - 1) * perPage
  return allWorkers.value.slice(start, start + perPage)
})

const visiblePages = computed(() => {
  const total = 10 // simulated total pages
  const pages = []
  pages.push(1, 2, 3)
  pages.push('...')
  pages.push(8, 9, 10)
  return pages
})

const deleteWorker = (id) => {
  console.log('Delete worker:', id)
}
const editWorker = (id) => {
  console.log('Edit worker:', id)
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
.logo-img { height: 40px; }
.nav-right {
  display: flex;
  gap: 15px;
  align-items: center;
  position: relative;
}
.admin-label { font-weight: 700; font-size: 16px; color: #1a1a1a; }
.icon { cursor: pointer; font-size: 1.2rem; }
.icon.notification { width: 28px; height: 28px; object-fit: contain; cursor: pointer; }
.menu-trigger { font-size: 1.4rem; }

/* MENU & NOTIFICATIONS */
.hamburger-menu, .notifications {
  position: absolute; top: 44px; right: 0;
  background: #fff; border-radius: 12px; padding: 12px;
  box-shadow: 0 12px 30px rgba(0,0,0,0.15); z-index: 70;
}
.hamburger-menu { width: 220px; }
.menu-list { display: flex; flex-direction: column; gap: 4px; align-items: flex-end; }
.menu-item {
  display: flex; align-items: center; justify-content: flex-end; gap: 8px;
  text-decoration: none; color: #0b2b2b; font-weight: 700;
  padding: 8px 10px; border-radius: 8px; width: 100%; transition: background 0.15s;
}
.menu-item:hover { background: rgba(0,0,0,0.05); }
.menu-label { font-size: 13px; }
.menu-icon { width: 14px; height: 14px; object-fit: contain; }
.notifications { width: 320px; }
.notifications h4 { margin: 0 0 10px 0; font-size: 18px; }
.notif-list { display: flex; flex-direction: column; gap: 8px; }
.notif-item { background: #dff3ec; padding: 12px; border-radius: 8px; cursor: pointer; }
.notif-title { font-weight: 700; margin-bottom: 4px; }
.notif-body { color: rgba(0,0,0,0.7); font-size: 14px; }
.notif-empty { color: #666; font-size: 14px; text-align: center; padding: 12px; }

/* MAIN CONTENT */
.main-content {
  padding: 40px 80px;
  min-height: 70vh;
}
.page-title {
  font-size: 36px;
  font-weight: 800;
  margin: 0 0 30px 0;
  font-style: italic;
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
.page-btn:hover:not(:disabled):not(.active) { background: #f8fafc; }
.page-btn.active { background: #730000; color: #fff; border-color: #730000; }
.page-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.page-btn.ellipsis { border: none; cursor: default; background: none; }
.nav-btn { display: flex; align-items: center; gap: 6px; }

/* FOOTER */
.main-footer {
  padding: 60px 80px;
  background-color: #f5f1e9;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-top: 80px;
}
.footer-links { display: flex; gap: 60px; }
.col { display: flex; flex-direction: column; gap: 10px; }
.col a { text-decoration: none; color: #2d5a27; font-weight: 600; }
.logo-img-small { height: 80px; }
.copyright { font-size: 0.8rem; color: #888; margin-top: 10px; }

@media (max-width: 1024px) {
  .navbar, .main-content, .main-footer { padding: 20px; }
}
</style>
