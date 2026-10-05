import React, { useState } from 'react';
import {
  Sparkles, ArrowRight, Download, Upload, Lock, Layers,
  Compass, CheckCircle2, Plus, Terminal
} from 'lucide-react';
import { SERVICES_REGISTRY } from '../registry';
import { ServiceId } from '../../utils/navigation';
import { useAuthStore } from '../auth/useAuthStore';
import { useStore } from '../../store/useStore';

export function HubDashboard({ onSelectService }: { onSelectService: (id: ServiceId) => void }) {
  const { lock } = useAuthStore();
  const prescriptions = useStore(s => s.prescriptions);

  const [ticketCount] = useState<number>(() => {
    try {
      const d = localStorage.getItem('personal_tickets_db');
      return d ? JSON.parse(d).length : 1;
    } catch {
      return 1;
    }
  });

  const [invoiceCount] = useState<number>(() => {
    try {
      const d = localStorage.getItem('personal_invoices_db');
      return d ? JSON.parse(d).length : 1;
    } catch {
      return 1;
    }
  });

  // Export full JSON backup
  const handleExportBackup = () => {
    const backup = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      localStorageDump: { ...localStorage },
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `service_suite_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Restore backup
  const handleRestoreBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const json = JSON.parse(reader.result as string);
        if (json.localStorageDump) {
          Object.entries(json.localStorageDump).forEach(([k, v]) => {
            localStorage.setItem(k, v as string);
          });
          alert('Backup restored successfully! The page will now reload.');
          window.location.reload();
        } else {
          alert('Invalid backup file format.');
        }
      } catch (err) {
        console.error(err);
        alert('Failed to parse backup JSON.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div style={{
      minHeight: '100%',
      background: 'linear-gradient(135deg, #090d16 0%, #0f172a 100%)',
      color: '#f8fafc',
      padding: '32px 40px',
      boxSizing: 'border-box',
      overflowY: 'auto',
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        {/* Top Header & Greeting */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 36,
          paddingBottom: 24,
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{
                background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                color: '#fff', fontSize: 11, fontWeight: 800, padding: '4px 10px',
                borderRadius: 20, letterSpacing: '0.05em', textTransform: 'uppercase'
              }}>
                Personal Workspace
              </span>
              <span style={{ color: '#10b981', fontSize: 13, display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
                All Services Ready
              </span>
            </div>
            <h1 style={{ fontSize: 32, fontWeight: 900, margin: '8px 0 4px', letterSpacing: '-0.02em' }}>
              Service Suite Hub
            </h1>
            <p style={{ fontSize: 14, color: '#94a3b8', margin: 0 }}>
              All your document tools in one place. No external servers or subdomains needed.
            </p>
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            <button
              onClick={handleExportBackup}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                background: 'rgba(255, 255, 255, 0.06)', border: '1px solid rgba(255, 255, 255, 0.12)',
                color: '#e2e8f0', padding: '10px 16px', borderRadius: 10, fontSize: 13, fontWeight: 600,
                cursor: 'pointer', transition: 'all 0.15s'
              }}
              title="Download full JSON backup of all your data"
            >
              <Download size={16} /> Backup All Data
            </button>
            <label style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: 'rgba(255, 255, 255, 0.06)', border: '1px solid rgba(255, 255, 255, 0.12)',
              color: '#e2e8f0', padding: '10px 16px', borderRadius: 10, fontSize: 13, fontWeight: 600,
              cursor: 'pointer'
            }}>
              <Upload size={16} /> Restore
              <input type="file" accept=".json" onChange={handleRestoreBackup} style={{ display: 'none' }} />
            </label>
            <button
              onClick={lock}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#fca5a5', padding: '10px 16px', borderRadius: 10, fontSize: 13, fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <Lock size={16} /> Lock
            </button>
          </div>
        </div>

        {/* Quick Stats Banner */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 16,
          marginBottom: 36
        }}>
          <div style={{
            background: 'rgba(30, 41, 59, 0.5)',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            borderRadius: 14,
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: 16
          }}>
            <div style={{
              width: 44, height: 44, borderRadius: 12,
              background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20
            }}>
              🏥
            </div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 800 }}>{prescriptions.length}</div>
              <div style={{ fontSize: 12, color: '#94a3b8' }}>Prescriptions Issued</div>
            </div>
          </div>

          <div style={{
            background: 'rgba(30, 41, 59, 0.5)',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            borderRadius: 14,
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: 16
          }}>
            <div style={{
              width: 44, height: 44, borderRadius: 12,
              background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20
            }}>
              🎟️
            </div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 800 }}>{ticketCount}</div>
              <div style={{ fontSize: 12, color: '#94a3b8' }}>Tickets Generated</div>
            </div>
          </div>

          <div style={{
            background: 'rgba(30, 41, 59, 0.5)',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            borderRadius: 14,
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: 16
          }}>
            <div style={{
              width: 44, height: 44, borderRadius: 12,
              background: 'rgba(168, 85, 247, 0.15)', color: '#c084fc',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20
            }}>
              🧾
            </div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 800 }}>{invoiceCount}</div>
              <div style={{ fontSize: 12, color: '#94a3b8' }}>Invoices Created</div>
            </div>
          </div>

          <div style={{
            background: 'rgba(30, 41, 59, 0.5)',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            borderRadius: 14,
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: 16
          }}>
            <div style={{
              width: 44, height: 44, borderRadius: 12,
              background: 'rgba(16, 185, 129, 0.15)', color: '#34d399',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20
            }}>
              ⚡
            </div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 800 }}>{SERVICES_REGISTRY.length}</div>
              <div style={{ fontSize: 12, color: '#94a3b8' }}>Active Tools</div>
            </div>
          </div>
        </div>

        {/* Section Heading */}
        <div style={{ marginBottom: 18 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0, letterSpacing: '-0.01em' }}>
            Available Services & Tools
          </h2>
          <p style={{ fontSize: 13, color: '#94a3b8', margin: '4px 0 0' }}>
            Click any service to launch its interface immediately.
          </p>
        </div>

        {/* Services Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: 20,
          marginBottom: 44
        }}>
          {SERVICES_REGISTRY.map(service => (
            <div
              key={service.id}
              style={{
                background: 'rgba(30, 41, 59, 0.6)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: 18,
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'all 0.2s ease',
                position: 'relative',
                overflow: 'hidden'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
              }}
            >
              <div>
                {/* Top row: Icon + Category + Badge */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                  <div style={{
                    width: 52, height: 52, borderRadius: 14,
                    background: service.gradient,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 26, boxShadow: `0 8px 16px -4px ${service.accentColor}40`
                  }}>
                    {service.icon}
                  </div>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    <span style={{
                      fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 6,
                      background: 'rgba(255, 255, 255, 0.08)', color: '#cbd5e1'
                    }}>
                      {service.category}
                    </span>
                    {service.badge && (
                      <span style={{
                        fontSize: 10, fontWeight: 800, padding: '3px 8px', borderRadius: 6,
                        background: `${service.accentColor}25`, color: service.accentColor,
                        border: `1px solid ${service.accentColor}40`
                      }}>
                        {service.badge}
                      </span>
                    )}
                  </div>
                </div>

                {/* Name & Description */}
                <h3 style={{ fontSize: 19, fontWeight: 800, margin: '0 0 4px', color: '#fff' }}>
                  {service.name}
                </h3>
                <div style={{ fontSize: 12, fontWeight: 600, color: service.accentColor, marginBottom: 8 }}>
                  {service.tagline}
                </div>
                <p style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.5, margin: 0 }}>
                  {service.description}
                </p>
              </div>

              {/* Path & Action */}
              <div style={{ marginTop: 22, paddingTop: 16, borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  marginBottom: 14, fontSize: 12, color: '#64748b'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Compass size={13} color="#94a3b8" />
                    <span>Direct Route:</span>
                  </div>
                  <code style={{
                    color: '#93c5fd', background: 'rgba(147, 197, 253, 0.08)',
                    padding: '2px 8px', borderRadius: 4, fontSize: 11, fontFamily: 'monospace'
                  }}>
                    {service.path}
                  </code>
                </div>

                <button
                  onClick={() => onSelectService(service.id)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    background: service.gradient,
                    color: '#fff',
                    border: 'none',
                    borderRadius: 10,
                    padding: '10px 16px',
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: `0 4px 12px ${service.accentColor}35`
                  }}
                >
                  <span>Launch Tool</span>
                  <ArrowRight size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Adding New Services Guide Box */}
        <div style={{
          background: 'rgba(15, 23, 42, 0.8)',
          border: '1px solid rgba(99, 102, 241, 0.25)',
          borderRadius: 18,
          padding: '24px 28px',
          boxShadow: '0 10px 30px -10px rgba(0,0,0,0.5)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8, background: 'rgba(99, 102, 241, 0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#818cf8'
            }}>
              <Layers size={18} />
            </div>
            <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>How to Add New Tools in the Future</h3>
          </div>

          <p style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.6, margin: '0 0 14px' }}>
            This platform uses a plug-and-play modular architecture. To add any new service:
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 14,
            background: 'rgba(0, 0, 0, 0.3)',
            padding: 16,
            borderRadius: 10,
            fontSize: 12,
          }}>
            <div>
              <strong style={{ color: '#818cf8', display: 'block', marginBottom: 4 }}>1. Add Service Component</strong>
              <span style={{ color: '#94a3b8' }}>Create your component in <code>src/services/your-tool/YourTool.tsx</code>.</span>
            </div>
            <div>
              <strong style={{ color: '#818cf8', display: 'block', marginBottom: 4 }}>2. Register in registry.ts</strong>
              <span style={{ color: '#94a3b8' }}>Add 1 entry to <code>SERVICES_REGISTRY</code> with its name, icon, and route path.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
