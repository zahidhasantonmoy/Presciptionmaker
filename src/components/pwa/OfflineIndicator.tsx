import React from 'react';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div
      className="no-print"
      style={{
        position: 'fixed',
        bottom: 16,
        left: 16,
        zIndex: 9998,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        borderRadius: 10,
        background: 'rgba(217, 119, 6, 0.96)',
        border: '1px solid rgba(254, 243, 199, 0.35)',
        padding: '7px 12px',
        fontSize: 12,
        fontWeight: 600,
        color: '#ffffff',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.35)',
        backdropFilter: 'blur(8px)',
      }}
    >
      <WifiOff size={14} />
      <span>Offline Mode — ক্যাশড ডেটা ও অফলাইন ফন্ট সচল আছে</span>
    </div>
  );
};
