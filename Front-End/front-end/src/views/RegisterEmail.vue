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

        <form @submit.prevent="handleNext">
          <div class="name-grid">
            <div class="input-field">
              <label>Primeiro Nome</label>
              <input type="text" v-model="firstName" placeholder="Ex: João" required />
            </div>
            <div class="input-field">
              <label>Último Nome</label>
              <input type="text" v-model="lastName" placeholder="Ex: Silva" required />
            </div>
          </div>

          <div class="input-field">
            <label>Email</label>
            <input type="email" v-model="email" placeholder="Introduz o teu email" required />
          </div>

          <div class="input-field">
            <label>Telemóvel</label>
            <input type="tel" v-model="phone" placeholder="Ex: 912345678" required />
          </div>

          <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>

          <button type="submit" class="btn-primary">Continuar</button>
        </form>

        <p class="login-footer">
          Já tens conta? <router-link to="/login" class="login-link">Faz log in</router-link>
        </p>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { API_BASE_URL } from '@/services/municipalityService'

const STORAGE_KEY = 'vc-comunica-register'

const router = useRouter()
const firstName = ref('')
const lastName = ref('')
const email = ref('')
const phone = ref('')
const errorMessage = ref('')

const handleNext = async () => {
  errorMessage.value = ''

  try {
    // 1. Procurar duplicados em Cidadãos e Trabalhadores
    const [cidadaosRes, trabalhadoresRes] = await Promise.all([
      fetch(`${API_BASE_URL}/cidadaos`),
      fetch(`${API_BASE_URL}/trabalhadores`),
    ])

    const cidadaos = await cidadaosRes.json()
    const trabalhadores = await trabalhadoresRes.json()

    const inputEmail = email.value.trim().toLowerCase()
    const inputPhone = phone.value.trim().replace(/\s/g, '')

    const emailExists =
      cidadaos.some((c) => c.email?.toLowerCase() === inputEmail) ||
      trabalhadores.some((t) => (t.email || t.emailTrabalhador)?.toLowerCase() === inputEmail)

    const phoneExists =
      cidadaos.some((c) => c.nrTelemovel === inputPhone) ||
      trabalhadores.some((t) => (t.telemovel || t.telemovelTrabalhador) === inputPhone)

    if (emailExists) {
      errorMessage.value = 'Este email já se encontra registado na plataforma.'
      return
    }

    if (phoneExists) {
      errorMessage.value = 'Este número de telemóvel já se encontra registado.'
      return
    }

    const payload = {
      firstName: firstName.value.trim(),
      lastName: lastName.value.trim(),
      email: email.value.trim(),
      phone: phone.value.trim(),
      role: 'cidadao',
    }

    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
    router.push('/register-password')
  } catch (error) {
    errorMessage.value = 'Erro ao validar os dados. Por favor, tente novamente.'
    console.error('Validation error:', error)
  }
}
</script>

<style scoped>
/* Estilos Base */
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
  width: 450px;
  padding: 40px;
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
  margin-bottom: 30px;
}

/* Grid para os nomes ficarem lado a lado */
.name-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
  margin-bottom: 5px;
}

.input-field {
  text-align: left;
  margin-bottom: 20px;
}
.input-field label {
  display: block;
  font-size: 0.75rem;
  font-weight: 600;
  color: #444;
  margin-bottom: 6px;
}
.input-field input {
  width: 100%;
  padding: 12px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  box-sizing: border-box;
  font-size: 0.9rem;
}

.error-message {
  color: #ef4444;
  font-size: 0.85rem;
  margin-bottom: 15px;
  text-align: left;
}

.btn-primary {
  width: 100%;
  background-color: #334155;
  color: white;
  padding: 14px;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  margin-top: 10px;
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

form {
  padding-bottom: 20px;
}
</style>
