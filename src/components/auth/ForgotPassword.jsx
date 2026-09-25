import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UtensilsCrossed, ArrowLeft, Mail, KeyRound, CheckCircle2, ShieldCheck, ChefHat, Sparkles } from 'lucide-react';
import loginHeroImg from '../../assets/login-hero.jpg';
import '../../styles/auth.css';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: email, 2: OTP & new pass, 3: success
  const [email, setEmail] = useState('admin@foodexpress.com');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendCode = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setStep(2);
    }, 600);
  };

  const handleResetPassword = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setStep(3);
      setTimeout(() => navigate('/login'), 1400);
    }, 600);
  };

  return (
    <div className="auth-wrapper">
      {/* Left Pane - Restaurant Interior Image */}
      <div 
        className="auth-hero-pane" 
        style={{ backgroundImage: `url(${loginHeroImg})` }}
      >
        <div className="auth-hero-content auth-brand">
          <div className="auth-brand-badge">
            <UtensilsCrossed size={24} />
          </div>
          <div className="auth-brand-text">
            <h1>Gourmet Express</h1>
            <p>Culinary Delivery & Fleet Admin</p>
          </div>
        </div>

        <div className="auth-hero-headline">
          <h2>
            Secure <span>Account Recovery</span> for Food Admin Portal.
          </h2>
          <p>
            Verify your authorized administrative identity to restore full management
            access to dispatch, live kitchen feeds, and restaurant merchant settlements.
          </p>
        </div>

        <div className="auth-hero-stats">
          <div className="hero-stat-card">
            <div className="hero-stat-icon">
              <ChefHat size={22} />
            </div>
            <div className="hero-stat-info">
              <h4>Encrypted</h4>
              <p>MFA Protected Admin Suite</p>
            </div>
          </div>
          <div className="hero-stat-card">
            <div className="hero-stat-icon">
              <Sparkles size={22} />
            </div>
            <div className="hero-stat-info">
              <h4>Instant Recovery</h4>
              <p>One-Time Security Token</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Pane - Recovery Steps */}
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
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@foodexpress.com"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn btn-primary auth-submit-btn"
                >
                  {isLoading ? 'Sending Security Code...' : 'Send Verification Code'}
                </button>
              </form>
            </>
          )}

          {step === 2 && (
            <>
              <div className="auth-header">
                <h3>Enter Verification Code</h3>
                <p>We sent a 6-digit code to <strong>{email}</strong>. (Hint: Enter <strong>123456</strong>)</p>
              </div>

              <form onSubmit={handleResetPassword} className="auth-form">
                <div className="form-group">
                  <label>6-Digit Verification Code</label>
                  <div className="input-icon-wrapper">
                    <KeyRound className="field-icon" size={18} />
                    <input
                      type="text"
                      maxLength={6}
                      required
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      placeholder="123456"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>New Secure Password</label>
                  <div className="input-icon-wrapper">
                    <KeyRound className="field-icon" size={18} />
                    <input
                      type="password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Minimum 8 characters"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn btn-primary auth-submit-btn"
                >
                  {isLoading ? 'Updating Password...' : 'Reset & Save Password'}
                </button>
              </form>
            </>
          )}

          {step === 3 && (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ 
                width: 64, 
                height: 64, 
                borderRadius: '50%', 
                background: '#ecfdf5', 
                color: '#10b981', 
                display: 'inline-flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                marginBottom: 16
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

          {/* <div className="auth-footer">
            <p>
              <ShieldCheck size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />
              256-Bit Encrypted Multi-Tenant Admin Portal • FoodExpress v3.4.0
            </p>
          </div> */}
        </div>
      </div>
    </div>
  );
}
