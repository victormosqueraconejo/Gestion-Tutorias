import { useEffect, useRef, useState } from 'react'
import { Icon } from '../../components/ui/Icon'
import './student-profile.css'

const initialProfile = {
  name: 'Valeria Sofía Martínez',
  semester: '6',
}

const avatarUrl =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAV81x7drzy3utdP6syacZCO9rcbGIQJb8xnK4pE8hoD8JIpWWwi_mys7y9IMbFJpu9z8N1eEIjbS3yJylsMDp1Y5ckXI-B1Mrn5DEIeo7nMIOVSoEqRbIdkwrfwrPRQQKL7nwH2_f15974twE46-f4eXrvvjtClfbATI5QYPWgzVk0hcRGby50QleYaCORBxZ6XXb2ZH6Sj8l3pJ_rvLIgQrbKjMXlQ7GSeq-x4Ho'

function ProfileField({ label, status, statusIcon, children, help, editable = false }) {
  return (
    <div className="profile-field">
      <div className="profile-field-heading">
        <label>{label}</label>
        <span className={editable ? 'field-status field-status-editable' : 'field-status'}>
          <Icon>{statusIcon}</Icon>
          {status}
        </span>
      </div>
      {children}
      <p className="profile-field-help">{help}</p>
    </div>
  )
}

