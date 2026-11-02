const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const INSTITUTIONAL_DOMAIN = '@uniautonoma.edu.co'

export function getPasswordRequirements(password) {
  return {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  }
}

export function validateRegistration(values) {
  const errors = {}
  const email = values.email.trim()

  if (values.fullName.trim().length < 3) {
    errors.fullName = 'Ingresa tu nombre completo.'
  }
  if (!EMAIL_PATTERN.test(email)) {
    errors.email = 'Ingresa un correo electrónico válido.'
  } else if (!email.toLowerCase().endsWith(INSTITUTIONAL_DOMAIN)) {
    errors.email = `El correo debe terminar en ${INSTITUTIONAL_DOMAIN}.`
  }

  const requirements = getPasswordRequirements(values.password)
  if (!values.password) {
    errors.password = 'La contraseña es obligatoria.'
  } else if (!Object.values(requirements).every(Boolean)) {
    errors.password =
      'Usa mínimo 8 caracteres, una mayúscula, un número y un símbolo.'
  }
  if (values.password !== values.confirmPassword) {
    errors.confirmPassword = 'Las contraseñas no coinciden.'
  }
  if (!values.career) errors.career = 'Selecciona una carrera profesional.'
  if (!values.semester) errors.semester = 'Selecciona un semestre académico.'
  if (!values.acceptTerms) errors.acceptTerms = 'Debes aceptar los términos.'

  return errors
}
