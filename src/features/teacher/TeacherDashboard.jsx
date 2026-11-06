import { useState } from 'react'
import { Icon } from '../../components/ui/Icon'
import { getAuthenticatedUser } from '../auth/authApi'
import NewResourceModal from './components/NewResourceModal'
import { TeacherMetricCard } from './components/TeacherMetricCard'
import { TeacherSidebar } from './components/TeacherSidebar'
import { TeacherTopbar } from './components/TeacherTopbar'
import { TutoringSessionCard } from './components/TutoringSessionCard'
import './teacher-dashboard.css'

const valeriaAvatar = 'https://lh3.googleusercontent.com/aida-public/AB6AXuB8SRygB8aha4DeYz-Blf06US5xf7mFOSG87osrw6VyaGfqTkCo02sgRQGco_2EposlxmdfNCJSZYm2EvxWPdgCo-VdWb02L6zkMFaSeT5i4607fqjA5AKJxx7w26RrrJgA4zcK8BzNB1e_ZL8fdukCyyUBNg3PcfzrjIN2s0LA05WFEfn7koqzo0ph2ky73Uqj90Ap89IZlv9xQz4TFL8A3f4DPhu57wjJbWvESQs'
const carlosAvatar = 'https://lh3.googleusercontent.com/aida-public/AB6AXuAV81x7drzy3utdP6syacZCO9rcbGIQJb8xnK4pE8hoD8JIpWWwi_mys7y9IMbFJpu9z8N1eEIjbS3yJylsMDp1Y5ckXI-B1Mrn5DEIeo7nMIOVSoEqRbIdkwrfwrPRQQKL7nwH2_f15974twE46-f4eXrvvjtClfbATI5QYPWgzVk0hcRGby50QleYaCORBxZ6XXb2ZH6Sj8l3pJ_rvLIgQrbKjMXlQ7GSeq-x4Ho'

export function TeacherDashboard() {
  const user = getAuthenticatedUser()
  const teacherName = user?.nombre || 'Dr. Ricardo Salinas'

  const [resourceModalOpen, setResourceModalOpen] = useState(false)
  const [publicationMessage, setPublicationMessage] = useState(false)

  function handlePublished() {
    setResourceModalOpen(false)
    setPublicationMessage(true)
    window.setTimeout(() => setPublicationMessage(false), 3500)
  }

  return (
    <div className="teacher-page">
      <TeacherSidebar />
      <div className="teacher-content">
        <TeacherTopbar />
        <main className="teacher-main">
          <section className="teacher-welcome">
            <div>
              <span className="teacher-overline"><i /> Panel Docente • Semestre 2025-I</span>
              <h1>Bienvenido, {teacherName}</h1>
              <p>Tiene 2 asesorías programadas para hoy y 4 alumnos esperando confirmación de cupo.</p>
            </div>
            <div className="teacher-welcome-actions">
              <a
                href="/profesor/horarios"
                className="primary-button"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}
              >
                <Icon>add</Icon>Gestionar horarios
              </a>
              <button className="new-resource-button" type="button" onClick={() => setResourceModalOpen(true)}>
                <Icon>post_add</Icon>+ Nuevo recurso
              </button>
            </div>
          </section>

          <section className="teacher-metrics" aria-label="Resumen de actividad">
            <TeacherMetricCard
              icon="mark_email_unread"
              tone="amber"
              value="4"
              label="Solicitudes pendientes"
              badge="Revisión urgente"
              description="3 alumnos aguardan franjas antes del examen parcial del jueves."
              action={{ href: '/profesor/solicitudes', label: 'Tramitar ahora' }}
            />
            <TeacherMetricCard
              icon="calendar_today"
              tone="blue"
              value="2"
              label="Tutorías hoy"
              badge="Agenda al día"
              description="Próxima sesión en 45 minutos (Presencial en Cubículo 304)."
            >
              <div className="metric-progress"><span>Cupos cubiertos hoy <b>100% (2/2)</b></span><i><em /></i></div>
            </TeacherMetricCard>
            <TeacherMetricCard
              icon="timelapse"
              tone="slate"
              value="14"
              label="Horas este mes"
              badge="+3.5h vs mes ant."
              description="Meta institucional: 16 horas lectivas mínimas de asesoría."
            >
              <div className="metric-bars">
                {[35, 50, 40, 75, 60, 95, 80].map((height, index) => (
                  <i style={{ height: `${height}%` }} className={index > 4 ? 'highlight' : ''} key={index} />
                ))}
              </div>
            </TeacherMetricCard>
          </section>

          <section className="teacher-sessions">
            <div className="section-heading">
              <div>
                <span className="section-icon"><Icon>event_available</Icon></span>
                <span>
                  <h2>Próximas tutorías programadas</h2>
                  <small>Lunes 24 de Febrero</small>
                </span>
              </div>
              <a href="/profesor/horarios" style={{ textDecoration: 'none' }}>
                Ver calendario semanal <Icon>chevron_right</Icon>
              </a>
            </div>
            <TutoringSessionCard
              avatar={valeriaAvatar}
              student="Valeria Sofía Martínez"
              subject="Cálculo Multivariable"
              mode="Presencial"
              location="Cubículo 304"
              title="Optimización con Multiplicadores de Lagrange"
              enrollment="Matrícula: 2021-0894"
              time="Hoy 10:00 - 11:00 AM"
              note="Documento previo: Tarea_3_Criterios_Extremos.pdf"
              action={{ icon: 'how_to_reg', label: 'Iniciar / Asistencia' }}
            />
            <TutoringSessionCard
              avatar={carlosAvatar}
              student="Carlos Mendoza Rojas"
              subject="Estructuras de Datos"
              mode="Virtual"
              title="Grafos Ponderados & Algoritmo de Dijkstra"
              enrollment="Matrícula: 2022-1402"
              time="Hoy 15:30 - 16:30 PM"
              note="Repositorio: github.com/carlosm-eng/graph-traversal"
              action={{ icon: 'video_call', label: 'Unirse a reunión' }}
              tone="secondary"
            />
          </section>
        </main>
      </div>

      {publicationMessage && (
        <div className="resource-success" role="status">
          <Icon filled>check_circle</Icon>
          <span>
            <strong>Recurso publicado</strong>
            <small>El material quedó disponible para tus estudiantes.</small>
          </span>
          <button type="button" aria-label="Cerrar confirmación" onClick={() => setPublicationMessage(false)}>
            <Icon>close</Icon>
          </button>
        </div>
      )}

      <NewResourceModal
        open={resourceModalOpen}
        onClose={() => setResourceModalOpen(false)}
        onPublished={handlePublished}
      />
    </div>
  )
}