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
      <!-- Ocorrências Section -->
      <div class="title-header">
        <div class="icon-main-bg">
          <img src="@/assets/ocorrencias.png" alt="Ocorrências" class="icon-main-img" />
        </div>
        <div style="display:flex; align-items:center; gap:20px; justify-content:space-between; width:100%;">
          <h1>Ocorrências</h1>
          <div class="filter-select">
            <label>Freguesia</label>
            <select v-model="selectedFreguesia">
              <option v-for="f in FREGUESIAS" :key="f" :value="f">{{ f }}</option>
            </select>
          </div>
        </div>
      </div>

      <div class="table-container">
        <table class="occ-table">
          <thead>
            <tr>
              <th>Nome</th>
              <th class="sortable" @click="toggleSort">Situação <span class="sort-arrow">↕</span></th>
              <th>
                Tipo de Problema
                <img src="@/assets/detalhes.png" alt="Info" class="th-icon" />
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
                <router-link :to="`/admin/ocorrencia/${occ.id}`">
                  <img src="@/assets/detalhes.png" alt="Detalhes" class="info-btn" />
                </router-link>
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

      <!-- Rotas Section -->
      <section class="rotas-section">
        <h2 class="section-title">Rotas</h2>
        <div class="rotas-grid">
          <div class="map-placeholder">
            <!-- Stylized map with route lines -->
            <svg viewBox="0 0 500 350" class="route-map-svg">
              <!-- Background streets -->
              <line x1="0" y1="100" x2="500" y2="100" stroke="#ddd" stroke-width="2" />
              <line x1="0" y1="200" x2="500" y2="200" stroke="#ddd" stroke-width="2" />
              <line x1="150" y1="0" x2="150" y2="350" stroke="#ddd" stroke-width="2" />
              <line x1="350" y1="0" x2="350" y2="350" stroke="#ddd" stroke-width="2" />
              <!-- Route lines -->
              <polyline points="50,80 120,60 180,80" fill="none" stroke="#f59e0b" stroke-width="4" stroke-linecap="round" />
              <polyline points="180,80 250,120 320,80 380,110" fill="none" stroke="#22c55e" stroke-width="4" stroke-linecap="round" />
              <polyline points="120,180 200,160 300,200 350,180" fill="none" stroke="#8b5cf6" stroke-width="4" stroke-linecap="round" />
              <polyline points="200,250 300,280 400,300 450,310" fill="none" stroke="#730000" stroke-width="4" stroke-linecap="round" />
              <!-- Markers -->
              <rect x="55" y="55" width="12" height="12" fill="#f59e0b" rx="2" />
              <polygon points="385,100 390,115 380,115" fill="#22c55e" />
              <rect x="345" y="170" width="12" height="12" fill="#8b5cf6" rx="2" />
              <polygon points="450,305 455,318 445,318" fill="#730000" />
            </svg>
          </div>
          <div class="rotas-legend">
            <div class="legend-item">
              <div class="legend-bar" style="background: #730000"></div>
              <div class="legend-text">
                <strong>Engenharia e vias</strong>
                <span>4 ocorrências</span>
              </div>
            </div>
            <div class="legend-item">
              <div class="legend-bar" style="background: #8b5cf6"></div>
              <div class="legend-text">
                <strong>Higiene Urbana</strong>
                <span>7 ocorrências</span>
              </div>
            </div>
            <div class="legend-item">
              <div class="legend-bar" style="background: #f59e0b"></div>
              <div class="legend-text">
                <strong>Iluminação pública</strong>
                <span>5 ocorrências</span>
              </div>
            </div>
            <div class="legend-item">
              <div class="legend-bar" style="background: #22c55e"></div>
              <div class="legend-text">
                <strong>Espaços Verdes</strong>
                <span>9 ocorrências</span>
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
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import Footer from '@/components/footer.vue'
import AdminSidebarMenu from '@/components/AdminSidebarMenu.vue'
import notifOn from '@/assets/notificationson.png'
import notifOff from '@/assets/notificationsoff.png'
import avatarImg from '@/assets/avatar.png'
import adminFooterLogo from '@/assets/logo_footer.png'
import { FREGUESIAS } from '@/utils/freguesias'

const adminFooterColumns = [
  [
    { label: 'Home', to: '/admin' },
    { label: 'Ocorrências', to: '/admin' },
    { label: 'Rotas', to: '/admin/rotas' },
    { label: 'Equipas', to: '/admin/equipas' },
    { label: 'Funcionarios', to: '/admin/trabalhadores' },
  ],
  [
    { label: 'Sobre', to: '/sobre' },
  ],
]

const showNotif = ref(false)
const showMenu = ref(false)
const notifPanel = ref(null)
const notifIcon = ref(null)

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
}

onMounted(() => document.addEventListener('click', handleDocClick))
onBeforeUnmount(() => document.removeEventListener('click', handleDocClick))

