<template>
  <div>
    <div v-if="modelValue" class="sidebar-overlay" @click="closeMenu"></div>
    <Transition name="slide">
      <div v-if="modelValue" class="sidebar-menu">
        <button class="sidebar-close" @click="closeMenu">✕</button>
        <div class="sidebar-top">
          <router-link to="/responsavel/ocorrencias" class="sidebar-item" @click="closeMenu">
            <span class="sidebar-label">Ocorrências</span>
            <img src="@/assets/ocorrencias.png" alt="ocorrencias" class="sidebar-icon" />
          </router-link>
          <router-link to="/responsavel/rotas" class="sidebar-item" @click="closeMenu">
            <span class="sidebar-label">Rotas</span>
            <img src="@/assets/route_icon.svg" alt="rotas" class="sidebar-icon" />
          </router-link>
          <router-link to="/responsavel/equipas" class="sidebar-item" @click="closeMenu">
            <span class="sidebar-label">Equipas</span>
            <img src="@/assets/team_icon.svg" alt="equipas" class="sidebar-icon" />
          </router-link>
          <router-link to="/responsavel/trabalhadores" class="sidebar-item" @click="closeMenu">
            <span class="sidebar-label">Trabalhadores</span>
            <img src="@/assets/workers_icon.svg" alt="funcionarios" class="sidebar-icon" />
          </router-link>
          <router-link to="/responsavel/recursos" class="sidebar-item" @click="closeMenu">
            <span class="sidebar-label">Recursos</span>
            <img src="@/assets/workers_icon.svg" alt="recursos" class="sidebar-icon" />
          </router-link>
        </div>
        <div class="sidebar-bottom">
          <router-link :to="accountRoute" class="sidebar-item" @click="closeMenu">
            <span class="sidebar-label">Conta</span>
            <img src="@/assets/conta.png" alt="conta" class="sidebar-icon" />
          </router-link>
        </div>
      </div>
    </Transition>

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
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { ref } from 'vue'

defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:modelValue'])
const router = useRouter()
const showLogoutModal = ref(false)

function closeMenu() {
  emit('update:modelValue', false)
}

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
  closeMenu()
  router.push('/login')
}
</script>

<style scoped>
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
  font-family: Montserrat, sans-serif;
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
  padding-top: 10px;
  border-top: 1px solid #eef2f7;
}

.sidebar-item {
  border: none;
  background: transparent;
  width: 100%;
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

.sidebar-logout {
  color: #9f1239;
}

.sidebar-logout .sidebar-icon {
  opacity: 0.8;
}

.sidebar-icon {
  width: 20px;
  height: 20px;
  object-fit: contain;
}

.sidebar-label {
  font-family: Montserrat, sans-serif;
}

.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  transform: translateX(100%);
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 140;
}

.modal-card {
  background: #ffffff;
  border-radius: 14px;
  width: min(92vw, 420px);
  padding: 26px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.18);
  font-family: Montserrat, sans-serif;
}

.modal-card h3 {
  margin: 0 0 10px;
  font-size: 22px;
  font-weight: 800;
  color: #111827;
}

.modal-card p {
  margin: 0;
  color: #475569;
  line-height: 1.45;
}

.modal-actions {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.modal-btn {
  border: 0;
  border-radius: 10px;
  padding: 10px 14px;
  font-weight: 700;
  font-size: 14px;
  cursor: pointer;
}

.modal-btn.cancel {
  background: #e5e7eb;
  color: #374151;
}

.modal-btn.confirm {
  background: #730000;
  color: #fff;
}
</style>
