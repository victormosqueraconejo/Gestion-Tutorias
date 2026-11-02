import { Icon } from '../../../components/ui/Icon'

export function StudentTutoringCard({ session }) {
  return (
    <article className="student-session-card">
      <div className="student-session-content">
        <div className="student-session-tags">
          <span className={`session-status ${session.statusTone}`}><Icon filled>{session.statusIcon}</Icon>{session.status}</span>
          <span className="session-location">{session.location}</span>
          <button type="button" aria-label={`Opciones de ${session.subject}`}><Icon>more_vert</Icon></button>
        </div>
        <h3>{session.subject}</h3>
        <p>{session.description}</p>
        <div className="student-session-meta">
          <span><Icon>calendar_today</Icon>{session.date}</span>
          <span><Icon>schedule</Icon>{session.time}</span>
        </div>
      </div>
      <div className="student-session-footer">
        <div className="student-tutor">
          <span className="student-tutor-avatar">{session.initials}</span>
          <span><strong>{session.tutor}</strong><small>{session.department}</small></span>
        </div>
        <a className={session.actionTone === 'muted' ? 'button-muted' : 'button-small'} href={session.actionHref}>
          <Icon>{session.actionIcon}</Icon>{session.action}
        </a>
      </div>
    </article>
  )
}
