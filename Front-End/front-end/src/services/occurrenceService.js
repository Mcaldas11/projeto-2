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

async function listOccurrences() {
  if (!API_BASE_URL) {
    throw new Error('Define VITE_API_URL para carregar as ocorrências da base de dados.')
  }

  const userType = getAuthUserType()
  const endpoint = userType === 'cidadao' ? '/cidadaos/me/ocorrencias' : '/ocorrencias'

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
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

async function createOccurrence(payload) {
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

export { listOccurrences, getOccurrence, createOccurrence, listOccurrenceMarkers, API_BASE_URL }
