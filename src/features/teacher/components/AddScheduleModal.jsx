import { useCallback, useEffect, useState } from 'react'
import { Icon } from '../../../components/ui/Icon'
import { getAuthenticatedUser } from '../../auth/authApi'
import { TeacherSidebar } from './TeacherSidebar'
import { TeacherTopbar } from './TeacherTopbar'
import {
  createAvailableSchedule,
  deleteAvailableSchedule,
  fetchTeacherSchedules,
  fetchSubjects,
} from '../teacherSchedulesApi'
import '../teacher-dashboard.css'

const DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes']

function normalizeText(str) {
  return str
    ? str.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim()
    : ''
}

function getNextDateForDay(dayName) {
  const norm = normalizeText(dayName)
  const daysMap = { lunes: 1, martes: 2, miercoles: 3, jueves: 4, viernes: 5, sabado: 6, domingo: 0 }
  const targetDay = daysMap[norm] ?? 1

  const today = new Date()
  const currentDay = today.getDay()
  let diff = targetDay - currentDay
  if (diff < 0) diff += 7

  const resultDate = new Date(today)
  resultDate.setDate(today.getDate() + diff)
  return resultDate
}

function isSameDay(schedule, targetDay) {
  const normTarget = normalizeText(targetDay)

  if (schedule.dia) {
    return normalizeText(schedule.dia) === normTarget
  }

  if (schedule.fecha) {
    const d = new Date(schedule.fecha)
    const daysMap = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado']
    const localDayName = daysMap[d.getDay()]
    const utcDayName = daysMap[d.getUTCDay()]
    return localDayName === normTarget || utcDayName === normTarget
  }

  return false
}

function parseTimeToMinutes(timeStr) {
  if (!timeStr) return 0
  const match = timeStr.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i)
  if (!match) return 0

  let hours = parseInt(match[1], 10)
  const minutes = parseInt(match[2], 10)
  const modifier = match[3]?.toUpperCase()

  if (modifier === 'PM' && hours < 12) hours += 12
  if (modifier === 'AM' && hours === 12) hours = 0

  return hours * 60 + minutes
}

function checkOverlap(slotA, slotB) {
  if (slotA.day !== slotB.day) return false
  const startA = parseTimeToMinutes(slotA.startTime)
  const endA = parseTimeToMinutes(slotA.endTime)
  const startB = parseTimeToMinutes(slotB.startTime)
  const endB = parseTimeToMinutes(slotB.endTime)

  return Math.max(startA, startB) < Math.min(endA, endB)
}