// Ocorrências Data
const allOcorrencias = ref([
  { id: 1, nome: 'Mariana Silva', freguesia: 'Vila do Conde', situacao: 'Resolvido', statusClass: 'resolvido', tipo: 'Sinalização', detalhes: 'Necessária a poda de árvores que estão a obstruir a visibilidade da sinalização na rotunda.', userImg: avatarImg },
  { id: 2, nome: 'Ricardo Pereira', freguesia: 'Azurara', situacao: 'Em Resolução', statusClass: 'em-resolucao', tipo: 'Buracos na Via', detalhes: 'Reparação urgente de buraco na Rua das Flores, que está a causar acidentes.', userImg: avatarImg },
  { id: 3, nome: 'Beatriz Costa', freguesia: 'Argivai', situacao: 'À espera de equipa', statusClass: 'espera', tipo: 'Iluminação Pública', detalhes: 'Substituição de lâmpada fundida no Parque Central, essencial para a segurança noturna.', userImg: avatarImg },
  { id: 4, nome: 'Afonso Mendes', freguesia: 'Mindelo', situacao: 'Não resolvido', statusClass: 'nao-resolvido', tipo: 'Áreas Verdes', detalhes: 'Urgente remoção de lixo e entulho depositados junto ao jardim infantil.', userImg: avatarImg },
  { id: 5, nome: 'Joana Santos', freguesia: 'Vila do Conde', situacao: 'Em Resolução', statusClass: 'em-resolucao', tipo: 'Canalizador', detalhes: 'Entupimento de esgoto na Rua Nova, causando mau cheiro e risco de inundação.', userImg: avatarImg },
  { id: 6, nome: 'Rafael Cunha', freguesia: 'Azurara', situacao: 'Resolvido', statusClass: 'resolvido', tipo: 'Eletricista', detalhes: 'Curto-circuito na iluminação da Avenida da Liberdade, colocando em risco os moradores.', userImg: avatarImg },
  { id: 7, nome: 'Daniel Sousa', freguesia: 'Argivai', situacao: 'Em Resolução', statusClass: 'em-resolucao', tipo: 'Jardineiro', detalhes: 'Necessário cortar a relva alta no jardim da Praça da República.', userImg: avatarImg },
  { id: 8, nome: 'Margarida Castro', freguesia: 'Mindelo', situacao: 'À espera de equipa', statusClass: 'espera', tipo: 'Pedreiro', detalhes: 'Calçada solta na Rua Velha, causando tropeções e quedas.', userImg: avatarImg },
  { id: 9, nome: 'Tiago Alves', freguesia: 'Vila do Conde', situacao: 'Não resolvido', statusClass: 'nao-resolvido', tipo: 'Pintor', detalhes: 'Pintura urgente das passadeiras na Rua do Comércio, para aumentar a segurança dos peões.', userImg: avatarImg },
  { id: 10, nome: 'Sofia Ribeiro', freguesia: 'Azurara', situacao: 'Resolvido', statusClass: 'resolvido', tipo: 'Serralheiro', detalhes: 'Portão do jardim da Albuneca está danificado, permitindo a entrada de animais.', userImg: avatarImg },
])

// Pagination
const currentPage = ref(1)
const perPage = 10
const totalPages = computed(() => Math.ceil(allOcorrencias.value.length / perPage))

const selectedFreguesia = ref('Todas')

const filteredOcorrencias = computed(() => {
  if (!selectedFreguesia.value || selectedFreguesia.value === 'Todas') return allOcorrencias.value
  return allOcorrencias.value.filter((o) => o.freguesia === selectedFreguesia.value)
})

const paginatedOcorrencias = computed(() => {
  const start = (currentPage.value - 1) * perPage
  return filteredOcorrencias.value.slice(start, start + perPage)
})

const visiblePages = computed(() => {
  const total = totalPages.value
  const current = currentPage.value
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const pages = []
  pages.push(1, 2, 3)
  if (current > 4) pages.push('...')
  const middle = [current - 1, current, current + 1].filter((p) => p > 3 && p < total - 1)
  pages.push(...middle)
  if (current < total - 3) pages.push('...')
  pages.push(total - 1, total)
  return [...new Set(pages)].filter((p) => p !== '...' ? p >= 1 && p <= total : true)
})

const toggleSort = () => {
  allOcorrencias.value.reverse()
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
.filter-select { display: flex; align-items: center; gap: 10px; }
.filter-select select { padding: 8px 10px; border-radius: 8px; border: 1px solid #e2e8f0; }
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
.route-map-svg {
  width: 100%;
  height: 100%;
}
.rotas-legend {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.legend-item {
  display: flex;
  align-items: center;
  gap: 15px;
}
.legend-bar {
  width: 5px;
  height: 45px;
  border-radius: 3px;
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
