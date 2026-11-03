import { useEffect, useState } from 'react'
import { Icon } from '../../components/ui/Icon'
import { AdministratorSidebar, AdministratorTopbar } from './AdministratorDashboard'
import './administrator-users.css'

const initialUsers = [
  { id: 1, name: 'Valeria Sofía Martínez', email: 'valeria.martinez@campus.edu', role: 'Estudiante', dependency: 'Ingeniería de Sistemas', faculty: 'Facultad de Ingeniería', registered: '14 Feb, 2024', access: 'Hoy, 10:42 AM', status: 'Activo', icon: 'school', tone: 'student' },
  { id: 2, name: 'Dr. Roberto Gómez Peña', email: 'roberto.gomez@campus.edu', role: 'Profesor', dependency: 'Matemáticas Aplicadas', faculty: 'Facultad de Ciencias', registered: '22 Mar, 2022', access: 'Hoy, 08:02 AM', status: 'Activo', icon: 'psychology', tone: 'teacher' },
  { id: 3, name: 'Dra. Laura Méndez', email: 'laura.mendez@campus.edu', role: 'Administrador', dependency: 'Vicerrectoría Académica', faculty: 'Coordinación de Acreditación', registered: '22 Mar, 2022', access: 'Hoy, 08:02 AM', status: 'Activo', icon: 'shield_person', tone: 'admin' },
  { id: 4, name: 'Alejandro Morales Cruz', email: 'a.morales@campus.edu', role: 'Estudiante', dependency: 'Medicina Veterinaria', faculty: 'Ciencias Agropecuarias', registered: '18 Ago, 2023', access: 'Hace 42 días', status: 'Inactivo', icon: 'person_off', tone: 'inactive' },
  { id: 5, name: 'Mtra. Claudia Elena Ramos', email: 'claudia.ramos@campus.edu', role: 'Profesor', dependency: 'Arquitectura & Urbanismo', faculty: 'Facultad de Hábitat', registered: '03 Nov, 2023', access: 'Hoy, 09:12 AM', status: 'Activo', icon: 'psychology', tone: 'teacher' },
  { id: 6, name: 'Mateo Andrés Quintana', email: 'mateo.quintana@campus.edu', role: 'Estudiante', dependency: 'Derecho Corporativo', faculty: 'Facultad de Jurisprudencia', registered: '28 Ene, 2024', access: '12 Mar, 11:30 AM', status: 'Activo', icon: 'school', tone: 'student' },
]

const roleTone = { Estudiante: 'student', Profesor: 'teacher', Administrador: 'admin' }

function UserSummaryCards() {
  const cards = [
    ['Estudiantes', '1,180', '83.1% de la base', 'school', 'student'],
    ['Docentes Tutores', '204', '94 activos hoy', 'psychology', 'teacher'],
    ['Administradores', '36', 'Auditoría central', 'shield_person', 'admin'],
    ['Cuentas Inactivas', '18', '1.2% revocadas', 'person_off', 'inactive'],
  ]
  return <section className="users-summary-grid">{cards.map(([label, value, detail, icon, tone]) => <article className="users-summary-card" key={label}><div><span>{label}</span><strong>{value}</strong><small>{detail}</small></div><b className={`user-summary-icon ${tone}`}><Icon>{icon}</Icon></b></article>)}</section>
}

function DeactivateModal({ user, onClose, onConfirm }) {
  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  return (
    <div className="users-modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="users-confirm-modal" role="dialog" aria-modal="true" aria-labelledby="deactivate-user-title">
        <div className="users-confirm-heading"><span><Icon>warning</Icon></span><div><h2 id="deactivate-user-title">¿Estás seguro de desactivar al usuario {user.name}?</h2><p>El usuario no podrá iniciar sesión ni solicitar asesorías académicas. Sus registros históricos permanecerán intactos en los reportes del campus.</p></div></div>
        <div className="users-affected-user"><span className="users-initials">{user.name.split(' ').map((part) => part[0]).slice(0, 2).join('')}</span><span><strong>{user.name}</strong><small>{user.email}</small></span><b>Pasará a: Inactivo</b></div>
        <div className="users-modal-actions"><button type="button" onClick={onClose}>Cancelar</button><button className="danger-action" type="button" onClick={onConfirm}>Desactivar usuario</button></div>
      </section>
    </div>
  )
}

