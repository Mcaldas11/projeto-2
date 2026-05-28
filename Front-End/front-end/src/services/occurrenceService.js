import {
  addOccurrence,
  getOccurrenceById,
  getOccurrenceMarkers,
  readStoredOccurrences,
  saveOccurrences,
} from '@/utils/occurrenceStorage'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ''

async function listOccurrences() {
  if (!API_BASE_URL) {
    return readStoredOccurrences()
  }

  // Backend-ready hook: replace this with the real API endpoint when the server is available.
  const response = await fetch(`${API_BASE_URL}/ocorrencias`)
  if (!response.ok) {
    throw new Error('Failed to load occurrences from backend')
  }

  const data = await response.json()
  saveOccurrences(Array.isArray(data) ? data : [])
  return readStoredOccurrences()
}

async function getOccurrence(occurrenceId) {
  if (!API_BASE_URL) {
    return getOccurrenceById(occurrenceId)
  }

  const response = await fetch(`${API_BASE_URL}/ocorrencias/${occurrenceId}`)
  if (!response.ok) {
    throw new Error('Failed to load occurrence from backend')
  }

  return response.json()
}

async function createOccurrence(payload) {
  if (!API_BASE_URL) {
    return addOccurrence(payload)
  }

  const response = await fetch(`${API_BASE_URL}/ocorrencias`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error('Failed to create occurrence in backend')
  }

  return response.json()
}

async function listOccurrenceMarkers() {
  if (!API_BASE_URL) {
    return getOccurrenceMarkers()
  }

  const occurrences = await listOccurrences()
  return occurrences
}

export { listOccurrences, getOccurrence, createOccurrence, listOccurrenceMarkers, API_BASE_URL }
