import { Icon } from '../../../components/ui/Icon'

export function TutoringSessionCard({ student, avatar, subject, mode, location, title, enrollment, time, note, action, tone = 'primary' }) {
  return (
    <article className={`tutoring-session-card ${tone}`}>
      <div className="session-main">
        <img src={avatar} alt="" />
        <div className="session-copy">
          <div className="session-tags">
            <span>{subject}</span>
            <small><Icon>{mode === 'Presencial' ? 'apartment' : 'videocam'}</Icon>{mode}{location && `: ${location}`}</small>
          </div>
          <h3>{title}</h3>
          <p>Estudiante: <strong>{student}</strong> ({enrollment})</p>
        </div>
        <div className="session-time"><strong><Icon>schedule</Icon>{time}</strong><small>{tone === 'primary' ? 'Inicia en 45 min' : 'Sala asignada'}</small></div>
      </div>
      <div className="session-footer">
        <span><Icon>{note.startsWith('Repositorio') ? 'terminal' : 'attachment'}</Icon>{note}</span>
        <div><button type="button">Detalles</button><button className="session-action" type="button"><Icon>{action.icon}</Icon>{action.label}</button></div>
      </div>
    </article>
  )
}
