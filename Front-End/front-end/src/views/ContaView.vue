<template>
  <div class="page-container">
    <nav class="navbar">
      <div class="logo-area">
        <img src="@/assets/logoP.png" alt="VC Comunica Logo" class="logo-img" />
      </div>
      <div class="nav-icons">
        <router-link :to="newOccurrenceRoute" class="icon add">+</router-link>
        <img
          :src="notifications.length === 0 ? notifOff : notifOn"
          alt="notifications"
          class="icon notification"
          @click="toggleNotif"
        />
        <span class="icon" @click="toggleMenu">☰</span>

        <SidebarMenu v-model="showMenu" />

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
            <h2>{{ userFirstName }} {{ userLastName }}</h2>
            <p>{{ userEmail }}</p>
          </div>
        </div>
        <button @click="editarNome" class="btn-edit">Edit</button>
      </section>

      <section class="profile-details">
        <div class="details-grid">
          <div class="detail-field">
            <label>Género</label>
            <div >
              <select name="genero" class="display-box select-box">
                <option value="Masculino">Masculino</option>
                <option value="Feminino">Feminino</option>
                <option value="Não Binario">Não Binario</option>
              </select>
            </div>
          </div>
          <div class="detail-field">
            <label>Município</label>
            <div >
              <select name="freguesia" class="display-box select-box">
                <option v-for="freguesia in freguesias" :key="freguesia.id" :value="freguesia.nome">{{ freguesia.nome }}</option>
              </select>
            </div>
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
                  <router-link :to="`/ocorrencia/${occ.id}`" class="details-link" :aria-label="`Ver ocorrência ${occ.id}`">
                    <img src="@/assets/detalhes.png" alt="Detalhes" class="btn-table-info" />
                  </router-link>
                  <span class="star-icon" v-if="occ.favorite" @click="reviewOcorrencia">★</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <button class="btn-logout" @click="showLogoutModal = true">Terminar Sessão</button>
    </main>

    <!-- Edit Profile Modal -->
    <div v-if="showEditModal" class="modal-overlay" @click.self="showEditModal = false">
      <div class="modal-card">
        <h3>Editar Perfil</h3>
        <div style="margin:16px 0; display:flex; flex-direction:column; gap:10px;">
          <label style="font-weight:700; color:#475569">Nome:</label>
          <input v-model="editFirstName" class="display-box" />
          <label style="font-weight:700; color:#475569">Apelido:</label>
          <input v-model="editLastName" class="display-box" />
          <label style="font-weight:700; color:#475569">Email:</label>
          <input v-model="editEmail" class="display-box" />
        </div>
        <div class="modal-actions">
          <button class="modal-btn cancel" @click="handleCancelEdit">VOLTAR</button>
          <button class="modal-btn confirm" @click="handleSaveEdit">SALVAR</button>
        </div>
      </div>
    </div>

    <!-- Logout Confirmation Modal -->
    <div v-if="showLogoutModal" class="modal-overlay" @click.self="showLogoutModal = false">
      <div class="modal-card">
        <h3>Terminar Sessão</h3>
        <p>Tens a certeza que queres terminar sessão?</p>
        <div class="modal-actions">
          <button class="modal-btn cancel" @click="showLogoutModal = false">Cancelar</button>
          <button class="modal-btn confirm" @click="handleLogout">Sim, sair</button>
        </div>
      </div>
    </div>

    <!-- Review Ocorrencia Modal -->
    <div v-if="showREviewModal" class="modal-overlay" @click.self="showReviewModal = false">
      <div class="modal-card">
        <h3>Avalie a resolução da ocorrência</h3>
        <div class="form-row">
          <label class="field-label">Descrição:</label>
          <textarea
            v-model="form.description"
            class="custom-textarea"
            placeholder="Escreva aqui a sua avaliação..."
          ></textarea>
        </div>
        <div class="modal-actions">
          <button class="modal-btn cancel" @click="handleCancelEdit">Cancelar</button>
          <button class="modal-btn confirm" @click="handleSaveEdit">Guardar</button>
        </div>
      </div>
    </div>

    <Footer />
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import Footer from '@/components/footer.vue'
import SidebarMenu from '@/components/SidebarMenu.vue'
import notifOn from '@/assets/notificationson.png'
import notifOff from '@/assets/notificationsoff.png'
import { readStoredOccurrences } from '@/utils/occurrenceStorage'
import { getNewOccurrenceRoute } from '@/utils/auth'

