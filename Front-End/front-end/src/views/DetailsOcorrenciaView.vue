<template>
  <div class="page-container">
    <nav class="navbar">
      <div class="logo-area">
        <img src="@/assets/logoP.png" alt="VC Comunica Logo" class="logo-img" />
      </div>
      <div class="nav-icons" ref="navIcons">
        <router-link v-if="newOccurrenceRoute" :to="newOccurrenceRoute" class="icon add"
          >+</router-link
        >
        
        <span class="icon" ref="menuIcon" @click="toggleMenu">☰</span>

        <SidebarMenu v-model="showMenu" />

        
      </div>
    </nav>

    <main class="content-wrapper">
      <div v-if="selectedOccurrence">
        <div class="breadcrumb-header">
          <div class="icon-main-bg">
            <img src="@/assets/ocorrencias.png" alt="Ocorrências" class="icon-main-img" />
          </div>
          <h1>
            Ocorrências > <span>{{ occurrenceTitle }}</span>
          </h1>
        </div>

        <div class="main-details-grid">
          <section class="image-gallery">
            <div class="main-image-container">
              <img :src="activeImage" class="featured-image" :alt="occurrenceTypeMeta.label" />
              <div class="gallery-nav" v-if="gallery.length > 0">
                <button @click="prevImg" :disabled="gallery.length < 2">‹</button>
                <div class="thumbnails">
                  <img
                    v-for="(img, index) in gallery"
                    :key="index"
                    :src="img"
                    :class="{ active: activeImage === img }"
                    @click="activeImage = img"
                  />
                </div>
                <button @click="nextImg" :disabled="gallery.length < 2">›</button>
              </div>
              <p v-if="gallery.length === 0" class="no-photos">Sem fotografias disponíveis.</p>
            </div>
          </section>

          <section class="info-sidebar">
            <div class="category-header">
              <img
                :src="occurrenceTypeMeta.icon"
                :alt="occurrenceTypeMeta.label"
                class="icon-type"
                :style="{ backgroundColor: occurrenceTypeMeta.backgroundColor }"
              />
              <h3>{{ occurrenceTypeMeta.label }}</h3>
            </div>

            <div class="info-group">
              <p>
                <strong>Estado:</strong>
                <span :class="['status-badge', selectedOccurrence.statusClass]">{{
                  occurrenceStatus
                }}</span>
              </p>
              <p>
                <strong>Localização:</strong><br />{{ occurrenceLocation }}<br />
                <button @click="viewOnMap" class="map-link-btn">Ver no mapa</button>
              </p>
              <p><strong>Descrição:</strong><br />{{ occurrenceDescription }}</p>

              <p v-if="selectedOccurrence.dataAgendada">
                <strong>Data agendada:</strong><br />{{
                  formatDateTime(selectedOccurrence.dataAgendada)
                }}
              </p>
              <p v-if="selectedOccurrence.dataResolucao">
                <strong>Data de resolução:</strong><br />{{
                  formatDateTime(selectedOccurrence.dataResolucao)
                }}
              </p>
              <p v-if="selectedOccurrence.feedback">
                <strong>Feedback do trabalhador:</strong><br />{{ selectedOccurrence.feedback }}
              </p>

              <div class="reporter-info">
                <p><strong>Reportado por:</strong></p>
                <div class="user-chip">
                  <img :src="reporterAvatar" class="avatar-xs" alt="Reportado por" />
                  <span>{{ selectedOccurrence.nome }}</span>
                </div>
              </div>

              <div v-if="isWorker" class="worker-actions">
                <button class="report-btn" @click="reportError">Reportar Erro</button>
                <button class="report-btn report-btn-secondary" @click="toggleResolveForm">
                  {{ resolveFormOpen ? 'Fechar resolução' : 'Resolver Ocorrência' }}
                </button>
                <p v-if="resolveNotice" class="resolve-notice">{{ resolveNotice }}</p>
              </div>

              <div v-if="isWorker && resolveFormOpen" class="resolve-panel">
                <div class="resolve-grid">
                  <label>
                    Estado
                    <select v-model="resolveForm.estado" class="resolve-input">
                      <option value="Em resolução">Em resolução</option>
                      <option value="Resolvido">Resolvido</option>
                      <option value="Não resolvido">Não resolvido</option>
                    </select>
                  </label>
                  <label>
                    Data agendada
                    <input
                      v-model="resolveForm.dataAgendada"
                      type="datetime-local"
                      class="resolve-input"
                    />
                  </label>
                  <label>
                    Data de resolução
                    <input
                      v-model="resolveForm.dataResolucao"
                      type="datetime-local"
                      class="resolve-input"
                    />
                  </label>
                </div>

                <label class="resolve-feedback-label">
                  Feedback
                  <textarea
                    v-model="resolveForm.feedback"
                    class="resolve-textarea"
                    placeholder="Deixa uma nota para a equipa ou para o cidadão"
                  ></textarea>
                </label>

                <div class="resolve-actions">
                  <button
                    class="report-btn"
                    :disabled="isSavingResolution"
                    @click="submitResolution"
                  >
                    {{ isSavingResolution ? 'A guardar...' : 'Guardar resolução' }}
                  </button>
                </div>
              </div>
            </div>
          </section>
        </div>

        <section v-if="jaAvaliado || podeAvaliar" class="citizen-evaluation-section">
          <div class="section-title">
            <h3>Avaliação da Resolução</h3>
          </div>

          <div v-if="jaAvaliado" class="evaluation-result-box">
            <div class="eval-header">
              <span class="stars">
                <span v-for="star in avaliacaoExistente.classificacao" :key="star">⭐</span>
                <span class="rating-number">({{ avaliacaoExistente.classificacao }}/5)</span>
              </span>
              <span class="eval-date" v-if="avaliacaoExistente.dataMensagem">
                Submetido em: {{ formatDateTime(avaliacaoExistente.dataMensagem) }}
              </span>
            </div>
            <p class="eval-text">
              <strong>O comentário do cidadão:</strong> {{ avaliacaoExistente.texto }}
            </p>
            <div
              v-if="isCitizen"
              class="eval-footer-actions"
              style="
                margin-top: 15px;
                display: flex;
                justify-content: space-between;
                align-items: center;
              "
            >
              <p class="success-msg" style="font-weight: bold; margin: 0">
                ✔ Avaliação guardada com sucesso!
              </p>
              <button class="report-btn report-btn-secondary" @click="jaAvaliado = false">
                Editar Avaliação
              </button>
            </div>
          </div>

          <div v-else-if="podeAvaliar" class="evaluation-form-box">
            <p class="instruction-text">
              A ocorrência encontra-se concluída. Por favor, deixe o seu comentário e classificação:
            </p>

            <div class="form-row">
              <div class="form-group rating-group">
                <label>Classificação (0 a 5):</label>
                <select
                  v-model.number="citizenForm.classificacao"
                  class="resolve-input select-rating"
                >
                  <option :value="0">0 - Muito Mau</option>
                  <option :value="1">1 - Mau</option>
                  <option :value="2">2 - Satisfatório</option>
                  <option :value="3">3 - Bom</option>
                  <option :value="4">4 - Muito Bom</option>
                  <option :value="5">5 - Excelente</option>
                </select>
              </div>
            </div>

            <div class="form-group">
              <label>O seu comentário:</label>
              <textarea
                v-model="citizenForm.texto"
                class="resolve-textarea wide-textarea"
                placeholder="Escreva aqui a sua opinião sobre a intervenção..."
              ></textarea>
            </div>

            <div class="resolve-actions">
              <button
                class="report-btn submit-eval-btn"
                :disabled="isSavingEvaluation"
                @click="submitCitizenEvaluation"
              >
                {{
                  isSavingEvaluation
                    ? 'A guardar no backend...'
                    : avaliacaoExistente
                      ? 'Atualizar Avaliação'
                      : 'Submeter Avaliação'
                }}
              </button>
              <p v-if="evaluationNotice" class="resolve-notice error-msg">
                {{ evaluationNotice }}
              </p>
            </div>
          </div>
        </section>

        <section class="team-section">
          <div class="section-title">
            <img src="@/assets/trabalhador.svg" alt="trabalhador-icon" class="team-icon" />
            <h3>Informação da equipa:</h3>
          </div>

          <div class="team-content">
            <div class="workers-list">
              <p><strong>Trabalhadores alocados:</strong></p>
              <div v-if="selectedOccurrence.idEquipa && teamWorkers.length" class="workers-grid">
                <div v-for="worker in teamWorkers" :key="worker.idTrabalhador" class="worker-card">
                  <img
                    :src="worker.fotoPerfil || defaultWorkerAvatar"
                    :alt="worker.nomeTrabalhador"
                  />
                  <span>{{ worker.nomeTrabalhador }}</span>
                </div>
              </div>
              <p v-else class="team-placeholder">
                A equipa aparece depois de um trabalhador aceitar a ocorrência.
              </p>
            </div>

            <div class="tech-info">
              <p><strong>Especialização:</strong> {{ specializationLabel }}</p>
              <p><strong>Freguesia:</strong> {{ occurrenceMunicipality }}</p>
              <p v-if="selectedOccurrence.idEquipa">
                <strong>Equipa:</strong> {{ assignedTeamLabel }}
              </p>
            </div>
          </div>
        </section>
      </div>

      <div v-else class="not-found-state">
        <h2>Ocorrência não encontrada</h2>
        <p>O registo seleccionado já não está disponível.</p>
      </div>
    </main>

    <Footer />
  </div>
