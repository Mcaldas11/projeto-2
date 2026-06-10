<template>
  <div>
    <div v-if="modelValue" class="sidebar-overlay" @click="closeMenu"></div>
    <Transition name="slide">
      <div v-if="modelValue" class="sidebar-menu">
        <button class="sidebar-close" @click="closeMenu">✕</button>
        <div class="sidebar-top">
          <router-link v-if="!isCitizen" to="/" class="sidebar-item" @click.prevent="navigateHome">
            <span class="sidebar-label">Home</span>
            <img src="@/assets/home.png" alt="home" class="sidebar-icon" />
          </router-link>
          <router-link to="/ocorrencias" class="sidebar-item" @click="closeMenu">
            <span class="sidebar-label">Ocorrências</span>
            <img src="@/assets/ocorrencias.png" alt="ocorrencias" class="sidebar-icon" />
          </router-link>
          <router-link
            v-if="isCitizen"
            to="/ocorrencias-globais"
            class="sidebar-item"
            @click="closeMenu"
          >
            <span class="sidebar-label">Ocorrências Globais</span>
            <img src="@/assets/estradas.svg" alt="ocorrencias-globais" class="sidebar-icon" />
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
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { getAccountRoute } from '@/utils/auth'

defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:modelValue'])
const router = useRouter()
const accountRoute = computed(() => getAccountRoute())
const isCitizen = computed(() => localStorage.getItem('role') === 'cidadao')

function closeMenu() {
  emit('update:modelValue', false)
}

function navigateHome() {
  const role = localStorage.getItem('role')
  closeMenu()
  if (role === 'trabalhador') {
    router.push({ name: 'trabalhador-home' })
  } else {
    router.push({ name: 'home' })
  }
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
  z-index: 9999; /* Garante que a sombra cubra os controles do mapa (z-index 1000) */
}

.sidebar-menu {
  position: fixed;
  top: 0;
  right: 0;
  width: 320px;
  height: 100vh;
  background: #ffffff;
  color: #0b2b2b;
  z-index: 10000;
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
</style>
