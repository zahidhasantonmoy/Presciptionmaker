import React, { useState } from 'react';
import {
  Grid, Lock, ChevronDown, Check, Maximize2, Sparkles
} from 'lucide-react';
import { ServiceId, SERVICE_PATHS } from '../../utils/navigation';
import { SERVICES_REGISTRY, getServiceById } from '../../services/registry';
import { useAuthStore } from '../../services/auth/useAuthStore';

interface OmniBarProps {
  activeService: ServiceId;
  onSwitchService: (id: ServiceId) => void;
}

export function OmniBar({ activeService, onSwitchService }: OmniBarProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { lock } = useAuthStore();

  const currentServiceMeta = getServiceById(activeService);

  if (isCollapsed) {
    return (
      <div className="no-print" style={{
        position: 'fixed',
        top: 10,
        right: 12,
        zIndex: 9999,
      }}>
        <button
          onClick={() => setIsCollapsed(false)}
          style={{
            background: 'rgba(15, 23, 42, 0.85)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            color: '#cbd5e1',
            borderRadius: 20,
            padding: '6px 12px',
            fontSize: 12,
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          }}
          title="Expand Services Bar"
        >
          <Grid size={14} />
          <span>Services</span>
          <Maximize2 size={12} />
        </button>
      </div>
    );
  }

  return (
    <header className="no-print" style={{
      height: 42,
      background: 'rgba(15, 23, 42, 0.95)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 16px',
      color: '#f8fafc',
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      fontSize: 12,
      zIndex: 999,
      flexShrink: 0,
    }}>
      {/* Left: Brand & App Switcher */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, position: 'relative' }}>
        <button
          onClick={() => onSwitchService('hub')}
          style={{
            background: 'none',
            border: 'none',
            color: '#fff',
            fontWeight: 800,
            fontSize: 13,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            cursor: 'pointer',
            padding: '4px 6px',
            borderRadius: 6,
          }}
          title="Back to Suite Hub"
        >
          <span style={{ fontSize: 16 }}>⚡</span>
          <span>Central Hub</span>
        </button>

        <span style={{ color: '#475569' }}>/</span>

        {/* Dropdown Toggle */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            style={{
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: 6,
              padding: '4px 10px',
              color: '#fff',
              fontSize: 12,
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              cursor: 'pointer',
            }}
          >
            <span>{currentServiceMeta ? `${currentServiceMeta.icon} ${currentServiceMeta.name}` : 'Hub Dashboard'}</span>
            <ChevronDown size={14} color="#94a3b8" />
          </button>

          {/* Switcher Dropdown */}
          {dropdownOpen && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 6px)',
                left: 0,
                width: 250,
                background: '#0f172a',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: 12,
                boxShadow: '0 15px 30px rgba(0, 0, 0, 0.6)',
                padding: '6px',
                zIndex: 1000,
              }}
              onMouseLeave={() => setDropdownOpen(false)}
            >
              {/* Central Hub Entry */}
              <div
                onClick={() => {
                  onSwitchService('hub');
                  setDropdownOpen(false);
                }}
                style={{
                  padding: '8px 10px',
                  borderRadius: 6,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  background: activeService === 'hub' ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
                  color: activeService === 'hub' ? '#818cf8' : '#e2e8f0',
                  marginBottom: 4,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span>⚡</span>
                  <div>
                    <div style={{ fontWeight: 600 }}>Central Hub</div>
                    <div style={{ fontSize: 10, color: '#64748b' }}>/ (Overview)</div>
                  </div>
                </div>
                {activeService === 'hub' && <Check size={14} />}
              </div>

              <div style={{ height: 1, background: 'rgba(255, 255, 255, 0.06)', margin: '4px 0' }} />

              {/* Services List */}
              {SERVICES_REGISTRY.map(s => (
                <div
                  key={s.id}
                  onClick={() => {
                    onSwitchService(s.id);
                    setDropdownOpen(false);
                  }}
                  style={{
                    padding: '8px 10px',
                    borderRadius: 6,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    background: activeService === s.id ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
                    color: activeService === s.id ? '#818cf8' : '#e2e8f0',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={(e) => {
                    if (activeService !== s.id) e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                  }}
                  onMouseLeave={(e) => {
                    if (activeService !== s.id) e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 16 }}>{s.icon}</span>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 12 }}>{s.name}</div>
                      <div style={{ fontSize: 10, color: '#64748b' }}>{s.path}</div>
                    </div>
                  </div>
                  {activeService === s.id && <Check size={14} />}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right Controls: Route Path indicator, Lock, Collapse */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {/* Route Path Indicator */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          color: '#94a3b8',
          background: 'rgba(255, 255, 255, 0.04)',
          padding: '3px 8px',
          borderRadius: 6,
          fontFamily: 'monospace',
          fontSize: 11,
        }}>
          <span style={{ color: '#818cf8' }}>route:</span>
          <span>{currentServiceMeta ? currentServiceMeta.path : '/'}</span>
        </div>

        {/* Lock Session */}
        <button
          onClick={lock}
          style={{
            background: 'none',
            border: 'none',
            color: '#94a3b8',
            cursor: 'pointer',
            padding: '4px 6px',
            borderRadius: 6,
            display: 'flex',
            alignItems: 'center',
            gap: 4,
          }}
          title="Lock session"
        >
          <Lock size={13} />
          <span>Lock</span>
        </button>

        {/* Collapse Button */}
        <button
          onClick={() => setIsCollapsed(true)}
          style={{
            background: 'none',
            border: 'none',
            color: '#64748b',
            cursor: 'pointer',
            padding: '4px',
            display: 'flex',
            alignItems: 'center',
          }}
          title="Minimize bar"
        >
          <Maximize2 size={13} style={{ transform: 'rotate(180deg)' }} />
        </button>
      </div>
    </header>
  );
}
