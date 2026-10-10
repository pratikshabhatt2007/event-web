import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import { useToast } from '../toast.jsx';
import Modal from '../components/Modal.jsx';
import { fmtDate, toLocalInput } from '../utils.js';

const EMPTY = { title: '', description: '', date_time: '', venue: '', capacity: 50, category: '' };

function EventForm({ initial, onSaved, onClose }) {
  const toast = useToast();
  const editing = Boolean(initial?.id);
  const [form, setForm] = useState(
    editing ? { ...initial, date_time: toLocalInput(initial.date_time) } : EMPTY,
  );
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.date_time) return setError('Please choose a date and time');
    setBusy(true);
    try {
      const body = {
        title: form.title,
        description: form.description,
        date_time: new Date(form.date_time).toISOString(),
        venue: form.venue,
        capacity: Number(form.capacity),
        category: form.category,
      };
      if (editing) await api(`/events/${initial.id}`, { method: 'PUT', body });
      else await api('/events', { method: 'POST', body });
      toast(editing ? 'Event updated' : 'Event created');
      onSaved();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal title={editing ? 'Edit event' : 'New event'} onClose={onClose} wide>
      <form onSubmit={submit} className="stack" noValidate>
        {error && <div className="alert" role="alert">{error}</div>}
        <div className="form-grid">
          <div className="full">
            <label htmlFor="f-title">Title</label>
            <input id="f-title" required value={form.title} onChange={set('title')} />
          </div>
          <div className="full">
            <label htmlFor="f-desc">Description</label>
            <textarea id="f-desc" value={form.description} onChange={set('description')} />
          </div>
          <div>
            <label htmlFor="f-date">Date &amp; time</label>
            <input id="f-date" type="datetime-local" required value={form.date_time} onChange={set('date_time')} />
          </div>
          <div>
            <label htmlFor="f-venue">Venue</label>
            <input id="f-venue" required value={form.venue} onChange={set('venue')} />
          </div>
          <div>
            <label htmlFor="f-cat">Category</label>
            <input id="f-cat" required placeholder="Workshop, Hackathon…" value={form.category} onChange={set('category')} />
          </div>
          <div>
            <label htmlFor="f-cap">Capacity</label>
            <input id="f-cap" type="number" min="1" required value={form.capacity} onChange={set('capacity')} />
          </div>
        </div>
        <div className="row" style={{ justifyContent: 'flex-end' }}>
          <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" disabled={busy}>{busy ? 'Saving…' : editing ? 'Save changes' : 'Create event'}</button>
        </div>
      </form>
    </Modal>
  );
}

