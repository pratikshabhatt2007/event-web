import { useEffect, useState } from 'react';
import { api } from '../api.js';
import { useAuth } from '../auth.jsx';
import EventCard from '../components/EventCard.jsx';

export default function Home() {
  const { user, loading: authLoading } = useAuth();
  const [search, setSearch] = useState('');
  const [q, setQ] = useState('');
  const [category, setCategory] = useState('');
  const [available, setAvailable] = useState(false);
  const [showPast, setShowPast] = useState(false);
  const [sort, setSort] = useState('date_asc');
  const [page, setPage] = useState(1);

  const [categories, setCategories] = useState([]);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  // debounce the search box
  useEffect(() => {
    const t = setTimeout(() => {
      setQ(search.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    api('/events/categories').then((d) => setCategories(d.data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (authLoading) return; // wait so "Registered" badges are accurate
    let cancelled = false;
    setLoading(true);
    setError('');
    api('/events', {
      params: {
        q,
        category,
        available: available ? 'true' : undefined,
        upcoming: showPast ? undefined : 'true',
        sort,
        page,
        limit: 9,
      },
    })
      .then((d) => !cancelled && setResult(d))
      .catch((e) => !cancelled && setError(e.message))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [q, category, available, showPast, sort, page, authLoading, user?.id]);

  const reset = () => {
    setSearch('');
    setCategory('');
    setAvailable(false);
    setShowPast(false);
    setSort('date_asc');
    setPage(1);
  };

  return (
    <div className="container">
      <section className="hero">
        <h1>Find your next event</h1>
        <p>Workshops, hackathons and meetups from GDG RBU. Pick an event and grab your spot before it fills up.</p>
      </section>

      <section className="card filters" aria-label="Search and filters">
        <div className="wide-field">
          <label htmlFor="search">Search</label>
          <input id="search" type="search" placeholder="Title, description or venue…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div>
          <label htmlFor="cat">Category</label>
          <select id="cat" value={category} onChange={(e) => { setCategory(e.target.value); setPage(1); }}>
            <option value="">All categories</option>
            {categories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="sort">Sort by</label>
          <select id="sort" value={sort} onChange={(e) => { setSort(e.target.value); setPage(1); }}>
            <option value="date_asc">Soonest first</option>
            <option value="date_desc">Latest first</option>
            <option value="newest">Recently added</option>
          </select>
        </div>
        <div className="stack" style={{ marginTop: 0 }}>
          <label className="check">
            <input type="checkbox" checked={available} onChange={(e) => { setAvailable(e.target.checked); setPage(1); }} />
            Spots available
          </label>
        </div>
        <label className="check wide-field" style={{ gridColumn: '1 / -1', height: 'auto' }}>
          <input type="checkbox" checked={showPast} onChange={(e) => { setShowPast(e.target.checked); setPage(1); }} />
          Include past events
        </label>
      </section>

      {error && <div className="alert" role="alert">{error}</div>}

      {loading && !result ? (
        <div className="grid">{Array.from({ length: 6 }).map((_, i) => <div className="skeleton" key={i} />)}</div>
      ) : result && result.data.length === 0 ? (
        <div className="empty card">
          <h2>No events found</h2>
          <p className="muted">Try a different search or clear the filters.</p>
          <button className="btn btn-ghost" onClick={reset}>Clear filters</button>
        </div>
      ) : (
        result && (
          <div className="grid" style={{ opacity: loading ? 0.6 : 1, transition: 'opacity .15s' }}>
            {result.data.map((e) => <EventCard key={e.id} event={e} />)}
          </div>
        )
      )}

      {result && result.pagination.total_pages > 1 && (
        <nav className="pager" aria-label="Pagination">
          <button className="btn btn-ghost" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>← Previous</button>
          <span className="muted">Page {result.pagination.page} of {result.pagination.total_pages}</span>
          <button className="btn btn-ghost" disabled={page >= result.pagination.total_pages} onClick={() => setPage((p) => p + 1)}>Next →</button>
        </nav>
      )}
      <div style={{ height: 48 }} />
    </div>
  );
}
