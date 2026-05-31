function isAuthenticated() {
  return Boolean(getAuthToken() || localStorage.getItem('role'))
}

function getAccountRoute() {
  const role = getAuthUserType()

  if (!isAuthenticated()) {
    return '/login'
  }

  if (role === 'trabalhador' || role === 'trabalhador_admin') {
    return '/trabalhador/perfil'
  }

  if (role === 'trabalhador_responsavel' || role === 'responsavel') {
    return '/responsavel/perfil'
  }

  return '/conta'
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