</template>

<script setup>
import { createRouter, createWebHistory } from 'vue-router'
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Footer from '@/components/footer.vue'
import SidebarMenu from '@/components/SidebarMenu.vue'
import defaultWorkerAvatar from '@/assets/avatar.png'
import { defaultOccurrenceAvatar } from '@/utils/occurrenceStorage'
import { API_BASE_URL, getOccurrence, resolveOccurrence } from '@/services/occurrenceService'
import { getOccurrenceTypeMeta } from '@/utils/occurrenceTypes'
import { getAuthUserType, getNewOccurrenceRoute, getAuthUserId } from '@/utils/auth'

// O teu serviço que comunica com a tabela Mensagem do backend
import { createMensagem, getMensagensByOcorrencia, updateMensagem } from '@/services/messageService'

const showMenu = ref(false)
const showNotif = ref(false)
const menuPanel = ref(null)
const menuIcon = ref(null)
const route = useRoute()
const router = useRouter()

const isWorker = computed(() => {
  const userType = getAuthUserType()
  return userType.startsWith('trabalhador') || userType === 'responsavel'
})
const isCitizen = computed(() => {
  const userType = getAuthUserType()
  return userType === 'cidadao'
})
const newOccurrenceRoute = computed(() => getNewOccurrenceRoute())

