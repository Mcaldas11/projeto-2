<template>
  <div class="page-container">
    <nav class="navbar">
      <div class="logo-area">
        <img src="@/assets/logoP.png" alt="VC Comunica Logo" class="logo-img" />
      </div>
      <div class="nav-icons">
        <span class="icon add">+</span>
        <img
          :src="notifications.length === 0 ? notifOff : notifOn"
          alt="notifications"
          class="icon notification"
          @click="toggleNotif"
        />
        <span class="icon" @click="toggleMenu">☰</span>

        <SidebarMenu v-model="showMenu" />

        <div v-if="showNotif" class="notifications" ref="notifPanel">
          <h4>Notificações</h4>
          <div class="notif-list">
            <div
              v-for="(n, i) in notifications"
              :key="n.id"
              class="notif-item"
              @click.stop="removeNotif(i)"
            >
              <div class="notif-title">{{ n.title }}</div>
              <div class="notif-body" v-html="n.body"></div>
            </div>
            <div v-if="notifications.length === 0" class="notif-empty">Sem notificações</div>
          </div>
        </div>
      </div>
    </nav>

    <main class="content-wrapper">
      <div class="title-section">
        <div class="icon-bg">
          <img src="@/assets/ocorrencias.svg" alt="ocorrências" class="title-icon" />
        </div>
        <h1 class="main-title">Nova Ocorrência</h1>
      </div>

      <form @submit.prevent="handleSubmit" class="occurrence-form">
        <div class="form-row">
          <label class="field-label">Data:</label>
          <span class="field-value">{{ currentDate }}</span>
        </div>

        <div class="form-row">
          <label class="field-label">Localização:</label>
          <div class="field-stack">
            <input
              type="text"
              v-model="form.location"
              :class="['custom-select', { 'field-invalid': validationErrors.location }]"
              placeholder="Ex: Rua Dom Sancho I"
              @blur="validateField('location')"
            />
            <span v-if="validationErrors.location" class="field-error">Indica a localização.</span>
          </div>
        </div>

        <div class="form-row">
          <label class="field-label">Tipo de Ocorrência:</label>
          <div class="field-stack select-container">
            <select
              v-model="form.tipo_ocorrencia"
              :class="['custom-select', { 'field-invalid': validationErrors.tipo_ocorrencia }]"
              @blur="validateField('tipo_ocorrencia')"
            >
              <option value="" disabled>Seleccione o tipo de ocorrência</option>
              <option value="Estradas e passeios">Estradas e passeios</option>
              <option value="Sinalização de trânsito">Sinalização de trânsito</option>
              <option value="Iluminação">Iluminação</option>
              <option value="Higiene e limpeza">Higiene e limpeza</option>
              <option value="Parques e jardins">Parques e jardins</option>
            </select>
            <span v-if="validationErrors.tipo_ocorrencia" class="field-error"
              >Escolha o tipo de ocorrência.</span
            >
          </div>
        </div>

        <div class="form-row">
          <label class="field-label">Severidade:</label>
          <div class="field-stack select-container">
            <select
              v-model="form.severidade"
              :class="['custom-select', { 'field-invalid': validationErrors.severidade }]"
              @blur="validateField('severidade')"
            >
              <option value="" disabled>Seleccione a severidade</option>
              <option value="Baixa">Baixa</option>
              <option value="Média">Média</option>
              <option value="Alta">Alta</option>
            </select>
            <span v-if="validationErrors.severidade" class="field-error"
              >Escolha a severidade.</span
            >
          </div>
        </div>

        <div class="form-row">
          <label class="field-label">Descrição:</label>
          <div class="field-stack">
            <textarea
              v-model="form.description"
              :class="['custom-textarea', { 'field-invalid': validationErrors.description }]"
              placeholder="A iluminação junto à entrada do campus universitário está muito fraca..."
              @blur="validateField('description')"
            ></textarea>
            <span v-if="validationErrors.description" class="field-error"
              >Escreva uma descrição.</span
            >
          </div>
        </div>

        <div class="form-row">
          <label class="field-label">Anexe imagens:</label>
          <div class="upload-area" @click="triggerFile">
            <img src="@/assets/camera_icon.png" alt="upload" class="upload-img-icon" />
            <p>Adicionar imagens</p>
            <input type="file" ref="fileInput" hidden multiple @change="onFileChange" />

            <div v-if="filePreviews.length" class="previews inside">
              <div v-for="(p, i) in filePreviews" :key="p.url" class="preview-item">
                <button type="button" class="preview-remove" @click.stop.prevent="removeFile(i)">×</button>
                <img :src="p.url" :alt="p.name" class="preview-img" />
                <div class="preview-name">{{ p.name }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Feedback de envio -->
        <p v-if="submitError" class="submit-error">{{ submitError }}</p>

        <div class="button-group">
          <button type="submit" class="btn-submit" :disabled="submitting">
            {{ submitting ? 'A enviar...' : 'Reportar Ocorrência' }}
          </button>
          <button type="button" class="btn-cancel" @click="$router.back()" :disabled="submitting">Cancelar</button>
        </div>
      </form>
    </main>

    <Footer />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import Footer from '@/components/footer.vue'
import SidebarMenu from '@/components/SidebarMenu.vue'
import notifOn from '@/assets/notificationson.png'
import notifOff from '@/assets/notificationsoff.png'
import { createOccurrence } from '@/services/occurrenceService'

// Estados do Header
const showNotif = ref(false)
const showMenu = ref(false)
const notifications = ref([])

const toggleNotif = () => {
  showNotif.value = !showNotif.value
  showMenu.value = false
}
const toggleMenu = () => {
  showMenu.value = !showMenu.value
  showNotif.value = false
}
const removeNotif = (i) => notifications.value.splice(i, 1)

const router = useRouter()

// Data actual formatada em português
const currentDate = new Date().toLocaleDateString('pt-PT', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

const fileInput = ref(null)
// Cada entrada: { name, url, file }  — o `file` é o File original, sempre presente
const filePreviews = ref([])

const form = ref({
  location: '',
  tipo_ocorrencia: '',
  severidade: '',
  description: '',
})

const validationErrors = ref({
  location: false,
  tipo_ocorrencia: false,
  severidade: false,
  description: false,
})

const submitting = ref(false)
const submitError = ref('')

function validateField(field) {
  validationErrors.value[field] = !String(form.value[field] || '').trim()
}

function validateForm() {
  validateField('location')
  validateField('tipo_ocorrencia')
  validateField('severidade')
  validateField('description')
  return (
    !validationErrors.value.location &&
    !validationErrors.value.tipo_ocorrencia &&
    !validationErrors.value.severidade &&
    !validationErrors.value.description
  )
}

const triggerFile = () => fileInput.value?.click()

const onFileChange = (e) => {
  const newFiles = Array.from(e.target.files || [])
  if (!newFiles.length) return

  // Juntar com ficheiros já existentes e remover duplicados pelo nome+tamanho+data
  const existingFiles = filePreviews.value.map((p) => p.file)
  const combined = [...existingFiles, ...newFiles]
  const seen = new Map()
  const unique = []
  for (const f of combined) {
    const key = `${f.name}_${f.size}_${f.lastModified}`
    if (!seen.has(key)) {
      seen.set(key, true)
      unique.push(f)
    }
  }

  // Reutilizar objectURLs existentes quando possível
  const newPreviews = []
  for (const f of unique) {
    const key = `${f.name}_${f.size}_${f.lastModified}`
    const existing = filePreviews.value.find(
      (p) => `${p.file.name}_${p.file.size}_${p.file.lastModified}` === key,
    )
    if (existing) {
      newPreviews.push(existing)
    } else {
      newPreviews.push({ name: f.name, url: URL.createObjectURL(f), file: f })
    }
  }

  filePreviews.value = newPreviews

  // Limpar o input para permitir seleccionar o mesmo ficheiro novamente
  if (fileInput.value) fileInput.value.value = ''
}

const removeFile = (index) => {
  const removed = filePreviews.value.splice(index, 1)[0]
  try { URL.revokeObjectURL(removed.url) } catch {}
}

const handleSubmit = async () => {
  if (!validateForm()) return

  submitting.value = true
  submitError.value = ''

  try {
    // Extrair os File objects directamente dos filePreviews — fonte de verdade fiável
    const filesToUpload = filePreviews.value.map((p) => p.file)

    await createOccurrence(
      {
        descricao: form.value.description.trim(),
        localizacao: form.value.location.trim(),
        dataOcorrencia: new Date().toISOString(),
        severidade: form.value.severidade,
        tipo_ocorrencia: form.value.tipo_ocorrencia,
      },
      filesToUpload, // array de File objects, sempre actualizado
    )

    // Limpar formulário
    form.value.location = ''
    form.value.tipo_ocorrencia = ''
    form.value.severidade = ''
    form.value.description = ''
    validationErrors.value = { location: false, tipo_ocorrencia: false, severidade: false, description: false }

    // Revogar object URLs e limpar previews
    filePreviews.value.forEach((p) => { try { URL.revokeObjectURL(p.url) } catch {
      
    } })
    filePreviews.value = []

    router.push({ path: '/ocorrencias' })
  } catch (err) {
    console.error('Erro ao criar ocorrência:', err)
    submitError.value = 'Ocorreu um erro ao submeter a ocorrência. Tente novamente.'
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.page-container {
  font-family: Arial, sans-serif;
  color: #1a1a1a;
  line-height: 1.5;
}

/* NAVBAR */
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 80px;
  background: white;
}
.logo-img {
  height: 40px;
}
.nav-icons {
  display: flex;
  gap: 20px;
  position: relative;
  cursor: pointer;
}
.icon.add {
  background: #730000;
  color: #fff;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  font-weight: 700;
}
.icon.notification {
  width: 28px;
  height: 28px;
  object-fit: contain;
}

.hamburger-menu {
  position: absolute;
  top: 44px;
  right: 0;
  width: 200px;
  background: #ffffff;
  color: #0b2b2b;
  border-radius: 12px;
  padding: 8px;
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.15);
  z-index: 70;
  display: flex;
  flex-direction: column;
  gap: 6px;
  transition: transform 0.18s ease, opacity 0.18s ease;
  transform-origin: top right;
}

.menu-item {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  padding: 8px 10px;
  color: #0b2b2b;
  text-decoration: none;
  border-radius: 8px;
  font-weight: 700;
}
.menu-item:hover {
  background: rgba(0, 0, 0, 0.05);
}
.menu-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: flex-end;
  padding: 6px;
}
.menu-label {
  font-size: 13px;
  margin-right: 8px;
}
.menu-icon {
  width: 14px;
  height: 14px;
  object-fit: contain;
}

.notifications {
  position: absolute;
  top: 44px;
  right: 0;
  width: 320px;
  background: #fff;
  color: #0b2b2b;
  border-radius: 12px;
  padding: 12px;
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.15);
  z-index: 60;
}
.notifications h4 {
  margin: 0 0 10px 0;
  font-size: 18px;
}
.notif-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.notif-item {
  background: #dff3ec;
  padding: 12px;
  border-radius: 8px;
  cursor: pointer;
}
.notif-title {
  font-weight: 700;
  margin-bottom: 6px;
}
.notif-body {
  color: rgba(0, 0, 0, 0.7);
  font-size: 14px;
}
.notif-empty {
  color: #666;
  font-size: 14px;
  text-align: center;
  padding: 12px;
}

