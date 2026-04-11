<template>
  <div class="page-container">
    <nav class="navbar">
      <div class="logo-area">
        <img src="@/assets/logoP.png" alt="VC Comunica Logo" class="logo-img" />
      </div>
      <div class="nav-icons">
        <router-link to="/nova-ocorrencia" class="icon add">+</router-link>
        <img
          :src="notifications.length === 0 ? notifOff : notifOn"
          alt="notifications"
          class="icon notification"
          @click="toggleNotif"
        />
        <span class="icon" @click="toggleMenu">☰</span>

        <div v-if="showMenu" class="hamburger-menu">
          <div class="menu-list">
            <router-link to="/" class="menu-item">
              <span class="menu-label">Home</span>
              <img src="@/assets/home.png" alt="home" class="menu-icon" />
            </router-link>
            <router-link to="/ocorrencias" class="menu-item">
              <span class="menu-label">Ocorrências</span>
              <img src="@/assets/ocorrencias.png" alt="ocorrencias" class="menu-icon" />
            </router-link>
            <router-link to="/conta" class="menu-item">
              <span class="menu-label">Conta</span>
              <img src="@/assets/conta.png" alt="conta" class="menu-icon" />
            </router-link>
          </div>
        </div>

        <div v-if="showNotif" class="notifications">
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

    <main class="content-wrapper">
      <h1 class="page-title">Perfil</h1>

      <section class="profile-header">
        <div class="user-info">
          <img src="@/assets/avatar.png" alt="Avatar" class="profile-avatar" />
          <div class="user-text">
            <h2>Alexandra Reis</h2>
            <p>alexandra.reis@gmail.com</p>
          </div>
        </div>
        <button class="btn-edit">Edit</button>
      </section>

      <section class="profile-details">
        <div class="details-grid">
          <div class="detail-field">
            <label>Nome</label>
            <div class="display-box">Alexandra</div>
          </div>
          <div class="detail-field">
            <label>Apelido</label>
            <div class="display-box">Reis</div>
          </div>
          <div class="detail-field">
            <label>Género</label>
            <div class="display-box select-box">Feminino</div>
          </div>
          <div class="detail-field">
            <label>Município</label>
            <div class="display-box select-box">Vila do Conde</div>
          </div>
        </div>
      </section>

      <section class="user-occurrences">
        <h3>Minhas ocorrências</h3>
        <div class="table-container">
          <table class="occ-table">
            <thead>
              <tr>
                <th>Situação <span class="sort-icon">↓</span></th>
                <th>Tipo de Problema <img src="@/assets/detalhes.png" alt="Detalhes" class="th-icon" /></th>
                <th>Detalhes</th>
                <th class="actions-col"></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="occ in userOccurrences" :key="occ.id">
                <td>
                  <span :class="['status-badge', occ.statusClass]">{{ occ.situacao }}</span>
                </td>
                <td>{{ occ.tipo }}</td>
                <td class="details-cell">{{ occ.detalhes }}</td>
                <td class="actions-cell">
                  <img src="@/assets/detalhes.png" alt="Detalhes" class="btn-table-info" />
                  <span class="star-icon" v-if="occ.favorite">★</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </main>

    <footer class="main-footer">
      <div class="footer-links">
        <div class="col">
          <router-link to="/">Home</router-link>
          <router-link to="/ocorrencias">Ocorrências</router-link>
          <router-link to="/mapa">Mapa Ocorrências</router-link>
        </div>
        <div class="col">
          <router-link to="/sobre">Sobre</router-link>
          <router-link to="/conta">Conta</router-link>
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
import { ref } from 'vue'
import notifOn from '@/assets/notificationson.png'
import notifOff from '@/assets/notificationsoff.png'

const showNotif = ref(false)
const showMenu = ref(false)
const notifications = ref([
  {
    id: 1,
    title: 'Estado da ocorrência',
    body: 'O estado foi alterado para <strong>Resolvido</strong>',
  },
])

const toggleNotif = () => {
  showNotif.value = !showNotif.value
  showMenu.value = false
}
const toggleMenu = () => {
  showMenu.value = !showMenu.value
  showNotif.value = false
}
const removeNotif = (i) => notifications.value.splice(i, 1)

