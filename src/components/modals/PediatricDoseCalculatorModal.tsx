import React, { useState } from 'react';
import { Calculator, X, Plus, AlertCircle, Sparkles } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import type { PrescriptionMedicine } from '../../types';

interface PediatricDoseCalculatorModalProps {
  onClose: () => void;
  onAddMedicine: (medicine: PrescriptionMedicine) => void;
  initialWeight?: string;
}

interface DrugPreset {
  id: string;
  name: string;
  generic: string;
  formulation: string;
  mgPerMl: number;
  doseMgPerKg: number;
  frequency: string;
  frequencyDose: { morning: string; afternoon: string; evening: string };
  timing: string;
  duration: string;
  instructionBn: string;
  note?: string;
}

const DRUG_PRESETS: DrugPreset[] = [
  {
    id: 'paracetamol_syrup',
    name: 'Syp. Napa 120mg/5ml',
    generic: 'Paracetamol',
    formulation: '120mg / 5ml (24mg/ml)',
    mgPerMl: 24,
    doseMgPerKg: 15,
    frequency: 'TDS (দিনে ৩ বার জ্বর হলে)',
    frequencyDose: { morning: '1', afternoon: '1', evening: '1' },
    timing: 'After meal',
    duration: '৩-৫ দিন',
    instructionBn: 'জ্বর বা ব্যথা হলে কুসুম গরম পানির সাথে খাওয়াবেন।',
    note: 'Standard dose: 15 mg/kg/dose (Max 4 times daily)',
  },
  {
    id: 'paracetamol_drops',
    name: 'Paed. Drops Napa 80mg/ml',
    generic: 'Paracetamol Drops',
    formulation: '80mg / 1ml',
    mgPerMl: 80,
    doseMgPerKg: 15,
    frequency: 'TDS (দিনে ৩-৪ বার)',
    frequencyDose: { morning: '1', afternoon: '1', evening: '1' },
    timing: 'After meal',
    duration: '৩ দিন',
    instructionBn: 'ড্রপার দিয়ে মেপে মুখে খাওয়াবেন।',
    note: 'For infants below 1 year',
  },
  {
    id: 'azithromycin_syrup',
    name: 'Syp. Azithrocin 200mg/5ml',
    generic: 'Azithromycin',
    formulation: '200mg / 5ml (40mg/ml)',
    mgPerMl: 40,
    doseMgPerKg: 10,
    frequency: 'OD (দিনে ১ বার)',
    frequencyDose: { morning: '1', afternoon: '0', evening: '0' },
    timing: 'Before meal',
    duration: '৫ দিন',
    instructionBn: 'প্রতিদিন নির্দিষ্ট সময়ে খাবারের ১ ঘণ্টা আগে খাওয়াবেন।',
    note: 'Single daily dose: 10 mg/kg/day',
  },
  {
    id: 'cefixime_syrup',
    name: 'Syp. Cef-3 100mg/5ml',
    generic: 'Cefixime',
    formulation: '100mg / 5ml (20mg/ml)',
    mgPerMl: 20,
    doseMgPerKg: 4, // 8mg/kg/day divided into 2 doses (4mg/kg/dose)
    frequency: 'BD (দিনে ২ বার)',
    frequencyDose: { morning: '1', afternoon: '0', evening: '1' },
    timing: 'After meal',
    duration: '৭ দিন',
    instructionBn: '১২ ঘণ্টা পর পর নিয়মিত ৭ দিন খাওয়াবেন।',
    note: 'Dose: 8 mg/kg/day divided BD',
  },
  {
    id: 'amoxiclav_syrup',
    name: 'Syp. Moxaclav 125mg/5ml',
    generic: 'Amoxicillin + Clavulanic Acid',
    formulation: '125mg / 5ml (25mg/ml)',
    mgPerMl: 25,
    doseMgPerKg: 13.3, // 40mg/kg/day divided TDS
    frequency: 'TDS (দিনে ৩ বার)',
    frequencyDose: { morning: '1', afternoon: '1', evening: '1' },
    timing: 'With meal',
    duration: '৭ দিন',
    instructionBn: 'খাবারের শুরুতে খাওয়াবেন। বোতল ঝাঁকিয়ে নেবেন।',
    note: 'Dose: 40-50 mg/kg/day divided TDS',
  },
  {
    id: 'domperidone_syrup',
    name: 'Syp. Omedon 5mg/5ml',
    generic: 'Domperidone',
    formulation: '5mg / 5ml (1mg/ml)',
    mgPerMl: 1,
    doseMgPerKg: 0.25,
    frequency: 'TDS (দিনে ৩ বার)',
    frequencyDose: { morning: '1', afternoon: '1', evening: '1' },
    timing: 'খাবারের আগে',
    duration: '৩-৫ দিন',
    instructionBn: 'খাবারের ১৫-৩০ মিনিট আগে খাওয়াবেন (বমি বা বমির ভাবের জন্য)।',
    note: 'Dose: 0.2-0.4 mg/kg/dose TDS before meal',
  },
  {
    id: 'salbutamol_syrup',
    name: 'Syp. Ventolin 2mg/5ml',
    generic: 'Salbutamol',
    formulation: '2mg / 5ml (0.4mg/ml)',
    mgPerMl: 0.4,
    doseMgPerKg: 0.1,
    frequency: 'TDS (দিনে ৩ বার)',
    frequencyDose: { morning: '1', afternoon: '1', evening: '1' },
    timing: 'After meal',
    duration: '৫ দিন',
    instructionBn: 'কাশি ও শ্বাসকষ্টের জন্য খাওয়াবেন।',
    note: 'Dose: 0.1-0.15 mg/kg/dose TDS',
  },
];