const selectedOccurrence = ref(null)
const teamWorkers = ref([])
const assignedTeamLabel = ref('')
const resolveFormOpen = ref(false)
const isSavingResolution = ref(false)
const resolveNotice = ref('')
const resolveForm = ref({
  estado: 'Em resolução',
  dataAgendada: '',
  dataResolucao: '',
  feedback: '',
})

// VARIÁVEIS REATIVAS PARA A AVALIAÇÃO DO CIDADÃO
const isSavingEvaluation = ref(false)
const evaluationNotice = ref('')
// jaAvaliado começa sempre a FALSE para garantir que podes escrever
const jaAvaliado = ref(false)
const avaliacaoExistente = ref(null)
const citizenForm = ref({
  texto: '',
  classificacao: 5, // Valor por defeito
})

// Só permite avaliar se o estado for Resolvido ou Não resolvido E se for cidadão
const podeAvaliar = computed(() => {
  const estado = selectedOccurrence.value?.situacao
  return (estado === 'Resolvido' || estado === 'Não resolvido') && isCitizen.value
})

function viewOnMap() {
  if (!selectedOccurrence.value) return
  router.push({
    path: '/ocorrencias',
    query: {
      id: selectedOccurrence.value.id,
      mode: 'mapa',
    },
  })
}

