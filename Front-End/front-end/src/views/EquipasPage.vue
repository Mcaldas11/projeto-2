<template>
  <div class="page-container">
    <!-- NAVBAR LIMPA -->
    <nav class="navbar">
      <div class="logo-area">
        <img src="@/assets/logoP.png" alt="VC Comunica Logo" class="logo-img" />
      </div>
      <div class="nav-icons">
        <img
          :src="notifications.length === 0 ? notifOff : notifOn"
          alt="notifications"
          class="icon notification"
          @click="toggleNotif"
        />
        <span class="icon menu-hamburger" @click="toggleMenu">☰</span>

        <SidebarMenu v-model="showMenu" />

        <!-- Painel de Notificações -->
        <div v-if="showNotif" class="notifications">
          <h4>Notificações da Equipa</h4>
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
            <div v-if="notifications.length === 0" class="notif-empty">Sem notificações ativas</div>
          </div>
        </div>
      </div>
    </nav>

    <!-- CONTEÚDO PRINCIPAL DA EQUIPA -->
    <main class="content-wrapper">
      <!-- CABEÇALHO DINÂMICO DA EQUIPA (ATUALIZA COM OS SELETORES) -->
      <header class="team-header-card">
        <div class="team-identity">
          <span class="team-number-badge">Freguesia Ativa</span>
          <h1 class="team-title">{{ selectedTeamLabel }}</h1>
          <p class="team-location">
            <span class="geo-icon">📍</span> Setor de Atuação:
            <strong>{{ selectedFreguesiaLabel }}</strong> (Código CSV: {{ selectedFreguesiaId }})
          </p>
        </div>
        <div class="team-stats-overview">
          <div class="stat-mini-box">
            <span class="stat-val">⭐ {{ teamStats.mediaAvaliacoes }}</span>
            <span class="stat-lbl">Média de Trabalho</span>
          </div>
          <div class="stat-mini-box">
            <span class="stat-val">{{ ocorrencias.length }}</span>
            <span class="stat-lbl">Ocorrências Ativas</span>
          </div>
        </div>
      </header>

      <!-- BARRA DE SELEÇÃO AJUSTADA: EQUIPAS E FREGUESIAS LADO A LADO -->
      <div class="team-selector-bar">
        <div class="selector-group">
          <label class="selector-label">EQUIPAS:</label>
          <select
            v-model="selectedTeamId"
            @change="updateDashboard"
            class="display-box compact-select"
          >
            <option v-for="team in availableTeams" :key="team.id" :value="team.id">
              {{ team.especializacao }}
            </option>
          </select>
        </div>

        <div class="selector-group">
          <label class="selector-label">FREGUESIA:</label>
          <select
            v-model="selectedFreguesiaId"
            @change="updateDashboard"
            class="display-box compact-select"
          >
            <option v-for="freg in availableFreguesias" :key="freg.id" :value="freg.id">
              {{ freg.nome }}
            </option>
          </select>
        </div>
      </div>

      <!-- GRID SUPERIOR: TRABALHADORES E RECURSOS -->
      <div class="dashboard-grid-top">
        <!-- SECÇÃO: TRABALHADORES -->
        <section class="dashboard-card workers-section">
          <div class="card-header-actions">
            <h3>👷 Trabalhadores Atolados à Zona ({{ trabalhadores.length }})</h3>
          </div>
          <div class="workers-list">
            <div v-for="worker in trabalhadores" :key="worker.id" class="worker-row-item">
              <div class="worker-meta-side">
                <div class="worker-avatar-mini">{{ worker.nome[0] }}{{ worker.apelido[0] }}</div>
                <div>
                  <h5 class="worker-name">{{ worker.nome }} {{ worker.apelido }}</h5>
                  <span class="worker-role-tag">{{ worker.cargo }}</span>
                </div>
              </div>
              <span :class="['worker-status', worker.disponibilidade]">{{
                worker.disponibilidade
              }}</span>
            </div>
          </div>
        </section>

        <!-- SECÇÃO: RECURSOS DA EQUIPA -->
        <section class="dashboard-card resources-section">
          <div class="card-header-actions">
            <h3>⚙️ Recursos & Equipamentos</h3>
          </div>
          <div class="resources-container">
            <div class="resource-category">
              <h5>Frota Alocada</h5>
              <div class="resource-pill" v-for="v in recursos.veiculos" :key="v">{{ v }}</div>
            </div>
            <div class="resource-category">
              <h5>Equipamento Técnico & Stock</h5>
              <table class="minimal-resource-table">
                <tbody>
                  <tr v-for="item in recursos.ferramentas" :key="item.nome">
                    <td>{{ item.nome }}</td>
                    <td class="text-right">
                      <strong>{{ item.qtd }}</strong> unid.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>

      <!-- SECÇÃO CENTRAL: OCORRÊNCIAS E ROTAS -->
      <div class="dashboard-grid-main">
        <!-- SECÇÃO: OCORRÊNCIAS ATRIBUÍDAS -->
        <section class="dashboard-card occurrence-block">
          <div class="card-header-actions">
            <h3>📋 Ocorrências em {{ selectedFreguesiaLabel }}</h3>
            <span class="count-badge">{{ ocorrencias.length }}</span>
          </div>
          <div class="table-container">
            <table class="occ-table">
              <thead>
                <tr>
                  <th>Situação</th>
                  <th>Problema</th>
                  <th>Localização</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="occ in ocorrencias" :key="occ.id">
                  <td>
                    <span :class="['status-badge', occ.statusClass]">{{ occ.situacao }}</span>
                  </td>
                  <td class="font-bold">{{ occ.tipo }}</td>
                  <td class="details-cell">{{ occ.local }}</td>
                </tr>
                <tr v-if="ocorrencias.length === 0">
                  <td colspan="3" class="text-center empty-table-text">
                    Nenhuma ocorrência ativa para esta combinação nesta freguesia.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <!-- SECÇÃO: ROTAS DA EQUIPA -->
        <section class="dashboard-card routes-block">
          <div class="card-header-actions">
            <h3>🗺️ Rotas de Trabalho & Piquete</h3>
          </div>
          <div class="routes-vertical-stack">
            <div v-for="route in rotas" :key="route.id" class="route-item-card">
              <div class="route-details-left">
                <h4>{{ route.codigo }} - {{ route.nome }}</h4>
                <p>{{ route.itinerario }}</p>
              </div>
              <div class="route-meta-right">
                <span class="badge-date">{{ route.data }}</span>
                <span class="badge-time">⏰ {{ route.turno }}</span>
              </div>
            </div>
          </div>
        </section>
      </div>

      <!-- SECÇÃO: AVALIAÇÕES DO TRABALHO -->
      <section class="dashboard-card reviews-block-section">
        <h3 class="reviews-main-title">
          ⭐ Avaliações do Trabalho em {{ selectedFreguesiaLabel }}
        </h3>
        <p class="section-subtitle">
          Feedback direto enviado pelos munícipes após a resolução das ocorrências.
        </p>

        <div class="reviews-masonry">
          <div v-for="rev in avaliacoes" :key="rev.id" class="review-card-item">
            <div class="review-top-meta">
              <div>
                <h5>{{ rev.autor }}</h5>
                <span class="review-date">{{ rev.data }}</span>
              </div>
              <div class="review-stars">
                <span
                  v-for="star in 5"
                  :key="star"
                  :class="['star', { active: star <= rev.estrelas }]"
                  >★</span
                >
              </div>
            </div>
            <p class="review-text-content">"{{ rev.comentario }}"</p>
            <div class="review-linked-occ">
              <span
                >Ocorrência associada: <strong>{{ rev.ocorrenciaTipo }}</strong></span
              >
            </div>
          </div>
        </div>
      </section>

      <!-- BOTÃO INFERIOR -->
      <button class="btn-logout" @click="voltarPainel">Voltar ao Painel Geral</button>
    </main>

    <Footer />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import Footer from '@/components/footer.vue'
