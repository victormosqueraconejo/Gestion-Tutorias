import bcrypt from 'bcryptjs'
import { getApiUrl } from '../../config/api'

export async function createStudentUser({ name, email, password }) {
  const passwordHash = await bcrypt.hash(password, 12)
  const apiUrl = getApiUrl('/api/usuarios')
  let response

  try {
    response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nombre: name.trim(),
        correo: email.trim(),
        contrasena_hash: passwordHash,
        rol: 'estudiante',
        estado: 'activo',
        fecha_registro: new Date().toISOString(),
      }),
    })
  } catch {
    throw new Error('No fue posible conectarse con el servidor. Intenta nuevamente.')
  }

  const responseText = await response.text()
  const contentType = response.headers.get('content-type') || 'no informado'
  let payload

  try {
    payload = responseText ? JSON.parse(responseText) : null
  } catch (error) {
    console.error('[createStudentUser] Respuesta no JSON del backend', {
      url: apiUrl,
      status: response.status,
      statusText: response.statusText,
      contentType,
      responseBody: responseText.slice(0, 1000),
      parseError: error.message,
    })

    throw new Error('El servidor devolvió una respuesta inválida.', { cause: error })
  }

  if (!response.ok) {
    console.error('[createStudentUser] Error del backend', {
      url: apiUrl,
      status: response.status,
      statusText: response.statusText,
      contentType,
      responseBody: payload,
    })
    throw new Error(payload?.error || 'No fue posible crear el usuario.')
  }

  if (!payload) {
    console.error('[createStudentUser] El backend respondió sin contenido', {
      url: apiUrl,
      status: response.status,
      statusText: response.statusText,
      contentType,
    })
    throw new Error('El servidor no devolvió una confirmación de creación.')
  }

  return payload
}

export async function updateStudentUser({ userId, name, semester }) {
  if (!userId) {
    throw new Error('No fue posible identificar al usuario que se actualizará.')
  }

  const apiUrl = getApiUrl(`/api/usuarios/${encodeURIComponent(userId)}`)
  let response

  try {
    response = await fetch(apiUrl, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nombre: name.trim(),
        perfil_estudiante: { semestre_actual: Number(semester) },
      }),
    })
  } catch {
    throw new Error('No fue posible conectarse con el servidor. Intenta nuevamente.')
  }

  const responseText = await response.text()
  const contentType = response.headers.get('content-type') || 'no informado'
  let payload

  try {
    payload = responseText ? JSON.parse(responseText) : null
  } catch (error) {
    console.error('[updateStudentUser] Respuesta no JSON del backend', {
      url: apiUrl,
      status: response.status,
      statusText: response.statusText,
      contentType,
      responseBody: responseText.slice(0, 1000),
      parseError: error.message,
    })
    throw new Error('El servidor devolvió una respuesta inválida.', { cause: error })
  }

  if (!response.ok) {
    console.error('[updateStudentUser] Error del backend', {
      url: apiUrl,
      status: response.status,
      statusText: response.statusText,
      contentType,
      responseBody: payload,
    })
    throw new Error(payload?.error || 'No fue posible actualizar el perfil.')
  }

  return payload?.usuario || payload || {
    nombre: name.trim(),
    perfil_estudiante: { semestre_actual: Number(semester) },
  }
}
