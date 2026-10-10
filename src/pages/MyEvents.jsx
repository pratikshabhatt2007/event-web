import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, fetchQr } from '../api.js';
import { useToast } from '../toast.jsx';
import Modal from '../components/Modal.jsx';
import { categoryColor, fmtDate, isPast } from '../utils.js';

export default function MyEvents() {
  const toast = useToast();
  const [rows, setRows] = useState(null);
  const [error, setError] = useState('');
  const [qr, setQr] = useState(null); // { title, url } | { title, loading }
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(() => {
    api('/me/registrations')
      .then((d) => setRows(d.data))
      .catch((e) => setError(e.message));
  }, []);
  useEffect(load, [load]);

  useEffect(() => () => qr?.url && URL.revokeObjectURL(qr.url), [qr?.url]);

  const showQr = async (r) => {
    setQr({ title: r.title, loading: true });
    try {
      setQr({ title: r.title, url: await fetchQr(r.registration_id), when: r.date_time });
    } catch (e) {
      setQr(null);
      toast(e.message, 'error');
    }
  };

  const cancel = async (r) => {
    if (!window.confirm(`Cancel your registration for "${r.title}"?`)) return;
    setBusyId(r.id);
    try {
      await api(`/events/${r.id}/register`, { method: 'DELETE' });
      toast('Registration cancelled');
      load();
    } catch (e) {
      toast(e.message, 'error');
    } finally {
      setBusyId(null);
    }
  };

  const upcoming = rows?.filter((r) => !isPast(r.date_time)) ?? [];
  const past = rows?.filter((r) => isPast(r.date_time)) ?? [];

  const Item = ({ r, old }) => (
    <div className="card list-item" style={{ borderLeft: `5px solid ${categoryColor(r.category)}`, opacity: old ? 0.75 : 1 }}>
      <div className="grow">
        <h3><Link className="title" to={`/events/${r.id}`}>{r.title}</Link></h3>
        <div className="small muted">🕒 {fmtDate(r.date_time)} · 📍 {r.venue}</div>
      </div>
      <span className="chip" style={{ color: categoryColor(r.category), borderColor: categoryColor(r.category) }}>{r.category}</span>
      <div className="actions">
        <button className="btn btn-ghost btn-sm" onClick={() => showQr(r)}>🎟 Ticket</button>
        {!old && (
          <button className="btn btn-danger btn-sm" disabled={busyId === r.id} onClick={() => cancel(r)}>Cancel</button>
        )}
      </div>
    </div>
  );

  return (
    <div className="container page">
      <h1>My events</h1>
      <p className="muted">Everything you've registered for. Show the ticket QR code at the door.</p>

      {error && <div className="alert" role="alert">{error}</div>}
      {!rows && !error && <div className="center-note">Loading…</div>}

      {rows && rows.length === 0 && (
        <div className="empty card">
          <h2>No registrations yet</h2>
          <p className="muted">Browse events and register for one you like.</p>
          <Link className="btn btn-primary" to="/">Browse events</Link>
        </div>
      )}

      {upcoming.length > 0 && (
        <section style={{ marginTop: 20 }}>
          <h2 style={{ fontSize: '1.15rem', marginBottom: 12 }}>Upcoming ({upcoming.length})</h2>
          <div className="list">{upcoming.map((r) => <Item key={r.registration_id} r={r} />)}</div>
        </section>
      )}
      {past.length > 0 && (
        <section style={{ marginTop: 28 }}>
          <h2 style={{ fontSize: '1.15rem', marginBottom: 12 }}>Past ({past.length})</h2>
          <div className="list">{past.map((r) => <Item key={r.registration_id} r={r} old />)}</div>
        </section>
      )}

      {qr && (
        <Modal title="Your ticket" onClose={() => setQr(null)}>
          <div className="qr">
            <b>{qr.title}</b>
            {qr.loading ? <div className="muted">Generating…</div> : <img src={qr.url} alt={`QR code ticket for ${qr.title}`} />}
            <span className="small muted">Show this code at check-in.</span>
          </div>
        </Modal>
      )}
    </div>
  );
}
