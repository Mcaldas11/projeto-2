import { readStoredRoutes, saveRoutes } from '@/utils/routeStorage'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ''
const OSRM_BASE_URL = import.meta.env.VITE_OSRM_BASE_URL || 'https://router.project-osrm.org'

function joinCoordinates(waypoints = []) {
  return waypoints.map((point) => `${point.longitude},${point.latitude}`).join(';')
}

async function buildRouteGeometry(route) {
  if (!route?.waypoints?.length) return []

  if (!API_BASE_URL && OSRM_BASE_URL) {
    const coordinates = joinCoordinates(route.waypoints)
    if (route.waypoints.length < 2) {
      return route.waypoints
    }

    const response = await fetch(
      `${OSRM_BASE_URL}/route/v1/driving/${coordinates}?overview=full&geometries=geojson&steps=false`,
    )

    if (!response.ok) {
      return route.waypoints
    }

    const payload = await response.json()
    const geometry = payload?.routes?.[0]?.geometry?.coordinates || []
    if (!Array.isArray(geometry) || geometry.length === 0) {
      return route.waypoints
    }

    return geometry.map(([longitude, latitude]) => ({ latitude, longitude }))
  }

  return route.waypoints
}

async function listRoutes() {
  if (!API_BASE_URL) {
    return readStoredRoutes()
  }

  const response = await fetch(`${API_BASE_URL}/routes`)
  if (!response.ok) {
    throw new Error('Failed to load routes from backend')
  }

  const data = await response.json()
  saveRoutes(Array.isArray(data) ? data : [])
  return readStoredRoutes()
}

async function listRoutesWithGeometry() {
  const routes = await listRoutes()
  const routed = []

  for (const route of routes) {
    routed.push({
      ...route,
      geometry: await buildRouteGeometry(route),
    })
  }

  return routed
}

export { API_BASE_URL, OSRM_BASE_URL, listRoutes, listRoutesWithGeometry, buildRouteGeometry }
