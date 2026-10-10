import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Camera, FileText, Save, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { usersAPI, getPhotoUrl, getInitials } from '../api';
import toast from 'react-hot-toast';

const CATEGORIES = ['Developer', 'Designer', 'Student', 'Creator', 'User'];

export default function SettingsPage() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const fileRef = useRef(null);

  const [displayName, setDisplayName] = useState(user?.display_name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [category, setCategory] = useState(user?.category || 'Developer');
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  if (!user) {
    navigate('/login');
    return null;
  }

  const handlePhoto = (file) => {
    if (!file) return;
    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.type)) { toast.error('Only JPG, PNG, WebP allowed'); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error('Photo must be under 5 MB'); return; }
    setPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('display_name', displayName);
      fd.append('bio', bio);
      fd.append('category', category);
      if (photo) fd.append('photo', photo);

      const res = await usersAPI.updateMe(fd);
      updateUser(res.data.user);
      toast.success('Profile updated successfully! 🎉');
      navigate(`/profile/${user.username}`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const currentPhoto = photoPreview || getPhotoUrl(user.photo_url);

  return (
    <div className="page-enter" style={{ minHeight: 'calc(100vh - 70px)', padding: '3rem 0' }}>
      <div className="container" style={{ maxWidth: 600 }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>Edit Profile</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Update your account details and profile picture</p>

        <div className="card" style={{ padding: '2rem' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Photo Avatar */}
            <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
              <div style={{ position: 'relative', width: 96, height: 96, margin: '0 auto 0.75rem' }}>
                {currentPhoto ? (
                  <img src={currentPhoto} alt="Avatar" style={{ width: 96, height: 96, borderRadius: '50%', objectFit: 'cover', border: '4px solid var(--purple-400)' }} />
                ) : (
                  <div style={{ width: 96, height: 96, borderRadius: '50%', background: 'linear-gradient(135deg, #ec4899, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '2rem', fontWeight: 700 }}>
                    {getInitials(user.display_name)}
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  style={{ position: 'absolute', bottom: 0, right: 0, width: 32, height: 32, borderRadius: '50%', background: 'var(--purple-600)', border: '2px solid white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                >
                  <Camera size={16} color="white" />
                </button>
              </div>
              <button type="button" onClick={() => fileRef.current?.click()} style={{ background: 'none', border: 'none', color: 'var(--purple-600)', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer' }}>
                Change Profile Picture
              </button>
              <input ref={fileRef} type="file" accept="image/jpeg,image/jpg,image/png,image/webp" onChange={(e) => handlePhoto(e.target.files[0])} style={{ display: 'none' }} />
            </div>

            {/* Display Name */}
            <div className="form-group">
              <label className="form-label">Display Name</label>
              <input type="text" className="form-input" style={{ paddingLeft: '1rem' }} value={displayName} onChange={e => setDisplayName(e.target.value)} required />
            </div>

            {/* Category */}
            <div className="form-group">
              <label className="form-label">Category</label>
              <select className="form-input" style={{ paddingLeft: '1rem' }} value={category} onChange={e => setCategory(e.target.value)}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {/* Bio */}
            <div className="form-group">
              <label className="form-label">Bio</label>
              <textarea className="form-input" style={{ paddingLeft: '1rem', paddingTop: '0.75rem' }} value={bio} onChange={e => setBio(e.target.value)} rows={3} />
            </div>

            <button type="submit" className="btn-primary" disabled={loading} style={{ justifyContent: 'center', padding: '0.875rem', marginTop: '0.5rem' }}>
              {loading ? <><div className="spinner" /> Saving…</> : <><Save size={16} /> Save Changes</>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