import SidebarMenu from '@/components/SidebarMenu.vue'
import notifOn from '@/assets/notificationson.png'
import notifOff from '@/assets/notificationsoff.png'

// As 3 equipas únicas extraídas do escopo do ficheiro "equipas_vcc.csv"
const availableTeams = ref([
  { id: 1, especializacao: 'Estradas e passeios' },
  { id: 2, especializacao: 'Sinalização de trânsito' },
  { id: 3, especializacao: 'Iluminação urbana' },
])

// Freguesias correspondentes aos IDs do CSV mapeados para os seus nomes reais em Vila do Conde
const availableFreguesias = ref([
  { id: 1, nome: 'Vila do Conde' },
  { id: 2, nome: 'Azurara' },
  { id: 3, nome: 'Árvore' },
  { id: 4, nome: 'Aveleda' },
  { id: 5, nome: 'Bagunte' },
  { id: 6, nome: 'Canidelo' },
  { id: 7, nome: 'Fajozes' },
  { id: 8, nome: 'Gião' },
  { id: 9, nome: 'Guilhabreu' },
  { id: 10, nome: 'Labruge' },
])

// Estados dos Seletores
const selectedTeamId = ref(1)
const selectedFreguesiaId = ref(1)

// Computed Labels para o Cabeçalho
const selectedTeamLabel = computed(() => {
  const match = availableTeams.value.find((t) => t.id === selectedTeamId.value)
  return match ? match.especializacao : ''
})

