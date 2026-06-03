<template>
  <div class="auth-page">
    <div class="bg-container">
      <img src="@/assets/login_fundo.png" alt="Cidade" class="bg-img" />
      <div class="bg-overlay"></div>
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

        <form @submit.prevent="handleSubmit">
          <div class="input-field">
            <label>Password</label>
            <input type="password" v-model="password" placeholder="Cria a tua password" required />
          </div>

          <div class="password-requirements">
            <p :class="{ met: hasMinLength }"> Mínimo de 6 caracteres</p>
            <p :class="{ met: hasUpperCase }"> Uma letra maiúscula</p>
            <p :class="{ met: hasLowerCase }"> Uma letra minúscula</p>
            <p :class="{ met: hasNumber }"> Um número</p>
            <p :class="{ met: hasSpecialChar }"> Um caracter especial</p>
          </div>

          <div class="input-field">
            <label>Confirma a tua password</label>
            <input
              type="password"
              v-model="confirmPassword"
              placeholder="Reescreve a tua password"
              required
            />
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
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'

const STORAGE_KEY = 'vc-comunica-register'

const router = useRouter()
const password = ref('')
const confirmPassword = ref('')
const errorMessage = ref('')

const hasMinLength = computed(() => password.value.length >= 6)
const hasUpperCase = computed(() => /[A-Z]/.test(password.value))
const hasLowerCase = computed(() => /[a-z]/.test(password.value))
const hasNumber = computed(() => /\d/.test(password.value))
const hasSpecialChar = computed(() => /[\W_]/.test(password.value))

const isPasswordValid = computed(
  () =>
    hasMinLength.value &&
    hasUpperCase.value &&
    hasLowerCase.value &&
    hasNumber.value &&
    hasSpecialChar.value,
)

onMounted(() => {
  if (!sessionStorage.getItem(STORAGE_KEY)) {
    router.replace('/register/email')
  }
})

const handleSubmit = () => {
  if (!isPasswordValid.value) {
    errorMessage.value = 'A password não cumpre os requisitos de segurança.'
    return
  }

  if (!password.value || !confirmPassword.value) {
    errorMessage.value = 'Preenche a password e a confirmação.'
    return
  }

  if (password.value !== confirmPassword.value) {
    errorMessage.value = 'As passwords não coincidem.'
    return
  }

  const stored = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || '{}')
  sessionStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      ...stored,
      password: password.value,
    }),
  )

  errorMessage.value = ''
  router.push('/register/municipio')
}
</script>

<style scoped>
/* O CSS é exatamente o mesmo do anterior para manter a consistência visual */
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
.logo-img {
  height: 45px;
  cursor: pointer;
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
}
.btn-primary:hover {
  background-color: #1e293b;
}
.error-message {
  color: #dc2626;
  font-size: 0.8rem;
  margin-bottom: 15px;
  text-align: left;
}
.password-requirements {
  text-align: left;
  margin-bottom: 20px;
  font-size: 0.75rem;
  color: #999;
}
.password-requirements p {
  margin: 4px 0;
  transition: color 0.2s;
}
.password-requirements p.met {
  color: #16a34a;
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
  padding-bottom: 180px;
}
</style>
