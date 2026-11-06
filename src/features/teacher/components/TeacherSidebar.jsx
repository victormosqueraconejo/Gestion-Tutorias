import { Icon } from '../../../components/ui/Icon'

export function TeacherSidebar() {
  const currentPath = window.location.pathname

  return (
    <aside className="teacher-sidebar">
      <div>
        <div className="teacher-brand">
          <span className="teacher-brand-mark">
            <Icon filled>school</Icon>
          </span>
          <span>
            <strong>Tutorías Pro</strong>
            <small>Portal Docente</small>
          </span>
        </div>

        <div className="teacher-identity">
          <span className="teacher-identity-avatar">
            <Icon>account_circle</Icon>
          </span>
          <span>
            <strong>Dr. Ricardo Salinas Peña</strong>
            <small>Docente Titular</small>
          </span>
          <button type="button" aria-label="Abrir menú de usuario">
            <Icon>unfold_more</Icon>
          </button>
        </div>

        <nav className="teacher-nav" aria-label="Navegación docente">
          <a
            className={currentPath === '/profesor' || currentPath === '/profesor/inicio' ? 'active' : ''}
            href="/profesor"
          >
            <span>
              <Icon>home</Icon>Inicio
            </span>
          </a>
          <a
            className={currentPath === '/profesor/horarios' ? 'active' : ''}
            href="/profesor/horarios"
          >
            <span>
              <Icon>calendar_clock</Icon>Mis horarios
            </span>
          </a>
          <a
            className={currentPath === '/profesor/solicitudes' ? 'active' : ''}
            href="/profesor/solicitudes"
          >
            <span>
              <Icon>inbox</Icon>Solicitudes
            </span>
            <b>3</b>
          </a>
          <a
            className={
              currentPath === '/profesor/tutorias' || 
              currentPath.startsWith('/profesor/tutorias/') || 
              currentPath.includes('/sesion')
                ? 'active'
                : ''
            }
            href="/profesor/tutorias"
          >
            <span>
              <Icon>groups</Icon>Mis tutorías
            </span>
          </a>
          <a href="#historial">
            <span>
              <Icon>history</Icon>Historial
            </span>
          </a>
          <a
            className={currentPath === '/profesor/recursos' ? 'active' : ''}
            href="/profesor/recursos"
          >
            <span>
              <Icon>folder_open</Icon>Recursos
            </span>
          </a>
        </nav>
      </div>

      <nav className="teacher-nav teacher-nav-bottom" aria-label="Ayuda y configuración">
        <a href="#ayuda">
          <span>
            <Icon>help_outline</Icon>Ayuda
          </span>
        </a>
        <a href="#configuracion">
          <span>
            <Icon>settings</Icon>Configuración
          </span>
        </a>
        <a className="danger" href="/">
          <span>
            <Icon>logout</Icon>Cerrar sesión
          </span>
        </a>
      </nav>
    </aside>
  )
}