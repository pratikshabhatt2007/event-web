import { useCallback, useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../auth.jsx';
import { useToast } from '../toast.jsx';
import { SpotsBadge } from '../components/EventCard.jsx';
import { categoryColor, fmtDate, isPast } from '../utils.js';

export default function EventDetail() {
  const { id } = useParams();
  const { user, loading: authLoading } = useAuth();
  const location = useLocation();
  const toast = useToast();
  const [event, setEvent] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    return api(`/events/${id}`)
      .then((d) => setEvent(d.data))
      .catch((e) => setError(e.message));
  }, [id]);

  useEffect(() => {
    if (authLoading) return;
    setError('');
    load();
  }, [load, authLoading, user?.id]);

  const act = async (method, okMsg) => {
    setBusy(true);
    try {
      await api(`/events/${id}/register`, { method });
      toast(okMsg);
      await load();
    } catch (e) {
      toast(e.message, 'error');
      await load();
    } finally {
      setBusy(false);
    }
  };

  if (error) {
    return (
      <div className="container page">
        <div className="empty card">
          <h2>{error}</h2>
          <Link className="btn btn-primary" to="/">Back to events</Link>
        </div>
      </div>
    );
  }
  if (!event) return <div className="center-note">Loading…</div>;

  const past = isPast(event.date_time);
  const pct = Math.min(100, Math.round((event.registered_count / event.capacity) * 100));
  const color = categoryColor(event.category);

  let action;
  if (!user) {
    action = (
      <Link className="btn btn-primary" style={{ width: '100%' }} to="/login" state={{ from: location.pathname }}>
        Log in to register
      </Link>
    );
  } else if (event.is_registered) {
    action = (
      <div className="stack">
        <div className="badge blue" style={{ display: 'block', textAlign: 'center', padding: 10 }}>You're registered ✓</div>
        {!past && (
          <button className="btn btn-danger" style={{ width: '100%' }} disabled={busy} onClick={() => act('DELETE', 'Registration cancelled')}>
            Cancel registration
          </button>
        )}
        <Link className="btn btn-ghost" style={{ width: '100%' }} to="/my-events">View my ticket</Link>
      </div>
    );
  } else {
    action = (
      <button
        className="btn btn-primary"
        style={{ width: '100%' }}
        disabled={busy || past || event.is_full}
        onClick={() => act('POST', "You're in! See you there 🎉")}
      >
        {past ? 'Event has ended' : event.is_full ? 'Event is full' : busy ? 'Registering…' : 'Register now'}
      </button>
    );
  }

  return (
    <div className="container page">
      <Link to="/" className="back">← All events</Link>
      <div className="detail">
        <article className="card detail-main" style={{ '--accent': color }}>
          <div className="row wrap">
            <span className="chip" style={{ color, borderColor: color }}>{event.category}</span>
            <SpotsBadge event={event} />
          </div>
          <h1>{event.title}</h1>
          <div className="facts">
            <div className="fact"><b>When</b><span>{fmtDate(event.date_time)}</span></div>
            <div className="fact"><b>Where</b><span>{event.venue}</span></div>
            <div className="fact"><b>Capacity</b><span>{event.capacity} people</span></div>
          </div>
          <h3 style={{ marginTop: 24 }}>About this event</h3>
          <p className="desc">{event.description || 'No description has been added yet.'}</p>
        </article>

        <aside className="card side">
          <div className="row between">
            <b>Availability</b>
            <span className="small muted">{event.registered_count}/{event.capacity}</span>
          </div>
          <div className="meter" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Seats taken">
            <i className={event.is_full ? 'full' : ''} style={{ width: `${pct}%` }} />
          </div>
          <p className="small muted" style={{ margin: '0 0 16px' }}>
            {event.is_full ? 'No spots left.' : `${event.spots_left} spot${event.spots_left === 1 ? '' : 's'} remaining.`}
          </p>
          {action}
        </aside>
      </div>
    </div>
  );
}