const selectedFreguesiaLabel = computed(() => {
  const match = availableFreguesias.value.find((f) => f.id === selectedFreguesiaId.value)
  return match ? match.nome : ''
})

// Mocks Reativos de Ocorrências (Atualizam dinamicamente conforme a combinação de filtros)
const ocorrencias = ref([
  {
    id: 301,
    tipo: 'Abatimento de Via Grave',
    situacao: 'Em resolução',
    statusClass: 'em-resolucao',
    local: 'Rua das Flores, Intersecção Sul',
  },
  {
    id: 302,
    tipo: 'Passeio Danificado por Raízes',
    situacao: 'Espera',
    statusClass: 'espera',
    local: 'Avenida Principal, Lote 4B',
  },
])

function updateDashboard() {
  // Simulação de alteração de dados baseada na Freguesia e Tipo de Equipa selecionados
  if (selectedTeamId.value === 1) {
    ocorrencias.value = [
      {
        id: 301,
        tipo: 'Abatimento de Via Grave',
        situacao: 'Em resolução',
        statusClass: 'em-resolucao',
        local: `Zona Central de ${selectedFreguesiaLabel.value}`,
      },
      {
        id: 302,
        tipo: 'Passeio Danificado',
        situacao: 'Espera',
        statusClass: 'espera',
        local: 'Rua de Acesso Secundário',
      },
    ]
  } else if (selectedTeamId.value === 2) {
    ocorrencias.value = [
      {
        id: 401,
        tipo: 'Sinal Stop Encoberto',
        situacao: 'Em resolução',
        statusClass: 'em-resolucao',
        local: `Cruzamento Principal em ${selectedFreguesiaLabel.value}`,
      },
    ]
  } else {
    ocorrencias.value = [
      {
        id: 501,
        tipo: 'Luminárias Apagadas',
        situacao: 'Espera',
        statusClass: 'espera',
        local: `Alinhamento de Postes em ${selectedFreguesiaLabel.value}`,
      },
    ]
  }
}

// Restantes estados base e auxiliares
const showNotif = ref(false)
const showMenu = ref(false)
const notifications = ref([{ id: 1, title: 'Atualização', body: 'Plano de rotas sincronizado.' }])

