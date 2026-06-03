import avatarImg from '@/assets/avatar.png'
import { getAuthToken } from '@/utils/auth'

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.MODE === 'development' ? 'http://127.0.0.1:3000' : '')
const DEFAULT_MAX_PER_ROUTE = 8

const buildHeaders = (extraHeaders = {}, withAuth = false) => {
  const headers = { ...extraHeaders }

  if (withAuth) {
    const token = getAuthToken()
    if (token) {
      headers.Authorization = `Bearer ${token}`
    }
  }

  return headers
}

const fetchJson = async (endpoint, options = {}, withAuth = false) => {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: buildHeaders(options.headers || {}, withAuth),
  })

  if (!response.ok) {
    const payload = await response.json().catch(() => null)
    const errMsg = payload?.description || payload?.message || `Failed to load ${endpoint}`
    throw new Error(errMsg)
  }

  return response.json()
}

const getMunicipioNameById = (municipiosById, idFreguesia) =>
  municipiosById.get(String(idFreguesia)) || 'Sem freguesia'

const normalizeName = (value, fallback) => String(value || fallback || '').trim()

const isUnresolvedState = (estado) => /não resolvid|nao resolvid/i.test(String(estado || ''))
const isResolvedState = (estado) => /resolvid/i.test(String(estado || ''))
const isActiveState = (estado) =>
  /à espera da equipa|a espera da equipa|em resolução|em resolucao/i.test(String(estado || ''))

const buildTeamStats = (teamId, ocorrencias) => {
  const stats = {
    ativas: 0,
    concluidas: 0,
    naoResolvidas: 0,
  }

  ocorrencias.forEach((ocorrencia) => {
    if (String(ocorrencia.idEquipa ?? '') !== String(teamId)) {
      return
    }

    if (isUnresolvedState(ocorrencia.estado)) {
      stats.naoResolvidas += 1
      return
    }

    if (isResolvedState(ocorrencia.estado)) {
      stats.concluidas += 1
      return
    }

    if (isActiveState(ocorrencia.estado)) {
      stats.ativas += 1
      return
    }

    stats.ativas += 1
  })

  return stats
}

const normalizeWorker = (worker, municipiosById) => ({
  id: worker.idTrabalhador ?? worker.id,
  name: normalizeName(
    worker.nomeTrabalhador || worker.name,
    `Trabalhador ${worker.idTrabalhador ?? worker.id ?? ''}`,
  ),
  email: worker.emailTrabalhador || worker.email || '',
  avatar: worker.fotoPerfil || worker.avatar || avatarImg,
  freguesia: getMunicipioNameById(municipiosById, worker.idFreguesia),
  idFreguesia: worker.idFreguesia ?? null,
  idEquipa: worker.idEquipa ?? null,
})

const normalizeTeam = (equipa, index, municipalitiesById, workers, occurrenceStatsByTeamId) => {
  const teamId = equipa.idEquipa ?? equipa.id ?? index + 1
  const teamMembers = workers
    .filter((worker) => String(worker.idEquipa ?? '') === String(teamId))
    .map((worker) => normalizeWorker(worker, municipalitiesById))

  return {
    id: teamId,
    name: normalizeName(equipa.especializacao || equipa.name, `Equipa ${index + 1}`),
    freguesia: getMunicipioNameById(municipalitiesById, equipa.fregEquipa),
    freguesiaId: equipa.fregEquipa ?? null,
    members: teamMembers,
    stats: occurrenceStatsByTeamId.get(String(teamId)) || {
      ativas: 0,
      concluidas: 0,
      naoResolvidas: 0,
    },
    maxPerRoute: equipa.maxPerRoute ?? DEFAULT_MAX_PER_ROUTE,
  }
}

