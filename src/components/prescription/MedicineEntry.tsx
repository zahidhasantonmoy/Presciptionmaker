import React, { useState } from 'react';
import { Plus, Trash2, Star, Copy, GripVertical, ChevronDown, ChevronUp } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import type { PrescriptionMedicine, MedicineForm } from '../../types';
import { AutocompleteInput } from '../ui/AutocompleteInput';
import { useStore } from '../../store/useStore';

const MEDICINE_FORMS: { value: MedicineForm; label: string }[] = [
  { value: 'tablet', label: 'Tablet' },
  { value: 'capsule', label: 'Capsule' },
  { value: 'syrup', label: 'Syrup/Susp.' },
  { value: 'injection', label: 'Injection' },
  { value: 'cream', label: 'Cream' },
  { value: 'ointment', label: 'Ointment' },
  { value: 'drops', label: 'Drops' },
  { value: 'inhaler', label: 'Inhaler' },
  { value: 'suppository', label: 'Suppository' },
  { value: 'other', label: 'Other' },
];

const TIMING_OPTIONS = [
  'After meal', 'Before meal', 'With meal', 'Empty stomach',
  'খাবারের পরে', 'খাবারের আগে', 'খাবারের সাথে', 'খালি পেটে',
  'At bedtime', 'Morning only', 'Evening only',
];

const DURATION_OPTIONS = [
  '3 days', '5 days', '7 days', '10 days', '14 days',
  '1 month', '2 months', '3 months', 'Continue',
  '৩ দিন', '৫ দিন', '১ সপ্তাহ', '১ মাস',
];

function emptyMedicine(): PrescriptionMedicine {
  return {
    id: uuidv4(), name: '', form: 'tablet',
    morning: '1', afternoon: '0', evening: '1',
    timing: 'After meal', duration: '7 days',
  };
}

interface MedicineEntryProps {
  medicines: PrescriptionMedicine[];
  onChange: (medicines: PrescriptionMedicine[]) => void;
}

