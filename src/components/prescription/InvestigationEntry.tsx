import React, { useState } from 'react';
import { Plus, Trash2, Star } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import type { Investigation } from '../../types';
import { AutocompleteInput } from '../ui/AutocompleteInput';
import { useStore } from '../../store/useStore';

interface InvestigationEntryProps {
  investigations: Investigation[];
  onChange: (investigations: Investigation[]) => void;
}

const CATEGORIES = ['lab', 'imaging', 'other'];
const CATEGORY_LABELS: Record<string, string> = { lab: 'Lab', imaging: 'Imaging', other: 'Other' };
const CATEGORY_COLORS: Record<string, string> = { lab: 'badge-blue', imaging: 'badge-yellow', other: 'badge-gray' };

export function InvestigationEntry({ investigations, onChange }: InvestigationEntryProps) {
  const testCatalog = useStore(s => s.testCatalog);
  const addTestToCatalog = useStore(s => s.addTestToCatalog);
  const [inputValue, setInputValue] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('lab');

  const catalogOptions = testCatalog
    .sort((a, b) => (Number(b.isFavorite) - Number(a.isFavorite)) || (b.useCount - a.useCount))
    .map(t => ({
      id: t.id,
      label: t.name,
      sublabel: CATEGORY_LABELS[t.category],
      isFavorite: t.isFavorite,
      useCount: t.useCount,
    }));

  const addInvestigation = (name: string, category?: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    if (investigations.some(i => i.name.toLowerCase() === trimmed.toLowerCase())) return;
    onChange([...investigations, { id: uuidv4(), name: trimmed, category: category ?? selectedCategory }]);
    addTestToCatalog(trimmed, category ?? selectedCategory);
    setInputValue('');
  };

  const removeInvestigation = (id: string) => onChange(investigations.filter(i => i.id !== id));

  const updateInstruction = (id: string, instruction: string) => {
    onChange(investigations.map(i => i.id === id ? { ...i, instruction } : i));
  };

  return (
    <div>
      {/* Current tests */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
        {investigations.map(inv => (
          <div key={inv.id} style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: '#f0f4ff', border: '1px solid #c7d7fa', borderRadius: 8,
            padding: '5px 10px', fontSize: 13,
          }}>
            <span className={`badge ${CATEGORY_COLORS[inv.category ?? 'lab']}`} style={{ fontSize: 10, padding: '1px 5px' }}>
              {CATEGORY_LABELS[inv.category ?? 'lab']}
            </span>
            <span style={{ fontWeight: 600, color: '#1e40af' }}>{inv.name}</span>
            {inv.instruction && (
              <span style={{ color: '#6b7280', fontSize: 11 }}>({inv.instruction})</span>
            )}
            <button className="btn-icon" style={{ color: '#ef4444' }}
              onClick={() => removeInvestigation(inv.id)} title="Remove">
              <Trash2 size={12} />
            </button>
          </div>
        ))}
        {investigations.length === 0 && (
          <div style={{ color: '#9ca3af', fontSize: 13, padding: '6px 0' }}>No investigations added</div>
        )}
      </div>

      {/* Add */}
      <div style={{ display: 'flex', gap: 6 }}>
        <select className="form-select" style={{ width: 100, flexShrink: 0 }}
          value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)}>
          {CATEGORIES.map(c => <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>)}
        </select>
        <div style={{ flex: 1 }}>
          <AutocompleteInput
            value={inputValue}
            onChange={setInputValue}
            onSelect={(opt) => {
              const item = testCatalog.find(t => t.id === opt.id);
              addInvestigation(opt.label, item?.category ?? 'lab');
            }}
            options={catalogOptions}
            placeholder="Search or enter test name..."
            id="test-input"
          />
        </div>
        <button className="btn-primary" style={{ flexShrink: 0 }} onClick={() => addInvestigation(inputValue)}>
          <Plus size={15} /> Add
        </button>
      </div>

      {/* Favorites */}
      {testCatalog.filter(t => t.isFavorite).length > 0 && (
        <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          <span style={{ fontSize: 11, color: '#6b7280', alignSelf: 'center' }}>Favorites:</span>
          {testCatalog.filter(t => t.isFavorite).slice(0, 6).map(t => (
            <button key={t.id} className="badge badge-blue"
              style={{ cursor: 'pointer' }}
              onClick={() => addInvestigation(t.name, t.category)}>
              <Star size={10} fill="#1d4ed8" /> {t.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
