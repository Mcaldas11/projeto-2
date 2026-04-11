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

        <form @submit.prevent="handleFinish">
          <div class="input-field">
            <label for="municipio">Município</label>
            <div class="select-wrapper">
              <select id="municipio" v-model="selectedMunicipality" required>
                <option value="" disabled selected>Seleciona o teu município</option>
                <option value="lisboa">Lisboa</option>
                <option value="porto">Porto</option>
                <option value="braga">Braga</option>
              </select>
              <span class="select-arrow"></span>
            </div>
          </div>

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
import { ref } from 'vue'

const selectedMunicipality = ref('')

const handleFinish = () => {
  console.log('Município selecionado:', selectedMunicipality.value)
  // Lógica para finalizar o registo e redirecionar para a Dashboard
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

.select-wrapper {
  position: relative;
  width: 100%;
}

select {
  width: 100%;
  padding: 12px 15px;
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
