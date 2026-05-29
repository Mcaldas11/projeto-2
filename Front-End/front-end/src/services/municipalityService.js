const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ''

const fallbackFreguesias = [
  { idFreguesia: 1, nome: 'Árvore' },
  { idFreguesia: 2, nome: 'Aveleda' },
  { idFreguesia: 3, nome: 'Azurara' },
  { idFreguesia: 4, nome: 'Fajozes' },
  { idFreguesia: 5, nome: 'Gião' },
  { idFreguesia: 6, nome: 'Guilhabreu' },
  { idFreguesia: 7, nome: 'Junqueira' },
  { idFreguesia: 8, nome: 'Labruge' },
  { idFreguesia: 9, nome: 'Macieira da Maia' },
  { idFreguesia: 10, nome: 'Mindelo' },
  { idFreguesia: 11, nome: 'Modivas' },
  { idFreguesia: 12, nome: 'Vila Chã' },
  { idFreguesia: 13, nome: 'Vila do Conde' },
  { idFreguesia: 14, nome: 'Vilar de Pinheiro' },
  { idFreguesia: 15, nome: 'Bagunte, Ferreiró, Outeiro Maior e Parada' },
  { idFreguesia: 16, nome: 'Touguinha e Touguinhó' },
  { idFreguesia: 17, nome: 'Vilar e Mosteiró' },
  { idFreguesia: 18, nome: 'Malta' },
  { idFreguesia: 19, nome: 'Canidelo' },
  { idFreguesia: 20, nome: 'Fornelo' },
  { idFreguesia: 21, nome: 'Vairão' },
  { idFreguesia: 22, nome: 'Retorta' },
  { idFreguesia: 23, nome: 'Tougues' },
  { idFreguesia: 24, nome: 'Rio Mau' },
  { idFreguesia: 25, nome: 'Arcos' },
]

async function listFreguesias() {
  if (!API_BASE_URL) {
    return fallbackFreguesias
  }

  try {
    const response = await fetch(`${API_BASE_URL}/municipios`)
    if (!response.ok) {
      return fallbackFreguesias
    }

    const data = await response.json()
    return Array.isArray(data) ? data : fallbackFreguesias
  } catch {
    return fallbackFreguesias
  }
}

export { API_BASE_URL, listFreguesias, fallbackFreguesias }
