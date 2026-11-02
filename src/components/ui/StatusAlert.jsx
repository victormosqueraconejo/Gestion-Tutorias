import { Icon } from './Icon'

export function StatusAlert({ title, message, tone = 'error' }) {
  return (
    <div className={`status-alert ${tone}-alert`} role={tone === 'error' ? 'alert' : 'status'}>
      <Icon filled>{tone === 'error' ? 'error' : 'check_circle'}</Icon>
      <div>
        <strong>{title}</strong>
        <p>{message}</p>
      </div>
    </div>
  )
}
