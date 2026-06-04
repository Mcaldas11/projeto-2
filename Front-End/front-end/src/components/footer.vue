<template>
  <footer class="main-footer">
    <div class="footer-links">
      <div v-for="(column, index) in resolvedColumns" :key="`footer-col-${index}`" class="col">
        <router-link
          v-for="link in column"
          :key="`${index}-${link.label}-${link.to}`"
          :to="link.to"
          @click="scrollToTop"
        >
          {{ link.label }}
        </router-link>
      </div>
    </div>
    <div class="footer-brand">
      <img :src="resolvedLogoSrc" alt="Logo" class="logo-img-small" />
      <p class="copyright">© 2026 VC Comunica All rights reserved.</p>
    </div>
  </footer>
</template>

<script setup>
import { computed } from 'vue'
import defaultLogo from '@/assets/logo.svg'
import { getAccountRoute } from '@/utils/auth'

const props = defineProps({
  columns: {
    type: Array,
    default: null,
  },
  logoSrc: {
    type: String,
    default: '',
  },
})

const scrollToTop = () => {
  // Força o scroll para o topo, especialmente útil se já estivermos na mesma página
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const roleAwareDefaultColumns = computed(() => {
  const role = localStorage.getItem('role') || ''

  const homeRouteByRole = {
    admin: '/admin',
    trabalhador: '/trabalhador',
    responsavel: '/responsavel/perfil',
  }

  const homeRoute = homeRouteByRole[role] || '/'
  const accountLabel = role === 'cidadao' || !role ? 'Conta' : 'Perfil'
  const accountRoute = role === 'cidadao' || !role ? '/conta' : getAccountRoute()

  const firstColumn = []
  // Apenas adiciona a Home se NÃO for cidadão
  if (role !== 'cidadao' && role !== '') {
    firstColumn.push({ label: 'Home', to: homeRoute })
  }
  firstColumn.push({ label: 'Ocorrências', to: '/ocorrencias' })
  firstColumn.push({ label: 'Mapa Ocorrências', to: '/ocorrencias' })

  return [firstColumn, [{ label: accountLabel, to: accountRoute }]]
})

const resolvedColumns = computed(() =>
  Array.isArray(props.columns) && props.columns.length
    ? props.columns
    : roleAwareDefaultColumns.value,
)
const resolvedLogoSrc = computed(() => props.logoSrc || defaultLogo)
</script>

<style scoped>
.main-footer {
  padding: 60px 80px;
  background-color: #f5f1e9;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-top: 60px;
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
  color: rgb(80, 65, 29);
  font-weight: 600;
}

.footer-brand {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.logo-img-small {
  align-items: center;
  height: 60px;
}

.copyright {
  font-size: 0.8rem;
  color: #888;
  margin-top: 10px;
}
</style>
