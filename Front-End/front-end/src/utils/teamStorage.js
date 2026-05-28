import avatarImg from '@/assets/avatar.png'

const TEAMS_STORAGE_KEY = 'vc-comunica-admin-teams'
const WORKERS_STORAGE_KEY = 'vc-comunica-admin-workers'

const DEFAULT_WORKERS = [
  { id: 1, name: 'Olivia Rhye', email: 'olivia@untitledul.com', avatar: avatarImg, freguesia: 'Vila do Conde' },
  { id: 2, name: 'Phoenix Baker', email: 'phoenix@untitledul.com', avatar: avatarImg, freguesia: 'Azurara' },
  { id: 3, name: 'Lana Steiner', email: 'lana@untitledul.com', avatar: avatarImg, freguesia: 'Argivai' },
  { id: 4, name: 'Demi Wilkinson', email: 'demi@untitledul.com', avatar: avatarImg, freguesia: 'Mindelo' },
  { id: 5, name: 'Candice Wu', email: 'candice@untitledul.com', avatar: avatarImg, freguesia: 'Vila do Conde' },
  { id: 6, name: 'Natali Craig', email: 'natali@untitledul.com', avatar: avatarImg, freguesia: 'Azurara' },
  { id: 7, name: 'Drew Cano', email: 'drew@untitledul.com', avatar: avatarImg, freguesia: 'Argivai' },
  { id: 8, name: 'Orlando Diggs', email: 'orlando@untitledul.com', avatar: avatarImg, freguesia: 'Mindelo' },
  { id: 9, name: 'Andi Lane', email: 'andi@untitledul.com', avatar: avatarImg, freguesia: 'Vila do Conde' },
  { id: 10, name: 'Kate Morrison', email: 'kate@untitledul.com', avatar: avatarImg, freguesia: 'Azurara' },
  { id: 11, name: 'Ava Mitchell', email: 'ava@untitledul.com', avatar: avatarImg, freguesia: 'Argivai' },
  { id: 12, name: 'Noah Pereira', email: 'noah@untitledul.com', avatar: avatarImg, freguesia: 'Mindelo' },
]

const DEFAULT_TEAMS = [
  {
    id: 1,
    name: 'Engenharia e Vias',
    members: [
      { id: 101, name: 'Gabriel Silva', avatar: avatarImg, freguesia: 'Vila do Conde' },
      { id: 102, name: 'Sofia Almeida', avatar: avatarImg, freguesia: 'Azurara' },
      { id: 103, name: 'Lucas Pereira', avatar: avatarImg, freguesia: 'Argivai' },
    ],
    stats: { ativas: 26, concluidas: 55, naoResolvidas: 12 },
    maxPerRoute: 8,
  },
  {
    id: 2,
    name: 'Eletricidade',
    members: [
      { id: 104, name: 'Ana Sousa', avatar: avatarImg, freguesia: 'Mindelo' },
      { id: 105, name: 'Pedro Lima', avatar: avatarImg, freguesia: 'Vila do Conde' },
      { id: 106, name: 'Mariana Costa', avatar: avatarImg, freguesia: 'Azurara' },
    ],
    stats: { ativas: 26, concluidas: 55, naoResolvidas: 12 },
    maxPerRoute: 8,
  },
  {
    id: 3,
    name: 'Higiene Urbana',
    members: [
      { id: 107, name: 'Mariana Silva', avatar: avatarImg, freguesia: 'Argivai' },
      { id: 108, name: 'Rafael Costa', avatar: avatarImg, freguesia: 'Mindelo' },
      { id: 109, name: 'Ana Sousa', avatar: avatarImg, freguesia: 'Vila do Conde' },
    ],
    stats: { ativas: 26, concluidas: 55, naoResolvidas: 12 },
    maxPerRoute: 8,
  },
  {
    id: 4,
    name: 'Espaços Verdes',
    members: [
      { id: 110, name: 'Miguel Almeida', avatar: avatarImg, freguesia: 'Azurara' },
      { id: 111, name: 'Sofia Ferreira', avatar: avatarImg, freguesia: 'Argivai' },
      { id: 112, name: 'João Martins', avatar: avatarImg, freguesia: 'Mindelo' },
    ],
    stats: { ativas: 26, concluidas: 55, naoResolvidas: 12 },
    maxPerRoute: 8,
  },
]

function clone(value) {
  return JSON.parse(JSON.stringify(value))
}

function normalizeWorkers(workers, fallbackWorkers = DEFAULT_WORKERS) {
  const source = Array.isArray(workers) && workers.length > 0 ? workers : fallbackWorkers
  return source.map((worker, index) => ({
    id: worker.id ?? index + 1,
    name: worker.name || worker.nome || `Worker ${index + 1}`,
    email: worker.email || '',
    avatar: worker.avatar || avatarImg,
    freguesia: worker.freguesia || 'Vila do Conde',
  }))
}

