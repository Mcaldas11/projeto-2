// falta arrumar esses tipos de rota
const DEFAULT_ROUTE_TYPES = [
  { key: 'engenharia', label: 'Engenharia e vias', color: '#730000' },
  { key: 'higiene', label: 'Higiene Urbana', color: '#22c55e' },
  { key: 'iluminacao', label: 'Iluminação pública', color: '#f59e0b' },
  { key: 'espaços-verdes', label: 'Espaços Verdes', color: '#8b5cf6' },
]

function readStoredRoutes() {
  return []
}

function saveRoutes(routes) {
  return routes
}

function getRouteTypeMeta(typeKey) {
  return (
    DEFAULT_ROUTE_TYPES.find((routeType) => routeType.key === typeKey) || DEFAULT_ROUTE_TYPES[0]
  )
}

export { DEFAULT_ROUTE_TYPES, readStoredRoutes, saveRoutes, getRouteTypeMeta }
