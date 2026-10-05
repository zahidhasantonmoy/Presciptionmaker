import React, { useState, useEffect } from 'react';
import { Lock, KeyRound, ShieldCheck, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useAuthStore } from './useAuthStore';

export function LockScreen({ onUnlocked }: { onUnlocked?: () => void }) {
  const {
    isConfigured,
    setupMasterPasscode,
    verifyPasscode,
    unlockWithSession,
  } = useAuthStore();

  const [passcode, setPasscode] = useState('');
  const [confirmPasscode, setConfirmPasscode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showPasscode, setShowPasscode] = useState(false);

  // Try auto-unlocking from cross-subdomain cookie on mount
  useEffect(() => {
    const unlocked = unlockWithSession();
    if (unlocked && onUnlocked) {
      onUnlocked();
    }
  }, [unlockWithSession, onUnlocked]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isConfigured) {
      if (passcode.length < 4) {
        setError('Passcode must be at least 4 characters');
        return;
      }
      if (passcode !== confirmPasscode) {
        setError('Passcodes do not match');
        return;
      }
      setupMasterPasscode(passcode);
      if (onUnlocked) onUnlocked();
    } else {
      const ok = verifyPasscode(passcode);
      if (ok) {
        if (onUnlocked) onUnlocked();
      } else {
        setError('Incorrect passcode. Please try again.');
        setPasscode('');
      }
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)',
      padding: '20px',
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      color: '#f8fafc',
    }}>
      <div style={{
        width: '100%',
        maxWidth: 420,
        background: 'rgba(30, 41, 59, 0.75)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: 24,
        padding: '36px 32px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 40px rgba(99, 102, 241, 0.2)',
      }}>
        {/* Brand Icon */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          marginBottom: 24,
        }}>
          <div style={{
            width: 64,
            height: 64,
            borderRadius: 20,
            background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 10px 25px -5px rgba(99, 102, 241, 0.5)',
          }}>
            {isConfigured ? <Lock size={30} color="#fff" /> : <ShieldCheck size={32} color="#fff" />}
          </div>
        </div>

        {/* Title */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, margin: '0 0 8px 0', letterSpacing: '-0.02em' }}>
            {isConfigured ? 'Personal Workspace' : 'Set Master Passcode'}
          </h1>
          <p style={{ fontSize: 14, color: '#94a3b8', margin: 0, lineHeight: 1.5 }}>
            {isConfigured
              ? 'Enter your private master passcode to unlock all platform services.'
              : 'Create a private master passcode to protect your documents and tools.'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#cbd5e1', marginBottom: 8 }}>
              {isConfigured ? 'Master Passcode' : 'Create Passcode'}
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPasscode ? 'text' : 'password'}
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                autoFocus
                placeholder={isConfigured ? 'Enter passcode' : 'Choose 4+ characters'}
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  background: 'rgba(15, 23, 42, 0.8)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: 12,
                  padding: '14px 44px 14px 16px',
                  color: '#fff',
                  fontSize: 16,
                  outline: 'none',
                  transition: 'border-color 0.2s',
                }}
                onFocus={(e) => (e.target.style.borderColor = '#818cf8')}
                onBlur={(e) => (e.target.style.borderColor = 'rgba(255, 255, 255, 0.15)')}
              />
              <button
                type="button"
                onClick={() => setShowPasscode(!showPasscode)}
                style={{
                  position: 'absolute',
                  right: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  padding: 4,
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                {showPasscode ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {!isConfigured && (
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#cbd5e1', marginBottom: 8 }}>
                Confirm Passcode
              </label>
              <input
                type={showPasscode ? 'text' : 'password'}
                value={confirmPasscode}
                onChange={(e) => setConfirmPasscode(e.target.value)}
                placeholder="Re-enter passcode"
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  background: 'rgba(15, 23, 42, 0.8)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: 12,
                  padding: '14px 16px',
                  color: '#fff',
                  fontSize: 16,
                  outline: 'none',
                }}
              />
            </div>
          )}

          {error && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#fca5a5',
              padding: '10px 14px',
              borderRadius: 10,
              fontSize: 13,
              textAlign: 'center',
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            style={{
              marginTop: 6,
              background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
              color: '#fff',
              border: 'none',
              borderRadius: 12,
              padding: '14px 20px',
              fontSize: 15,
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              boxShadow: '0 4px 14px 0 rgba(99, 102, 241, 0.4)',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.filter = 'brightness(1.1)')}
            onMouseLeave={(e) => (e.currentTarget.style.filter = 'none')}
          >
            <span>{isConfigured ? 'Unlock Workspace' : 'Save & Enter'}</span>
            <ArrowRight size={18} />
          </button>
        </form>

        {/* Security Notice */}
        <div style={{
          marginTop: 24,
          paddingTop: 18,
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          textAlign: 'center',
          color: '#64748b',
          fontSize: 12,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6,
        }}>
          <KeyRound size={14} />
          <span>Cross-subdomain session enabled</span>
        </div>
      </div>
    </div>
  );
}
