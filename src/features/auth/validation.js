const INSTITUTIONAL_DOMAIN = '@uniautonoma.edu.co'

export function validateLogin(values) {
  const errors = {}
  const email = values.email.trim()

  if (!email) {
    errors.email = 'El correo institucional es obligatorio.'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = 'Ingresa un correo electrónico válido.'
  } else if (!email.toLowerCase().endsWith(INSTITUTIONAL_DOMAIN)) {
    errors.email = `El correo debe terminar en ${INSTITUTIONAL_DOMAIN}.`
  }

  if (!values.password) {
    errors.password = 'La contraseña es obligatoria.'
  } else if (values.password.length < 8) {
    errors.password = 'La contraseña debe tener mínimo 8 caracteres.'
  }

  return errors
}
