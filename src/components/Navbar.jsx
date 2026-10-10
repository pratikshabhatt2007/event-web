import { useEffect, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth.jsx';

function useTheme() {
  const [theme, setTheme] = useState(() => {
    const saved = document.documentElement.getAttribute('data-theme');
    if (saved) return saved;
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try {
      localStorage.setItem('theme', theme);
    } catch {
      /* ignore */
    }
  }, [theme]);
  return [theme, () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))];
}

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [theme, toggle] = useTheme();

  return (
    <header className="nav">
      <div className="container nav-inner">
        <Link to="/" className="brand">
          <span className="dots" aria-hidden="true">
            <i style={{ background: '#4285f4' }} />
            <i style={{ background: '#ea4335' }} />
            <i style={{ background: '#f9ab00' }} />
            <i style={{ background: '#34a853' }} />
          </span>
          <span>GDG RBU <b>Events</b></span>
        </Link>

        <nav className="nav-links">
          <NavLink to="/" end>Events</NavLink>
          {user && <NavLink to="/my-events">My events</NavLink>}
          {user?.role === 'admin' && <NavLink to="/admin">Admin</NavLink>}
        </nav>

        <div className="nav-actions">
          <button className="icon-btn" onClick={toggle} aria-label="Toggle dark mode" title="Toggle dark mode">
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
          {user ? (
            <>
              <span className="who" title={user.email}>{user.name.split(' ')[0]}</span>
              <button
                className="btn btn-ghost"
                onClick={() => {
                  logout();
                  navigate('/');
                }}
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link className="btn btn-ghost" to="/login">Log in</Link>
              <Link className="btn btn-primary" to="/signup">Sign up</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
