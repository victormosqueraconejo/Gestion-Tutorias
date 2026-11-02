import { Icon } from '../../../components/ui/Icon'

const resourceTypes = [
  ['video', 'Video', 'play_circle', 'resource-video'],
  ['guia', 'Guía PDF', 'picture_as_pdf', 'resource-guide'],
  ['documento', 'Documento', 'description', 'resource-document'],
  ['enlace', 'Enlace web', 'link', 'resource-link'],
]

export function ResourceTypeSelector({ value, onChange }) {
  return (
    <div className="resource-type-grid">
      {resourceTypes.map(([type, label, icon, tone]) => (
        <label className={`resource-type-option ${value === type ? 'selected' : ''}`} key={type}>
          <input type="radio" name="resourceType" value={type} checked={value === type} onChange={() => onChange(type)} />
          <span className={`resource-type-icon ${tone}`}><Icon>{icon}</Icon></span>
          <span>{label}</span>
        </label>
      ))}
    </div>
  )
}
