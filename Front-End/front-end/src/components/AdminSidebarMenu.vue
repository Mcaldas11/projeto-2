<template>
  <div>
    <div v-if="modelValue" class="sidebar-overlay" @click="closeMenu"></div>
    <Transition name="slide">
      <div v-if="modelValue" class="sidebar-menu">
        <button class="sidebar-close" @click="closeMenu">✕</button>
        <div class="sidebar-top">
          <router-link to="/admin" class="sidebar-item" @click="closeMenu">
            <span class="sidebar-label">Home</span>
            <img src="@/assets/home.png" alt="home" class="sidebar-icon" />
          </router-link>
          <router-link to="/admin" class="sidebar-item" @click="closeMenu">
            <span class="sidebar-label">Ocorrências</span>
            <img src="@/assets/ocorrencias.png" alt="ocorrencias" class="sidebar-icon" />
          </router-link>
          <router-link to="/admin/rotas" class="sidebar-item" @click="closeMenu">
            <span class="sidebar-label">Rotas</span>
            <img src="@/assets/ocorrencias.png" alt="rotas" class="sidebar-icon" />
          </router-link>
          <router-link to="/admin/equipas" class="sidebar-item" @click="closeMenu">
            <span class="sidebar-label">Equipas</span>
            <img src="@/assets/ocorrencias.png" alt="equipas" class="sidebar-icon" />
          </router-link>
          <router-link to="/admin/trabalhadores" class="sidebar-item" @click="closeMenu">
            <span class="sidebar-label">Funcionarios</span>
            <img src="@/assets/conta.png" alt="funcionarios" class="sidebar-icon" />
          </router-link>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:modelValue'])

function closeMenu() {
  emit('update:modelValue', false)
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
