import { Link, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import { RequireAuth } from './components/Guards.jsx';
import Home from './pages/Home.jsx';
import { Login, Signup } from './pages/AuthPages.jsx';
import EventDetail from './pages/EventDetail.jsx';
import MyEvents from './pages/MyEvents.jsx';
import Admin from './pages/Admin.jsx';

function NotFound() {
  return (
    <div className="container page">
      <div className="empty">
        <h2>Page not found</h2>
        <p className="muted">That page doesn't exist.</p>
        <Link className="btn btn-primary" to="/">Back to events</Link>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <>
      <a className="skip" href="#main">Skip to content</a>
      <Navbar />
      <main id="main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/events/:id" element={<EventDetail />} />
          <Route path="/my-events" element={<RequireAuth><MyEvents /></RequireAuth>} />
          <Route path="/admin" element={<RequireAuth admin><Admin /></RequireAuth>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <footer className="footer">
        <div className="container">Built for the GDG RBU recruitment drive 2026-27</div>
      </footer>
    </>
  );
}
