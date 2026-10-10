import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Clock, ArrowRight, Hash, Sparkles } from 'lucide-react';

const EXAMPLES = ['alex_dev', 'sara_designs', 'priya_learns', 'mike_creates', 'james_code'];

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [recentSearches, setRecentSearches] = useState(() => {
    try { return JSON.parse(localStorage.getItem('findx_recent') || '[]'); } catch { return []; }
  });
  const [error, setError] = useState('');

  useEffect(() => {
    const q = searchParams.get('q');
    if (q) { setQuery(q); }
  }, [searchParams]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) { setError('Please enter a username to search.'); return; }
    if (q.length > 50) { setError('Username too long (max 50 chars).'); return; }
    setError('');

    // Save to recents
    const updated = [q, ...recentSearches.filter(r => r !== q)].slice(0, 6);
    setRecentSearches(updated);
    localStorage.setItem('findx_recent', JSON.stringify(updated));

    navigate(`/hash-calculation?q=${encodeURIComponent(q)}`);
  };

  const tryExample = (username) => { setQuery(username); setError(''); };
  const clearRecent = () => { setRecentSearches([]); localStorage.removeItem('findx_recent'); };

  return (
    <div className="page-enter search-page">
      <div className="container">
        {/* Step progress */}
        <div className="step-progress">
          {['Search', 'Hash Calculation', 'Visualization', 'Result'].map((label, i) => (
            <React.Fragment key={label}>
              <div className="step-item">
                <div className={`step-circle${i === 0 ? ' active' : ''}`}>{i + 1}</div>
                <div className={`step-label${i === 0 ? ' active' : ''}`}>{label}</div>
              </div>
              {i < 3 && <div className="step-connector" />}
            </React.Fragment>
          ))}
        </div>

        {/* Hero */}
        <div className="search-hero">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'var(--purple-100)', color: 'var(--purple-700)', padding: '0.35rem 1rem', borderRadius: 'var(--radius-full)', fontSize: '0.8rem', fontWeight: 600, marginBottom: '1.5rem' }}>
              <Hash size={14} /> Hash Table Search Engine
            </div>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '0.75rem' }}>
              Search a <span className="gradient-text">Username</span>
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', marginBottom: '2rem' }}>
              Enter a username below and watch the hash table algorithm find them in real time.
            </p>
          </motion.div>

          <motion.form onSubmit={handleSubmit} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.4 }}>
            <div className="search-bar-wrap" style={{ marginBottom: '1rem', display: 'flex', gap: '0.75rem', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ position: 'relative', flex: 1, maxWidth: 560 }}>
                <Search size={20} style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--purple-500)', pointerEvents: 'none', zIndex: 2 }} />
                <input
                  id="search-main-input"
                  type="text"
                  className="search-input-big"
                  style={{ paddingLeft: '3.25rem', width: '100%' }}
                  placeholder="Enter a username, e.g. alex_dev"
                  value={query}
                  onChange={e => { setQuery(e.target.value); setError(''); }}
                  autoFocus
                />
              </div>
              <button type="submit" className="btn-primary" id="search-go-btn" style={{ padding: '1.1rem 2rem', fontSize: '1rem' }}>
                <Search size={18} /> Find <ArrowRight size={16} />
              </button>
            </div>
            {error && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="error-msg" style={{ textAlign: 'center', fontSize: '0.9rem' }}>
                {error}
              </motion.p>
            )}
          </motion.form>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', maxWidth: 700, margin: '0 auto' }}>
          {/* Example usernames */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25 }}>
            <div className="card" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                <Sparkles size={16} color="var(--purple-500)" /> Try these usernames
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {EXAMPLES.map(ex => (
                  <button
                    key={ex}
                    id={`example-${ex}`}
                    onClick={() => tryExample(ex)}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--purple-100)', border: 'none', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-sm)', cursor: 'pointer', color: 'var(--purple-700)', fontWeight: 500, fontSize: '0.875rem', transition: 'var(--transition)', textAlign: 'left' }}
                    onMouseEnter={e => e.target.style.background = 'var(--purple-200)'}
                    onMouseLeave={e => e.target.style.background = 'var(--purple-100)'}
                  >
                    <Hash size={14} /> @{ex}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Recent searches */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
            <div className="card" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                  <Clock size={16} color="var(--text-muted)" /> Recent Searches
                </div>
                {recentSearches.length > 0 && (
                  <button onClick={clearRecent} style={{ background: 'none', border: 'none', fontSize: '0.75rem', color: 'var(--text-muted)', cursor: 'pointer' }}>
                    Clear
                  </button>
                )}
              </div>
              {recentSearches.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontStyle: 'italic' }}>No recent searches</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {recentSearches.map(r => (
                    <button
                      key={r}
                      onClick={() => { setQuery(r); }}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#f9f9ff', border: '1px solid var(--border-light)', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-sm)', cursor: 'pointer', color: 'var(--text-secondary)', fontWeight: 500, fontSize: '0.875rem', transition: 'var(--transition)', textAlign: 'left' }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--purple-400)'}
                      onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-light)'}
                    >
                      <Clock size={13} /> @{r}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Info card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} style={{ marginTop: '2rem', maxWidth: 700, margin: '2rem auto 0' }}>
          <div style={{ background: 'var(--gradient-soft)', border: '1px solid var(--purple-200)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', textAlign: 'center' }}>
            <h3 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.5rem' }}>⚡ How the Search Works</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: 1.7 }}>
              The username is hashed using the DJ2B algorithm into a bucket index (0–15). The C engine then
              traverses the linked list at that bucket, comparing nodes until it finds a match or reaches the end.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