const showNotif = ref(false)
const showMenu = ref(false)
const notifications = ref([
  {
    id: 1,
    title: 'Estado da ocorrência',
    body: 'O estado foi alterado para <strong>Resolvido</strong>',
  },
])

const freguesias = ref([
  {
    id: 1,
    nome: 'Vila do Conde',
  },
  {
    id: 2,
    nome: 'Azurara',
  },
  {
    id: 3,
    nome: 'Argivai',
  },
  {
    id: 4,
    nome: 'Mindelo',
  }
])



// User profile (reactive) - initialize from localStorage if present
const storedProfile = JSON.parse(localStorage.getItem('userProfile') || 'null')
const userFirstName = ref(storedProfile?.firstName || 'Alexandra')
const userLastName = ref(storedProfile?.lastName || 'Reis')
const userEmail = ref(storedProfile?.email || 'alexandra.reis@gmail.com')

const showEditModal = ref(false)
const editFirstName = ref('')
const editLastName = ref('')
const editEmail = ref('')
const router = useRouter()
const newOccurrenceRoute = computed(() => getNewOccurrenceRoute())

function validarEmail(email) {
  const re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(".+"))@(([^<>()[\]\\.,;:\s@\"]+\.)+[^<>()[\]\\.,;:\s@\"]{2,})$/i
  return re.test(String(email).toLowerCase())
}

const toggleNotif = () => {
  showNotif.value = !showNotif.value
  showMenu.value = false
}
const toggleMenu = () => {
  showMenu.value = !showMenu.value
  showNotif.value = false
}
const removeNotif = (i) => notifications.value.splice(i, 1)

const reviewOcorrencia = () => {
  
  
}

const editarNome = () => {
  editFirstName.value = userFirstName.value
  editLastName.value = userLastName.value
  editEmail.value = userEmail.value
  showEditModal.value = true
}

function handleCancelEdit() {
  showEditModal.value = false
}

function handleSaveEdit() {
  if (!editFirstName.value.trim() || !editLastName.value.trim()) {
    alert('Nome e apelido não podem ficar vazios.')
    return
  }
  if (!validarEmail(editEmail.value)) {
    alert('Por favor insere um email válido.')
    return
  }
  userFirstName.value = editFirstName.value.trim()
  userLastName.value = editLastName.value.trim()
  userEmail.value = editEmail.value.trim()
  localStorage.setItem('userProfile', JSON.stringify({ firstName: userFirstName.value, lastName: userLastName.value, email: userEmail.value }))
  showEditModal.value = false
}

// Dados das Ocorrências (Baseado na captura image_eb9c7e.png)
const showLogoutModal = ref(false)

function handleLogout() {
  localStorage.removeItem('role')
  showLogoutModal.value = false
  router.replace({ name: 'home' })
}

const userOccurrences = ref(readStoredOccurrences())
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

/* SIDEBAR MENU */
.sidebar-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.3);
  z-index: 90;
}

.sidebar-menu {
  position: fixed;
  top: 0;
  right: 0;
  width: 320px;
  height: 100vh;
  background: #ffffff;
  color: #0b2b2b;
  z-index: 100;
  display: flex;
  flex-direction: column;
  padding: 30px 24px;
  box-shadow: -8px 0 30px rgba(0, 0, 0, 0.12);
}

.sidebar-close {
  align-self: flex-end;
  background: none;
  border: none;
  font-size: 22px;
  color: #1a1a1a;
  cursor: pointer;
  padding: 4px 8px;
  margin-bottom: 20px;
  transition: opacity 0.15s;
}

.sidebar-close:hover {
  opacity: 0.6;
}

