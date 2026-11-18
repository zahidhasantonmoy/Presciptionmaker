import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ChevronDown, Search, PenTool, X } from 'lucide-react';
import { RailwayStation, RAILWAY_STATIONS } from './railwayData';

interface SearchableStationSelectProps {
  label: string;
  value: string;
  valueBn?: string;
  onSelect: (stationName: string) => void;
  onManualMode: () => void;
  stations?: RailwayStation[];
  testId?: string;
}

export function SearchableStationSelect({
  label,
  value,
  valueBn,
  onSelect,
  onManualMode,
  stations = RAILWAY_STATIONS,
  testId,
}: SearchableStationSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const selectedStation = useMemo(
    () => stations.find(s => s.name.toLowerCase() === (value || '').toLowerCase()),
    [stations, value]
  );

  const filteredStations = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return stations;
    return stations.filter(
      st =>
        st.name.toLowerCase().includes(q) ||
        st.nameBn.includes(query.trim()) ||
        st.code.toLowerCase().includes(q) ||
        st.district.toLowerCase().includes(q)
    );
  }, [stations, query]);

  useEffect(() => {
    if (!open) return;
    const handleOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    const raf = requestAnimationFrame(() => searchInputRef.current?.focus());
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      cancelAnimationFrame(raf);
    };
  }, [open]);

  const handlePick = (stName: string) => {
    onSelect(stName);
    setOpen(false);
    setQuery('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setOpen(false);
    } else if (e.key === 'Enter' && filteredStations.length > 0) {
      e.preventDefault();
      handlePick(filteredStations[0].name);
    }
  };

  const displayEn = selectedStation?.name || value || 'Select station';
  const displayBn = selectedStation?.nameBn || valueBn;
  const displayCode = selectedStation?.code;

  return (
    <div ref={containerRef} style={{ position: 'relative', minWidth: 0 }}>
      <label
        style={{
          fontSize: 10.5,
          color: '#94a3b8',
          display: 'block',
          marginBottom: 4,
          fontWeight: 600,
        }}
      >
        {label}
      </label>

      <button
        type="button"
        data-testid={testId}
        onClick={() => setOpen(prev => !prev)}
        aria-expanded={open}
        style={{
          width: '100%',
          minHeight: 40,
          padding: '6px 10px',
          background: '#1e293b',
          border: open ? '1px solid #10b981' : '1px solid #334155',
          borderRadius: 7,
          color: '#f8fafc',
          fontSize: 12,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 6,
          cursor: 'pointer',
          textAlign: 'left',
          boxSizing: 'border-box',
          transition: 'border-color 150ms ease',
        }}
      >
        <span
          style={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            display: 'flex',
            alignItems: 'center',
            gap: 5,
            minWidth: 0,
          }}
        >
          <span style={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {displayEn}
          </span>
          {displayBn && displayBn !== displayEn && (
            <span style={{ color: '#94a3b8', fontSize: 11, flexShrink: 0 }}>
              ({displayBn})
            </span>
          )}
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
          {displayCode && (
            <span
              style={{
                fontSize: 10,
                fontFamily: 'monospace',
                fontVariantNumeric: 'tabular-nums',
                color: '#34d399',
                fontWeight: 700,
              }}
            >
              {displayCode}
            </span>
          )}
          <ChevronDown
            size={14}
            color="#94a3b8"
            style={{
              transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 150ms ease',
            }}
          />
        </span>
      </button>

      {open && (
        <div
          role="listbox"
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            right: 0,
            minWidth: 230,
            zIndex: 60,
            background: '#0f172a',
            border: '1px solid #334155',
            borderRadius: 8,
            boxShadow: '0 14px 32px rgba(0, 0, 0, 0.55)',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              padding: 8,
              borderBottom: '1px solid #1e293b',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              background: '#131e32',
            }}
          >
            <Search size={13} color="#94a3b8" style={{ flexShrink: 0 }} />
            <input
              ref={searchInputRef}
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="স্টেশন খুঁজুন (Dhaka / ঢাকা / IBD)..."
              style={{
                flex: 1,
                minWidth: 0,
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: '#f8fafc',
                fontSize: 12,
              }}
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  padding: 2,
                  display: 'flex',
                }}
                aria-label="Clear search"
              >
                <X size={12} />
              </button>
            )}
          </div>

          <div style={{ maxHeight: 220, overflowY: 'auto' }}>
            {filteredStations.length === 0 ? (
              <div style={{ padding: '12px 10px', fontSize: 11.5, color: '#94a3b8', textAlign: 'center' }}>
                কোনো স্টেশন পাওয়া যায়নি। ম্যানুয়ালি লিখতে নিচে ক্লিক করুন।
              </div>
            ) : (
              filteredStations.map(st => {
                const isSelected = st.name.toLowerCase() === (value || '').toLowerCase();
                return (
                  <button
                    key={st.code + '-' + st.name}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => handlePick(st.name)}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      background: isSelected ? 'rgba(16, 185, 129, 0.14)' : 'transparent',
                      border: 'none',
                      borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                      color: isSelected ? '#34d399' : '#e2e8f0',
                      fontSize: 12,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 8,
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                  >
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      <span style={{ fontWeight: isSelected ? 700 : 500 }}>{st.name}</span>
                      <span style={{ color: '#94a3b8', fontSize: 11, marginLeft: 5 }}>
                        {st.nameBn}
                      </span>
                    </span>
                    <span
                      style={{
                        fontSize: 10,
                        fontFamily: 'monospace',
                        fontVariantNumeric: 'tabular-nums',
                        color: '#64748b',
                        flexShrink: 0,
                      }}
                    >
                      {st.code}
                    </span>
                  </button>
                );
              })
            )}
          </div>

          <button
            type="button"
            onClick={() => {
              setOpen(false);
              onManualMode();
            }}
            style={{
              width: '100%',
              padding: '8px 10px',
              background: '#131e32',
              border: 'none',
              borderTop: '1px solid #334155',
              color: '#93c5fd',
              fontSize: 11.5,
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              cursor: 'pointer',
            }}
          >
            <PenTool size={12} /> Custom / অন্য স্টেশন লিখুন
          </button>
        </div>
      )}
    </div>
  );
}
