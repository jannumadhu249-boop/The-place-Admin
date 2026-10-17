import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UtensilsCrossed, Lock, Mail, Eye, EyeOff,
  ChefHat, Sparkles, ArrowRight, AlertCircle
} from 'lucide-react';
import loginHeroImg from '../../assets/login-hero.jpg';
import { URLS } from '../../url';
import '../../styles/auth.css';

export default function Login({ onLogin }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // ── Validations ────────────────────────────────────────────
  const validate = () => {
    if (!email.trim()) return 'Please enter your email address.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Please enter a valid email address.';
    if (!password) return 'Please enter your password.';
    if (password.length < 6) return 'Password must be at least 6 characters.';
    return null;
  };

  // ── API Call ───────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const validationError = validate();
    if (validationError) { setError(validationError); return; }

    setIsLoading(true);
    try {
      const res = await fetch(URLS.Login, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await res.json();

      if (!res.ok || data.status === false || data.success === false) {
        setError(data.message || 'Invalid credentials. Please try again.');
        return;
      }

      // Store token
      const token = data?.token || data?.data?.token || '';
      const u = data?.user || data?.data?.user || data?.data || {};

      const isSuper = (
        u.email === 'gopi@gmail.com' ||
        email.trim().toLowerCase() === 'gopi@gmail.com' ||
        u.department === 'Admin' ||
        (Array.isArray(data?.rolesAndPermission) && data?.rolesAndPermission.some(r => r.accessAll === true))
      );

      let roleName = isSuper ? 'Super Admin' : (u.department || 'Staff Member');
      let roleId = '';
      let perms = isSuper ? ['*'] : [];

      // If employee, retrieve their assigned role and permissions
      if (!isSuper && u._id) {
        try {
          const authHeader = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
          const staffRes = await fetch(URLS.GetByIdEmpolyee, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              authorization: authHeader
            },
            body: JSON.stringify({ staffId: u._id, id: u._id })
          });
          const staffData = await staffRes.json();
          const staff = staffData?.staff || staffData?.data;
          if (staff) {
            roleId = staff.roleId || '';
            roleName = staff.roleName || roleName;

            if (roleId) {
              const roleRes = await fetch(URLS.GetByIdRole, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  authorization: authHeader
                },
                body: JSON.stringify({ roleId, id: roleId })
              });
              const roleData = await roleRes.json();
              const roleObj = roleData?.role || roleData?.data;
              if (roleObj && Array.isArray(roleObj.rolesAndPermission)) {
                perms = roleObj.rolesAndPermission;
              }
            }
          }
        } catch (fetchErr) {
          console.warn('Could not fetch staff role during login:', fetchErr);
        }
      }

      const userData = {
        id: u._id || '',
        email: u.email || email.trim(),
        name: u.name || (isSuper ? 'Admin' : 'Staff Member'),
        role: roleName,
        roleName: roleName,
        roleId: roleId,
        rolesAndPermission: perms,
        phone: u.phone || '',
        avatar: u.image
          ? (u.image.startsWith('http') ? u.image : URLS.ImageUrl + u.image)
          : (u.profilePic ? (u.profilePic.startsWith('http') ? u.profilePic : URLS.ImageUrl + u.profilePic) : null),
        token,
      };

      if (token) {
        const storage = rememberMe ? localStorage : sessionStorage;
        storage.setItem('admin_token', token);
        storage.setItem('admin_user', JSON.stringify(userData));
      }

      // Pass user data up to App
      onLogin(userData);

    } catch (err) {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      {/* Left Pane */}
      <div className="auth-hero-pane" style={{ backgroundImage: `url(${loginHeroImg})` }}>
        <div className="auth-hero-content auth-brand">
          <div className="auth-brand-badge">
            <UtensilsCrossed size={24} />
          </div>
          <div className="auth-brand-text">
            <h1>The Place</h1>
            <p>Culinary Food &amp; Delivery</p>
          </div>
        </div>

        <div className="auth-hero-headline">
          <h2>
            Next-Generation <span>Food Logistics</span>
          </h2>
          <p>
            Real-time kitchen order dispatching, multi-zone delivery tracking, automated
            restaurant disbursements, and Michelin-tier dining experiences at scale.
          </p>
        </div>

        <div className="auth-hero-stats">
          <div className="hero-stat-card">
            <div className="hero-stat-icon"><ChefHat size={22} /></div>
            <div className="hero-stat-info">
              <h4>185+ Places</h4>
              <p>Active Culinary Partners</p>
            </div>
          </div>
          <div className="hero-stat-card">
            <div className="hero-stat-icon"><Sparkles size={22} /></div>
            <div className="hero-stat-info">
              <h4>99.4%</h4>
              <p>On-Time Delivery SLA</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Pane */}
      <div className="auth-form-pane">
        <div className="auth-form-card">
          <div className="auth-header">
            <h3>Welcome Back</h3>
            <p>Enter your administrator credentials to access the control suite</p>
          </div>

          {/* Error alert */}
          {error && (
            <div style={{
              display: 'flex', alignItems: 'flex-start', gap: 8,
              background: '#fef2f2', border: '1px solid #fecaca',
              borderRadius: 10, padding: '10px 12px',
              fontSize: 13, fontWeight: 500, color: '#dc2626',
              lineHeight: 1.5, marginBottom: 16,
            }}>
              <AlertCircle size={16} style={{ flexShrink: 0, marginTop: 2 }} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label>Administrator Email</label>
              <div className="input-icon-wrapper">
                <Mail className="field-icon" size={18} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(''); }}
                  placeholder="admin@example.com"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Password</label>
              <div className="input-icon-wrapper">
                <Lock className="field-icon" size={18} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(''); }}
                  placeholder="••••••••••••"
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="auth-options">
              <label className="remember-me">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span>Remember this device</span>
              </label>
              <button
                type="button"
                className="forgot-link"
                onClick={() => navigate('/forgot-password')}
              >
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary auth-submit-btn"
            >
              {isLoading ? 'Authenticating...' : (
                <><ArrowRight size={17} /> Sign In to Dashboard</>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
