import React from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { Dashboard } from './pages/Dashboard';
import { PrescriptionBuilder } from './pages/PrescriptionBuilder';
import { HistoryPage } from './pages/HistoryPage';
import { TemplatesPage } from './pages/TemplatesPage';
import { SettingsPage } from './pages/SettingsPage';
import { ToastProvider } from './components/ui/Toast';
import { useStore } from './store/useStore';

function AppContent() {
  const activePage = useStore(s => s.activePage);

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: '#f1f5f9' }}>
      {/* Sidebar */}
      <Sidebar />

      {/* Main content */}
      <main style={{ flex: 1, height: '100vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {activePage === 'dashboard' && <div style={{ flex: 1, height: '100%', overflowY: 'auto' }}><Dashboard /></div>}
        {activePage === 'builder' && <PrescriptionBuilder />}
        {activePage === 'history' && <div style={{ flex: 1, height: '100%', overflowY: 'auto' }}><HistoryPage /></div>}
        {activePage === 'templates' && <div style={{ flex: 1, height: '100%', overflowY: 'auto' }}><TemplatesPage /></div>}
        {activePage === 'settings' && <div style={{ flex: 1, height: '100%', overflowY: 'auto' }}><SettingsPage /></div>}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
}
