import React, { useState, useEffect, useCallback } from 'react';
import {
  Save, Printer, Eye, ChevronDown, ChevronUp,
  User, Stethoscope, FlaskConical, BookOpen, Calendar, FileText, Keyboard, Clock, RotateCcw
} from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { useStore } from '../store/useStore';
import { PrescriptionPreview } from '../components/prescription/PrescriptionPreview';
import { MedicineEntry } from '../components/prescription/MedicineEntry';
import { DiagnosisEntry } from '../components/prescription/DiagnosisEntry';
import { InvestigationEntry } from '../components/prescription/InvestigationEntry';
import { AdviceEntry } from '../components/prescription/AdviceEntry';
import { PrintPreviewModal } from '../components/prescription/PrintPreviewModal';
import { KeyboardShortcutsModal } from '../components/modals/KeyboardShortcutsModal';
import { useToast } from '../components/ui/Toast';
import { calculateAge, formatDateForInput, formatDateDisplay } from '../utils/dateUtils';
import type { Prescription, PrescriptionTheme } from '../types';

const THEME_OPTIONS: { value: PrescriptionTheme; label: string }[] = [
  { value: 'classic', label: 'Classic' },
  { value: 'minimal', label: 'Minimal' },
  { value: 'modern', label: 'Modern' },
  { value: 'compact', label: 'Compact' },
];

interface SectionToggle {
  complaints: boolean;
  examination: boolean;
  history: boolean;
  diagnosis: boolean;
  medicines: boolean;
  investigations: boolean;
  advice: boolean;
  followup: boolean;
  notes: boolean;
}

interface SectionHeaderProps {
  title: string;
  icon: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
  count?: number;
}

function SectionHeader({ title, icon, isOpen, onToggle, count }: SectionHeaderProps) {
  return (
    <div className="section-panel-header" onClick={onToggle} style={{ cursor: 'pointer' }}>
      <div className="section-panel-title">
        {icon} {title}
        {count !== undefined && count > 0 && (
          <span className="badge badge-blue" style={{ fontSize: 10, marginLeft: 4 }}>{count}</span>
        )}
      </div>
      {isOpen ? <ChevronUp size={16} color="#64748b" /> : <ChevronDown size={16} color="#64748b" />}
    </div>
  );
}