async function loadOccurrence() {
  selectedOccurrence.value = await getOccurrence(route.params.id)
  resolveNotice.value = ''

  // Limpa o formulário e garante que mostra a caixa de escrita
  citizenForm.value = { texto: '', classificacao: 5 }
  jaAvaliado.value = false
  evaluationNotice.value = ''

  if (!selectedOccurrence.value) {
    teamWorkers.value = []
    assignedTeamLabel.value = ''
    return
  }

  // Tentar carregar avaliação existente para esta ocorrência
  try {
    // Se for cidadão, filtramos pela sua própria ID para edição.
    // Se for trabalhador/admin, queremos ver qualquer avaliação que exista para esta ocorrência.
    const filterId = isCitizen.value ? getAuthUserId() : null
    const mensagens = await getMensagensByOcorrencia(selectedOccurrence.value.id, filterId)
    
    if (mensagens && mensagens.length > 0) {
      // Assumimos que a última mensagem é a avaliação mais recente
      const ultimaAvaliacao = mensagens[mensagens.length - 1]
      avaliacaoExistente.value = ultimaAvaliacao
      citizenForm.value.texto = ultimaAvaliacao.texto
      citizenForm.value.classificacao = ultimaAvaliacao.classificacao
      jaAvaliado.value = true
    }
  } catch (error) {
    console.error('Erro ao carregar avaliações:', error)
  }

  if (!selectedOccurrence.value?.idEquipa) {
    teamWorkers.value = []
    assignedTeamLabel.value = ''
    return
  }

  await loadTeamDetails(selectedOccurrence.value.idEquipa)
  resolveForm.value = {
    estado: selectedOccurrence.value.situacao || 'Em resolução',
    dataAgendada: toLocalDateTimeInput(selectedOccurrence.value.dataAgendada),
    dataResolucao: toLocalDateTimeInput(selectedOccurrence.value.dataResolucao),
    feedback: selectedOccurrence.value.feedback || '',
  }
}

// ─── FUNÇÃO QUE GRAVA EXATAMENTE COMO NO TEU MODELO SEQUELIZE ───
async function submitCitizenEvaluation() {
  if (!selectedOccurrence.value) return

  if (!citizenForm.value.texto.trim()) {
    evaluationNotice.value = 'Aviso: Tem de escrever um comentário.'
    return
  }

  isSavingEvaluation.value = true
  evaluationNotice.value = ''

  try {
    const currentUserId = getAuthUserId()
    const payload = {
      texto: citizenForm.value.texto,
      dataMensagem: new Date().toISOString(),
      classificacao: Number(citizenForm.value.classificacao),
      idCidadao: Number(currentUserId) || 1,
      idOcorrencia: Number(selectedOccurrence.value.id),
    }

    let resultado
    if (avaliacaoExistente.value && avaliacaoExistente.value.idMensagem) {
      // Se já existe, atualizamos
      resultado = await updateMensagem(avaliacaoExistente.value.idMensagem, payload)
    } else {
      // Se não existe, criamos
      resultado = await createMensagem(payload)
    }

    // Se a API não devolver o objeto criado, usamos o payload local para visualização
    avaliacaoExistente.value = resultado || payload

    // Agora sim, trancamos o formulário em modo leitura
    jaAvaliado.value = true
  } catch (error) {
    evaluationNotice.value = error?.message || 'Erro ao comunicar com a base de dados.'
  } finally {
    isSavingEvaluation.value = false
  }
}

const occurrenceTitle = computed(() => {
  if (!selectedOccurrence.value) return 'Ocorrência'
  return `Ocorrência ${selectedOccurrence.value.id}`
})

const occurrenceTypeMeta = computed(() => getOccurrenceTypeMeta(selectedOccurrence.value?.tipo))
const occurrenceStatus = computed(() => selectedOccurrence.value?.situacao || 'Desconhecido')
const occurrenceLocation = computed(
  () => selectedOccurrence.value?.location || 'Local não disponível',
)
const occurrenceDescription = computed(
  () => selectedOccurrence.value?.detalhes || 'Sem descrição disponível.',
)
const occurrenceMunicipality = computed(
  () => selectedOccurrence.value?.municipio || selectedOccurrence.value?.freguesia || '',
)
const specializationLabel = computed(() => {
  if (assignedTeamLabel.value) return assignedTeamLabel.value
  return 'A aguardar atribuição'
})

