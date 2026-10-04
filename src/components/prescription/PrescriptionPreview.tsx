import React, { forwardRef } from 'react';
import type { Prescription, DoctorProfile, PrescriptionTheme, PrescriptionMedicine } from '../../types';
import { formatDateDisplay } from '../../utils/dateUtils';

interface PrescriptionPreviewProps {
  prescription: Prescription;
  doctorProfile: DoctorProfile | null;
  scale?: number;
}

function getMedicineFormLabel(form: string): string {
  const map: Record<string, string> = {
    tablet: 'Tab.', capsule: 'Cap.', syrup: 'Syp.', injection: 'Inj.',
    cream: 'Cr.', ointment: 'Oint.', drops: 'Drops', inhaler: 'Inhaler',
    suppository: 'Supp.', other: ''
  };
  return map[form] ?? '';
}

function getMedicineDisplayName(med: PrescriptionMedicine): string {
  const name = (med.name || '').trim();
  if (!name) return '';
  const formLabel = getMedicineFormLabel(med.form);
  if (!formLabel) return name;
  if (/^(tab|cap|inj|syp|susp|drop|drops|cr|cream|oint|ointment|supp|inhaler)\.?\s+/i.test(name)) {
    return name;
  }
  return `${formLabel} ${name}`;
}

export const PrescriptionPreview = forwardRef<HTMLDivElement, PrescriptionPreviewProps>(
  ({ prescription, doctorProfile, scale = 1 }, ref) => {
    const theme: PrescriptionTheme = prescription.theme ?? 'classic';

    const patientAge = prescription.patient.age || '';
    const patientGender = prescription.patient.gender
      ? (prescription.patient.gender.charAt(0).toUpperCase() + prescription.patient.gender.slice(1))
      : '';

    return (
      <div
        ref={ref}
        className={`rx-preview theme-${theme}`}
        style={{ transform: scale !== 1 ? `scale(${scale})` : undefined, transformOrigin: 'top left' }}
        aria-label="Prescription Preview"
      >
        <div className="rx-preview-inner">
          {/* ─── HEADER ─────────────────────────────────────────────────────── */}
          {doctorProfile ? (
            <div className="rx-header">
              {/* Left: English info */}
              <div className="rx-header-left">
                <div className="rx-doctor-name">{doctorProfile.name}</div>
                <div className="rx-degrees">{doctorProfile.degrees}</div>
                {doctorProfile.specialty && (
                  <div className="rx-specialty">{doctorProfile.specialty}</div>
                )}
                {doctorProfile.clinicName && (
                  <div className="rx-clinic">{doctorProfile.clinicName}</div>
                )}
                {doctorProfile.address && (
                  <div className="rx-clinic" style={{ color: '#6b7280', fontSize: '8pt' }}>{doctorProfile.address}</div>
                )}
                {(doctorProfile.bmdcNumber || doctorProfile.fellowId) && (
                  <div className="rx-bmdc">
                    {doctorProfile.bmdcNumber && `BMDC Reg. ${doctorProfile.bmdcNumber}`}
                    {doctorProfile.bmdcNumber && doctorProfile.fellowId && ' | '}
                    {doctorProfile.fellowId && `Fellow ID: ${doctorProfile.fellowId}`}
                  </div>
                )}
              </div>

              {/* Center: Logo */}
              <div className="rx-header-center">
                {doctorProfile.logoUrl ? (
                  <img src={doctorProfile.logoUrl} alt="Logo" style={{ maxWidth: 60, maxHeight: 60, objectFit: 'contain' }} />
                ) : (
                  <div style={{
                    width: 60, height: 60, borderRadius: '50%',
                    background: 'linear-gradient(135deg, #1e40af, #3b82f6)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'white', fontWeight: 700, fontSize: '14pt'
                  }}>
                    {doctorProfile.name?.charAt(0) ?? 'D'}
                  </div>
                )}
              </div>

              {/* Right: Bangla info */}
              {doctorProfile.showBnHeader && (
                <div className="rx-header-right">
                  {doctorProfile.nameBn && <div className="rx-doctor-name-bn bn-text">{doctorProfile.nameBn}</div>}
                  {doctorProfile.degreesBn && <div className="rx-degrees bn-text">{doctorProfile.degreesBn}</div>}
                  {doctorProfile.specialtyBn && <div className="rx-specialty bn-text">{doctorProfile.specialtyBn}</div>}
                  {doctorProfile.clinicNameBn && <div className="rx-clinic bn-text">{doctorProfile.clinicNameBn}</div>}
                </div>
              )}
            </div>
          ) : (
            <div className="rx-header" style={{ gridTemplateColumns: '1fr' }}>
              <div style={{ textAlign: 'center' }}>
                <div className="rx-doctor-name" style={{ color: '#94a3b8' }}>Doctor Name – Configure in Settings</div>
              </div>
            </div>
          )}

          {/* ─── PATIENT BAR ─────────────────────────────────────────────── */}
          <div className="rx-patient-bar">
            <div className="rx-patient-field">
              <span className="rx-patient-label">রোগীর নাম:</span>
              <span className="rx-patient-value bn-text" style={{ fontFamily: prescription.patient.nameBn ? 'var(--font-bn)' : 'inherit' }}>
                {prescription.patient.nameBn || prescription.patient.name || '–'}
              </span>
              {prescription.patient.nameBn && prescription.patient.name && (
                <span className="rx-patient-value" style={{ marginLeft: 4, color: '#6b7280' }}>({prescription.patient.name})</span>
              )}
            </div>
            {prescription.patient.patientId && (
              <div className="rx-patient-field">
                <span className="rx-patient-label">ID:</span>
                <span className="rx-patient-value">{prescription.patient.patientId}</span>
              </div>
            )}
            {patientAge && (
              <div className="rx-patient-field">
                <span className="rx-patient-label">বয়স:</span>
                <span className="rx-patient-value">{patientAge}</span>
              </div>
            )}
            {patientGender && (
              <div className="rx-patient-field">
                <span className="rx-patient-label">Gender:</span>
                <span className="rx-patient-value">{patientGender}</span>
              </div>
            )}
            {prescription.patient.weight && (
              <div className="rx-patient-field">
                <span className="rx-patient-label">Wt:</span>
                <span className="rx-patient-value">{prescription.patient.weight} kg</span>
              </div>
            )}
            {prescription.patient.bloodPressure && (
              <div className="rx-patient-field">
                <span className="rx-patient-label">BP:</span>
                <span className="rx-patient-value">{prescription.patient.bloodPressure} mmHg</span>
              </div>
            )}
            <div className="rx-patient-field" style={{ marginLeft: 'auto' }}>
              <span className="rx-patient-label">তারিখ:</span>
              <span className="rx-patient-value">{formatDateDisplay(prescription.date)}</span>
            </div>
          </div>

          {/* ─── PRESCRIPTION NUMBER ──────────────────────────────────────── */}
          {prescription.prescriptionNumber && (
            <div style={{ fontSize: '8pt', color: '#6b7280', marginBottom: '6px', textAlign: 'right' }}>
              Rx# {prescription.prescriptionNumber}
            </div>
          )}

          {/* ─── BODY: 2-COLUMN ──────────────────────────────────────────── */}
          <div className="rx-body">
            {/* LEFT COLUMN */}
            <div className="rx-left-col">
              {/* Complaints */}
              {prescription.complaints && (
                <>
                  <div className="rx-section-title">Complaints</div>
                  <div style={{ fontSize: '9pt', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                    {prescription.complaints}
                  </div>
                  {prescription.complaintsBn && (
                    <div className="bn-text" style={{ fontSize: '9pt', lineHeight: 1.6, marginTop: 2 }}>
                      {prescription.complaintsBn}
                    </div>
                  )}
                </>
              )}

              {/* On Examination */}
              {prescription.onExamination && (
                <>
                  <div className="rx-section-title">On Examination</div>
                  <div style={{ fontSize: '9pt', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{prescription.onExamination}</div>
                </>
              )}

              {/* History */}
              {prescription.history && (
                <>
                  <div className="rx-section-title">History</div>
                  <div style={{ fontSize: '9pt', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{prescription.history}</div>
                </>
              )}

              {/* Diagnosis */}
              {prescription.diagnoses.length > 0 && (
                <>
                  <div className="rx-section-title">Diagnosis</div>
                  <ul className="rx-bullet-list">
                    {prescription.diagnoses.map(d => (
                      <li key={d.id}>
                        {d.text}
                        {d.note && <span style={{ color: '#6b7280', fontSize: '8.5pt' }}> – {d.note}</span>}
                      </li>
                    ))}
                  </ul>
                </>
              )}

              {/* Investigations */}
              {prescription.investigations.length > 0 && (
                <>
                  <div className="rx-section-title">Investigation</div>
                  <ul className="rx-bullet-list">
                    {prescription.investigations.map(inv => (
                      <li key={inv.id}>
                        {inv.name}
                        {inv.instruction && <span style={{ color: '#6b7280', fontSize: '8.5pt' }}> ({inv.instruction})</span>}
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>

            {/* RIGHT COLUMN */}
            <div className="rx-right-col">
              <div className="rx-symbol">℞</div>

              {/* Medicines */}
              {prescription.medicines.length === 0 && (
                <div style={{ color: '#9ca3af', fontSize: '9pt', fontStyle: 'italic' }}>No medicines added</div>
              )}
              {prescription.medicines.map((med, idx) => (
                <div key={med.id} className="rx-medicine-row">
                  <div className="rx-medicine-name">
                    <span style={{ fontWeight: 700 }}>{idx + 1}.</span>{' '}
                    <span>{getMedicineDisplayName(med)}</span>
                    {med.genericName && (
                      <span style={{ fontSize: '8pt', color: '#64748b', fontWeight: 400, marginLeft: 6, fontStyle: 'italic' }}>
                        ({med.genericName})
                      </span>
                    )}
                  </div>
                  <div className="rx-medicine-dose">
                    <div className="rx-medicine-dose-grid">
                      <span className="rx-dose-value">{med.morning}+{med.afternoon}+{med.evening}</span>
                      {med.timing && <span className="rx-timing">{med.timing}</span>}
                      {med.duration && <span className="rx-duration">{med.duration}</span>}
                    </div>
                    {med.instruction && (
                      <div className="bn-text" style={{ fontSize: '8.5pt', color: '#374151', marginTop: 1 }}>
                        {med.instruction}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Advice */}
              {(prescription.advice || prescription.adviceBn) && (
                <>
                  <div className="rx-section-title" style={{ marginTop: 10 }}>পরামর্শ / Advice</div>
                  {prescription.advice && (
                    <div style={{ fontSize: '9pt', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{prescription.advice}</div>
                  )}
                  {prescription.adviceBn && (
                    <div className="bn-text" style={{ fontSize: '9pt', lineHeight: 1.6, marginTop: 3 }}>
                      {prescription.adviceBn}
                    </div>
                  )}
                </>
              )}

              {/* Follow-up */}
              {(prescription.followUpText || prescription.followUpDate) && (
                <div style={{ marginTop: 10 }}>
                  <span className="rx-followup">
                    পরবর্তী সাক্ষাৎ:{' '}
                    {prescription.followUpText || (prescription.followUpDate && formatDateDisplay(prescription.followUpDate))}
                  </span>
                </div>
              )}

              {/* Additional Notes */}
              {prescription.additionalNotes && (
                <div style={{ marginTop: 8, fontSize: '8.5pt', color: '#374151', fontStyle: 'italic' }}>
                  {prescription.additionalNotes}
                </div>
              )}

              {/* Signature */}
              <div className="rx-signature-area" style={{ marginTop: 24 }}>
                {doctorProfile?.signatureUrl ? (
                  <img src={doctorProfile.signatureUrl} alt="Signature" style={{ maxWidth: 120, maxHeight: 60 }} />
                ) : (
                  <div style={{ borderBottom: '1px solid #374151', width: 100, marginLeft: 'auto', marginBottom: 4 }}></div>
                )}
                <div style={{ fontSize: '8pt', color: '#374151' }}>Signature</div>
              </div>
            </div>
          </div>

          {/* ─── FOOTER ──────────────────────────────────────────────────── */}
          <div className="rx-footer">
            <div>
              {doctorProfile?.phone && <span>📞 {doctorProfile.phone}</span>}
              {doctorProfile?.email && <span style={{ marginLeft: 10 }}>✉ {doctorProfile.email}</span>}
            </div>
            {doctorProfile?.consultationHours && (
              <div style={{ textAlign: 'center' }}>
                {doctorProfile.consultationHours}
                {doctorProfile.consultationHoursBn && (
                  <span className="bn-text" style={{ marginLeft: 6 }}>{doctorProfile.consultationHoursBn}</span>
                )}
              </div>
            )}
            <div style={{ textAlign: 'right' }}>
              {doctorProfile?.footerText && <div>{doctorProfile.footerText}</div>}
              {doctorProfile?.footerTextBn && <div className="bn-text">{doctorProfile.footerTextBn}</div>}
              <div style={{ color: '#94a3b8', fontSize: '7pt', marginTop: 2 }}>Powered by EasyPad</div>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

PrescriptionPreview.displayName = 'PrescriptionPreview';
