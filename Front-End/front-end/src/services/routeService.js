import { getAuthToken } from '@/utils/auth'

const API_BASE_URL = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || ''
const OSRM_BASE_URL = import.meta.env.VITE_OSRM_BASE_URL || 'https://router.project-osrm.org'

function buildAuthHeaders(extraHeaders = {}) {
  const token = getAuthToken()
  return {
    ...extraHeaders,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

function joinCoordinates(waypoints = []) {
  return waypoints
    .map((wp) => `${wp.longitude},${wp.latitude}`)
    .join(';')
}

async function buildRouteGeometry(route) {
  const waypoints = Array.isArray(route.waypoints) ? route.waypoints : []
  if (waypoints.length < 2) return []

  const coords = joinCoordinates(waypoints)
  const url = `${OSRM_BASE_URL}/route/v1/driving/${coords}?overview=full&geometries=geojson`

  try {
    const res = await fetch(url)
    const data = await res.json()
    if (data.code !== 'Ok' || !data.routes?.[0]) return []

    return data.routes[0].geometry.coordinates.map(([lng, lat]) => ({
      latitude: lat,
      longitude: lng,
    }))
  } catch (err) {
    console.error('OSRM buildRouteGeometry failed:', err)
    return []
  }
}

async function listRoutes() {
  try {
    const response = await fetch(`${API_BASE_URL}/rotas`, {
      headers: buildAuthHeaders(),
    })
    if (!response.ok) {
      console.warn('Endpoint /rotas not found or failed. Returning empty array.')
      return []
    }

    const data = await response.json()
    return Array.isArray(data) ? data : []
  } catch (error) {
    console.warn('Failed to load routes:', error.message)
    return []
  }
}

async function createRota(payload) {
  const response = await fetch(`${API_BASE_URL}/rotas`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...buildAuthHeaders(),
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error('Failed to create route in backend')
  }

  return response.json()
}

async function listRoutesWithGeometry() {
  const routes = await listRoutes()
  const routed = []

  for (const route of routes) {
    if (route.geometry && route.geometry.length > 0) {
      routed.push(route)
    } else {
      routed.push({
        ...route,
        geometry: await buildRouteGeometry(route),
      })
    }
  }

  return routed
}

export { API_BASE_URL, OSRM_BASE_URL, listRoutes, listRoutesWithGeometry, buildRouteGeometry, createRota }
