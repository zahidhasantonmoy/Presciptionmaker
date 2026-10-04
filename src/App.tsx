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
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
        {activePage === 'dashboard' && <Dashboard />}
        {activePage === 'builder' && (
          <div style={{ flex: 1, display: 'flex', overflow: 'hidden', height: '100%' }}>
            <PrescriptionBuilder />
          </div>
        )}
        {activePage === 'history' && <HistoryPage />}
        {activePage === 'templates' && <TemplatesPage />}
        {activePage === 'settings' && <SettingsPage />}
      </div>
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