function toLocalDateTimeInput(value) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  const offset = date.getTimezoneOffset() * 60000
  return new Date(date.getTime() - offset).toISOString().slice(0, 16)
}

function formatDateTime(value) {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'
  return date.toLocaleString('pt-PT', {
    dateStyle: 'short',
    timeStyle: 'short',
  })
}

async function fetchJson(path) {
  const response = await fetch(`${API_BASE_URL}${path}`)
  if (!response.ok) throw new Error(`Falha ao carregar ${path}`)
  return response.json()
}

async function loadTeamDetails(teamId) {
  try {
    const [team, workers] = await Promise.all([
      fetchJson(`/equipas/${teamId}`),
      fetchJson('/trabalhadores'),
    ])
    assignedTeamLabel.value = team?.especializacao || ''
    teamWorkers.value = Array.isArray(workers)
      ? workers.filter((worker) => Number(worker.idEquipa) === Number(teamId))
      : []
  } catch {
    assignedTeamLabel.value = ''
    teamWorkers.value = []
  }
}

const gallery = ref([])
const activeImage = ref(null)

watch(
  selectedOccurrence,
  (occurrence) => {
    if (!occurrence) {
      gallery.value = []
      activeImage.value = null
      return
    }
    const photos =
      Array.isArray(occurrence.photos) && occurrence.photos.length
        ? occurrence.photos
        : occurrence.image
          ? [occurrence.image]
          : []
    gallery.value = photos
    activeImage.value = photos[0] || null
  },
  { immediate: true },
)

const reporterAvatar = computed(() => selectedOccurrence.value?.userImg || defaultOccurrenceAvatar)

function toggleResolveForm() {
  resolveNotice.value = ''
  resolveFormOpen.value = !resolveFormOpen.value
}

async function submitResolution() {
  if (!selectedOccurrence.value) return
  isSavingResolution.value = true
  resolveNotice.value = ''
  try {
    const payload = {
      estado: resolveForm.value.estado,
      dataAgendada: resolveForm.value.dataAgendada || null,
      dataResolucao: resolveForm.value.dataResolucao || null,
      feedback: resolveForm.value.feedback || '',
    }
    const updatedOccurrence = await resolveOccurrence(selectedOccurrence.value.id, payload)
    selectedOccurrence.value = updatedOccurrence
    if (updatedOccurrence?.idEquipa) {
      await loadTeamDetails(updatedOccurrence.idEquipa)
    }
    resolveForm.value.estado = updatedOccurrence?.situacao || resolveForm.value.estado
    resolveNotice.value = 'Ocorrência atualizada com sucesso.'
    resolveFormOpen.value = false
  } catch (error) {
    resolveNotice.value = error?.message || 'Não foi possível atualizar a ocorrência.'
  } finally {
    isSavingResolution.value = false
  }
}


const toggleMenu = (e) => {
  e.stopPropagation()
  showMenu.value = !showMenu.value
  showNotif.value = false
}

watch(
  () => route.params.id,
  async () => {
    await loadOccurrence()
  },
  { immediate: true },
)

function handleDocClick(e) {
  
  if (
    showMenu.value &&
    menuPanel.value &&
    !menuPanel.value.contains(e.target) &&
    !menuIcon.value.contains(e.target)
  ) {
    showMenu.value = false
  }
}

const nextImg = () => {
  const idx = gallery.value.indexOf(activeImage.value)
  activeImage.value = gallery.value[(idx + 1) % gallery.value.length]
}
const prevImg = () => {
  const idx = gallery.value.indexOf(activeImage.value)
  activeImage.value = gallery.value[(idx - 1 + gallery.value.length) % gallery.value.length]
}
const reportError = () => {
  alert('Reportar Erro: acção simulada (só visível a trabalhadores)')
}

onMounted(() => document.addEventListener('click', handleDocClick))
onBeforeUnmount(() => document.removeEventListener('click', handleDocClick))
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&display=swap');

