import React, { useState } from 'react';
import { Lock, Eye, EyeOff, Save, Shield, AlertCircle } from 'lucide-react';
import { URLS } from '../../url';

const getToken = () => {
  const token = localStorage.getItem('admin_token') || sessionStorage.getItem('admin_token') || '';
  if (!token) return '';
  return token.startsWith('Bearer ') ? token : `Bearer ${token}`;
};

export default function SecurityTab() {
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);

  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setPasswords((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
    setSuccess('');
  };

  // ── Validations ──────────────────────────────────────────────────────────
  const validate = () => {
    if (!passwords.currentPassword) return 'Please enter your current password.';
    if (!passwords.newPassword) return 'Please enter a new password.';
    if (passwords.newPassword.length < 6) return 'New password must be at least 6 characters.';
    if (!passwords.confirmPassword) return 'Please confirm your new password.';
    if (passwords.newPassword !== passwords.confirmPassword) return 'New password and confirm password do not match.';
    if (passwords.currentPassword === passwords.newPassword) return 'New password must be different from your current password.';
    return null;
  };

  const mismatch =
    passwords.confirmPassword.length > 0 && passwords.newPassword !== passwords.confirmPassword;

  const allFilled =
    passwords.currentPassword && passwords.newPassword && passwords.confirmPassword;

  // ── API Call ─────────────────────────────────────────────────────────────
  const handleUpdate = async () => {
    setError('');
    setSuccess('');

    const validationError = validate();
    if (validationError) { setError(validationError); return; }

    setIsLoading(true);
    try {
      const res = await fetch(URLS.ChangePassword, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'authorization': getToken(),
        },
        body: JSON.stringify({
          password: passwords.currentPassword,
          newPassword: passwords.newPassword,
          confirmPassword: passwords.confirmPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok || data.status === false || data.success === false) {
        setError(data.message || 'Failed to update password. Please try again.');
        return;
      }

      setSuccess(data.message || 'Password updated successfully! Please use your new password next time you sign in.');
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const fields = [
    { label: 'Current Password',  name: 'currentPassword', show: showCurrentPw, toggle: () => setShowCurrentPw((p) => !p) },
    { label: 'New Password',      name: 'newPassword',      show: showNewPw,     toggle: () => setShowNewPw((p) => !p) },
    {
      label: 'Confirm Password', name: 'confirmPassword', show: showConfirmPw, toggle: () => setShowConfirmPw((p) => !p),
      error: mismatch ? 'Passwords do not match.' : null,
    },
  ];

  return (
    <div style={{
      background: '#ffffff', border: '1px solid #e2e8f0',
      borderRadius: 20, overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
    }}>
      {/* Header */}
      <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0' }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a' }}>Change Password</h3>
        <p style={{ fontSize: 12.5, color: '#94a3b8', marginTop: 2 }}>
          Keep your account secure with a strong password.
        </p>
      </div>

      {/* Form */}
      <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 18, maxWidth: 460 }}>

        {/* Error alert */}
        {error && (
          <div style={{
            display: 'flex', alignItems: 'flex-start', gap: 8,
            background: '#fef2f2', border: '1px solid #fecaca',
            borderRadius: 10, padding: '10px 14px',
            fontSize: 13, fontWeight: 500, color: '#dc2626', lineHeight: 1.5,
          }}>
            <AlertCircle size={15} style={{ flexShrink: 0, marginTop: 2 }} />
            <span>{error}</span>
          </div>
        )}

        {/* Success alert */}
        {success && (
          <div style={{
            display: 'flex', alignItems: 'flex-start', gap: 8,
            background: '#ecfdf5', border: '1px solid #bbf7d0',
            borderRadius: 10, padding: '10px 14px',
            fontSize: 13, fontWeight: 600, color: '#15803d', lineHeight: 1.5,
          }}>
            <Shield size={15} style={{ flexShrink: 0, marginTop: 2 }} />
            <span>{success}</span>
          </div>
        )}

        {fields.map(({ label, name, show, toggle, error: fieldError }) => (
          <div key={name}>
            <label style={{
              fontSize: 11.5, fontWeight: 700, color: '#94a3b8',
              textTransform: 'uppercase', letterSpacing: '0.05em',
              display: 'block', marginBottom: 7,
            }}>
              {label}
            </label>
            <div style={{ position: 'relative' }}>
              <Lock
                size={14}
                style={{
                  position: 'absolute', left: 12, top: '50%',
                  transform: 'translateY(-50%)',
                  color: fieldError ? '#ef4444' : '#94a3b8', pointerEvents: 'none',
                }}
              />
              <input
                type={show ? 'text' : 'password'}
                name={name}
                value={passwords[name]}
                onChange={handleChange}
                placeholder="••••••••"
                style={{
                  width: '100%', padding: '11px 40px 11px 36px',
                  border: `1.5px solid ${fieldError ? '#fca5a5' : '#e2e8f0'}`,
                  borderRadius: 10, fontSize: 13.5, fontFamily: 'inherit',
                  color: '#0f172a', outline: 'none',
                  background: fieldError ? '#fff5f5' : '#ffffff',
                  transition: 'border-color 0.2s',
                }}
                onFocus={(e) => (e.target.style.borderColor = fieldError ? '#ef4444' : '#881337')}
                onBlur={(e) => (e.target.style.borderColor = fieldError ? '#fca5a5' : '#e2e8f0')}
              />
              <button
                type="button" onClick={toggle}
                style={{
                  position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: '#94a3b8', padding: 0, display: 'flex', alignItems: 'center',
                }}
              >
                {show ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            {fieldError && (
              <p style={{ fontSize: 12, color: '#ef4444', marginTop: 5, fontWeight: 500 }}>
                {fieldError}
              </p>
            )}
          </div>
        ))}

        {/* Submit */}
        <button
          onClick={handleUpdate}
          disabled={isLoading || !allFilled || mismatch}
          style={{
            alignSelf: 'flex-start',
            display: 'inline-flex', alignItems: 'center', gap: 7,
            background: isLoading || !allFilled || mismatch
              ? '#e2e8f0'
              : 'linear-gradient(135deg, #881337, #9f1239)',
            color: isLoading || !allFilled || mismatch ? '#94a3b8' : '#fff',
            border: 'none', borderRadius: 10,
            padding: '10px 22px', fontSize: 13.5, fontWeight: 700,
            cursor: isLoading || !allFilled || mismatch ? 'not-allowed' : 'pointer',
            boxShadow: isLoading || !allFilled || mismatch ? 'none' : '0 4px 14px rgba(136,19,55,0.35)',
            transition: 'all 0.2s', marginTop: 4,
          }}
        >
          <Save size={14} /> {isLoading ? 'Updating...' : 'Update Password'}
        </button>

        {/* Security notice */}
        <div style={{
          background: '#f0f9ff', border: '1px solid #bae6fd',
          borderRadius: 12, padding: '14px 16px',
          display: 'flex', gap: 10, alignItems: 'flex-start',
        }}>
          <Shield size={16} color="#0284c7" style={{ flexShrink: 0, marginTop: 1 }} />
          <p style={{ fontSize: 12.5, color: '#0369a1', lineHeight: 1.6 }}>
            Use at least 6 characters with a mix of letters, numbers, and symbols. You will
            be signed out on all devices after changing your password.
          </p>
        </div>
      </div>
    </div>
  );
}