export function PrescriptionBuilder() {
  const {
    currentPrescription, doctorProfile, prescriptionTemplates, updateCurrentPrescription,
    createPrescription, savePrescription, settings, prescriptions
  } = useStore();
  const { showToast } = useToast();

  const [showPreview, setShowPreview] = useState(true);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);
  const [sections, setSections] = useState<SectionToggle>({
    complaints: true, examination: false, history: false, diagnosis: true,
    medicines: true, investigations: true, advice: true, followup: true, notes: false,
  });
  const [previewScale, setPreviewScale] = useState(0.48);
  const [showTemplatePanel, setShowTemplatePanel] = useState(false);

  // Auto-create prescription if none
  useEffect(() => {
    if (!currentPrescription) {
      createPrescription();
    }
  }, [currentPrescription, createPrescription]);

  // Auto-save draft
  useEffect(() => {
    if (!currentPrescription || !settings.autoSave) return;
    const timer = setTimeout(() => {
      savePrescription({ ...currentPrescription, isDraft: true });
    }, 2000);
    return () => clearTimeout(timer);
  }, [currentPrescription, settings.autoSave, savePrescription]);

  if (!currentPrescription) return <div style={{ padding: 32, textAlign: 'center', color: '#94a3b8' }}>Loading...</div>;

  const rx = currentPrescription;

  const update = (updates: Partial<Prescription>) => updateCurrentPrescription(updates);

  const updatePatient = (field: string, value: string) => {
    update({ patient: { ...rx.patient, [field]: value } });
  };

  const handleDobChange = (dob: string) => {
    const age = calculateAge(dob);
    update({ patient: { ...rx.patient, dateOfBirth: dob, age } });
  };

  const handleSave = useCallback(() => {
    if (!rx.patient.name.trim()) {
      showToast('Patient name is required', 'error');
      return;
    }
    savePrescription({ ...rx, isDraft: false });
    showToast('Prescription saved!', 'success');
  }, [rx, savePrescription, showToast]);

  // Check if patient has any previous visit recorded in history
  const pastPrescription = prescriptions.find(p =>
    p.id !== rx.id && (
      (rx.patient.phone && rx.patient.phone.trim().length > 6 && p.patient.phone === rx.patient.phone) ||
      (rx.patient.name && rx.patient.name.trim().length > 2 && p.patient.name.toLowerCase() === rx.patient.name.toLowerCase())
    )
  );

  const copyPreviousMedicines = () => {
    if (!pastPrescription || pastPrescription.medicines.length === 0) return;
    const copied = pastPrescription.medicines.map(m => ({ ...m, id: uuidv4() }));
    update({ medicines: [...rx.medicines, ...copied] });
    showToast(`Copied ${copied.length} medicines from past visit (${formatDateDisplay(pastPrescription.date)})`, 'success');
  };

  // Keyboard Shortcuts Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        handleSave();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        setShowPrintModal(true);
      } else if (e.altKey && e.key.toLowerCase() === 'm') {
        e.preventDefault();
        setSections(s => ({ ...s, medicines: true }));
        showToast('Medicines section (Alt+M)', 'info');
      } else if (e.altKey && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        setSections(s => ({ ...s, diagnosis: true }));
        showToast('Diagnosis section (Alt+D)', 'info');
      } else if (e.altKey && e.key.toLowerCase() === 't') {
        e.preventDefault();
        setSections(s => ({ ...s, investigations: true }));
        showToast('Tests section (Alt+T)', 'info');
      } else if (e.altKey && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        const nextMode = rx.printMode === 'pad_only' ? 'full' : 'pad_only';
        update({ printMode: nextMode });
        showToast(`Pad mode ${nextMode === 'pad_only' ? 'ON' : 'OFF'} (Alt+P)`, 'info');
      } else if (e.altKey && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        createPrescription();
        showToast('New prescription started (Alt+N)', 'info');
      } else if (e.altKey && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setShowShortcutsModal(true);
      } else if (!isInput && e.key === '?') {
        e.preventDefault();
        setShowShortcutsModal(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [rx, handleSave, createPrescription, showToast]);

  const toggleSection = (key: keyof SectionToggle) =>
    setSections(s => ({ ...s, [key]: !s[key] }));

  const applyTemplate = (templateId: string) => {
    const tmpl = prescriptionTemplates.find(t => t.id === templateId);
    if (!tmpl) return;
    update({
      diagnoses: tmpl.diagnoses.map(d => ({ ...d, id: uuidv4() })),
      medicines: tmpl.medicines.map(m => ({ ...m, id: uuidv4() })),
      investigations: tmpl.investigations.map(i => ({ ...i, id: uuidv4() })),
      advice: tmpl.advice,
      followUpText: tmpl.followUpText,
    });
    setShowTemplatePanel(false);
    showToast(`Template "${tmpl.name}" applied`, 'success');
  };

  return (
    <div style={{ display: 'flex', gap: 0, height: '100%', overflow: 'hidden' }}>
      {/* ─── LEFT: BUILDER ─────────────────────────────────────────────────── */}
      <div style={{
        flex: 1, overflowY: 'auto', padding: '16px',
        display: 'flex', flexDirection: 'column', gap: 12, minWidth: 0,
      }}>
        {/* Toolbar */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap',
          background: 'white', padding: '12px 16px', borderRadius: 12,
          border: '1px solid #e2e8f0', position: 'sticky', top: 0, zIndex: 10,
        }}>
          <span style={{ fontWeight: 700, color: '#1e40af', fontSize: 16, marginRight: 8 }}>
            ✍️ New Prescription
          </span>
          <button className="btn-ghost btn-sm" onClick={() => setShowTemplatePanel(!showTemplatePanel)}>
            <BookOpen size={14} /> Templates
          </button>
          <div style={{ flex: 1 }} />
          {/* Pad Mode Toggle */}
          <button
            className={`btn-sm ${rx.printMode === 'pad_only' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => {
              const nextMode = rx.printMode === 'pad_only' ? 'full' : 'pad_only';
              update({ printMode: nextMode });
              showToast(`Pad Mode: ${nextMode === 'pad_only' ? 'Active (Pre-printed pad spacing)' : 'Full (Header & Footer included)'}`, 'info');
            }}
            title="Toggle Pre-printed Pad Mode (Alt+P)"
            style={rx.printMode === 'pad_only' ? { background: '#d97706', borderColor: '#b45309', color: 'white' } : {}}
          >
            📄 {rx.printMode === 'pad_only' ? 'Pad Mode ON' : 'Pad Mode'}
          </button>
          {/* Shortcuts Info */}
          <button
            className="btn-ghost btn-sm"
            onClick={() => setShowShortcutsModal(true)}
            title="Keyboard Shortcuts (Alt+K or ?)"
          >
            <Keyboard size={14} /> Keys
          </button>
          {/* Theme */}
          <select className="form-select" style={{ width: 110 }} value={rx.theme}
            onChange={e => update({ theme: e.target.value as PrescriptionTheme })}>
            {THEME_OPTIONS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
          <button className="btn-ghost btn-sm" onClick={() => setShowPreview(!showPreview)}>
            <Eye size={14} /> {showPreview ? 'Hide' : 'Show'} Preview
          </button>
          <button className="btn-ghost btn-sm" onClick={() => setShowPrintModal(true)}>
            <Printer size={14} /> Print/PDF
          </button>
          <button className="btn-primary btn-sm" onClick={handleSave}>
            <Save size={14} /> Save
          </button>
        </div>

        {/* Returning Patient Detection Banner */}
        {pastPrescription && (
          <div style={{
            background: '#f0fdf4',
            border: '1px solid #86efac',
            borderRadius: 10,
            padding: '10px 14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: '#166534' }}>
              <Clock size={16} color="#16a34a" />
              <div>
                <strong>Previous visit detected:</strong> {pastPrescription.patient.name} on {formatDateDisplay(pastPrescription.date)}
                {pastPrescription.medicines.length > 0 && ` • ${pastPrescription.medicines.length} previous medicine(s)`}
                {pastPrescription.diagnoses.length > 0 && ` (${pastPrescription.diagnoses.map(d => d.name).join(', ')})`}
              </div>
            </div>
            <button
              className="btn-sm"
              style={{
                background: '#16a34a',
                color: 'white',
                border: 'none',
                borderRadius: 6,
                padding: '6px 12px',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 12,
                fontWeight: 600,
              }}
              onClick={copyPreviousMedicines}
              disabled={pastPrescription.medicines.length === 0}
            >
              <RotateCcw size={13} /> Copy Previous Meds ({pastPrescription.medicines.length})
            </button>
          </div>
        )}

        {/* Template Panel */}
        {showTemplatePanel && (
          <div className="card" style={{ padding: 16 }}>
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 10, color: '#1e40af' }}>
              📋 Apply Template
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 8 }}>
              {prescriptionTemplates.map(t => (
                <div key={t.id} onClick={() => applyTemplate(t.id)} style={{
                  padding: '10px 14px', background: '#f8faff', border: '1px solid #c7d7fa',
                  borderRadius: 8, cursor: 'pointer', transition: 'all 0.15s',
                }}>
                  <div style={{ fontWeight: 600, fontSize: 13, color: '#1e40af' }}>{t.name}</div>
                  {t.isDemo && <span className="badge badge-demo" style={{ marginTop: 4 }}>Demo</span>}
                  {t.description && <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>{t.description}</div>}
                </div>
              ))}
              {prescriptionTemplates.length === 0 && (
                <div style={{ color: '#94a3b8', fontSize: 13 }}>No templates yet. Create one in Settings.</div>
              )}
            </div>
          </div>
        )}

        {/* ─── Rx Info ─────────────────────────────────────────────────────── */}
        <div className="section-panel">
          <div className="section-panel-header">
            <div className="section-panel-title"><FileText size={15} /> Prescription Info</div>
          </div>
          <div className="section-panel-body">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
              <div>
                <label className="form-label">Rx Number</label>
                <input className="form-input" value={rx.prescriptionNumber}
                  onChange={e => update({ prescriptionNumber: e.target.value })} />
              </div>
              <div>
                <label className="form-label">Date</label>
                <input type="date" className="form-input"
                  value={formatDateForInput(rx.date)}
                  onChange={e => update({ date: e.target.value })} />
              </div>
              <div>
                <label className="form-label">Language</label>
                <select className="form-select" value={rx.language}
                  onChange={e => update({ language: e.target.value as 'en' | 'bn' })}>
                  <option value="en">English</option>
                  <option value="bn">বাংলা</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* ─── Patient Info ─────────────────────────────────────────────────── */}
        <div className="section-panel">
          <div className="section-panel-header">
            <div className="section-panel-title"><User size={15} /> Patient Information</div>
          </div>
          <div className="section-panel-body">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <label className="form-label">Patient Name (English) *</label>
                <input className="form-input" value={rx.patient.name} placeholder="e.g. John Doe"
                  onChange={e => updatePatient('name', e.target.value)} required />
              </div>
              <div>
                <label className="form-label">রোগীর নাম (বাংলা)</label>
                <input className="form-input bn" value={rx.patient.nameBn ?? ''} placeholder="যেমন: রহিম উদ্দিন"
                  style={{ fontFamily: 'var(--font-bn), sans-serif' }}
                  onChange={e => updatePatient('nameBn', e.target.value)} />
              </div>
              <div>
                <label className="form-label">Patient ID</label>
                <input className="form-input" value={rx.patient.patientId ?? ''} placeholder="Auto or manual ID"
                  onChange={e => updatePatient('patientId', e.target.value)} />
              </div>
              <div>
                <label className="form-label">Gender</label>
                <select className="form-select" value={rx.patient.gender ?? ''}
                  onChange={e => updatePatient('gender', e.target.value)}>
                  <option value="">Not specified</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="form-label">Date of Birth</label>
                <input type="date" className="form-input" value={rx.patient.dateOfBirth ? formatDateForInput(rx.patient.dateOfBirth) : ''}
                  onChange={e => handleDobChange(e.target.value)} />
              </div>
              <div>
                <label className="form-label">Age (auto-calculated, editable)</label>
                <input className="form-input" value={rx.patient.age ?? ''} placeholder="e.g. 40Y 6M"
                  onChange={e => updatePatient('age', e.target.value)} />
              </div>
              <div>
                <label className="form-label">Weight (kg)</label>
                <input className="form-input" value={rx.patient.weight ?? ''} placeholder="e.g. 65"
                  onChange={e => updatePatient('weight', e.target.value)} />
              </div>
              <div>
                <label className="form-label">Blood Pressure</label>
                <input className="form-input" value={rx.patient.bloodPressure ?? ''} placeholder="e.g. 120/80"
                  onChange={e => updatePatient('bloodPressure', e.target.value)} />
              </div>
              <div>
                <label className="form-label">Phone</label>
                <input className="form-input" value={rx.patient.phone ?? ''} placeholder="01XXXXXXXXX"
                  onChange={e => updatePatient('phone', e.target.value)} />
              </div>
              <div>
                <label className="form-label">Allergies</label>
                <input className="form-input" value={rx.patient.allergies ?? ''} placeholder="Known allergies"
                  onChange={e => updatePatient('allergies', e.target.value)} />
              </div>
            </div>
          </div>
        </div>

        {/* ─── Clinical Notes ────────────────────────────────────────────────── */}
        <div className="section-panel">
          <SectionHeader title="Chief Complaints" icon={<Stethoscope size={15} />} isOpen={sections.complaints} onToggle={() => toggleSection('complaints')} />
          {sections.complaints && (
            <div className="section-panel-body" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div>
                <label className="form-label">Complaints (English)</label>
                <textarea className="form-input" value={rx.complaints} rows={3} style={{ resize: 'vertical' }}
                  placeholder="e.g. Fever, Cough, LBP..."
                  onChange={e => update({ complaints: e.target.value })} />
              </div>
              <div>
                <label className="form-label">অভিযোগ (বাংলা)</label>
                <textarea className="form-input bn" value={rx.complaintsBn ?? ''} rows={2}
                  style={{ resize: 'vertical', fontFamily: 'var(--font-bn), sans-serif' }}
                  placeholder="যেমন: জ্বর, কাশি..."
                  onChange={e => update({ complaintsBn: e.target.value })} />
              </div>
            </div>
          )}
        </div>

        {/* On Examination */}
        <div className="section-panel">
          <SectionHeader title="On Examination" icon={<Stethoscope size={15} />} isOpen={sections.examination} onToggle={() => toggleSection('examination')} />
          {sections.examination && (
            <div className="section-panel-body">
              <textarea className="form-input" value={rx.onExamination ?? ''} rows={3} style={{ resize: 'vertical' }}
                placeholder="BP, Pulse, Temp, etc."
                onChange={e => update({ onExamination: e.target.value })} />
            </div>
          )}
        </div>

        {/* History */}
        <div className="section-panel">
          <SectionHeader title="History / Notes" icon={<FileText size={15} />} isOpen={sections.history} onToggle={() => toggleSection('history')} />
          {sections.history && (
            <div className="section-panel-body">
              <textarea className="form-input" value={rx.history ?? ''} rows={3} style={{ resize: 'vertical' }}
                placeholder="Medical history, past treatments..."
                onChange={e => update({ history: e.target.value })} />
            </div>
          )}
        </div>

        {/* ─── Diagnosis ────────────────────────────────────────────────────── */}
        <div className="section-panel">
          <SectionHeader title="Diagnosis" icon={<Stethoscope size={15} />} isOpen={sections.diagnosis} onToggle={() => toggleSection('diagnosis')} count={rx.diagnoses.length} />
          {sections.diagnosis && (
            <div className="section-panel-body">
              <DiagnosisEntry diagnoses={rx.diagnoses} onChange={d => update({ diagnoses: d })} />
            </div>
          )}
        </div>

        {/* ─── Medicines ────────────────────────────────────────────────────── */}
        <div className="section-panel">
          <SectionHeader title="Medicines (℞)" icon={<span style={{ fontFamily: 'serif', fontStyle: 'italic', fontSize: 16 }}>℞</span>} isOpen={sections.medicines} onToggle={() => toggleSection('medicines')} count={rx.medicines.length} />
          {sections.medicines && (
            <div className="section-panel-body">
              <MedicineEntry
                medicines={rx.medicines}
                onChange={m => update({ medicines: m })}
                patientAllergies={rx.patient.allergies}
                patientWeight={rx.patient.weight}
              />
            </div>
          )}
        </div>

        {/* ─── Investigations ───────────────────────────────────────────────── */}
        <div className="section-panel">
          <SectionHeader title="Tests / Investigations" icon={<FlaskConical size={15} />} isOpen={sections.investigations} onToggle={() => toggleSection('investigations')} count={rx.investigations.length} />
          {sections.investigations && (
            <div className="section-panel-body">
              <InvestigationEntry investigations={rx.investigations} onChange={i => update({ investigations: i })} />
            </div>
          )}
        </div>

        {/* ─── Advice ──────────────────────────────────────────────────────── */}
        <div className="section-panel">
          <SectionHeader title="Advice / Instructions" icon={<BookOpen size={15} />} isOpen={sections.advice} onToggle={() => toggleSection('advice')} />
          {sections.advice && (
            <div className="section-panel-body">
              <AdviceEntry
                advice={rx.advice}
                adviceBn={rx.adviceBn ?? ''}
                onAdviceChange={v => update({ advice: v })}
                onAdviceBnChange={v => update({ adviceBn: v })}
              />
            </div>
          )}
        </div>

        {/* ─── Follow-up ───────────────────────────────────────────────────── */}
        <div className="section-panel">
          <SectionHeader title="Follow-up" icon={<Calendar size={15} />} isOpen={sections.followup} onToggle={() => toggleSection('followup')} />
          {sections.followup && (
            <div className="section-panel-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label className="form-label">Follow-up Date</label>
                  <input type="date" className="form-input"
                    value={rx.followUpDate ? formatDateForInput(rx.followUpDate) : ''}
                    onChange={e => update({ followUpDate: e.target.value })} />
                </div>
                <div>
                  <label className="form-label">Follow-up Instruction</label>
                  <input className="form-input" value={rx.followUpText ?? ''}
                    placeholder="e.g. Review after 7 days / ৭ দিন পর দেখাবেন"
                    onChange={e => update({ followUpText: e.target.value })} />
                </div>
              </div>
              {/* Quick options */}
              <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                {['Review after 3 days', 'Review after 1 week', 'Review after 2 weeks', 'Review after 1 month',
                  '৩ দিন পর দেখাবেন', '১ সপ্তাহ পর দেখাবেন', '১ মাস পর দেখাবেন', 'প্রয়োজনে দেখাবেন'].map(opt => (
                  <button key={opt} className="badge badge-blue" style={{ cursor: 'pointer' }}
                    onClick={() => update({ followUpText: opt })}>
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Additional notes */}
        <div className="section-panel">
          <SectionHeader title="Additional Notes" icon={<FileText size={15} />} isOpen={sections.notes} onToggle={() => toggleSection('notes')} />
          {sections.notes && (
            <div className="section-panel-body">
              <textarea className="form-input" value={rx.additionalNotes ?? ''} rows={2} style={{ resize: 'vertical' }}
                placeholder="Any additional notes..."
                onChange={e => update({ additionalNotes: e.target.value })} />
            </div>
          )}
        </div>

        {/* Bottom save */}
        <div style={{ display: 'flex', gap: 10, paddingBottom: 32 }}>
          <button className="btn-primary" style={{ flex: 1 }} onClick={handleSave}>
            <Save size={16} /> Save Prescription
          </button>
          <button className="btn-secondary" onClick={() => setShowPrintModal(true)}>
            <Printer size={16} /> Print / PDF
          </button>
        </div>
      </div>

      {/* ─── RIGHT: PREVIEW ────────────────────────────────────────────────── */}
      {showPreview && (
        <div style={{
          width: 440, flexShrink: 0, background: '#f1f5f9',
          borderLeft: '1px solid #e2e8f0', overflowY: 'auto',
          display: 'flex', flexDirection: 'column',
        }}>
          <div style={{
            padding: '10px 14px', background: 'white', borderBottom: '1px solid #e2e8f0',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 5,
          }}>
            <span style={{ fontWeight: 700, fontSize: 13, color: '#1e40af' }}>📄 Live A4 Preview</span>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <button className="btn-icon" onClick={() => setPreviewScale(s => Math.max(0.3, parseFloat((s - 0.05).toFixed(2))))} title="Zoom out">−</button>
              <span style={{ fontSize: 11, color: '#64748b', minWidth: 36, textAlign: 'center' }}>{Math.round(previewScale * 100)}%</span>
              <button className="btn-icon" onClick={() => setPreviewScale(s => Math.min(1, parseFloat((s + 0.05).toFixed(2))))} title="Zoom in">+</button>
              <button className="btn-ghost btn-sm" style={{ padding: '2px 8px', fontSize: 11 }} onClick={() => setPreviewScale(0.48)} title="Fit width">Fit</button>
            </div>
          </div>
          <div style={{ padding: '16px 8px', display: 'flex', justifyContent: 'center', overflowX: 'auto', flex: 1 }}>
            <div style={{
              width: `${Math.round(794 * previewScale)}px`,
              height: `${Math.round(1123 * previewScale)}px`,
              position: 'relative',
              flexShrink: 0,
              boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
              borderRadius: 4,
              overflow: 'hidden',
              background: 'white',
            }}>
              <div style={{
                width: '210mm',
                minHeight: '297mm',
                transform: `scale(${previewScale})`,
                transformOrigin: 'top left',
                position: 'absolute',
                top: 0,
                left: 0,
              }}>
                <PrescriptionPreview prescription={rx} doctorProfile={doctorProfile} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Print Modal */}
      {showPrintModal && (
        <PrintPreviewModal
          prescription={rx}
          doctorProfile={doctorProfile}
          onClose={() => setShowPrintModal(false)}
        />
      )}

      {/* Keyboard Shortcuts Modal */}
      {showShortcutsModal && (
        <KeyboardShortcutsModal onClose={() => setShowShortcutsModal(false)} />
      )}
    </div>
  );
}
