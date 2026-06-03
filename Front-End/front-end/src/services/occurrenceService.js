import { backendOccurrenceToUi, resolveOccurrenceCoordinates } from '@/utils/occurrenceStorage'
import { getAuthToken, getAuthUserType } from '@/utils/auth'

const API_BASE_URL = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || ''

function buildAuthHeaders(extraHeaders = {}) {
  const token = getAuthToken()
  return {
    ...extraHeaders,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

function mapOccurrencePayload(payload = {}) {
  const basePayload = {
    descricao: payload.descricao || payload.detalhes || '',
    localizacao: payload.localizacao || payload.location || '',
    dataOcorrencia: payload.dataOcorrencia || new Date().toISOString(),
    severidade: payload.severidade || 'Média',
    tipo_ocorrencia: payload.tipo_ocorrencia || payload.tipo || 'Iluminação',
  }

  if (payload.idFreguesia != null) {
    basePayload.idFreguesia = payload.idFreguesia
  }

  return basePayload
}

async function listOccurrences(onlyMine = false) {
  const token = getAuthToken()
  if (!token) {
    // If not logged in, show all occurrences
    return listAllOccurrences()
  }

  const userType = getAuthUserType()
  const isCitizen = userType === 'cidadao'
  const isAdminUser = userType === 'trabalhador_admin' || userType === 'responsavel'
  const isWorker = userType.startsWith('trabalhador') && !isAdminUser

  let endpoint
  if (isCitizen) {
    endpoint = onlyMine ? '/cidadaos/me/ocorrencias' : '/cidadaos/me/freguesia/ocorrencias'
  } else if (isAdminUser) {
    endpoint = '/ocorrencias'
  } else if (isWorker) {
    endpoint = '/trabalhadores/me/ocorrencias'
  } else {
    endpoint = '/ocorrencias'
  }

  // Allow using same-origin API when VITE_API_URL is not set (use relative paths)
  const base = API_BASE_URL || ''

  const response = await fetch(`${base}${endpoint}`, {
    headers: buildAuthHeaders(),
  })
  if (!response.ok) {
    throw new Error('Failed to load occurrences from backend')
  }

  const data = await response.json()
  const normalized = Array.isArray(data)
    ? data.map((occurrence) => backendOccurrenceToUi(occurrence))
    : []
  return normalized
}

// Fetch all occurrences (ignores user-type routing) — useful for admin views or global stats
async function listAllOccurrences() {
  const base = API_BASE_URL || ''
  const response = await fetch(`${base}/ocorrencias`, {
    headers: buildAuthHeaders(),
  })
  if (!response.ok) {
    throw new Error('Failed to load all occurrences from backend')
  }

  const data = await response.json()
  return Array.isArray(data) ? data.map((occurrence) => backendOccurrenceToUi(occurrence)) : []
}

// Try loading occurrences by a specific estado query (e.g. 'À espera da equipa')
async function listOccurrencesByState(estado) {
  const base = API_BASE_URL || ''
  const url = `${base}/ocorrencias?estado=${encodeURIComponent(String(estado || ''))}`
  const response = await fetch(url, { headers: buildAuthHeaders() })
  if (!response.ok) {
    const text = await response.text().catch(() => '')
    const err = new Error(`Failed to load occurrences by state: ${response.status} ${response.statusText} ${text}`)
    err.status = response.status
    throw err
  }
  const data = await response.json()
  return Array.isArray(data) ? data.map((occurrence) => backendOccurrenceToUi(occurrence)) : []
}

async function getOccurrence(occurrenceId) {
  if (!API_BASE_URL) {
    throw new Error('Define VITE_API_URL para carregar a ocorrência da base de dados.')
  }

  const response = await fetch(`${API_BASE_URL}/ocorrencias/${occurrenceId}`, {
    headers: buildAuthHeaders(),
  })
  if (!response.ok) {
    throw new Error('Failed to load occurrence from backend')
  }

  const data = await response.json()
  return backendOccurrenceToUi(data)
}

async function resolveOccurrence(occurrenceId, payload) {
  if (!API_BASE_URL) {
    throw new Error('Define VITE_API_URL para atualizar ocorrências na base de dados.')
  }

  const response = await fetch(`${API_BASE_URL}/ocorrencias/${occurrenceId}/resolve`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...buildAuthHeaders(),
    },
    body: JSON.stringify(payload || {}),
  })

  if (!response.ok) {
    throw new Error('Failed to resolve occurrence in backend')
  }

  const data = await response.json()
  return backendOccurrenceToUi(data)
}