const toggleNotif = () => {
  showNotif.value = !showNotif.value
  showMenu.value = false
}
const toggleMenu = () => {
  showMenu.value = !showMenu.value
  showNotif.value = false
}
const removeNotif = (i) => notifications.value.splice(i, 1)

const teamStats = ref({ mediaAvaliacoes: '4.8' })
const trabalhadores = ref([
  {
    id: 1,
    nome: 'Carlos',
    apelido: 'Sousa',
    cargo: 'Encarregado Técnico',
    disponibilidade: 'Em Serviço',
  },
  {
    id: 2,
    nome: 'Manuel',
    apelido: 'Antunes',
    cargo: 'Operador de Piquete',
    disponibilidade: 'Em Serviço',
  },
  {
    id: 3,
    nome: 'Ricardo',
    apelido: 'Pereira',
    cargo: 'Técnico Especialista',
    disponibilidade: 'Disponível',
  },
])

const recursos = ref({
  veiculos: ['Carrinha Caixa Aberta (44-UX-12)', 'Camião de Elevação Articulado'],
  ferramentas: [
    { nome: 'Gerador Elétrico Portátil', qtd: 1 },
    { nome: 'Martelo Demolidor Pneumático', qtd: 2 },
    { nome: 'Sinalizadores Luminosos LED', qtd: 12 },
  ],
})

const rotas = ref([
  {
    id: 51,
    codigo: 'R-NORTE',
    nome: 'Piquete Contínuo Marginal',
    itinerario: 'Eixo Marginal - Porto de Pesca',
    data: 'Hoje',
    turno: '08:00 - 16:00',
  },
])

const avaliacoes = ref([
  {
    id: 1,
    autor: 'Anabela Costa',
    estrelas: 5,
    comentario:
      'Reparação rapidíssima do buraco na estrada após a denúncia na aplicação. Equipa simpática!',
    data: '22 Mai 2026',
    ocorrenciaTipo: 'Reparação de Via',
  },
  {
    id: 2,
    autor: 'Rui Fernandes',
    estrelas: 4,
    comentario:
      'Trabalho limpo e seguro. Deixaram a via perfeitamente sinalizada durante o processo.',
    data: '18 Mai 2026',
    ocorrenciaTipo: 'Nivelamento de Calçada',
  },
])

function voltarPainel() {
  alert('A retornar ao Painel Geral...')
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;800&display=swap');

.page-container {
  font-family: Arial, sans-serif;
  color: #1a1a1a;
  background-color: #ffffff;
  min-height: 100vh;
}

/* NAVBAR LIMPA */
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 80px;
  border-bottom: 1px solid #f1f5f9;
}
.logo-img {
  height: 40px;
}
.nav-icons {
  display: flex;
  align-items: center;
  gap: 24px;
  position: relative;
}
.icon {
  cursor: pointer;
}
.icon.notification {
  width: 26px;
  height: 26px;
  object-fit: contain;
}
.menu-hamburger {
  font-size: 24px;
  color: #1e293b;
}

/* NOTIFICAÇÕES */
.notifications {
  position: absolute;
  top: 45px;
  right: 0;
  width: 320px;
  background: #ffffff;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  z-index: 100;
}
.notifications h4 {
  margin: 0 0 12px 0;
  font-family: 'Montserrat', sans-serif;
  font-weight: 700;
}
.notif-item {
  background: #dff3ec;
  padding: 10px;
  border-radius: 8px;
  margin-bottom: 8px;
  font-size: 13px;
}
.notif-title {
  font-weight: 700;
}
.notif-empty {
  color: #94a3b8;
  text-align: center;
  font-size: 13px;
  padding: 10px 0;
}

/* CONTEÚDO EMBALADO */
.content-wrapper {
  max-width: 1100px;
  margin: 40px auto;
  padding: 0 40px;
}

