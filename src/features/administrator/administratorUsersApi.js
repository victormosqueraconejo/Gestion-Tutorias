import bcrypt from 'bcryptjs'
import { getApiUrl } from '../../config/api'

const roles = ['estudiante', 'profesor', 'administrador']
const backendRoles = { administrador: 'administrador_academico' }

async function requestJson(url, options, operation) {
  let response
  try {
    response = await fetch(url, options)
  } catch {
    throw new Error('No fue posible conectarse con el servidor. Intenta nuevamente.')
  }

  const responseText = await response.text()
  let payload
  try {
    payload = responseText ? JSON.parse(responseText) : null
  } catch (error) {
    console.error(`[${operation}] Respuesta no JSON del backend`, { url, status: response.status, responseBody: responseText.slice(0, 1000), parseError: error.message })
    throw new Error('El servidor devolvió una respuesta inválida.', { cause: error })
  }

  if (!response.ok) {
    console.error(`[${operation}] Error del backend`, { url, status: response.status, responseBody: payload })
    throw new Error(payload?.error || `No fue posible ${operation === 'fetchUsers' ? 'cargar' : operation === 'createUser' ? 'crear' : 'actualizar'} el usuario.`)
  }

  return payload
}

function unwrapUsers(payload) {
  const users = Array.isArray(payload) ? payload : payload?.usuarios || payload?.users || []
  return users.map(normalizeUser)
}

export function normalizeUser(user) {
  return {
    ...(user || {}),
    id: user?.id ?? user?._id,
    name: user?.nombre ?? user?.name ?? '',
    email: user?.correo ?? user?.email ?? '',
    role: (user?.rol ?? user?.role) === 'administrador_academico' ? 'administrador' : user?.rol ?? user?.role ?? 'estudiante',
    status: user?.estado ?? user?.status ?? 'activo',
  }
}

export async function fetchUsers() {
  const payload = await requestJson(getApiUrl('/api/usuarios'), undefined, 'fetchUsers')
  return unwrapUsers(payload)
}

export async function createAdministratorUser({ name, email, password, role = 'estudiante' }) {
  if (!roles.includes(role)) throw new Error('Selecciona un rol válido.')
  const passwordHash = await bcrypt.hash(password, 12)
  const payload = await requestJson(getApiUrl('/api/usuarios'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      nombre: name.trim(),
      correo: email.trim(),
      contrasena_hash: passwordHash,
      rol: backendRoles[role] || role,
      estado: 'activo',
      fecha_registro: new Date().toISOString(),
    }),
  }, 'createUser')
  return normalizeUser(payload?.usuario || payload)
}

export async function updateAdministratorUser(userId, changes) {
  if (!userId) throw new Error('No fue posible identificar al usuario que se actualizará.')
  const requestChanges = changes.rol ? { ...changes, rol: backendRoles[changes.rol] || changes.rol } : changes
  const payload = await requestJson(getApiUrl(`/api/usuarios/${encodeURIComponent(userId)}`), {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestChanges),
  }, 'updateUser')
  return normalizeUser(payload?.usuario || payload)
}
