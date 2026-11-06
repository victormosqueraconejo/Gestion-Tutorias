import { getApiUrl } from '../../config/api'

export async function fetchTeacherSchedules(profesorId) {
  const url = getApiUrl(`/api/horarios-disponibles?profesor_id=${encodeURIComponent(profesorId)}`)
  const response = await fetch(url)
  if (!response.ok) throw new Error('Error al obtener los horarios del profesor')
  return response.json()
}

export async function fetchSubjects() {
  const url = getApiUrl('/api/materias')
  const response = await fetch(url)
  if (!response.ok) throw new Error('Error al obtener la lista de asignaturas')
  return response.json()
}

export async function fetchTopics() {
  const url = getApiUrl('/api/temas')
  const response = await fetch(url)
  if (!response.ok) throw new Error('Error al obtener la lista de temas')
  return response.json()
}

export async function createAvailableSchedule(payload) {
  const url = getApiUrl('/api/horarios-disponibles')
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  const data = await response.json()
  if (!response.ok) {
    throw new Error(data.error || 'No fue posible guardar el horario')
  }
  return data
}

export async function deleteAvailableSchedule(scheduleId) {
  const url = getApiUrl(`/api/horarios-disponibles/${encodeURIComponent(scheduleId)}`)
  const response = await fetch(url, { method: 'DELETE' })

  if (!response.ok) {
    const data = await response.json().catch(() => ({}))
    const error = new Error(data.error || 'Error al eliminar el horario')
    error.status = response.status
    throw error
  }
}

export async function fetchTutoringRequests(profesorId) {
  const url = getApiUrl(`/api/solicitudes-tutoria?profesor_id=${encodeURIComponent(profesorId)}`)
  const response = await fetch(url)
  if (!response.ok) throw new Error('Error al obtener las solicitudes de tutoría')
  return response.json()
}

export async function acceptTutoringRequest(requestId, payload) {
  const url = getApiUrl(`/api/solicitudes-tutoria/${encodeURIComponent(requestId)}/aceptar`)
  const response = await fetch(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  const data = await response.json()
  if (!response.ok) {
    throw new Error(data.error || 'No fue posible aceptar la solicitud de tutoría')
  }
  return data
}

export async function fetchTeacherResources(profesorId) {
  const url = getApiUrl(`/api/recursos?agregado_por=${encodeURIComponent(profesorId)}`)
  const response = await fetch(url)
  if (!response.ok) throw new Error('Error al listar los recursos del profesor')
  return response.json()
}

export async function createTeacherResource(payload) {
  const url = getApiUrl('/api/recursos')
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  const data = await response.json()
  if (!response.ok) {
    throw new Error(data.error || 'No fue posible publicar el recurso')
  }
  return data
}

export async function deleteTeacherResource(resourceId) {
  const url = getApiUrl(`/api/recursos/${encodeURIComponent(resourceId)}`)
  const response = await fetch(url, { method: 'DELETE' })

  if (!response.ok) {
    const data = await response.json().catch(() => ({}))
    throw new Error(data.error || 'Error al eliminar el recurso')
  }
}

export async function fetchTutoringById(tutoringId) {
  const url = getApiUrl(`/api/tutorias/${encodeURIComponent(tutoringId)}`)
  const response = await fetch(url)
  if (!response.ok) throw new Error('Error al consultar el detalle de la tutoría')
  return response.json()
}

export async function updateTutoring(tutoringId, payload) {
  const url = getApiUrl(`/api/tutorias/${encodeURIComponent(tutoringId)}`)
  const response = await fetch(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  const data = await response.json()
  if (!response.ok) {
    throw new Error(data.error || 'No fue posible guardar los cambios en la tutoría')
  }
  return data
}