export function AdministratorUsers() {
  const [users, setUsers] = useState(initialUsers)
  const [query, setQuery] = useState('')
  const [role, setRole] = useState('Todos')
  const [status, setStatus] = useState('Activo')
  const [selectedUser, setSelectedUser] = useState(null)

  const filteredUsers = users.filter((user) => {
    const matchesQuery = `${user.name} ${user.email} ${user.dependency}`.toLowerCase().includes(query.toLowerCase())
    return matchesQuery && (role === 'Todos' || user.role === role) && (status === 'Todos' || user.status === status)
  })

  function resetFilters() {
    setQuery('')
    setRole('Todos')
    setStatus('Todos')
  }

  function deactivateSelectedUser() {
    setUsers((current) => current.map((user) => user.id === selectedUser.id ? { ...user, status: 'Inactivo' } : user))
    setSelectedUser(null)
  }

  return (
    <div className="administrator-page administrator-users-page">
      <AdministratorSidebar activeItem="Usuarios" />
      <div className="administrator-content">
        <AdministratorTopbar />
        <main className="administrator-main">
          <section className="users-page-heading">
            <div><span className="users-overline">Módulo Administrativo <b>HU-19</b></span><h1>Gestión de Usuarios</h1><p>Supervisa identidades académicas, asignación de privilegios de tutoría institucional y control de acceso federado para el campus.</p></div>
            <button type="button" className="users-create-button"><Icon>person_add</Icon>+ Crear usuario</button>
          </section>
          <UserSummaryCards />
          <section className="users-toolbar">
            <div className="users-toolbar-main"><label className="users-table-search"><Icon>search</Icon><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar por nombre, correo institucional o matrícula..." /></label><div className="users-filters"><label><Icon>badge</Icon>Rol:<select value={role} onChange={(event) => setRole(event.target.value)}><option>Todos</option><option>Estudiante</option><option>Profesor</option><option>Administrador</option></select></label><label><Icon>toggle_on</Icon>Estado:<select value={status} onChange={(event) => setStatus(event.target.value)}><option>Todos</option><option>Activo</option><option>Inactivo</option></select></label><button type="button" title="Restablecer filtros" onClick={resetFilters}><Icon>filter_alt_off</Icon></button></div></div>
            <div className="users-toolbar-meta"><span><i /> <strong>1,420 usuarios registrados</strong><small>• Mostrando {filteredUsers.length} registros</small></span><button type="button"><Icon>file_download</Icon>Exportar nómina</button></div>
          </section>
          <section className="users-table-card"><div className="users-table-scroll"><table className="users-table"><thead><tr><th>Usuario</th><th>Rol</th><th>Dependencia / Carrera</th><th>Registro / Último Acceso</th><th>Estado</th><th>Acciones</th></tr></thead><tbody>{filteredUsers.map((user) => <tr className={user.status === 'Inactivo' ? 'is-inactive' : ''} key={user.id}><td><div className="users-person"><span className={`users-avatar ${user.tone}`}><Icon>{user.icon}</Icon></span><span><strong>{user.name}</strong><small>{user.email}</small></span></div></td><td><span className={`users-role ${roleTone[user.role]}`}>{user.role}</span></td><td><strong>{user.dependency}</strong><small>{user.faculty}</small></td><td><strong>{user.registered}</strong><small>{user.access}</small></td><td><span className={`users-status ${user.status.toLowerCase()}`}><i />{user.status}</span></td><td><div className="users-row-actions"><button type="button">Editar</button>{user.status === 'Activo' ? <button className="deactivate-button" type="button" onClick={() => setSelectedUser(user)}>Desactivar</button> : <button type="button" onClick={() => setUsers((current) => current.map((item) => item.id === user.id ? { ...item, status: 'Activo' } : item))}>Reactivar</button>}</div></td></tr>)}</tbody></table></div><div className="users-pagination"><span>Página <strong>1</strong> de <strong>237</strong></span><div><button disabled>Anterior</button><button className="current">1</button><button>2</button><button>3</button><b>...</b><button>237</button><button>Siguiente</button></div></div></section>
        </main>
      </div>
      {selectedUser && <DeactivateModal user={selectedUser} onClose={() => setSelectedUser(null)} onConfirm={deactivateSelectedUser} />}
    </div>
  )
}
