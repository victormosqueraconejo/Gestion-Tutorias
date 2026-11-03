import { Icon } from '../../components/ui/Icon'
import { ProfileMenu } from '../../components/ui/ProfileMenu'
import './administrator-dashboard.css'

const navigation = [
  ['Inicio', 'home', '/administrador'],
  ['Usuarios', 'group', '/administrador/usuarios'],
  ['Estructura académica', 'account_tree', '/administrador/estructura-academica'],
  ['Recursos', 'menu_book', '#recursos'],
  ['Demanda', 'trending_up', '#demanda'],
  ['Reportes', 'bar_chart', '#reportes'],
]

const metrics = [
  ['Usuarios Activos', '1,420', '+8.5%', '89% estudiantes validados', 'group', 'blue'],
  ['Solicitudes de Tutoría', '384', '+14%', 'Tiempo medio resp.: 3.4 hrs', 'pending_actions', 'slate'],
  ['Tutorías Impartidas', '312', '92% éxito', 'Satisfacción 4.8 / 5.0', 'task_alt', 'primary'],
  ['Recursos Académicos', '856', '18 alertas', 'Guías y materiales activos', 'menu_book', 'error'],
]

const actions = [
  ['Crear usuario', 'Estudiante o tutor', 'person_add', 'blue'],
  ['Estructura curricular', 'Carreras y materias', 'account_tree', 'slate'],
  ['Auditoría de enlaces', '18 por revisar', 'link_off', 'error'],
  ['Análisis de demanda', 'Vacantes docentes', 'trending_up', 'neutral'],
  ['Reporte ejecutivo', 'Generar informe', 'description', 'neutral'],
]

export function AdministratorSidebar({ activeItem = 'Inicio' }) {
  return (
    <aside className="administrator-sidebar">
      <div>
        <a className="administrator-brand" href="/administrador">
          <span className="administrator-brand-mark"><Icon filled>school</Icon></span>
          <span><strong>Tutorías Pro</strong><small>Campus Digital</small></span>
        </a>
        <nav className="administrator-nav" aria-label="Navegación administrativa">
          {navigation.map(([label, icon, href]) => (
            <a className={label === activeItem ? 'is-active' : ''} href={href} aria-current={label === activeItem ? 'page' : undefined} key={label}>
              <Icon>{icon}</Icon><span>{label}</span>
            </a>
          ))}
        </nav>
      </div>
      <div className="administrator-identity">
        <span className="administrator-identity-avatar"><Icon>person</Icon></span>
        <span><strong>Admin General</strong><small>admin@campus.edu</small></span>
      </div>
    </aside>
  )
}

export function AdministratorTopbar() {
  return (
    <header className="administrator-topbar">
      <label className="administrator-search">
        <Icon>search</Icon>
        <input placeholder="Buscar estudiantes, tutores, facultades..." aria-label="Buscar en el panel administrativo" />
      </label>
      <div className="administrator-topbar-actions">
        <button type="button" aria-label="Mensajes"><Icon>mail</Icon><i /></button>
        <button type="button" aria-label="Notificaciones"><Icon>notifications</Icon><i className="is-error" /></button>
        <span className="administrator-divider" />
        <div className="administrator-user-copy"><strong>Dr. Carlos Mendoza</strong><small>Coordinador Académico</small></div>
        <ProfileMenu compact user={{ name: 'Dr. Carlos Mendoza', email: 'carlos.mendoza@campus.edu', role: 'Administrador' }} />
      </div>
    </header>
  )
}

export function AdministratorDashboard() {
  return (
    <div className="administrator-page">
      <AdministratorSidebar />
      <div className="administrator-content">
        <AdministratorTopbar />
        <main className="administrator-main">
          <section className="administrator-heading">
            <div>
              <div className="administrator-context"><Icon>calendar_today</Icon><span>Lunes, 24 de Marzo de 2025</span><b>•</b><strong>Ciclo Académico 2025-I</strong></div>
              <h1>Bienvenido, Administrador Académico <span>— Panel General</span></h1>
              <p>Panel central de monitoreo y gestión académica universitaria.</p>
            </div>
            <div className="administrator-heading-actions">
              <button type="button" className="admin-secondary-button"><Icon>tune</Icon>Ajustes Ciclo</button>
              <button type="button" className="admin-primary-button"><Icon>download</Icon>Descargar Informe PDF</button>
            </div>
          </section>

          <section className="administrator-metrics" aria-label="Indicadores principales">
            {metrics.map(([label, value, change, detail, icon, tone]) => (
              <article className="administrator-metric" key={label}>
                <div className="administrator-metric-top"><span>{label}</span><b className={`metric-icon-${tone}`}><Icon>{icon}</Icon></b></div>
                <div className="administrator-metric-value"><strong>{value}</strong><em className={tone === 'error' ? 'is-error' : ''}>{change}</em></div>
                <small>{detail}</small>
              </article>
            ))}
          </section>

          <section className="administrator-actions-section">
            <div className="administrator-section-heading"><h2>Acciones Frecuentes</h2><span>Accesos rápidos de gestión</span></div>
            <div className="administrator-actions-grid">
              {actions.map(([label, description, icon, tone]) => (
                <button className="administrator-action-card" type="button" key={label}>
                  <b className={`metric-icon-${tone}`}><Icon>{icon}</Icon></b>
                  <span><strong>{label}</strong><small>{description}</small></span>
                </button>
              ))}
            </div>
          </section>
        </main>
      </div>
    </div>
  )
}
