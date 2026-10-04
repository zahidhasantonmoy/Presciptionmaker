import React, { forwardRef, useState, useEffect } from 'react';
import QRCode from 'qrcode';
import type { Prescription, DoctorProfile, PrescriptionTheme, PrescriptionMedicine } from '../../types';
import { formatDateDisplay } from '../../utils/dateUtils';
import {
  CaduceusEmblem, PopularLogoSvg, HotlinePhoneSvg, JotnoQrSvg
} from '../../assets/sanowaraAssets';

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
    const isSanowaraTheme = theme === 'sanowara';
    const isPadMode = prescription.printMode === 'pad_only';
    const [qrCodeUrl, setQrCodeUrl] = useState<string>('');

    useEffect(() => {
      if (prescription.showQrCode !== false && prescription.prescriptionNumber) {
        const qrData = `Rx#:${prescription.prescriptionNumber}|Date:${prescription.date.substring(0, 10)}|Dr:${doctorProfile?.name ?? ''}|Pt:${prescription.patient.name}|EasyPad-BD`;
        QRCode.toDataURL(qrData, { width: 80, margin: 1, color: { dark: '#1e3a8a', light: '#ffffff' } })
          .then(url => setQrCodeUrl(url))
          .catch(() => {});
      }
    }, [prescription.prescriptionNumber, prescription.date, prescription.showQrCode, doctorProfile?.name, prescription.patient.name]);

    const patientAge = prescription.patient.age || '';
    const patientGender = prescription.patient.gender
      ? (prescription.patient.gender.charAt(0).toUpperCase() + prescription.patient.gender.slice(1))
      : '';

    return (
      <div
        ref={ref}
        className={`rx-preview theme-${theme} ${isPadMode ? 'pad-mode' : ''}`}
        style={{ transform: scale !== 1 ? `scale(${scale})` : undefined, transformOrigin: 'top left' }}
        aria-label="Prescription Preview"
      >
        <div className="rx-preview-inner">
          {/* ─── HEADER ─────────────────────────────────────────────────────── */}
          {isPadMode ? (
            <div style={{ height: '52mm', display: 'flex', alignItems: 'center', justifyContent: 'center' }} className="pad-header-spacing">
              <div className="no-print" style={{
                textAlign: 'center',
                padding: '12px 24px',
                color: '#94a3b8',
                border: '1px dashed #cbd5e1',
                borderRadius: 8,
                fontSize: '8.5pt',
                background: '#f8fafc',
                width: '100%',
              }}>
                📄 Pre-printed Pad Mode (Doctor Header area reserved for your printed pad stationery)
              </div>
            </div>
          ) : isSanowaraTheme ? (
            /* Specialized Sanowara Ortho & Spine 3-Column Header */
            <div className="rx-sanowara-header">
              <div className="rx-sanowara-hl">
                <div className="nm">{doctorProfile?.name || 'Dr. Md. Mizanur Rahman (Mizan)'}</div>
                <div><span className="b">MBBS</span> (SZMC), <span className="b">BCS</span> (Health)</div>
                <div><span className="red">FCPS</span> (Ortho), <span className="red">MS</span> (Ortho)</div>
                <div><span className="b green">FACS (USA)</span>, <span className="b">CCD</span> (BIRDEM)</div>
                <div>Member of AO Spine <span className="green">(Switzerland)</span></div>
                <div>Special Training in Spine &amp; Trauma</div>
                <div>(AO Spine &amp; AO Trauma Surgery)</div>
                <div className="cons red">Consultant</div>
                <div className="blue" style={{ fontSize: 16 }}>Spine, Ortho &amp; Trauma Surgeon</div>
                <div className="sm">Dhaka Medical College Hospital (Ex)</div>
                <div className="sm">Pongu Hospital (NITOR), Dhaka (Ex)</div>
              </div>

              <div className="rx-sanowara-hc">
                {doctorProfile?.logoUrl ? (
                  <img
                    src={doctorProfile.logoUrl}
                    alt="Logo"
                    style={{ width: 68, height: 'auto', display: 'block', margin: '0 auto' }}
                  />
                ) : (
                  <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <CaduceusEmblem size={72} color="#1b2fa0" />
                  </div>
                )}
                <div className="reg">
                  BMDC Reg. {doctorProfile?.bmdcNumber || 'A-44183'}
                  <br />
                  FCPS Fellow ID : {doctorProfile?.fellowId || '8751'}
                </div>
              </div>

              <div className="rx-sanowara-hr bn-text">
                <div className="nm">{doctorProfile?.nameBn || 'ডাঃ মোঃ মিজানুর রহমান (মিজান)'}</div>
                <div>এমবিবিএস (এসজেডএমসি), বিসিএস (স্বাস্থ্য)</div>
                <div><span className="red">এফসিপিএস</span> (অর্থো-সার্জারি), <span className="red">এমএস</span> (অর্থো)</div>
                <div><span className="green b">এফএপিএম (আমেরিকা)</span>, সিসিডি (বারডেম)</div>
                <div>মেম্বার এও স্পাইন (সুইজারল্যান্ড)</div>
                <div>স্পাইন এবং ট্রমা সার্জারিতে বিশেষ প্রশিক্ষণ</div>
                <div>(এও স্পাইন এবং এও ট্রমা সার্জ্যারি)</div>
                <div className="cons red">কনসালটেন্ট</div>
                <div className="sp blue">স্পাইন, অর্থোপেডিক ও ট্রমা সার্জন</div>
                <div>ঢাকা মেডিকেল কলেজ হাসপাতাল (এক্স)</div>
                <div>পঙ্গু হাসপাতাল (নিটোর), ঢাকা (এক্স)</div>
              </div>
            </div>
          ) : doctorProfile ? (
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
          {isSanowaraTheme ? (
            <div className="rx-sanowara-bar">
              <span className="rx-sanowara-lb">রোগীর নাম :</span>
              <div className="rx-sanowara-fld" style={{ minWidth: 160 }}>
                {prescription.patient.nameBn || prescription.patient.name || 'Sanowara'}
              </div>
              <span className="rx-sanowara-lb">আইডি :</span>
              <div className="rx-sanowara-fld" style={{ minWidth: 90 }}>
                {prescription.patient.patientId || prescription.prescriptionNumber || '20265435'}
              </div>
              <span className="rx-sanowara-lb">বয়স :</span>
              <div className="rx-sanowara-fld" style={{ minWidth: 60 }}>
                {patientAge || '70Y'}
              </div>
              <span className="rx-sanowara-lb">তারিখ :</span>
              <div className="rx-sanowara-fld" style={{ minWidth: 120 }}>
                {formatDateDisplay(prescription.date)}
              </div>
            </div>
          ) : (
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
          )}

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

              {/* Additional Notes in Left Column for treatment plan */}
              {isSanowaraTheme && prescription.additionalNotes && (
                <div style={{ marginTop: 10, fontSize: '8.5pt', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
                  {prescription.additionalNotes}
                </div>
              )}

              {/* Sanowara QR & Jotno Info Box at bottom of left column */}
              {isSanowaraTheme && (
                <div className="rx-sanowara-qr-box">
                  <JotnoQrSvg size={52} />
                  <div>
                    <div className="id">P-4G5B4HGSR</div>
                    <div>JOTNO স্বাস্থ্য এ্যাপ্লিকেশন পেতে</div>
                    <div>QR কোডটি স্ক্যান করুন</div>
                    <div>Powered By JOTNO</div>
                  </div>
                </div>
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
                isSanowaraTheme ? (
                  <div className="rx-sanowara-advice-box">
                    <h4>পরামর্শ</h4>
                    <div style={{ fontSize: '8.8pt', lineHeight: 1.55, whiteSpace: 'pre-wrap' }}>
                      {prescription.advice}
                    </div>
                  </div>
                ) : (
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
                )
              )}

              {/* Follow-up */}
              {(prescription.followUpText || prescription.followUpDate) && (
                <div style={{ marginTop: isSanowaraTheme ? 6 : 10 }}>
                  <div className={isSanowaraTheme ? 'rx-sanowara-follow' : 'rx-followup'}>
                    পরবর্তী সাক্ষাৎ: {prescription.followUpText || (prescription.followUpDate && formatDateDisplay(prescription.followUpDate))}
                  </div>
                </div>
              )}

              {/* Additional Notes (for non-sanowara themes) */}
              {!isSanowaraTheme && prescription.additionalNotes && (
                <div style={{ marginTop: 8, fontSize: '8.5pt', color: '#374151', fontStyle: 'italic' }}>
                  {prescription.additionalNotes}
                </div>
              )}

              {/* Signature & QR Code */}
              <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: 16, gap: 12 }}>
                {!isSanowaraTheme && qrCodeUrl && prescription.showQrCode !== false && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <img src={qrCodeUrl} alt="Rx QR Code" style={{ width: 48, height: 48, borderRadius: 4 }} />
                    <div style={{ fontSize: '6.5pt', color: '#64748b', lineHeight: 1.25 }}>
                      <div style={{ fontWeight: 700, color: '#1e3a8a' }}>{prescription.prescriptionNumber}</div>
                      <div>Scan to verify e-Rx</div>
                      <div style={{ color: '#94a3b8' }}>EasyPad BD</div>
                    </div>
                  </div>
                )}

                <div className="rx-signature-area" style={{ marginLeft: 'auto' }}>
                  {doctorProfile?.signatureUrl ? (
                    <img src={doctorProfile.signatureUrl} alt="Signature" style={{ maxWidth: 120, maxHeight: 60 }} />
                  ) : (
                    <div style={{ borderBottom: '1px solid #374151', width: 100, marginLeft: 'auto', marginBottom: 4 }}></div>
                  )}
                  <div style={{ fontSize: '8pt', color: '#374151', textAlign: 'right' }}>Signature</div>
                </div>
              </div>
            </div>
          </div>

          {/* ─── FOOTER ──────────────────────────────────────────────────── */}
          {isPadMode ? (
            <div style={{ height: '18mm' }} className="pad-footer-spacing" />
          ) : isSanowaraTheme ? (
            <div className="rx-sanowara-footer">
              <div className="rx-sanowara-fl">
                <PopularLogoSvg size={44} />
                <div>
                  <div className="tx bn-text">
                    {doctorProfile?.clinicNameBn || 'পপুলার ডায়াগনস্টিক সেন্টার লিঃ'}
                  </div>
                  <div className="ad bn-text">
                    {doctorProfile?.addressBn || 'ডবল-২ ও হোটেল সং-বি-৪৫৪, পলাশীপুর, রাজবাড়ী।'}
                  </div>
                </div>
              </div>

              <div className="rx-sanowara-room bn-text">
                রুম নং-৩২২
                <br />
                ৩য় তলা
              </div>

              <div className="rx-sanowara-hot">
                <HotlinePhoneSvg size={40} />
                <div className="ht bn-text">
                  <div className="r">হটলাইন</div>
                  <div className="nm">{doctorProfile?.phone || '০১৬৬৩৬৪৪৬১১'}</div>
                  <div className="pill">ডাক্তারের সিরিয়ালের তথ্য ও যোগাযোগ</div>
                </div>
              </div>

              <div className="rx-sanowara-fr bn-text">
                রোগী দেখার সময়-
                <br />
                বিকাল ৩টা - রাত ৯টা
                <br />
                <span className="cl">শুক্রবার বন্ধ।</span>
              </div>
            </div>
          ) : (
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
          )}
        </div>
      </div>
    );
  }
);

PrescriptionPreview.displayName = 'PrescriptionPreview';
