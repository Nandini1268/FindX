import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, CheckCircle2, Calendar, Mail, UserPlus, MessageSquare, ArrowLeft } from 'lucide-react';
import { usersAPI, getPhotoUrl } from '../api';
import Avatar from '../components/Avatar';
import toast from 'react-hot-toast';

const SAMPLE_POSTS = [
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=200&fit=crop',
  'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=300&h=200&fit=crop',
  'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=300&h=200&fit=crop',
  'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=300&h=200&fit=crop',
];

export default function ProfilePage() {
  const { username } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [following, setFollowing] = useState(false);

  useEffect(() => {
    loadUser();
  }, [username]);

  const loadUser = async () => {
    setLoading(true);
    try {
      const res = await usersAPI.get(username);
      setUser(res.data.user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async () => {
    if (!user) return;
    try {
      const res = await usersAPI.follow(user.username);
      setFollowing(res.data.following);
      setUser(u => ({ ...u, followers: res.data.following ? u.followers + 1 : Math.max(0, u.followers - 1) }));
      toast.success(res.data.following ? `Following @${user.username}` : `Unfollowed @${user.username}`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Please sign in to follow users.');
    }
  };

  if (loading) {
    return (
      <div className="page-enter" style={{ minHeight: 'calc(100vh - 70px)', padding: '4rem 0', textAlign: 'center' }}>
        <div className="spinner spinner-purple" style={{ width: 40, height: 40, margin: '0 auto 1rem', borderWidth: 3 }} />
        <p style={{ color: 'var(--purple-600)', fontWeight: 600 }}>Loading profile…</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="page-enter" style={{ minHeight: 'calc(100vh - 70px)', padding: '4rem 0', textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '1rem' }}>User Not Found</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>The requested profile @{username} does not exist.</p>
        <Link to="/explore" className="btn-primary"><ArrowLeft size={16} /> Back to Explore</Link>
      </div>
    );
  }

  return (
    <div className="page-enter" style={{ minHeight: 'calc(100vh - 70px)', padding: '2rem 0' }}>
      <div className="container" style={{ maxWidth: 950 }}>
        {/* Profile Banner */}
        <div className="card" style={{ overflow: 'hidden', marginBottom: '2rem' }}>
          <div style={{ height: 160, background: 'var(--gradient-primary)', position: 'relative' }} />
          
          <div style={{ padding: '0 2rem 2rem', position: 'relative', marginTop: -60 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
              <Avatar user={user} size="2xl" style={{ border: '4px solid white', width: 120, height: 120, boxShadow: 'var(--shadow-md)' }} />
              
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button onClick={handleFollow} className={following ? 'btn-secondary' : 'btn-primary'}>
                  {following ? 'Following ✓' : 'Follow'}
                </button>
                <Link to={`/search?q=${user.username}`} className="btn-secondary">
                  <Search size={16} /> Search with Hash Table
                </Link>
              </div>
            </div>

            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.25rem' }}>
              {user.display_name}
            </h1>
            <div style={{ color: 'var(--purple-600)', fontWeight: 600, fontSize: '0.95rem', marginBottom: '0.75rem' }}>
              @{user.username} · <span className="badge badge-purple">{user.category || 'User'}</span>
            </div>

            <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', maxWidth: 600, marginBottom: '1.5rem', lineHeight: 1.6 }}>
              {user.bio || 'No bio written yet.'}
            </p>

            {/* Stats */}
            <div style={{ display: 'flex', gap: '2rem', borderTop: '1px solid var(--border-light)', paddingTop: '1.25rem' }}>
              {[
                { label: 'Posts', val: user.posts || 0 },
                { label: 'Followers', val: user.followers || 0 },
                { label: 'Following', val: user.following || 0 },
              ].map(s => (
                <div key={s.label}>
                  <span style={{ fontWeight: 800, fontSize: '1.1rem', marginRight: '0.35rem' }}>{s.val}</span>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Posts */}
        <div className="card" style={{ padding: '1.75rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.25rem' }}>User Posts</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
            {SAMPLE_POSTS.map((src, i) => (
              <img key={i} src={src} alt="Post" style={{ width: '100%', height: 140, objectFit: 'cover', borderRadius: 'var(--radius-md)' }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
