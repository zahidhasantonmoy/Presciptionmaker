import React, { useState, useEffect } from 'react';
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

export function PrescriptionService() {
  const activePage = useStore(s => s.activePage);
  const [verifyRxId, setVerifyRxId] = useState<string | null>(getVerifyIdFromUrl);

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

  if (verifyRxId) {
    return (
      <PrescriptionVerificationPage
        rxId={verifyRxId}
        onBack={() => {
          setVerifyRxId(null);
          window.history.pushState({}, '', '/');
        }}
      />
    );
  }

  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden', background: '#f1f5f9' }}>
      {/* Sidebar */}
      <Sidebar />

      {/* Main content */}
      <main style={{ flex: 1, height: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {activePage === 'dashboard' && <div style={{ flex: 1, height: '100%', overflowY: 'auto' }}><Dashboard /></div>}
        {activePage === 'builder' && <PrescriptionBuilder />}
        {activePage === 'history' && <div style={{ flex: 1, height: '100%', overflowY: 'auto' }}><HistoryPage /></div>}
        {activePage === 'templates' && <div style={{ flex: 1, height: '100%', overflowY: 'auto' }}><TemplatesPage /></div>}
        {activePage === 'settings' && <div style={{ flex: 1, height: '100%', overflowY: 'auto' }}><SettingsPage /></div>}
      </main>
    </div>
  );
}