const WEIGHT_CHIPS = [3, 5, 8, 10, 12, 15, 18, 20, 25];

export function PediatricDoseCalculatorModal({
  onClose,
  onAddMedicine,
  initialWeight = '',
}: PediatricDoseCalculatorModalProps) {
  const [weightKg, setWeightKg] = useState<string>(
    initialWeight ? initialWeight.replace(/[^\d.]/g, '') : '10'
  );
  const [selectedDrugId, setSelectedDrugId] = useState<string>(DRUG_PRESETS[0].id);

  const parsedWeight = parseFloat(weightKg) || 0;
  const selectedDrug = DRUG_PRESETS.find(d => d.id === selectedDrugId) || DRUG_PRESETS[0];

  // Calculation
  const totalMgPerDose = parsedWeight > 0 ? (parsedWeight * selectedDrug.doseMgPerKg).toFixed(1) : '0';
  const totalMlPerDose = parsedWeight > 0 && selectedDrug.mgPerMl > 0
    ? (parseFloat(totalMgPerDose) / selectedDrug.mgPerMl).toFixed(1)
    : '0';

  // Spoon approximation (5ml = 1 teaspoon / ১ চামচ)
  const mlNum = parseFloat(totalMlPerDose);
  let spoonText = '';
  if (mlNum > 0) {
    if (mlNum <= 0.6) spoonText = `${mlNum} ml (~৮-১০ ফোঁটা / ড্রপ)`;
    else if (mlNum <= 1.5) spoonText = `${mlNum} ml (~১/৪ চামচ)`;
    else if (mlNum <= 3.0) spoonText = `${mlNum} ml (~আধা চামচ)`;
    else if (mlNum <= 5.5) spoonText = `${mlNum} ml (~১ চামচ)`;
    else if (mlNum <= 8.0) spoonText = `${mlNum} ml (~দেড় চামচ)`;
    else if (mlNum <= 11.0) spoonText = `${mlNum} ml (~২ চামচ)`;
    else spoonText = `${mlNum} ml (~${(mlNum / 5).toFixed(1)} চামচ)`;
  }

  const handleAdd = () => {
    if (parsedWeight <= 0) return;
    const med: PrescriptionMedicine = {
      id: uuidv4(),
      name: `${selectedDrug.name} (${spoonText})`,
      genericName: selectedDrug.generic,
      form: 'syrup',
      strength: `${totalMlPerDose} ml`,
      morning: selectedDrug.frequencyDose.morning,
      afternoon: selectedDrug.frequencyDose.afternoon,
      evening: selectedDrug.frequencyDose.evening,
      timing: selectedDrug.timing,
      duration: selectedDrug.duration,
      instruction: `${spoonText} করে ${selectedDrug.frequency} - ${selectedDrug.instructionBn}`,
    };
    onAddMedicine(med);
    onClose();
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 250 }}>
      <div className="modal-box" style={{ maxWidth: 540 }}>
        {/* Header */}
        <div className="modal-header" style={{ background: '#f0fdf4', borderBottomColor: '#bbf7d0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8, background: '#16a34a',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white'
            }}>
              <Calculator size={18} />
            </div>
            <div>
              <div className="modal-title" style={{ color: '#166534', fontSize: 16 }}>
                👶 Pediatric Dosage Calculator
              </div>
              <div style={{ fontSize: 11, color: '#4b7c59' }}>
                শিশুদের ওজনভিত্তিক সিরাপ ডোজ ক্যালকুলেটর (বাংলাদেশ পেডিয়াট্রিক স্ট্যান্ডার্ড)
              </div>
            </div>
          </div>
          <button className="btn-icon" onClick={onClose}><X size={18} /></button>
        </div>

        {/* Body */}
        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Weight Input */}
          <div>
            <label className="form-label" style={{ fontWeight: 600, color: '#1e293b' }}>
              Child Weight (শিশুর ওজন - কেজি) *
            </label>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input
                type="number"
                step="0.5"
                min="1"
                max="80"
                className="form-input"
                style={{ fontSize: 16, fontWeight: 700, width: 140 }}
                value={weightKg}
                onChange={e => setWeightKg(e.target.value)}
                placeholder="e.g. 10"
              />
              <span style={{ fontSize: 14, fontWeight: 600, color: '#64748b' }}>kg (কেজি)</span>
            </div>

            {/* Quick weight chips */}
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 8 }}>
              {WEIGHT_CHIPS.map(w => (
                <button
                  key={w}
                  type="button"
                  onClick={() => setWeightKg(String(w))}
                  className="badge"
                  style={{
                    cursor: 'pointer',
                    fontSize: 11,
                    padding: '3px 8px',
                    borderRadius: 6,
                    background: parsedWeight === w ? '#16a34a' : '#f1f5f9',
                    color: parsedWeight === w ? 'white' : '#475569',
                    border: '1px solid #cbd5e1',
                  }}
                >
                  {w} kg
                </button>
              ))}
            </div>
          </div>

          {/* Select Drug */}
          <div>
            <label className="form-label" style={{ fontWeight: 600, color: '#1e293b' }}>
              Select Medicine Formulation (ওষুধ নির্বাচন করুন)
            </label>
            <select
              className="form-select"
              value={selectedDrugId}
              onChange={e => setSelectedDrugId(e.target.value)}
              style={{ fontSize: 13, padding: '8px 12px' }}
            >
              {DRUG_PRESETS.map(d => (
                <option key={d.id} value={d.id}>
                  {d.name} – {d.generic} ({d.formulation})
                </option>
              ))}
            </select>
          </div>

          {/* Calculated Result Card */}
          <div style={{
            background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)',
            border: '1px solid #86efac',
            borderRadius: 12,
            padding: '14px 16px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#166534', fontWeight: 700, fontSize: 13 }}>
              <Sparkles size={16} /> Calculated Recommended Dose
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 10 }}>
              <div style={{ background: 'white', padding: '10px 12px', borderRadius: 8, border: '1px solid #bbf7d0' }}>
                <div style={{ fontSize: 11, color: '#64748b' }}>Dose in mg</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: '#166534' }}>
                  {totalMgPerDose} mg / dose
                </div>
              </div>
              <div style={{ background: 'white', padding: '10px 12px', borderRadius: 8, border: '1px solid #bbf7d0' }}>
                <div style={{ fontSize: 11, color: '#64748b' }}>Liquid Volume (পরিমাপ)</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: '#15803d' }}>
                  {totalMlPerDose} ml
                </div>
              </div>
            </div>

            <div style={{ marginTop: 10, fontSize: 13, fontWeight: 600, color: '#14532d', background: 'rgba(255,255,255,0.7)', padding: '8px 12px', borderRadius: 8 }}>
              🥄 নির্দেশিকা: <span style={{ color: '#047857' }}>{spoonText}</span> ({selectedDrug.frequency})
            </div>

            {selectedDrug.note && (
              <div style={{ fontSize: 11, color: '#4b7c59', marginTop: 6, fontStyle: 'italic' }}>
                ℹ️ {selectedDrug.note}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer" style={{ background: '#f8fafc' }}>
          <button className="btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn-primary"
            style={{ background: '#16a34a', borderColor: '#16a34a' }}
            onClick={handleAdd}
            disabled={parsedWeight <= 0}
          >
            <Plus size={16} /> Add to Prescription (প্রেসক্রিপশনে যোগ করুন)
          </button>
        </div>
      </div>
    </div>
  );
}
