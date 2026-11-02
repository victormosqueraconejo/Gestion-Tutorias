import { Icon } from '../../../components/ui/Icon'
import { ProfileMenu } from '../../../components/ui/ProfileMenu'

export function TeacherTopbar() {
  return (
    <header className="teacher-topbar">
      <div className="teacher-search">
        <Icon>search</Icon>
        <input placeholder="Buscar estudiantes, materias o solicitudes..." aria-label="Buscar en el portal docente" />
      </div>
      <div className="teacher-topbar-actions">
        <button type="button" aria-label="Notificaciones" className="notification-button">
          <Icon>notifications</Icon><span />
        </button>
        <button type="button" aria-label="Mensajes"><Icon>chat</Icon></button>
        <i />
        <div className="teacher-topbar-user">
          <span><strong>Dr. R. Salinas</strong><small>Activo</small></span>
          <ProfileMenu compact user={{ name: 'Dr. Ricardo Salinas', email: 'ricardo.salinas@docentes.edu', role: 'Profesor' }} />
        </div>
      </div>
    </header>
  )
}
