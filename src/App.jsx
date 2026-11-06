import { InstitutionPanel } from './components/layout/InstitutionPanel'
import { LoginForm } from './features/auth/components/LoginForm'
import { getAuthenticatedUser, getRolePath } from './features/auth/authApi'
import { StudentRegistration } from './features/student/StudentRegistration'
import { Profile } from './features/student/Profile'
import { StudentHome } from './features/student/StudentHome'
import { TeacherDashboard } from './features/teacher/TeacherDashboard'
import { AdministratorDashboard } from './features/administrator/AdministratorDashboard'
import { AdministratorUsers } from './features/administrator/AdministratorUsers'
import { AddScheduleModal } from './features/teacher/components/AddScheduleModal'
import { AdministratorAcademicStructure } from './features/administrator/AdministratorAcademicStructure'
import { AcceptRequestModal } from './features/teacher/components/AcceptRequestModal'
import { AddResourceModal } from './features/teacher/components/NewResourceModal'
import { TutoringSessionDetail } from './features/teacher/components/TutoringSessionDetail'
import './App.css'

function App() {
  const authenticatedUser = getAuthenticatedUser()
  const authenticatedPath = getRolePath(authenticatedUser?.rol)

  if (window.location.pathname === '/' && authenticatedPath) {
    window.location.replace(authenticatedPath)
    return null
  }

  if (window.location.pathname === '/registro-estudiante') {
    return <StudentRegistration />
  }

  if (window.location.pathname === '/perfil') {
    return <Profile />
  }

  if (['/estudiante', '/estudiante/inicio'].includes(window.location.pathname)) {
    return <StudentHome />
  }

  if (['/profesor', '/profesor/inicio'].includes(window.location.pathname)) {
    return <TeacherDashboard />
  }

  if (window.location.pathname === '/administrador/usuarios') {
    return <AdministratorUsers />
  }

  if (window.location.pathname === '/administrador/estructura-academica') {
    return <AdministratorAcademicStructure />
  }

  if (['/administrador', '/administrador/inicio', '/admin'].includes(window.location.pathname)) {
    return <AdministratorDashboard />
  }

  if (window.location.pathname === '/profesor/horarios') {
    return <AddScheduleModal />
  }

  if (window.location.pathname === '/profesor/solicitudes') {
    return <AcceptRequestModal />
  }

  if (window.location.pathname === '/profesor/recursos') {
    return <AddResourceModal />
  }

  if (
    window.location.pathname.startsWith('/profesor/tutorias') ||
    window.location.pathname === '/profesor/mis-tutorias'
  ) {
    return <TutoringSessionDetail />
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