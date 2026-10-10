import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth.jsx';
import { useToast } from '../toast.jsx';

function AuthForm({ mode }) {
  const isSignup = mode === 'signup';
  const { user, login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const from = location.state?.from || '/';
  if (user) return <Navigate to={from} replace />;

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const u = isSignup
        ? await register(form.name, form.email, form.password)
        : await login(form.email, form.password);
      toast(isSignup ? `Welcome, ${u.name.split(' ')[0]}!` : `Welcome back, ${u.name.split(' ')[0]}!`);
      navigate(u.role === 'admin' && from === '/' ? '/admin' : from, { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-wrap">
      <form className="card auth-card stack" onSubmit={submit} noValidate>
        <div>
          <h1>{isSignup ? 'Create your account' : 'Welcome back'}</h1>
          <p className="muted" style={{ margin: 0 }}>
            {isSignup ? 'Sign up to register for events.' : 'Log in to manage your registrations.'}
          </p>
        </div>

        {error && <div className="alert" role="alert">{error}</div>}

        {isSignup && (
          <div>
            <label htmlFor="name">Full name</label>
            <input id="name" autoComplete="name" required value={form.name} onChange={set('name')} />
          </div>
        )}
        <div>
          <label htmlFor="email">Email</label>
          <input id="email" type="email" autoComplete="email" required value={form.email} onChange={set('email')} />
        </div>
        <div>
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            autoComplete={isSignup ? 'new-password' : 'current-password'}
            required
            minLength={isSignup ? 8 : undefined}
            value={form.password}
            onChange={set('password')}
          />
          {isSignup && <div className="small muted" style={{ marginTop: 4 }}>At least 8 characters.</div>}
        </div>

        <button className="btn btn-primary" style={{ width: '100%' }} disabled={busy}>
          {busy ? 'Please wait…' : isSignup ? 'Sign up' : 'Log in'}
        </button>

        <p className="muted small" style={{ textAlign: 'center', margin: 0 }}>
          {isSignup ? (
            <>Already have an account? <Link to="/login" state={location.state}>Log in</Link></>
          ) : (
            <>New here? <Link to="/signup" state={location.state}>Create an account</Link></>
          )}
        </p>
      </form>
    </div>
  );
}

export const Login = () => <AuthForm mode="login" />;
export const Signup = () => <AuthForm mode="signup" />;