/* PREVIEWS */
.previews {
  display: flex;
  gap: 12px;
  margin-top: 12px;
  flex-wrap: wrap;
}
.preview-item {
  position: relative;
  width: 96px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  background: rgba(255, 255, 255, 0.9);
  padding: 6px;
  border-radius: 6px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
}
.preview-img {
  width: 96px;
  height: 64px;
  object-fit: cover;
  border-radius: 6px;
  border: 1px solid #e5e7eb;
}
.preview-name {
  font-size: 12px;
  text-align: center;
  color: #333;
  max-width: 96px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.preview-remove {
  position: absolute;
  top: -6px;
  right: -6px;
  background: #ff4d4f;
  color: white;
  border: none;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 14px;
  line-height: 1;
}

/* FORMULÁRIO */
.content-wrapper {
  max-width: 900px;
  margin: 40px auto;
}
.title-section {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 40px;
}
.icon-bg {
  background: #730000;
  padding: 10px;
  border-radius: 10px;
}
.main-title {
  font-size: 32px;
  font-weight: 800;
  color: #1e293b;
}

.form-row {
  display: grid;
  grid-template-columns: 200px 1fr;
  margin-bottom: 25px;
  align-items: start;
}
.field-label {
  font-weight: 800;
  color: #1e293b;
  font-size: 18px;
}
.field-stack {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.field-error {
  color: #dc2626;
  font-size: 13px;
  font-weight: 600;
}
.field-invalid {
  border-color: #dc2626 !important;
  box-shadow: 0 0 0 2px rgba(220, 38, 38, 0.12);
}

.custom-select,
.custom-textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  font-size: 16px;
}
.custom-textarea {
  height: 150px;
  resize: none;
}

.upload-area {
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  color: #64748b;
  min-height: 140px;
  justify-content: center;
  width: 100%;
}
.upload-area .upload-img-icon {
  width: 36px;
  height: 36px;
  margin-bottom: 6px;
}
.upload-area p {
  margin: 0 0 8px 0;
}
.previews.inside {
  display: flex;
  gap: 12px;
  margin-top: 12px;
  flex-wrap: wrap;
  width: 100%;
  justify-content: flex-start;
}

.submit-error {
  color: #dc2626;
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 10px;
}

.button-group {
  display: flex;
  gap: 15px;
  margin-top: 50px;
}
.btn-submit {
  background: #b9f397;
  color: #1a330a;
  border: none;
  padding: 12px 25px;
  border-radius: 8px;
  font-size: 20px;
  font-weight: 800;
  cursor: pointer;
}
.btn-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.btn-cancel {
  border: 1.5px solid #730000;
  color: #730000;
  background: white;
  padding: 12px 25px;
  border-radius: 8px;
  font-weight: 700;
  font-size: 20px;
  cursor: pointer;
}
.btn-cancel:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* FOOTER */
.main-footer {
  padding: 60px 80px;
  background-color: #f5f1e9;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-top: 80px;
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
  color: #2d5a27;
  font-weight: 600;
}
.logo-img-small {
  height: 80px;
}
</style>