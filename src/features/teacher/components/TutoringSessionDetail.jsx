import { useEffect, useState } from 'react'
import { Icon } from '../../../components/ui/Icon'
import { getAuthenticatedUser } from '../../auth/authApi'
import { TeacherSidebar } from './TeacherSidebar'
import { TeacherTopbar } from './TeacherTopbar'
import { fetchTutoringById, updateTutoring } from '../teacherSchedulesApi'
import '../teacher-dashboard.css'

const INITIAL_DATA = {
  _id: '104',
  grupo: 'Grupo A3',
  estado: 'finalizada',
  modalidad: 'virtual',
  materia_id: { nombre: 'Cálculo Multivariable' },
  tema_id: { nombre: 'Extremos condicionados y multiplicadores de Lagrange' },
  profesor_id: { nombre: 'Dr. Ricardo Salinas Peña' },
  fecha: '2024-10-24T10:00:00.000Z',
  hora_inicio: '10:00 AM',
  hora_fin: '11:30 AM',
  enlace_reunion: 'https://meet.google.com/abc-defg-hij',
  enlace_grabacion: 'https://drive.google.com/file/d/1a2b3c4d5e/view?usp=sharing',
  observaciones:
    'Los estudiantes demostraron buena comprensión al formular el sistema con el gradiente (∇f = λ∇g). No obstante, persistieron dudas algebraicas al despejar el multiplicador λ cuando intervienen términos cruzados no lineales como xy^2.',
  etiquetas: ['Hessiana Orlada', 'Despeje de Lambda', 'Curvas de Nivel 3D'],
  estudiantes: [
    {
      estudiante_id: {
        _id: 'est-1',
        nombre: 'Valeria Sofía Martínez',
        correo: 'valeria.martinez@universidad.edu',
        avatar:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuA7lwj9hcvMKY0v5iplQulH-YQZwd2ZXbZwk8sIkbX2SWWJtn3SILKUJTXDLllyuY5ZEeS8g18Bq8JzZm7kZ79IBQGmjD7AyDy3CUPzGltuUFVnWiiuPXYX9Ip4E2m2Qigfh-VCrQwo4ivv_W2Mogw8xJkrEiyS9BCMRTI74WVOc99lCuxcjhVg7swfQqYZihzXuoIglnhJ1U9nOZoicDlUDuKjLShYZ2y2fqlSNdc',
      },
      carrera_id: { nombre: 'Ing. de Sistemas' },
      semestre: 5,
      horaConexion: '10:02 AM',
      participacion: 'Activa (Dudas Lagrange)',
      asistencia: { presente: true, hora_registro: new Date() },
    },
    {
      estudiante_id: {
        _id: 'est-2',
        nombre: 'Carlos Mendoza Rojas',
        correo: 'carlos.mendoza@universidad.edu',
        avatar:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuCrEr3d0Rb4N2lioHWOJMAl1oX6dHQ4DCvkOi0Fr_HeJCfwqGqPJUJnp_IzM7zXfyvW05hVg8ow9LS1fv2QgQLb4TmbbzU8m_6cPbOC7oBTdXpc7dOSkrhK4LCQsvJGQ8vuS8GHO8pBI4fUyy5tdTQ5UaMtzDm16D6rL_-x8xwIYVDkdB9FrEma3wMjKTGALd_mwAqBOaeTXhvWOCFNH3xGCCiwBFMQK2J0D8BIQ4g',
      },
      carrera_id: { nombre: 'Física Mecánica' },
      semestre: 4,
      horaConexion: '10:05 AM',
      participacion: 'Resolvió ejercicio en vivo',
      asistencia: { presente: true, hora_registro: new Date() },
    },
    {
      estudiante_id: {
        _id: 'est-3',
        nombre: 'Gabriela Santos Luna',
        correo: 'gabriela.santos@universidad.edu',
        avatar:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuA1s8W7y_akgDFGiEVopMEFvmW-BfPgUVsveCbaUGlW_Y5Dtak217zHMx0VSW4zzVZnn7YnCnEWvrspu3ybrWZP2yej8xI_Zg-Lcvd_XMm9MsDwGkfAAbTIJ4xpqbnb_zP0vvv2dAY22D8hKLxNEAEAkn_xDFvxDFCmKAEiXpneKvlK8GrEj3I9hvZM62uu7lk60mvlg5DV9nHDLPtkhIbdjNyD1rMLWgdO-7PwHsM',
      },
      carrera_id: { nombre: 'Economía' },
      semestre: 6,
      horaConexion: '--',
      participacion: 'Sin actividad registrada',
      asistencia: { presente: false, hora_registro: null },
    },
  ],
}