export function MedicineEntry({ medicines, onChange }: MedicineEntryProps) {
  const medicineCatalog = useStore(s => s.medicineCatalog);
  const addToCatalog = useStore(s => s.addToCatalog);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const catalogOptions = medicineCatalog
    .sort((a, b) => (b.useCount ?? 0) - (a.useCount ?? 0))
    .map(m => ({ id: m.id, label: m.name, sublabel: m.genericName, isFavorite: m.isFavorite, useCount: m.useCount }));

  const addMedicine = () => {
    const m = emptyMedicine();
    onChange([...medicines, m]);
    setExpandedId(m.id);
  };

  const removeMedicine = (id: string) => onChange(medicines.filter(m => m.id !== id));

  const duplicateMedicine = (med: PrescriptionMedicine) => {
    const dup = { ...med, id: uuidv4() };
    const idx = medicines.findIndex(m => m.id === med.id);
    const updated = [...medicines];
    updated.splice(idx + 1, 0, dup);
    onChange(updated);
  };

  const updateMedicine = (id: string, updates: Partial<PrescriptionMedicine>) => {
    onChange(medicines.map(m => m.id === id ? { ...m, ...updates } : m));
  };

  const handleSelectFromCatalog = (id: string, option: { id: string; label: string; sublabel?: string }) => {
    const catalogItem = medicineCatalog.find(m => m.id === option.id);
    updateMedicine(id, {
      name: option.label,
      genericName: option.sublabel,
      form: catalogItem?.form ?? 'tablet',
      strength: catalogItem?.strength,
    });
    // Track usage
    addToCatalog({ name: option.label, genericName: option.sublabel, form: catalogItem?.form ?? 'tablet', strength: catalogItem?.strength });
  };

  const handleNameChange = (id: string, name: string) => {
    updateMedicine(id, { name });
  };

  const handleNameBlur = (med: PrescriptionMedicine) => {
    if (med.name.trim()) {
      addToCatalog({ name: med.name, genericName: med.genericName, form: med.form, strength: med.strength });
    }
  };

  return (
    <div>
      {/* Medicine List */}
      {medicines.length === 0 && (
        <div style={{
          textAlign: 'center', padding: '20px', color: '#94a3b8',
          border: '2px dashed #e2e8f0', borderRadius: 10, marginBottom: 10
        }}>
          <div style={{ fontSize: 32, marginBottom: 6 }}>💊</div>
          <div style={{ fontSize: 13 }}>No medicines added yet. Click "Add Medicine" below.</div>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {medicines.map((med, idx) => {
          const isExpanded = expandedId === med.id;
          return (
            <div key={med.id} className="medicine-card">
              {/* Medicine Header Row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className="drag-handle" title="Drag to reorder"><GripVertical size={16} /></span>
                <span style={{
                  background: '#1e40af', color: 'white', borderRadius: '50%',
                  width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 700, flexShrink: 0,
                }}>{idx + 1}</span>

                {/* Medicine name autocomplete */}
                <div style={{ flex: 1 }}>
                  <AutocompleteInput
                    value={med.name}
                    onChange={(v) => handleNameChange(med.id, v)}
                    onSelect={(opt) => handleSelectFromCatalog(med.id, opt)}
                    options={catalogOptions}
                    placeholder="Medicine name (e.g. Tab. Napa 500mg)"
                    id={`med-name-${med.id}`}
                  />
                </div>

                {/* Dose quick entry */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                  <input
                    className="form-input" style={{ width: 36, padding: '6px 4px', textAlign: 'center', fontSize: 13 }}
                    value={med.morning} onChange={e => updateMedicine(med.id, { morning: e.target.value })}
                    title="Morning" aria-label="Morning dose"
                  />
                  <span style={{ color: '#94a3b8', fontSize: 11 }}>+</span>
                  <input
                    className="form-input" style={{ width: 36, padding: '6px 4px', textAlign: 'center', fontSize: 13 }}
                    value={med.afternoon} onChange={e => updateMedicine(med.id, { afternoon: e.target.value })}
                    title="Afternoon" aria-label="Afternoon dose"
                  />
                  <span style={{ color: '#94a3b8', fontSize: 11 }}>+</span>
                  <input
                    className="form-input" style={{ width: 36, padding: '6px 4px', textAlign: 'center', fontSize: 13 }}
                    value={med.evening} onChange={e => updateMedicine(med.id, { evening: e.target.value })}
                    title="Evening" aria-label="Evening dose"
                  />
                </div>

                {/* Actions */}
                <button className="btn-icon" onClick={() => duplicateMedicine(med)} title="Duplicate"><Copy size={14} /></button>
                <button className="btn-icon" onClick={() => setExpandedId(isExpanded ? null : med.id)} title="More options">
                  {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>
                <button className="btn-icon" style={{ color: '#ef4444' }} onClick={() => removeMedicine(med.id)} title="Remove">
                  <Trash2 size={14} />
                </button>
              </div>

              {/* Expanded Details */}
              {isExpanded && (
                <div style={{ marginTop: 10, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 8 }}>
                  {/* Form */}
                  <div>
                    <label className="form-label">Form</label>
                    <select className="form-select" value={med.form}
                      onChange={e => updateMedicine(med.id, { form: e.target.value as MedicineForm })}>
                      {MEDICINE_FORMS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                    </select>
                  </div>

                  {/* Timing */}
                  <div>
                    <label className="form-label">Timing</label>
                    <select className="form-select" value={med.timing ?? ''}
                      onChange={e => updateMedicine(med.id, { timing: e.target.value })}>
                      <option value="">None</option>
                      {TIMING_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>

                  {/* Duration */}
                  <div>
                    <label className="form-label">Duration</label>
                    <select className="form-select" value={med.duration ?? ''}
                      onChange={e => updateMedicine(med.id, { duration: e.target.value })}>
                      <option value="">None</option>
                      {DURATION_OPTIONS.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>

                  {/* Strength */}
                  <div>
                    <label className="form-label">Strength</label>
                    <input className="form-input" value={med.strength ?? ''} placeholder="e.g. 500mg"
                      onChange={e => updateMedicine(med.id, { strength: e.target.value })} />
                  </div>

                  {/* Instruction (full width) */}
                  <div style={{ gridColumn: '1/-1' }}>
                    <label className="form-label">Special Instruction (Bangla/English)</label>
                    <input className="form-input" value={med.instruction ?? ''} placeholder="e.g. খাবারের আধ ঘন্টা আগে / Take with full glass of water"
                      onChange={e => updateMedicine(med.id, { instruction: e.target.value })} />
                  </div>
                </div>
              )}

              {/* Quick dose preview */}
              {!isExpanded && med.name && (
                <div style={{ marginTop: 4, fontSize: 11, color: '#64748b', paddingLeft: 54 }}>
                  {med.morning}+{med.afternoon}+{med.evening}
                  {med.timing && ` · ${med.timing}`}
                  {med.duration && ` · ${med.duration}`}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <button className="btn-secondary" style={{ marginTop: 10, width: '100%' }} onClick={addMedicine}>
        <Plus size={15} /> Add Medicine
      </button>
    </div>
  );
}
