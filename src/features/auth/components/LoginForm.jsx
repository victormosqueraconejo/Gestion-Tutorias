import { useState } from 'react'
import { Icon } from '../../../components/ui/Icon'
import { StatusAlert } from '../../../components/ui/StatusAlert'
import { validateLogin } from '../validation'

const initialValues = { email: '', password: '' }

export function LoginForm() {
  const [values, setValues] = useState(initialValues)
  const [errors, setErrors] = useState({})
  const [showPassword, setShowPassword] = useState(false)
  const [status, setStatus] = useState(null)
  const [rememberSession, setRememberSession] = useState(false)

  function updateField(field, value) {
    setValues((current) => ({ ...current, [field]: value }))
    setStatus(null)
    if (errors[field]) {
      setErrors((current) => ({ ...current, [field]: undefined }))
    }
  }

  function validateField(field) {
    const fieldErrors = validateLogin(values)
    setErrors((current) => ({ ...current, [field]: fieldErrors[field] }))
  }

  function handleSubmit(event) {
    event.preventDefault()
    const nextErrors = validateLogin(values)
    setErrors(nextErrors)

    if (Object.keys(nextErrors).length > 0) {
      setStatus(null)
      return
    }

    setStatus({
      tone: 'success',
      title: 'Datos validados',
      message: rememberSession
        ? 'Tus credenciales son válidas y se recordará esta sesión.'
        : 'Tus credenciales son válidas. Ya puedes continuar.',
    })
  }

  return (
    <>
      {status && <StatusAlert {...status} />}

      <form className="login-form" onSubmit={handleSubmit} noValidate>
        <div className={`field-group ${errors.email ? 'has-error' : ''}`}>
          <label htmlFor="email-input">
            <span>Correo institucional</span>
            {errors.email && (
              <span className="field-error">
                <Icon>cancel</Icon> {errors.email}
              </span>
            )}
          </label>
          <div className="input-wrapper">
            <Icon>alternate_email</Icon>
            <input
              id="email-input"
              type="email"
              value={values.email}
              onChange={(event) => updateField('email', event.target.value)}
              onBlur={() => validateField('email')}
              placeholder="usuario@uniautonoma.edu.co"
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? 'email-error' : 'email-help'}
            />
          </div>
          {errors.email ? (
            <span className="field-help field-error-message" id="email-error">
              {errors.email}
            </span>
          ) : (
            <span className="field-help" id="email-help">
              Utiliza tu identificador oficial @uniautonoma.edu.co
            </span>
          )}
        </div>

        <div className={`field-group password-group ${errors.password ? 'has-error' : ''}`}>
          <div className="password-label">
            <label htmlFor="password-input">Contraseña</label>
            <button
              className="visibility-toggle"
              type="button"
              onClick={() => setShowPassword((visible) => !visible)}
              aria-pressed={showPassword}
            >
              <Icon>{showPassword ? 'visibility_off' : 'visibility'}</Icon>
              {showPassword ? 'Ocultar' : 'Mostrar'}
            </button>
          </div>
          <div className="input-wrapper">
            <Icon>lock</Icon>
            <input
              id="password-input"
              type={showPassword ? 'text' : 'password'}
              value={values.password}
              onChange={(event) => updateField('password', event.target.value)}
              onBlur={() => validateField('password')}
              placeholder="••••••••••••"
              aria-invalid={Boolean(errors.password)}
              aria-describedby={errors.password ? 'password-error' : undefined}
            />
          </div>
          {errors.password && (
            <span className="field-help field-error-message" id="password-error">
              {errors.password}
            </span>
          )}
        </div>

        <div className="form-options">
          <label className="remember-option">
            <input
              type="checkbox"
              checked={rememberSession}
              onChange={(event) => setRememberSession(event.target.checked)}
            />
            <span>Recordar sesión</span>
          </label>
          <a href="#forgot-password">¿Olvidaste tu contraseña?</a>
        </div>

        <button className="submit-button" type="submit">
          <span>Ingresar</span>
          <Icon>arrow_forward</Icon>
        </button>
      </form>
    </>
  )
}
