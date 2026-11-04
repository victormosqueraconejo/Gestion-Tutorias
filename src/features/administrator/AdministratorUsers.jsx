import { useEffect, useMemo, useState } from 'react'
import { Icon } from '../../components/ui/Icon'
import { StatusAlert } from '../../components/ui/StatusAlert'
import { AdministratorSidebar, AdministratorTopbar } from './AdministratorDashboard'
import { createAdministratorUser, fetchUsers, updateAdministratorUser } from './administratorUsersApi'
import './administrator-users.css'

const roleLabels = { estudiante: 'Estudiante', profesor: 'Profesor', administrador: 'Administrador' }
const roleTone = { estudiante: 'student', profesor: 'teacher', administrador: 'admin' }
const roleIcons = { estudiante: 'school', profesor: 'psychology', administrador: 'shield_person' }

function UserSummaryCards({ users }) {
  const cards = [
    ['Estudiantes', users.filter((user) => user.role === 'estudiante').length, 'school', 'student'],
    ['Docentes Tutores', users.filter((user) => user.role === 'profesor').length, 'psychology', 'teacher'],
    ['Administradores', users.filter((user) => user.role === 'administrador').length, 'shield_person', 'admin'],
    ['Cuentas Inactivas', users.filter((user) => user.status === 'inactivo').length, 'person_off', 'inactive'],
  ]
  return <section className="users-summary-grid">{cards.map(([label, value, icon, tone]) => <article className="users-summary-card" key={label}><div><span>{label}</span><strong>{value}</strong><small>{label === 'Cuentas Inactivas' ? 'Acceso revocado' : 'Registrados en el sistema'}</small></div><b className={`user-summary-icon ${tone}`}><Icon>{icon}</Icon></b></article>)}</section>
}

