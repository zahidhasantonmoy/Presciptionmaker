import React, { useState, useRef } from 'react';
import {
  FileCode, Upload, Download, Copy, Check, AlertCircle,
  X, Sparkles, FileText, CheckCircle2, ArrowRight
} from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import type {
  Prescription, PrescriptionMedicine, Diagnosis,
  Investigation, Patient, MedicineForm
} from '../../types';
import { getDhakaNow } from '../../utils/dateUtils';

interface JsonPrescriptionModalProps {
  currentPrescription: Prescription;
  onImport: (prescription: Prescription) => void;
  onClose: () => void;
}

export const SAMPLE_PRESCRIPTION_JSON = {
  prescriptionNumber: "RX-2026-0089",
  date: "2026-10-05",
  language: "en",
  theme: "classic",
  printMode: "full",
  patient: {
    name: "Md. Rafiqul Islam",
    nameBn: "মোঃ রফিকুল ইসলাম",
    age: "48Y",
    gender: "male",
    phone: "01712345678",
    weight: "68 kg",
    height: "5 ft 7 in",
    bloodPressure: "130/85 mmHg",
    address: "Dhanmondi, Dhaka",
    allergies: "No known drug allergies"
  },
  complaints: "1. Severe low back pain radiating to left leg for 3 months.\n2. Tingling sensation and numbness along L5 dermatome.\n3. Symptoms aggregate on prolonged standing or walking.",
  complaintsBn: "১. ৩ মাস ধরে তীব্র কোমর ব্যথা যা বাম পায়ে নেমে যায়।\n২. পায়ে ঝিঁঝিঁ ধরা ও অবশ ভাব।\n৩. দীর্ঘক্ষণ হাঁটাহাঁটি বা দাঁড়িয়ে থাকলে ব্যথা বৃদ্ধি পায়।",
  history: "Known hypertensive for 2 years (taking Amlodipine 5mg).\nNo history of major trauma or spine surgery.",
  onExamination: "1. Lumbar spine tenderness at L4-L5 level.\n2. Straight Leg Raise (SLR): Left 40°, Right 80°.\n3. Deep tendon reflexes: Knee jerk normal, Ankle jerk slightly diminished on left.\n4. Plantar: Flexor bilaterally.",
  diagnoses: [
    {
      text: "Lumbar PLID with L5 Radiculopathy",
      note: "L4-L5 disc protrusion suspected"
    },
    {
      text: "Primary Hypertension",
      note: "Well controlled"
    }
  ],
  medicines: [
    {
      name: "Tab. Naprosyn",
      genericName: "Naproxen",
      form: "tablet",
      strength: "500 mg",
      morning: "1",
      afternoon: "0",
      evening: "1",
      timing: "খাবারের পরে (After meal)",
      duration: "7 days",
      instruction: "Do not take on an empty stomach"
    },
    {
      name: "Cap. Maxpro",
      genericName: "Esomeprazole",
      form: "capsule",
      strength: "20 mg",
      morning: "1",
      afternoon: "0",
      evening: "1",
      timing: "খাবারের ২০ মিনিট পূর্বে (Before meal)",
      duration: "14 days",
      instruction: "Take with water"
    },
    {
      name: "Tab. Myolax",
      genericName: "Tolperisone Hydrochloride",
      form: "tablet",
      strength: "50 mg",
      morning: "1",
      afternoon: "0",
      evening: "1",
      timing: "খাবারের পরে (After meal)",
      duration: "10 days",
      instruction: "For muscle spasm relief"
    },
    {
      name: "Tab. Neuro-B",
      genericName: "Vitamin B1 + B6 + B12",
      form: "tablet",
      strength: "",
      morning: "1",
      afternoon: "0",
      evening: "1",
      timing: "খাবারের পরে (After meal)",
      duration: "1 month",
      instruction: "Nerve nourishment supplement"
    },
    {
      name: "Tab. Pregalin",
      genericName: "Pregabalin",
      form: "tablet",
      strength: "50 mg",
      morning: "0",
      afternoon: "0",
      evening: "1",
      timing: "রাতে শোবার আগে (At bedtime)",
      duration: "14 days",
      instruction: "For neuropathic radiating pain"
    }
  ],
  investigations: [
    {
      name: "MRI of Lumbar Spine (Plain & Contrast)",
      category: "imaging",
      instruction: "High-field 1.5T/3.0T machine"
    },
    {
      name: "X-Ray Lumbo-Sacral Spine (B/V: AP & Lateral)",
      category: "imaging",
      instruction: "Standing position"
    },
    {
      name: "CBC with ESR",
      category: "lab",
      instruction: "Screening for inflammatory markers"
    },
    {
      name: "Serum Creatinine",
      category: "lab",
      instruction: "Kidney profile before continuing NSAIDs"
    }
  ],
  advice: "1. Strict flat firm bed rest during acute pain episodes.\n2. Avoid lifting heavy weights, twisting movements, and forward bending.\n3. Wear a Lumbo-sacral corset belt during travel or physical movement.\n4. Apply local heat/cold pack for 15 minutes twice daily.\n5. Perform guided core & back extensor isometric exercises once acute pain subsides.",
  adviceBn: "১. শক্ত সমান বিছানায় বিশ্রাম নিন।\n২. ঝুঁকে বা ভারী জিনিস তোলা সম্পূর্ণ নিষেধ।\n৩. ভ্রমণের সময় লাম্বার করসেট বেল্ট ব্যবহার করুন।\n৪. দিনে দুবার হালকা গরম সেঁক দিন।\n৫. ব্যথা কমলে ডাক্তারের পরামর্শ অনুযায়ী হালকা পিঠের ব্যায়াম করুন।",
  followUpDate: "2026-10-20",
  followUpText: "Review with MRI Lumbar Spine & investigation reports after 2 weeks",
  followUpTextBn: "২ সপ্তাহ পর এমআরআই ও রক্ত পরীক্ষার রিপোর্ট নিয়ে দেখা করবেন"
};

