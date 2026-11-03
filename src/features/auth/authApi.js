import { getApiUrl } from '../../config/api'

const SESSION_KEY = 'gestion-tutorias.usuario'

export async function loginUser({ email, password }) {
  let response

  try {
    response = await fetch(getApiUrl('/api/login'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ correo: email, contrasena: password }),
    })
  } catch {
    throw new Error('No fue posible conectarse con el servidor. Intenta nuevamente.')
  }

  let payload = null
  try {
    payload = await response.json()
  } catch {
    if (!response.ok) {
      throw new Error('El servidor devolvió una respuesta inválida.')
    }
  }

  if (!response.ok) {
    throw new Error(payload?.error || 'No fue posible iniciar sesión.')
  }

  if (!payload?.usuario) {
    throw new Error('El servidor no devolvió los datos del usuario.')
  }

  return payload.usuario
}

export function saveAuthenticatedUser(user, rememberSession) {
  const serializedUser = JSON.stringify(user)
  const storage = rememberSession ? window.localStorage : window.sessionStorage
  const otherStorage = rememberSession ? window.sessionStorage : window.localStorage

  otherStorage.removeItem(SESSION_KEY)
  storage.setItem(SESSION_KEY, serializedUser)
}

export function updateAuthenticatedUser(updates) {
  const currentUser = getAuthenticatedUser()
  if (!currentUser) return null

  const updatedUser = {
    ...currentUser,
    ...updates,
    perfil_estudiante: {
      ...currentUser.perfil_estudiante,
      ...updates.perfil_estudiante,
    },
  }
  const serializedUser = JSON.stringify(updatedUser)

  if (window.localStorage.getItem(SESSION_KEY)) {
    window.localStorage.setItem(SESSION_KEY, serializedUser)
  } else {
    window.sessionStorage.setItem(SESSION_KEY, serializedUser)
  }

  return updatedUser
}

export function getAuthenticatedUser() {
  const serializedUser = window.localStorage.getItem(SESSION_KEY) || window.sessionStorage.getItem(SESSION_KEY)
  if (!serializedUser) return null

  try {
    return JSON.parse(serializedUser)
  } catch {
    window.localStorage.removeItem(SESSION_KEY)
    window.sessionStorage.removeItem(SESSION_KEY)
    return null
  }
}

export function getRolePath(role) {
  const normalizedRole = role?.toLowerCase()
  const rolePaths = {
    estudiante: '/estudiante',
    profesor: '/profesor',
    administrador: '/administrador',
  }

  return rolePaths[normalizedRole] || null
}
