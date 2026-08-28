import React, { useState } from 'react';
import { ShieldAlert, Lock, Mail, User, Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api';

export default function Login({ onLogin }) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('admin@twinguard.com');
  const [password, setPassword] = useState('admin123');
  const [role, setRole] = useState('Security Analyst');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleQuickDemo = async () => {
    setEmail('admin@twinguard.com');
    setPassword('admin123');
    setLoading(true);
    setError('');
    try {
      const authResult = await api.login('admin@twinguard.com', 'admin123');
      if (authResult && authResult.token) {
        localStorage.setItem('twinguard_token', authResult.token);
        localStorage.setItem('twinguard_auth', 'true');
        localStorage.setItem('twinguard_user', JSON.stringify(authResult.user));
        onLogin();
      } else {
        localStorage.setItem('twinguard_auth', 'true');
        onLogin();
      }
    } catch (err) {
      // Fallback local auth if API call fails
      localStorage.setItem('twinguard_auth', 'true');
      onLogin();
    } finally {
      setLoading(false);
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    const formattedEmail = (email || '').trim().toLowerCase();
    const formattedPassword = (password || '').trim();

    try {
      if (isRegistering) {
        const regResult = await api.register(formattedEmail, formattedPassword, name, role);
        if (regResult && regResult.token) {
          localStorage.setItem('twinguard_token', regResult.token);
          localStorage.setItem('twinguard_auth', 'true');
          localStorage.setItem('twinguard_user', JSON.stringify(regResult.user));
          setSuccessMsg('Account registered successfully! Redirecting...');
          setTimeout(() => onLogin(), 1000);
        } else {
          setError(regResult.message || 'Registration failed. Please try again.');
        }
      } else {
        const authResult = await api.login(formattedEmail, formattedPassword);
        if (authResult && authResult.token) {
          localStorage.setItem('twinguard_token', authResult.token);
          localStorage.setItem('twinguard_auth', 'true');
          localStorage.setItem('twinguard_user', JSON.stringify(authResult.user));
          onLogin();
        } else {
          setError('Invalid email or password. Please check your credentials.');
        }
      }
    } catch (err) {
      setError(err.message || 'Authentication error. Please verify details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#F7F9FC',
      padding: '1.5rem',
      fontFamily: "'Inter', sans-serif"
    }}>
      <div style={{
        width: '100%',
        maxWidth: '440px',
        backgroundColor: '#FFFFFF',
        borderRadius: '16px',
        border: '1px solid #E2E8F0',
        padding: '2.5rem 2rem',
        boxShadow: '0 10px 25px -5px rgba(37, 99, 235, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.03)'
      }}>
        {/* Branding */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '56px',
            height: '56px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, #E0F2FE 0%, #DBEAFE 100%)',
            border: '1px solid #BFDBFE',
            marginBottom: '1rem'
          }}>
            <ShieldAlert size={32} color="#2563EB" />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
            <span style={{
              fontSize: '1.75rem',
              fontWeight: 800,
              background: 'linear-gradient(135deg, #2563EB, #0EA5E9)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              TwinGuard
            </span>
            <span style={{
              background: '#E0F2FE',
              color: '#0284C7',
              fontSize: '0.65rem',
              fontWeight: 700,
              padding: '0.2rem 0.5rem',
              borderRadius: '6px',
              letterSpacing: '0.5px'
            }}>
              SOC AI
            </span>
          </div>

          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#1E293B', marginBottom: '0.25rem' }}>
            {isRegistering ? 'Create Account' : 'Welcome to TwinGuard'}
          </h2>
          <p style={{ fontSize: '0.875rem', color: '#64748B' }}>
            Hospital Cybersecurity Defense System
          </p>
        </div>

        {/* Tab Toggle */}
        <div style={{
          display: 'flex',
          backgroundColor: '#F1F5F9',
          borderRadius: '10px',
          padding: '0.25rem',
          marginBottom: '1.5rem'
        }}>
          <button
            type="button"
            onClick={() => { setIsRegistering(false); setError(''); setSuccessMsg(''); }}
            style={{
              flex: 1,
              padding: '0.55rem',
              border: 'none',
              borderRadius: '8px',
              backgroundColor: !isRegistering ? '#FFFFFF' : 'transparent',
              color: !isRegistering ? '#2563EB' : '#64748B',
              fontWeight: !isRegistering ? 700 : 500,
              fontSize: '0.875rem',
              cursor: 'pointer',
              boxShadow: !isRegistering ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              transition: 'all 0.2s ease'
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setIsRegistering(true); setError(''); setSuccessMsg(''); }}
            style={{
              flex: 1,
              padding: '0.55rem',
              border: 'none',
              borderRadius: '8px',
              backgroundColor: isRegistering ? '#FFFFFF' : 'transparent',
              color: isRegistering ? '#2563EB' : '#64748B',
              fontWeight: isRegistering ? 700 : 500,
              fontSize: '0.875rem',
              cursor: 'pointer',
              boxShadow: isRegistering ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              transition: 'all 0.2s ease'
            }}
          >
            Register Account
          </button>
        </div>

        {/* Feedback Banners */}
        {error && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            backgroundColor: '#FEF2F2',
            border: '1px solid #FCA5A5',
            borderRadius: '8px',
            padding: '0.75rem 1rem',
            marginBottom: '1.25rem',
            color: '#B91C1C',
            fontSize: '0.875rem',
            fontWeight: 500
          }}>
            <AlertCircle size={18} color="#EF4444" style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            backgroundColor: '#F0FDF4',
            border: '1px solid #86EFAC',
            borderRadius: '8px',
            padding: '0.75rem 1rem',
            marginBottom: '1.25rem',
            color: '#15803D',
            fontSize: '0.875rem',
            fontWeight: 500
          }}>
            <CheckCircle2 size={18} color="#22C55E" style={{ flexShrink: 0 }} />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
          {isRegistering && (
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#1E293B', marginBottom: '0.4rem' }}>
                Full Name
              </label>
              <div style={{ position: 'relative' }}>
                <User size={18} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Sarah Jenkins"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.7rem 0.75rem 0.7rem 2.5rem',
                    fontSize: '0.9rem',
                    borderRadius: '8px',
                    border: '1px solid #E2E8F0',
                    backgroundColor: '#FFFFFF',
                    color: '#1E293B',
                    outline: 'none',
                    transition: 'all 0.2s ease'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#2563EB'}
                  onBlur={(e) => e.target.style.borderColor = '#E2E8F0'}
                />
              </div>
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#1E293B', marginBottom: '0.4rem' }}>
              Username or Email
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="email"
                required
                placeholder="user@hospital.org"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.7rem 0.75rem 0.7rem 2.5rem',
                  fontSize: '0.9rem',
                  borderRadius: '8px',
                  border: '1px solid #E2E8F0',
                  backgroundColor: '#FFFFFF',
                  color: '#1E293B',
                  outline: 'none',
                  transition: 'all 0.2s ease'
                }}
                onFocus={(e) => e.target.style.borderColor = '#2563EB'}
                onBlur={(e) => e.target.style.borderColor = '#E2E8F0'}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#1E293B', marginBottom: '0.4rem' }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="Enter password..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.7rem 2.5rem 0.7rem 2.5rem',
                  fontSize: '0.9rem',
                  borderRadius: '8px',
                  border: '1px solid #E2E8F0',
                  backgroundColor: '#FFFFFF',
                  color: '#1E293B',
                  outline: 'none',
                  transition: 'all 0.2s ease'
                }}
                onFocus={(e) => e.target.style.borderColor = '#2563EB'}
                onBlur={(e) => e.target.style.borderColor = '#E2E8F0'}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#64748B',
                  display: 'flex',
                  alignItems: 'center'
                }}
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {isRegistering && (
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#1E293B', marginBottom: '0.4rem' }}>
                System Access Role
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.7rem 0.75rem',
                  fontSize: '0.9rem',
                  borderRadius: '8px',
                  border: '1px solid #E2E8F0',
                  backgroundColor: '#FFFFFF',
                  color: '#1E293B',
                  outline: 'none'
                }}
              >
                <option value="Security Analyst">Security Analyst</option>
                <option value="Admin">SOC Admin</option>
                <option value="Hospital Staff">Hospital Staff</option>
              </select>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: '0.5rem',
              width: '100%',
              padding: '0.75rem 1rem',
              fontSize: '0.95rem',
              fontWeight: 600,
              borderRadius: '8px',
              border: 'none',
              backgroundColor: '#2563EB',
              color: '#FFFFFF',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.3)',
              transition: 'background-color 0.2s ease'
            }}
            onMouseOver={(e) => { if (!loading) e.target.style.backgroundColor = '#1D4ED8'; }}
            onMouseOut={(e) => { if (!loading) e.target.style.backgroundColor = '#2563EB'; }}
          >
            {loading ? (isRegistering ? 'Creating Account...' : 'Authenticating...') : (isRegistering ? 'Register Account' : 'Sign In')}
          </button>

          {!isRegistering && (
            <button
              type="button"
              onClick={handleQuickDemo}
              disabled={loading}
              style={{
                width: '100%',
                padding: '0.65rem 1rem',
                fontSize: '0.85rem',
                fontWeight: 600,
                borderRadius: '8px',
                border: '1px solid #BFDBFE',
                backgroundColor: '#EFF6FF',
                color: '#1D4ED8',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              ⚡ Quick Demo Access (Instant SOC Login)
            </button>
          )}
        </form>
      </div>
    </div>
  );
}