async function listWorkerOccurrencesInResolution() {
  if (!API_BASE_URL) {
    throw new Error('Define VITE_API_URL para carregar as ocorrências em resolução.')
  }

  const response = await fetch(`${API_BASE_URL}/trabalhadores/me/ocorrencias/em-resolucao`, {
    headers: buildAuthHeaders(),
  })

  if (!response.ok) {
    throw new Error('Failed to load in-progress occurrences from backend')
  }

  const data = await response.json()
  return Array.isArray(data) ? data.map((occurrence) => backendOccurrenceToUi(occurrence)) : []
}

async function listWorkerHomeOccurrences() {
  if (!API_BASE_URL) {
    throw new Error('Define VITE_API_URL para carregar as ocorrências da home.')
  }

  const response = await fetch(`${API_BASE_URL}/trabalhadores/me/ocorrencias/home`, {
    headers: buildAuthHeaders(),
  })

  if (!response.ok) {
    throw new Error('Failed to load home occurrences from backend')
  }

  const data = await response.json()
  return Array.isArray(data) ? data.map((occurrence) => backendOccurrenceToUi(occurrence)) : []
}

async function listWorkerResolvedOccurrences() {
  if (!API_BASE_URL) {
    throw new Error('Define VITE_API_URL para carregar as ocorrências resolvidas.')
  }

  const response = await fetch(`${API_BASE_URL}/trabalhadores/me/ocorrencias/resolvidas`, {
    headers: buildAuthHeaders(),
  })

  if (!response.ok) {
    throw new Error('Failed to load resolved occurrences from backend')
  }

  const data = await response.json()
  return Array.isArray(data) ? data.map((occurrence) => backendOccurrenceToUi(occurrence)) : []
}

async function createOccurrence(payload, files = null) {
  if (!API_BASE_URL) {
    throw new Error('Define VITE_API_URL para criar ocorrências na base de dados.')
  }

  const userType = getAuthUserType()
  const isCitizen = userType === 'cidadao'
  const endpoint = isCitizen ? '/cidadaos/me/ocorrencias' : '/ocorrencias'
  const mappedPayload = mapOccurrencePayload(payload)

  if (!isCitizen) {
    throw new Error(
      'Criação de ocorrências pelo trabalhador ainda não está ligada ao backend deste front.',
    )
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...buildAuthHeaders(),
    },
    body: JSON.stringify(mappedPayload),
  })

  if (!response.ok) {
    throw new Error('Failed to create occurrence in backend')
  }

  const data = await response.json()

  // If files were provided, upload them to the ocorrencia fotos endpoint
  try {
    const occurrenceId = data.idOcorrencia ?? data.id
    if (files && files.length && occurrenceId) {
      const form = new FormData()
      // files can be a FileList or Array
      for (const f of Array.from(files)) {
        form.append('files', f)
      }

      const uploadResponse = await fetch(`${API_BASE_URL}/ocorrencias/${occurrenceId}/fotos`, {
        method: 'POST',
        headers: buildAuthHeaders(),
        body: form,
      })

      if (!uploadResponse.ok) {
        // do not fail the whole flow, but log
        console.warn('Failed to upload occurrence fotos')
      } else {
        // merge fotos into returned occurrence object if needed
        const uploadPayload = await uploadResponse.json().catch(() => null)
        if (uploadPayload && uploadPayload.foto) {
          data.foto = uploadPayload.foto
        }
      }
    }
  } catch (e) {
    console.warn('Error uploading fotos after creating ocorrencia', e)
  }

  return backendOccurrenceToUi(data)
}

async function listOccurrenceMarkers() {
  if (!API_BASE_URL) {
    throw new Error('Define VITE_API_URL para carregar os marcadores da base de dados.')
  }

  const occurrences = await listOccurrences()
  return occurrences.map((occurrence) => ({
    ...occurrence,
    ...resolveOccurrenceCoordinates(occurrence),
  }))
}

export {
  listOccurrences,
  listAllOccurrences,
  listOccurrencesByState,
  getOccurrence,
  createOccurrence,
  resolveOccurrence,
  listWorkerOccurrencesInResolution,
  listWorkerHomeOccurrences,
  listWorkerResolvedOccurrences,
  listOccurrenceMarkers,
  API_BASE_URL,
}
