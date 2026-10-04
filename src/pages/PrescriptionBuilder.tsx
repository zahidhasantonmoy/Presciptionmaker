import React, { useState, useEffect } from 'react';
import {
  Save, Printer, Eye, ChevronDown, ChevronUp,
  User, Stethoscope, FlaskConical, BookOpen, Calendar, FileText
} from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { useStore } from '../store/useStore';
import { PrescriptionPreview } from '../components/prescription/PrescriptionPreview';
import { MedicineEntry } from '../components/prescription/MedicineEntry';
import { DiagnosisEntry } from '../components/prescription/DiagnosisEntry';
import { InvestigationEntry } from '../components/prescription/InvestigationEntry';
import { AdviceEntry } from '../components/prescription/AdviceEntry';
import { PrintPreviewModal } from '../components/prescription/PrintPreviewModal';
import { useToast } from '../components/ui/Toast';
import { calculateAge, formatDateForInput } from '../utils/dateUtils';
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

export function PrescriptionBuilder() {
  const {
    currentPrescription, doctorProfile, prescriptionTemplates, updateCurrentPrescription,
    createPrescription, savePrescription, settings
  } = useStore();
  const { showToast } = useToast();

  const [showPreview, setShowPreview] = useState(true);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [sections, setSections] = useState<SectionToggle>({
    complaints: true, examination: false, history: false, diagnosis: true,
    medicines: true, investigations: true, advice: true, followup: true, notes: false,
  });
  const [previewScale, setPreviewScale] = useState(0.65);
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

  const handleSave = () => {
    if (!rx.patient.name.trim()) {
      showToast('Patient name is required', 'error');
      return;
    }
    savePrescription({ ...rx, isDraft: false });
    showToast('Prescription saved!', 'success');
  };

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

  const SectionHeader = ({ title, icon, section, count }: {
    title: string; icon: React.ReactNode; section: keyof SectionToggle; count?: number;
  }) => (
    <div className="section-panel-header" onClick={() => toggleSection(section)} style={{ cursor: 'pointer' }}>
      <div className="section-panel-title">
        {icon} {title}
        {count !== undefined && count > 0 && (
          <span className="badge badge-blue" style={{ fontSize: 10, marginLeft: 4 }}>{count}</span>
        )}
      </div>
      {sections[section] ? <ChevronUp size={16} color="#64748b" /> : <ChevronDown size={16} color="#64748b" />}
    </div>
  );

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
          <SectionHeader title="Chief Complaints" icon={<Stethoscope size={15} />} section="complaints" />
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
          <SectionHeader title="On Examination" icon={<Stethoscope size={15} />} section="examination" />
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
          <SectionHeader title="History / Notes" icon={<FileText size={15} />} section="history" />
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
          <SectionHeader title="Diagnosis" icon={<Stethoscope size={15} />} section="diagnosis" count={rx.diagnoses.length} />
          {sections.diagnosis && (
            <div className="section-panel-body">
              <DiagnosisEntry diagnoses={rx.diagnoses} onChange={d => update({ diagnoses: d })} />
            </div>
          )}
        </div>

        {/* ─── Medicines ────────────────────────────────────────────────────── */}
        <div className="section-panel">
          <SectionHeader title="Medicines (℞)" icon={<span style={{ fontFamily: 'serif', fontStyle: 'italic', fontSize: 16 }}>℞</span>} section="medicines" count={rx.medicines.length} />
          {sections.medicines && (
            <div className="section-panel-body">
              <MedicineEntry medicines={rx.medicines} onChange={m => update({ medicines: m })} />
            </div>
          )}
        </div>

        {/* ─── Investigations ───────────────────────────────────────────────── */}
        <div className="section-panel">
          <SectionHeader title="Tests / Investigations" icon={<FlaskConical size={15} />} section="investigations" count={rx.investigations.length} />
          {sections.investigations && (
            <div className="section-panel-body">
              <InvestigationEntry investigations={rx.investigations} onChange={i => update({ investigations: i })} />
            </div>
          )}
        </div>

        {/* ─── Advice ──────────────────────────────────────────────────────── */}
        <div className="section-panel">
          <SectionHeader title="Advice / Instructions" icon={<BookOpen size={15} />} section="advice" />
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
          <SectionHeader title="Follow-up" icon={<Calendar size={15} />} section="followup" />
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
          <SectionHeader title="Additional Notes" icon={<FileText size={15} />} section="notes" />
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
          width: 380, flexShrink: 0, background: '#f1f5f9',
          borderLeft: '1px solid #e2e8f0', overflowY: 'auto',
          display: 'flex', flexDirection: 'column',
        }}>
          <div style={{
            padding: '10px 14px', background: 'white', borderBottom: '1px solid #e2e8f0',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 5,
          }}>
            <span style={{ fontWeight: 700, fontSize: 13, color: '#1e40af' }}>📄 Live A4 Preview</span>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <button className="btn-icon" onClick={() => setPreviewScale(s => Math.max(0.4, s - 0.05))} title="Zoom out">−</button>
              <span style={{ fontSize: 11, color: '#64748b', minWidth: 36, textAlign: 'center' }}>{Math.round(previewScale * 100)}%</span>
              <button className="btn-icon" onClick={() => setPreviewScale(s => Math.min(1, s + 0.05))} title="Zoom in">+</button>
            </div>
          </div>
          <div style={{ padding: 16, display: 'flex', justifyContent: 'center' }}>
            <div style={{ transformOrigin: 'top center', transform: `scale(${previewScale})`, width: `${210 / previewScale}mm`, maxWidth: '100%' }}>
              <PrescriptionPreview prescription={rx} doctorProfile={doctorProfile} />
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
    </div>
  );
}
