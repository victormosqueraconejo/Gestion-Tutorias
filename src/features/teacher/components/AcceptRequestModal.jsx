import { useCallback, useEffect, useState } from 'react'
import { Icon } from '../../../components/ui/Icon'
import { getAuthenticatedUser } from '../../auth/authApi'
import { TeacherSidebar } from './TeacherSidebar'
import { TeacherTopbar } from './TeacherTopbar'
import { fetchTutoringRequests, acceptTutoringRequest } from '../teacherSchedulesApi'
import '../teacher-dashboard.css'

const DEFAULT_AVATAR = 'https://lh3.googleusercontent.com/aida-public/AB6AXuBJOICVE1j6OsbMTjnrla-vywwn_2d6iotBZDenL545f0rMc-QCj_bsFsT64k2PkRKb7ni-woGXMven5UCy0cET32JWZtikTP7MFJuwqniisgGZAShFlBQJ9JulRoq_LVvXYxxaFCJ0pY721Mrbrc7rQybgGrxnhzkXNdQbIbud0Ngg3cb9o0ON4lgLk5SlCpHWTsooQHSR4_RM43bAO3mmBbFuSMG3wl4_m5ZrVPI'

export function AcceptRequestModal() {
  const user = getAuthenticatedUser()
  const userId = user?._id || user?.id
  const teacherName = user?.nombre || 'Dr. Ricardo Salinas'

  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(Boolean(userId))
  const [activeTab, setActiveTab] = useState('pendientes')
  const [selectedRequest, setSelectedRequest] = useState(null)

  const [modalidad, setModalidad] = useState('presencial')
  const [tipoTutoria, setTipoTutoria] = useState('individual')
  const [cupoMaximo, setCupoMaximo] = useState(15)
  const [lugarEncuentro, setLugarEncuentro] = useState('Cubículo 304, Edificio de Ciencias Básicas')
  const [linkVideollamada, setLinkVideollamada] = useState('https://meet.google.com/abc-defg-hij')
  const [notasEstudiante, setNotasEstudiante] = useState('')

  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const reloadData = useCallback(async () => {
    if (!userId) return
    try {
      const data = await fetchTutoringRequests(userId)
      setRequests(data)
    } catch (err) {
      console.error('Error al recargar solicitudes:', err)
    }
  }, [userId])

  useEffect(() => {
    if (!userId) return

    let isMounted = true

    fetchTutoringRequests(userId)
      .then((data) => {
        if (isMounted) {
          setRequests(data)
          setLoading(false)
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.error('Error al cargar solicitudes de tutoría:', err)
          setErrorMessage('No se pudieron cargar las solicitudes desde el servidor.')
          setLoading(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [userId])

  const handleOpenAcceptForm = (request) => {
    setSelectedRequest(request)
    setErrorMessage('')
    setSuccessMessage('')
  }

  const handleConfirmAccept = async (e) => {
    e.preventDefault()
    if (!selectedRequest) return

    const requestId = selectedRequest._id || selectedRequest.id
    setSubmitting(true)
    setErrorMessage('')

    try {
      await acceptTutoringRequest(requestId, {
        modalidad,
        tipo_tutoria: tipoTutoria,
        cupo_maximo: Number(cupoMaximo),
        lugar_encuentro: modalidad === 'presencial' ? lugarEncuentro : '',
        link_videollamada: modalidad === 'virtual' ? linkVideollamada : '',
        notas: notasEstudiante,
      })

      const studentName = selectedRequest.estudiante_id?.nombre || selectedRequest.estudiante || 'el estudiante'
      setSuccessMessage(`¡Tutoría con ${studentName} aceptada y guardada exitosamente!`)
      setSelectedRequest(null)

      await reloadData()

      setTimeout(() => {
        setSuccessMessage('')
      }, 4000)
    } catch (err) {
      setErrorMessage(err.message || 'Error al guardar en el servidor.')
    } finally {
      setSubmitting(false)
    }
  }

  const filteredRequests = requests.filter((r) => {
    if (activeTab === 'todas') return true
    if (activeTab === 'pendientes') return r.estado === 'pendiente'
    if (activeTab === 'aceptadas') return r.estado === 'aceptada'
    if (activeTab === 'aplazadas') return r.estado === 'aplazada'
    if (activeTab === 'canceladas') return r.estado === 'cancelada'
    return true
  })

  const pendientesCount = requests.filter((r) => r.estado === 'pendiente').length
  const aceptadasCount = requests.filter((r) => r.estado === 'aceptada').length

  return (
    <div className="teacher-page">
      <TeacherSidebar />
      <div className="teacher-content">
        <TeacherTopbar />
        <main className="teacher-main">
          <section className="teacher-welcome">
            <div>
              <span className="teacher-overline">
                <i /> Flujo Docente • HU-04 & HU-06 Respuesta a Solicitudes
              </span>
              <h1>Solicitudes de Tutoría Recibidas</h1>
              <p>
                Bienvenido, <strong>{teacherName}</strong>. Gestiona y responde a las solicitudes de apoyo académico de tus estudiantes de forma oportuna.
              </p>
            </div>

            <div className="teacher-welcome-actions">
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <div style={{ background: 'var(--surface-lowest)', padding: '0.625rem 1rem', borderRadius: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                  <div style={{ width: '2.25rem', height: '2.25rem', borderRadius: '0.5rem', background: 'var(--tertiary-container)', color: 'var(--on-tertiary-container)', display: 'grid', placeItems: 'center' }}>
                    <Icon>pending_actions</Icon>
                  </div>
                  <div>
                    <strong style={{ fontSize: '1.125rem', display: 'block', lineHeight: 1 }}>{pendientesCount}</strong>
                    <small style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)' }}>Por responder hoy</small>
                  </div>
                </div>

                <div style={{ background: 'var(--surface-lowest)', padding: '0.625rem 1rem', borderRadius: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                  <div style={{ width: '2.25rem', height: '2.25rem', borderRadius: '0.5rem', background: 'var(--primary-container)', color: 'var(--on-primary)', display: 'grid', placeItems: 'center' }}>
                    <Icon>check_circle</Icon>
                  </div>
                  <div>
                    <strong style={{ fontSize: '1.125rem', display: 'block', lineHeight: 1 }}>94%</strong>
                    <small style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)' }}>Tasa de aceptación</small>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {successMessage && (
            <div style={{ background: 'var(--primary-container)', color: 'var(--on-primary-container)', padding: '0.875rem 1.25rem', borderRadius: '0.75rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
              <Icon filled>check_circle</Icon>
              <span>{successMessage}</span>
            </div>
          )}

          {errorMessage && (
            <div style={{ background: 'var(--error-container)', color: 'var(--on-error-container)', padding: '0.875rem 1.25rem', borderRadius: '0.75rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
              <Icon>warning</Icon>
              <span>{errorMessage}</span>
            </div>
          )}

          <section style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--surface-low)', padding: '0.375rem 0.5rem', borderRadius: '0.75rem', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', gap: '0.25rem' }}>
              <button
                type="button"
                className={`academic-secondary-button ${activeTab === 'todas' ? 'active' : ''}`}
                onClick={() => setActiveTab('todas')}
                style={{ padding: '0.375rem 0.875rem', borderRadius: '0.5rem', border: 'none', background: activeTab === 'todas' ? 'var(--surface-lowest)' : 'transparent', fontWeight: activeTab === 'todas' ? 700 : 500, cursor: 'pointer' }}
              >
                Todas ({requests.length})
              </button>
              <button
                type="button"
                className={`academic-secondary-button ${activeTab === 'pendientes' ? 'active' : ''}`}
                onClick={() => setActiveTab('pendientes')}
                style={{ padding: '0.375rem 0.875rem', borderRadius: '0.5rem', border: 'none', background: activeTab === 'pendientes' ? 'var(--surface-lowest)' : 'transparent', fontWeight: activeTab === 'pendientes' ? 700 : 500, color: activeTab === 'pendientes' ? 'var(--primary)' : 'inherit', cursor: 'pointer' }}
              >
                Pendientes ({pendientesCount})
              </button>
              <button
                type="button"
                className={`academic-secondary-button ${activeTab === 'aceptadas' ? 'active' : ''}`}
                onClick={() => setActiveTab('aceptadas')}
                style={{ padding: '0.375rem 0.875rem', borderRadius: '0.5rem', border: 'none', background: activeTab === 'aceptadas' ? 'var(--surface-lowest)' : 'transparent', fontWeight: activeTab === 'aceptadas' ? 700 : 500, cursor: 'pointer' }}
              >
                Aceptadas ({aceptadasCount})
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', color: 'var(--on-surface-variant)', paddingRight: '0.5rem' }}>
              <span>Ordenar:</span>
              <select style={{ padding: '0.25rem 0.5rem', borderRadius: '0.375rem', border: 'none', background: 'var(--surface-lowest)', font: 'inherit' }}>
                <option>Más recientes primero</option>
                <option>Fecha cercana</option>
              </select>
            </div>
          </section>

          {selectedRequest && (
            <section style={{ background: 'var(--surface-lowest)', padding: '1.5rem', borderRadius: '0.875rem', boxShadow: '0 4px 16px rgba(0,0,0,0.08)', marginBottom: '1.5rem', border: '2px solid var(--primary)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', borderBottom: '1px solid var(--surface-low)', paddingBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: '0.5rem', background: 'var(--primary)', color: 'white', display: 'grid', placeItems: 'center' }}>
                    <Icon>task_alt</Icon>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--primary)', letterSpacing: '0.05em' }}>
                      HU-06 Acción Directa
                    </span>
                    <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700 }}>Aceptar Solicitud de Tutoría</h2>
                    <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--on-surface-variant)' }}>
                      Estudiante: <strong>{selectedRequest.estudiante_id?.nombre || selectedRequest.estudiante}</strong> • {selectedRequest.materia_id?.nombre || selectedRequest.materia} ({selectedRequest.estudiante_id?.matricula || selectedRequest.matricula || 'EST-2025'})
                    </p>
                  </div>
                </div>

                <button type="button" onClick={() => setSelectedRequest(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--on-surface-variant)' }}>
                  <Icon>close</Icon>
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', background: 'var(--surface-low)', padding: '0.875rem', borderRadius: '0.75rem', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Icon style={{ color: 'var(--primary)' }}>calendar_today</Icon>
                  <div>
                    <small style={{ fontSize: '0.6875rem', color: 'var(--on-surface-variant)', display: 'block' }}>Franja acordada</small>
                    <strong style={{ fontSize: '0.8125rem' }}>
                      {selectedRequest.horario_id ? `${selectedRequest.horario_id.dia || ''} ${selectedRequest.horario_id.hora_inicio || ''} - ${selectedRequest.horario_id.hora_fin || ''}` : `${selectedRequest.fecha || ''}, ${selectedRequest.hora || ''}`}
                    </strong>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Icon style={{ color: 'var(--secondary)' }}>psychology</Icon>
                  <div>
                    <small style={{ fontSize: '0.6875rem', color: 'var(--on-surface-variant)', display: 'block' }}>Tema central</small>
                    <strong style={{ fontSize: '0.8125rem' }}>{selectedRequest.tema || selectedRequest.tema_id?.nombre || 'Consulta Académica'}</strong>
                  </div>
                </div>
              </div>

              <form onSubmit={handleConfirmAccept} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                  <label style={{ fontSize: '0.8125rem', fontWeight: 700, display: 'block', marginBottom: '0.5rem' }}>
                    Modalidad del encuentro *
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.875rem', borderRadius: '0.75rem', background: modalidad === 'presencial' ? 'var(--surface-low)' : 'var(--surface-lowest)', border: modalidad === 'presencial' ? '2px solid var(--primary)' : '1px solid var(--surface-low)', cursor: 'pointer' }}>
                      <input type="radio" name="modalidad" value="presencial" checked={modalidad === 'presencial'} onChange={() => setModalidad('presencial')} />
                      <div>
                        <strong style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.875rem' }}>
                          <Icon style={{ fontSize: '1.125rem' }}>domain</Icon> Presencial
                        </strong>
                        <small style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)' }}>En campus universitario</small>
                      </div>
                    </label>

                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.875rem', borderRadius: '0.75rem', background: modalidad === 'virtual' ? 'var(--surface-low)' : 'var(--surface-lowest)', border: modalidad === 'virtual' ? '2px solid var(--primary)' : '1px solid var(--surface-low)', cursor: 'pointer' }}>
                      <input type="radio" name="modalidad" value="virtual" checked={modalidad === 'virtual'} onChange={() => setModalidad('virtual')} />
                      <div>
                        <strong style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.875rem' }}>
                          <Icon style={{ fontSize: '1.125rem' }}>videocam</Icon> Virtual
                        </strong>
                        <small style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)' }}>Vía videoconferencia</small>
                      </div>
                    </label>
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.8125rem', fontWeight: 700, display: 'block', marginBottom: '0.5rem' }}>
                    Tipo de sesión *
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.875rem', borderRadius: '0.75rem', background: tipoTutoria === 'individual' ? 'var(--surface-low)' : 'var(--surface-lowest)', border: tipoTutoria === 'individual' ? '2px solid var(--primary)' : '1px solid var(--surface-low)', cursor: 'pointer' }}>
                      <input type="radio" name="tipoTutoria" value="individual" checked={tipoTutoria === 'individual'} onChange={() => setTipoTutoria('individual')} />
                      <div>
                        <strong style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.875rem' }}>
                          <Icon style={{ fontSize: '1.125rem' }}>person</Icon> Individual
                        </strong>
                        <small style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)' }}>Solo {selectedRequest.estudiante_id?.nombre || selectedRequest.estudiante}</small>
                      </div>
                    </label>

                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.875rem', borderRadius: '0.75rem', background: tipoTutoria === 'grupal' ? 'var(--surface-low)' : 'var(--surface-lowest)', border: tipoTutoria === 'grupal' ? '2px solid var(--primary)' : '1px solid var(--surface-low)', cursor: 'pointer' }}>
                      <input type="radio" name="tipoTutoria" value="grupal" checked={tipoTutoria === 'grupal'} onChange={() => setTipoTutoria('grupal')} />
                      <div>
                        <strong style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.875rem' }}>
                          <Icon style={{ fontSize: '1.125rem' }}>groups</Icon> Grupal
                        </strong>
                        <small style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)' }}>Permite más cupos</small>
                      </div>
                    </label>
                  </div>
                </div>

                {tipoTutoria === 'grupal' && (
                  <div style={{ background: 'var(--surface-low)', padding: '0.875rem', borderRadius: '0.75rem' }}>
                    <label style={{ fontSize: '0.8125rem', fontWeight: 700, display: 'block', marginBottom: '0.25rem' }}>
                      Cupo máximo de estudiantes:
                    </label>
                    <input type="number" min="2" max="40" value={cupoMaximo} onChange={(e) => setCupoMaximo(e.target.value)} style={{ width: '100%', padding: '0.625rem', borderRadius: '0.5rem', border: 'none', font: 'inherit' }} />
                    <span style={{ fontSize: '0.6875rem', color: 'var(--on-surface-variant)' }}>Otros compañeros podrán unirse a esta tutoría hasta agotar cupo.</span>
                  </div>
                )}

                {modalidad === 'presencial' ? (
                  <div>
                    <label style={{ fontSize: '0.8125rem', fontWeight: 700, display: 'block', marginBottom: '0.25rem' }}>
                      Lugar de encuentro en campus *
                    </label>
                    <input value={lugarEncuentro} onChange={(e) => setLugarEncuentro(e.target.value)} placeholder="Ej. Cubículo 304, Edificio de Ciencias" style={{ width: '100%', padding: '0.625rem 0.875rem', borderRadius: '0.5rem', background: 'var(--surface-low)', border: 'none', font: 'inherit' }} />
                    <span style={{ fontSize: '0.6875rem', color: 'var(--on-surface-variant)' }}>Indica pabellón, piso o sala específica para puntualidad.</span>
                  </div>
                ) : (
                  <div>
                    <label style={{ fontSize: '0.8125rem', fontWeight: 700, display: 'block', marginBottom: '0.25rem' }}>
                      Enlace de videollamada *
                    </label>
                    <input type="url" value={linkVideollamada} onChange={(e) => setLinkVideollamada(e.target.value)} placeholder="https://meet.google.com/..." style={{ width: '100%', padding: '0.625rem 0.875rem', borderRadius: '0.5rem', background: 'var(--surface-low)', border: 'none', font: 'inherit' }} />
                    <span style={{ fontSize: '0.6875rem', color: 'var(--on-surface-variant)' }}>Se enviará invitación con enlace al correo institucional.</span>
                  </div>
                )}

                <div>
                  <label style={{ fontSize: '0.8125rem', fontWeight: 700, display: 'block', marginBottom: '0.25rem' }}>
                    Notas preparatorias para el estudiante (Opcional)
                  </label>
                  <textarea rows="3" value={notasEstudiante} onChange={(e) => setNotasEstudiante(e.target.value)} placeholder="Por favor traer el taller resuelto hasta el ejercicio 3..." style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', background: 'var(--surface-low)', border: 'none', font: 'inherit', resize: 'none' }} />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                  <button type="button" className="academic-secondary-button" onClick={() => setSelectedRequest(null)}>
                    Volver
                  </button>
                  <button type="submit" className="primary-button" disabled={submitting} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Icon>send_time_extension</Icon> {submitting ? 'Guardando...' : 'Confirmar y Aceptar'}
                  </button>
                </div>
              </form>
            </section>
          )}

          <section style={{ background: 'var(--surface-lowest)', borderRadius: '0.875rem', boxShadow: '0 1px 4px rgba(0,0,0,0.05)', overflow: 'hidden', marginBottom: '1.5rem' }}>
            {loading ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--on-surface-variant)' }}>
                Cargando solicitudes desde el servidor...
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'var(--surface-low)', fontSize: '0.75rem', color: 'var(--on-surface-variant)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    <th style={{ padding: '0.875rem 1rem', textAlign: 'left' }}>Estudiante</th>
                    <th style={{ padding: '0.875rem 1rem', textAlign: 'left' }}>Materia</th>
                    <th style={{ padding: '0.875rem 1rem', textAlign: 'left' }}>Tema Específico</th>
                    <th style={{ padding: '0.875rem 1rem', textAlign: 'left' }}>Fecha y Franja</th>
                    <th style={{ padding: '0.875rem 1rem', textAlign: 'left' }}>Estado</th>
                    <th style={{ padding: '0.875rem 1rem', textAlign: 'right' }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRequests.length === 0 ? (
                    <tr>
                      <td colSpan="6" style={{ padding: '2rem', textAlign: 'center', color: 'var(--on-surface-variant)' }}>
                        No se encontraron solicitudes en esta categoría.
                      </td>
                    </tr>
                  ) : (
                    filteredRequests.map((req) => {
                      const studentName = req.estudiante_id?.nombre || req.estudiante || 'Estudiante'
                      const studentMatricula = req.estudiante_id?.matricula || req.matricula || 'EST-2025'
                      const avatarUrl = req.estudiante_id?.avatar || req.avatar || DEFAULT_AVATAR
                      const subjectName = req.materia_id?.nombre || req.materia || 'Materia'
                      const topicName = req.tema || req.tema_id?.nombre || 'Consulta General'
                      const dateStr = req.horario_id?.dia || req.fecha || 'Por definir'
                      const timeStr = req.horario_id ? `${req.horario_id.hora_inicio} - ${req.horario_id.hora_fin}` : (req.hora || '')

                      return (
                        <tr key={req._id || req.id} style={{ borderBottom: '1px solid var(--surface-low)' }}>
                          <td style={{ padding: '1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                              <img src={avatarUrl} alt={studentName} style={{ width: '2.5rem', height: '2.5rem', borderRadius: '50%', objectFit: 'cover' }} />
                              <div>
                                <strong style={{ display: 'block', fontSize: '0.875rem' }}>{studentName}</strong>
                                <small style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)' }}>{studentMatricula}</small>
                              </div>
                            </div>
                          </td>

                          <td style={{ padding: '1rem' }}>
                            <span style={{ padding: '0.25rem 0.5rem', borderRadius: '0.375rem', background: 'var(--secondary-container)', color: 'var(--on-secondary-fixed)', fontSize: '0.75rem', fontWeight: 600 }}>
                              {subjectName}
                            </span>
                          </td>

                          <td style={{ padding: '1rem', maxWidth: '220px' }}>
                            <div style={{ fontSize: '0.8125rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {topicName}
                            </div>
                            <small style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)', display: 'block' }}>
                              {req.dificultad || 'Revision previa'}
                            </small>
                          </td>

                          <td style={{ padding: '1rem' }}>
                            <div style={{ fontSize: '0.8125rem', fontWeight: 600 }}>{dateStr}</div>
                            <small style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)' }}>{timeStr}</small>
                          </td>

                          <td style={{ padding: '1rem' }}>
                            <span style={{ padding: '0.25rem 0.625rem', borderRadius: '1rem', background: req.estado === 'aceptada' ? 'var(--primary-container)' : 'var(--tertiary-container)', color: req.estado === 'aceptada' ? 'var(--on-primary-container)' : 'var(--on-tertiary-container)', fontSize: '0.75rem', fontWeight: 700 }}>
                              {req.estado === 'aceptada' ? 'Aceptada' : 'Pendiente'}
                            </span>
                          </td>

                          <td style={{ padding: '1rem', textAlign: 'right' }}>
                            {req.estado === 'pendiente' ? (
                              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.375rem' }}>
                                <button type="button" className="primary-button" onClick={() => handleOpenAcceptForm(req)} style={{ padding: '0.4rem 0.75rem', fontSize: '0.8125rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                                  <Icon style={{ fontSize: '1rem' }}>check</Icon> Aceptar
                                </button>
                              </div>
                            ) : (
                              <span style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)' }}>Procesada</span>
                            )}
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            )}
          </section>

          <section style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div style={{ background: 'var(--surface-lowest)', padding: '1.25rem', borderRadius: '0.875rem', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <Icon style={{ color: 'var(--secondary)' }}>edit_calendar</Icon>
                <strong style={{ fontSize: '0.875rem' }}>Acción: Aplazar Solicitud</strong>
              </div>
              <p style={{ fontSize: '0.8125rem', color: 'var(--on-surface-variant)', margin: 0 }}>
                Sugiérele al alumno una fecha alternativa si tienes un compromiso académico o evento institucional imprevisto.
              </p>
            </div>

            <div style={{ background: 'var(--surface-lowest)', padding: '1.25rem', borderRadius: '0.875rem', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <Icon style={{ color: 'var(--error)' }}>cancel</Icon>
                <strong style={{ fontSize: '0.875rem' }}>Acción: Cancelar Solicitud</strong>
              </div>
              <p style={{ fontSize: '0.8125rem', color: 'var(--on-surface-variant)', margin: 0 }}>
                Desestima formalmente la cita con justificación si el tema solicitado corresponde a otra materia o cátedra.
              </p>
            </div>
          </section>
        </main>
      </div>
    </div>
  )
}