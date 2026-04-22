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
      <h1 class="page-title">Equipas</h1>

      <div class="teams-list">
        <div v-for="team in teams" :key="team.id" class="team-card">
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
                  <button class="btn-delete-member" title="Remover" @click="removeMember(team.id, member.id)">🗑</button>
                </div>
              </div>
            </div>

            <!-- Right side: Stats & Controls -->
            <div class="team-right">
              <div class="team-actions">
                <button class="btn-add-worker">+ Trabalhador</button>
                <button class="btn-split-team">Dividir Equipa</button>
              </div>

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
import { ref, onMounted, onBeforeUnmount } from 'vue'
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

// Teams data
const teams = ref([
  {
    id: 1,
    name: 'Engenharia e Vias',
    members: [
      { id: 1, name: 'Gabriel Silva', avatar: avatarImg },
      { id: 2, name: 'Sofia Almeida', avatar: avatarImg },
      { id: 3, name: 'Lucas Pereira', avatar: avatarImg },
    ],
    stats: { ativas: 26, concluidas: 55, naoResolvidas: 12 },
    maxPerRoute: 8,
  },
  {
    id: 2,
    name: 'Eletricidade',
    members: [
      { id: 4, name: 'Ana Sousa', avatar: avatarImg },
      { id: 5, name: 'Pedro Lima', avatar: avatarImg },
      { id: 6, name: 'Mariana Costa', avatar: avatarImg },
    ],
    stats: { ativas: 26, concluidas: 55, naoResolvidas: 12 },
    maxPerRoute: 8,
  },
  {
    id: 3,
    name: 'Higiene Urbana',
    members: [
      { id: 7, name: 'Mariana Silva', avatar: avatarImg },
      { id: 8, name: 'Rafael Costa', avatar: avatarImg },
      { id: 9, name: 'Ana Sousa', avatar: avatarImg },
    ],
    stats: { ativas: 26, concluidas: 55, naoResolvidas: 12 },
    maxPerRoute: 8,
  },
  {
    id: 4,
    name: 'Espaços Verdes',
    members: [
      { id: 10, name: 'Miguel Almeida', avatar: avatarImg },
      { id: 11, name: 'Sofia Ferreira', avatar: avatarImg },
      { id: 12, name: 'João Martins', avatar: avatarImg },
    ],
    stats: { ativas: 26, concluidas: 55, naoResolvidas: 12 },
    maxPerRoute: 8,
  },
])

const removeMember = (teamId, memberId) => {
  const team = teams.value.find((t) => t.id === teamId)
  if (team) {
    team.members = team.members.filter((m) => m.id !== memberId)
  }
}

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
.logo-img { height: 40px; }
.nav-right {
  display: flex; gap: 15px; align-items: center; position: relative;
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
.btn-delete-member:hover { opacity: 1; }

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
.btn-add-worker:hover { background: #f8fafc; }
.btn-split-team {
  background: #730000;
  color: #fff;
  border: none;
  padding: 8px 18px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
  transition: opacity 0.15s;
}
.btn-split-team:hover { opacity: 0.9; }

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
.counter-btn:hover { opacity: 0.8; }
.counter-value {
  font-size: 20px;
  font-weight: 800;
  min-width: 30px;
  text-align: center;
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
.footer-links { display: flex; gap: 60px; }
.col { display: flex; flex-direction: column; gap: 10px; }
.col a { text-decoration: none; color: #2d5a27; font-weight: 600; }
.logo-img-small { height: 80px; }
.copyright { font-size: 0.8rem; color: #888; margin-top: 10px; }

@media (max-width: 1024px) {
  .navbar, .main-content, .main-footer { padding: 20px; }
  .team-layout { grid-template-columns: 1fr; }
  .stats-row { flex-direction: column; }
}
</style>
