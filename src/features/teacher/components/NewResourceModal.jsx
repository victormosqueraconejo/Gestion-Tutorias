import { useCallback, useEffect, useState } from 'react'
import { Icon } from '../../../components/ui/Icon'
import { getAuthenticatedUser } from '../../auth/authApi'
import { TeacherSidebar } from './TeacherSidebar'
import { TeacherTopbar } from './TeacherTopbar'
import {
  fetchTeacherResources,
  createTeacherResource,
  deleteTeacherResource,
  fetchSubjects,
  fetchTopics,
} from '../teacherSchedulesApi'
import '../teacher-dashboard.css'

const INITIAL_RESOURCES = [
  {
    _id: 'res-1',
    titulo: 'Guía Práctica: Optimización con restricciones de igualdad y hessiano bordeado',
    tipo: 'guia',
    materia: 'Cálculo Multivariable',
    tema: 'Multiplicadores de Lagrange',
    url: 'https://drive.universidad.edu/ciencias/calculo/guia-lagrange-2025.pdf',
    consultas: 124,
  },
  {
    _id: 'res-2',
    titulo: 'Taller grabado: Resolución paso a paso de matrices hessianas y puntos de silla',
    tipo: 'video',
    materia: 'Cálculo Multivariable',
    tema: 'Multiplicadores de Lagrange',
    url: 'https://stream.universidad.edu/watch?v=calc3-hessiano',
    duracion: '24 min de duración',
  },
  {
    _id: 'res-3',
    titulo: 'Formulario oficial de integrales triples y coordenadas cilíndricas y esféricas',
    tipo: 'documento',
    materia: 'Cálculo Multivariable',
    tema: 'Integrales Triples',
    url: 'https://drive.universidad.edu/ciencias/calculo/formulario-integrales.pdf',
    consultas: 98,
  },
  {
    _id: 'res-4',
    titulo: 'Simulador interactivo 3D de superficies cuádricas y planos tangentes',
    tipo: 'enlace',
    materia: 'Cálculo Multivariable',
    tema: 'Superficies Cuádricas',
    url: 'https://www.geogebra.org/3d',
    consultas: 156,
  },
]

