import { Link } from 'react-router-dom';
import { categoryColor, fmtDate, fmtDay, isPast } from '../utils.js';

export function SpotsBadge({ event }) {
  if (isPast(event.date_time)) return <span className="badge muted">Ended</span>;
  if (event.is_full) return <span className="badge red">Full</span>;
  if (event.spots_left <= 5) return <span className="badge amber">{event.spots_left} left</span>;
  return <span className="badge green">{event.spots_left} spots left</span>;
}

export default function EventCard({ event }) {
  const { day, month } = fmtDay(event.date_time);
  const color = categoryColor(event.category);
  return (
    <Link to={`/events/${event.id}`} className="card event-card" style={{ '--accent': color }}>
      <div className="date-tile">
        <span>{month}</span>
        <b>{day}</b>
      </div>
      <div className="event-body">
        <div className="row between">
          <span className="chip" style={{ color, borderColor: color }}>{event.category}</span>
          {event.is_registered && <span className="badge blue">Registered ✓</span>}
        </div>
        <h3>{event.title}</h3>
        <p className="muted small clamp">{event.description || 'No description yet.'}</p>
        <div className="meta">
          <span>🕒 {fmtDate(event.date_time)}</span>
          <span>📍 {event.venue}</span>
        </div>
        <div className="row between foot">
          <SpotsBadge event={event} />
          <span className="small muted">{event.registered_count}/{event.capacity} registered</span>
        </div>
      </div>
    </Link>
  );
}