.page-container {
  font-family: 'Montserrat', Arial, Helvetica, sans-serif;
  color: #1a1a1a;
}
.navbar {
  display: flex;
  justify-content: space-between;
  padding: 20px 80px;
  align-items: center;
  background: white;
}
.logo-img {
  height: 40px;
}
.nav-icons {
  display: flex;
  gap: 20px;
  align-items: center;
  position: relative;
  cursor: pointer;
}
.icon.add {
  background: #730000;
  color: white;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  text-decoration: none;
  font-weight: 700;
}
.icon.notification {
  width: 28px;
  height: 28px;
  object-fit: contain;
}
.hamburger-menu,
.notifications {
  position: absolute;
  top: 44px;
  right: 0;
  background: #fff;
  border-radius: 12px;
  padding: 12px;
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.15);
  z-index: 70;
}
.hamburger-menu {
  width: 200px;
}
.menu-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: flex-end;
}
.menu-item {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  text-decoration: none;
  color: #0b2b2b;
  font-weight: 700;
  padding: 8px;
  width: 100%;
}
.menu-label {
  font-size: 13px;
}
.menu-icon {
  width: 14px;
  height: 14px;
}
.notif-item {
  background: #dff3ec;
  padding: 12px;
  border-radius: 8px;
  cursor: pointer;
  margin-bottom: 8px;
}
.notif-title {
  font-weight: 700;
}

.content-wrapper {
  max-width: 1100px;
  margin: 40px auto;
  padding: 0 20px;
}
.breadcrumb-header {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 30px;
}
.breadcrumb-header h1 {
  font-size: 28px;
  font-weight: 800;
}
.breadcrumb-header h1 span {
  color: #64748b;
  font-weight: 400;
}
.icon-main-bg {
  background: #730000;
  padding: 10px;
  border-radius: 8px;
}
.icon-main-img {
  width: 30px;
  height: 30px;
  filter: brightness(0) invert(1);
}
.main-details-grid {
  display: grid;
  grid-template-columns: 1.2fr 0.8fr;
  gap: 40px;
  margin-bottom: 30px;
}
.featured-image {
  width: 100%;
  border-radius: 15px;
  height: 400px;
  object-fit: cover;
  background: #e2e8f0;
}
.no-photos {
  color: #94a3b8;
  font-size: 14px;
  text-align: center;
  margin-top: 12px;
}
.gallery-nav {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
  margin-top: 15px;
}
.gallery-nav button {
  background: #ffffff;
  border: 1px solid #e6e6e6;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  font-size: 20px;
  line-height: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition:
    background 0.15s ease,
    transform 0.08s ease;
  padding: 0;
}
.gallery-nav button:hover {
  background: #f3f4f6;
  transform: translateY(-1px);
}
.gallery-nav button:active {
  transform: translateY(0);
}
.gallery-nav button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.thumbnails img {
  width: 60px;
  height: 45px;
  border-radius: 6px;
  cursor: pointer;
  opacity: 0.6;
}
.thumbnails img.active {
  opacity: 1;
  border: 2px solid #730000;
}
.info-sidebar {
  background: white;
  border: 1px solid #f1f5f9;
  border-radius: 20px;
  padding: 30px;
}
.category-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
}
.icon-type {
  width: 40px;
  height: 40px;
  object-fit: contain;
  padding: 6px;
  border-radius: 8px;
}
.status-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-weight: bold;
  font-size: 13px;
  margin-left: 10px; /* Adiciona o espaço entre o texto e o badge */
}
.resolvido {
  background: #dff3ec;
  color: #059669;
}
.em-resolucao {
  background: #fef9c3;
  color: #ca8a04;
}
.espera {
  background: #ffedd5;
  color: #ea580c;
}
.nao-resolvido {
  background: #fee2e2;
  color: #dc2626;
}

.user-chip {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 5px;
}
.avatar-xs {
  width: 40px;
  height: 40px;
  border-radius: 50%;
}

