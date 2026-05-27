function isAuthenticated() {
  return Boolean(localStorage.getItem('role'))
}

function getAccountRoute() {
  return isAuthenticated() ? '/conta' : '/login'
}

function getNewOccurrenceRoute() {
  return isAuthenticated() ? '/new-ocorrencia' : '/login'
}

export { isAuthenticated, getAccountRoute, getNewOccurrenceRoute }
