import { Icon } from '../../../components/ui/Icon'

const links = [
  ['Inicio', 'home', '/estudiante'],
  ['Buscar apoyo', 'search', '#buscar-apoyo'],
  ['Mis solicitudes', 'pending_actions', '#mis-solicitudes'],
  ['Tutorías grupales', 'groups', '#tutorias-grupales'],
  ['Mi historial', 'history_edu', '#mi-historial'],
]

export function StudentSidebar({ user }) {
  const userName = user?.nombre || 'Estudiante'
  const userStatus = user?.estado || 'activo'

  return (
    <aside className="student-sidebar">
      <div className="student-sidebar-main">
        <a className="student-brand" href="/estudiante">
          <span className="student-brand-mark"><Icon filled>school</Icon></span>
          <span><strong>Tutorías Pro</strong><small>Portal Académico</small></span>
        </a>
        <nav className="student-sidebar-nav" aria-label="Navegación estudiantil">
          {links.map(([label, icon, href], index) => (
            <a className={index === 0 ? 'is-active' : ''} href={href} key={label}>
              <Icon>{icon}</Icon><span>{label}</span>
            </a>
          ))}
        </nav>
      </div>
      <section className="student-help-card">
        <strong>Centro de Ayuda</strong>
        <p>¿Tienes dudas sobre los créditos de tutoría?</p>
        <a href="#ayuda">Contactar soporte <Icon>arrow_forward</Icon></a>
      </section>
      <span className="sr-only">Cuenta de {userName}, estado {userStatus}</span>
    </aside>
  )
}
