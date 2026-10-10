import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, User, LogOut, Settings, ChevronDown, Menu, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getPhotoUrl, getInitials } from '../api';
import toast from 'react-hot-toast';
import FindXLogo from './FindXLogo';

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [dropOpen, setDropOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const dropRef = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (dropRef.current && !dropRef.current.contains(e.target)) setDropOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      navigate('/');
    } catch { toast.error('Logout failed'); }
  };

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/explore', label: 'Explore' },
    { to: '/search', label: 'Search' },
    { to: '/how-it-works', label: 'How It Works' },
  ];

  const isActive = (path) => location.pathname === path;

  const photoUrl = getPhotoUrl(user?.photo_url);

  return (
    <nav className="navbar">
      <div className="container">
        <div className="navbar-inner">
          {/* Logo */}
          <Link to="/" className="navbar-logo" id="nav-logo-link">
            <FindXLogo size="md" />
          </Link>

          {/* Desktop nav links */}
          <ul className="navbar-links">
            {navLinks.map(l => (
              <li key={l.to}>
                <Link to={l.to} className={isActive(l.to) ? 'active' : ''}>{l.label}</Link>
              </li>
            ))}
          </ul>

          {/* Actions */}
          <div className="navbar-actions">
            <Link to="/search" className="btn-ghost" style={{ padding: '0.5rem' }}>
              <Search size={18} />
            </Link>

            {user ? (
              <div ref={dropRef} style={{ position: 'relative' }}>
                <button className="navbar-avatar-btn" onClick={() => setDropOpen(o => !o)} id="nav-user-btn">
                  {photoUrl ? (
                    <img src={photoUrl} alt={user.display_name} className="avatar avatar-sm" style={{ width: 32, height: 32 }} />
                  ) : (
                    <div className="avatar avatar-sm" style={{ width: 32, height: 32, fontSize: '0.75rem', background: 'linear-gradient(135deg, #ec4899, #8b5cf6)' }}>
                      {getInitials(user.display_name)}
                    </div>
                  )}
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {user.username}
                  </span>
                  <ChevronDown size={14} style={{ color: 'var(--text-muted)', transition: 'transform 0.2s', transform: dropOpen ? 'rotate(180deg)' : 'none' }} />
                </button>
                <AnimatePresence>
                  {dropOpen && (
                    <motion.div
                      className="navbar-dropdown"
                      initial={{ opacity: 0, y: -8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.96 }}
                      transition={{ duration: 0.15 }}
                    >
                      <Link to={`/profile/${user.username}`} onClick={() => setDropOpen(false)} id="nav-profile-link">
                        <User size={16} /> My Profile
                      </Link>
                      <Link to="/settings" onClick={() => setDropOpen(false)} id="nav-settings-link">
                        <Settings size={16} /> Edit Profile
                      </Link>
                      <button onClick={handleLogout} id="nav-logout-btn">
                        <LogOut size={16} /> Logout
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <>
                <Link to="/login" className="btn-ghost" id="nav-signin-btn">Sign In</Link>
                <Link to="/register" className="btn-primary" id="nav-getstarted-btn" style={{ padding: '0.6rem 1.25rem' }}>
                  Get Started
                </Link>
              </>
            )}

            {/* Mobile menu toggle */}
            <button
              style={{ background: 'none', border: 'none', display: 'none', color: 'var(--text-primary)' }}
              className="mobile-menu-btn"
              onClick={() => setMobileOpen(o => !o)}
              id="mobile-menu-toggle"
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile links */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              style={{ overflow: 'hidden', borderTop: '1px solid var(--border-light)', paddingBottom: '1rem' }}
            >
              {navLinks.map(l => (
                <Link
                  key={l.to}
                  to={l.to}
                  onClick={() => setMobileOpen(false)}
                  style={{ display: 'block', padding: '0.75rem 1rem', fontWeight: 500, color: isActive(l.to) ? 'var(--purple-600)' : 'var(--text-secondary)' }}
                >
                  {l.label}
                </Link>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
}
