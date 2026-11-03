import bcrypt from 'bcryptjs'

function getApiUrl() {
  const baseUrl = import.meta.env.VITE_API_URL?.replace(/\/+$/, '')
  return `${baseUrl || ''}/api/usuarios`
}

export async function createStudentUser({ name, email, password }) {
  const passwordHash = await bcrypt.hash(password, 12)
  let response

  try {
    response = await fetch(getApiUrl(), {
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

  let payload = null
  try {
    payload = await response.json()
  } catch {
    if (!response.ok) throw new Error('El servidor devolvió una respuesta inválida.')
  }

  if (!response.ok) {
    throw new Error(payload?.error || 'No fue posible crear el usuario.')
  }

  return payload
}
