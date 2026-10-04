import React, { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { Search, Star } from 'lucide-react';

interface AutocompleteOption {
  id: string;
  label: string;
  sublabel?: string;
  isFavorite?: boolean;
  useCount?: number;
}

interface AutocompleteInputProps {
  value: string;
  onChange: (value: string) => void;
  onSelect: (option: AutocompleteOption) => void;
  options: AutocompleteOption[];
  placeholder?: string;
  className?: string;
  isBangla?: boolean;
  label?: string;
  required?: boolean;
  id?: string;
}

export function AutocompleteInput({
  value, onChange, onSelect, options, placeholder, className, isBangla, label, required, id
}: AutocompleteInputProps) {
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const filtered = value.length >= 1
    ? options.filter(o => o.label.toLowerCase().includes(value.toLowerCase())).slice(0, 10)
    : options.filter(o => o.isFavorite || (o.useCount ?? 0) > 3).slice(0, 8);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleKeyDown = (e: KeyboardEvent) => {
    if (!open) { if (e.key === 'ArrowDown') setOpen(true); return; }
    if (e.key === 'ArrowDown') setHighlighted(h => Math.min(h + 1, filtered.length - 1));
    if (e.key === 'ArrowUp') setHighlighted(h => Math.max(h - 1, 0));
    if (e.key === 'Enter' && filtered[highlighted]) {
      e.preventDefault();
      onSelect(filtered[highlighted]);
      setOpen(false);
    }
    if (e.key === 'Escape') setOpen(false);
  };

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%' }}>
      {label && <label className="form-label" htmlFor={id}>{label}{required && ' *'}</label>}
      <div style={{ position: 'relative' }}>
        <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
        <input
          id={id}
          type="text"
          value={value}
          onChange={e => { onChange(e.target.value); setOpen(true); setHighlighted(0); }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={`form-input ${isBangla ? 'bn' : ''} ${className ?? ''}`}
          style={{ paddingLeft: 30 }}
          autoComplete="off"
          required={required}
          aria-autocomplete="list"
          aria-expanded={open}
        />
      </div>
      {open && filtered.length > 0 && (
        <div className="autocomplete-dropdown" role="listbox">
          {filtered.map((opt, idx) => (
            <div
              key={opt.id}
              className={`autocomplete-item ${idx === highlighted ? 'highlighted' : ''}`}
              role="option"
              aria-selected={idx === highlighted}
              onMouseDown={() => { onSelect(opt); setOpen(false); onChange(opt.label); }}
              onMouseEnter={() => setHighlighted(idx)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                {opt.isFavorite && <Star size={11} fill="#f59e0b" color="#f59e0b" />}
                <span style={{ fontWeight: 500 }}>{opt.label}</span>
              </div>
              {opt.sublabel && <div style={{ fontSize: 11, color: '#6b7280', marginTop: 1 }}>{opt.sublabel}</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