export function normalizePrescriptionJson(raw: any, baseRx: Prescription): Prescription {
  // If array was passed, take first item
  const data = Array.isArray(raw) ? raw[0] : raw;
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid JSON format: Expected a JSON object with prescription data');
  }

  const now = getDhakaNow();

  // Normalize patient
  const pRaw = data.patient || {};
  const patient: Patient = {
    id: pRaw.id || baseRx.patient?.id || uuidv4(),
    patientId: pRaw.patientId || baseRx.patient?.patientId,
    name: pRaw.name || (typeof pRaw === 'string' ? pRaw : '') || baseRx.patient?.name || '',
    nameBn: pRaw.nameBn || baseRx.patient?.nameBn || '',
    dateOfBirth: pRaw.dateOfBirth || baseRx.patient?.dateOfBirth,
    age: pRaw.age || baseRx.patient?.age || '',
    gender: (pRaw.gender === 'male' || pRaw.gender === 'female' || pRaw.gender === 'other') ? pRaw.gender : (baseRx.patient?.gender || 'male'),
    weight: pRaw.weight || baseRx.patient?.weight || '',
    height: pRaw.height || baseRx.patient?.height || '',
    bloodPressure: pRaw.bloodPressure || baseRx.patient?.bloodPressure || '',
    phone: pRaw.phone || baseRx.patient?.phone || '',
    address: pRaw.address || baseRx.patient?.address || '',
    allergies: pRaw.allergies || baseRx.patient?.allergies || '',
    notes: pRaw.notes || baseRx.patient?.notes || '',
    createdAt: pRaw.createdAt || baseRx.patient?.createdAt || now,
    updatedAt: now,
  };

  // Normalize diagnoses
  const dRaw = Array.isArray(data.diagnoses) ? data.diagnoses : [];
  const diagnoses: Diagnosis[] = dRaw.map((d: any) => {
    if (typeof d === 'string') {
      return { id: uuidv4(), text: d };
    }
    return {
      id: d.id || uuidv4(),
      text: d.text || d.name || '',
      note: d.note || '',
    };
  }).filter((d: Diagnosis) => d.text.trim().length > 0);

  // Normalize medicines
  const mRaw = Array.isArray(data.medicines) ? data.medicines : [];
  const validForms: MedicineForm[] = ['tablet', 'capsule', 'syrup', 'injection', 'cream', 'ointment', 'drops', 'inhaler', 'suppository', 'other'];
  const medicines: PrescriptionMedicine[] = mRaw.map((m: any) => {
    if (typeof m === 'string') {
      return {
        id: uuidv4(),
        name: m,
        form: 'tablet' as MedicineForm,
        morning: '1',
        afternoon: '0',
        evening: '1',
        timing: 'After meal',
      };
    }
    const form: MedicineForm = validForms.includes(m.form) ? m.form : 'tablet';
    return {
      id: m.id || uuidv4(),
      name: m.name || '',
      genericName: m.genericName || '',
      form,
      strength: m.strength || '',
      route: m.route || '',
      morning: m.morning !== undefined ? String(m.morning) : '1',
      afternoon: m.afternoon !== undefined ? String(m.afternoon) : '0',
      evening: m.evening !== undefined ? String(m.evening) : '1',
      timing: m.timing || 'খাবারের পরে (After meal)',
      duration: m.duration || '7 days',
      quantity: m.quantity || '',
      instruction: m.instruction || '',
      isFavorite: Boolean(m.isFavorite),
      pregnancyCategory: m.pregnancyCategory,
      isLactationSafe: m.isLactationSafe,
    };
  }).filter((m: PrescriptionMedicine) => m.name.trim().length > 0);

  // Normalize investigations
  const iRaw = Array.isArray(data.investigations) ? data.investigations : [];
  const investigations: Investigation[] = iRaw.map((inv: any) => {
    if (typeof inv === 'string') {
      return { id: uuidv4(), name: inv };
    }
    return {
      id: inv.id || uuidv4(),
      name: inv.name || '',
      instruction: inv.instruction || '',
      category: inv.category || 'lab',
    };
  }).filter((inv: Investigation) => inv.name.trim().length > 0);

  return {
    ...baseRx,
    id: data.id || baseRx.id || uuidv4(),
    prescriptionNumber: data.prescriptionNumber || baseRx.prescriptionNumber,
    date: data.date || baseRx.date || now,
    patient,
    complaints: data.complaints ?? baseRx.complaints ?? '',
    complaintsBn: data.complaintsBn ?? baseRx.complaintsBn ?? '',
    history: data.history ?? baseRx.history ?? '',
    onExamination: data.onExamination ?? baseRx.onExamination ?? '',
    diagnoses,
    medicines,
    investigations,
    advice: data.advice ?? baseRx.advice ?? '',
    adviceBn: data.adviceBn ?? baseRx.adviceBn ?? '',
    followUpDate: data.followUpDate ?? baseRx.followUpDate ?? '',
    followUpText: data.followUpText ?? baseRx.followUpText ?? '',
    followUpTextBn: data.followUpTextBn ?? baseRx.followUpTextBn ?? '',
    additionalNotes: data.additionalNotes ?? baseRx.additionalNotes ?? '',
    language: (data.language === 'en' || data.language === 'bn') ? data.language : (baseRx.language || 'en'),
    theme: data.theme || baseRx.theme || 'classic',
    printMode: data.printMode || baseRx.printMode || 'full',
    pageCount: data.pageCount || baseRx.pageCount || '1',
    splitAfterMedicine: data.splitAfterMedicine ?? baseRx.splitAfterMedicine,
    showQrCode: data.showQrCode !== undefined ? Boolean(data.showQrCode) : (baseRx.showQrCode ?? true),
    isDraft: false,
    updatedAt: now,
  };
}

