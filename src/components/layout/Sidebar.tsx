import React from 'react';
import {
  LayoutDashboard, FilePlus, History, BookOpen, Settings, Globe, X
} from 'lucide-react';
import { useStore } from '../../store/useStore';
import { DoctorSwitcher } from './DoctorSwitcher';

const NAV_ITEMS = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { key: 'builder', label: 'New Prescription', icon: FilePlus },
  { key: 'history', label: 'History', icon: History },
  { key: 'templates', label: 'Templates', icon: BookOpen },
  { key: 'settings', label: 'Settings', icon: Settings },
] as const;

interface SidebarProps {
  onClose?: () => void;
  isMobileDrawer?: boolean;
}

export function Sidebar({ onClose, isMobileDrawer }: SidebarProps) {
  const { activePage, setActivePage, settings, updateSettings, createPrescription, setCurrentPrescription } = useStore();

  const handleNav = (key: string) => {
    if (key === 'builder') {
      setCurrentPrescription(null);
      createPrescription();
    }
    setActivePage(key);
    if (onClose) onClose();
  };

  const toggleLanguage = () => {
    updateSettings({ language: settings.language === 'en' ? 'bn' : 'en' });
  };

  return (
    <div
      className={`sidebar no-print ${!isMobileDrawer ? 'desktop-sidebar-only' : ''}`}
      style={{
        width: isMobileDrawer ? '100%' : 220,
        height: '100%',
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Brand & Close Button (for drawer) */}
      <div style={{
        padding: '20px 16px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'rgba(255,255,255,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18,
          }}>
            🏥
          </div>
          <div>
            <div style={{ color: 'white', fontWeight: 800, fontSize: 18, lineHeight: 1 }}>EasyPad</div>
            <div style={{ color: '#93c5fd', fontSize: 10, marginTop: 1 }}>Prescription Software</div>
          </div>
        </div>

        {isMobileDrawer && onClose && (
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.15)',
              border: 'none',
              borderRadius: 8,
              width: 32,
              height: 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              cursor: 'pointer',
            }}
            title="Close menu"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Doctor Profile Switcher */}
      <DoctorSwitcher />

      {/* Nav */}
      <nav style={{ flex: 1, padding: '4px 0' }}>
        {NAV_ITEMS.map(item => {
          const Icon = item.icon;
          return (
            <div
              key={item.key}
              className={`nav-item ${activePage === item.key ? 'active' : ''}`}
              onClick={() => handleNav(item.key)}
              role="button"
              tabIndex={0}
              aria-current={activePage === item.key ? 'page' : undefined}
              onKeyDown={e => e.key === 'Enter' && handleNav(item.key)}
            >
              <Icon size={17} />
              <span>{item.label}</span>
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      <div style={{ padding: '12px 16px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        {/* Language toggle */}
        <button
          onClick={toggleLanguage}
          style={{
            width: '100%', background: 'rgba(255,255,255,0.1)', border: 'none',
            borderRadius: 8, padding: '8px 12px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 8, color: 'white',
            fontSize: 13, fontWeight: 500, transition: 'background 0.15s',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.2)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
          aria-label="Toggle language"
        >
          <Globe size={15} />
          {settings.language === 'en' ? (
            <span>English / <span className="bn" style={{ fontFamily: 'var(--font-bn)' }}>বাংলা</span></span>
          ) : (
            <span className="bn" style={{ fontFamily: 'var(--font-bn)' }}>বাংলা / English</span>
          )}
        </button>
        <div style={{ color: '#93c5fd', opacity: 0.6, fontSize: 10, marginTop: 10, textAlign: 'center' }}>
          EasyPad v1.0 · Data stored locally
        </div>
      </div>
    </div>
  );
}
