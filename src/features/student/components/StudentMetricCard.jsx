import { Icon } from '../../../components/ui/Icon'

export function StudentMetricCard({ title, value, suffix, detail, icon, tone = 'blue' }) {
  return (
    <article className={`student-metric-card metric-${tone}`}>
      <div className="student-metric-heading">
        <span>{title}</span>
        {icon && <span className="student-metric-icon"><Icon>{icon}</Icon></span>}
      </div>
      <div className="student-metric-value">{value} <small>{suffix}</small></div>
      <p>{detail}</p>
    </article>
  )
}
