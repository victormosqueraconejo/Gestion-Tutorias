import { Icon } from '../../../components/ui/Icon'

export function TeacherMetricCard({ icon, tone, value, label, description, badge, children, action }) {
  return (
    <article className="teacher-metric-card">
      <div className="metric-header">
        <span className={`metric-icon ${tone}`}><Icon>{icon}</Icon></span>
        {badge && <span className="metric-badge">{badge}</span>}
      </div>
      <div className="metric-copy"><strong>{value}</strong><span>{label}</span></div>
      <p>{description}</p>
      {action && <a href={action.href}>{action.label}<Icon>arrow_forward</Icon></a>}
      {children}
    </article>
  )
}
