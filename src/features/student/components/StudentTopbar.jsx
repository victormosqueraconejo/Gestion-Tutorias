import { Icon } from '../../../components/ui/Icon'
import { ProfileMenu } from '../../../components/ui/ProfileMenu'

export function StudentTopbar() {
  return (
    <header className="student-topbar">
      <div className="student-topbar-inner">
        <label className="student-search">
          <Icon>search</Icon>
          <input placeholder="Buscar materias, tutores o temas..." aria-label="Buscar" />
        </label>
        <div className="student-topbar-actions">
          <button type="button" className="student-icon-button" aria-label="Notificaciones">
            <Icon>notifications</Icon><span className="notification-dot" />
          </button>
          <span className="student-topbar-divider" />
          <div className="student-topbar-user">
            <span><strong>Estudiante</strong><small>Ingeniería de Software</small></span>
            <ProfileMenu />
          </div>
        </div>
      </div>
    </header>
  )
}
