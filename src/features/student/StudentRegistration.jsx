import { Icon } from '../../components/ui/Icon'
import { StudentRegistrationForm } from './components/StudentRegistrationForm'
import './student-registration.css'

export function StudentRegistration() {
  return (
    <main className="registration-page">
      <div className="registration-shell">
        <header className="registration-header">
          <div className="registration-brand"><span><Icon>school</Icon></span><div><strong>Portal Académico Institucional</strong><small>Admisión y Gestión Curricular Digital</small></div></div>
          <div className="secure-label"><Icon>verified_user</Icon> Entorno Seguro SSL 256-bit</div>
        </header>
        <section className="registration-card">
          <div className="registration-card-content">
            <div className="registration-title"><div><div className="title-line"><h1>Registro de Estudiante</h1><span className="role-badge"><Icon filled>badge</Icon> Rol: Estudiante (Asignación Automática)</span></div><p>Completa tus credenciales oficiales para vincular tu matrícula y expedir tu carnet digital.</p></div></div>
            <StudentRegistrationForm />
          </div>
        </section>
      </div>
    </main>
  )
}
