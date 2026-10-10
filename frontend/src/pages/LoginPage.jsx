import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Lock, Eye, EyeOff, LogIn } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ username: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (f) => (e) => { setForm(p => ({ ...p, [f]: e.target.value })); setError(''); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.username || !form.password) { setError('Please fill in all fields.'); return; }
    setLoading(true);
    try {
      await login(form);
      toast.success('Welcome back! 🎉');
      navigate('/explore');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-enter" style={{ minHeight: 'calc(100vh - 70px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{ width: '100%', maxWidth: 440 }}
      >
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <img src="/assets/findx-logo.png" alt="FindX" style={{ height: 60, margin: '0 auto 1rem' }} onError={e => e.target.style.display='none'} />
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Welcome Back</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>Sign in to your FindX account</p>
        </div>

        <div className="card" style={{ padding: '2rem' }}>
          {error && (
            <div style={{ background: '#fef2f2', border: '1px solid var(--red-500)', borderRadius: 'var(--radius-sm)', padding: '0.75rem 1rem', color: 'var(--red-500)', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
            <div className="form-group">
              <label className="form-label">Username or Email</label>
              <div className="form-input-icon">
                <User className="icon" size={18} />
                <input id="login-username" type="text" className="form-input" placeholder="Enter username or email" value={form.username} onChange={set('username')} autoComplete="username" />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="form-input-icon" style={{ position: 'relative' }}>
                <Lock className="icon" size={18} />
                <input id="login-password" type={showPass ? 'text' : 'password'} className="form-input" placeholder="Enter password" value={form.password} onChange={set('password')} style={{ paddingRight: '2.75rem' }} autoComplete="current-password" />
                <button type="button" onClick={() => setShowPass(s => !s)} style={{ position: 'absolute', right: '0.875rem', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn-primary" id="login-submit-btn" disabled={loading} style={{ width: '100%', justifyContent: 'center', padding: '1rem' }}>
              {loading ? <><div className="spinner" /> Signing in…</> : <><LogIn size={16} /> Sign In</>}
            </button>
          </form>

          <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'var(--purple-100)', borderRadius: 'var(--radius-sm)', fontSize: '0.82rem', color: 'var(--purple-700)' }}>
            <strong>Demo accounts:</strong> Try username <code>alex_dev</code> or any seeded user with password <code>FindX2024!</code>
          </div>

          <p style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: 'var(--purple-600)', fontWeight: 600 }}>Create Account</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