/* CARD DE CABEÇALHO */
.team-header-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f8fafc;
  padding: 32px;
  border-radius: 16px;
  margin-bottom: 30px;
  border: 1px solid #edf2f7;
}
.team-number-badge {
  background: #730000;
  color: #fff;
  padding: 4px 12px;
  border-radius: 6px;
  font-weight: 800;
  font-size: 12px;
  text-transform: uppercase;
}
.team-title {
  font-family: 'Montserrat', sans-serif;
  font-size: 28px;
  font-weight: 800;
  color: #1e293b;
  margin: 12px 0 6px 0;
}
.team-location {
  color: #475569;
  margin: 0;
  font-size: 15px;
}
.team-stats-overview {
  display: flex;
  gap: 16px;
}
.stat-mini-box {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  padding: 14px 20px;
  border-radius: 12px;
  text-align: center;
  min-width: 100px;
}
.stat-val {
  display: block;
  font-size: 20px;
  font-weight: 800;
  color: #1e293b;
}
.stat-lbl {
  font-size: 11px;
  color: #64748b;
  font-weight: 600;
}

/* BARRA DE SELEÇÃO BILATERAL (EQUIPAS + FREGUESIAS LADO A LADO) */
.team-selector-bar {
  display: flex;
  align-items: center;
  gap: 40px;
  margin-bottom: 35px;
  padding: 20px;
  background: #ffffff;
  border: 1.5px dashed #cbd5e1;
  border-radius: 12px;
}
.selector-group {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}
.selector-label {
  font-family: 'Montserrat', sans-serif;
  font-size: 13px;
  font-weight: 800;
  color: #1e293b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  white-space: nowrap;
}
.compact-select {
  width: 100%;
  max-width: 320px;
  padding: 10px 14px;
  font-size: 14px;
  cursor: pointer;
}

/* LAYOUT DE CARDS GERAIS */
.dashboard-card {
  background: #ffffff;
  border: 1px solid #f1f5f9;
  border-radius: 14px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);
}
.dashboard-card h3 {
  font-family: 'Montserrat', sans-serif;
  font-size: 16px;
  font-weight: 800;
  color: #1e293b;
  margin: 0;
}
.card-header-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

/* GRIDS */
.dashboard-grid-top {
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  gap: 30px;
  margin-bottom: 30px;
}
.workers-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.worker-row-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 14px;
  background: #f8fafc;
  border-radius: 10px;
}
.worker-meta-side {
  display: flex;
  align-items: center;
  gap: 12px;
}
.worker-avatar-mini {
  width: 36px;
  height: 36px;
  background: #cfe8df;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  color: #0b2b2b;
}
.worker-name {
  margin: 0;
  font-size: 14px;
  font-weight: 700;
}
.worker-role-tag {
  font-size: 11px;
  color: #64748b;
}
.worker-status {
  font-size: 11px;
  font-weight: 800;
  padding: 2px 8px;
  border-radius: 12px;
}
.worker-status.Em {
  background: #dff3ec;
  color: #059669;
}
.worker-status.Disponível {
  background: #e0f2fe;
  color: #0369a1;
}

/* RECURSOS */
.resources-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.resource-category h5 {
  margin: 0 0 8px 0;
  font-size: 13px;
  color: #64748b;
  font-weight: 700;
}
.resource-pill {
  background: #f1f5f9;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  display: inline-block;
  margin-right: 8px;
  margin-bottom: 6px;
}
.minimal-resource-table {
  width: 100%;
  font-size: 13px;
  border-collapse: collapse;
}
.minimal-resource-table td {
  padding: 6px 0;
  border-bottom: 1px solid #f8fafc;
}
.text-right {
  text-align: right;
}

/* GRID CENTRAL */
.dashboard-grid-main {
  display: grid;
  grid-template-columns: 1.4fr 1fr;
  gap: 30px;
  margin-bottom: 40px;
}
.count-badge {
  background: #f1f5f9;
  color: #475569;
  padding: 2px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 800;
}

