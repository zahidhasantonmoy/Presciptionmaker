import React, { useState } from 'react';
import { Download, Smartphone, CheckCircle2, X } from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  variant?: 'toolbar' | 'card';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ variant = 'toolbar' }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already running in standalone mode:
  if (isInstalled) {
    if (variant === 'card') {
      return (
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          padding: '8px 12px',
          borderRadius: 8,
          background: '#ecfdf5',
          border: '1px solid #86efac',
          color: '#166534',
          fontSize: 13,
          fontWeight: 600,
        }}>
          <CheckCircle2 size={15} />
          <span>Installed &amp; Running Offline-Ready</span>
        </div>
      );
    }
    return null;
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <button
        type="button"
        onClick={() => { void install(); }}
        style={variant === 'card' ? {
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
          color: '#ffffff',
          border: 'none',
          borderRadius: 8,
          padding: '9px 16px',
          fontSize: 13,
          fontWeight: 700,
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(37, 99, 235, 0.35)',
        } : {
          background: 'rgba(16, 185, 129, 0.16)',
          border: '1px solid rgba(16, 185, 129, 0.4)',
          color: '#34d399',
          cursor: 'pointer',
          padding: '3px 8px',
          borderRadius: 6,
          display: 'flex',
          alignItems: 'center',
          gap: 5,
          fontSize: 11,
          fontWeight: 600,
        }}
        title="Install EasyPad as an offline Desktop / Mobile App"
      >
        <Download size={variant === 'card' ? 15 : 12} />
        <span>Install App</span>
      </button>
    );
  }

  // iOS Safari flow (beforeinstallprompt not supported by WebKit)
  if (isIOS) {
    return (
      <>
        <button
          type="button"
          onClick={() => setShowIOSGuide(true)}
          style={variant === 'card' ? {
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            background: '#f8fafc',
            border: '1px solid #cbd5e1',
            color: '#0f172a',
            borderRadius: 8,
            padding: '8px 14px',
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
          } : {
            background: 'rgba(16, 185, 129, 0.14)',
            border: '1px solid rgba(16, 185, 129, 0.35)',
            color: '#6ee7b7',
            cursor: 'pointer',
            padding: '3px 8px',
            borderRadius: 6,
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            fontSize: 11,
            fontWeight: 600,
          }}
          title="How to install on iPhone / iPad"
        >
          <Smartphone size={variant === 'card' ? 15 : 12} />
          <span>{variant === 'card' ? 'Install on iOS (Safari)' : 'Install App'}</span>
        </button>

        {showIOSGuide && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 100000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(15, 23, 42, 0.72)',
              backdropFilter: 'blur(6px)',
              padding: 16,
            }}
            onClick={() => setShowIOSGuide(false)}
          >
            <div
              style={{
                width: '100%',
                maxWidth: 360,
                borderRadius: 16,
                background: '#0f172a',
                border: '1px solid rgba(255,255,255,0.14)',
                padding: 20,
                color: '#f8fafc',
                boxShadow: '0 24px 48px rgba(0,0,0,0.6)',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Install on iPhone / iPad</h3>
                <button
                  type="button"
                  onClick={() => setShowIOSGuide(false)}
                  style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
                >
                  <X size={18} />
                </button>
              </div>
              <p style={{ margin: '0 0 14px', fontSize: 13, lineHeight: 1.6, color: '#cbd5e1' }}>
                1. Tap the <strong>Share</strong> button in the Safari toolbar.<br />
                2. Scroll down and tap <strong>Add to Home Screen</strong>.
              </p>
              <button
                type="button"
                onClick={() => setShowIOSGuide(false)}
                style={{
                  width: '100%',
                  borderRadius: 8,
                  border: 'none',
                  background: '#2563eb',
                  color: '#fff',
                  padding: '9px 14px',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Got it
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  if (variant === 'card') {
    return (
      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        padding: '8px 12px',
        borderRadius: 8,
        background: '#eff6ff',
        border: '1px solid #bfdbfe',
        color: '#1e40af',
        fontSize: 12.5,
        fontWeight: 600,
      }}>
        <CheckCircle2 size={15} />
        <span>Offline Cache Active (Use browser menu → &quot;Install EasyPad&quot; if not prompted)</span>
      </div>
    );
  }

  return null;
};
