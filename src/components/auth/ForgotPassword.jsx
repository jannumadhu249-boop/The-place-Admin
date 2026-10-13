import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UtensilsCrossed, ArrowLeft, Mail, KeyRound,
  CheckCircle2, ShieldCheck, ChefHat, Sparkles,
  Lock, AlertCircle,
} from 'lucide-react';
import loginHeroImg from '../../assets/login-hero.jpg';
import { URLS } from '../../url';
import '../../styles/auth.css';

const STEPS = ['Email', 'Security Code', 'New Password'];

const linkBtnStyle = {
  background: 'none', border: 'none', color: '#f97316',
  fontWeight: 600, fontSize: 13, cursor: 'pointer', padding: 0,
};

const alertBase = {
  display: 'flex', alignItems: 'flex-start', gap: 8,
  padding: '10px 12px', borderRadius: 10, fontSize: 13,
  fontWeight: 500, lineHeight: 1.5, marginBottom: 16,
};

export default function ForgotPassword() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);

  // Form fields
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // API response data we need to carry across steps
  const [userId, setUserId] = useState('');

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  const clearMessages = () => { setError(''); setInfo(''); };
  const goToStep = (target) => { clearMessages(); setStep(target); };

  const passwordsMismatch = confirmPassword.length > 0 && newPassword !== confirmPassword;

  /* =========================================================
     STEP 1 — Send OTP to admin email
     ========================================================= */
  const handleSendCode = async (e) => {
    e.preventDefault();
    clearMessages();

    // Validation
    if (!email.trim()) { setError('Please enter your administrative email address.'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError('Please enter a valid email address.'); return; }

    setIsLoading(true);
    try {
      const res = await fetch(URLS.ForgotPasswordSendOtp, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await res.json();

      if (!res.ok || data.status === false || data.success === false) {
        setError(data.message || 'Failed to send OTP. Please check your email and try again.');
        return;
      }

      // Store userId for subsequent steps
      const foundId = data?.data?._id || data?.userId || data?._id || data?.user?._id;
      if (foundId) setUserId(foundId);

      setOtp('');
      setStep(2);
      setInfo(data.message || `A 6-digit verification code was sent to ${email}.`);
    } catch {
      setError('Network error. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  /* =========================================================
     STEP 2 — Verify OTP
     ========================================================= */
  const handleVerifyCode = async (e) => {
    e.preventDefault();
    clearMessages();

    if (otp.length !== 6) { setError('Please enter the full 6-digit verification code.'); return; }

    setIsLoading(true);
    try {
      const res = await fetch(URLS.ForgotPasswordVerifyOtp, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ _id: userId, emailOtp: otp }),
      });

      const data = await res.json();

      if (!res.ok || data.status === false || data.success === false) {
        setError(data.message || 'Invalid verification code. Please try again.');
        return;
      }

      setStep(3);
      setInfo(data.message || 'Security code verified. Please create your new password.');
    } catch {
      setError('Network error. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    clearMessages();
    setOtp('');
    setIsLoading(true);
    try {
      const res = await fetch(URLS.ForgotPasswordSendOtp, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();
      if (!res.ok || data.status === false || data.success === false) {
        setError(data.message || 'Failed to resend code.');
        return;
      }
      const foundId = data?.data?._id || data?.userId || data?._id || data?.user?._id;
      if (foundId) setUserId(foundId);
      setInfo(data.message || `A new verification code was sent to ${email}.`);
    } catch {
      setError('Network error. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  /* =========================================================
     STEP 3 — Reset password
     ========================================================= */
  const handleResetPassword = async (e) => {
    e.preventDefault();
    clearMessages();

    if (newPassword.length < 6) { setError('Password must be at least 6 characters long.'); return; }
    if (newPassword !== confirmPassword) { setError('The two passwords do not match. Please re-enter them.'); return; }

    setIsLoading(true);
    try {
      const res = await fetch(URLS.ForgotPasswordResetPassword, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          newpassword: newPassword,
          confirmpassword: confirmPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok || data.status === false || data.success === false) {
        setError(data.message || 'Failed to reset password. Please try again.');
        return;
      }

      setStep(4);
      setTimeout(() => navigate('/login'), 2000);
    } catch {
      setError('Network error. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      {/* Left Pane */}
      <div className="auth-hero-pane" style={{ backgroundImage: `url(${loginHeroImg})` }}>
        <div className="auth-hero-content auth-brand">
          <div className="auth-brand-badge"><UtensilsCrossed size={24} /></div>
          <div className="auth-brand-text">
            <h1>The Place</h1>
            <p>Culinary Food &amp; Delivery</p>
          </div>
        </div>

        <div className="auth-hero-headline">
          <h2>Secure <span>Account Recovery</span> for Food Admin Portal.</h2>
          <p>
            Verify your authorized administrative identity to restore full management
            access to dispatch, live kitchen feeds, and restaurant merchant settlements.
          </p>
        </div>

        <div className="auth-hero-stats">
          <div className="hero-stat-card">
            <div className="hero-stat-icon"><ChefHat size={22} /></div>
            <div className="hero-stat-info"><h4>Encrypted</h4><p>MFA Protected Admin Suite</p></div>
          </div>
          <div className="hero-stat-card">
            <div className="hero-stat-icon"><Sparkles size={22} /></div>
            <div className="hero-stat-info"><h4>Instant Recovery</h4><p>One-Time Security Token</p></div>
          </div>
        </div>
      </div>

      {/* Right Pane */}
      <div className="auth-form-pane">
        <div className="auth-form-card">
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="btn btn-secondary"
            style={{ marginBottom: 24, padding: '6px 12px', fontSize: 13 }}
          >
            <ArrowLeft size={16} /> Back to Sign In
          </button>

          {/* Step indicator */}
          {step <= 3 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 22 }}>
              {STEPS.map((label, i) => {
                const index = i + 1;
                const isActive = step === index;
                const isDone = step > index;
                return (
                  <React.Fragment key={label}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{
                        width: 22, height: 22, borderRadius: '50%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 11, fontWeight: 700,
                        background: isDone ? '#10b981' : isActive ? '#f97316' : '#e2e8f0',
                        color: isDone || isActive ? '#fff' : '#64748b',
                      }}>
                        {isDone ? '✓' : index}
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 600, color: isActive ? '#0f172a' : '#94a3b8', whiteSpace: 'nowrap' }}>
                        {label}
                      </span>
                    </div>
                    {index < STEPS.length && (
                      <div style={{ flex: 1, height: 2, background: isDone ? '#10b981' : '#e2e8f0' }} />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          )}

          {/* Error / Info alert */}
          {(error || info) && step <= 4 && (
            <div style={{
              ...alertBase,
              ...(error
                ? { background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' }
                : { background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe' }),
            }}>
              {error
                ? <AlertCircle size={16} style={{ flexShrink: 0, marginTop: 2 }} />
                : <ShieldCheck size={16} style={{ flexShrink: 0, marginTop: 2 }} />}
              <span>{error || info}</span>
            </div>
          )}

          {/* ─── STEP 1 : Email ─── */}
          {step === 1 && (
            <>
              <div className="auth-header">
                <h3>Forgot Password</h3>
                <p>Enter your verified admin email address to receive a secure recovery code.</p>
              </div>
              <form onSubmit={handleSendCode} className="auth-form">
                <div className="form-group">
                  <label>Administrative Email Address</label>
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
                <button type="submit" disabled={isLoading} className="btn btn-primary auth-submit-btn">
                  {isLoading ? 'Sending Security Code...' : 'Send Verification Code'}
                </button>
              </form>
            </>
          )}

          {/* ─── STEP 2 : Security Code ─── */}
          {step === 2 && (
            <>
              <div className="auth-header">
                <h3>Confirm Security Code</h3>
                <p>We sent a 6-digit code to <strong>{email}</strong>. Enter it below to confirm your identity.</p>
              </div>
              <form onSubmit={handleVerifyCode} className="auth-form">
                <div className="form-group">
                  <label>6-Digit Verification Code</label>
                  <div className="input-icon-wrapper">
                    <KeyRound className="field-icon" size={18} />
                    <input
                      type="text"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      maxLength={6}
                      required
                      value={otp}
                      onChange={(e) => { setOtp(e.target.value.replace(/\D/g, '').slice(0, 6)); setError(''); }}
                      placeholder="000000"
                      style={{ letterSpacing: '0.35em', fontWeight: 700 }}
                    />
                  </div>
                </div>

                <button type="submit" disabled={isLoading || otp.length !== 6} className="btn btn-primary auth-submit-btn">
                  {isLoading ? 'Verifying Code...' : 'Verify Security Code'}
                </button>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 14 }}>
                  <button type="button" onClick={() => goToStep(1)} style={linkBtnStyle}>Change email</button>
                  <button type="button" onClick={handleResendCode} disabled={isLoading} style={linkBtnStyle}>
                    {isLoading ? 'Sending...' : 'Resend code'}
                  </button>
                </div>
              </form>
            </>
          )}

          {/* ─── STEP 3 : New Password ─── */}
          {step === 3 && (
            <>
              <div className="auth-header">
                <h3>Create New Password</h3>
                <p>Your identity has been verified. Choose a strong new password for your administrator account.</p>
              </div>
              <form onSubmit={handleResetPassword} className="auth-form">
                <div className="form-group">
                  <label>New Secure Password</label>
                  <div className="input-icon-wrapper">
                    <Lock className="field-icon" size={18} />
                    <input
                      type="password"
                      required
                      value={newPassword}
                      onChange={(e) => { setNewPassword(e.target.value); setError(''); }}
                      placeholder="Minimum 6 characters"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Confirm New Password</label>
                  <div className="input-icon-wrapper">
                    <Lock className="field-icon" size={18} />
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => { setConfirmPassword(e.target.value); setError(''); }}
                      placeholder="Re-enter your new password"
                      style={{ borderColor: passwordsMismatch ? '#fca5a5' : undefined }}
                    />
                  </div>
                  {passwordsMismatch && (
                    <small style={{ color: '#dc2626', fontSize: 12 }}>Passwords do not match.</small>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isLoading || passwordsMismatch}
                  className="btn btn-primary auth-submit-btn"
                >
                  {isLoading ? 'Updating Password...' : 'Reset & Save Password'}
                </button>

                <div style={{ marginTop: 14, textAlign: 'center' }}>
                  <button type="button" onClick={() => goToStep(2)} style={linkBtnStyle}>
                    Back to verification code
                  </button>
                </div>
              </form>
            </>
          )}

          {/* ─── STEP 4 : Success ─── */}
          {step === 4 && (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{
                width: 64, height: 64, borderRadius: '50%',
                background: '#ecfdf5', color: '#10b981',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16,
              }}>
                <CheckCircle2 size={36} />
              </div>
              <h3 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', marginBottom: 8 }}>
                Password Reset Successfully!
              </h3>
              <p style={{ color: '#64748b', fontSize: 14, marginBottom: 24, lineHeight: 1.6 }}>
                Your administrator credentials have been updated securely. You may now sign in with your new password.
              </p>
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="btn btn-primary"
                style={{ width: '100%', padding: 13 }}
              >
                Proceed to Sign In
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}