.team-section {
  border-top: 1px solid #f1f5f9;
  padding-top: 30px;
  margin-top: 40px;
}
.section-title {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 15px;
}
.section-title h3 {
  font-size: 20px;
  font-weight: 700;
  margin: 0;
}
.team-content {
  display: grid;
  grid-template-columns: 1fr 0.8fr;
  gap: 28px;
  margin-top: 18px;
}
.team-icon {
  background: #c2d9d3;
  padding: 8px;
  border-radius: 8px;
  width: 44px;
  height: 44px;
}
.workers-list,
.tech-info {
  background: #ffffff;
  border: 1px solid #f1f5f9;
  border-radius: 16px;
  padding: 18px;
}
.workers-grid {
  display: flex;
  gap: 30px;
  margin-top: 15px;
  flex-wrap: wrap;
}
.worker-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}
.worker-card img {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  object-fit: cover;
}
.team-placeholder {
  color: #64748b;
  font-size: 14px;
  margin-top: 10px;
}
.worker-actions {
  margin-top: 16px;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}
.report-btn {
  background: #730000;
  color: #fff;
  border: none;
  padding: 10px 14px;
  border-radius: 8px;
  font-weight: 700;
  cursor: pointer;
}
.report-btn-secondary {
  background: #ffffff;
  color: #730000;
  border: 1px solid #730000;
}
.resolve-panel {
  margin-top: 16px;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 16px;
  background: #f8fafc;
}
.resolve-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}
.resolve-grid label,
.resolve-feedback-label {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 13px;
  font-weight: 700;
  color: #334155;
}
.resolve-input,
.resolve-textarea {
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  padding: 10px 12px;
  font: inherit;
}
.resolve-textarea {
  min-height: 100px;
  resize: vertical;
}
.resolve-feedback-label {
  margin-top: 12px;
}
.resolve-actions {
  margin-top: 12px;
  display: flex;
  align-items: center;
  gap: 14px;
  flex-wrap: wrap;
}
.resolve-notice {
  color: #475569;
  font-size: 14px;
  margin: 0;
  font-weight: 600;
}
.not-found-state {
  text-align: center;
  padding: 80px 20px;
  color: #64748b;
}

/* ─── SECÇÃO DE AVALIAÇÃO DO CIDADÃO ─── */
.citizen-evaluation-section {
  margin: 40px 0;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 20px;
  padding: 30px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}
.citizen-evaluation-section h3 {
  color: #1a1a1a;
  font-size: 22px;
  margin: 0;
}
.instruction-text {
  color: #475569;
  font-size: 15px;
  margin-bottom: 20px;
}
.evaluation-form-box {
  background: #f8fafc;
  padding: 24px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}
.form-row {
  display: flex;
  gap: 20px;
  margin-bottom: 16px;
}
.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
}
.rating-group {
  max-width: 250px;
}
.form-group label {
  font-size: 14px;
  font-weight: 700;
  color: #1e293b;
}
.select-rating {
  background-color: white;
  cursor: pointer;
}
.wide-textarea {
  background-color: white;
  min-height: 120px;
}
.submit-eval-btn {
  background: #166534;
  padding: 12px 24px;
}
.submit-eval-btn:hover {
  background: #14532d;
}

.evaluation-result-box {
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  padding: 24px;
  border-radius: 12px;
  margin-top: 15px;
}
.eval-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #bbf7d0;
  padding-bottom: 12px;
  margin-bottom: 12px;
}
.stars {
  font-size: 18px;
  font-weight: 700;
  color: #166534;
}
.rating-number {
  font-size: 14px;
  color: #475569;
  margin-left: 6px;
}
.eval-date {
  font-size: 12px;
  color: #64748b;
}
.eval-text {
  font-size: 15px;
  line-height: 1.6;
  color: #0f172a;
  margin: 0;
}
.success-msg {
  color: #166534;
}
.error-msg {
  color: #b91c1c;
}

.map-link-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  color: #334155;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  margin-top: 8px;
  transition: all 0.2s;
}
.map-link-btn:hover {
  background: #e2e8f0;
  color: #0f172a;
}

@media (max-width: 900px) {
  .main-details-grid,
  .team-content,
  .resolve-grid {
    grid-template-columns: 1fr;
  }
}
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
  color: #2d5a27;
  font-weight: 600;
}
.logo-img-small {
  height: 80px;
}
.copyright {
  font-size: 0.8rem;
  color: #888;
  margin-top: 10px;
}
</style>
