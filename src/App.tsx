import React, { useState, useEffect, useTransition } from 'react';
import { ToastProvider } from './components/ui/Toast';
import { detectActiveService, SERVICE_PATHS, ServiceId } from './utils/navigation';
import { useAuthStore } from './services/auth/useAuthStore';
import { LockScreen } from './services/auth/LockScreen';
import { OmniBar } from './components/layout/OmniBar';
import { HubDashboard } from './services/hub/HubDashboard';
import { SERVICES_REGISTRY, getServiceById } from './services/registry';
import { PrescriptionVerificationPage } from './pages/PrescriptionVerificationPage';

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

function MainPlatform() {
  const { isAuthenticated } = useAuthStore();
  const [activeService, setActiveService] = useState<ServiceId>(() => detectActiveService());
  const [verifyRxId, setVerifyRxId] = useState<string | null>(getVerifyIdFromUrl);
  const [, startTransition] = useTransition();

  // Listen to popstate and browser navigation
  useEffect(() => {
    const handleUrlChange = () => {
      setVerifyRxId(getVerifyIdFromUrl());
      setActiveService(detectActiveService());
    };

    window.addEventListener('popstate', handleUrlChange);
    window.addEventListener('hashchange', handleUrlChange);

    return () => {
      window.removeEventListener('popstate', handleUrlChange);
      window.removeEventListener('hashchange', handleUrlChange);
    };
  }, []);

  const switchService = (id: ServiceId) => {
    startTransition(() => {
      setActiveService(id);
    });

    const targetPath = SERVICE_PATHS[id] || '/';
    if (window.location.pathname !== targetPath) {
      window.history.pushState({}, '', targetPath);
    }
  };

  // 1. If someone accesses a verification link (e.g. scanning a QR code), allow public verification without requiring login
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

  // 2. Personal Auth Barrier: If not unlocked, display Lock Screen
  if (!isAuthenticated) {
    return <LockScreen onUnlocked={() => setActiveService(detectActiveService())} />;
  }

  // 3. Render active service or Hub Dashboard
  const currentService = getServiceById(activeService);
  const ServiceComponent = currentService ? currentService.component : null;
  const isAppTool = activeService !== 'hub';

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100dvh',
      height: isAppTool ? '100dvh' : 'auto',
      width: '100%',
      maxWidth: '100vw',
      overflowX: 'hidden',
      overflowY: isAppTool ? 'hidden' : 'visible',
      background: '#090d16',
    }}>
      {/* Universal OmniBar on top */}
      <OmniBar activeService={activeService} onSwitchService={switchService} />

      {/* Main Content Viewport */}
      <main
        id="main-content-viewport"
        style={{
          flex: 1,
          minHeight: isAppTool ? 0 : 'auto',
          display: 'flex',
          flexDirection: 'column',
          overflowY: isAppTool ? 'hidden' : 'visible',
          overflowX: 'hidden',
          WebkitOverflowScrolling: 'touch',
          position: 'relative',
          width: '100%',
        }}
      >
        {activeService === 'hub' ? (
          <HubDashboard onSelectService={switchService} />
        ) : ServiceComponent ? (
          <ServiceComponent />
        ) : (
          <HubDashboard onSelectService={switchService} />
        )}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <MainPlatform />
    </ToastProvider>
  );
}
