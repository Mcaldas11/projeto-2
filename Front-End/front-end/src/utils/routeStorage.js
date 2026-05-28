const ROUTES_STORAGE_KEY = 'vc-comunica-admin-routes'

const DEFAULT_ROUTE_TYPES = [
  { key: 'engenharia', label: 'Engenharia e vias', color: '#730000' },
  { key: 'higiene', label: 'Higiene Urbana', color: '#22c55e' },
  { key: 'iluminacao', label: 'Iluminação pública', color: '#f59e0b' },
  { key: 'espaços-verdes', label: 'Espaços Verdes', color: '#8b5cf6' },
]

const DEFAULT_ROUTE_BASE = [
  {
    id: 1,
    teamName: 'Engenharia e Vias',
    typeKey: 'engenharia',
    color: '#730000',
    waypoints: [
      { latitude: 41.3628, longitude: -8.7438 },
      { latitude: 41.3642, longitude: -8.7408 },
      { latitude: 41.3658, longitude: -8.7377 },
      { latitude: 41.3671, longitude: -8.7349 },
    ],
  },
  {
    id: 2,
    teamName: 'Higiene Urbana',
    typeKey: 'higiene',
    color: '#22c55e',
    waypoints: [
      { latitude: 41.3618, longitude: -8.7444 },
      { latitude: 41.3632, longitude: -8.7419 },
      { latitude: 41.3646, longitude: -8.7392 },
      { latitude: 41.3661, longitude: -8.7361 },
    ],
  },
  {
    id: 3,
    teamName: 'Iluminação pública',
    typeKey: 'iluminacao',
    color: '#f59e0b',
    waypoints: [
      { latitude: 41.3642, longitude: -8.746 },
      { latitude: 41.3652, longitude: -8.7425 },
      { latitude: 41.3663, longitude: -8.7391 },
      { latitude: 41.3674, longitude: -8.7358 },
    ],
  },
  {
    id: 4,
    teamName: 'Espaços Verdes',
    typeKey: 'espaços-verdes',
    color: '#8b5cf6',
    waypoints: [
      { latitude: 41.3609, longitude: -8.7431 },
      { latitude: 41.3621, longitude: -8.7402 },
      { latitude: 41.3639, longitude: -8.7378 },
      { latitude: 41.3653, longitude: -8.7347 },
    ],
  },
]

function clone(value) {
  return JSON.parse(JSON.stringify(value))
}

function readStoredRoutes() {
  if (typeof localStorage === 'undefined') return clone(DEFAULT_ROUTE_BASE)

  try {
    const parsed = JSON.parse(localStorage.getItem(ROUTES_STORAGE_KEY) || 'null')
    if (Array.isArray(parsed) && parsed.length > 0) {
      localStorage.setItem(ROUTES_STORAGE_KEY, JSON.stringify(parsed))
      return parsed
    }
  } catch {
    // fall back to defaults
  }

  localStorage.setItem(ROUTES_STORAGE_KEY, JSON.stringify(DEFAULT_ROUTE_BASE))
  return clone(DEFAULT_ROUTE_BASE)
}

function saveRoutes(routes) {
  if (typeof localStorage === 'undefined') return
  localStorage.setItem(ROUTES_STORAGE_KEY, JSON.stringify(routes))
}

function getRouteTypeMeta(typeKey) {
  return DEFAULT_ROUTE_TYPES.find((routeType) => routeType.key === typeKey) || DEFAULT_ROUTE_TYPES[0]
}

export { ROUTES_STORAGE_KEY, DEFAULT_ROUTE_BASE, DEFAULT_ROUTE_TYPES, readStoredRoutes, saveRoutes, getRouteTypeMeta }