export function JsonPrescriptionModal({
  currentPrescription,
  onImport,
  onClose,
}: JsonPrescriptionModalProps) {
  const [activeTab, setActiveTab] = useState<'import' | 'template' | 'export'>('import');
  const [jsonInput, setJsonInput] = useState<string>('');
  const [fileName, setFileName] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copiedTemplate, setCopiedTemplate] = useState(false);
  const [copiedExport, setCopiedExport] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle File Upload (.json)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMsg(null);
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        // Verify JSON parse
        JSON.parse(content);
        setJsonInput(content);
      } catch (err: any) {
        setErrorMsg('Invalid JSON in file: ' + err.message);
      }
    };
    reader.onerror = () => {
      setErrorMsg('Failed to read the selected file.');
    };
    reader.readAsText(file);
  };

  // Perform Import
  const handleExecuteImport = () => {
    setErrorMsg(null);
    if (!jsonInput.trim()) {
      setErrorMsg('Please paste JSON or choose a .json file first.');
      return;
    }

    try {
      const parsed = JSON.parse(jsonInput);
      const normalized = normalizePrescriptionJson(parsed, currentPrescription);
      onImport(normalized);
      onClose();
    } catch (err: any) {
      setErrorMsg('Import error: ' + err.message);
    }
  };

  // Download Sample Template File
  const handleDownloadTemplateFile = () => {
    const jsonStr = JSON.stringify(SAMPLE_PRESCRIPTION_JSON, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'easypad_prescription_template.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Copy Sample Template to Clipboard
  const handleCopyTemplate = async () => {
    const jsonStr = JSON.stringify(SAMPLE_PRESCRIPTION_JSON, null, 2);
    await navigator.clipboard.writeText(jsonStr);
    setCopiedTemplate(true);
    setTimeout(() => setCopiedTemplate(false), 2000);
  };

  // Load Sample Template directly into builder
  const handleLoadSampleNow = () => {
    const normalized = normalizePrescriptionJson(SAMPLE_PRESCRIPTION_JSON, currentPrescription);
    onImport(normalized);
    onClose();
  };

  // Download Current Rx as JSON
  const handleDownloadCurrentRx = () => {
    const jsonStr = JSON.stringify(currentPrescription, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `prescription_${currentPrescription.prescriptionNumber || 'data'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Copy Current Rx to Clipboard
  const handleCopyCurrentRx = async () => {
    const jsonStr = JSON.stringify(currentPrescription, null, 2);
    await navigator.clipboard.writeText(jsonStr);
    setCopiedExport(true);
    setTimeout(() => setCopiedExport(false), 2000);
  };

  // Format the text inside input
  const handleFormatJsonInput = () => {
    try {
      if (!jsonInput.trim()) return;
      const parsed = JSON.parse(jsonInput);
      setJsonInput(JSON.stringify(parsed, null, 2));
      setErrorMsg(null);
    } catch (err: any) {
      setErrorMsg('Cannot format invalid JSON: ' + err.message);
    }
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 300 }}>
      <div className="modal-box" style={{ maxWidth: 720, width: '95%', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <div className="modal-header" style={{ background: '#f8faff', borderBottom: '1px solid #e2e8f0', padding: '14px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white',
              boxShadow: '0 4px 10px rgba(99, 102, 241, 0.3)'
            }}>
              <FileCode size={20} />
            </div>
            <div>
              <div className="modal-title" style={{ fontSize: 16, color: '#1e1b4b', display: 'flex', alignItems: 'center', gap: 6 }}>
                <span>Prescription JSON Data Manager</span>
                <span style={{ fontSize: 10, background: '#ede9fe', color: '#6366f1', padding: '2px 8px', borderRadius: 12, fontWeight: 700 }}>
                  Smart Schema
                </span>
              </div>
              <div style={{ fontSize: 11, color: '#64748b' }}>
                সরাসরি JSON ফাইল আপলোড করুন অথবা রেডিমেড টেমপ্লেট দিয়ে প্রেসক্রিপশন তৈরি করুন
              </div>
            </div>
          </div>
          <button className="btn-icon" onClick={onClose}><X size={18} /></button>
        </div>

        {/* Tab Switcher */}
        <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', background: '#ffffff', padding: '0 20px' }}>
          <button
            onClick={() => setActiveTab('import')}
            style={{
              padding: '12px 16px',
              border: 'none',
              background: 'none',
              borderBottom: activeTab === 'import' ? '2px solid #4f46e5' : '2px solid transparent',
              color: activeTab === 'import' ? '#4f46e5' : '#64748b',
              fontWeight: activeTab === 'import' ? 700 : 500,
              fontSize: 13,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}
          >
            <Upload size={14} /> Import File / Paste JSON
          </button>
          <button
            onClick={() => setActiveTab('template')}
            style={{
              padding: '12px 16px',
              border: 'none',
              background: 'none',
              borderBottom: activeTab === 'template' ? '2px solid #4f46e5' : '2px solid transparent',
              color: activeTab === 'template' ? '#4f46e5' : '#64748b',
              fontWeight: activeTab === 'template' ? 700 : 500,
              fontSize: 13,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}
          >
            <Sparkles size={14} /> Sample JSON Template
          </button>
          <button
            onClick={() => setActiveTab('export')}
            style={{
              padding: '12px 16px',
              border: 'none',
              background: 'none',
              borderBottom: activeTab === 'export' ? '2px solid #4f46e5' : '2px solid transparent',
              color: activeTab === 'export' ? '#4f46e5' : '#64748b',
              fontWeight: activeTab === 'export' ? 700 : 500,
              fontSize: 13,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}
          >
            <Download size={14} /> Export Current Rx
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body" style={{ padding: 20, overflowY: 'auto', flex: 1 }}>
          {/* TAB 1: IMPORT */}
          {activeTab === 'import' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* File Dropzone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                style={{
                  border: '2px dashed #cbd5e1',
                  borderRadius: 12,
                  padding: '20px 16px',
                  textAlign: 'center',
                  background: '#f8fafc',
                  cursor: 'pointer',
                  transition: 'border-color 0.15s',
                }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = '#6366f1')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = '#cbd5e1')}
              >
                <input
                  type="file"
                  accept=".json"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                />
                <div style={{
                  width: 44, height: 44, borderRadius: '50%', background: '#e0e7ff', color: '#4f46e5',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px'
                }}>
                  <Upload size={20} />
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#1e293b' }}>
                  {fileName ? `Selected: ${fileName}` : 'Click or drag a .json file here'}
                </div>
                <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>
                  Supports full EasyPad prescription JSON or custom medical records
                </div>
              </div>

              {/* Or Divider */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
                <span style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>
                  OR PASTE RAW JSON BELOW
                </span>
                <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
              </div>

              {/* Raw JSON Input Box */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#334155' }}>
                    JSON Text
                  </label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      type="button"
                      onClick={handleFormatJsonInput}
                      style={{
                        background: 'none', border: 'none', color: '#4f46e5', fontSize: 11,
                        cursor: 'pointer', fontWeight: 600
                      }}
                    >
                      Format JSON
                    </button>
                    <button
                      type="button"
                      onClick={() => setJsonInput('')}
                      style={{
                        background: 'none', border: 'none', color: '#64748b', fontSize: 11,
                        cursor: 'pointer'
                      }}
                    >
                      Clear
                    </button>
                  </div>
                </div>

                <textarea
                  rows={9}
                  value={jsonInput}
                  onChange={e => setJsonInput(e.target.value)}
                  placeholder='{\n  "patient": { "name": "Patient Name", "age": "35Y", "gender": "male" },\n  "complaints": "Chest pain, fever",\n  "medicines": [\n    { "name": "Tab. Napa Extra", "morning": "1", "afternoon": "1", "evening": "1", "duration": "5 days" }\n  ]\n}'
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    fontFamily: 'Consolas, Monaco, "Courier New", monospace',
                    fontSize: 12,
                    lineHeight: 1.5,
                    padding: '12px 14px',
                    borderRadius: 8,
                    border: '1px solid #cbd5e1',
                    background: '#0f172a',
                    color: '#e2e8f0',
                    outline: 'none',
                  }}
                />
              </div>

              {/* Error Message */}
              {errorMsg && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  background: '#fef2f2', border: '1px solid #fecaca',
                  color: '#b91c1c', padding: '10px 14px', borderRadius: 8, fontSize: 12
                }}>
                  <AlertCircle size={16} style={{ flexShrink: 0 }} />
                  <span>{errorMsg}</span>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: SAMPLE TEMPLATE */}
          {activeTab === 'template' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{
                background: '#f0fdf4',
                border: '1px solid #bbf7d0',
                borderRadius: 10,
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 12,
                flexWrap: 'wrap'
              }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 13, color: '#166534', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Sparkles size={16} /> Official Sample Prescription Template
                  </div>
                  <div style={{ fontSize: 11, color: '#15803d', marginTop: 2 }}>
                    This JSON template contains patient, complaints, examination, diagnoses, medicines, lab tests, and advice.
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <button
                    onClick={handleDownloadTemplateFile}
                    className="btn-primary"
                    style={{ fontSize: 12, padding: '6px 12px', background: '#16a34a', borderColor: '#15803d' }}
                  >
                    <Download size={14} /> Download Template (.json)
                  </button>
                  <button
                    onClick={handleCopyTemplate}
                    className="btn-ghost btn-sm"
                    style={{ background: '#ffffff', border: '1px solid #86efac', color: '#166534', fontSize: 12 }}
                  >
                    {copiedTemplate ? <Check size={14} /> : <Copy size={14} />}
                    {copiedTemplate ? 'Copied!' : 'Copy JSON'}
                  </button>
                  <button
                    onClick={handleLoadSampleNow}
                    className="btn-primary btn-sm"
                    style={{ fontSize: 12, padding: '6px 12px' }}
                  >
                    <ArrowRight size={14} /> Load Into Rx Now
                  </button>
                </div>
              </div>

              {/* Code Box */}
              <div style={{ position: 'relative' }}>
                <pre style={{
                  margin: 0,
                  maxHeight: 340,
                  overflowY: 'auto',
                  background: '#0f172a',
                  color: '#e2e8f0',
                  padding: 16,
                  borderRadius: 10,
                  fontSize: 11.5,
                  fontFamily: 'Consolas, Monaco, monospace',
                  lineHeight: 1.5,
                  border: '1px solid #1e293b'
                }}>
                  {JSON.stringify(SAMPLE_PRESCRIPTION_JSON, null, 2)}
                </pre>
              </div>
            </div>
          )}

          {/* TAB 3: EXPORT CURRENT RX */}
          {activeTab === 'export' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: 10,
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 10
              }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 13, color: '#1e293b' }}>
                    Current Prescription: {currentPrescription.patient?.name || 'Untitled Patient'}
                  </div>
                  <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>
                    Rx #: {currentPrescription.prescriptionNumber} • {currentPrescription.medicines.length} medicines • {currentPrescription.investigations.length} tests
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={handleCopyCurrentRx}
                    className="btn-ghost btn-sm"
                    style={{ background: '#ffffff', border: '1px solid #cbd5e1', fontSize: 12 }}
                  >
                    {copiedExport ? <Check size={14} /> : <Copy size={14} />}
                    {copiedExport ? 'Copied' : 'Copy'}
                  </button>
                  <button
                    onClick={handleDownloadCurrentRx}
                    className="btn-primary btn-sm"
                    style={{ fontSize: 12 }}
                  >
                    <Download size={14} /> Download .json
                  </button>
                </div>
              </div>

              {/* Code Box */}
              <pre style={{
                margin: 0,
                maxHeight: 340,
                overflowY: 'auto',
                background: '#0f172a',
                color: '#e2e8f0',
                padding: 16,
                borderRadius: 10,
                fontSize: 11.5,
                fontFamily: 'Consolas, Monaco, monospace',
                lineHeight: 1.5,
                border: '1px solid #1e293b'
              }}>
                {JSON.stringify(currentPrescription, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="modal-footer" style={{ borderTop: '1px solid #e2e8f0', padding: '12px 20px', background: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: 11, color: '#64748b' }}>
            Tip: You can download the sample template, edit it in Notepad/VSCode, and import it anytime.
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn-ghost btn-sm" onClick={onClose}>
              Cancel
            </button>
            {activeTab === 'import' && (
              <button
                className="btn-primary btn-sm"
                onClick={handleExecuteImport}
                style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)', display: 'flex', alignItems: 'center', gap: 6 }}
              >
                <CheckCircle2 size={15} /> Import Prescription
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
