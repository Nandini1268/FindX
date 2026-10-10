import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Zap, Users, Code2, ArrowRight, ChevronRight, Hash } from 'lucide-react';

const FLOATING_PROFILES = [
  { username: 'alex_dev', name: 'Alex Rivera', role: 'Developer', photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=56&h=56&fit=crop&crop=face' },
  { username: 'sara_designs', name: 'Sara Patel', role: 'Designer', photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=56&h=56&fit=crop&crop=face' },
  { username: 'mike_creates', name: 'Mike Thompson', role: 'Creator', photo: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=56&h=56&fit=crop&crop=face' },
  { username: 'priya_learns', name: 'Priya Sharma', role: 'Student', photo: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=56&h=56&fit=crop&crop=face' },
  { username: 'james_code', name: 'James Wilson', role: 'Engineer', photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=56&h=56&fit=crop&crop=face' },
];

const FEATURES = [
  { icon: '⚡', color: '#fef3c7', iconColor: '#d97706', title: 'Hash Table Search', desc: 'O(1) average-case lookup using DJ2B hashing and separate chaining.' },
  { icon: '👁️', color: '#ede9fe', iconColor: '#7c3aed', title: 'Live Visualization', desc: 'Watch bucket selection, node traversal, and comparisons animated in real time.' },
  { icon: '📊', color: '#dbeafe', iconColor: '#2563eb', title: 'Performance Metrics', desc: 'Compare hash search vs. linear search with real comparison counts.' },
  { icon: '🔐', color: '#fdf2f8', iconColor: '#db2777', title: 'Real Profiles', desc: 'Register, upload a photo, and make yourself searchable by username.' },
];

export default function LandingPage() {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    else navigate('/search');
  };

  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5, ease: 'easeOut' } }),
  };

  return (
    <div className="page-enter">
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="hero">
        <div className="hero-bg">
          <div className="hero-orb hero-orb-1" />
          <div className="hero-orb hero-orb-2" />
          <div className="hero-orb hero-orb-3" />
        </div>

        <div className="container">
          <div className="hero-content">
            {/* Left column */}
            <div>
              <motion.div className="hero-tag" variants={fadeUp} initial="hidden" animate="visible" custom={0}>
                <Hash size={14} /> DSA Algorithm Visualizer
              </motion.div>

              <motion.h1 className="hero-title" variants={fadeUp} initial="hidden" animate="visible" custom={1}>
                Find People.{' '}
                <span className="gradient-text">See How It Works.</span>
              </motion.h1>

              <motion.p className="hero-subtitle" variants={fadeUp} initial="hidden" animate="visible" custom={2}>
                FindX is an interactive platform that lets you search user profiles using a real
                C-powered hash table with separate chaining — and watch every step of the algorithm
                unfold in real time.
              </motion.p>

              <motion.form className="hero-search" onSubmit={handleSearch} variants={fadeUp} initial="hidden" animate="visible" custom={3}>
                <div style={{ position: 'relative', flex: 1 }}>
                  <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--purple-500)', pointerEvents: 'none' }} />
                  <input
                    id="hero-search-input"
                    type="text"
                    className="hero-search-input"
                    style={{ paddingLeft: '2.75rem' }}
                    placeholder="Search a username, e.g. alex_dev"
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                  />
                </div>
                <button type="submit" className="btn-primary" id="hero-search-btn">
                  <Search size={16} /> Find
                </button>
              </motion.form>

              <motion.div className="hero-features" variants={fadeUp} initial="hidden" animate="visible" custom={4}>
                <div className="hero-feature"><div className="hero-feature-dot" />Hash Table Engine</div>
                <div className="hero-feature"><div className="hero-feature-dot" />Real-time Visualization</div>
                <div className="hero-feature"><div className="hero-feature-dot" />C-Powered Backend</div>
              </motion.div>

              <motion.div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem', flexWrap: 'wrap' }} variants={fadeUp} initial="hidden" animate="visible" custom={5}>
                <Link to="/register" className="btn-primary" id="hero-getstarted-btn">
                  Get Started <ArrowRight size={16} />
                </Link>
                <Link to="/explore" className="btn-secondary" id="hero-explore-btn">
                  Explore Users <ChevronRight size={16} />
                </Link>
              </motion.div>
            </div>

            {/* Right column — floating profile cards */}
            <motion.div className="hero-visual" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3, duration: 0.6 }}>
              <div className="floating-cards">
                {FLOATING_PROFILES.map((p, i) => (
                  <motion.div
                    key={p.username}
                    className="float-card"
                    onClick={() => navigate(`/search?q=${p.username}`)}
                    whileHover={{ scale: 1.05, boxShadow: '0 12px 40px rgba(109,40,217,0.2)' }}
                    style={{ cursor: 'pointer' }}
                  >
                    <img
                      src={p.photo}
                      alt={p.name}
                      style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--purple-200)' }}
                      onError={e => { e.target.style.display='none'; }}
                    />
                    <div>
                      <div className="float-card-name">{p.name}</div>
                      <div className="float-card-role">@{p.username} · {p.role}</div>
                    </div>
                  </motion.div>
                ))}

                {/* Center hash visualization mini preview */}
                <motion.div
                  style={{
                    position: 'absolute', top: '20%', left: '20%', right: '10%',
                    background: 'white', borderRadius: 'var(--radius-lg)',
                    padding: '1.25rem', boxShadow: 'var(--shadow-xl)',
                    border: '1px solid var(--border-light)',
                  }}
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
                >
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--purple-600)', marginBottom: '0.75rem' }}>
                    🔍 Hash Table Search
                  </div>
                  {[0,3,8].map(idx => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '4px' }}>
                      <div style={{
                        width: 28, height: 28, borderRadius: 6,
                        background: idx === 3 ? 'var(--purple-600)' : 'var(--purple-100)',
                        color: idx === 3 ? 'white' : 'var(--purple-700)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.7rem', fontWeight: 700,
                      }}>{idx}</div>
                      {idx === 3 ? (
                        <div style={{ padding: '3px 8px', background: '#f0fdf4', border: '1.5px solid #22c55e', borderRadius: 6, fontSize: '0.7rem', fontWeight: 600, color: '#16a34a' }}>
                          alex_dev ✓
                        </div>
                      ) : (
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>—</div>
                      )}
                    </div>
                  ))}
                  <div style={{ marginTop: '0.5rem', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    1 comparison · O(1) avg
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>

          {/* Feature cards */}
          <motion.div
            className="features-grid"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            {FEATURES.map(f => (
              <div key={f.title} className="feature-card">
                <div className="feature-card-icon" style={{ background: f.color }}>
                  <span style={{ fontSize: '1.25rem' }}>{f.icon}</span>
                </div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── CTA strip ────────────────────────────────────────── */}
      <section style={{ background: 'var(--gradient-btn)', padding: '4rem 0', textAlign: 'center' }}>
        <div className="container">
          <h2 style={{ color: 'white', fontSize: '2rem', fontWeight: 800, marginBottom: '1rem' }}>
            Ready to explore the algorithm?
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.85)', marginBottom: '2rem', fontSize: '1.05rem' }}>
            Search for any username and watch the hash table come alive.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/search" className="btn-primary" id="cta-search-btn" style={{ background: 'white', color: 'var(--purple-600)', boxShadow: '0 4px 15px rgba(0,0,0,0.2)' }}>
              <Search size={16} /> Try the Search
            </Link>
            <Link to="/explore" className="btn-secondary" id="cta-explore-btn" style={{ border: '2px solid rgba(255,255,255,0.5)', color: 'white', background: 'rgba(255,255,255,0.1)' }}>
              <Users size={16} /> Explore Users
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────── */}
      <footer style={{ background: 'var(--text-primary)', color: 'rgba(255,255,255,0.6)', padding: '2rem 0', textAlign: 'center' }}>
        <div className="container">
          <p style={{ fontSize: '0.875rem' }}>
            © 2024 FindX — Hash Table Visualizer. Built with React + Node.js + C.
          </p>
        </div>
      </footer>
    </div>
  );
}
