import { InstitutionPanel } from './components/layout/InstitutionPanel'
import { LoginForm } from './features/auth/components/LoginForm'
import { StudentRegistration } from './features/student/StudentRegistration'
import { StudentProfile } from './features/student/StudentProfile'
import { StudentHome } from './features/student/StudentHome'
import { TeacherDashboard } from './features/teacher/TeacherDashboard'
import { AdministratorDashboard } from './features/administrator/AdministratorDashboard'
import './App.css'

function App() {
  if (window.location.pathname === '/registro-estudiante') {
    return <StudentRegistration />
  }

  if (['/perfil', '/perfil-estudiante'].includes(window.location.pathname)) {
    return <StudentProfile />
  }

  if (['/estudiante', '/estudiante/inicio'].includes(window.location.pathname)) {
    return <StudentHome />
  }

  if (['/profesor', '/profesor/inicio'].includes(window.location.pathname)) {
    return <TeacherDashboard />
  }

  if (['/administrador', '/administrador/inicio', '/admin'].includes(window.location.pathname)) {
    return <AdministratorDashboard />
  }

  return (
    <main className="login-page">
      <div className="login-shell">
        <div className="login-card">
          <InstitutionPanel />

          <section className="auth-panel" aria-labelledby="login-title">
            <div className="auth-content">
              <header className="auth-header">
                <span className="eyebrow">Acceso Seguro</span>
                <h2 id="login-title">Iniciar Sesión</h2>
                <p>Ingresa tus credenciales institucionales</p>
              </header>

              <LoginForm />

              <div className="register-prompt">
                <span>¿No tienes una cuenta aún?</span>
                <a href="/registro-estudiante">Crear cuenta</a>
              </div>

              <nav className="secondary-links" aria-label="Enlaces institucionales">
                <a href="#help">Mesa de Ayuda</a>
                <span aria-hidden="true">•</span>
                <a href="#terms">Términos del Servicio</a>
                <span aria-hidden="true">•</span>
                <a href="#privacy">Políticas de Privacidad</a>
              </nav>
            </div>
          </section>
        </div>
      </div>
    </main>
  )
}

export default App
