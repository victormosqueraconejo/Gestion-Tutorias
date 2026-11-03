import { Icon } from '../../../components/ui/Icon'
import { ProfileMenu } from '../../../components/ui/ProfileMenu'

export function StudentTopbar({ user }) {
  const name = user?.nombre || 'Estudiante'
  const email = user?.correo || 'Correo no disponible'
  const role = user?.rol || 'estudiante'
  const semester = user?.perfil_estudiante?.semestre_actual
  const career = user?.perfil_estudiante?.carrera_id || 'Carrera no asignada'

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
            <span><strong>{name}</strong><small>{career}{semester ? ` • Semestre ${semester}` : ''}</small></span>
            <ProfileMenu user={{ name, email, role }} />
          </div>
        </div>
      </div>
    </header>
  )
}
