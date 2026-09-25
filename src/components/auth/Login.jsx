import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UtensilsCrossed, Lock, Mail, Eye, EyeOff, ShieldCheck, ChefHat, Sparkles, ArrowRight } from 'lucide-react';
import loginHeroImg from '../../assets/login-hero.jpg';
import '../../styles/auth.css';

export default function Login({ onLogin }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('admin@foodexpress.com');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onLogin({ email, role: 'Super Admin', name: 'Alexandria Montgomery' });
    }, 600);
  };

  const handleQuickDemo = (roleEmail, roleName) => {
    setEmail(roleEmail);
    setPassword('secret123');
  };

  return (
    <div className="auth-wrapper">
      {/* Left Pane - Restaurant Interior Image & Brand Hero */}
      <div 
        className="auth-hero-pane" 
        style={{ backgroundImage: `url(${loginHeroImg})` }}
      >
        <div className="auth-hero-content auth-brand">
          <div className="auth-brand-badge">
            <UtensilsCrossed size={24} />
          </div>
          <div className="auth-brand-text">
            <h1>The Place</h1>
            <p>Culinary Food & Delivery</p>
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
            <div className="hero-stat-icon">
              <ChefHat size={22} />
            </div>
            <div className="hero-stat-info">
              <h4>185+ Places</h4>
              <p>Active Culinary Partners</p>
            </div>
          </div>
          <div className="hero-stat-card">
            <div className="hero-stat-icon">
              <Sparkles size={22} />
            </div>
            <div className="hero-stat-info">
              <h4>99.4%</h4>
              <p>On-Time Delivery SLA</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Pane - Luxury Login Form */}
      <div className="auth-form-pane">
        <div className="auth-form-card">
          <div className="auth-header">
            <h3>Welcome Back</h3>
            <p>Enter your administrator credentials to access the control suite</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label>Administrator Email / Username</label>
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

            <div className="form-group">
              <label>Password</label>
              <div className="input-icon-wrapper">
                <Lock className="field-icon" size={18} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
                <>
                  Sign In to Dashboard <ArrowRight size={17} />
                </>
              )}
            </button>
          </form>

        </div>
      </div>
    </div>
  );
}
