import React, { useState, useRef, useEffect } from 'react';
import {
  User, Mail, Phone, MapPin, Shield, Camera,
  Edit3, Save, X, LogOut, AlertCircle, Loader
} from 'lucide-react';
import SecurityTab from './SecurityTab';
import { URLS } from '../../url';

const DEFAULT_AVATAR =
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80';

const getToken = () => {
  const token = localStorage.getItem('admin_token') || sessionStorage.getItem('admin_token') || '';
  if (!token) return '';
  return token.startsWith('Bearer ') ? token : `Bearer ${token}`;
};

export default function Profile({ user, onLogout }) {
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  // Avatar
  const [avatarSrc, setAvatarSrc] = useState(user?.avatar || DEFAULT_AVATAR);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const fileInputRef = useRef(null);

  // Form data
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    location: '',
    bio: '',
  });
  const [savedData, setSavedData] = useState({ ...formData });

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'security', label: 'Security' },
  ];

  const overviewFields = [
    { label: 'Full Name',     name: 'name',     icon: User  },
    { label: 'Email Address', name: 'email',    icon: Mail  },
    { label: 'Phone Number',  name: 'phone',    icon: Phone },
    { label: 'Address',       name: 'location', icon: MapPin },
  ];

  // ── Validations ──────────────────────────────────────────────────────────
  const validate = () => {
    if (!formData.name.trim()) return 'Full name is required.';
    if (!formData.email.trim()) return 'Email address is required.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) return 'Please enter a valid email address.';
    if (formData.phone && !/^\d{7,15}$/.test(formData.phone.replace(/\D/g, '')))
      return 'Please enter a valid phone number.';
    return null;
  };

  // ── Fetch profile on mount ───────────────────────────────────────────────
  useEffect(() => {
    const fetchProfile = async () => {
      const token = getToken();

      // No token available — skip API call, use prop data directly
      if (!token) {
        setFormData({
          name:     user?.name  || '',
          email:    user?.email || '',
          phone:    user?.phone || '',
          location: user?.location || '',
          bio:      user?.bio || '',
        });
        setSavedData({
          name:     user?.name  || '',
          email:    user?.email || '',
          phone:    user?.phone || '',
          location: user?.location || '',
          bio:      user?.bio || '',
        });
        setIsFetching(false);
        return;
      }

      setIsFetching(true);
      try {
        const res = await fetch(URLS.GetProfile, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'authorization': token,
          },
        });

        const data = await res.json();

        if (res.ok && data.status !== false && data.success !== false) {
          const d = data?.profile || data?.data || data;
          const newData = {
            name:     d.name     || user?.name  || '',
            email:    d.email    || user?.email || '',
            phone:    d.phone    || user?.phone || '',
            location: d.address  || d.location || user?.location || '',
            bio:      d.bio      || '',
          };
          setFormData(newData);
          setSavedData(newData);
          let resolvedAvatar = null;
          const pic = d.image || d.profilePic;
          if (pic) {
            resolvedAvatar = pic.startsWith('http') ? pic : URLS.ImageUrl + pic;
            setAvatarSrc(resolvedAvatar);
          }

          const storage = localStorage.getItem('admin_token') ? localStorage : sessionStorage;
          const prevStored = JSON.parse(storage.getItem('admin_user') || '{}');
          const merged = {
            ...prevStored,
            name: d.name || prevStored.name || '',
            email: d.email || prevStored.email || '',
            phone: d.phone || prevStored.phone || '',
            location: d.address || d.location || prevStored.location || '',
            avatar: resolvedAvatar || prevStored.avatar,
          };
          storage.setItem('admin_user', JSON.stringify(merged));
          window.dispatchEvent(new CustomEvent('profile-updated', { detail: merged }));
        } else {
          // API error (400/401 etc.) — fall back to user prop data gracefully
          const fallback = {
            name:     user?.name  || '',
            email:    user?.email || '',
            phone:    user?.phone || '',
            location: user?.location || '',
            bio:      user?.bio || '',
          };
          setFormData(fallback);
          setSavedData(fallback);
        }
      } catch {
        // Network error — fall back to user prop data
        const fallback = {
          name:     user?.name  || '',
          email:    user?.email || '',
          phone:    user?.phone || '',
          location: user?.location || '',
          bio:      user?.bio || '',
        };
        setFormData(fallback);
        setSavedData(fallback);
      } finally {
        setIsFetching(false);
      }
    };

    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleCancel = () => {
    setFormData({ ...savedData });
    setIsEditing(false);
    setError('');
    setSuccess('');
  };

  // ── Update profile ───────────────────────────────────────────────────────
  const handleSave = async () => {
    setError('');
    setSuccess('');

    const validationError = validate();
    if (validationError) { setError(validationError); return; }

    setIsLoading(true);
    try {
      const res = await fetch(URLS.UpdateProfile, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'authorization': getToken(),
        },
        body: JSON.stringify({
          name:    formData.name.trim(),
          email:   formData.email.trim(),
          phone:   formData.phone.trim(),
          address: formData.location.trim(),
          status:  'active',
        }),
      });

      const data = await res.json();

      if (!res.ok || data.status === false || data.success === false) {
        setError(data.message || 'Failed to update profile. Please try again.');
        return;
      }

      setSavedData({ ...formData });
      setIsEditing(false);
      setSuccess(data.message || 'Profile updated successfully!');
      setTimeout(() => setSuccess(''), 4000);

      // Sync changes to storage and broadcast to Topbar
      const storage = localStorage.getItem('admin_token') ? localStorage : sessionStorage;
      const prevStored = JSON.parse(storage.getItem('admin_user') || '{}');
      const merged = {
        ...prevStored,
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        location: formData.location.trim(),
      };
      storage.setItem('admin_user', JSON.stringify(merged));
      window.dispatchEvent(new CustomEvent('profile-updated', { detail: merged }));
    } catch {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // ── Update profile picture ───────────────────────────────────────────────
  const handleAvatarClick = () => fileInputRef.current?.click();

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file (JPG, PNG, etc.)');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5 MB.');
      return;
    }

    // Show local preview immediately
    const reader = new FileReader();
    reader.onload = (ev) => setAvatarSrc(ev.target.result);
    reader.readAsDataURL(file);

    e.target.value = '';

    // Upload to server
    setAvatarUploading(true);
    setError('');
    try {
      const formPayload = new FormData();
      formPayload.append('image', file);

      const res = await fetch(URLS.UpdateProfilePic, {
        method: 'PUT',
        headers: { 'authorization': getToken() },
        body: formPayload,
      });

      const data = await res.json();

      if (!res.ok || data.status === false || data.success === false) {
        setError(data.message || 'Failed to upload profile picture.');
        return;
      }

      // Update to server URL if returned
      const pic = data?.data?.image || data?.data?.profilePic || data?.image || data?.profilePic;
      let finalAvatar = avatarSrc;
      if (pic) {
        finalAvatar = pic.startsWith('http') ? pic : URLS.ImageUrl + pic;
        setAvatarSrc(finalAvatar);
      }
      setSuccess(data.message || 'Profile picture updated!');
      setTimeout(() => setSuccess(''), 3000);

      // Sync changes to storage and broadcast to Topbar
      const storage = localStorage.getItem('admin_token') ? localStorage : sessionStorage;
      const prevStored = JSON.parse(storage.getItem('admin_user') || '{}');
      const merged = { ...prevStored, avatar: finalAvatar };
      storage.setItem('admin_user', JSON.stringify(merged));
      window.dispatchEvent(new CustomEvent('profile-updated', { detail: merged }));
    } catch {
      setError('Network error while uploading picture.');
    } finally {
      setAvatarUploading(false);
    }
  };

  if (isFetching) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300, gap: 12, color: '#64748b', fontSize: 14 }}>
        <Loader size={20} style={{ animation: 'spin 1s linear infinite' }} /> Loading profile...
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); }}`}</style>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 4px 40px' }}>

      {/* ── Hero Banner ───────────────────────────────────────── */}
      <div style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 60%, #881337 100%)',
        borderRadius: 20, padding: '36px 32px 80px',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: -60, right: -60, width: 240, height: 240, borderRadius: '50%', background: 'rgba(136,19,55,0.18)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -40, left: '40%', width: 160, height: 160, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', pointerEvents: 'none' }} />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: 'rgba(136,19,55,0.35)', color: '#fda4af',
              fontSize: 11.5, fontWeight: 700, padding: '4px 12px',
              borderRadius: 99, border: '1px solid rgba(253,164,175,0.25)', marginBottom: 10,
            }}>
              <Shield size={11} /> Super Admin
            </span>
            <h1 style={{ color: '#ffffff', fontSize: 26, fontWeight: 800, letterSpacing: '-0.02em' }}>My Profile</h1>
            <p style={{ color: '#94a3b8', fontSize: 13, marginTop: 4 }}>Manage your account info and security</p>
          </div>

          {!isEditing ? (
            <button onClick={() => setIsEditing(true)} style={{
              display: 'inline-flex', alignItems: 'center', gap: 7,
              background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)',
              color: '#ffffff', border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: 10, padding: '9px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer',
            }}>
              <Edit3 size={14} /> Edit Profile
            </button>
          ) : (
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={handleCancel} style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                background: 'rgba(255,255,255,0.1)', color: '#cbd5e1',
                border: '1px solid rgba(255,255,255,0.15)', borderRadius: 10,
                padding: '9px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer',
              }}>
                <X size={14} /> Cancel
              </button>
              <button onClick={handleSave} disabled={isLoading} style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                background: 'linear-gradient(135deg,#881337,#9f1239)', color: '#fff',
                border: 'none', borderRadius: 10, padding: '9px 18px', fontSize: 13,
                fontWeight: 700, cursor: isLoading ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 14px rgba(136,19,55,0.4)', opacity: isLoading ? 0.7 : 1,
              }}>
                {isLoading ? <><Loader size={13} /> Saving...</> : <><Save size={14} /> Save Changes</>}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Avatar Card ───────────────────────────────────────── */}
      <div style={{ padding: '0 28px', marginTop: -52, marginBottom: 24, position: 'relative', zIndex: 10 }}>
        <div style={{
          background: '#ffffff', borderRadius: 20,
          border: '1px solid #e2e8f0', boxShadow: '0 10px 25px rgba(0,0,0,0.09)',
          padding: '24px 28px', display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap',
        }}>
          {/* Avatar */}
          <div
            onClick={handleAvatarClick}
            title="Click to change photo"
            style={{ position: 'relative', flexShrink: 0, cursor: 'pointer' }}
          >
            <img
              src={avatarSrc}
              alt="Profile"
              style={{
                width: 84, height: 84, borderRadius: '50%', objectFit: 'cover',
                border: '3px solid #ffffff', boxShadow: '0 0 0 3px #881337',
                opacity: avatarUploading ? 0.5 : 1, transition: 'opacity 0.2s',
              }}
              onError={() => setAvatarSrc(DEFAULT_AVATAR)}
            />
            {avatarUploading && (
              <div style={{
                position: 'absolute', inset: 0, borderRadius: '50%',
                background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Loader size={18} color="#fff" style={{ animation: 'spin 1s linear infinite' }} />
              </div>
            )}
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); handleAvatarClick(); }}
              style={{
                position: 'absolute', bottom: 0, right: 0,
                width: 26, height: 26, borderRadius: '50%',
                background: '#881337', color: '#fff', border: '2px solid #fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
              }}
            >
              <Camera size={12} />
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileChange} />
          </div>

          {/* Name / Role */}
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: 21, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.01em' }}>
              {formData.name || 'Admin User'}
            </h2>
            <p style={{ fontSize: 13, color: '#64748b', marginTop: 3 }}>{formData.email}</p>
            <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: '#fff1f2', color: '#881337', fontSize: 11.5, fontWeight: 700, padding: '3px 10px', borderRadius: 99 }}>
                <Shield size={10} /> Super Admin
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: '#ecfdf5', color: '#15803d', fontSize: 11.5, fontWeight: 600, padding: '3px 10px', borderRadius: 99 }}>
                ● Online
              </span>
            </div>
            <p style={{ fontSize: 11.5, color: '#94a3b8', marginTop: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
              <Camera size={11} /> Click the photo to update your profile picture
            </p>
          </div>

          {onLogout && (
            <button onClick={onLogout} style={{
              display: 'inline-flex', alignItems: 'center', gap: 7,
              background: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca',
              borderRadius: 10, padding: '9px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer',
            }}>
              <LogOut size={14} /> Sign Out
            </button>
          )}
        </div>
      </div>

      {/* ── Global alerts (below avatar card) ────────────────── */}
      <div style={{ padding: '0 28px', marginBottom: error || success ? 16 : 0 }}>
        {error && (
          <div style={{
            display: 'flex', alignItems: 'flex-start', gap: 8,
            background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 12,
            padding: '12px 16px', fontSize: 13, fontWeight: 500, color: '#dc2626', lineHeight: 1.5,
          }}>
            <AlertCircle size={15} style={{ flexShrink: 0, marginTop: 2 }} />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: '#ecfdf5', border: '1px solid #bbf7d0', borderRadius: 12,
            padding: '12px 16px', fontSize: 13, fontWeight: 600, color: '#15803d',
          }}>
            <Shield size={15} /> {success}
          </div>
        )}
      </div>

      {/* ── Tabs ─────────────────────────────────────────────── */}
      <div style={{ padding: '0 28px', marginBottom: 20 }}>
        <div style={{ display: 'inline-flex', gap: 4, background: '#f1f5f9', borderRadius: 12, padding: 5 }}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '8px 20px', borderRadius: 9, fontSize: 13, fontWeight: 600,
                border: 'none', cursor: 'pointer', transition: 'all 0.2s',
                background: activeTab === tab.id ? '#881337' : 'transparent',
                color: activeTab === tab.id ? '#ffffff' : '#64748b',
                boxShadow: activeTab === tab.id ? '0 2px 10px rgba(136,19,55,0.3)' : 'none',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Tab Content ──────────────────────────────────────── */}
      <div style={{ padding: '0 28px' }}>

        {/* Overview */}
        {activeTab === 'overview' && (
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 20, overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0' }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a' }}>Personal Information</h3>
              <p style={{ fontSize: 12.5, color: '#94a3b8', marginTop: 2 }}>
                {isEditing ? 'Edit your details below and save.' : 'Your current profile information.'}
              </p>
            </div>
            <div style={{ padding: '24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              {overviewFields.map(({ label, name, icon: Icon }) => (
                <div key={name}>
                  <label style={{ fontSize: 11.5, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 7 }}>
                    {label}
                  </label>
                  {isEditing ? (
                    <div style={{ position: 'relative' }}>
                      <Icon size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
                      <input
                        name={name}
                        value={formData[name]}
                        onChange={handleChange}
                        style={{
                          width: '100%', padding: '10px 12px 10px 34px',
                          border: '1.5px solid #e2e8f0', borderRadius: 10,
                          fontSize: 13.5, fontFamily: 'inherit', color: '#0f172a', outline: 'none',
                        }}
                        onFocus={(e) => (e.target.style.borderColor = '#881337')}
                        onBlur={(e) => (e.target.style.borderColor = '#e2e8f0')}
                      />
                    </div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 9, fontSize: 14, fontWeight: 600, color: '#0f172a' }}>
                      <Icon size={14} color="#94a3b8" /> {formData[name] || <span style={{ color: '#cbd5e1' }}>—</span>}
                    </div>
                  )}
                </div>
              ))}

              {/* Bio */}
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ fontSize: 11.5, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 7 }}>
                  Bio
                </label>
                {isEditing ? (
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    rows={3}
                    style={{
                      width: '100%', padding: '10px 14px',
                      border: '1.5px solid #e2e8f0', borderRadius: 10,
                      fontSize: 13.5, fontFamily: 'inherit', color: '#0f172a',
                      resize: 'vertical', outline: 'none',
                    }}
                    onFocus={(e) => (e.target.style.borderColor = '#881337')}
                    onBlur={(e) => (e.target.style.borderColor = '#e2e8f0')}
                  />
                ) : (
                  <p style={{ fontSize: 13.5, color: '#475569', lineHeight: 1.6 }}>
                    {formData.bio || <span style={{ color: '#cbd5e1' }}>No bio added yet.</span>}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Security */}
        {activeTab === 'security' && <SecurityTab />}
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); }}`}</style>
    </div>
  );
}