const buildTeamsFromBackend = ({ equipas, trabalhadores, municipios, ocorrencias }) => {
  const municipiosById = new Map(
    municipios.map((municipio) => [String(municipio.idFreguesia), municipio.nome]),
  )
  const occurrenceStatsByTeamId = new Map()

  equipas.forEach((equipa) => {
    const teamId = String(equipa.idEquipa ?? equipa.id)
    occurrenceStatsByTeamId.set(teamId, buildTeamStats(teamId, ocorrencias))
  })

  return equipas.map((equipa, index) =>
    normalizeTeam(equipa, index, municipiosById, trabalhadores, occurrenceStatsByTeamId),
  )
}

async function listTeams() {
  if (!API_BASE_URL) {
    throw new Error('Define VITE_API_URL para carregar as equipas da base de dados.')
  }

  const [equipas, trabalhadores, municipios, ocorrencias] = await Promise.all([
    fetchJson('/equipas'),
    fetchJson('/trabalhadores'),
    fetchJson('/municipios'),
    fetchJson('/ocorrencias', {}, true),
  ])

  return buildTeamsFromBackend({
    equipas: Array.isArray(equipas) ? equipas : [],
    trabalhadores: Array.isArray(trabalhadores) ? trabalhadores : [],
    municipios: Array.isArray(municipios) ? municipios : [],
    ocorrencias: Array.isArray(ocorrencias) ? ocorrencias : [],
  })
}

async function listWorkers() {
  if (!API_BASE_URL) {
    throw new Error('Define VITE_API_URL para carregar os trabalhadores da base de dados.')
  }

  const [trabalhadores, municipios] = await Promise.all([
    fetchJson('/trabalhadores'),
    fetchJson('/municipios'),
  ])

  const municipiosById = new Map(
    (Array.isArray(municipios) ? municipios : []).map((municipio) => [
      String(municipio.idFreguesia),
      municipio.nome,
    ]),
  )
  const normalizedWorkers = (Array.isArray(trabalhadores) ? trabalhadores : []).map((worker) =>
    normalizeWorker(worker, municipiosById),
  )

  return normalizedWorkers
}

async function listResources() {
  if (!API_BASE_URL) throw new Error('Define VITE_API_URL para carregar os recursos.')
  return fetchJson('/recursos')
}

async function createWorker(payload) {
  if (!API_BASE_URL) {
    throw new Error('Define VITE_API_URL para criar trabalhadores na base de dados.')
  }

  return fetchJson(
    '/trabalhadores',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    },
    true,
  )
}

async function assignWorkerToTeam(teamId, workerId) {
  if (!API_BASE_URL) {
    throw new Error('Define VITE_API_URL para alterar equipas na base de dados.')
  }

  await fetchJson(
    `/trabalhadores/${workerId}`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ idEquipa: Number(teamId) }),
    },
    true,
  )

  return { teams: await listTeams(), added: true }
}

async function unassignWorkerFromTeam(teamId, workerId) {
  if (!API_BASE_URL) {
    throw new Error('Define VITE_API_URL para alterar equipas na base de dados.')
  }

  await fetchJson(
    `/trabalhadores/${workerId}`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ idEquipa: null }),
    },
    true,
  )

  return listTeams()
}

async function deleteWorker(workerId) {
  if (!API_BASE_URL) {
    throw new Error('Define VITE_API_URL para apagar trabalhadores na base de dados.')
  }

  await fetchJson(
    `/trabalhadores/${workerId}`,
    {
      method: 'DELETE',
    },
    true,
  )
}

async function updateResource(resourceId, payload) {
  if (!API_BASE_URL) {
    throw new Error('Define VITE_API_URL para atualizar recursos na base de dados.')
  }

  return fetchJson(
    `/recursos/${resourceId}`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    },
    true,
  )
}

async function createResource(payload) {
  if (!API_BASE_URL) {
    throw new Error('Define VITE_API_URL para criar recursos na base de dados.')
  }

  return fetchJson(
    '/recursos',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    },
    true,
  )
}

export {
  API_BASE_URL,
  listTeams,
  listWorkers,
  createWorker,
  assignWorkerToTeam,
  unassignWorkerFromTeam,
  deleteWorker,
  listResources,
  updateResource,
  createResource,
}
