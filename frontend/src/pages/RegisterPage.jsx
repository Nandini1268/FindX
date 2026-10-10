import React, { useState, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Mail, Lock, FileText, Camera, CheckCircle, Eye, EyeOff, X, Upload } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getInitials } from '../api';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const fileRef = useRef(null);

  const [form, setForm] = useState({ username: '', display_name: '', email: '', password: '', bio: '' });
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const set = (field) => (e) => {
    setForm(f => ({ ...f, [field]: e.target.value }));
    setErrors(er => ({ ...er, [field]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.username) e.username = 'Username is required';
    else if (!/^[a-zA-Z0-9_]{3,30}$/.test(form.username)) e.username = '3–30 chars, letters/numbers/underscores';
    if (!form.display_name) e.display_name = 'Display name is required';
    if (!form.email) e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email';
    if (!form.password) e.password = 'Password is required';
    else if (form.password.length < 6) e.password = 'At least 6 characters';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handlePhoto = (file) => {
    if (!file) return;
    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.type)) { toast.error('Only JPG, PNG, WebP allowed'); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error('Photo must be under 5 MB'); return; }
    setPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const onFileChange = (e) => handlePhoto(e.target.files[0]);
  const onDrop = useCallback((e) => {
    e.preventDefault(); setDragOver(false);
    handlePhoto(e.dataTransfer.files[0]);
  }, []);

  const removePhoto = (e) => {
    e.stopPropagation();
    setPhoto(null);
    setPhotoPreview(null);
    if (fileRef.current) fileRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (photo) fd.append('photo', photo);

      await register(fd);
      toast.success('Account created! Welcome to FindX 🎉');
      navigate('/explore');
    } catch (err) {
      const msg = err.response?.data?.error || 'Registration failed';
      toast.error(msg);
      if (msg.toLowerCase().includes('username')) setErrors(er => ({ ...er, username: msg }));
      if (msg.toLowerCase().includes('email')) setErrors(er => ({ ...er, email: msg }));
    } finally {
      setLoading(false);
    }
  };

  // Live preview name
  const previewName = form.display_name || 'Your Name';
  const previewUsername = form.username || 'username';
  const previewBio = form.bio || 'Your bio will appear here...';

  return (
    <div className="page-enter" style={{ minHeight: 'calc(100vh - 70px)', padding: '2rem 0', background: 'var(--bg-primary)' }}>
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', alignItems: 'start', maxWidth: 900, margin: '0 auto' }}>

          {/* ── Registration Form ─────────────────────────── */}
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }}>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>Create Your Account</h1>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '0.9rem' }}>
              Join FindX and be part of our community.<br />Your profile will be searchable by others.
            </p>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
              {/* Username */}
              <div className="form-group">
                <div className="form-input-icon">
                  <User className="icon" size={18} />
                  <input id="reg-username" type="text" className={`form-input${errors.username ? ' input-error' : ''}`} placeholder="e.g. alex_dev" value={form.username} onChange={set('username')} autoComplete="username" />
                </div>
                {errors.username && <span className="error-msg">{errors.username}</span>}
              </div>

              {/* Display Name */}
              <div className="form-group">
                <div className="form-input-icon">
                  <FileText className="icon" size={18} />
                  <input id="reg-displayname" type="text" className={`form-input${errors.display_name ? ' input-error' : ''}`} placeholder="e.g. Alex Dev" value={form.display_name} onChange={set('display_name')} />
                </div>
                {errors.display_name && <span className="error-msg">{errors.display_name}</span>}
              </div>

              {/* Email */}
              <div className="form-group">
                <div className="form-input-icon">
                  <Mail className="icon" size={18} />
                  <input id="reg-email" type="email" className={`form-input${errors.email ? ' input-error' : ''}`} placeholder="e.g. alex@example.com" value={form.email} onChange={set('email')} autoComplete="email" />
                </div>
                {errors.email && <span className="error-msg">{errors.email}</span>}
              </div>

              {/* Password */}
              <div className="form-group">
                <div className="form-input-icon" style={{ position: 'relative' }}>
                  <Lock className="icon" size={18} />
                  <input id="reg-password" type={showPass ? 'text' : 'password'} className={`form-input${errors.password ? ' input-error' : ''}`} placeholder="Min. 6 characters" value={form.password} onChange={set('password')} style={{ paddingRight: '2.75rem' }} autoComplete="new-password" />
                  <button type="button" onClick={() => setShowPass(s => !s)} style={{ position: 'absolute', right: '0.875rem', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.password && <span className="error-msg">{errors.password}</span>}
              </div>

              {/* Bio */}
              <div className="form-group">
                <div className="form-input-icon">
                  <FileText className="icon" size={18} style={{ top: '1rem', transform: 'none' }} />
                  <textarea id="reg-bio" className="form-input" placeholder="e.g. Developer | Tech Enthusiast" value={form.bio} onChange={set('bio')} rows={2} style={{ resize: 'vertical', paddingTop: '0.75rem' }} />
                </div>
              </div>

              {/* Photo upload */}
              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Camera size={16} /> Profile Picture (optional)
                </label>
                <div
                  className={`upload-area${dragOver ? ' drag-over' : ''}`}
                  onClick={() => fileRef.current?.click()}
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={onDrop}
                  id="photo-upload-area"
                  style={{ position: 'relative' }}
                >
                  {photoPreview ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', justifyContent: 'center' }}>
                      <img src={photoPreview} alt="Preview" style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--purple-400)' }} />
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>Photo selected ✓</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{photo?.name}</div>
                        <button type="button" onClick={removePhoto} style={{ background: 'none', border: 'none', color: 'var(--red-500)', fontSize: '0.75rem', cursor: 'pointer', padding: 0, marginTop: '0.25rem' }}>
                          <X size={12} /> Remove
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="upload-area-icon"><Camera size={32} /></div>
                      <p><strong>Upload Image</strong></p>
                      <p style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>JPG, PNG, WebP · Max 5 MB</p>
                    </>
                  )}
                </div>
                <input ref={fileRef} type="file" accept="image/jpeg,image/jpg,image/png,image/webp" onChange={onFileChange} style={{ display: 'none' }} id="photo-file-input" />
              </div>

              <button type="submit" className="btn-primary" disabled={loading} id="reg-submit-btn" style={{ width: '100%', justifyContent: 'center', padding: '1rem' }}>
                {loading ? <><div className="spinner" /> Creating Account…</> : <><CheckCircle size={16} /> Create Account</>}
              </button>

              <p style={{ textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                Already have an account?{' '}
                <Link to="/login" style={{ color: 'var(--purple-600)', fontWeight: 600 }}>Sign In</Link>
              </p>
            </form>
          </motion.div>

          {/* ── Live Profile Preview ──────────────────────── */}
          <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
            <div style={{ position: 'sticky', top: '90px' }}>
              <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Live Preview
              </h3>
              <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
                {/* Avatar preview */}
                <div style={{ position: 'relative', width: 96, height: 96, margin: '0 auto 1rem' }}>
                  {photoPreview ? (
                    <img src={photoPreview} alt="Preview" style={{ width: 96, height: 96, borderRadius: '50%', objectFit: 'cover', border: '4px solid var(--purple-400)' }} />
                  ) : (
                    <div style={{ width: 96, height: 96, borderRadius: '50%', background: 'linear-gradient(135deg, #ec4899, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '2rem', fontWeight: 700 }}>
                      {getInitials(form.display_name)}
                    </div>
                  )}
                  <div
                    onClick={() => fileRef.current?.click()}
                    style={{ position: 'absolute', bottom: 0, right: 0, width: 28, height: 28, borderRadius: '50%', background: 'var(--purple-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: '2px solid white' }}
                    title="Change photo"
                  >
                    <Camera size={13} color="white" />
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center', marginBottom: '0.25rem' }}>
                  <span style={{ fontSize: '1.1rem', fontWeight: 700 }}>@{previewUsername}</span>
                  <CheckCircle size={16} color="var(--purple-600)" />
                </div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>{previewName}</div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '1.5rem', minHeight: '2.5rem' }}>{previewBio}</div>

                <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginBottom: '1.5rem' }}>
                  {['Posts', 'Followers', 'Following'].map(label => (
                    <div key={label} style={{ textAlign: 'center' }}>
                      <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>0</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{label}</div>
                    </div>
                  ))}
                </div>

                <div className="btn-primary" style={{ width: '100%', justifyContent: 'center', display: 'flex', cursor: 'default', background: 'var(--gradient-btn)' }}>
                  Preview Profile
                </div>
              </div>

              {/* Quick tip */}
              <div style={{ marginTop: '1rem', padding: '0.875rem 1rem', background: 'var(--purple-100)', borderRadius: 'var(--radius-md)', fontSize: '0.82rem', color: 'var(--purple-700)' }}>
                💡 Once registered, your profile is searchable by others using the hash table engine!
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
