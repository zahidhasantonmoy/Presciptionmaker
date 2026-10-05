import React, { useState, useEffect } from 'react';
import {
  Menu, LayoutDashboard, FilePlus, History, BookOpen, Settings, Stethoscope
} from 'lucide-react';
import { Sidebar } from '../../components/layout/Sidebar';
import { Dashboard } from '../../pages/Dashboard';
import { PrescriptionBuilder } from '../../pages/PrescriptionBuilder';
import { HistoryPage } from '../../pages/HistoryPage';
import { TemplatesPage } from '../../pages/TemplatesPage';
import { SettingsPage } from '../../pages/SettingsPage';
import { PrescriptionVerificationPage } from '../../pages/PrescriptionVerificationPage';
import { useStore } from '../../store/useStore';

function getVerifyIdFromUrl(): string | null {
  try {
    const params = new URLSearchParams(window.location.search);
    const qVerify = params.get('verify');
    if (qVerify) return qVerify;

    const path = window.location.pathname;
    if (path.startsWith('/verify/')) {
      const id = path.slice(8).replace(/^\/+|\/+$/g, '');
      if (id) return decodeURIComponent(id);
    }

    const hash = window.location.hash;
    if (hash.startsWith('#/verify/')) {
      const id = hash.slice(9).replace(/^\/+|\/+$/g, '');
      if (id) return decodeURIComponent(id);
    }
    if (hash.startsWith('#verify=')) {
      return decodeURIComponent(hash.slice(8));
    }
  } catch {
    // fallback
  }
  return null;
}

const MOBILE_NAV = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { key: 'builder', label: 'New Rx', icon: FilePlus },
  { key: 'history', label: 'History', icon: History },
  { key: 'templates', label: 'Templates', icon: BookOpen },
  { key: 'settings', label: 'Settings', icon: Settings },
] as const;

export function PrescriptionService() {
  const { activePage, setActivePage, createPrescription, setCurrentPrescription, doctorProfile } = useStore();
  const [verifyRxId, setVerifyRxId] = useState<string | null>(getVerifyIdFromUrl);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    const handleUrlChange = () => {
      setVerifyRxId(getVerifyIdFromUrl());
    };

    window.addEventListener('popstate', handleUrlChange);
    window.addEventListener('hashchange', handleUrlChange);

    return () => {
      window.removeEventListener('popstate', handleUrlChange);
      window.removeEventListener('hashchange', handleUrlChange);
    };
  }, []);

  const handleMobileNav = (key: string) => {
    if (key === 'builder') {
      setCurrentPrescription(null);
      createPrescription();
    }
    setActivePage(key);
  };

  if (verifyRxId) {
    return (
      <PrescriptionVerificationPage
        rxId={verifyRxId}
        onBack={() => {
          setVerifyRxId(null);
          window.history.pushState({}, '', '/prescription');
        }}
      />
    );
  }

  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden', background: '#f1f5f9', position: 'relative' }}>
      {/* ─── Desktop Permanent Sidebar ─── */}
      <Sidebar />

      {/* ─── Mobile Slide-out Drawer & Overlay ─── */}
      {drawerOpen && (
        <div className="mobile-drawer-backdrop no-print" onClick={() => setDrawerOpen(false)}>
          <div className="mobile-drawer-content" onClick={e => e.stopPropagation()}>
            <Sidebar isMobileDrawer onClose={() => setDrawerOpen(false)} />
          </div>
        </div>
      )}

      {/* ─── Main Content Column ─── */}
      <div style={{ flex: 1, height: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Mobile Top Header Bar (< 768px) */}
        <div
          className="mobile-header-bar no-print"
          style={{
            display: 'none',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 14px',
            background: '#ffffff',
            borderBottom: '1px solid #e2e8f0',
            flexShrink: 0,
            zIndex: 30,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button
              onClick={() => setDrawerOpen(true)}
              style={{
                background: '#f1f5f9',
                border: '1px solid #cbd5e1',
                borderRadius: 8,
                padding: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#1e40af',
              }}
              title="Open Menu"
            >
              <Menu size={20} />
            </button>
            <div>
              <div style={{ fontWeight: 800, fontSize: 15, color: '#1e40af', lineHeight: 1.2 }}>EasyPad Rx</div>
              <div style={{ fontSize: 11, color: '#64748b' }}>
                {doctorProfile ? doctorProfile.name : 'Clinical System'}
              </div>
            </div>
          </div>

          <button
            onClick={() => handleMobileNav('builder')}
            className="btn-primary"
            style={{ fontSize: 12, padding: '6px 12px', borderRadius: 8 }}
          >
            <FilePlus size={14} /> New Rx
          </button>
        </div>

        {/* Viewport for Pages */}
        <main
          className="mobile-scroll-container"
          style={{ flex: 1, height: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column', minWidth: 0 }}
        >
          {activePage === 'dashboard' && <div style={{ flex: 1, height: '100%', overflowY: 'auto' }}><Dashboard /></div>}
          {activePage === 'builder' && <PrescriptionBuilder />}
          {activePage === 'history' && <div style={{ flex: 1, height: '100%', overflowY: 'auto' }}><HistoryPage /></div>}
          {activePage === 'templates' && <div style={{ flex: 1, height: '100%', overflowY: 'auto' }}><TemplatesPage /></div>}
          {activePage === 'settings' && <div style={{ flex: 1, height: '100%', overflowY: 'auto' }}><SettingsPage /></div>}
        </main>

        {/* Mobile Sticky Bottom Navigation (< 768px) */}
        <nav className="mobile-bottom-nav no-print">
          {MOBILE_NAV.map(item => {
            const Icon = item.icon;
            const isActive = activePage === item.key;
            return (
              <button
                key={item.key}
                className={`mobile-nav-btn ${isActive ? 'active' : ''}`}
                onClick={() => handleMobileNav(item.key)}
              >
                <Icon size={19} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
