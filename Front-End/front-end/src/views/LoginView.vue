<template>
  <div class="login-page">
    <div class="background-overlay">
      <img src="@/assets/login_fundo.png" alt="Fundo Cidade" class="bg-image">
      <div class="dark-layer"></div>
    </div>

    <div class="top-logo">
    <router-link to="/" class="logo-link">
      <img src="@/assets/logo.png" alt="VC Comunica" class="logo-img">
    </router-link>
      
    </div>

    <main class="login-container">
      <div class="login-card">
        <h1>Log in</h1>
        <p class="subtitle">Olá! Introduz os teus dados para poderes reportar ocorrências</p>

        <form @submit.prevent="handleLogin">
          <div class="role-select">
            <label>
              <input type="radio" value="cidadao" v-model="role"> Entrar como Cidadão
            </label>
            <label>
              <input type="radio" value="trabalhador" v-model="role"> Entrar como Trabalhador
            </label>
          </div>
          <div class="input-group">
            <label for="email">Email</label>
            <input 
              type="email" 
              id="email" 
              v-model="email" 
              placeholder="Introduz o teu email"
              required
            >
          </div>

          <div class="input-group">
            <label for="password">Password</label>
            <input 
              type="password" 
              id="password" 
              v-model="password" 
              placeholder="........"
              required
            >
          </div>

          <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>

          <div class="form-options">
            <label class="checkbox-container">
              <input type="checkbox" v-model="rememberMe">
              <span class="checkmark"></span>
              Lembrar log in
            </label>
            <a href="#" class="forgot-password">Esqueci-me da password</a>
          </div>

          <button type="submit" class="btn-sign-in">Sign in</button>
        </form>

        <p class="footer-text">
          Não tens uma conta? <router-link to="/register/email" class="create-account">Criar conta</router-link>
        </p>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { API_BASE_URL } from '@/services/municipalityService'

const email = ref('')
const password = ref('')
const rememberMe = ref(false)
const role = ref('cidadao')
const errorMessage = ref('')

const router = useRouter()

const resolveLoginRoute = (userType) => {
  if (userType === 'trabalhador_admin') return { name: 'admin-home' }
  if (userType === 'trabalhador') return { name: 'trabalhador-profile' }
  return { name: 'home' }
}

const handleLogin = async () => {
  errorMessage.value = ''

  if (!API_BASE_URL) {
    errorMessage.value = 'Define VITE_API_BASE_URL para usar o login real do backend.'
    return
  }

  const endpoint = role.value === 'trabalhador' ? '/trabalhadores/login' : '/cidadaos/login'
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: email.value.trim(),
      password: password.value,
    }),
  })

  const payload = await response.json().catch(() => ({}))

  if (!response.ok) {
    errorMessage.value = payload?.message || 'Credenciais inválidas.'
    return
  }

  const resolvedRole = payload.userType === 'trabalhador_admin'
    ? 'admin'
    : payload.userType === 'trabalhador'
      ? 'trabalhador'
      : 'cidadao'

  localStorage.setItem('role', resolvedRole)
  localStorage.setItem('authToken', payload.token)
  localStorage.setItem('authUserType', payload.userType || resolvedRole)
  localStorage.setItem('authUserId', String(payload.userId || ''))

  if (rememberMe.value) {
    localStorage.setItem('rememberMe', 'true')
  } else {
    localStorage.removeItem('rememberMe')
  }

  router.push(resolveLoginRoute(payload.userType || resolvedRole))
}
</script>

<style scoped>
.login-page {
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

.top-logo {
  position: absolute;
  top: 40px;
  left: 40px;
  display: flex;
  align-items: center;
  gap: 10px;
  color: white;
}

.logo-img { height: 45px; }
.logo-text { font-size: 1.5rem; font-weight: bold; letter-spacing: 1px; }

.login-card {
  background: white;
  padding: 50px 60px;
  border-radius: 12px;
  width: 100%;
  max-width: 500px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.2);
  text-align: center;
}

h1 { font-size: 2rem; margin-bottom: 10px; color: #1a1a1a; }
.subtitle { color: #888; margin-bottom: 40px; font-size: 0.95rem; }

.input-group {
  text-align: left;
  margin-bottom: 20px;
}

.input-group label {
  display: block;
  font-size: 0.85rem;
  font-weight: bold;
  margin-bottom: 8px;
  color: #444;
}

.input-group input {
  width: 100%;
  padding: 12px 15px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  box-sizing: border-box;
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  font-size: 0.85rem;
}

.checkbox-container {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  color: #444;
}

.forgot-password {
  color: #8b0000;
  text-decoration: none;
  font-weight: bold;
}

.btn-sign-in {
  width: 100%;
  background: #334155;
  color: white;
  padding: 14px;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.3s;
}

.btn-sign-in:hover {
  background: #1e293b;
}

.footer-text {
  margin-top: 30px;
  font-size: 0.9rem;
  color: #666;
}

.create-account {
  color: #22c55e;
  text-decoration: none;
  font-weight: bold;
}
</style>