export function StudentProfile() {
  const [profile, setProfile] = useState(initialProfile)
  const [draft, setDraft] = useState(initialProfile)
  const [avatar, setAvatar] = useState(avatarUrl)
  const [toastVisible, setToastVisible] = useState(true)
  const [saving, setSaving] = useState(false)
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  const [logoutModalOpen, setLogoutModalOpen] = useState(false)
  const profileMenuRef = useRef(null)

  function updateDraft(field, value) {
    setDraft((current) => ({ ...current, [field]: value }))
  }

  function handleAvatarChange(event) {
    const file = event.target.files?.[0]
    if (!file) return
    setAvatar(URL.createObjectURL(file))
  }

  function handleCancel() {
    setDraft(profile)
  }

  function handleSubmit(event) {
    event.preventDefault()
    setSaving(true)
    window.setTimeout(() => {
      setProfile(draft)
      setSaving(false)
      setToastVisible(true)
    }, 600)
  }

  function openLogoutModal() {
    setProfileMenuOpen(false)
    setLogoutModalOpen(true)
  }

  useEffect(() => {
    function handleDocumentClick(event) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setProfileMenuOpen(false)
      }
    }

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setProfileMenuOpen(false)
        setLogoutModalOpen(false)
      }
    }

    document.addEventListener('mousedown', handleDocumentClick)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleDocumentClick)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  return (
    <div className="profile-page">
      <header className="profile-topbar">
        <div className="profile-topbar-inner">
          <a className="profile-brand" href="/" aria-label="Ir al inicio del Portal Académico">
            <span className="profile-brand-mark"><Icon filled>school</Icon></span>
            <span>Portal Académico</span>
          </a>

          <nav className="profile-nav" aria-label="Navegación principal">
            <a href="/">Inicio</a>
            <a href="#cursos">Mis Cursos</a>
            <a className="active" aria-current="page" href="/perfil-estudiante">Perfil</a>
            <a href="#tramites">Trámites</a>
          </nav>

          <div className="profile-user" ref={profileMenuRef}>
            <div className="profile-user-copy">
              <span>Estudiante Regular</span>
              <small>2024-II</small>
            </div>
            <button
              className={`profile-avatar-button ${profileMenuOpen ? 'is-open' : ''}`}
              type="button"
              aria-label="Abrir menú de perfil"
              aria-expanded={profileMenuOpen}
              onClick={() => setProfileMenuOpen((open) => !open)}
            >
              <img src={avatar} alt="Perfil de Valeria Sofía Martínez" />
            </button>

            {profileMenuOpen && (
              <div className="profile-menu" role="menu" aria-label="Menú de perfil">
                <div className="profile-menu-summary">
                  <img src={avatar} alt="" />
                  <span>
                    <strong>Valeria Sofía Martínez</strong>
                    <small>valeria.martinez@estudiantes.edu</small>
                    <b>Estudiante</b>
                  </span>
                </div>
                <div className="profile-menu-divider" />
                <a className="profile-menu-item" href="/perfil-estudiante" role="menuitem" onClick={() => setProfileMenuOpen(false)}>
                  <Icon>person</Icon>
                  <span>Mi perfil</span>
                </a>
                <a className="profile-menu-item" href="#preferencias" role="menuitem" onClick={() => setProfileMenuOpen(false)}>
                  <Icon>tune</Icon>
                  <span>Preferencias</span>
                </a>
                <a className="profile-menu-item" href="#ayuda" role="menuitem" onClick={() => setProfileMenuOpen(false)}>
                  <Icon>help_outline</Icon>
                  <span>Ayuda académica</span>
                </a>
                <div className="profile-menu-divider" />
                <button className="profile-menu-item profile-menu-logout" type="button" role="menuitem" onClick={openLogoutModal}>
                  <Icon>logout</Icon>
                  <span>Cerrar sesión</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="profile-main">
        <div className="profile-container">
          {toastVisible && (
            <div className="profile-toast" role="status">
              <span className="toast-icon"><Icon filled>check_circle</Icon></span>
              <div>
                <strong>¡Cambios guardados con éxito!</strong>
                <p>Tu información académica ha sido actualizada correctamente en el sistema institucional.</p>
              </div>
              <button type="button" aria-label="Cerrar notificación" onClick={() => setToastVisible(false)}>
                <Icon>close</Icon>
              </button>
            </div>
          )}

          <section className="profile-heading">
            <div>
              <div className="profile-kicker"><Icon>manage_accounts</Icon> Gestión de Cuenta Estudiantil</div>
              <h1>Mi Perfil</h1>
              <p>Consulta y actualiza tu información de estudiante matriculado.</p>
            </div>
            <div className="enrollment-status">
              <Icon>verified</Icon>
              <span><small>Estado de matrícula</small><strong>Matriculado Activo 2024-II</strong></span>
            </div>
          </section>

          <div className="profile-layout">
            <aside className="profile-sidebar">
              <section className="identity-card">
                <div className="identity-banner" />
                <div className="avatar-editor">
                  <img src={avatar} alt="" />
                  <label htmlFor="avatarUploadInput" title="Cambiar foto">
                    <Icon>photo_camera</Icon>
                  </label>
                  <input id="avatarUploadInput" accept="image/png, image/jpeg" type="file" onChange={handleAvatarChange} />
                </div>
                <span className="role-pill"><Icon filled>school</Icon> Rol: Estudiante</span>
                <h2>{profile.name}</h2>
                <p>Código: <strong>EST-20210492</strong></p>
                <div className="photo-note">
                  <strong><Icon>info</Icon> Especificaciones de foto:</strong>
                  <span>Formato JPG o PNG. Tamaño máximo 2MB. Fondo neutro y rostro completamente despejado según reglamento oficial.</span>
                </div>
              </section>

              <section className="progress-card">
                <div className="card-title-row">
                  <h3>Avance Curricular</h3>
                  <span>68% Total</span>
                </div>
                <div className="progress-content">
                  <div className="progress-ring">
                    <svg viewBox="0 0 36 36" aria-label="68 por ciento del plan completado">
                      <path d="M18 2.0845a15.9155 15.9155 0 0 1 0 31.831a15.9155 15.9155 0 0 1 0-31.831" />
                      <path className="progress-ring-value" pathLength="100" d="M18 2.0845a15.9155 15.9155 0 0 1 0 31.831a15.9155 15.9155 0 0 1 0-31.831" />
                    </svg>
                    <span><strong>118/172</strong><small>Créditos</small></span>
                  </div>
                  <div className="progress-details">
                    <p>Promedio ponderado: <strong>16.4 / 20</strong></p>
                    <p>Ciclos aprobados: <strong>5 completados</strong></p>
                    <p>Condición: <strong className="accent">Tercio Superior</strong></p>
                  </div>
                </div>
              </section>
            </aside>

            <section className="profile-details">
              <form className="profile-form" onSubmit={handleSubmit}>
                <div className="form-title">
                  <div>
                    <h2>Ficha de Información Personal y Académica</h2>
                    <p>Modifica los campos permitidos. Los datos oficiales bloqueados requieren solicitud a Secretaría.</p>
                  </div>
                  <Icon>badge</Icon>
                </div>

                <ProfileField label="Nombre completo *" status="Campo editable" statusIcon="edit" editable help="Asegúrate de que coincida con tu documento de identidad nacional vigente.">
                  <div className="profile-input editable-input"><Icon>person</Icon><input required value={draft.name} onChange={(event) => updateDraft('name', event.target.value)} /><Icon>edit</Icon></div>
                </ProfileField>

                <ProfileField label="Correo institucional" status="Bloqueado por sistema" statusIcon="lock" help="Cuenta vinculada al dominio del campus universitario. No es posible transferir o renombrar.">
                  <div className="profile-input readonly-input"><Icon>mail</Icon><input readOnly value="valeria.martinez@estudiantes.edu" /><Icon>lock</Icon></div>
                </ProfileField>

                <ProfileField label="Carrera" status="Solo lectura" statusIcon="lock" help="Solo lectura administrada por Secretaría Académica.">
                  <div className="profile-input readonly-input"><Icon>domain</Icon><input readOnly value="Ingeniería de Sistemas y Computación" /><Icon>verified_user</Icon></div>
                  <div className="managed-note"><Icon>admin_panel_settings</Icon> Solo lectura administrada por Secretaría Académica.</div>
                </ProfileField>

                <ProfileField label="Semestre actual *" status="Activo para selección" statusIcon="calendar_month" editable help="Editable únicamente para estudiantes activos según la carga lectiva del ciclo 2024-II.">
                  <div className="profile-input editable-input"><Icon>school</Icon><select value={draft.semester} onChange={(event) => updateDraft('semester', event.target.value)}>{Array.from({ length: 10 }, (_, index) => <option value={index + 1} key={index + 1}>{index + 1}° Semestre</option>)}</select><Icon>expand_more</Icon></div>
                </ProfileField>

                <div className="access-card">
                  <div><span className="access-icon"><Icon>security</Icon></span><span><strong>Privilegios y Acceso de Red</strong><small>Nivel de autorización en el Campus Virtual</small></span></div>
                  <b>Rol: Estudiante</b>
                </div>

                <div className="form-actions">
                  <button className="cancel-button" type="button" onClick={handleCancel}>Cancelar</button>
                  <button className="save-button" type="submit" disabled={saving}><Icon>{saving ? 'progress_activity' : 'save'}</Icon>{saving ? 'Guardando...' : 'Guardar cambios'}</button>
                </div>
              </form>

              <div className="profile-help"><Icon>contact_support</Icon><p><strong>¿Necesitas modificar datos protegidos como tu carrera o cédula?</strong><br />Debes iniciar una solicitud formal de actualización de expediente en el módulo de <a href="#tramites">Trámites Académicos</a> adjuntando tu documentación oficial de sustento.</p></div>
            </section>
          </div>
        </div>
      </main>

      {logoutModalOpen && (
        <div className="logout-overlay" role="presentation">
          <section className="logout-modal" role="dialog" aria-modal="true" aria-labelledby="logout-title">
            <button className="logout-close" type="button" aria-label="Cerrar modal" onClick={() => setLogoutModalOpen(false)}>
              <Icon>close</Icon>
            </button>
            <div className="logout-icon"><Icon filled>logout</Icon></div>
            <h2 id="logout-title">¿Cerrar sesión?</h2>
            <p>Tu sesión actual se cerrará y tendrás que ingresar nuevamente para acceder al Portal Académico.</p>
            <div className="logout-actions">
              <button className="logout-cancel" type="button" onClick={() => setLogoutModalOpen(false)}>Cancelar</button>
              <button className="logout-confirm" type="button" onClick={() => { window.location.href = '/' }}>Cerrar sesión</button>
            </div>
          </section>
        </div>
      )}
    </div>
  )
}
