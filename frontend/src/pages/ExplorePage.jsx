import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Filter } from 'lucide-react';
import { usersAPI, getPhotoUrl, getInitials } from '../api';
import Avatar from '../components/Avatar';

const CATEGORIES = ['All', 'Developer', 'Designer', 'Student', 'Creator'];

export default function ExplorePage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const navigate = useNavigate();

  useEffect(() => {
    loadUsers();
  }, [category]);

  const loadUsers = async (q = '') => {
    setLoading(true);
    try {
      const res = await usersAPI.list({ category: category !== 'All' ? category : undefined, search: q || undefined });
      setUsers(res.data.users);
    } catch {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    loadUsers(search);
  };

  const handleCardClick = (username) => navigate(`/search?q=${username}`);

  return (
    <div className="page-enter" style={{ minHeight: 'calc(100vh - 70px)', padding: '2.5rem 0' }}>
      <div className="container">
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h1 style={{ fontSize: '2.25rem', fontWeight: 800, marginBottom: '0.75rem' }}>
            Explore <span className="gradient-text">People</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem', maxWidth: 480, margin: '0 auto 1.5rem' }}>
            Discover developers, designers, students, and creators. Click any card to search with the hash table.
          </p>

          {/* Search bar */}
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.75rem', maxWidth: 480, margin: '0 auto' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
              <input
                id="explore-search"
                type="text"
                className="form-input"
                style={{ paddingLeft: '2.75rem' }}
                placeholder="Search users…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <button type="submit" className="btn-primary" id="explore-search-btn" style={{ padding: '0.75rem 1.25rem' }}>
              <Search size={16} />
            </button>
          </form>
        </div>

        {/* Category filters */}
        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '2rem' }}>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              id={`filter-${cat.toLowerCase()}`}
              onClick={() => setCategory(cat)}
              className={category === cat ? 'btn-primary' : 'btn-ghost'}
              style={{ padding: '0.5rem 1.25rem', fontSize: '0.875rem' }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* User grid */}
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.5rem' }}>
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
                <div className="shimmer" style={{ width: 72, height: 72, borderRadius: '50%', margin: '0 auto 1rem' }} />
                <div className="shimmer" style={{ height: 16, width: '60%', margin: '0 auto 0.5rem', borderRadius: 8 }} />
                <div className="shimmer" style={{ height: 12, width: '80%', margin: '0 auto', borderRadius: 8 }} />
              </div>
            ))}
          </div>
        ) : users.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
            <p style={{ fontSize: '1.1rem' }}>No users found.</p>
          </div>
        ) : (
          <div className="profile-grid">
            {users.map((u, i) => (
              <motion.div
                key={u.id}
                className="profile-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04, duration: 0.3 }}
                onClick={() => handleCardClick(u.username)}
                id={`user-card-${u.username}`}
              >
                <div className="profile-card-avatar">
                  <Avatar user={u} size="lg" style={{ margin: '0 auto', border: '3px solid var(--purple-200)' }} />
                </div>
                <div className="profile-card-name">{u.display_name}</div>
                <div className="profile-card-username">@{u.username}</div>
                <div className="profile-card-bio">{u.bio || 'No bio yet.'}</div>
                <div className="profile-card-stats">
                  {['posts', 'followers', 'following'].map(stat => (
                    <div key={stat}>
                      <div className="profile-stat-value">{u[stat] || 0}</div>
                      <div className="profile-stat-label" style={{ textTransform: 'capitalize' }}>{stat}</div>
                    </div>
                  ))}
                </div>
                <span className={`badge badge-purple`} style={{ marginBottom: '0.5rem' }}>{u.category}</span>
                <button
                  className="btn-primary"
                  style={{ width: '100%', justifyContent: 'center', padding: '0.6rem', fontSize: '0.875rem' }}
                  onClick={(e) => { e.stopPropagation(); handleCardClick(u.username); }}
                >
                  <Search size={14} /> Search with Hash
                </button>
              </motion.div>
            ))}
          </div>
        )}

        {/* Stats */}
        {!loading && users.length > 0 && (
          <p style={{ textAlign: 'center', marginTop: '2rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Showing {users.length} user{users.length !== 1 ? 's' : ''} · Click any card to see the hash table search in action
          </p>
        )}
      </div>
    </div>
  );
}