.sidebar-top {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.sidebar-bottom {
  margin-top: auto;
}

.sidebar-item {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
  padding: 14px 12px;
  text-decoration: none;
  color: #0b2b2b;
  font-weight: 700;
  font-size: 16px;
  border-radius: 10px;
  transition: background 0.15s;
}

.sidebar-item:hover {
  background: rgba(0, 0, 0, 0.04);
}

.sidebar-icon {
  width: 20px;
  height: 20px;
  object-fit: contain;
}

/* Slide transition */
.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  transform: translateX(100%);
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

/* select.display-box {
  width: 100%;
  padding: 14px;
  border-radius: 10px;
  border-color: #64748b;
  color: #94a3b8;
  font-weight: 500;
  appearance: none;
  background: #f8fafc url("@/assets/arrow-down.png") no-repeat right 12px center;
} */

.display-box {
  background: #f8fafc;
  width: 100%;
  padding: 14px;
  border-radius: 10px;
  border-color: #F9F9F9;
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
.details-link {
  display: inline-flex;
  align-items: center;
}
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

/* LOGOUT BUTTON */
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600&display=swap');

.btn-logout {
  width: 100%;
  padding: 16px;
  margin-top: 50px;
  background: #FF383C;
  color: #fff;
  border: none;
  border-radius: 12px;
  font-family: 'Montserrat', sans-serif;
  font-weight: 600;
  font-size: 16px;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
}

.btn-logout:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(255, 56, 60, 0.4);
  background: #e0292d;
}

.btn-logout:active {
  transform: translateY(0);
  box-shadow: 0 2px 8px rgba(255, 56, 60, 0.3);
}

/* MODAL */
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
  animation: fadeIn 0.2s ease;
}

.modal-card {
  background: #fff;
  border-radius: 12px;
  padding: 40px;
  max-width: 420px;
  width: 90%;
  text-align: center;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
  animation: scaleIn 0.25s ease;
}

/* Edit modal specific styling to match design and use Montserrat */
.modal-card {
  font-family: 'Montserrat', sans-serif;
  text-align: left;
}
.modal-card h3 {
  font-size: 28px;
  margin-bottom: 22px;
}
.modal-card label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #1e293b;
}
.modal-card .display-box {
  background: #fff;
  width: 100%;
  padding: 14px 16px;
  border-radius: 10px;
  border: 1.5px solid #cbd5e1;
  color: #475569;
  font-weight: 500;
  box-sizing: border-box;
}
.modal-card .display-box::placeholder {
  color: #c9d0d2;
}
.modal-card .modal-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 22px;
}
.modal-card .modal-btn.cancel {
  background: transparent;
  color: #1e293b;
  font-weight: 700;
  border: none;
  padding: 8px 12px;
}
.modal-card .modal-btn.confirm {
  background: #cfe8df;
  color: #0b2b2b;
  border: none;
  padding: 12px 20px;
  border-radius: 10px;
  font-weight: 800;
}

.modal-card h3 {
  font-family: 'Montserrat', sans-serif;
  align-self: left;
  font-weight: 600;
  font-size: 22px;
  margin: 0 0 12px 0;
  color: #1e293b;
}

.modal-card p {
  color: #64748b;
  font-size: 15px;
  margin: 0 0 30px 0;
}

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.modal-btn {
  padding: 12px 28px;
  border-radius: 10px;
  font-family: 'Montserrat', sans-serif;
  font-weight: 600;
  font-size: 14px;
  border: none;
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.modal-btn:hover {
  transform: translateY(-1px);
}

.modal-btn.cancel {
  background: #f1f5f9;
  color: #475569;
}

.modal-btn.cancel:hover {
  background: #e2e8f0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.modal-btn.confirm {
  background: #FF383C;
  color: #fff;
}

.modal-btn.confirm:hover {
  background: #e0292d;
  box-shadow: 0 4px 16px rgba(255, 56, 60, 0.35);
}

/* Override only the Edit Profile modal's confirm hover to avoid green/darker-green effect */
.modal-card .modal-btn.confirm:hover {
  background: #cfe8df; /* keep pale green */
  box-shadow: 0 6px 14px rgba(11, 43, 43, 0.08);
  transform: translateY(-1px);
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes scaleIn {
  from { transform: scale(0.9); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}
</style>