function normalizeTeams(teams) {
  const source = Array.isArray(teams) && teams.length > 0 ? teams : DEFAULT_TEAMS
  return source.map((team, index) => ({
    id: team.id ?? index + 1,
    name: team.name || `Equipa ${index + 1}`,
    members: Array.isArray(team.members)
      ? team.members.map((member, memberIndex) => ({
          id: member.id ?? `${team.id ?? index + 1}-${memberIndex + 1}`,
          name: member.name || member.nome || `Membro ${memberIndex + 1}`,
          avatar: member.avatar || avatarImg,
          freguesia: member.freguesia || 'Vila do Conde',
        }))
      : [],
    stats: {
      ativas: team.stats?.ativas ?? 0,
      concluidas: team.stats?.concluidas ?? 0,
      naoResolvidas: team.stats?.naoResolvidas ?? 0,
    },
    maxPerRoute: team.maxPerRoute ?? 8,
  }))
}

function readStoredWorkers() {
  if (typeof localStorage === 'undefined') return clone(DEFAULT_WORKERS)

  try {
    const parsed = JSON.parse(localStorage.getItem(WORKERS_STORAGE_KEY) || 'null')
    const normalized = normalizeWorkers(parsed)
    localStorage.setItem(WORKERS_STORAGE_KEY, JSON.stringify(normalized))
    return normalized
  } catch {
    const normalized = normalizeWorkers(DEFAULT_WORKERS)
    localStorage.setItem(WORKERS_STORAGE_KEY, JSON.stringify(normalized))
    return normalized
  }
}

function saveWorkers(workers) {
  if (typeof localStorage === 'undefined') return
  localStorage.setItem(WORKERS_STORAGE_KEY, JSON.stringify(normalizeWorkers(workers)))
}

function readStoredTeams() {
  if (typeof localStorage === 'undefined') return clone(DEFAULT_TEAMS)

  try {
    const parsed = JSON.parse(localStorage.getItem(TEAMS_STORAGE_KEY) || 'null')
    const normalized = normalizeTeams(parsed)
    localStorage.setItem(TEAMS_STORAGE_KEY, JSON.stringify(normalized))
    return normalized
  } catch {
    const normalized = normalizeTeams(DEFAULT_TEAMS)
    localStorage.setItem(TEAMS_STORAGE_KEY, JSON.stringify(normalized))
    return normalized
  }
}

function saveTeams(teams) {
  if (typeof localStorage === 'undefined') return
  localStorage.setItem(TEAMS_STORAGE_KEY, JSON.stringify(normalizeTeams(teams)))
}

function getTeamById(teamId) {
  return readStoredTeams().find((team) => String(team.id) === String(teamId)) || null
}

function getWorkerById(workerId) {
  return readStoredWorkers().find((worker) => String(worker.id) === String(workerId)) || null
}

function getAssignedWorkerIds() {
  const teams = readStoredTeams()
  return new Set(teams.flatMap((team) => team.members.map((member) => String(member.id))))
}

function addWorkerToTeam(teamId, workerId) {
  const teams = readStoredTeams()
  const worker = getWorkerById(workerId)
  if (!worker) return { teams, added: false, reason: 'worker-not-found' }

  const targetTeam = teams.find((team) => String(team.id) === String(teamId))
  if (!targetTeam) return { teams, added: false, reason: 'team-not-found' }

  const assignedIds = getAssignedWorkerIds()
  if (assignedIds.has(String(workerId)) && !targetTeam.members.some((member) => String(member.id) === String(workerId))) {
    return { teams, added: false, reason: 'already-assigned' }
  }

  if (!targetTeam.members.some((member) => String(member.id) === String(workerId))) {
    targetTeam.members.push({ ...worker })
    saveTeams(teams)
  }

  return { teams, added: true }
}

function removeWorkerFromTeam(teamId, workerId) {
  const teams = readStoredTeams()
  const targetTeam = teams.find((team) => String(team.id) === String(teamId))
  if (!targetTeam) return teams

  targetTeam.members = targetTeam.members.filter((member) => String(member.id) !== String(workerId))
  saveTeams(teams)
  return teams
}

function persistTeamState(teams) {
  saveTeams(teams)
}

export {
  TEAMS_STORAGE_KEY,
  WORKERS_STORAGE_KEY,
  DEFAULT_TEAMS,
  DEFAULT_WORKERS,
  readStoredTeams,
  saveTeams,
  readStoredWorkers,
  saveWorkers,
  getTeamById,
  getWorkerById,
  getAssignedWorkerIds,
  addWorkerToTeam,
  removeWorkerFromTeam,
  persistTeamState,
}