export function AddResourceModal() {
  const user = getAuthenticatedUser()
  const userId = user?._id || user?.id
  const teacherName = user?.nombre || 'Dr. Ricardo Salinas'

  const [resources, setResources] = useState(INITIAL_RESOURCES)
  const [subjects, setSubjects] = useState([])
  const [topics, setTopics] = useState([])
  const [loading, setLoading] = useState(Boolean(userId))

  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState('all')
  const [selectedTopicFilter, setSelectedTopicFilter] = useState('all')
  const [selectedTypeFilter, setSelectedTypeFilter] = useState('all')

  const [showForm, setShowForm] = useState(false)
  const [materiaId, setMateriaId] = useState('')
  const [temaId, setTemaId] = useState('')
  const [titulo, setTitulo] = useState('Guía Práctica: Optimización con restricciones de igualdad y hessiano bordeado')
  const [tipo, setTipo] = useState('guia')
  const [url, setUrl] = useState('https://drive.universidad.edu/ciencias/calculo/guia-lagrange-2025.pdf')

  const [submitting, setSubmitting] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  const reloadData = useCallback(async () => {
    if (!userId) return
    try {
      const data = await fetchTeacherResources(userId)
      if (data && data.length > 0) setResources(data)
    } catch (err) {
      console.error('Error al recargar recursos:', err)
    }
  }, [userId])

  useEffect(() => {
    if (!userId) return
    let isMounted = true

    Promise.all([
      fetchTeacherResources(userId).catch(() => []),
      fetchSubjects().catch(() => []),
      fetchTopics().catch(() => []),
    ]).then(([resData, subsData, topicsData]) => {
      if (!isMounted) return
      if (resData && resData.length > 0) setResources(resData)
      setSubjects(subsData)
      setTopics(topicsData)
      if (subsData.length > 0) setMateriaId(subsData[0]._id || subsData[0].id)
      if (topicsData.length > 0) setTemaId(topicsData[0]._id || topicsData[0].id)
      setLoading(false)
    })

    return () => {
      isMounted = false
    }
  }, [userId])

  const handleSaveResource = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setErrorMsg('')

    try {
      if (userId && temaId) {
        await createTeacherResource({
          tema_id: temaId,
          tipo,
          titulo,
          url,
          agregado_por: userId,
          validado: true,
          fecha_creacion: new Date(),
        })
        await reloadData()
      } else {
        const newRes = {
          _id: `res-${Date.now()}`,
          titulo,
          tipo,
          materia: 'Cálculo Multivariable',
          tema: 'Tema General',
          url,
          consultas: 0,
        }
        setResources((prev) => [newRes, ...prev])
      }

      setSuccessMsg('¡Recurso de apoyo publicado exitosamente!')
      setShowForm(false)

      setTimeout(() => setSuccessMsg(''), 4000)
    } catch (err) {
      setErrorMsg(err.message || 'Error al guardar el recurso')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    try {
      await deleteTeacherResource(id)
      await reloadData()
    } catch (err) {
      console.error('Error al eliminar recurso:', err)
      setResources((prev) => prev.filter((r) => (r._id || r.id) !== id))
    }
  }

  const filteredResources = resources.filter((r) => {
    const matchSearch = r.titulo?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchType = selectedTypeFilter === 'all' || r.tipo === selectedTypeFilter
    
    const subjectId = r.tema_id?.materia_id?._id || r.tema_id?.materia_id || r.materia
    const topicId = r.tema_id?._id || r.tema_id || r.tema
    
    const matchSubject = selectedSubjectFilter === 'all' || subjectId === selectedSubjectFilter
    const matchTopic = selectedTopicFilter === 'all' || topicId === selectedTopicFilter

    return matchSearch && matchType && matchSubject && matchTopic
  })

  return (
    <div className="teacher-page">
      <TeacherSidebar />
      <div className="teacher-content">
        <TeacherTopbar />
        <main className="teacher-main">
          <section className="teacher-welcome">
            <div>
              <span className="teacher-overline">
                <i /> HU-10 • Módulo Docente • Docente: {teacherName}
              </span>
              <h1>Repositorio de Recursos Académicos</h1>
              <p>
                Gestiona guías de estudio, videotutoriales, enlaces y documentación complementaria para que los estudiantes preparen sus tutorías con anticipación.
              </p>
            </div>

            <div className="teacher-welcome-actions">
              <button
                type="button"
                className="primary-button"
                onClick={() => setShowForm(!showForm)}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <Icon>{showForm ? 'remove_circle' : 'add_circle'}</Icon>
                <span>{showForm ? 'Ocultar formulario' : '+ Nuevo recurso'}</span>
              </button>
            </div>
          </section>

          <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ background: 'var(--surface-lowest)', padding: '1.25rem', borderRadius: '0.875rem', boxShadow: '0 1px 4px rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '0.8125rem', color: 'var(--on-surface-variant)' }}>Total recursos publicados</span>
                <h3 style={{ margin: '0.25rem 0 0', fontSize: '1.5rem', fontWeight: 700 }}>{resources.length}</h3>
                <small style={{ color: 'var(--primary)', fontWeight: 600 }}>100% disponibles online</small>
              </div>
              <div style={{ width: '2.75rem', height: '2.75rem', borderRadius: '0.75rem', background: 'var(--surface-low)', display: 'grid', placeItems: 'center', color: 'var(--primary)' }}>
                <Icon>library_books</Icon>
              </div>
            </div>

            <div style={{ background: 'var(--surface-lowest)', padding: '1.25rem', borderRadius: '0.875rem', boxShadow: '0 1px 4px rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '0.8125rem', color: 'var(--on-surface-variant)' }}>Materias con material</span>
                <h3 style={{ margin: '0.25rem 0 0', fontSize: '1.5rem', fontWeight: 700 }}>{subjects.length || 3} asignaturas</h3>
                <small style={{ color: 'var(--on-surface-variant)' }}>Cálculo, Estructuras, Física</small>
              </div>
              <div style={{ width: '2.75rem', height: '2.75rem', borderRadius: '0.75rem', background: 'var(--surface-low)', display: 'grid', placeItems: 'center', color: 'var(--secondary)' }}>
                <Icon>auto_stories</Icon>
              </div>
            </div>

            <div style={{ background: 'var(--surface-lowest)', padding: '1.25rem', borderRadius: '0.875rem', boxShadow: '0 1px 4px rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '0.8125rem', color: 'var(--on-surface-variant)' }}>Consultas estudiantiles</span>
                <h3 style={{ margin: '0.25rem 0 0', fontSize: '1.5rem', fontWeight: 700 }}>342 este mes</h3>
                <small style={{ color: 'var(--tertiary)', fontWeight: 600 }}>+38% previo a parciales</small>
              </div>
              <div style={{ width: '2.75rem', height: '2.75rem', borderRadius: '0.75rem', background: 'var(--surface-low)', display: 'grid', placeItems: 'center', color: 'var(--tertiary)' }}>
                <Icon>ads_click</Icon>
              </div>
            </div>
          </section>

          {successMsg && (
            <div style={{ background: 'var(--primary-container)', color: 'var(--on-primary-container)', padding: '0.875rem 1.25rem', borderRadius: '0.75rem', marginBottom: '1.5rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Icon filled>check_circle</Icon> {successMsg}
            </div>
          )}

          {errorMsg && (
            <div style={{ background: 'var(--error-container)', color: 'var(--on-error-container)', padding: '0.875rem 1.25rem', borderRadius: '0.75rem', marginBottom: '1.5rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Icon>warning</Icon> {errorMsg}
            </div>
          )}

          {showForm && (
            <section style={{ background: 'var(--surface-lowest)', padding: '1.5rem', borderRadius: '0.875rem', boxShadow: '0 4px 16px rgba(0,0,0,0.08)', marginBottom: '1.5rem', border: '2px solid var(--primary)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', borderBottom: '1px solid var(--surface-low)', paddingBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: '0.5rem', background: 'var(--primary)', color: 'white', display: 'grid', placeItems: 'center' }}>
                    <Icon>post_add</Icon>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--primary)', letterSpacing: '0.05em' }}>
                      HU-10 Formulario de Publicación
                    </span>
                    <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700 }}>Agregar Nuevo Recurso de Apoyo</h2>
                  </div>
                </div>
                <button type="button" onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--on-surface-variant)' }}>
                  <Icon>close</Icon>
                </button>
              </div>

              <form onSubmit={handleSaveResource} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ fontSize: '0.8125rem', fontWeight: 700, display: 'block', marginBottom: '0.25rem' }}>Materia vinculada *</label>
                    <select
                      value={materiaId}
                      onChange={(e) => setMateriaId(e.target.value)}
                      style={{ width: '100%', padding: '0.625rem 0.875rem', borderRadius: '0.5rem', background: 'var(--surface-low)', border: 'none', font: 'inherit' }}
                    >
                      {subjects.length > 0 ? (
                        subjects.map((s) => (
                          <option key={s._id || s.id} value={s._id || s.id}>
                            {s.nombre}
                          </option>
                        ))
                      ) : (
                        <option value="calc">Cálculo Multivariable</option>
                      )}
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.8125rem', fontWeight: 700, display: 'block', marginBottom: '0.25rem' }}>Tema específico *</label>
                    <select
                      value={temaId}
                      onChange={(e) => setTemaId(e.target.value)}
                      style={{ width: '100%', padding: '0.625rem 0.875rem', borderRadius: '0.5rem', background: 'var(--surface-low)', border: 'none', font: 'inherit' }}
                    >
                      {topics.length > 0 ? (
                        topics.map((t) => (
                          <option key={t._id || t.id} value={t._id || t.id}>
                            {t.nombre}
                          </option>
                        ))
                      ) : (
                        <option value="65f1a2b3c4d5e6f7a8b9c0d1">Extremos condicionados y multiplicadores de Lagrange</option>
                      )}
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.8125rem', fontWeight: 700, display: 'block', marginBottom: '0.25rem' }}>Título del recurso *</label>
                  <input value={titulo} onChange={(e) => setTitulo(e.target.value)} required style={{ width: '100%', padding: '0.625rem 0.875rem', borderRadius: '0.5rem', background: 'var(--surface-low)', border: 'none', font: 'inherit' }} />
                </div>

                <div>
                  <label style={{ fontSize: '0.8125rem', fontWeight: 700, display: 'block', marginBottom: '0.5rem' }}>Tipo de recurso *</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem' }}>
                    {[
                      { id: 'video', label: 'Video', icon: 'play_circle' },
                      { id: 'guia', label: 'Guía PDF', icon: 'picture_as_pdf' },
                      { id: 'documento', label: 'Documento', icon: 'description' },
                      { id: 'enlace', label: 'Enlace web', icon: 'link' },
                    ].map((item) => (
                      <label key={item.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem', padding: '0.75rem', borderRadius: '0.75rem', background: tipo === item.id ? 'var(--surface-low)' : 'var(--surface-lowest)', border: tipo === item.id ? '2px solid var(--primary)' : '1px solid var(--surface-low)', cursor: 'pointer', textAlign: 'center' }}>
                        <input type="radio" name="resourceType" value={item.id} checked={tipo === item.id} onChange={() => setTipo(item.id)} style={{ display: 'none' }} />
                        <Icon style={{ fontSize: '1.25rem', color: tipo === item.id ? 'var(--primary)' : 'inherit' }}>{item.icon}</Icon>
                        <strong style={{ fontSize: '0.8125rem' }}>{item.label}</strong>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.8125rem', fontWeight: 700, display: 'block', marginBottom: '0.25rem' }}>URL del recurso / Enlace de acceso *</label>
                  <input type="url" value={url} onChange={(e) => setUrl(e.target.value)} required style={{ width: '100%', padding: '0.625rem 0.875rem', borderRadius: '0.5rem', background: 'var(--surface-low)', border: 'none', font: 'inherit' }} />
                  <span style={{ fontSize: '0.6875rem', color: 'var(--on-surface-variant)' }}>Asegúrate de que los permisos de Google Drive, OneDrive o YouTube estén habilitados.</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                  <button type="button" className="academic-secondary-button" onClick={() => setShowForm(false)}>Cancelar</button>
                  <button type="submit" className="primary-button" disabled={submitting} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Icon>publish</Icon> {submitting ? 'Publicando...' : 'Publicar recurso'}
                  </button>
                </div>
              </form>
            </section>
          )}

          <section style={{ background: 'var(--surface-lowest)', padding: '1rem', borderRadius: '0.875rem', boxShadow: '0 1px 4px rgba(0,0,0,0.05)', marginBottom: '1.5rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
              <input
                type="text"
                placeholder="Buscar por título, palabra clave..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ padding: '0.625rem 0.875rem', borderRadius: '0.5rem', background: 'var(--surface-low)', border: 'none', font: 'inherit' }}
              />
              <select value={selectedSubjectFilter} onChange={(e) => setSelectedSubjectFilter(e.target.value)} style={{ padding: '0.625rem', borderRadius: '0.5rem', background: 'var(--surface-low)', border: 'none', font: 'inherit' }}>
                <option value="all">Todas las materias</option>
                {subjects.map((s) => (
                  <option key={s._id || s.id} value={s._id || s.id}>
                    {s.nombre}
                  </option>
                ))}
              </select>
              <select value={selectedTopicFilter} onChange={(e) => setSelectedTopicFilter(e.target.value)} style={{ padding: '0.625rem', borderRadius: '0.5rem', background: 'var(--surface-low)', border: 'none', font: 'inherit' }}>
                <option value="all">Todos los temas</option>
                {topics.map((t) => (
                  <option key={t._id || t.id} value={t._id || t.id}>
                    {t.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', overflowX: 'auto' }}>
              <span style={{ fontSize: '0.8125rem', color: 'var(--on-surface-variant)' }}>Filtrar tipo:</span>
              {[
                { id: 'all', label: 'Todos' },
                { id: 'video', label: 'Videos' },
                { id: 'guia', label: 'Guías PDF' },
                { id: 'documento', label: 'Documentos' },
                { id: 'enlace', label: 'Enlaces web' },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setSelectedTypeFilter(t.id)}
                  style={{
                    padding: '0.35rem 0.75rem',
                    borderRadius: '1rem',
                    border: 'none',
                    background: selectedTypeFilter === t.id ? 'var(--primary)' : 'var(--surface-low)',
                    color: selectedTypeFilter === t.id ? 'white' : 'inherit',
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </section>

          <section>
            {loading ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--on-surface-variant)' }}>Cargando repositorio desde MongoDB...</div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem' }}>
                {filteredResources.map((item) => {
                  const subjectName = item.tema_id?.materia_id?.nombre || item.materia || 'Cálculo Multivariable'
                  const topicName = item.tema_id?.nombre || item.tema || 'Multiplicadores de Lagrange'

                  return (
                    <article key={item._id || item.id} style={{ background: 'var(--surface-lowest)', padding: '1.25rem', borderRadius: '0.875rem', boxShadow: '0 1px 4px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                          <span style={{ padding: '0.25rem 0.625rem', borderRadius: '1rem', background: 'var(--surface-low)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>
                            {item.tipo}
                          </span>
                          <button type="button" onClick={() => handleDelete(item._id || item.id)} style={{ background: 'none', border: 'none', color: 'var(--on-surface-variant)', cursor: 'pointer' }}>
                            <Icon style={{ fontSize: '1.125rem' }}>delete</Icon>
                          </button>
                        </div>

                        <h3 style={{ margin: '0 0 0.5rem', fontSize: '1rem', fontWeight: 700, lineHeight: 1.3 }}>{item.titulo}</h3>

                        <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                          <span style={{ padding: '0.2rem 0.5rem', borderRadius: '0.375rem', background: 'var(--surface-low)', fontSize: '0.6875rem', fontWeight: 600 }}>{subjectName}</span>
                          <span style={{ padding: '0.2rem 0.5rem', borderRadius: '0.375rem', background: 'var(--surface-low)', fontSize: '0.6875rem', color: 'var(--on-surface-variant)' }}>{topicName}</span>
                        </div>
                      </div>

                      <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid var(--surface-low)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <small style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)' }}>{item.consultas || 120} consultas</small>
                        <a href={item.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--primary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          Abrir recurso <Icon style={{ fontSize: '1rem' }}>open_in_new</Icon>
                        </a>
                      </div>
                    </article>
                  )
                })}
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  )
}

export default AddResourceModal