/* TABELA DE OCORRÊNCIAS */
.table-container {
  border: 1px solid #f1f5f9;
  border-radius: 10px;
  overflow: hidden;
}
.occ-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
  text-align: left;
}
.occ-table th {
  padding: 12px;
  background: #f8fafc;
  color: #94a3b8;
  font-weight: 700;
  border-bottom: 1px solid #f1f5f9;
}
.occ-table td {
  padding: 12px;
  border-bottom: 1px solid #f1f5f9;
}
.empty-table-text {
  color: #94a3b8;
  padding: 20px !important;
}
.font-bold {
  font-weight: 700;
}
.status-badge {
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 800;
}
.em-resolucao {
  background: #fef9c3;
  color: #ca8a04;
}
.espera {
  background: #ffedd5;
  color: #ea580c;
}
.details-cell {
  color: #64748b;
}

/* ROTAS */
.routes-vertical-stack {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.route-item-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f8fafc;
  border-left: 4px solid #730000;
  padding: 14px;
  border-radius: 8px;
}
.route-details-left h4 {
  margin: 0 0 4px 0;
  font-size: 14px;
  font-weight: 700;
  color: #1e293b;
}
.route-details-left p {
  margin: 0;
  font-size: 12px;
  color: #64748b;
}
.route-meta-right {
  text-align: right;
  display: flex;
  flex-direction: column;
  gap: 2px;
  font-size: 12px;
}
.badge-date {
  font-weight: 700;
  color: #730000;
}
.badge-time {
  color: #475569;
}

/* AVALIAÇÕES */
.reviews-block-section {
  margin-bottom: 40px;
  display: block;
}
.reviews-main-title {
  font-family: 'Montserrat', sans-serif;
  font-size: 18px;
  font-weight: 800;
  color: #1e293b;
  margin: 0 0 6px 0;
}
.section-subtitle {
  display: block;
  margin: 0 0 24px 0;
  font-size: 14px;
  color: #64748b;
  line-height: 1.4;
}
.reviews-masonry {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}
.review-card-item {
  background: #f8fafc;
  padding: 20px;
  border-radius: 12px;
  border: 1px solid #edf2f7;
}
.review-top-meta {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}
.review-top-meta h5 {
  margin: 0;
  font-size: 14px;
  font-weight: 700;
}
.review-date {
  font-size: 11px;
  color: #94a3b8;
}
.review-stars {
  color: #ffb400;
  font-size: 13px;
}
.star {
  color: #ccc;
}
.star.active {
  color: #ffb400;
}
.review-text-content {
  margin: 0 0 12px 0;
  font-style: italic;
  font-size: 13px;
  color: #334155;
  line-height: 1.5;
}
.review-linked-occ {
  font-size: 11px;
  color: #64748b;
  border-top: 1px dashed #e2e8f0;
  padding-top: 8px;
}

/* CAMPOS FORM */
.display-box {
  background: #f8fafc;
  width: 100%;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  color: #1e293b;
  font-weight: 600;
  box-sizing: border-box;
}

/* BOTÃO VOLTAR */
.btn-logout {
  width: 100%;
  padding: 16px;
  margin-top: 20px;
  background: #ff383c;
  color: #fff;
  border: none;
  border-radius: 12px;
  font-family: 'Montserrat', sans-serif;
  font-weight: 600;
  font-size: 15px;
  cursor: pointer;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}
.btn-logout:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(255, 56, 60, 0.35);
}

@media (max-width: 992px) {
  .team-selector-bar {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
  }
  .selector-group {
    width: 100%;
  }
  .compact-select {
    max-width: 100%;
  }
  .dashboard-grid-top,
  .dashboard-grid-main,
  .reviews-masonry {
    grid-template-columns: 1fr;
  }
  .team-header-card {
    flex-direction: column;
    align-items: flex-start;
    gap: 20px;
  }
  .navbar,
  .content-wrapper {
    padding: 20px;
  }
}
</style>
