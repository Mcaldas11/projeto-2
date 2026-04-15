<template>
  <div class="auth-page">
    <div class="bg-container">
      <img src="@/assets/login_fundo.png" alt="Cidade" class="bg-img" />
      <div class="bg-overlay"></div>
    </div>

    <div class="top-logo">
    <router-link to="/" class="logo-link">
      <img src="@/assets/logo.png" alt="VC Comunica" class="logo-img">
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

const router = useRouter()
const firstName = ref('')
const lastName = ref('')
const email = ref('')

const handleNext = () => {
  // Aqui guardarias os dados (ex: no Pinia ou State) antes de ir para a password
  console.log('Dados:', firstName.value, lastName.value, email.value)
  router.push('/register-password')
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
}
.bg-container {
  position: absolute;
  inset: 0;
  z-index: -1;
}
.bg-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.bg-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.3);
}
.header-logo {
  position: absolute;
  top: 30px;
  left: 40px;
  display: flex;
  align-items: center;
  gap: 12px;
  color: white;
}
.logo-icon {
  height: 40px;
}
.logo-name {
  font-weight: bold;
  font-size: 1.4rem;
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
.logo-img { height: 45px; cursor: pointer }

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
</style>
