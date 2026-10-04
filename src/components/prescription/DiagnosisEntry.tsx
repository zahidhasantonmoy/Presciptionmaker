import React, { useState } from 'react';
import { Plus, Trash2, Star } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import type { Diagnosis } from '../../types';
import { AutocompleteInput } from '../ui/AutocompleteInput';
import { useStore } from '../../store/useStore';

interface DiagnosisEntryProps {
  diagnoses: Diagnosis[];
  onChange: (diagnoses: Diagnosis[]) => void;
}

export function DiagnosisEntry({ diagnoses, onChange }: DiagnosisEntryProps) {
  const diagnosisCatalog = useStore(s => s.diagnosisCatalog);
  const addDiagnosisToCatalog = useStore(s => s.addDiagnosisToCatalog);
  const [inputValue, setInputValue] = useState('');

  const catalogOptions = diagnosisCatalog
    .sort((a, b) => (Number(b.isFavorite) - Number(a.isFavorite)) || (b.useCount - a.useCount))
    .map(d => ({ id: d.id, label: d.text, isFavorite: d.isFavorite, useCount: d.useCount }));

  const addDiagnosis = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    if (diagnoses.some(d => d.text.toLowerCase() === trimmed.toLowerCase())) return;
    onChange([...diagnoses, { id: uuidv4(), text: trimmed }]);
    addDiagnosisToCatalog(trimmed);
    setInputValue('');
  };

  const removeDiagnosis = (id: string) => onChange(diagnoses.filter(d => d.id !== id));

  const updateNote = (id: string, note: string) => {
    onChange(diagnoses.map(d => d.id === id ? { ...d, note } : d));
  };

  return (
    <div>
      {/* Current diagnoses */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 10 }}>
        {diagnoses.map((d, idx) => (
          <div key={d.id} style={{
            display: 'flex', alignItems: 'flex-start', gap: 8,
            background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, padding: '7px 10px',
          }}>
            <span style={{
              background: '#16a34a', color: 'white', borderRadius: '50%',
              width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 10, fontWeight: 700, flexShrink: 0, marginTop: 1,
            }}>{idx + 1}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#14532d' }}>{d.text}</div>
              <input
                className="form-input" placeholder="Add note (optional)"
                value={d.note ?? ''} onChange={e => updateNote(d.id, e.target.value)}
                style={{ marginTop: 4, fontSize: 12, padding: '4px 8px', border: '1px solid #d1fae5' }}
              />
            </div>
            <button className="btn-icon" style={{ color: '#ef4444', marginTop: 2 }}
              onClick={() => removeDiagnosis(d.id)} title="Remove diagnosis">
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>

      {/* Add new diagnosis */}
      <div style={{ display: 'flex', gap: 6 }}>
        <div style={{ flex: 1 }}>
          <AutocompleteInput
            value={inputValue}
            onChange={setInputValue}
            onSelect={(opt) => addDiagnosis(opt.label)}
            options={catalogOptions}
            placeholder="Type or search diagnosis..."
            id="diagnosis-input"
          />
        </div>
        <button className="btn-primary" style={{ flexShrink: 0 }}
          onClick={() => addDiagnosis(inputValue)}>
          <Plus size={15} /> Add
        </button>
      </div>

      {/* Quick favorites */}
      {diagnosisCatalog.filter(d => d.isFavorite).length > 0 && (
        <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          <span style={{ fontSize: 11, color: '#6b7280', alignSelf: 'center' }}>Favorites:</span>
          {diagnosisCatalog.filter(d => d.isFavorite).slice(0, 6).map(d => (
            <button key={d.id} className="badge badge-green"
              style={{ cursor: 'pointer' }}
              onClick={() => addDiagnosis(d.text)}>
              <Star size={10} fill="#16a34a" /> {d.text}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
