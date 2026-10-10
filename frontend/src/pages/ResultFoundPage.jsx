import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, Search, ArrowRight, Zap, RefreshCw, Layers, Calendar, Mail, Globe, Sparkles } from 'lucide-react';
import { searchAPI, usersAPI, getPhotoUrl } from '../api';
import Avatar from '../components/Avatar';
import toast from 'react-hot-toast';

const SAMPLE_POSTS = [
  'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=300&h=200&fit=crop',
  'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=300&h=200&fit=crop',
  'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=300&h=200&fit=crop',
  'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=300&h=200&fit=crop',
];

export default function ResultFoundPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get('q') || '';

  const [data, setData] = useState(null);
  const [compareData, setCompareData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [following, setFollowing] = useState(false);

  useEffect(() => {
    if (!query) { navigate('/search'); return; }
    loadResult();
  }, [query]);

  const loadResult = async () => {
    setLoading(true);
    try {
      const [res, compRes] = await Promise.all([
        searchAPI.search(query),
        searchAPI.compare(query),
      ]);
      setData(res.data);
      setCompareData(compRes.data);
    } catch (err) {
      toast.error('Failed to load search results.');
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async () => {
    const username = data?.search?.user?.username;
    if (!username) return;
    try {
      const res = await usersAPI.follow(username);
      setFollowing(res.data.following);
      toast.success(res.data.following ? `Following @${username}` : `Unfollowed @${username}`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Please sign in to follow users.');
    }
  };

  if (loading) {
    return (
      <div className="page-enter" style={{ minHeight: 'calc(100vh - 70px)', padding: '4rem 0', textAlign: 'center' }}>
        <div className="spinner spinner-purple" style={{ width: 40, height: 40, margin: '0 auto 1rem', borderWidth: 3 }} />
        <p style={{ color: 'var(--purple-600)', fontWeight: 600 }}>Retrieving profile from C engine…</p>
      </div>
    );
  }

  const user = data?.search?.user;
  const trace = data?.search;
  const hashTrace = data?.hash_trace;

  if (!user) {
    navigate(`/result/not-found?q=${encodeURIComponent(query)}`);
    return null;
  }

  const hashComps = compareData?.hash_comparisons || trace?.comparisons || 1;
  const linearComps = compareData?.linear_comparisons || compareData?.total_users || 10;
  const speedup = (linearComps / Math.max(1, hashComps)).toFixed(1);

  return (
    <div className="page-enter" style={{ minHeight: 'calc(100vh - 70px)', padding: '2rem 0' }}>
      <div className="container" style={{ maxWidth: 1100 }}>
        {/* Step progress */}
        <div className="step-progress">
          {['Search', 'Hash Calculation', 'Visualization', 'Result'].map((label, i) => (
            <React.Fragment key={label}>
              <div className="step-item">
                <div className={`step-circle done`}>✓</div>
                <div className={`step-label${i === 3 ? ' active' : ''}`}>{label}</div>
              </div>
              {i < 3 && <div className="step-connector done" />}
            </React.Fragment>
          ))}
        </div>

        {/* Found Header Banner */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: '#f0fdf4', color: 'var(--green-600)', padding: '0.5rem 1.25rem', borderRadius: 'var(--radius-full)', fontWeight: 700, fontSize: '1rem', border: '1.5px solid #86efac', marginBottom: '0.75rem' }}>
            <CheckCircle2 size={20} /> User Found!
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>
            @{user.username}
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Located in bucket <strong style={{ color: 'var(--purple-600)' }}>[{trace?.bucket_index}]</strong> in <strong style={{ color: 'var(--purple-600)' }}>{trace?.comparisons}</strong> comparison{trace?.comparisons !== 1 ? 's' : ''}
          </p>
        </motion.div>

        {/* Main Grid: Profile + Details */}
        <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '2rem', marginBottom: '2.5rem' }}>
          {/* Left: Profile Card */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="card" style={{ padding: '2rem', textAlign: 'center' }}>
            <div style={{ margin: '0 auto 1.25rem', width: 110, height: 110 }}>
              <Avatar user={user} size="2xl" style={{ border: '4px solid var(--purple-300)', width: 110, height: 110 }} />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', justifyContent: 'center', marginBottom: '0.25rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>{user.display_name}</h2>
              <CheckCircle2 size={18} color="var(--purple-600)" />
            </div>
            <div style={{ color: 'var(--purple-600)', fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.75rem' }}>
              @{user.username}
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <span className="badge badge-purple">{user.category || 'Member'}</span>
            </div>

            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: 1.6 }}>
              {user.bio || 'No bio provided.'}
            </p>

            {/* Stats */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', padding: '1rem 0', borderTop: '1px solid var(--border-light)', borderBottom: '1px solid var(--border-light)', marginBottom: '1.5rem' }}>
              {[
                { label: 'Posts', val: user.posts || 12 },
                { label: 'Followers', val: user.followers || 120 },
                { label: 'Following', val: user.following || 85 },
              ].map(s => (
                <div key={s.label}>
                  <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>{s.val}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={handleFollow}
                className={following ? 'btn-secondary' : 'btn-primary'}
                style={{ flex: 1, justifyContent: 'center', padding: '0.7rem' }}
              >
                {following ? 'Following ✓' : 'Follow'}
              </button>
              <button
                onClick={() => toast('Direct messaging open!')}
                className="btn-ghost"
                style={{ flex: 1, justifyContent: 'center', padding: '0.7rem' }}
              >
                Message
              </button>
            </div>
          </motion.div>

          {/* Right: Detailed Info & Media */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Details Panel */}
            <div className="card" style={{ padding: '1.75rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem', color: 'var(--text-secondary)' }}>
                Profile Details
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', fontSize: '0.9rem' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Username</div>
                  <div style={{ fontWeight: 600, color: 'var(--purple-700)' }}>@{user.username}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Display Name</div>
                  <div style={{ fontWeight: 600 }}>{user.display_name}</div>
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Bio</div>
                  <div style={{ color: 'var(--text-secondary)' }}>{user.bio || '—'}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Email</div>
                  <div style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Mail size={14} color="var(--text-muted)" /> {user.email || 'Private'}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Member Since</div>
                  <div style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Calendar size={14} color="var(--text-muted)" /> {user.created_at ? new Date(user.created_at).toLocaleDateString() : '10 Oct 2024'}
                  </div>
                </div>
              </div>
            </div>

            {/* Posts Grid */}
            <div className="card" style={{ padding: '1.75rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-secondary)' }}>
                Recent Posts
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem' }}>
                {SAMPLE_POSTS.map((src, i) => (
                  <img
                    key={i}
                    src={src}
                    alt={`Post ${i+1}`}
                    style={{ width: '100%', height: 110, objectFit: 'cover', borderRadius: 'var(--radius-md)' }}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Algorithm Comparison Panel */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="card" style={{ padding: '2rem', background: 'var(--gradient-soft)', border: '1px solid var(--purple-200)', marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800, fontSize: '1.25rem' }}>
                <Zap size={22} color="var(--purple-600)" /> Performance Comparison
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                Hash Table with Separate Chaining vs Linear Search across {linearComps} total users
              </p>
            </div>
            <span className="badge badge-green" style={{ fontSize: '0.9rem', padding: '0.4rem 1rem' }}>
              🚀 {speedup}× Faster Lookup
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            {/* Hash Search bar */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                <span style={{ color: 'var(--purple-700)' }}>Hash Table Search O(1)</span>
                <span style={{ color: 'var(--purple-700)' }}>{hashComps} comparison{hashComps !== 1 ? 's' : ''}</span>
              </div>
              <div className="perf-bar" style={{ height: 14 }}>
                <div className="perf-bar-fill hash" style={{ width: `${Math.min(100, (hashComps / Math.max(1, linearComps)) * 100)}%` }} />
              </div>
            </div>

            {/* Linear Search bar */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                <span style={{ color: 'var(--orange-500)' }}>Linear Search O(N)</span>
                <span style={{ color: 'var(--orange-500)' }}>{linearComps} comparison{linearComps !== 1 ? 's' : ''}</span>
              </div>
              <div className="perf-bar" style={{ height: 14 }}>
                <div className="perf-bar-fill linear" style={{ width: '100%' }} />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Bottom Actions */}
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to={`/visualization?q=${encodeURIComponent(query)}`} className="btn-secondary" id="btn-re-viz">
            <RefreshCw size={16} /> View Visualization Trace
          </Link>
          <Link to="/search" className="btn-primary" id="btn-another-search">
            <Search size={16} /> Try Another Search <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
}