function UserModal({ user, onClose, onSave, saving }) {
  const isEditing = Boolean(user)
  const [form, setForm] = useState({ name: user?.name || '', email: user?.email || '', password: '', role: user?.role || 'estudiante' })
  const [error, setError] = useState('')

  useEffect(() => {
    function handleKeyDown(event) { if (event.key === 'Escape') onClose() }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  function updateField(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    if (!form.name.trim() || !form.email.trim() || (!isEditing && !form.password)) {
      setError(isEditing ? 'Nombre y correo son obligatorios.' : 'Nombre, correo y contraseña son obligatorios.')
      return
    }
    setError('')
    try {
      await onSave(form)
    } catch (saveError) {
      setError(saveError.message)
    }
  }

  return <div className="users-modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
    <section className="users-form-modal" role="dialog" aria-modal="true" aria-labelledby="user-form-title">
      <div className="users-form-heading"><div><span className="users-overline">Módulo Administrativo</span><h2 id="user-form-title">{isEditing ? 'Editar usuario' : 'Crear usuario'}</h2><p>{isEditing ? 'Actualiza los datos y permisos de acceso.' : 'Registra una nueva cuenta académica.'}</p></div><button type="button" className="users-close-button" onClick={onClose} aria-label="Cerrar"><Icon>close</Icon></button></div>
      {error && <StatusAlert title="No se pudo guardar" message={error} />}
      <form className="users-form" onSubmit={handleSubmit}>
        <label>Nombre completo<input name="name" value={form.name} onChange={updateField} autoFocus /></label>
        <label>Correo institucional<input name="email" type="email" value={form.email} onChange={updateField} /></label>
        {!isEditing && <label>Contraseña<input name="password" type="password" value={form.password} onChange={updateField} /></label>}
        <label>Rol<select name="role" value={form.role} onChange={updateField}><option value="estudiante">Estudiante</option><option value="profesor">Profesor</option><option value="administrador">Administrador</option></select></label>
        <div className="users-modal-actions"><button type="button" onClick={onClose}>Cancelar</button><button className="primary-action" type="submit" disabled={saving}>{saving ? 'Guardando...' : isEditing ? 'Guardar cambios' : 'Crear usuario'}</button></div>
      </form>
    </section>
  </div>
}

function DeactivateModal({ user, onClose, onConfirm, saving }) {
  return <div className="users-modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
    <section className="users-confirm-modal" role="dialog" aria-modal="true" aria-labelledby="deactivate-user-title">
      <div className="users-confirm-heading"><span><Icon>warning</Icon></span><div><h2 id="deactivate-user-title">¿Desactivar a {user.name}?</h2><p>El usuario no podrá iniciar sesión. Sus registros históricos permanecerán intactos.</p></div></div>
      <div className="users-affected-user"><span className="users-initials">{user.name.split(' ').map((part) => part[0]).slice(0, 2).join('')}</span><span><strong>{user.name}</strong><small>{user.email}</small></span><b>Pasará a: Inactivo</b></div>
      <div className="users-modal-actions"><button type="button" onClick={onClose}>Cancelar</button><button className="danger-action" type="button" onClick={onConfirm} disabled={saving}>{saving ? 'Guardando...' : 'Desactivar usuario'}</button></div>
    </section>
  </div>
}

export function AdministratorUsers() {
  const [users, setUsers] = useState([])
  const [query, setQuery] = useState('')
  const [role, setRole] = useState('Todos')
  const [status, setStatus] = useState('Activo')
  const [modalUser, setModalUser] = useState(undefined)
  const [selectedUser, setSelectedUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    async function loadUsers() {
      try {
        const loadedUsers = await fetchUsers()
        if (!cancelled) { setUsers(loadedUsers); setError('') }
      } catch (loadError) {
        if (!cancelled) setError(loadError.message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    loadUsers()
    return () => { cancelled = true }
  }, [])

  const filteredUsers = useMemo(() => users.filter((user) => {
    const matchesQuery = `${user.name} ${user.email}`.toLowerCase().includes(query.toLowerCase())
    return matchesQuery && (role === 'Todos' || roleLabels[user.role] === role) && (status === 'Todos' || (user.status === 'activo' ? 'Activo' : 'Inactivo') === status)
  }), [users, query, role, status])

  function resetFilters() { setQuery(''); setRole('Todos'); setStatus('Todos') }

  async function saveUser(form) {
    setSaving(true)
    try {
      const savedUser = modalUser ? await updateAdministratorUser(modalUser.id, { nombre: form.name.trim(), correo: form.email.trim(), rol: form.role }) : await createAdministratorUser(form)
      setUsers((current) => modalUser ? current.map((item) => item.id === savedUser.id ? { ...item, ...savedUser } : item) : [savedUser, ...current])
      setModalUser(undefined)
    } finally { setSaving(false) }
  }

  async function changeStatus(user) {
    setSaving(true)
    try {
      const savedUser = await updateAdministratorUser(user.id, { estado: user.status === 'activo' ? 'inactivo' : 'activo' })
      setUsers((current) => current.map((item) => item.id === user.id ? { ...item, ...savedUser, status: savedUser.status || (user.status === 'activo' ? 'inactivo' : 'activo') } : item))
      setSelectedUser(null)
    } catch (statusError) { setError(statusError.message) } finally { setSaving(false) }
  }

  return <div className="administrator-page administrator-users-page">
    <AdministratorSidebar activeItem="Usuarios" />
    <div className="administrator-content"><AdministratorTopbar /><main className="administrator-main">
      <section className="users-page-heading"><div><span className="users-overline">Módulo Administrativo <b>HU-19</b></span><h1>Gestión de Usuarios</h1><p>Supervisa identidades académicas, asignación de privilegios y control de acceso del campus.</p></div><button type="button" className="users-create-button" onClick={() => setModalUser(null)}><Icon>person_add</Icon>+ Crear usuario</button></section>
      {error && <StatusAlert title="No se pudo completar la operación" message={error} />}
      <UserSummaryCards users={users} />
      <section className="users-toolbar"><div className="users-toolbar-main"><label className="users-table-search"><Icon>search</Icon><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar por nombre o correo institucional..." /></label><div className="users-filters"><label><Icon>badge</Icon>Rol:<select value={role} onChange={(event) => setRole(event.target.value)}><option>Todos</option><option>Estudiante</option><option>Profesor</option><option>Administrador</option></select></label><label><Icon>toggle_on</Icon>Estado:<select value={status} onChange={(event) => setStatus(event.target.value)}><option>Todos</option><option>Activo</option><option>Inactivo</option></select></label><button type="button" title="Restablecer filtros" onClick={resetFilters}><Icon>filter_alt_off</Icon></button></div></div><div className="users-toolbar-meta"><span><i /> <strong>{users.length} usuarios registrados</strong><small>• Mostrando {filteredUsers.length} registros</small></span></div></section>
      <section className="users-table-card"><div className="users-table-scroll"><table className="users-table"><thead><tr><th>Usuario</th><th>Rol</th><th>Registro</th><th>Estado</th><th>Acciones</th></tr></thead><tbody>{loading ? <tr><td colSpan="5" className="users-table-message">Cargando usuarios...</td></tr> : filteredUsers.length === 0 ? <tr><td colSpan="5" className="users-table-message">No se encontraron usuarios.</td></tr> : filteredUsers.map((user) => <tr className={user.status === 'inactivo' ? 'is-inactive' : ''} key={user.id}><td><div className="users-person"><span className={`users-avatar ${roleTone[user.role] || 'inactive'}`}><Icon>{roleIcons[user.role] || 'person'}</Icon></span><span><strong>{user.name}</strong><small>{user.email}</small></span></div></td><td><span className={`users-role ${roleTone[user.role] || 'admin'}`}>{roleLabels[user.role] || user.role}</span></td><td><strong>{user.fecha_registro ? new Date(user.fecha_registro).toLocaleDateString('es-CO') : '—'}</strong></td><td><span className={`users-status ${user.status === 'activo' ? 'activo' : 'inactivo'}`}><i />{user.status === 'activo' ? 'Activo' : 'Inactivo'}</span></td><td><div className="users-row-actions"><button type="button" onClick={() => setModalUser(user)}>Editar</button>{user.status === 'activo' ? <button className="deactivate-button" type="button" onClick={() => setSelectedUser(user)}>Desactivar</button> : <button type="button" onClick={() => changeStatus(user)}>Reactivar</button>}</div></td></tr>)}</tbody></table></div></section>
    </main></div>
    {modalUser !== undefined && <UserModal user={modalUser} onClose={() => setModalUser(undefined)} onSave={saveUser} saving={saving} />}
    {selectedUser && <DeactivateModal user={selectedUser} onClose={() => setSelectedUser(null)} onConfirm={() => changeStatus(selectedUser)} saving={saving} />}
  </div>
}
