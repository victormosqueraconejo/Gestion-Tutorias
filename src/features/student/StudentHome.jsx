import { Icon } from '../../components/ui/Icon'
import { getAuthenticatedUser } from '../auth/authApi'
import { StudentSidebar } from './components/StudentSidebar'
import { StudentTopbar } from './components/StudentTopbar'
import { StudentMetricCard } from './components/StudentMetricCard'
import { StudentTutoringCard } from './components/StudentTutoringCard'
import './student-home.css'

const sessions = [
  { status: 'En 2 horas', statusIcon: 'schedule', statusTone: 'urgent', location: 'Virtual / Zoom', subject: 'Cálculo Multivariable', description: 'Optimización de funciones de varias variables y multiplicadores de Lagrange.', date: 'Hoy, 24 Oct', time: '16:00 - 17:30', initials: 'RM', tutor: 'Dr. Ricardo M. Morales', department: 'Dpto. de Matemáticas Aplicadas', action: 'Unirse a aula', actionIcon: 'videocam', actionHref: '#aula' },
  { status: 'Confirmada', statusIcon: 'check_circle', statusTone: 'confirmed', location: 'Laboratorio B-204', subject: 'Estructuras de Datos', description: 'Implementación y balanceo de Árboles AVL y Grafos con algoritmos de Dijkstra.', date: 'Mañana, 25 Oct', time: '10:00 - 11:30', initials: 'ES', tutor: 'Mtra. Elena Salgado', department: 'Facultad de Informática', action: 'Ver ubicación', actionIcon: 'map', actionHref: '#ubicacion', actionTone: 'muted' },
]

const requests = [
  ['Física Mecánica', 'Dinámica rotacional y momento de inercia', 'AR', 'Ing. Andrés Rivas', '23 Oct, 2024', 'Pendiente', 'hourglass_empty', 'pending'],
  ['Base de Datos II', 'Normalización BCNF y transacciones ACID', 'CO', 'Dra. Claudia Ortiz', '21 Oct, 2024', 'Aceptada', 'check', 'accepted'],
  ['Álgebra Lineal', 'Transformaciones lineales y diagonalización', 'GA', 'Dr. Gabriel Araya', '18 Oct, 2024', 'Aplazada', 'update', 'postponed'],
]

export function StudentHome() {
  const user = getAuthenticatedUser()
  const firstName = user?.nombre?.trim().split(/\s+/)[0] || 'Estudiante'
  const semester = user?.perfil_estudiante?.semestre_actual
  const career = user?.perfil_estudiante?.carrera_id || 'tu programa académico'
  const status = user?.estado || 'activo'

  return (
    <div className="student-home">
      <StudentSidebar user={user} />
      <div className="student-home-content">
        <StudentTopbar user={user} />
        <main className="student-home-main">
          <section className="student-hero-grid">
            <div className="student-welcome-card">
              <span className="student-semester-pill"><Icon>school</Icon> Semestre {semester || 'no asignado'} • Cuenta {status}</span>
              <div>
                <h1>¡Hola, <em>{firstName}</em>! ¿En qué podemos ayudarte hoy?</h1>
                <p>Acompañamiento especializado para estudiantes de {career} y sesiones colaborativas para potenciar tu rendimiento académico.</p>
              </div>
              <div className="student-hero-actions">
                <a className="student-primary-button" href="#buscar-apoyo"><Icon>search_check</Icon>Buscar apoyo académico<Icon>arrow_forward</Icon></a>
                <a className="student-secondary-button" href="#agendar"><Icon>event_available</Icon>Agendar sesión de repaso</a>
              </div>
            </div>
            <div className="student-metrics">
              <StudentMetricCard title="Horas de tutoría" value="18.5" suffix="hrs" detail="+4.5 hrs vs mes anterior" icon="trending_up" />
              <StudentMetricCard title="Solicitudes activas" value="3" suffix="" detail="Tiempo de respuesta prom. 3.2 horas" icon="pending_actions" tone="slate" />
            </div>
          </section>

          <section className="student-section">
            <div className="student-section-heading"><h2><i />Próximas tutorías programadas</h2><a href="#calendario">Calendario completo <Icon>chevron_right</Icon></a></div>
            <div className="student-session-grid">{sessions.map((session) => <StudentTutoringCard key={session.subject} session={session} />)}</div>
          </section>

          <section className="student-section">
            <div className="student-section-heading"><h2 className="secondary-heading"><i />Solicitudes de apoyo recientes</h2><a className="view-all-link" href="#mis-solicitudes">Ver todas las solicitudes <Icon>arrow_forward</Icon></a></div>
            <div className="student-request-table-wrap">
              <table className="student-request-table"><thead><tr><th>Materia &amp; Tema</th><th>Profesor asignado</th><th>Fecha envío</th><th>Estado</th><th>Acción</th></tr></thead>
                <tbody>{requests.map(([subject, topic, initials, professor, date, status, statusIcon, tone]) => <tr key={subject}><td><strong>{subject}</strong><small>{topic}</small></td><td><span className="request-avatar">{initials}</span>{professor}</td><td>{date}</td><td><span className={`request-status ${tone}`}><Icon>{statusIcon}</Icon>{status}</span></td><td><button type="button">{status === 'Aplazada' ? 'Reagendar' : 'Detalles'} <Icon>{status === 'Aplazada' ? 'sync' : 'chevron_right'}</Icon></button></td></tr>)}</tbody>
              </table>
            </div>
          </section>

          <section className="student-group-banner"><span className="student-group-icon"><Icon>group_work</Icon></span><div><h3>¿Prefieres estudiar en equipo?</h3><p>Únete a los talleres de resolución práctica de exámenes este viernes. Plazas limitadas por facultad.</p></div><a href="#tutorias-grupales">Explorar talleres grupales</a></section>
        </main>
      </div>
    </div>
  )
}
