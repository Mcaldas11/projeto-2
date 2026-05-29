function isAuthenticated() {
  return Boolean(getAuthToken() || localStorage.getItem('role'))
}

function getAccountRoute() {
  return isAuthenticated() ? '/conta' : '/login'
}

function getNewOccurrenceRoute() {
  return isAuthenticated() ? '/new-ocorrencia' : '/login'
}

function getAuthToken() {
  return localStorage.getItem('authToken') || sessionStorage.getItem('authToken') || ''
}

function getAuthUserType() {
  return localStorage.getItem('authUserType') || sessionStorage.getItem('authUserType') || localStorage.getItem('role') || ''
}

function getAuthUserId() {
  return localStorage.getItem('authUserId') || sessionStorage.getItem('authUserId') || ''
}

export { isAuthenticated, getAccountRoute, getNewOccurrenceRoute, getAuthToken, getAuthUserType, getAuthUserId }