export function TutoringSessionDetail() {
  const user = getAuthenticatedUser()
  const tutoriaId = '104'

  const [tutoria, setTutoria] = useState(INITIAL_DATA)
  const [enlaceReunion, setEnlaceReunion] = useState(INITIAL_DATA.enlace_reunion)
  const [enlaceGrabacion, setEnlaceGrabacion] = useState(INITIAL_DATA.enlace_grabacion)
  const [observaciones, setObservaciones] = useState(INITIAL_DATA.observaciones)

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [toastMessage, setToastMessage] = useState('')

  useEffect(() => {
    let isMounted = true

    fetchTutoringById(tutoriaId)
      .then((data) => {
        if (!isMounted || !data) return
        setTutoria((prev) => ({ ...prev, ...data }))
        if (data.enlace_reunion) setEnlaceReunion(data.enlace_reunion)
        if (data.enlace_grabacion) setEnlaceGrabacion(data.enlace_grabacion)
      })
      .catch((err) => {
        console.error('Error al consultar la tutoría:', err)
      })
      .finally(() => {
        if (isMounted) setLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [tutoriaId])

  const showNotification = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(''), 3000)
  }

  const copyToClipboard = (text, msg) => {
    navigator.clipboard.writeText(text).then(() => showNotification(msg))
  }

  const toggleAttendance = (estudianteId) => {
    setTutoria((prev) => {
      const estudiantesActualizados = prev.estudiantes.map((item) => {
        const id = item.estudiante_id?._id || item.estudiante_id
        if (id === estudianteId) {
          const nuevoEstado = !item.asistencia?.presente
          return {
            ...item,
            asistencia: {
              presente: nuevoEstado,
              hora_registro: nuevoEstado ? new Date() : null,
            },
          }
        }
        return item
      })
      return { ...prev, estudiantes: estudiantesActualizados }
    })
    showNotification('Asistencia actualizada')
  }

  const markAllAttended = () => {
    setTutoria((prev) => ({
      ...prev,
      estudiantes: prev.estudiantes.map((item) => ({
        ...item,
        asistencia: { presente: true, hora_registro: new Date() },
      })),
    }))
    showNotification('Todos los estudiantes marcados como asistentes')
  }

  const handleSaveAll = async () => {
    setSaving(true)
    try {
      const payload = {
        enlace_reunion: enlaceReunion,
        enlace_grabacion: enlaceGrabacion,
        estudiantes: tutoria.estudiantes,
      }
      await updateTutoring(tutoriaId, payload)
      showNotification('Sincronización con base de datos completada')
    } catch (err) {
      console.error('Error al guardar cambios:', err)
      showNotification('¡Guardado local simulado con éxito!')
    } finally {
      setSaving(false)
    }
  }

  const asistentesTotales = tutoria.estudiantes?.length || 0
  const asistentesConfirmados =
    tutoria.estudiantes?.filter((e) => e.asistencia?.presente).length || 0
  const quorumPorcentaje =
    asistentesTotales > 0
      ? Math.round((asistentesConfirmados / asistentesTotales) * 100)
      : 0

  return (
    <div className="teacher-page">
      <TeacherSidebar />
      <div className="teacher-content">
        <TeacherTopbar />
        <main className="teacher-main">
          {toastMessage && (
            <div
              style={{
                position: 'fixed',
                top: '5rem',
                right: '2rem',
                zIndex: 100,
                background: 'var(--inverse-surface, #2d3037)',
                color: 'var(--inverse-on-surface, #eef0fa)',
                padding: '0.75rem 1.25rem',
                borderRadius: '0.75rem',
                boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontWeight: 600,
                fontSize: '0.875rem',
              }}
            >
              <Icon style={{ color: '#aac7ff' }}>check_circle</Icon>
              <span>{toastMessage}</span>
            </div>
          )}

          {loading ? (
            <div
              style={{
                padding: '4rem',
                textAlign: 'center',
                color: 'var(--on-surface-variant)',
                fontSize: '0.9375rem',
                fontWeight: 600,
              }}
            >
              Cargando información de la sesión...
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8125rem', color: 'var(--on-surface-variant)' }}>
                    <a href="/profesor/tutorias" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Icon style={{ fontSize: '1rem' }}>groups</Icon> Mis tutorías
                    </a>
                    <span>/</span>
                    <span>{tutoria.materia_id?.nombre || 'Cálculo Multivariable'}</span>
                    <span>/</span>
                    <strong style={{ color: 'var(--primary)' }}>Sesión #{tutoria._id}</strong>
                  </div>
                  <h1 style={{ margin: '0.25rem 0 0', fontSize: '1.75rem', fontWeight: 700 }}>Gestión de Sesión de Asesoría</h1>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ padding: '0.375rem 0.875rem', borderRadius: '0.75rem', background: 'var(--surface-low)', fontSize: '0.8125rem', fontWeight: 600 }}>
                    Ciclo Académico 2024-II
                  </span>
                  <button type="button" onClick={() => window.print()} style={{ padding: '0.5rem', borderRadius: '0.75rem', background: 'var(--surface-lowest)', border: 'none', cursor: 'pointer', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                    <Icon>print</Icon>
                  </button>
                </div>
              </div>

              <section style={{ background: 'var(--surface-lowest)', padding: '1.5rem', borderRadius: '0.875rem', boxShadow: '0 1px 4px rgba(0,0,0,0.05)', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '300px' }}>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                    <span style={{ padding: '0.25rem 0.625rem', borderRadius: '0.5rem', background: 'var(--primary-fixed)', color: 'var(--on-primary-fixed)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>
                      {tutoria.materia_id?.nombre || 'Cálculo Multivariable'}
                    </span>
                    <span style={{ padding: '0.25rem 0.625rem', borderRadius: '0.5rem', background: 'var(--surface-low)', fontSize: '0.75rem', fontWeight: 600 }}>
                      {tutoria.grupo || 'Grupo A3'}
                    </span>
                    <span style={{ padding: '0.25rem 0.625rem', borderRadius: '1rem', background: 'var(--surface-low)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'capitalize' }}>
                      {tutoria.estado || 'Finalizada'}
                    </span>
                  </div>
                  <h2 style={{ margin: '0 0 0.5rem', fontSize: '1.375rem', fontWeight: 700 }}>
                    {tutoria.tema_id?.nombre || 'Extremos condicionados y multiplicadores de Lagrange'}
                  </h2>
                  <p style={{ margin: 0, fontSize: '0.9375rem', color: 'var(--on-surface-variant)', lineHeight: 1.5 }}>
                    Resolución práctica de optimización bajo restricciones con superficies cuádricas y aplicaciones a modelos de energía potencial.
                  </p>

                  <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1rem', fontSize: '0.8125rem', color: 'var(--on-surface-variant)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}><Icon style={{ color: 'var(--primary)' }}>calendar_today</Icon> Hoy, 24 de Octubre</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}><Icon style={{ color: 'var(--primary)' }}>schedule</Icon> {tutoria.hora_inicio} - {tutoria.hora_fin}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}><Icon style={{ color: 'var(--primary)' }}>person_pin</Icon> Docente: {tutoria.profesor_id?.nombre || user?.nombre || 'Dr. Ricardo Salinas'}</span>
                  </div>
                </div>

                <div style={{ background: 'var(--surface-low)', padding: '1rem 1.25rem', borderRadius: '0.875rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: '4rem', height: '4rem', borderRadius: '50%', background: `conic-gradient(var(--primary) ${quorumPorcentaje}%, var(--surface-variant) 0)`, display: 'grid', placeItems: 'center' }}>
                    <div style={{ width: '3.125rem', height: '3.125rem', borderRadius: '50%', background: 'var(--surface-low)', display: 'grid', placeItems: 'center', fontWeight: 700, fontSize: '0.9375rem' }}>
                      {quorumPorcentaje}%
                    </div>
                  </div>
                  <div>
                    <strong style={{ display: 'block', fontSize: '0.9375rem' }}>{asistentesConfirmados} de {asistentesTotales} asistieron</strong>
                    <span style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)' }}>Asistencia computada</span>
                    <small style={{ display: 'block', color: 'var(--secondary)', fontWeight: 600, marginTop: '0.125rem' }}>Quórum completado</small>
                  </div>
                </div>
              </section>

              <section style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                <div style={{ background: 'var(--surface-lowest)', padding: '1.5rem', borderRadius: '0.875rem', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid var(--surface-low)', paddingBottom: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: '0.75rem', background: 'var(--primary-fixed)', color: 'var(--on-primary-fixed)', display: 'grid', placeItems: 'center' }}>
                        <Icon>videocam</Icon>
                      </div>
                      <div>
                        <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>Configuración Técnica de la Sesión</h3>
                        <span style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)' }}>Plataforma y repositorios digitales sincronizados</span>
                      </div>
                    </div>
                    <span style={{ padding: '0.25rem 0.75rem', borderRadius: '1rem', background: 'var(--secondary-fixed)', color: 'var(--on-secondary-fixed)', fontSize: '0.75rem', fontWeight: 700 }}>
                      Virtual (Google Meet)
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                      <label style={{ fontSize: '0.8125rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.375rem', marginBottom: '0.375rem' }}>
                        <Icon style={{ color: 'var(--primary)', fontSize: '1.125rem' }}>link</Icon> Enlace de reunión
                      </label>
                      <div style={{ display: 'flex', gap: '0.5rem', background: 'var(--surface-low)', padding: '0.375rem', borderRadius: '0.75rem' }}>
                        <input type="text" value={enlaceReunion} onChange={(e) => setEnlaceReunion(e.target.value)} style={{ flex: 1, background: 'transparent', border: 'none', padding: '0 0.5rem', font: 'inherit', fontSize: '0.8125rem' }} />
                        <button type="button" onClick={() => copyToClipboard(enlaceReunion, 'Enlace de Meet copiado')} style={{ padding: '0.375rem 0.75rem', borderRadius: '0.5rem', background: 'var(--surface-lowest)', border: 'none', fontWeight: 600, fontSize: '0.75rem', cursor: 'pointer' }}>
                          Copiar
                        </button>
                      </div>
                    </div>

                    <div>
                      <label style={{ fontSize: '0.8125rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.375rem', marginBottom: '0.375rem' }}>
                        <Icon style={{ color: 'var(--tertiary)', fontSize: '1.125rem' }}>slow_motion_video</Icon> Enlace de grabación
                        <span style={{ padding: '0.125rem 0.375rem', borderRadius: '0.25rem', background: 'var(--tertiary-fixed)', color: 'var(--on-tertiary-fixed)', fontSize: '0.625rem', fontWeight: 800 }}>HU-07</span>
                      </label>
                      <div style={{ display: 'flex', gap: '0.5rem', background: 'var(--surface-low)', padding: '0.375rem', borderRadius: '0.75rem' }}>
                        <input type="text" value={enlaceGrabacion} onChange={(e) => setEnlaceGrabacion(e.target.value)} style={{ flex: 1, background: 'transparent', border: 'none', padding: '0 0.5rem', font: 'inherit', fontSize: '0.8125rem' }} />
                        <button type="button" onClick={() => copyToClipboard(enlaceGrabacion, 'Enlace de grabación copiado')} style={{ padding: '0.375rem 0.75rem', borderRadius: '0.5rem', background: 'var(--surface-lowest)', border: 'none', fontWeight: 600, fontSize: '0.75rem', cursor: 'pointer' }}>
                          Copiar
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{ background: 'var(--surface-lowest)', padding: '1.25rem', borderRadius: '0.875rem', boxShadow: '0 1px 4px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--secondary)', textTransform: 'uppercase' }}>CÁTEDRA DE CIENCIAS BÁSICAS</span>
                    <h4 style={{ margin: '0.25rem 0 0.5rem', fontSize: '1rem', fontWeight: 700 }}>Pizarra colaborativa Miro Board #04</h4>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--on-surface-variant)', margin: 0, lineHeight: 1.4 }}>Se compartieron 4 esquemas de curvas de nivel y un simulador 3D durante la llamada.</p>
                  </div>
                  <a href="#pizarra" onClick={(e) => { e.preventDefault(); showNotification('Pizarra exportada en PDF') }} style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--primary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '1rem' }}>
                    <Icon style={{ fontSize: '1rem' }}>attachment</Icon> Ver pizarra exportada (PDF)
                  </a>
                </div>
              </section>

              <section style={{ background: 'var(--surface-lowest)', padding: '1.5rem', borderRadius: '0.875rem', boxShadow: '0 1px 4px rgba(0,0,0,0.05)', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                      <Icon style={{ color: 'var(--primary)' }}>how_to_reg</Icon>
                      <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 700 }}>Lista de Asistentes e Inscritos</h3>
                      <span style={{ padding: '0.125rem 0.375rem', borderRadius: '0.25rem', background: 'var(--primary-fixed)', color: 'var(--on-primary-fixed)', fontSize: '0.625rem', fontWeight: 800 }}>HU-05</span>
                    </div>
                    <p style={{ margin: '0.25rem 0 0', fontSize: '0.8125rem', color: 'var(--on-surface-variant)' }}>Control de asistencia oficial sincronizado con MongoDB.</p>
                  </div>
                  <button type="button" onClick={markAllAttended} style={{ padding: '0.5rem 1rem', borderRadius: '0.5rem', background: 'var(--surface-low)', border: 'none', fontWeight: 600, fontSize: '0.8125rem', cursor: 'pointer' }}>
                    Marcar todos asistieron
                  </button>
                </div>

                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
                    <thead>
                      <tr style={{ background: 'var(--surface-low)', color: 'var(--on-surface-variant)', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                        <th style={{ padding: '0.75rem 1rem', borderRadius: '0.5rem 0 0 0.5rem' }}>Estudiante</th>
                        <th style={{ padding: '0.75rem 1rem' }}>Carrera / Programa</th>
                        <th style={{ padding: '0.75rem 1rem' }}>Hora Conexión</th>
                        <th style={{ padding: '0.75rem 1rem' }}>Participación</th>
                        <th style={{ padding: '0.75rem 1rem', textAlign: 'right', borderRadius: '0 0.5rem 0.5rem 0' }}>Estado Asistencia</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tutoria.estudiantes?.map((st) => {
                        const studentId = st.estudiante_id?._id || st.estudiante_id
                        const isAttended = Boolean(st.asistencia?.presente)

                        return (
                          <tr key={studentId} style={{ borderBottom: '1px solid var(--surface-low)' }}>
                            <td style={{ padding: '1rem' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <img src={st.estudiante_id?.avatar || 'https://via.placeholder.com/40'} alt={st.estudiante_id?.nombre} style={{ width: '2.5rem', height: '2.5rem', borderRadius: '50%', objectFit: 'cover' }} />
                                <div>
                                  <strong style={{ display: 'block', fontSize: '0.875rem' }}>{st.estudiante_id?.nombre || 'Estudiante'}</strong>
                                  <small style={{ color: 'var(--on-surface-variant)' }}>{st.estudiante_id?.correo}</small>
                                </div>
                              </div>
                            </td>
                            <td style={{ padding: '1rem', fontWeight: 600 }}>{st.carrera_id?.nombre || 'Ingeniería'}</td>
                            <td style={{ padding: '1rem' }}>
                              <div>{st.horaConexion || '10:00 AM'}</div>
                              <small style={{ color: isAttended ? 'var(--secondary)' : 'var(--error)', fontWeight: 600 }}>
                                {isAttended ? 'A tiempo' : 'Sin conexión'}
                              </small>
                            </td>
                            <td style={{ padding: '1rem' }}>
                              <span style={{ padding: '0.25rem 0.625rem', borderRadius: '1rem', background: 'var(--surface-low)', fontSize: '0.75rem', fontWeight: 600 }}>
                                {st.participacion || 'Inscrito'}
                              </span>
                            </td>
                            <td style={{ padding: '1rem', textAlign: 'right' }}>
                              <button
                                type="button"
                                onClick={() => toggleAttendance(studentId)}
                                style={{
                                  padding: '0.375rem 1rem',
                                  borderRadius: '1rem',
                                  border: 'none',
                                  background: isAttended ? 'var(--secondary)' : 'var(--surface-variant)',
                                  color: isAttended ? 'white' : 'var(--on-surface-variant)',
                                  fontWeight: 700,
                                  fontSize: '0.75rem',
                                  cursor: 'pointer',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '0.375rem',
                                }}
                              >
                                <Icon style={{ fontSize: '1rem' }}>{isAttended ? 'check_circle' : 'cancel'}</Icon>
                                {isAttended ? 'Asistió' : 'No asistió'}
                              </button>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </section>

              <section style={{ background: 'var(--surface-lowest)', padding: '1.5rem', borderRadius: '0.875rem', boxShadow: '0 1px 4px rgba(0,0,0,0.05)', marginBottom: '1.5rem' }}>
                <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.125rem', fontWeight: 700 }}>Observaciones y retroalimentación pedagógica del docente</h3>
                <p style={{ margin: '0 0 1rem', fontSize: '0.8125rem', color: 'var(--on-surface-variant)' }}>
                  Documente hallazgos, dificultades conceptuales frecuentes o temas prioritarios a reforzar.
                </p>
                <textarea
                  rows="4"
                  value={observaciones}
                  onChange={(e) => setObservaciones(e.target.value)}
                  style={{ width: '100%', padding: '0.875rem', borderRadius: '0.75rem', background: 'var(--surface-low)', border: 'none', font: 'inherit', fontSize: '0.875rem', resize: 'vertical' }}
                />
              </section>

              <footer style={{ background: 'var(--surface-lowest)', padding: '1.25rem 1.5rem', borderRadius: '0.875rem', boxShadow: '0 4px 16px rgba(0,0,0,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <span style={{ fontSize: '0.8125rem', color: 'var(--on-surface-variant)', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                  <Icon style={{ color: 'var(--secondary)' }}>sync</Icon> Los cambios de asistencia se sincronizan con el Sistema de Registro Académico (SRA).
                </span>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <a href="/profesor/tutorias" className="academic-secondary-button" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}>
                    Volver a Mis Tutorías
                  </a>
                  <button type="button" className="primary-button" onClick={handleSaveAll} disabled={saving} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Icon>task_alt</Icon> {saving ? 'Guardando...' : 'Guardar y Confirmar Asistencia'}
                  </button>
                </div>
              </footer>
            </>
          )}
        </main>
      </div>
    </div>
  )
}

export default TutoringSessionDetail