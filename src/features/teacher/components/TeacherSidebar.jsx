import { Icon } from '../../../components/ui/Icon'

const primaryLinks = [
  ['Inicio', 'home', '/profesor'],
  ['Mis horarios', 'calendar_clock', '#horarios'],
  ['Solicitudes', 'inbox', '#solicitudes', '3'],
  ['Mis tutorías', 'groups', '#tutorias'],
  ['Historial', 'history', '#historial'],
]

export function TeacherSidebar() {
  return (
    <aside className="teacher-sidebar">
      <div>
        <div className="teacher-brand">
          <span className="teacher-brand-mark"><Icon filled>school</Icon></span>
          <span><strong>Tutorías Pro</strong><small>Portal Docente</small></span>
        </div>

        <div className="teacher-identity">
          <span className="teacher-identity-avatar"><Icon>account_circle</Icon></span>
          <span><strong>Dr. Ricardo Salinas Peña</strong><small>Docente Titular</small></span>
          <button type="button" aria-label="Abrir menú de usuario"><Icon>unfold_more</Icon></button>
        </div>

        <nav className="teacher-nav" aria-label="Navegación docente">
          {primaryLinks.map(([label, icon, href, badge], index) => (
            <a className={index === 0 ? 'active' : ''} href={href} aria-current={index === 0 ? 'page' : undefined} key={label}>
              <span><Icon>{icon}</Icon>{label}</span>
              {badge && <b>{badge}</b>}
            </a>
          ))}
        </nav>
      </div>

      <nav className="teacher-nav teacher-nav-bottom" aria-label="Ayuda y configuración">
        <a href="#ayuda"><span><Icon>help_outline</Icon>Ayuda</span></a>
        <a href="#configuracion"><span><Icon>settings</Icon>Configuración</span></a>
        <a className="danger" href="/"><span><Icon>logout</Icon>Cerrar sesión</span></a>
      </nav>
    </aside>
  )
}
