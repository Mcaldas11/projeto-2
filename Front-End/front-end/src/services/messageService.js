import { getAuthToken } from '@/utils/auth'

const API_BASE_URL = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || ''

function buildAuthHeaders(extraHeaders = {}) {
  const token = getAuthToken()
  return {
    ...extraHeaders,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

/**
 * Create a new message (for citizen feedback on occurrences)
 * @param {Object} messageData - Message data
 * @param {string} messageData.texto - Message text
 * @param {string} messageData.dataMensagem - Message date (ISO string)
 * @param {number} messageData.classificacao - Rating from 0-5 (optional)
 * @param {number} messageData.idCidadao - Citizen ID
 * @param {number} messageData.idOcorrencia - Occurrence ID
 * @returns {Promise<Object>} Created message
 */
export async function createMensagem(messageData) {
  if (!API_BASE_URL) {
    throw new Error('Define VITE_API_URL para criar mensagens no backend.')
  }

  const response = await fetch(`${API_BASE_URL}/mensagens`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...buildAuthHeaders(),
    },
    body: JSON.stringify(messageData),
  })

  if (!response.ok) {
    throw new Error('Failed to create message in backend')
  }

  return response.json()
}

/**
 * Get messages for a specific occurrence
 * @param {number} occurrenceId - Occurrence ID
 * @param {number} [citizenId] - Optional Citizen ID to filter by
 * @returns {Promise<Array>} List of messages
 */
export async function getMensagensByOcorrencia(occurrenceId, citizenId = null) {
  if (!API_BASE_URL) {
    throw new Error('Define VITE_API_URL para buscar mensagens no backend.')
  }

  let url = `${API_BASE_URL}/mensagens?idOcorrencia=${occurrenceId}`
  if (citizenId) {
    url += `&idCidadao=${citizenId}`
  }

  const response = await fetch(url, {
    headers: buildAuthHeaders(),
  })

  if (!response.ok) {
    throw new Error('Failed to fetch messages from backend')
  }

  return response.json()
}

/**
 * Update a message
 * @param {number} messageId - Message ID
 * @param {Object} messageData - Updated message data
 * @returns {Promise<Object>} Updated message
 */
export async function updateMensagem(messageId, messageData) {
  if (!API_BASE_URL) {
    throw new Error('Define VITE_API_URL para atualizar mensagens no backend.')
  }

  const response = await fetch(`${API_BASE_URL}/mensagens/${messageId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...buildAuthHeaders(),
    },
    body: JSON.stringify(messageData),
  })

  if (!response.ok) {
    throw new Error('Failed to update message in backend')
  }

  return response.json()
}

/**
 * Delete a message
 * @param {number} messageId - Message ID
 * @returns {Promise<void>}
 */
export async function deleteMensagem(messageId) {
  if (!API_BASE_URL) {
    throw new Error('Define VITE_API_URL para apagar mensagens no backend.')
  }

  const response = await fetch(`${API_BASE_URL}/mensagens/${messageId}`, {
    method: 'DELETE',
    headers: buildAuthHeaders(),
  })

  if (!response.ok) {
    throw new Error('Failed to delete message from backend')
  }

  return response.json()
}
