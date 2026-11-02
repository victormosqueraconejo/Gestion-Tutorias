import { useEffect, useRef, useState } from 'react'
import { Icon } from './Icon'
import './profile-menu.css'

const defaultUser = {
  name: 'Valeria Sofía Martínez',
  email: 'valeria.martinez@estudiantes.edu',
  role: 'Estudiante',
}

export function ProfileMenu({ user = defaultUser, avatarUrl, compact = false }) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef(null)

  useEffect(() => {
    function handleDocumentClick(event) {
      if (!containerRef.current?.contains(event.target)) setOpen(false)
    }

    function handleKeyDown(event) {
      if (event.key === 'Escape') setOpen(false)
    }

    document.addEventListener('mousedown', handleDocumentClick)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleDocumentClick)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  function handleLogout() {
    setOpen(false)
    window.location.assign('/')
  }

  return (
    <div className={`profile-menu-container ${compact ? 'profile-menu-compact' : ''}`} ref={containerRef}>
      <button
        className={`profile-menu-trigger ${open ? 'is-open' : ''}`}
        type="button"
        aria-label="Abrir menú de perfil"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        {avatarUrl ? <img src={avatarUrl} alt={`Perfil de ${user.name}`} /> : <Icon filled>person</Icon>}
      </button>
      {open && (
        <div className="profile-dropdown" role="menu" aria-label="Menú de perfil">
          <div className="profile-dropdown-summary">
            {avatarUrl ? <img src={avatarUrl} alt="" /> : <span className="profile-dropdown-avatar"><Icon filled>person</Icon></span>}
            <span>
              <strong>{user.name}</strong>
              <small>{user.email}</small>
              <b>{user.role}</b>
            </span>
          </div>
          <div className="profile-dropdown-divider" />
          <a className="profile-dropdown-item" href="/perfil-estudiante" role="menuitem" onClick={() => setOpen(false)}>
            <Icon>person</Icon><span>Mi perfil</span>
          </a>
          <a className="profile-dropdown-item" href="/perfil-estudiante" role="menuitem" onClick={() => setOpen(false)}>
            <Icon>tune</Icon><span>Preferencias</span>
          </a>
          <a className="profile-dropdown-item" href="#ayuda" role="menuitem" onClick={() => setOpen(false)}>
            <Icon>help_outline</Icon><span>Ayuda académica</span>
          </a>
          <div className="profile-dropdown-divider" />
          <button className="profile-dropdown-item profile-dropdown-logout" type="button" role="menuitem" onClick={handleLogout}>
            <Icon>logout</Icon><span>Cerrar sesión</span>
          </button>
        </div>
      )}
    </div>
  )
}