export function AddScheduleModal() {
  const user = getAuthenticatedUser()
  const userId = user?._id || user?.id

  const [subjects, setSubjects] = useState([])
  const [selectedSubject, setSelectedSubject] = useState('')
  const [existingSchedules, setExistingSchedules] = useState([])

  const [showForm, setShowForm] = useState(false)
  const [slots, setSlots] = useState([
    { id: 1, day: 'Lunes', startTime: '08:00 AM', endTime: '10:00 AM', modality: 'Presencial (Cubículo 304)' },
  ])
  const [saving, setSaving] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [blockedSchedule, setBlockedSchedule] = useState(false)

  const loadData = useCallback(async () => {
    if (!userId) return
    try {
      const [subs, scheds] = await Promise.all([
        fetchSubjects(),
        fetchTeacherSchedules(userId),
      ])
      setSubjects(subs)
      if (subs.length > 0 && !selectedSubject) {
        setSelectedSubject(subs[0]._id || subs[0].id)
      }
      setExistingSchedules(scheds)
    } catch (err) {
      console.error('Error cargando datos de horarios:', err)
    }
  }, [userId, selectedSubject])

  useEffect(() => {
    let isMounted = true
    if (userId) {
      Promise.all([fetchSubjects(), fetchTeacherSchedules(userId)])
        .then(([subs, scheds]) => {
          if (!isMounted) return
          setSubjects(subs)
          if (subs.length > 0) setSelectedSubject(subs[0]._id || subs[0].id)
          setExistingSchedules(scheds)
        })
        .catch((err) => {
          if (!isMounted) return
          console.error('Error inicial:', err)
        })
    }
    return () => {
      isMounted = false
    }
  }, [userId])

  const overlaps = []
  for (let i = 0; i < slots.length; i++) {
    for (let j = i + 1; j < slots.length; j++) {
      if (checkOverlap(slots[i], slots[j])) {
        overlaps.push({ slotA: slots[i], slotB: slots[j] })
      }
    }
  }

  const addSlot = () => {
    setSlots((prev) => [
      ...prev,
      {
        id: Date.now(),
        day: 'Martes',
        startTime: '14:00 PM',
        endTime: '16:00 PM',
        modality: 'Virtual (Google Meet)',
      },
    ])
  }

  const removeSlot = (id) => {
    if (slots.length === 1) return
    setSlots((prev) => prev.filter((s) => s.id !== id))
  }

  const updateSlot = (id, field, value) => {
    setSlots((prev) => prev.map((s) => (s.id === id ? { ...s, [field]: value } : s)))
  }

  const handleDeleteExisting = async (scheduleId) => {
    try {
      await deleteAvailableSchedule(scheduleId)
      await loadData()
    } catch (err) {
      if (err.status === 409) {
        setBlockedSchedule(true)
      } else {
        setErrorMsg(err.message)
      }
    }
  }

  const handleSave = async () => {
    if (overlaps.length > 0) {
      setErrorMsg('Corrige los solapamientos de horario antes de guardar.')
      return
    }

    if (!selectedSubject) {
      setErrorMsg('Debes seleccionar una asignatura.')
      return
    }

    setSaving(true)
    setErrorMsg('')

    try {
      for (const slot of slots) {
        await createAvailableSchedule({
          profesor_id: userId,
          materia_id: selectedSubject,
          dia: slot.day,
          fecha: getNextDateForDay(slot.day),
          hora_inicio: slot.startTime,
          hora_fin: slot.endTime,
          modalidad_permitida: slot.modality,
          estado: 'libre',
        })
      }

      await loadData()
      setShowForm(false)
    } catch (err) {
      setErrorMsg(err.message)
    } finally {
      setSaving(false)
    }
  }

  const totalBloques = existingSchedules.length
  const franjasReservadas = existingSchedules.filter((s) => s.estado === 'aceptada' || s.estado === 'ocupado').length
  const franjasLibres = existingSchedules.filter((s) => s.estado === 'libre').length
  const materiasUnicas = new Set(existingSchedules.map((s) => s.materia_id?.nombre)).size

  return (
    <div className="teacher-page">
      <TeacherSidebar />
      <div className="teacher-content">
        <TeacherTopbar />
        <main className="teacher-main">
          {/* Encabezado con tarjeta container estándar para dar el aire del Dashboard */}
          <section className="teacher-welcome">
            <div>
              <span className="teacher-overline">
                <i /> Gestión Académica • HU-08 / HU-01 Planificación
              </span>
              <h1>Mis Horarios de Asesoría</h1>
              <p>Configura los bloques de disponibilidad semanal para asesorías académicas y resuelve empalmes de agenda.</p>
            </div>

            <div className="teacher-welcome-actions">
              <button
                type="button"
                className="primary-button"
                onClick={() => setShowForm(!showForm)}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <Icon>{showForm ? 'remove_circle' : 'add_circle'}</Icon>
                <span>{showForm ? 'Ocultar formulario' : '+ Agregar horario'}</span>
              </button>
            </div>
          </section>

          {/* Tarjetas de Resumen (Métricas Bento) */}
          <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ background: 'var(--surface-lowest)', padding: '1.25rem', borderRadius: '0.875rem', boxShadow: '0 1px 4px rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '0.8125rem', color: 'var(--on-surface-variant)' }}>Total Horas / Sem.</span>
                <h3 style={{ margin: '0.25rem 0 0', fontSize: '1.5rem', fontWeight: 700 }}>{totalBloques * 2} hrs</h3>
                <small style={{ color: 'var(--primary)', fontWeight: 600 }}>{totalBloques} bloques activos</small>
              </div>
              <div style={{ width: '2.75rem', height: '2.75rem', borderRadius: '0.75rem', background: 'var(--surface-low)', display: 'grid', placeItems: 'center', color: 'var(--primary)' }}>
                <Icon>schedule</Icon>
              </div>
            </div>

            <div style={{ background: 'var(--surface-lowest)', padding: '1.25rem', borderRadius: '0.875rem', boxShadow: '0 1px 4px rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '0.8125rem', color: 'var(--on-surface-variant)' }}>Franjas Reservadas</span>
                <h3 style={{ margin: '0.25rem 0 0', fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary)' }}>{franjasReservadas} citas</h3>
                <small style={{ color: 'var(--on-surface-variant)', fontWeight: 600 }}>
                  {totalBloques > 0 ? Math.round((franjasReservadas / totalBloques) * 100) : 0}% ocupación
                </small>
              </div>
              <div style={{ width: '2.75rem', height: '2.75rem', borderRadius: '0.75rem', background: 'var(--surface-low)', display: 'grid', placeItems: 'center', color: 'var(--primary)' }}>
                <Icon>event_available</Icon>
              </div>
            </div>

            <div style={{ background: 'var(--surface-lowest)', padding: '1.25rem', borderRadius: '0.875rem', boxShadow: '0 1px 4px rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '0.8125rem', color: 'var(--on-surface-variant)' }}>Franjas Libres</span>
                <h3 style={{ margin: '0.25rem 0 0', fontSize: '1.5rem', fontWeight: 700 }}>{franjasLibres} libres</h3>
                <small style={{ color: 'var(--on-surface-variant)' }}>Listas para asignación</small>
              </div>
              <div style={{ width: '2.75rem', height: '2.75rem', borderRadius: '0.75rem', background: 'var(--surface-low)', display: 'grid', placeItems: 'center', color: 'var(--on-surface-variant)' }}>
                <Icon>door_open</Icon>
              </div>
            </div>

            <div style={{ background: 'var(--surface-lowest)', padding: '1.25rem', borderRadius: '0.875rem', boxShadow: '0 1px 4px rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '0.8125rem', color: 'var(--on-surface-variant)' }}>Asignaturas</span>
                <h3 style={{ margin: '0.25rem 0 0', fontSize: '1.5rem', fontWeight: 700 }}>{materiasUnicas} activas</h3>
                <small style={{ color: 'var(--on-surface-variant)' }}>Habilitadas en periodo</small>
              </div>
              <div style={{ width: '2.75rem', height: '2.75rem', borderRadius: '0.75rem', background: 'var(--surface-low)', display: 'grid', placeItems: 'center', color: 'var(--on-surface-variant)' }}>
                <Icon>menu_book</Icon>
              </div>
            </div>
          </section>

          {/* Formulario de Registro de Franjas */}
          {showForm && (
            <section style={{ background: 'var(--surface-lowest)', padding: '1.5rem', borderRadius: '0.875rem', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginBottom: '1.5rem', border: '1px solid var(--surface-low)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', borderBottom: '1px solid var(--surface-low)', paddingBottom: '0.75rem' }}>
                <div style={{ width: '2.25rem', height: '2.25rem', borderRadius: '0.5rem', background: 'var(--primary)', color: 'white', display: 'grid', placeItems: 'center' }}>
                  <Icon>more_time</Icon>
                </div>
                <div>
                  <h2 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 700 }}>Agregar Franjas de Asesoría</h2>
                  <span style={{ fontSize: '0.8125rem', color: 'var(--on-surface-variant)' }}>Formulario de registro y disponibilidad por docente</span>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
                <div>
                  <label style={{ fontSize: '0.8125rem', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>Docente Titular</label>
                  <input readOnly value={user?.nombre || 'Dr. Ricardo Salinas Peña'} style={{ width: '100%', padding: '0.625rem 0.875rem', borderRadius: '0.5rem', background: 'var(--surface-low)', border: 'none', cursor: 'not-allowed', font: 'inherit' }} />
                  <span style={{ fontSize: '0.6875rem', color: 'var(--on-surface-variant)' }}>Prellenado por sesión activa</span>
                </div>

                <div>
                  <label style={{ fontSize: '0.8125rem', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>Asignatura *</label>
                  <select value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)} style={{ width: '100%', padding: '0.625rem 0.875rem', borderRadius: '0.5rem', background: 'var(--surface-low)', border: 'none', font: 'inherit' }}>
                    {subjects.map((sub) => (
                      <option key={sub._id || sub.id} value={sub._id || sub.id}>
                        {sub.nombre}
                      </option>
                    ))}
                  </select>
                  <span style={{ fontSize: '0.6875rem', color: 'var(--on-surface-variant)' }}>Materia sobre la que se habilita</span>
                </div>

                <div>
                  <label style={{ fontSize: '0.8125rem', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>Periodo</label>
                  <input readOnly value="Semestre 2025-I" style={{ width: '100%', padding: '0.625rem 0.875rem', borderRadius: '0.5rem', background: 'var(--surface-low)', border: 'none', cursor: 'not-allowed', font: 'inherit' }} />
                  <span style={{ fontSize: '0.6875rem', color: 'var(--on-surface-variant)' }}>Periodo lectivo en curso</span>
                </div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <strong style={{ fontSize: '0.875rem' }}>Franjas Horarias Semanales ({slots.length} configuradas)</strong>
                  <span style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)' }}>Define días y rango de atención</span>
                </div>

                {slots.map((slot) => {
                  const isConflicting = overlaps.some((o) => o.slotA.id === slot.id || o.slotB.id === slot.id)

                  return (
                    <div key={slot.id} style={{ padding: '0.875rem', borderRadius: '0.75rem', background: 'var(--surface-low)', marginBottom: '0.75rem', border: isConflicting ? '1px solid var(--error)' : 'none' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 2fr auto', gap: '0.5rem', alignItems: 'center' }}>
                        <select value={slot.day} onChange={(e) => updateSlot(slot.id, 'day', e.target.value)} style={{ padding: '0.5rem', borderRadius: '0.5rem', border: 'none', font: 'inherit' }}>
                          {DAYS.map((d) => <option key={d} value={d}>{d}</option>)}
                        </select>
                        <input value={slot.startTime} onChange={(e) => updateSlot(slot.id, 'startTime', e.target.value)} placeholder="08:00 AM" style={{ padding: '0.5rem', borderRadius: '0.5rem', border: 'none', font: 'inherit' }} />
                        <input value={slot.endTime} onChange={(e) => updateSlot(slot.id, 'endTime', e.target.value)} placeholder="10:00 AM" style={{ padding: '0.5rem', borderRadius: '0.5rem', border: 'none', font: 'inherit' }} />
                        <input value={slot.modality} onChange={(e) => updateSlot(slot.id, 'modality', e.target.value)} placeholder="Modalidad / Lugar" style={{ padding: '0.5rem', borderRadius: '0.5rem', border: 'none', font: 'inherit' }} />
                        <button type="button" onClick={() => removeSlot(slot.id)} style={{ background: 'none', border: 'none', color: 'var(--error)', cursor: 'pointer' }}>
                          <Icon>delete</Icon>
                        </button>
                      </div>

                      {isConflicting && (
                        <div style={{ marginTop: '0.5rem', padding: '0.5rem', background: 'var(--error-container)', color: 'var(--on-error-container)', borderRadius: '0.5rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <Icon>warning</Icon>
                          <span>Esta franja se cruza con otra configurada para el mismo día.</span>
                        </div>
                      )}
                    </div>
                  )
                })}

                <button type="button" className="academic-secondary-button" onClick={addSlot} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <Icon>add</Icon> + Agregar otra franja
                </button>
              </div>

              {errorMsg && (
                <div style={{ color: 'var(--error)', fontSize: '0.8125rem', marginTop: '0.5rem' }}>
                  {errorMsg}
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
                <button type="button" className="academic-secondary-button" onClick={() => setShowForm(false)}>Cancelar</button>
                <button type="button" className="primary-button" onClick={handleSave} disabled={saving}>
                  {saving ? 'Guardando...' : 'Guardar horarios'}
                </button>
              </div>
            </section>
          )}

          {/* Tablero Semanal Organizado (Lunes a Viernes) */}
          <section>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Icon style={{ color: 'var(--primary)' }}>view_week</Icon>
                <h2 style={{ fontSize: '0.9375rem', fontWeight: 700, margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Disponibilidad Semanal Agrupada (Lunes a Viernes)
                </h2>
              </div>
              <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8125rem', color: 'var(--on-surface-variant)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <em style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--primary)', display: 'inline-block' }} /> Con tutoría aceptada
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <em style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--surface-low)', display: 'inline-block' }} /> Libre
                </span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1rem' }}>
              {DAYS.map((day) => {
                const daySchedules = existingSchedules.filter((s) => isSameDay(s, day))

                return (
                  <div key={day} style={{ background: 'var(--surface-low)', padding: '0.875rem', borderRadius: '0.875rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                      <strong>{day}</strong>
                      <span style={{ width: '1.5rem', height: '1.5rem', borderRadius: '50%', background: 'var(--surface-lowest)', display: 'grid', placeItems: 'center', fontSize: '0.75rem', fontWeight: 700 }}>
                        {day[0]}
                      </span>
                    </div>

                    {daySchedules.length === 0 ? (
                      <div style={{ padding: '1rem 0', textAlign: 'center', color: 'var(--on-surface-variant)', fontSize: '0.75rem' }}>
                        Sin franjas
                      </div>
                    ) : (
                      daySchedules.map((item) => (
                        <div key={item._id || item.id} style={{ background: 'var(--surface-lowest)', padding: '0.75rem', borderRadius: '0.625rem', marginBottom: '0.625rem', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <span style={{ fontSize: '0.6875rem', padding: '0.15rem 0.4rem', borderRadius: '0.25rem', background: item.estado === 'aceptada' ? 'var(--primary-container)' : 'var(--surface-low)', fontWeight: 600 }}>
                              {item.estado === 'aceptada' ? 'Tutoría reservada' : 'Libre'}
                            </span>
                            <button type="button" onClick={() => handleDeleteExisting(item._id || item.id)} style={{ background: 'none', border: 'none', color: 'var(--on-surface-variant)', cursor: 'pointer' }}>
                              <Icon style={{ fontSize: '1.125rem' }}>delete</Icon>
                            </button>
                          </div>

                          <h4 style={{ margin: '0.5rem 0 0.25rem', fontSize: '0.875rem', fontWeight: 700 }}>
                            {item.materia_id?.nombre || 'Cálculo Multivariable'}
                          </h4>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: 'var(--on-surface-variant)' }}>
                            <Icon style={{ fontSize: '0.875rem' }}>schedule</Icon>
                            <span>{item.hora_inicio} - {item.hora_fin}</span>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.6875rem', color: 'var(--on-surface-variant)', marginTop: '0.25rem' }}>
                            <Icon style={{ fontSize: '0.875rem' }}>meeting_room</Icon>
                            <span>{item.modalidad_permitida || 'Presencial'}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )
              })}
            </div>
          </section>
        </main>
      </div>

      {/* Modal HU-08 Restricción de Eliminación */}
      {blockedSchedule && (
        <div className="academic-modal-backdrop" role="presentation" onClick={() => setBlockedSchedule(false)}>
          <div className="academic-dependency-modal" role="dialog" aria-modal="true">
            <header className="academic-modal-heading">
              <div className="academic-warning-icon"><Icon>lock_clock</Icon></div>
              <div>
                <span className="academic-modal-overline">Acción Restringida (HU-08)</span>
                <h2>No se puede eliminar este horario</h2>
              </div>
            </header>

            <div className="academic-dependency-copy">
              <p>No se puede eliminar este horario porque tiene <strong>1 tutoría aceptada</strong>.</p>
              <p>Para liberar o remover esta franja, primero debes reprogramar la sesión con el alumno o efectuar la cancelación formal con justificativo.</p>
            </div>

            <div className="academic-modal-actions">
              <button type="button" className="academic-secondary-button" onClick={() => setBlockedSchedule(false)}>Cerrar</button>
              <button type="button" className="academic-danger-button" disabled style={{ opacity: 0.5, cursor: 'not-allowed' }}>
                Eliminar horario
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}