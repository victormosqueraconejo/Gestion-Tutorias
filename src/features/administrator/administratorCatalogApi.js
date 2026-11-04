import { getApiUrl } from '../../config/api'

const resourceKeys = {
  schools: { path: '/api/escuelas', collectionKeys: ['escuelas', 'schools'] },
  careers: { path: '/api/carreras', collectionKeys: ['carreras', 'careers'] },
  subjects: { path: '/api/materias', collectionKeys: ['materias', 'subjects'] },
  topics: { path: '/api/temas', collectionKeys: ['temas', 'topics'] },
  resources: { path: '/api/recursos', collectionKeys: ['recursos', 'resources'] },
}

const singularKeys = {
  schools: ['escuela', 'school'],
  careers: ['carrera', 'career'],
  subjects: ['materia', 'subject'],
  topics: ['tema', 'topic'],
  resources: ['recurso', 'resource'],
}

function getErrorMessage(payload, fallback) {
  if (typeof payload === 'string' && payload.trim()) return payload
  if (payload && typeof payload === 'object') {
    if (typeof payload.error === 'string') return payload.error
    if (typeof payload.message === 'string') return payload.message
    if (Array.isArray(payload.errors) && payload.errors.length) {
      return payload.errors.map((error) => typeof error === 'string' ? error : error?.message || error?.msg).filter(Boolean).join(' ')
    }
    if (payload.details) return getErrorMessage(payload.details, fallback)
  }
  return fallback
}

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
    console.error(`[${operation}] Respuesta no JSON del backend`, { url, status: response.status, parseError: error.message })
    throw new Error('El servidor devolvió una respuesta inválida.', { cause: error })
  }

  if (!response.ok) {
    console.error(`[${operation}] Error del backend`, { url, status: response.status, responseBody: payload })
    const prefix = response.status === 409
      ? 'La operación no puede completarse porque el registro tiene dependencias o entra en conflicto con otra relación. '
      : ''
    const error = new Error(`${prefix}${getErrorMessage(payload, `No fue posible ${operation}.`)}`)
    error.status = response.status
    throw error
  }
  return payload
}

function unwrap(payload, config) {
  if (Array.isArray(payload)) return payload
  return [...config.collectionKeys, 'data'].map((key) => payload?.[key]).find(Array.isArray) || []
}

function unwrapEntity(payload, type) {
  return singularKeys[type].map((key) => payload?.[key]).find(Boolean) || payload?.data || payload
}

function normalize(entity, type) {
  const id = entity?.id ?? entity?._id
  if (type === 'schools') return { ...entity, id, name: entity?.nombre ?? entity?.name ?? '', description: entity?.descripcion ?? entity?.description ?? '', status: entity?.estado ?? 'activa' }
  if (type === 'careers') return { ...entity, id, schoolId: entity?.escuela_id ?? entity?.schoolId ?? '', name: entity?.nombre ?? entity?.name ?? '', semesters: entity?.duracion_semestres ?? entity?.semesters ?? '', status: entity?.estado ?? 'activa' }
  if (type === 'subjects') return { ...entity, id, schoolId: entity?.escuela_id ?? entity?.schoolId ?? '', careerId: entity?.carrera_id ?? entity?.careerId ?? '', name: entity?.nombre ?? entity?.name ?? '', description: entity?.descripcion ?? entity?.description ?? '', status: entity?.estado ?? 'activa' }
  if (type === 'topics') return { ...entity, id, subjectId: entity?.materia_id ?? entity?.subjectId ?? '', name: entity?.nombre ?? entity?.name ?? '', description: entity?.descripcion ?? entity?.description ?? '', status: entity?.estado ?? 'activo' }
  return { ...entity, id, topicId: entity?.tema_id ?? entity?.topicId ?? '', type: entity?.tipo ?? entity?.type ?? 'enlace', title: entity?.titulo ?? entity?.title ?? '', url: entity?.url ?? '', validated: entity?.validado ?? entity?.validated ?? false }
}

export async function fetchCatalog(type) {
  const config = resourceKeys[type]
  const payload = await requestJson(getApiUrl(config.path), undefined, `cargar ${type}`)
  return unwrap(payload, config).map((entity) => normalize(entity, type))
}

export async function createCatalogEntity(type, values) {
  const config = resourceKeys[type]
  const payload = await requestJson(getApiUrl(config.path), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(toBackend(type, values)),
  }, `crear ${type}`)
  return normalize(unwrapEntity(payload, type), type)
}

export async function updateCatalogEntity(type, id, values) {
  const config = resourceKeys[type]
  const payload = await requestJson(getApiUrl(`${config.path}/${encodeURIComponent(id)}`), {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(toBackend(type, values)),
  }, `actualizar ${type}`)
  return normalize(unwrapEntity(payload, type), type)
}

export async function deleteCatalogEntity(type, id) {
  const config = resourceKeys[type]
  await requestJson(getApiUrl(`${config.path}/${encodeURIComponent(id)}`), { method: 'DELETE' }, `eliminar ${type}`)
}

function toBackend(type, values) {
  if (type === 'schools') return { nombre: values.name.trim(), descripcion: values.description.trim(), estado: values.status || 'activa' }
  if (type === 'careers') return { escuela_id: values.schoolId, nombre: values.name.trim(), duracion_semestres: Number(values.semesters), estado: values.status || 'activa' }
  if (type === 'subjects') {
    if (!values.careerId || !values.schoolId) throw new Error('La materia debe tener una carrera y una escuela asociadas.')
    return { escuela_id: values.schoolId, carrera_id: values.careerId, nombre: values.name.trim(), descripcion: values.description.trim(), estado: values.status || 'activa' }
  }
  if (type === 'topics') return { materia_id: values.subjectId, nombre: values.name.trim(), descripcion: values.description.trim(), estado: values.status || 'activo' }
  return { tema_id: values.topicId, tipo: values.type, titulo: values.title.trim(), url: values.url.trim(), validado: Boolean(values.validated) }
}
