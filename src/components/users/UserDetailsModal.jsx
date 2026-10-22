import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Clock,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Wallet,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Navigation
} from 'lucide-react';
import { URLS } from '../../url';

const FALLBACK_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2YWJkM2RkYjAzMGEyODdlMzhhMWRlZmYiLCJwaG9uZSI6Ijg1MDAyNDEwOTMiLCJpYXQiOjE3OTA3ODcwNDUsImV4cCI6MTgyMjMyMzA0NX0.8Y91D3P6whWIu8Cy2hCO-ivQiIwHXPhPQ41DznvwomM';

const getAuthHeader = () => {
  const token = localStorage.getItem('admin_token') || sessionStorage.getItem('admin_token') || localStorage.getItem('token') || FALLBACK_TOKEN;
  return token.startsWith('Bearer ') ? token : `Bearer ${token}`;
};

const getImageUrl = (path) => {
  if (!path || typeof path !== 'string' || path.trim() === '') return null;
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) return path;
  const base = (URLS.ImageUrl || URLS.Base || '').replace(/\/+$/, '');
  return `${base}/${path.replace(/^\/+/, '').replace(/\\/g, '/')}`;
};

export default function UserDetailsModal({ user: initialUser, onClose, onStatusUpdated }) {
  const [user, setUser] = useState(initialUser);
  const [loading, setLoading] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [showBlockInput, setShowBlockInput] = useState(false);
  const [blockedReason, setBlockedReason] = useState(initialUser?.blockedReason || '');
  const [feedback, setFeedback] = useState(null);

  // Fetch complete details by ID using Get By Id curl
  useEffect(() => {
    if (!initialUser?._id) return;
    let cancelled = false;

    const fetchDetails = async () => {
      setLoading(true);
      try {
        const res = await fetch(URLS.GetByIdUsers, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            authorization: getAuthHeader()
          },
          body: JSON.stringify({ userId: initialUser._id })
        });
        const data = await res.json();
        if (!cancelled && res.ok && data.success && data.user) {
          setUser(data.user);
          if (data.user.blockedReason) {
            setBlockedReason(data.user.blockedReason);
          }
        }
      } catch (err) {
        console.error('Error fetching user by id:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchDetails();
    return () => { cancelled = true; };
  }, [initialUser]);

  if (!user) return null;

  const isBlocked = user.status === 'blocked';
  const avatarUrl = getImageUrl(user.image);

  const handleUpdateStatus = async (nextStatus, reason = '') => {
    setStatusUpdating(true);
    setFeedback(null);
    try {
      const res = await fetch(URLS.UpdateUserStatus, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          authorization: getAuthHeader()
        },
        body: JSON.stringify({
          userId: user._id,
          status: nextStatus,
          blockedReason: nextStatus === 'blocked' ? (reason || 'Blocked by administrator') : ''
        })
      });
      const data = await res.json();
      if (res.ok && data.success !== false) {
        const updatedUser = data.user || {
          ...user,
          status: nextStatus,
          blockedReason: nextStatus === 'blocked' ? reason : ''
        };
        setUser(updatedUser);
        setShowBlockInput(false);
        setFeedback({ type: 'success', msg: `Customer account ${nextStatus === 'blocked' ? 'blocked' : 'activated'} successfully!` });
        if (onStatusUpdated) onStatusUpdated(updatedUser);
      } else {
        setFeedback({ type: 'error', msg: data.message || 'Failed to update user status.' });
      }
    } catch {
      setFeedback({ type: 'error', msg: 'Network error updating user status.' });
    } finally {
      setStatusUpdating(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog" style={{ maxWidth: 620, width: '95%' }} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              background: isBlocked ? '#fef2f2' : '#f0fdf4',
              color: isBlocked ? '#dc2626' : '#16a34a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {isBlocked ? <ShieldAlert size={20} /> : <ShieldCheck size={20} />}
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: 17 }}>Customer Profile Details</h3>
              <p style={{ margin: 0, fontSize: 12, color: '#64748b' }}>
                Account verification, contact address, and security access
              </p>
            </div>
          </div>
          <button type="button" className="btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body" style={{ padding: '22px 24px', display: 'flex', flexDirection: 'column', gap: 18 }}>
          {loading && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, color: '#64748b', padding: '6px 12px', background: '#f8fafc', borderRadius: 8 }}>
              <Loader2 size={14} className="animate-spin" />
              <span>Fetching latest customer records...</span>
            </div>
          )}

          {feedback && (
            <div
              style={{
                padding: '10px 14px',
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                background: feedback.type === 'error' ? '#fef2f2' : '#f0fdf4',
                color: feedback.type === 'error' ? '#991b1b' : '#166534',
                border: `1px solid ${feedback.type === 'error' ? '#fecaca' : '#bbf7d0'}`
              }}
            >
              {feedback.type === 'error' ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
              <span>{feedback.msg}</span>
            </div>
          )}

          {/* Profile Card Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: 16,
              borderRadius: 12,
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              flexWrap: 'wrap',
              gap: 14
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div
                style={{
                  width: 58,
                  height: 58,
                  borderRadius: '50%',
                  background: '#e2e8f0',
                  border: '2px solid #cbd5e1',
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={user.name || 'User'}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                ) : (
                  <User size={28} color="#94a3b8" />
                )}
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#0f172a' }}>
                  {user.name || 'Unregistered Customer'}
                </h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5, color: '#64748b', marginTop: 3 }}>
                  <Phone size={13} color="#94a3b8" /> {user.phone || 'No phone'}
                </div>
                {user.email && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#64748b', marginTop: 2 }}>
                    <Mail size={12} color="#94a3b8" /> {user.email}
                  </div>
                )}
              </div>
            </div>

            <div>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '5px 12px',
                  borderRadius: 20,
                  fontSize: 12.5,
                  fontWeight: 700,
                  textTransform: 'capitalize',
                  background: isBlocked ? '#fef2f2' : '#f0fdf4',
                  color: isBlocked ? '#dc2626' : '#15803d',
                  border: `1px solid ${isBlocked ? '#fecdd3' : '#bbf7d0'}`
                }}
              >
                <span
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: '50%',
                    background: isBlocked ? '#dc2626' : '#16a34a'
                  }}
                />
                {user.status || 'Active'}
              </span>
            </div>
          </div>

          {/* User Fields Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14 }}>
            {/* Delivery Address */}
            <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, padding: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#64748b', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', marginBottom: 6 }}>
                <MapPin size={14} color="#be123c" /> Primary Address
              </div>
              <p style={{ margin: 0, fontSize: 13.5, fontWeight: 600, color: '#0f172a' }}>
                {user.address || 'No physical address recorded'}
              </p>
            </div>

            {/* Registration Date */}
            <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, padding: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#64748b', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', marginBottom: 6 }}>
                <Calendar size={14} color="#0284c7" /> Joined Date & Time
              </div>
              <p style={{ margin: 0, fontSize: 13.5, fontWeight: 600, color: '#0f172a' }}>
                {user.date ? `${user.date} at ${user.time || ''}` : (user.logCreatedDate ? new Date(user.logCreatedDate).toLocaleDateString('en-IN') : 'N/A')}
              </p>
            </div>

            {/* Bio / Note */}
            <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, padding: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#64748b', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', marginBottom: 6 }}>
                <User size={14} color="#7c3aed" /> Customer Bio
              </div>
              <p style={{ margin: 0, fontSize: 13, color: '#334155' }}>
                {user.bio || 'No personal bio added'}
              </p>
            </div>

            {/* Wallet Balance */}
            <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, padding: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#64748b', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', marginBottom: 6 }}>
                <Wallet size={14} color="#16a34a" /> In-App Wallet
              </div>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 800, color: '#0f172a' }}>
                ₹{Number(user.wallet || 0).toLocaleString()}
              </p>
            </div>
          </div>

          {/* Block Reason Alert if Blocked */}
          {isBlocked && user.blockedReason && (
            <div style={{ background: '#fff1f2', border: '1px solid #fecdd3', borderRadius: 10, padding: 12, display: 'flex', gap: 10 }}>
              <AlertCircle size={18} color="#be123c" style={{ flexShrink: 0, marginTop: 2 }} />
              <div>
                <strong style={{ fontSize: 12.5, color: '#9f1239' }}>Account Suspension Reason:</strong>
                <p style={{ margin: '2px 0 0', fontSize: 12.5, color: '#be123c' }}>{user.blockedReason}</p>
              </div>
            </div>
          )}

          {/* Action: Block / Unblock Box */}
          <div
            style={{
              padding: 16,
              borderRadius: 12,
              background: isBlocked ? '#f0fdf4' : '#fff1f2',
              border: `1px solid ${isBlocked ? '#bbf7d0' : '#fecdd3'}`,
              display: 'flex',
              flexDirection: 'column',
              gap: 12
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
              <div>
                <h5 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: isBlocked ? '#166534' : '#9f1239' }}>
                  {isBlocked ? 'Reactivate Customer Account' : 'Restrict Customer Access (Block)'}
                </h5>
                <p style={{ margin: '2px 0 0', fontSize: 12, color: isBlocked ? '#15803d' : '#be123c' }}>
                  {isBlocked
                    ? 'Unblock this user to restore food ordering and login capabilities'
                    : 'Prevent this customer from placing bookings and accessing the platform'}
                </p>
              </div>

              {!isBlocked ? (
                !showBlockInput ? (
                  <button
                    type="button"
                    className="btn btn-secondary"
                    style={{
                      background: '#be123c',
                      color: '#fff',
                      border: 'none',
                      fontSize: 12.5,
                      padding: '8px 14px'
                    }}
                    onClick={() => setShowBlockInput(true)}
                    disabled={statusUpdating}
                  >
                    <ShieldAlert size={15} /> Block Customer
                  </button>
                ) : null
              ) : (
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{
                    background: '#15803d',
                    color: '#fff',
                    border: 'none',
                    fontSize: 12.5,
                    padding: '8px 14px'
                  }}
                  onClick={() => handleUpdateStatus('active', '')}
                  disabled={statusUpdating}
                >
                  {statusUpdating ? (
                    <>
                      <Loader2 size={15} className="animate-spin" /> Activating...
                    </>
                  ) : (
                    <>
                      <ShieldCheck size={15} /> Activate Account
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Block input field */}
            {!isBlocked && showBlockInput && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingTop: 10, borderTop: '1px dashed #fecdd3' }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#9f1239' }}>
                  Reason for blocking (Required):
                </label>
                <input
                  type="text"
                  className="form-control-input"
                  placeholder="e.g. Repeated fraudulent orders, abuse..."
                  value={blockedReason}
                  onChange={(e) => setBlockedReason(e.target.value)}
                  disabled={statusUpdating}
                />
                <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    style={{ fontSize: 12, padding: '6px 12px' }}
                    onClick={() => setShowBlockInput(false)}
                    disabled={statusUpdating}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    style={{ background: '#be123c', borderColor: '#be123c', fontSize: 12, padding: '6px 14px' }}
                    onClick={() => handleUpdateStatus('blocked', blockedReason.trim() || 'Blocked by administrator')}
                    disabled={statusUpdating}
                  >
                    {statusUpdating ? (
                      <>
                        <Loader2 size={14} className="animate-spin" /> Blocking...
                      </>
                    ) : (
                      'Confirm Block'
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="modal-footer" style={{ padding: '12px 24px' }}>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