// Dados das Ocorrências (Baseado na captura image_eb9c7e.png)
const userOccurrences = ref([
  {
    id: 1,
    situacao: 'Resolvido',
    statusClass: 'resolvido',
    tipo: 'Sinalização',
    detalhes: 'Necessária a poda de árvores...',
    favorite: true,
  },
  {
    id: 2,
    situacao: 'Em Resolução',
    statusClass: 'em-resolucao',
    tipo: 'Buracos na Via',
    detalhes: 'Reparação urgente de buraco na Rua das Flores...',
    favorite: false,
  },
  {
    id: 3,
    situacao: 'À espera de equipa',
    statusClass: 'espera',
    tipo: 'Iluminação Pública',
    detalhes: 'Substituição de lâmpada fundida no Parque Central...',
    favorite: false,
  },
  {
    id: 4,
    situacao: 'Não Resolvido',
    statusClass: 'nao-resolvido',
    tipo: 'Áreas Verdes',
    detalhes: 'Urgente remoção de lixo e entulho...',
    favorite: false,
  },
  {
    id: 5,
    situacao: 'Em Resolução',
    statusClass: 'em-resolucao',
    tipo: 'Canalizador',
    detalhes: 'Entupimento de esgoto na Rua Nova...',
    favorite: false,
  },
])
</script>

<style scoped>
.page-container {
  font-family: Arial, sans-serif;
  color: #1a1a1a;
  line-height: 1.5;
  background-color: #fff;
}

/* NAVBAR & NAV-ICONS (Consistentes) */
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 80px;
}
.logo-img {
  height: 40px;
}
.nav-icons {
  display: flex;
  gap: 20px;
  position: relative;
  cursor: pointer;
}
.icon.add {
  background: #730000;
  color: #fff;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  font-weight: 700;
  text-decoration: none;
}
.icon.notification {
  width: 28px;
  height: 28px;
  object-fit: contain;
}

/* MENUS & NOTIFICAÇÕES (Estilo HomeView) */
.hamburger-menu,
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
.hamburger-menu {
  width: 200px;
}
.menu-item {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  padding: 8px 10px;
  text-decoration: none;
  color: #0b2b2b;
  font-weight: 700;
}
.menu-icon {
  width: 14px;
}
.notif-item {
  background: #dff3ec;
  padding: 10px;
  border-radius: 8px;
  margin-bottom: 8px;
}

/* CONTEÚDO PERFIL */
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

.profile-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40px;
}
.user-info {
  display: flex;
  align-items: center;
  gap: 20px;
}
.profile-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
}
.user-text h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 800;
}
.user-text p {
  margin: 0;
  color: #64748b;
}
.btn-edit {
  background: #d1dfdb;
  color: #1e293b;
  border: none;
  padding: 8px 24px;
  border-radius: 8px;
  font-weight: 700;
  cursor: pointer;
}

/* GRID DE DETALHES */
.details-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px 40px;
  margin-bottom: 60px;
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
  padding: 14px;
  border-radius: 10px;
  color: #94a3b8;
  font-weight: 500;
}
.select-box {
  position: relative;
}
.select-box::after {
  content: '⌄';
  position: absolute;
  right: 15px;
  color: #94a3b8;
}

/* TABELA DE OCORRÊNCIAS */
.user-occurrences h3 {
  font-size: 18px;
  font-weight: 800;
  margin-bottom: 20px;
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
  background: #fff;
  color: #94a3b8;
  font-weight: 600;
  border-bottom: 1px solid #f1f5f9;
}
.occ-table td {
  padding: 15px;
  border-bottom: 1px solid #f1f5f9;
}

/* STATUS BADGES */
.status-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 800;
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

.details-cell {
  color: #64748b;
  max-width: 400px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.th-icon {
  width: 18px;
  height: 18px;
  object-fit: contain;
  vertical-align: middle;
  margin-left: 8px;
}
.actions-cell {
  text-align: right;
  display: flex;
  align-items: center;
  gap: 10px;
  justify-content: flex-end;
}
.btn-table-info {
  width: 24px;
  height: 24px;
  object-fit: contain;
  cursor: pointer;
  display: inline-block;
}
.star-icon {
  color: #1e293b;
  font-size: 18px;
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
  color: #64748b;
  font-size: 12px;
  margin-top: 10px;
}
</style>
