import { useState } from 'react'
import { Icon } from '../../../components/ui/Icon'
import { StatusAlert } from '../../../components/ui/StatusAlert'
import { saveAuthenticatedUser } from '../../auth/authApi'
import { createStudentUser } from '../studentApi'
import { getPasswordRequirements, validateRegistration } from '../validation'
import { PasswordStrength } from './PasswordStrength'

const initialValues = {
  fullName: '',
  email: '',
  password: '',
  confirmPassword: '',
  career: 'sistemas',
  semester: '4',
  acceptTerms: true,
}

const careers = [
  ['sistemas', 'Ingeniería de Sistemas'],
  ['medicina', 'Medicina'],
  ['derecho', 'Derecho'],
  ['administracion', 'Administración de Empresas'],
  ['civil', 'Ingeniería Civil'],
  ['psicologia', 'Psicología'],
  ['arquitectura', 'Arquitectura'],
]

function Field({ id, label, error, children, help }) {
  return (
    <div className={`registration-field ${error ? 'has-error' : ''}`}>
      <label htmlFor={id}>{label}<span aria-hidden="true"> *</span></label>
      {children}
      {error ? <span className="registration-error" id={`${id}-error`}>{error}</span> : help && <span className="registration-help">{help}</span>}
    </div>
  )
}

export function StudentRegistrationForm() {
  const [values, setValues] = useState(initialValues)
  const [errors, setErrors] = useState({})
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [status, setStatus] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  function update(field, value) {
    setValues((current) => ({ ...current, [field]: value }))
    setStatus(null)
    if (errors[field]) setErrors((current) => ({ ...current, [field]: undefined }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    if (isSubmitting) return

    const nextErrors = validateRegistration(values)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) {
      setStatus(null)
      return
    }

    setIsSubmitting(true)
    setStatus(null)

    try {
      const payload = await createStudentUser({
        name: values.fullName,
        email: values.email,
        password: values.password,
      })
      const user = payload?.usuario || payload
      if (!user?._id && !user?.correo) {
        throw new Error('El servidor no devolvió los datos del usuario creado.')
      }

      saveAuthenticatedUser(user, true)
      window.location.assign('/estudiante')
    } catch (error) {
      setStatus({
        tone: 'error',
        title: 'No se pudo crear la cuenta',
        message: error.message,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const passwordError = errors.password
  const requirements = getPasswordRequirements(values.password)

  return (
    <form className="registration-form" onSubmit={handleSubmit} noValidate>
      {status && <StatusAlert {...status} />}

      <div className="registration-grid">
        <Field id="fullName" label="Nombre completo" error={errors.fullName} help="Conforme a tu documento oficial de identidad">
          <div className="registration-input"><Icon>person</Icon><input id="fullName" value={values.fullName} onChange={(event) => update('fullName', event.target.value)} placeholder="Ingresa tu nombre completo" aria-invalid={Boolean(errors.fullName)} /></div>
        </Field>
        <Field id="instEmail" label="Correo institucional" error={errors.email} help="Usa tu correo institucional para continuar">
          <div className="registration-input"><Icon>mail</Icon><input id="instEmail" type="email" value={values.email} onChange={(event) => update('email', event.target.value)} placeholder="Ingresa tu correo institucional" aria-invalid={Boolean(errors.email)} /></div>
        </Field>
        <Field id="pwdInput" label="Contraseña" error={passwordError}>
          <div className="registration-input"><Icon>lock</Icon><input id="pwdInput" type={showPassword ? 'text' : 'password'} value={values.password} onChange={(event) => update('password', event.target.value)} placeholder="Crea una contraseña" aria-invalid={Boolean(passwordError)} /><button type="button" aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'} onClick={() => setShowPassword((visible) => !visible)}><Icon>{showPassword ? 'visibility_off' : 'visibility'}</Icon></button></div>
        </Field>
        <Field id="confirmPwdInput" label="Confirmar contraseña" error={errors.confirmPassword}>
          <div className="registration-input"><Icon>lock_reset</Icon><input id="confirmPwdInput" type={showConfirm ? 'text' : 'password'} value={values.confirmPassword} onChange={(event) => update('confirmPassword', event.target.value)} placeholder="Repite la contraseña" aria-invalid={Boolean(errors.confirmPassword)} /><button type="button" aria-label={showConfirm ? 'Ocultar confirmación' : 'Mostrar confirmación'} onClick={() => setShowConfirm((visible) => !visible)}><Icon>{showConfirm ? 'visibility_off' : 'visibility'}</Icon></button></div>
        </Field>

        <div className="registration-wide"><PasswordStrength password={values.password} /></div>

        <Field id="careerSelect" label="Carrera profesional" error={errors.career} help="Programa acreditado en el que cursarás asignaturas">
          <div className="registration-input"><Icon>local_library</Icon><select id="careerSelect" value={values.career} onChange={(event) => update('career', event.target.value)} aria-invalid={Boolean(errors.career)}>{careers.map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select><Icon>expand_more</Icon></div>
        </Field>
        <Field id="semesterSelect" label="Semestre académico" error={errors.semester} help="Nivel de inicio para pre-asignación de turnos y materias">
          <div className="registration-input"><Icon>calendar_month</Icon><select id="semesterSelect" value={values.semester} onChange={(event) => update('semester', event.target.value)} aria-invalid={Boolean(errors.semester)}>{Array.from({ length: 10 }, (_, index) => <option value={index + 1} key={index + 1}>{index + 1}° Semestre</option>)}</select><Icon>expand_more</Icon></div>
        </Field>
      </div>

      <div className="student-info"><span><Icon>info</Icon></span><p>Tu cuenta será configurada automáticamente con perfil de <strong>Estudiante activo</strong>. Tendrás acceso inmediato al campus virtual, biblioteca y horario de clases.</p></div>
      <div className={`terms-row ${errors.acceptTerms ? 'has-error' : ''}`}><input id="termsCheckbox" type="checkbox" checked={values.acceptTerms} onChange={(event) => update('acceptTerms', event.target.checked)} /><label htmlFor="termsCheckbox">Acepto los <a href="#terms">Términos y Condiciones</a> institucionales y autorizo expresamente el <a href="#privacy">Tratamiento de Datos Personales</a> para fines académicos y administrativos de la Universidad.</label></div>
      {errors.acceptTerms && <span className="registration-error">{errors.acceptTerms}</span>}
      <div className="registration-actions"><button className="create-button" type="submit" disabled={isSubmitting}>{isSubmitting ? 'Creando cuenta...' : 'Crear cuenta de estudiante'} <Icon>arrow_forward</Icon></button><span>¿Ya tienes una cuenta? <a href="/">Inicia sesión</a></span></div>
      <div className="registration-footer"><span><Icon>help</Icon> ¿Dudas con la matrícula? Contacta a <a href="mailto:soporte.academico@uniautonoma.edu.co">soporte.academico@uniautonoma.edu.co</a></span><span>Código de formulario: REG-EST-HU11</span></div>
      <span className="sr-only">{Object.values(requirements).filter(Boolean).length} de 4 requisitos de contraseña cumplidos</span>
    </form>
  )
}
