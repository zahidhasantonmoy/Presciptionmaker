import React, { useState } from 'react';
import {
  Save, Upload, Camera, AlertCircle
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { useToast } from '../components/ui/Toast';
import type { DoctorProfile, PrescriptionTheme } from '../types';
import { v4 as uuidv4 } from 'uuid';

const THEMES: { value: PrescriptionTheme; label: string; desc: string }[] = [
  { value: 'classic', label: 'Classic', desc: 'Blue header, traditional two-column layout' },
  { value: 'minimal', label: 'Minimal', desc: 'Clean, gray tones, less color' },
  { value: 'modern', label: 'Modern', desc: 'Blue gradient header, contemporary feel' },
  { value: 'compact', label: 'Compact', desc: 'Smaller fonts, fits more on one page' },
];

export function SettingsPage() {
  const { doctorProfile, setDoctorProfile, settings, updateSettings, exportData, importData, clearAllData } = useStore();
  const { showToast } = useToast();

  const [profile, setProfile] = useState<Partial<DoctorProfile>>(doctorProfile ?? {
    id: uuidv4(), name: '', degrees: '', specialty: '', showBnHeader: true, theme: 'classic',
  });
  const [clearConfirm, setClearConfirm] = useState(false);

  const updateProfile = (field: string, value: string | boolean) => {
    setProfile(p => ({ ...p, [field]: value }));
  };

  const handleSaveProfile = () => {
    if (!profile.name?.trim()) { showToast('Doctor name is required', 'error'); return; }
    if (!profile.degrees?.trim()) { showToast('Degrees/qualifications are required', 'error'); return; }
    setDoctorProfile({ ...profile, id: profile.id ?? uuidv4(), theme: profile.theme ?? 'classic', showBnHeader: profile.showBnHeader ?? true, updatedAt: new Date().toISOString() } as DoctorProfile);
    showToast('Doctor profile saved!', 'success');
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => updateProfile('logoUrl', ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleSignatureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => updateProfile('signatureUrl', ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleExport = () => {
    const json = exportData();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `easypad-backup-${new Date().toISOString().substring(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Backup exported!', 'success');
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        importData(ev.target?.result as string);
        showToast('Data imported successfully!', 'success');
      } catch {
        showToast('Import failed. Invalid backup file.', 'error');
      }
    };
    reader.readAsText(file);
  };

  const handleClear = () => {
    clearAllData();
    showToast('All data cleared.', 'info');
    setClearConfirm(false);
  };

  const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div>
      <label className="form-label">{label}</label>
      {children}
    </div>
  );

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="card" style={{ padding: 20, marginBottom: 16 }}>
      <h3 style={{ fontSize: 15, fontWeight: 700, color: '#1e40af', marginBottom: 14, paddingBottom: 8, borderBottom: '1px solid #e2e8f0' }}>
        {title}
      </h3>
      {children}
    </div>
  );

  return (
    <div style={{ padding: 24, maxWidth: 800 }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1e293b', marginBottom: 6 }}>Settings</h1>
      <p style={{ color: '#64748b', fontSize: 14, marginBottom: 20 }}>Configure your doctor profile, prescription defaults, and application data.</p>

      {/* Doctor Profile */}
      <Section title="👨‍⚕️ Doctor Profile">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Field label="Full Name (English) *">
            <input className="form-input" value={profile.name ?? ''} placeholder="Dr. Md. Example Rahman"
              onChange={e => updateProfile('name', e.target.value)} />
          </Field>
          <Field label="নাম (বাংলা)">
            <input className="form-input bn" value={profile.nameBn ?? ''}
              style={{ fontFamily: 'var(--font-bn), sans-serif' }}
              placeholder="ডাঃ মোঃ উদাহরণ রহমান"
              onChange={e => updateProfile('nameBn', e.target.value)} />
          </Field>
          <Field label="Title">
            <input className="form-input" value={profile.title ?? ''} placeholder="Dr., Prof., Assoc. Prof."
              onChange={e => updateProfile('title', e.target.value)} />
          </Field>
          <Field label="BMDC Reg. No.">
            <input className="form-input" value={profile.bmdcNumber ?? ''} placeholder="A-XXXXX"
              onChange={e => updateProfile('bmdcNumber', e.target.value)} />
          </Field>
          <div style={{ gridColumn: '1/-1' }}>
            <Field label="Degrees / Qualifications (English) *">
              <input className="form-input" value={profile.degrees ?? ''} placeholder="MBBS, BCS (Health), FCPS (Medicine)"
                onChange={e => updateProfile('degrees', e.target.value)} />
            </Field>
          </div>
          <div style={{ gridColumn: '1/-1' }}>
            <Field label="ডিগ্রি (বাংলা)">
              <input className="form-input bn" value={profile.degreesBn ?? ''}
                style={{ fontFamily: 'var(--font-bn), sans-serif' }}
                placeholder="এমবিবিএস, বিসিএস (স্বাস্থ্য)"
                onChange={e => updateProfile('degreesBn', e.target.value)} />
            </Field>
          </div>
          <Field label="Specialty (English)">
            <input className="form-input" value={profile.specialty ?? ''} placeholder="Medicine / Orthopaedic Surgeon..."
              onChange={e => updateProfile('specialty', e.target.value)} />
          </Field>
          <Field label="বিশেষত্ব (বাংলা)">
            <input className="form-input bn" value={profile.specialtyBn ?? ''}
              style={{ fontFamily: 'var(--font-bn), sans-serif' }}
              placeholder="মেডিসিন বিশেষজ্ঞ"
              onChange={e => updateProfile('specialtyBn', e.target.value)} />
          </Field>
          <Field label="Hospital / Clinic Name">
            <input className="form-input" value={profile.clinicName ?? ''} placeholder="Dhaka Medical College Hospital"
              onChange={e => updateProfile('clinicName', e.target.value)} />
          </Field>
          <Field label="ক্লিনিক নাম (বাংলা)">
            <input className="form-input bn" value={profile.clinicNameBn ?? ''}
              style={{ fontFamily: 'var(--font-bn), sans-serif' }}
              placeholder="ঢাকা মেডিকেল কলেজ হাসপাতাল"
              onChange={e => updateProfile('clinicNameBn', e.target.value)} />
          </Field>
          <div style={{ gridColumn: '1/-1' }}>
            <Field label="Address">
              <input className="form-input" value={profile.address ?? ''} placeholder="Chamber/clinic address"
                onChange={e => updateProfile('address', e.target.value)} />
            </Field>
          </div>
          <Field label="Phone">
            <input className="form-input" value={profile.phone ?? ''} placeholder="01XXXXXXXXX"
              onChange={e => updateProfile('phone', e.target.value)} />
          </Field>
          <Field label="Email">
            <input className="form-input" value={profile.email ?? ''} placeholder="doctor@example.com"
              onChange={e => updateProfile('email', e.target.value)} />
          </Field>
          <Field label="Consultation Hours">
            <input className="form-input" value={profile.consultationHours ?? ''} placeholder="Sat-Thu: 5PM–9PM"
              onChange={e => updateProfile('consultationHours', e.target.value)} />
          </Field>
          <Field label="সেবার সময় (বাংলা)">
            <input className="form-input bn" value={profile.consultationHoursBn ?? ''}
              style={{ fontFamily: 'var(--font-bn), sans-serif' }}
              placeholder="শনি-বৃহঃ: বিকাল ৫টা – রাত ৯টা"
              onChange={e => updateProfile('consultationHoursBn', e.target.value)} />
          </Field>
          <Field label="Footer Text (English)">
            <input className="form-input" value={profile.footerText ?? ''} placeholder="Any footer note"
              onChange={e => updateProfile('footerText', e.target.value)} />
          </Field>
          <Field label="ফুটার (বাংলা)">
            <input className="form-input bn" value={profile.footerTextBn ?? ''}
              style={{ fontFamily: 'var(--font-bn), sans-serif' }}
              onChange={e => updateProfile('footerTextBn', e.target.value)} />
          </Field>
        </div>

        {/* Show Bangla header */}
        <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
          <input type="checkbox" id="showBnHeader" checked={profile.showBnHeader ?? true}
            onChange={e => updateProfile('showBnHeader', e.target.checked)} style={{ width: 16, height: 16 }} />
          <label htmlFor="showBnHeader" style={{ fontSize: 14, fontWeight: 500, color: '#374151', cursor: 'pointer' }}>
            Show Bangla header on prescription
          </label>
        </div>

        {/* Logo & Signature uploads */}
        <div style={{ marginTop: 14, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label className="form-label">Logo Image (PNG/JPG)</label>
            <label style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px',
              border: '1.5px dashed #d1d5db', borderRadius: 8, cursor: 'pointer',
              background: '#f8fafc', fontSize: 13, color: '#64748b',
            }}>
              <Upload size={16} /> Upload Logo
              <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleLogoUpload} />
            </label>
            {profile.logoUrl && (
              <img src={profile.logoUrl} alt="Logo" style={{ marginTop: 6, maxHeight: 50, borderRadius: 4 }} />
            )}
          </div>
          <div>
            <label className="form-label">Signature Image (PNG/JPG)</label>
            <label style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px',
              border: '1.5px dashed #d1d5db', borderRadius: 8, cursor: 'pointer',
              background: '#f8fafc', fontSize: 13, color: '#64748b',
            }}>
              <Camera size={16} /> Upload Signature
              <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleSignatureUpload} />
            </label>
            {profile.signatureUrl && (
              <img src={profile.signatureUrl} alt="Signature" style={{ marginTop: 6, maxHeight: 50, borderRadius: 4 }} />
            )}
          </div>
        </div>

        <button className="btn-primary" style={{ marginTop: 16 }} onClick={handleSaveProfile}>
          <Save size={15} /> Save Profile
        </button>
      </Section>

      {/* Prescription Defaults */}
      <Section title="📋 Prescription Defaults">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
          <Field label="Rx Number Prefix">
            <input className="form-input" value={settings.prescriptionNumberPrefix}
              onChange={e => updateSettings({ prescriptionNumberPrefix: e.target.value })} />
          </Field>
          <Field label="Current Counter">
            <input type="number" className="form-input" value={settings.prescriptionNumberCounter}
              onChange={e => updateSettings({ prescriptionNumberCounter: Number(e.target.value) })} />
          </Field>
          <Field label="Default Theme">
            <select className="form-select" value={settings.theme}
              onChange={e => updateSettings({ theme: e.target.value as PrescriptionTheme })}>
              {THEMES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </Field>
        </div>

        {/* Theme previews */}
        <div style={{ marginTop: 12, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
          {THEMES.map(t => (
            <div key={t.value}
              onClick={() => updateSettings({ theme: t.value })}
              style={{
                padding: '10px 12px', borderRadius: 8, cursor: 'pointer', textAlign: 'center',
                border: `2px solid ${settings.theme === t.value ? '#1e40af' : '#e2e8f0'}`,
                background: settings.theme === t.value ? '#eff6ff' : 'white',
                transition: 'all 0.15s',
              }}>
              <div style={{ fontWeight: 700, fontSize: 13, color: settings.theme === t.value ? '#1e40af' : '#374151' }}>
                {t.label}
              </div>
              <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>{t.desc}</div>
            </div>
          ))}
        </div>

        {/* Auto-save */}
        <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
          <input type="checkbox" id="autoSave" checked={settings.autoSave}
            onChange={e => updateSettings({ autoSave: e.target.checked })} style={{ width: 16, height: 16 }} />
          <label htmlFor="autoSave" style={{ fontSize: 14, fontWeight: 500, color: '#374151', cursor: 'pointer' }}>
            Auto-save drafts every 2 seconds
          </label>
        </div>
      </Section>

      {/* Printing & Pre-printed Pad Configuration */}
      <Section title="🖨️ Printing & Pad Mode Configuration">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <Field label="Default Print Layout">
            <select
              className="form-select"
              value={settings.defaultPrintMode || 'full'}
              onChange={e => updateSettings({ defaultPrintMode: e.target.value as 'full' | 'pad_only' })}
            >
              <option value="full">Full Prescription (with Doctor Header & Clinic details)</option>
              <option value="pad_only">Pre-printed Pad Mode (Hide Header & Footer for physical stationery)</option>
            </select>
          </Field>

          <Field label="Verification QR Code">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, height: 38 }}>
              <input
                type="checkbox"
                id="showQrCode"
                checked={settings.showQrCode ?? true}
                onChange={e => updateSettings({ showQrCode: e.target.checked })}
                style={{ width: 16, height: 16 }}
              />
              <label htmlFor="showQrCode" style={{ fontSize: 13, color: '#374151', cursor: 'pointer' }}>
                Print scannable QR Code with prescription verification link
              </label>
            </div>
          </Field>

          <Field label="Pad Top Blank Margin (mm)">
            <input
              type="number"
              className="form-input"
              value={settings.padTopMarginMm ?? 52}
              min={20}
              max={120}
              onChange={e => updateSettings({ padTopMarginMm: Number(e.target.value) })}
            />
            <div style={{ fontSize: 11, color: '#64748b', marginTop: 3 }}>
              Exact physical height of your printed pad's header (Standard: 52mm)
            </div>
          </Field>

          <Field label="Pad Bottom Blank Margin (mm)">
            <input
              type="number"
              className="form-input"
              value={settings.padBottomMarginMm ?? 25}
              min={10}
              max={80}
              onChange={e => updateSettings({ padBottomMarginMm: Number(e.target.value) })}
            />
            <div style={{ fontSize: 11, color: '#64748b', marginTop: 3 }}>
              Exact physical height of your printed pad's footer (Standard: 25mm)
            </div>
          </Field>
        </div>
      </Section>

      {/* Data Management */}
      <Section title="💾 Data Backup & Management">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{
            background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 8, padding: '10px 14px',
            display: 'flex', gap: 8, fontSize: 13, color: '#92400e',
          }}>
            <AlertCircle size={16} style={{ flexShrink: 0, marginTop: 1 }} />
            All data is stored locally in your browser. Export regularly to prevent data loss. 
            Clearing browser data will delete all prescriptions.
          </div>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button className="btn-secondary" onClick={handleExport}>
              Export Backup (JSON)
            </button>

            <label style={{ display: 'inline-block' }}>
              <span className="btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <Upload size={15} /> Import Backup
              </span>
              <input type="file" accept=".json" style={{ display: 'none' }} onChange={handleImport} />
            </label>
          </div>

          <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: 12 }}>
            {!clearConfirm ? (
              <button className="btn-danger" onClick={() => setClearConfirm(true)}>
                Clear All Data
              </button>
            ) : (
              <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                <span style={{ fontSize: 13, color: '#dc2626', fontWeight: 600 }}>
                  ⚠️ This will permanently delete ALL prescriptions, patients, and settings!
                </span>
                <button className="btn-danger" onClick={handleClear}>Yes, clear everything</button>
                <button className="btn-ghost" onClick={() => setClearConfirm(false)}>Cancel</button>
              </div>
            )}
          </div>
        </div>
      </Section>
    </div>
  );
}
