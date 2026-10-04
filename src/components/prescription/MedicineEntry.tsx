import React, { useState } from 'react';
import { Plus, Trash2, Star, Copy, GripVertical, ChevronDown, ChevronUp, Calculator, ShieldAlert, AlertTriangle } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import type { PrescriptionMedicine, MedicineForm } from '../../types';
import { AutocompleteInput } from '../ui/AutocompleteInput';
import { useStore } from '../../store/useStore';
import {
  checkDrugAllergy, getPregnancySafety, detectDuplicateMedicines,
  normalizeMedicineName, detectGastroprotectionNeed
} from '../../utils/clinicalSafety';
import { PediatricDoseCalculatorModal } from '../modals/PediatricDoseCalculatorModal';
import { useToast } from '../ui/Toast';

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
  patientAllergies?: string;
  patientWeight?: string;
}

export function MedicineEntry({ medicines, onChange, patientAllergies, patientWeight }: MedicineEntryProps) {
  const medicineCatalog = useStore(s => s.medicineCatalog);
  const addToCatalog = useStore(s => s.addToCatalog);
  const { showToast } = useToast();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showPediaModal, setShowPediaModal] = useState(false);

  // Clinical safety check: Detect duplicate medicines & gastroprotection need
  const duplicateIssues = detectDuplicateMedicines(medicines);
  const gastroAlert = detectGastroprotectionNeed(medicines);

  const handleAddPpi = () => {
    const ppi: PrescriptionMedicine = {
      id: uuidv4(),
      name: 'TAB PANTONIX 20mg',
      genericName: 'Pantoprazole',
      form: 'tablet',
      strength: '20mg',
      morning: '১',
      afternoon: '০',
      evening: '১',
      timing: 'খাওয়ার ৩০ মিনিট আগে',
      duration: '১৪ দিন',
      instruction: 'খাওয়ার ৩০ মিনিট আগে',
    };
    onChange([...medicines, ppi]);
    showToast('🛡️ Tab. Pantonix 20mg যোগ করা হয়েছে (Gastroprotection Active)!', 'success');
  };

  const catalogOptions = medicineCatalog
    .sort((a, b) => (b.useCount ?? 0) - (a.useCount ?? 0))
    .map(m => {
      const isAlreadyAdded = medicines.some(med =>
        normalizeMedicineName(med.name) === normalizeMedicineName(m.name) ||
        (med.genericName && m.genericName && med.genericName.toLowerCase().trim() === m.genericName.toLowerCase().trim())
      );
      return {
        id: m.id,
        label: m.name,
        sublabel: isAlreadyAdded ? `${m.genericName ?? ''} • ⚠️ Already in Rx` : m.genericName,
        isFavorite: m.isFavorite,
        useCount: m.useCount,
      };
    });

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
    showToast(`Medicine duplicated as row #${idx + 2}`, 'info');
  };

  const updateMedicine = (id: string, updates: Partial<PrescriptionMedicine>) => {
    onChange(medicines.map(m => m.id === id ? { ...m, ...updates } : m));
  };

  const handleSelectFromCatalog = (id: string, option: { id: string; label: string; sublabel?: string }) => {
    const catalogItem = medicineCatalog.find(m => m.id === option.id);
    
    // Check if selecting an item that is already in another row
    const existing = medicines.find(m =>
      m.id !== id && (
        normalizeMedicineName(m.name) === normalizeMedicineName(option.label) ||
        (m.genericName && option.sublabel && m.genericName.toLowerCase().trim() === option.sublabel.toLowerCase().trim())
      )
    );
    if (existing) {
      showToast(`⚠️ সতর্কতা: "${option.label}" ইতিমধ্যে প্রেসক্রিপশনে যুক্ত আছে!`, 'warning');
    }

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
      // Duplicate check on blur
      const isDup = medicines.some(m => m.id !== med.id && normalizeMedicineName(m.name) === normalizeMedicineName(med.name) && normalizeMedicineName(m.name).length > 2);
      if (isDup) {
        showToast(`⚠️ সতর্কতা: "${med.name}" ইতিমধ্যে প্রেসক্রিপশনে বিদ্যমান!`, 'warning');
      }
    }
  };

  return (
    <div>
      {/* Duplicate Medicine Warning Banner */}
      {duplicateIssues.length > 0 && (
        <div style={{
          background: '#fffbeb',
          border: '1.5px solid #f59e0b',
          borderRadius: 10,
          padding: '10px 14px',
          marginBottom: 12,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: '#92400e' }}>
            <AlertTriangle size={18} color="#d97706" style={{ flexShrink: 0 }} />
            <div>
              <strong>ডুপ্লিকেট ওষুধ সতর্কতা ({duplicateIssues.length}টি সনাক্ত):</strong>{' '}
              একই ওষুধ বা একই সক্রিয় জেনেরিক উপাদান একাধিকবার প্রেসক্রিপশনে এসেছে। ওভারডোজ এড়াতে নিচের চিহ্নিত ওষুধগুলো যাচাই করুন।
            </div>
          </div>
        </div>
      )}

      {/* Smart Gastroprotection Reminder Banner */}
      {gastroAlert.needsPpi && (
        <div style={{
          background: '#eff6ff',
          border: '1.5px solid #60a5fa',
          borderRadius: 10,
          padding: '10px 14px',
          marginBottom: 12,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: '#1e40af' }}>
            <ShieldAlert size={18} color="#2563eb" style={{ flexShrink: 0 }} />
            <div>
              <strong>স্মার্ট ড্রাগ সেফটি রিমাইন্ডার:</strong>{' '}
              {gastroAlert.warningBn}
            </div>
          </div>
          <button
            type="button"
            className="btn-sm"
            style={{
              background: '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: 6,
              padding: '6px 12px',
              fontWeight: 700,
              fontSize: 12,
              whiteSpace: 'nowrap',
              cursor: 'pointer'
            }}
            onClick={handleAddPpi}
          >
            + Add Pantonix 20mg
          </button>
        </div>
      )}

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
          const allergyAlert = checkDrugAllergy(med.name, med.genericName, patientAllergies);
          const pregSafety = getPregnancySafety(med.name, med.genericName);
          const dupIssue = duplicateIssues.find(d => d.medicineId === med.id);
          const hasIssue = allergyAlert.hasAlert || !!dupIssue;

          return (
            <div
              key={med.id}
              className="medicine-card"
              style={{
                borderColor: allergyAlert.hasAlert ? '#f87171' : dupIssue ? '#f59e0b' : '#cbd5e1',
                background: allergyAlert.hasAlert ? '#fffafa' : dupIssue ? '#fffdf7' : '#ffffff',
                borderWidth: hasIssue ? '2px' : '1.5px',
              }}
            >
              {/* Top Row: Index + Form + Name + Quick Actions */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <span
                  style={{
                    background: allergyAlert.hasAlert ? '#dc2626' : '#1e40af',
                    color: 'white',
                    borderRadius: '50%',
                    width: 24,
                    height: 24,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 12,
                    fontWeight: 700,
                    flexShrink: 0,
                  }}
                >
                  {idx + 1}
                </span>

                {/* Form selector */}
                <div style={{ width: 110, flexShrink: 0 }}>
                  <select
                    className="form-select"
                    value={med.form}
                    onChange={e => updateMedicine(med.id, { form: e.target.value as MedicineForm })}
                    style={{ padding: '8px 10px', fontSize: 13, fontWeight: 600, background: '#f8fafc' }}
                  >
                    {MEDICINE_FORMS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                  </select>
                </div>

                {/* Medicine Name Autocomplete */}
                <div style={{ flex: 1, minWidth: 220, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ flex: 1 }}>
                    <AutocompleteInput
                      value={med.name}
                      onChange={(v) => handleNameChange(med.id, v)}
                      onSelect={(opt) => handleSelectFromCatalog(med.id, opt)}
                      options={catalogOptions}
                      placeholder="Medicine name (e.g. Napa 500mg, Seclo 20mg, Azithrocin 500)"
                      id={`med-name-${med.id}`}
                    />
                  </div>
                  {pregSafety.category !== 'Unknown' && (
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        padding: '4px 8px',
                        borderRadius: 6,
                        background: pregSafety.level === 'danger' ? '#fef2f2' : (pregSafety.level === 'caution' ? '#fffbeb' : '#f0fdf4'),
                        color: pregSafety.level === 'danger' ? '#b91c1c' : (pregSafety.level === 'caution' ? '#b45309' : '#15803d'),
                        border: `1px solid ${pregSafety.level === 'danger' ? '#fca5a5' : (pregSafety.level === 'caution' ? '#fde68a' : '#bbf7d0')}`,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                        flexShrink: 0,
                      }}
                      title={pregSafety.warningEn}
                    >
                      {pregSafety.level === 'danger' && <AlertTriangle size={12} />}
                      Preg: {pregSafety.category}
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                  <button className="btn-icon" onClick={() => duplicateMedicine(med)} title="Duplicate medicine">
                    <Copy size={16} />
                  </button>
                  <button
                    className="btn-icon"
                    onClick={() => setExpandedId(isExpanded ? null : med.id)}
                    title={isExpanded ? 'Hide extra fields' : 'More fields (Strength, Route)'}
                    style={isExpanded ? { background: '#e0e7ff', color: '#1e40af' } : {}}
                  >
                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                  <button
                    className="btn-icon"
                    style={{ color: '#ef4444' }}
                    onClick={() => removeMedicine(med.id)}
                    title="Remove medicine"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {/* Allergy Warning Alert Banner */}
              {allergyAlert.hasAlert && (
                <div
                  style={{
                    marginTop: 8,
                    padding: '8px 12px',
                    background: '#fef2f2',
                    border: '1.5px solid #f87171',
                    borderRadius: 8,
                    color: '#991b1b',
                    fontSize: 12,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  <ShieldAlert size={18} color="#dc2626" style={{ flexShrink: 0 }} />
                  <div>
                    <span style={{ fontWeight: 700 }}>{allergyAlert.warningEn}</span>
                    <span style={{ marginLeft: 6, fontFamily: 'var(--font-bn)' }}>({allergyAlert.warningBn})</span>
                  </div>
                </div>
              )}

              {/* Duplicate Medicine Warning Banner */}
              {dupIssue && (
                <div
                  style={{
                    marginTop: 8,
                    padding: '8px 12px',
                    background: '#fffbeb',
                    border: '1.5px solid #f59e0b',
                    borderRadius: 8,
                    color: '#92400e',
                    fontSize: 12,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 8,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <AlertTriangle size={18} color="#d97706" style={{ flexShrink: 0 }} />
                    <div>
                      <span style={{ fontWeight: 700 }}>{dupIssue.warningEn}</span>
                      <span style={{ marginLeft: 6, fontFamily: 'var(--font-bn)' }}>({dupIssue.warningBn})</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="btn-danger btn-sm"
                    style={{ padding: '2px 8px', fontSize: 11, background: '#fee2e2', color: '#b91c1c' }}
                    onClick={() => removeMedicine(med.id)}
                    title="Remove this duplicate medicine"
                  >
                    ডুপ্লিকেট মুছুন
                  </button>
                </div>
              )}

              {/* Middle Row: Dose (Morning/Noon/Night) + Quick Dose Pills + Timing + Duration */}
              <div
                style={{
                  marginTop: 10,
                  paddingTop: 10,
                  borderTop: '1px solid #e2e8f0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  flexWrap: 'wrap',
                }}
              >
                {/* Labeled Dosage Inputs */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#f8fafc', padding: '4px 10px', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#1e3a8a', marginRight: 4 }}>ডোজ:</span>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <span style={{ fontSize: 10, fontWeight: 600, color: '#64748b', marginBottom: 2 }}>সকাল</span>
                    <input
                      className="form-input"
                      style={{ width: 44, padding: '5px 4px', textAlign: 'center', fontSize: 14, fontWeight: 700, background: 'white' }}
                      value={med.morning}
                      onChange={e => updateMedicine(med.id, { morning: e.target.value })}
                      title="Morning / সকাল"
                    />
                  </div>
                  <span style={{ color: '#94a3b8', fontWeight: 700, marginTop: 14 }}>+</span>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <span style={{ fontSize: 10, fontWeight: 600, color: '#64748b', marginBottom: 2 }}>দুপুর</span>
                    <input
                      className="form-input"
                      style={{ width: 44, padding: '5px 4px', textAlign: 'center', fontSize: 14, fontWeight: 700, background: 'white' }}
                      value={med.afternoon}
                      onChange={e => updateMedicine(med.id, { afternoon: e.target.value })}
                      title="Afternoon / দুপুর"
                    />
                  </div>
                  <span style={{ color: '#94a3b8', fontWeight: 700, marginTop: 14 }}>+</span>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <span style={{ fontSize: 10, fontWeight: 600, color: '#64748b', marginBottom: 2 }}>রাত</span>
                    <input
                      className="form-input"
                      style={{ width: 44, padding: '5px 4px', textAlign: 'center', fontSize: 14, fontWeight: 700, background: 'white' }}
                      value={med.evening}
                      onChange={e => updateMedicine(med.id, { evening: e.target.value })}
                      title="Night / রাত"
                    />
                  </div>
                </div>

                {/* Quick Dose Pills */}
                <div style={{ display: 'flex', gap: 4, alignItems: 'center', flexWrap: 'wrap' }}>
                  {[
                    { label: '1+0+1', m: '1', a: '0', e: '1' },
                    { label: '1+1+1', m: '1', a: '1', e: '1' },
                    { label: '0+0+1', m: '0', a: '0', e: '1' },
                    { label: '1+0+0', m: '1', a: '0', e: '0' },
                  ].map(d => (
                    <button
                      key={d.label}
                      type="button"
                      style={{
                        cursor: 'pointer',
                        fontSize: 11.5,
                        fontWeight: 700,
                        padding: '4px 8px',
                        borderRadius: 6,
                        background: (med.morning === d.m && med.afternoon === d.a && med.evening === d.e) ? '#dbeafe' : '#f8fafc',
                        color: (med.morning === d.m && med.afternoon === d.a && med.evening === d.e) ? '#1e40af' : '#475569',
                        border: (med.morning === d.m && med.afternoon === d.a && med.evening === d.e) ? '1.5px solid #93c5fd' : '1px solid #cbd5e1',
                      }}
                      onClick={() => updateMedicine(med.id, { morning: d.m, afternoon: d.a, evening: d.e })}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>

                {/* Timing */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1, minWidth: 170 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#334155', whiteSpace: 'nowrap' }}>নিয়ম:</span>
                  <select
                    className="form-select"
                    value={med.timing ?? 'খাবারের পরে'}
                    onChange={e => updateMedicine(med.id, { timing: e.target.value })}
                    style={{ padding: '7px 10px', fontSize: 13 }}
                  >
                    {TIMING_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>

                {/* Duration */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, width: 150 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#334155', whiteSpace: 'nowrap' }}>মেয়াদ:</span>
                  <select
                    className="form-select"
                    value={med.duration ?? '৭ দিন'}
                    onChange={e => updateMedicine(med.id, { duration: e.target.value })}
                    style={{ padding: '7px 10px', fontSize: 13 }}
                  >
                    {DURATION_OPTIONS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              </div>

              {/* Bottom Row: Instruction & Quick Suggestions (Always visible) */}
              <div
                style={{
                  marginTop: 10,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  flexWrap: 'wrap',
                }}
              >
                <div style={{ flex: 1, minWidth: 240, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#475569', whiteSpace: 'nowrap' }}>নির্দেশনা:</span>
                  <input
                    className="form-input"
                    value={med.instruction ?? ''}
                    placeholder="বিশেষ নির্দেশনা (যেমন: খাবারের ৩০ মিনিট আগে, ভরা পেটে, ব্যথা হলে খাবেন)"
                    onChange={e => updateMedicine(med.id, { instruction: e.target.value })}
                    style={{ padding: '7px 11px', fontSize: 13 }}
                  />
                </div>

                {/* Quick instruction chips */}
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                  {['খাবারের ৩০ মিনিট আগে', 'ভরা পেটে খাবেন', 'ব্যথা হলে খাবেন', 'ঘুমানোর আগে'].map(chip => (
                    <button
                      key={chip}
                      type="button"
                      className="badge badge-gray"
                      style={{ cursor: 'pointer', fontSize: 11, padding: '3px 8px' }}
                      onClick={() => updateMedicine(med.id, { instruction: chip })}
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              </div>

              {/* Extra Details (Strength, Route) if expanded */}
              {isExpanded && (
                <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px dashed #cbd5e1', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                  <div>
                    <label className="form-label">Strength</label>
                    <input
                      className="form-input"
                      value={med.strength ?? ''}
                      placeholder="e.g. 500mg / 20mg / 10ml"
                      onChange={e => updateMedicine(med.id, { strength: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="form-label">Route</label>
                    <select
                      className="form-select"
                      value={med.route ?? 'Oral'}
                      onChange={e => updateMedicine(med.id, { route: e.target.value })}
                    >
                      <option value="Oral">Oral (মুখে খাবার)</option>
                      <option value="IV">IV (শিরায়)</option>
                      <option value="IM">IM (মাংসপেশিতে)</option>
                      <option value="Topical">Topical (ত্বকে বাহ্যিক)</option>
                      <option value="Inhalation">Inhalation (শ্বাসের সাথে)</option>
                      <option value="Nasal">Nasal (নাকে)</option>
                      <option value="Ophthalmic">Ophthalmic (চোখে)</option>
                      <option value="Otic">Otic (কানে)</option>
                      <option value="Rectal">Rectal (পায়ুপথে)</option>
                    </select>
                  </div>
                  <div>
                    <label className="form-label">Quantity</label>
                    <input
                      className="form-input"
                      value={med.quantity ?? ''}
                      placeholder="e.g. 14 tablets / 1 bottle"
                      onChange={e => updateMedicine(med.id, { quantity: e.target.value })}
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
        <button className="btn-secondary" style={{ flex: 1 }} onClick={addMedicine}>
          <Plus size={15} /> Add Medicine
        </button>
        <button
          type="button"
          className="btn-ghost"
          style={{
            color: '#16a34a',
            border: '1px solid #bbf7d0',
            background: '#f0fdf4',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontWeight: 600,
            fontSize: 12,
            padding: '8px 14px',
          }}
          onClick={() => setShowPediaModal(true)}
          title="Pediatric Dosage Calculator"
        >
          <Calculator size={15} /> Pediatric Dose Calc
        </button>
      </div>

      {showPediaModal && (
        <PediatricDoseCalculatorModal
          initialWeight={patientWeight}
          onClose={() => setShowPediaModal(false)}
          onAddMedicine={(newMed) => {
            onChange([...medicines, newMed]);
          }}
        />
      )}
    </div>
  );
}
