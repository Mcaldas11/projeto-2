<template>
  <div class="auth-page">
    <div class="background-overlay">
      <img src="@/assets/login_fundo.png" alt="Fundo Cidade" class="bg-image" />
      <div class="dark-layer"></div>
    </div>

    <div class="top-logo">
      <router-link to="/" class="logo-link">
        <img src="@/assets/logo.png" alt="VC Comunica" class="logo-img" />
      </router-link>
    </div>

    <main class="auth-card-wrapper">
      <div class="auth-card">
        <h2>Criar conta</h2>
        <p class="welcome-text">Bem-vindo! Insere os teus dados para criares a tua conta</p>

        <form @submit.prevent="handleFinish">
          <div class="input-field">
            <label for="municipio">Freguesia</label>
            <div class="select-wrapper">
              <select
                id="municipio"
                v-model="selectedFreguesia"
                required
                :disabled="loadingFreguesias"
              >
                <option value="" disabled>Seleciona a tua freguesia</option>
                <option v-if="loadingFreguesias" value="">A carregar freguesias...</option>
                <option
                  v-for="freguesia in freguesias"
                  :key="freguesia.idFreguesia"
                  :value="String(freguesia.idFreguesia)"
                >
                  {{ freguesia.nome }}
                </option>
              </select>
              <span class="select-arrow"></span>
            </div>
          </div>

          <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
          <button type="submit" class="btn-primary">Começar</button>
        </form>

        <p class="login-footer">
          Já tens conta? <router-link to="/login" class="login-link">Faz log in</router-link>
        </p>
      </div>
    </main>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { API_BASE_URL, listFreguesias } from '@/services/municipalityService'

const STORAGE_KEY = 'vc-comunica-register'

const selectedFreguesia = ref('')
const freguesias = ref([])
const loadingFreguesias = ref(false)
const errorMessage = ref('')
const router = useRouter()

onMounted(async () => {
  const stored = sessionStorage.getItem(STORAGE_KEY)
  if (!stored) {
    router.replace('/register/email')
    return
  }

  loadingFreguesias.value = true
  try {
    freguesias.value = await listFreguesias()
  } catch {
    freguesias.value = []
    errorMessage.value = API_BASE_URL ? 'Não foi possível carregar as freguesias.' : ''
  } finally {
    loadingFreguesias.value = false
  }
})

const handleFinish = async () => {
  errorMessage.value = ''

  if (!selectedFreguesia.value) {
    errorMessage.value = 'Seleciona uma freguesia para continuar.'
    return
  }

  const stored = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || 'null')
  if (!stored) {
    router.replace('/register/email')
    return
  }

  const [firstName = '', lastName = ''] = [stored.firstName || '', stored.lastName || '']

  if (!API_BASE_URL) {
    errorMessage.value = 'Define VITE_API_BASE_URL para concluir o registo no backend.'
    return
  }

  // Registo de cidadão (único permitido nesta via)
  const payloadCidadao = {
    nome: `${firstName} ${lastName}`.trim(),
    email: stored.email,
    password: stored.password,
    nrTelemovel: stored.phone,
    fregCidadao: Number(selectedFreguesia.value),
  }

  const response = await fetch(`${API_BASE_URL}/cidadaos`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payloadCidadao),
  })

  if (!response.ok) {
    const body = await response.json().catch(() => ({}))
    errorMessage.value = body?.message || 'Não foi possível concluir o registo.'
    return
  }

  const result = await response.json()
  localStorage.setItem('role', 'cidadao')
  localStorage.setItem('authToken', result.token)
  localStorage.setItem('authUserType', result.userType || 'cidadao')
  localStorage.setItem('authUserId', String(result.userId || ''))
  localStorage.setItem(
    'userProfile',
    JSON.stringify({
      firstName,
      lastName,
      email: stored.email,
      nrTelemovel: stored.phone,
      fregCidadao: Number(selectedFreguesia.value),
    }),
  )

  sessionStorage.removeItem(STORAGE_KEY)
  router.push({ name: 'conta' })
}
</script>

<style scoped>
/* Base idêntica às anteriores para consistência */
.auth-page {
  position: relative;
  width: 100%;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  font-family: sans-serif;
  overflow: hidden;
}
.background-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
}
.bg-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.dark-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.4);
}

/* Match LoginView logo position */
.top-logo {
  position: absolute;
  top: 40px;
  left: 40px;
  display: flex;
  align-items: center;
  gap: 10px;
  color: white;
}
.logo-img {
  height: 45px;
}

.auth-card {
  background: white;
  width: 420px;
  padding: 50px 40px;
  border-radius: 12px;
  text-align: center;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
}
h2 {
  font-size: 1.8rem;
  margin-bottom: 8px;
  color: #111;
}
.welcome-text {
  font-size: 0.85rem;
  color: #777;
  margin-bottom: 35px;
}

/* Estilização específica do Select */
.input-field {
  text-align: left;
  margin-bottom: 25px;
}
.input-field label {
  display: block;
  font-size: 0.75rem;
  font-weight: 600;
  color: #444;
  margin-bottom: 8px;
}

form {
  padding-bottom: 20px;
}

.select-wrapper {
  position: relative;
  width: 100%;
}

select {
  width: 100%;
  display: block;
  padding: 12px 15px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 0.9rem;
  color: #666;
  background-color: white;
  appearance: none; /* Remove a seta padrão do navegador */
  cursor: pointer;
}

/* Seta customizada do design */
.select-arrow {
  position: absolute;
  right: 15px;
  top: 50%;
  transform: translateY(-50%);
  width: 12px;
  height: 8px;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23666' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
  background-repeat: no-repeat;
  pointer-events: none;
}

/* Botão "Começar" */
.btn-primary {
  width: 100%;
  background-color: #334155;
  color: white;
  padding: 14px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-primary:hover {
  background-color: #1e293b;
}

.login-footer {
  margin-top: 25px;
  font-size: 0.8rem;
  color: #666;
}
.login-link {
  color: #16a34a;
  text-decoration: none;
  font-weight: 700;
}
</style>
