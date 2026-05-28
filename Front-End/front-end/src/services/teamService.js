import {
  addWorkerToTeam,
  getTeamById,
  readStoredTeams,
  readStoredWorkers,
  removeWorkerFromTeam,
  saveTeams,
  saveWorkers,
  persistTeamState,
} from '@/utils/teamStorage'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ''

async function listTeams() {
  if (!API_BASE_URL) {
    return readStoredTeams()
  }

  const response = await fetch(`${API_BASE_URL}/equipas`)
  if (!response.ok) {
    throw new Error('Failed to load teams from backend')
  }

  const data = await response.json()
  saveTeams(Array.isArray(data) ? data : [])
  return readStoredTeams()
}

async function listWorkers() {
  if (!API_BASE_URL) {
    return readStoredWorkers()
  }

  const response = await fetch(`${API_BASE_URL}/trabalhadores`)
  if (!response.ok) {
    throw new Error('Failed to load workers from backend')
  }

  const data = await response.json()
  saveWorkers(Array.isArray(data) ? data : [])
  return readStoredWorkers()
}

async function assignWorkerToTeam(teamId, workerId) {
  if (!API_BASE_URL) {
    return addWorkerToTeam(teamId, workerId)
  }

  const response = await fetch(`${API_BASE_URL}/equipas/${teamId}/workers`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ workerId }),
  })

  if (!response.ok) {
    throw new Error('Failed to assign worker to team in backend')
  }

  const updatedTeam = await response.json()
  const teams = readStoredTeams().map((team) => (String(team.id) === String(teamId) ? updatedTeam : team))
  persistTeamState(teams)
  return { teams, added: true }
}

async function unassignWorkerFromTeam(teamId, workerId) {
  if (!API_BASE_URL) {
    return removeWorkerFromTeam(teamId, workerId)
  }

  const response = await fetch(`${API_BASE_URL}/equipas/${teamId}/workers/${workerId}`, {
    method: 'DELETE',
  })

  if (!response.ok) {
    throw new Error('Failed to remove worker from team in backend')
  }

  const updatedTeam = await response.json()
  const teams = readStoredTeams().map((team) => (String(team.id) === String(teamId) ? updatedTeam : team))
  persistTeamState(teams)
  return teams
}

function getTeam(teamId) {
  return getTeamById(teamId)
}

export { API_BASE_URL, listTeams, listWorkers, assignWorkerToTeam, unassignWorkerFromTeam, getTeam, persistTeamState }
