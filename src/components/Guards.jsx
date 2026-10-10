import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../auth.jsx';

export function RequireAuth({ children, admin = false }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <div className="center-note">Loading…</div>;
  if (!user) return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  if (admin && user.role !== 'admin') {
    return (
      <div className="container page">
        <div className="empty">
          <h2>Admins only</h2>
          <p className="muted">You don't have permission to view this page.</p>
        </div>
      </div>
    );
  }
  return children;
}
