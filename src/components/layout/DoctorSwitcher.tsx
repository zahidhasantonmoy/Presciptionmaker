import React, { useState, useRef, useEffect } from 'react';
import { Stethoscope, Check, Plus, Settings, ChevronDown, Building2 } from 'lucide-react';
import { useStore } from '../../store/useStore';

interface DoctorSwitcherProps {
  compact?: boolean;
}

export function DoctorSwitcher({ compact }: DoctorSwitcherProps) {
  const {
    doctorProfiles, activeDoctorId, setActiveDoctorId,
    doctorProfile, setActivePage
  } = useStore();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentDoctor = doctorProfile || doctorProfiles.find(d => d.id === activeDoctorId) || doctorProfiles[0];

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      {compact ? (
        <button
          type="button"
          onClick={() => setOpen(!open)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            background: '#eff6ff',
            border: '1.5px solid #bfdbfe',
            borderRadius: 8,
            padding: '5px 10px',
            cursor: 'pointer',
            fontSize: 12.5,
            fontWeight: 600,
            color: '#1e40af',
            transition: 'all 0.15s ease',
          }}
          title="Switch Doctor / Chamber Profile"
        >
          <Stethoscope size={14} color="#2563eb" />
          <span style={{ maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {currentDoctor?.name || 'Select Doctor'}
          </span>
          <ChevronDown size={13} color="#64748b" />
        </button>
      ) : (
        <div
          onClick={() => setOpen(!open)}
          style={{
            margin: '0 10px 10px',
            background: 'rgba(255, 255, 255, 0.12)',
            border: '1px solid rgba(255, 255, 255, 0.18)',
            borderRadius: 10,
            padding: '9px 12px',
            cursor: 'pointer',
            transition: 'background 0.15s ease',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.18)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)')}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ color: 'white', fontSize: 13, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {currentDoctor?.name || 'Dr. Doctor Profile'}
              </div>
              {currentDoctor?.nameBn && (
                <div style={{ color: '#bfdbfe', fontSize: 11, fontFamily: 'var(--font-bn)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {currentDoctor.nameBn}
                </div>
              )}
              <div style={{ color: '#93c5fd', fontSize: 10.5, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {currentDoctor?.clinicName || currentDoctor?.specialty || 'General Practitioner'}
              </div>
            </div>
            <div style={{
              background: 'rgba(255, 255, 255, 0.15)',
              borderRadius: 6,
              padding: '3px 4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              flexShrink: 0,
            }}>
              <ChevronDown size={14} />
            </div>
          </div>
        </div>
      )}

      {/* Dropdown Menu */}
      {open && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: compact ? 0 : 10,
            right: compact ? 'auto' : 10,
            width: compact ? 260 : 'auto',
            background: '#ffffff',
            borderRadius: 10,
            border: '1.5px solid #cbd5e1',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.2), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
            zIndex: 1000,
            padding: '6px',
            marginTop: 4,
          }}
        >
          <div style={{ padding: '6px 8px 4px', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Doctor Profiles ({doctorProfiles.length})
          </div>

          <div style={{ maxHeight: 220, overflowY: 'auto' }}>
            {doctorProfiles.map(p => {
              const isSelected = p.id === activeDoctorId;
              return (
                <div
                  key={p.id}
                  onClick={() => {
                    setActiveDoctorId(p.id);
                    setOpen(false);
                  }}
                  style={{
                    padding: '8px 10px',
                    borderRadius: 7,
                    cursor: 'pointer',
                    background: isSelected ? '#eff6ff' : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 8,
                    marginBottom: 2,
                    transition: 'background 0.1s',
                  }}
                  onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = '#f8fafc'; }}
                  onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'transparent'; }}
                >
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: isSelected ? 700 : 600, color: isSelected ? '#1e40af' : '#1e293b' }}>
                      {p.name}
                    </div>
                    {p.clinicName && (
                      <div style={{ fontSize: 11, color: '#64748b', display: 'flex', alignItems: 'center', gap: 3, marginTop: 1 }}>
                        <Building2 size={11} /> {p.clinicName}
                      </div>
                    )}
                    {p.specialty && !p.clinicName && (
                      <div style={{ fontSize: 11, color: '#64748b' }}>
                        {p.specialty}
                      </div>
                    )}
                  </div>
                  {isSelected && (
                    <span style={{
                      background: '#2563eb',
                      color: 'white',
                      borderRadius: '50%',
                      width: 18,
                      height: 18,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      <Check size={11} strokeWidth={3} />
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          <div style={{ borderTop: '1px solid #e2e8f0', marginTop: 4, paddingTop: 4 }}>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                setActivePage('settings');
              }}
              style={{
                width: '100%',
                padding: '7px 10px',
                borderRadius: 6,
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 7,
                fontSize: 12.5,
                fontWeight: 600,
                color: '#2563eb',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = '#f1f5f9')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              <Settings size={14} /> Manage / Add Profiles
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
