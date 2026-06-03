const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.MODE === 'development' ? 'http://127.0.0.1:3000' : '')

async function listFreguesias() {
  if (!API_BASE_URL) {
    throw new Error('Define VITE_API_URL para carregar as freguesias da base de dados.')
  }

  try {
    const response = await fetch(`${API_BASE_URL}/municipios`)
    if (!response.ok) {
      throw new Error('Falha ao carregar as freguesias da base de dados.')
    }

    const data = await response.json()
    return Array.isArray(data) ? data : []
  } catch {
    throw new Error('Falha ao carregar as freguesias da base de dados.')
  }
}

export { API_BASE_URL, listFreguesias }
