import React, { useState } from 'react';
import {
  Save, Upload, Camera, AlertCircle, Plus, Trash2, Edit3, Copy, Check, Stethoscope, Building2
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
  const {
    doctorProfiles, activeDoctorId, setActiveDoctorId,
    addDoctorProfile, updateDoctorProfile, deleteDoctorProfile,
    settings, updateSettings, exportData, importData, clearAllData
  } = useStore();
  const { showToast } = useToast();

  const activeDoc = doctorProfiles.find(d => d.id === activeDoctorId) || doctorProfiles[0];
  const [editingProfileId, setEditingProfileId] = useState<string | null>(activeDoc?.id || null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [profileForm, setProfileForm] = useState<Partial<DoctorProfile>>(activeDoc || {
    id: uuidv4(), name: '', degrees: '', specialty: '', showBnHeader: true, theme: 'classic',
  });
  const [clearConfirm, setClearConfirm] = useState(false);

  const startEditProfile = (p: DoctorProfile) => {
    setEditingProfileId(p.id);
    setIsCreatingNew(false);
    setProfileForm({ ...p });
  };

  const startNewProfile = () => {
    const newId = uuidv4();
    setIsCreatingNew(true);
    setEditingProfileId(newId);
    setProfileForm({
      id: newId,
      name: '',
      title: 'Dr.',
      degrees: '',
      specialty: '',
      clinicName: '',
      showBnHeader: true,
      theme: 'classic',
    });
  };

  const updateProfileField = (field: string, value: string | boolean) => {
    setProfileForm(p => ({ ...p, [field]: value }));
  };

  const handleSaveProfile = () => {
    if (!profileForm.name?.trim()) { showToast('Doctor name is required', 'error'); return; }
    if (!profileForm.degrees?.trim()) { showToast('Degrees/qualifications are required', 'error'); return; }

    if (isCreatingNew) {
      const created = addDoctorProfile({
        name: profileForm.name,
        nameBn: profileForm.nameBn,
        title: profileForm.title,
        degrees: profileForm.degrees,
        degreesBn: profileForm.degreesBn,
        specialty: profileForm.specialty || '',
        specialtyBn: profileForm.specialtyBn,
        bmdcNumber: profileForm.bmdcNumber,
        clinicName: profileForm.clinicName,
        clinicNameBn: profileForm.clinicNameBn,
        address: profileForm.address,
        addressBn: profileForm.addressBn,
        phone: profileForm.phone,
        email: profileForm.email,
        consultationHours: profileForm.consultationHours,
        consultationHoursBn: profileForm.consultationHoursBn,
        logoUrl: profileForm.logoUrl,
        signatureUrl: profileForm.signatureUrl,
        footerText: profileForm.footerText,
        footerTextBn: profileForm.footerTextBn,
        showBnHeader: profileForm.showBnHeader ?? true,
        theme: profileForm.theme ?? 'classic',
      });
      setEditingProfileId(created.id);
      setIsCreatingNew(false);
      showToast(`Doctor profile for "${created.name}" created!`, 'success');
    } else if (editingProfileId) {
      updateDoctorProfile(editingProfileId, profileForm);
      showToast('Doctor profile updated!', 'success');
    }
  };

  const handleDuplicateProfile = (p: DoctorProfile) => {
    const cloned = addDoctorProfile({
      ...p,
      name: `${p.name} (Chamber 2)`,
      clinicName: p.clinicName ? `${p.clinicName} (Branch 2)` : 'New Chamber',
    });
    setEditingProfileId(cloned.id);
    setIsCreatingNew(false);
    setProfileForm({ ...cloned });
    showToast(`Profile duplicated as "${cloned.name}"`, 'success');
  };

  const handleDeleteProfile = (id: string, name: string) => {
    if (doctorProfiles.length <= 1) {
      showToast('Cannot delete the only remaining doctor profile', 'error');
      return;
    }
    deleteDoctorProfile(id);
    showToast(`Profile "${name}" deleted`, 'info');
    const remaining = doctorProfiles.filter(d => d.id !== id);
    if (remaining.length > 0) {
      startEditProfile(remaining[0]);
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => updateProfileField('logoUrl', ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleSignatureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => updateProfileField('signatureUrl', ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleSealUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => updateProfileField('sealUrl', ev.target?.result as string);
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
    <div style={{ padding: 24, maxWidth: 860, margin: '0 auto' }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1e293b', marginBottom: 6 }}>Settings & Configuration</h1>
      <p style={{ color: '#64748b', fontSize: 14, marginBottom: 20 }}>
        Manage doctor profiles, chamber details, printing margins, and local data storage.
      </p>

      {/* ─── Doctor Profiles Management ─── */}
      <Section title={`👨‍⚕️ Doctor Profiles (${doctorProfiles.length})`}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <p style={{ fontSize: 13, color: '#475569', margin: 0 }}>
            Switch between different doctors, chambers, or clinic letterheads with 1-click.
          </p>
          <button className="btn-primary btn-sm" onClick={startNewProfile}>
            <Plus size={14} /> Add Doctor Profile
          </button>
        </div>

        {/* List of Doctor Profile Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12, marginBottom: 20 }}>
          {doctorProfiles.map(p => {
            const isActive = p.id === activeDoctorId;
            const isEditing = p.id === editingProfileId && !isCreatingNew;
            return (
              <div
                key={p.id}
                style={{
                  background: isActive ? '#f0fdf4' : (isEditing ? '#eff6ff' : '#ffffff'),
                  border: `2px solid ${isActive ? '#86efac' : (isEditing ? '#93c5fd' : '#e2e8f0')}`,
                  borderRadius: 12,
                  padding: '14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                  position: 'relative',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 6 }}>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 14, color: '#1e293b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {p.name}
                    </div>
                    {p.nameBn && (
                      <div className="bn" style={{ fontSize: 12, color: '#475569', fontFamily: 'var(--font-bn)' }}>
                        {p.nameBn}
                      </div>
                    )}
                  </div>
                  {isActive && (
                    <span className="badge badge-green" style={{ fontSize: 10, flexShrink: 0 }}>
                      <Check size={11} /> Active
                    </span>
                  )}
                </div>

                <div style={{ fontSize: 12, color: '#64748b', lineHeight: 1.4 }}>
                  <div style={{ fontWeight: 500 }}>{p.degrees || 'No degrees specified'}</div>
                  {p.clinicName && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2, color: '#1e40af' }}>
                      <Building2 size={12} /> {p.clinicName}
                    </div>
                  )}
                  {p.bmdcNumber && <div style={{ fontSize: 11, color: '#64748b' }}>BMDC: {p.bmdcNumber}</div>}
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: 6, marginTop: 'auto', paddingTop: 8, borderTop: '1px solid #e2e8f0', flexWrap: 'wrap' }}>
                  {!isActive && (
                    <button
                      className="btn-secondary btn-sm"
                      style={{ fontSize: 11.5, padding: '3px 8px' }}
                      onClick={() => {
                        setActiveDoctorId(p.id);
                        showToast(`Active doctor switched to ${p.name}`, 'success');
                      }}
                    >
                      Make Active
                    </button>
                  )}
                  <button
                    className="btn-ghost btn-sm"
                    style={{ fontSize: 11.5, padding: '3px 8px' }}
                    onClick={() => startEditProfile(p)}
                  >
                    <Edit3 size={12} /> Edit
                  </button>
                  <button
                    className="btn-ghost btn-sm"
                    style={{ fontSize: 11.5, padding: '3px 8px' }}
                    onClick={() => handleDuplicateProfile(p)}
                    title="Duplicate Profile"
                  >
                    <Copy size={12} /> Clone
                  </button>
                  {doctorProfiles.length > 1 && (
                    <button
                      className="btn-icon"
                      style={{ color: '#ef4444', marginLeft: 'auto' }}
                      onClick={() => handleDeleteProfile(p.id, p.name)}
                      title="Delete profile"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* ─── Profile Form Editor ─── */}
        <div style={{
          background: '#f8fafc',
          border: '1.5px solid #cbd5e1',
          borderRadius: 12,
          padding: '18px',
          marginTop: 10,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <h4 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#1e40af', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Stethoscope size={16} />
              {isCreatingNew ? '➕ Create New Doctor Profile' : `✏️ Edit Profile: ${profileForm.name || 'Doctor'}`}
            </h4>
            {isCreatingNew && (
              <button
                className="btn-ghost btn-sm"
                onClick={() => {
                  setIsCreatingNew(false);
                  if (activeDoc) startEditProfile(activeDoc);
                }}
              >
                Cancel
              </button>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="Full Name (English) *">
              <input
                className="form-input"
                value={profileForm.name ?? ''}
                placeholder="Dr. Md. Example Rahman"
                onChange={e => updateProfileField('name', e.target.value)}
              />
            </Field>

            <Field label="নাম (বাংলা)">
              <input
                className="form-input bn"
                value={profileForm.nameBn ?? ''}
                style={{ fontFamily: 'var(--font-bn), sans-serif' }}
                placeholder="ডাঃ মোঃ উদাহরণ রহমান"
                onChange={e => updateProfileField('nameBn', e.target.value)}
              />
            </Field>

            <Field label="Title">
              <input
                className="form-input"
                value={profileForm.title ?? ''}
                placeholder="Dr., Prof., Assoc. Prof."
                onChange={e => updateProfileField('title', e.target.value)}
              />
            </Field>

            <Field label="BMDC Reg. No.">
              <input
                className="form-input"
                value={profileForm.bmdcNumber ?? ''}
                placeholder="A-XXXXX"
                onChange={e => updateProfileField('bmdcNumber', e.target.value)}
              />
            </Field>

            <div style={{ gridColumn: '1/-1' }}>
              <Field label="Degrees / Qualifications (English) *">
                <input
                  className="form-input"
                  value={profileForm.degrees ?? ''}
                  placeholder="MBBS, BCS (Health), FCPS (Medicine), MD"
                  onChange={e => updateProfileField('degrees', e.target.value)}
                />
              </Field>
            </div>

            <div style={{ gridColumn: '1/-1' }}>
              <Field label="ডিগ্রি (বাংলা)">
                <input
                  className="form-input bn"
                  value={profileForm.degreesBn ?? ''}
                  style={{ fontFamily: 'var(--font-bn), sans-serif' }}
                  placeholder="এমবিবিএস, বিসিএস (স্বাস্থ্য), এফসিপিএস (মেডিসিন)"
                  onChange={e => updateProfileField('degreesBn', e.target.value)}
                />
              </Field>
            </div>

            <Field label="Specialty (English)">
              <input
                className="form-input"
                value={profileForm.specialty ?? ''}
                placeholder="Medicine Specialist / Cardiologist..."
                onChange={e => updateProfileField('specialty', e.target.value)}
              />
            </Field>

            <Field label="বিশেষত্ব (বাংলা)">
              <input
                className="form-input bn"
                value={profileForm.specialtyBn ?? ''}
                style={{ fontFamily: 'var(--font-bn), sans-serif' }}
                placeholder="মেডিসিন বিশেষজ্ঞ / হৃদরোগ বিশেষজ্ঞ"
                onChange={e => updateProfileField('specialtyBn', e.target.value)}
              />
            </Field>

            <Field label="Hospital / Clinic / Chamber Name">
              <input
                className="form-input"
                value={profileForm.clinicName ?? ''}
                placeholder="e.g. Popular Diagnostic Center, Dhanmondi"
                onChange={e => updateProfileField('clinicName', e.target.value)}
              />
            </Field>

            <Field label="ক্লিনিক / চেম্বার নাম (বাংলা)">
              <input
                className="form-input bn"
                value={profileForm.clinicNameBn ?? ''}
                style={{ fontFamily: 'var(--font-bn), sans-serif' }}
                placeholder="পপুলার ডায়াগনস্টিক সেন্টার, ধানমন্ডি"
                onChange={e => updateProfileField('clinicNameBn', e.target.value)}
              />
            </Field>

            <div style={{ gridColumn: '1/-1' }}>
              <Field label="Address / Chamber Location">
                <input
                  className="form-input"
                  value={profileForm.address ?? ''}
                  placeholder="House 16, Road 2, Dhanmondi, Dhaka"
                  onChange={e => updateProfileField('address', e.target.value)}
                />
              </Field>
            </div>

            <Field label="Phone / Appointment Hotline">
              <input
                className="form-input"
                value={profileForm.phone ?? ''}
                placeholder="01XXXXXXXXX"
                onChange={e => updateProfileField('phone', e.target.value)}
              />
            </Field>

            <Field label="Email">
              <input
                className="form-input"
                value={profileForm.email ?? ''}
                placeholder="doctor@example.com"
                onChange={e => updateProfileField('email', e.target.value)}
              />
            </Field>

            <Field label="Consultation Hours (English)">
              <input
                className="form-input"
                value={profileForm.consultationHours ?? ''}
                placeholder="Sat–Thu: 5:00 PM – 9:00 PM (Friday Closed)"
                onChange={e => updateProfileField('consultationHours', e.target.value)}
              />
            </Field>

            <Field label="সেবার সময় (বাংলা)">
              <input
                className="form-input bn"
                value={profileForm.consultationHoursBn ?? ''}
                style={{ fontFamily: 'var(--font-bn), sans-serif' }}
                placeholder="শনি–বৃহস্পতি: বিকাল ৫টা – রাত ৯টা (শুক্রবার বন্ধ)"
                onChange={e => updateProfileField('consultationHoursBn', e.target.value)}
              />
            </Field>

            <Field label="Footer Note (English)">
              <input
                className="form-input"
                value={profileForm.footerText ?? ''}
                placeholder="Not valid for medico-legal purposes"
                onChange={e => updateProfileField('footerText', e.target.value)}
              />
            </Field>

            <Field label="ফুটার নোট (বাংলা)">
              <input
                className="form-input bn"
                value={profileForm.footerTextBn ?? ''}
                style={{ fontFamily: 'var(--font-bn), sans-serif' }}
                placeholder="মেডিকেল বা আইনি ক্ষেত্রে প্রযোজ্য নয়"
                onChange={e => updateProfileField('footerTextBn', e.target.value)}
              />
            </Field>
          </div>

          {/* Show Bangla header toggle */}
          <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
            <input
              type="checkbox"
              id="showBnHeader"
              checked={profileForm.showBnHeader ?? true}
              onChange={e => updateProfileField('showBnHeader', e.target.checked)}
              style={{ width: 16, height: 16 }}
            />
            <label htmlFor="showBnHeader" style={{ fontSize: 13.5, fontWeight: 600, color: '#334155', cursor: 'pointer' }}>
              Show bilingual Bangla & English header on prescription pad
            </label>
          </div>

          {/* Logo, Signature & Official Seal Uploads */}
          <div style={{ marginTop: 14, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
            <div>
              <label className="form-label">Clinic / Hospital Logo</label>
              <label style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px',
                border: '1.5px dashed #94a3b8', borderRadius: 8, cursor: 'pointer',
                background: '#ffffff', fontSize: 13, color: '#475569',
              }}>
                <Upload size={16} /> Upload Logo Image
                <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleLogoUpload} />
              </label>
              {profileForm.logoUrl && (
                <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <img src={profileForm.logoUrl} alt="Logo" style={{ maxHeight: 45, borderRadius: 4, border: '1px solid #cbd5e1' }} />
                  <button className="btn-ghost btn-sm" onClick={() => updateProfileField('logoUrl', '')}>Remove</button>
                </div>
              )}
            </div>

            <div>
              <label className="form-label">Doctor Official Seal (সিল)</label>
              <label style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px',
                border: '1.5px dashed #94a3b8', borderRadius: 8, cursor: 'pointer',
                background: '#ffffff', fontSize: 13, color: '#475569',
              }}>
                <Upload size={16} /> Upload Official Seal
                <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleSealUpload} />
              </label>
              {profileForm.sealUrl && (
                <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <img src={profileForm.sealUrl} alt="Seal" style={{ maxHeight: 45, borderRadius: 4, border: '1px solid #cbd5e1' }} />
                  <button className="btn-ghost btn-sm" onClick={() => updateProfileField('sealUrl', '')}>Remove</button>
                </div>
              )}
            </div>

            <div>
              <label className="form-label">Doctor Digital Signature</label>
              <label style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px',
                border: '1.5px dashed #94a3b8', borderRadius: 8, cursor: 'pointer',
                background: '#ffffff', fontSize: 13, color: '#475569',
              }}>
                <Camera size={16} /> Upload Signature Image
                <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleSignatureUpload} />
              </label>
              {profileForm.signatureUrl && (
                <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <img src={profileForm.signatureUrl} alt="Signature" style={{ maxHeight: 45, borderRadius: 4, border: '1px solid #cbd5e1' }} />
                  <button className="btn-ghost btn-sm" onClick={() => updateProfileField('signatureUrl', '')}>Remove</button>
                </div>
              )}
            </div>
          </div>

          {/* Seal & Signature Display Toggles */}
          <div style={{ marginTop: 14, display: 'flex', flexWrap: 'wrap', gap: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input
                type="checkbox"
                id="showSealOnPrint"
                checked={profileForm.showSealOnPrint ?? false}
                onChange={e => updateProfileField('showSealOnPrint', e.target.checked)}
                style={{ width: 16, height: 16, cursor: 'pointer' }}
              />
              <label htmlFor="showSealOnPrint" style={{ fontSize: 13, fontWeight: 600, color: '#334155', cursor: 'pointer' }}>
                প্রেসক্রিপশনে ডাক্তারের সিল (Official Seal) প্রদর্শন করুন
              </label>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input
                type="checkbox"
                id="showSignatureOnPrint"
                checked={profileForm.showSignatureOnPrint ?? false}
                onChange={e => updateProfileField('showSignatureOnPrint', e.target.checked)}
                style={{ width: 16, height: 16, cursor: 'pointer' }}
              />
              <label htmlFor="showSignatureOnPrint" style={{ fontSize: 13, fontWeight: 600, color: '#334155', cursor: 'pointer' }}>
                প্রেসক্রিপশনে ডিজিটাল স্বাক্ষর প্রদর্শন করুন
              </label>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
            <button className="btn-primary" onClick={handleSaveProfile}>
              <Save size={15} /> {isCreatingNew ? 'Save New Profile' : 'Update Profile'}
            </button>
            {isCreatingNew && (
              <button
                className="btn-secondary"
                onClick={() => {
                  setIsCreatingNew(false);
                  if (activeDoc) startEditProfile(activeDoc);
                }}
              >
                Cancel
              </button>
            )}
          </div>
        </div>
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