function Attendees({ event, onClose }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  useEffect(() => {
    api(`/events/${event.id}/registrations`).then(setData).catch((e) => setError(e.message));
  }, [event.id]);

  const csv = () => {
    const rows = [['Name', 'Email', 'Registered at'], ...data.data.map((r) => [r.name, r.email, r.created_at])];
    const text = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([text], { type: 'text/csv' }));
    a.download = `${event.title.replace(/\W+/g, '-')}-attendees.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <Modal title={`Attendees — ${event.title}`} onClose={onClose} wide>
      {error && <div className="alert">{error}</div>}
      {!data && !error && <div className="muted">Loading…</div>}
      {data && (data.total === 0 ? (
        <p className="muted">Nobody has registered yet.</p>
      ) : (
        <>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Name</th><th>Email</th><th>Registered</th></tr></thead>
              <tbody>
                {data.data.map((r) => (
                  <tr key={r.id}><td>{r.name}</td><td>{r.email}</td><td>{fmtDate(r.created_at)}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="row between" style={{ marginTop: 14 }}>
            <span className="muted small">{data.total} attendee{data.total === 1 ? '' : 's'}</span>
            <button className="btn btn-ghost btn-sm" onClick={csv}>Download CSV</button>
          </div>
        </>
      ))}
    </Modal>
  );
}

function Analytics() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  useEffect(() => {
    api('/admin/analytics').then((d) => setData(d.data)).catch((e) => setError(e.message));
  }, []);
  if (error) return <div className="alert">{error}</div>;
  if (!data) return <div className="center-note">Loading…</div>;
  const t = data.totals;
  return (
    <>
      <div className="stats">
        {[['Users', t.users], ['Events', t.events], ['Upcoming', t.upcoming_events], ['Registrations', t.registrations]].map(([l, v]) => (
          <div className="card stat" key={l}><b>{v}</b><span className="muted">{l}</span></div>
        ))}
      </div>
      <div className="card table-wrap" style={{ marginBottom: 20 }}>
        <table>
          <caption style={{ textAlign: 'left', padding: '14px 14px 0', fontWeight: 700 }}>Most popular events</caption>
          <thead><tr><th>Event</th><th>Registered</th><th>Filled</th></tr></thead>
          <tbody>
            {data.top_events.length === 0 && <tr><td colSpan="3" className="muted">No events yet.</td></tr>}
            {data.top_events.map((e) => (
              <tr key={e.id}>
                <td><Link to={`/events/${e.id}`}>{e.title}</Link></td>
                <td>{e.registered}/{e.capacity}</td>
                <td><div className="row"><div className="bar" style={{ flex: 1 }}><i style={{ width: `${e.fill_percent}%` }} /></div><span className="small">{e.fill_percent}%</span></div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="card table-wrap">
        <table>
          <caption style={{ textAlign: 'left', padding: '14px 14px 0', fontWeight: 700 }}>By category</caption>
          <thead><tr><th>Category</th><th>Events</th><th>Registrations</th></tr></thead>
          <tbody>
            {data.by_category.map((c) => (
              <tr key={c.category}><td>{c.category}</td><td>{c.events}</td><td>{c.registrations}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

export default function Admin() {
  const toast = useToast();
  const [tab, setTab] = useState('events');
  const [rows, setRows] = useState(null);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(null); // null | {} (new) | event
  const [viewing, setViewing] = useState(null);

  const load = useCallback(() => {
    api('/events', { params: { limit: 100, sort: 'date_desc' } })
      .then((d) => setRows(d.data))
      .catch((e) => setError(e.message));
  }, []);
  useEffect(load, [load]);

  const remove = async (ev) => {
    if (!window.confirm(`Delete "${ev.title}"? ${ev.registered_count} registration(s) will be removed too.`)) return;
    try {
      await api(`/events/${ev.id}`, { method: 'DELETE' });
      toast('Event deleted');
      load();
    } catch (e) {
      toast(e.message, 'error');
    }
  };

  return (
    <div className="container page">
      <div className="row between wrap">
        <div>
          <h1>Admin</h1>
          <p className="muted" style={{ margin: '4px 0 0' }}>Create and manage events.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setEditing({})}>+ New event</button>
      </div>

      <div className="tabs" role="tablist">
        <button role="tab" aria-selected={tab === 'events'} className={`tab ${tab === 'events' ? 'active' : ''}`} onClick={() => setTab('events')}>Events</button>
        <button role="tab" aria-selected={tab === 'analytics'} className={`tab ${tab === 'analytics' ? 'active' : ''}`} onClick={() => setTab('analytics')}>Analytics</button>
      </div>

      {tab === 'analytics' ? <Analytics /> : (
        <>
          {error && <div className="alert">{error}</div>}
          {!rows && !error && <div className="center-note">Loading…</div>}
          {rows && rows.length === 0 && (
            <div className="empty card">
              <h2>No events yet</h2>
              <button className="btn btn-primary" onClick={() => setEditing({})}>Create the first event</button>
            </div>
          )}
          {rows && rows.length > 0 && (
            <div className="card table-wrap">
              <table>
                <thead><tr><th>Event</th><th>When</th><th>Category</th><th>Registered</th><th /></tr></thead>
                <tbody>
                  {rows.map((e) => (
                    <tr key={e.id}>
                      <td><Link to={`/events/${e.id}`}><b>{e.title}</b></Link><div className="small muted">{e.venue}</div></td>
                      <td>{fmtDate(e.date_time)}</td>
                      <td>{e.category}</td>
                      <td>{e.registered_count}/{e.capacity}</td>
                      <td>
                        <div className="actions">
                          <button className="btn btn-ghost btn-sm" onClick={() => setViewing(e)}>Attendees</button>
                          <button className="btn btn-ghost btn-sm" onClick={() => setEditing(e)}>Edit</button>
                          <button className="btn btn-danger btn-sm" onClick={() => remove(e)}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {editing && (
        <EventForm
          initial={editing}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); load(); }}
        />
      )}
      {viewing && <Attendees event={viewing} onClose={() => setViewing(null)} />}
    </div>
  );
}
