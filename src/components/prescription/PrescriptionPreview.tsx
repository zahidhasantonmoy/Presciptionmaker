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

    // Multi-page calculation (defaults to 1 page unless explicitly set to '2' or 'auto' with >11 medicines)
    const totalMedicines = prescription.medicines.length;
    const pageCountSetting = prescription.pageCount ?? '1';
    const shouldSplit = pageCountSetting === '2' || (pageCountSetting === 'auto' && totalMedicines > 11);

    const defaultSplit = Math.min(6, Math.max(1, Math.ceil(totalMedicines / 2)));
    const splitIndex = (prescription.splitAfterMedicine && prescription.splitAfterMedicine > 0 && prescription.splitAfterMedicine < totalMedicines)
      ? prescription.splitAfterMedicine
      : (totalMedicines > 0 ? defaultSplit : 0);

    const page1Meds = shouldSplit ? prescription.medicines.slice(0, splitIndex) : prescription.medicines;
    const page2Meds = shouldSplit ? prescription.medicines.slice(splitIndex) : [];

    // Helper: render single medicine row with continuous numbering
    const renderMedicineRow = (med: PrescriptionMedicine, displayNum: number) => (
      <div key={med.id} className="rx-medicine-row">
        <div className="rx-medicine-name">
          <span style={{ fontWeight: 700 }}>{displayNum}.</span>{' '}
          <span>{getMedicineDisplayName(med)}</span>
          {med.genericName && (
            <span style={{ fontSize: '8pt', color: '#64748b', fontWeight: 400, marginLeft: 6, fontStyle: 'italic' }}>
              ({med.genericName})
            </span>
          )}
        </div>
        <div className="rx-medicine-dose">
          {isSanowaraTheme && med.instruction && med.instruction.includes('\n') ? (
            <div style={{ marginTop: 1 }}>
              {med.instruction.split('\n').map((line, lIdx) => {
                const parts = line.split(/\s{2,}|\t/);
                return (
                  <div key={lIdx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '8.5pt', lineHeight: 1.3, marginTop: 1 }}>
                    <span style={{ fontWeight: 600 }}>{parts[0]}</span>
                    <span style={{ color: '#111', whiteSpace: 'nowrap' }}>{parts[1] || ''}</span>
                  </div>
                );
              })}
            </div>
          ) : isSanowaraTheme ? (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '8.5pt', marginTop: 1 }}>
              <span className="rx-dose-value" style={{ fontWeight: 600 }}>
                {med.morning}+{med.afternoon}+{med.evening}
              </span>
              <span style={{ whiteSpace: 'nowrap', color: '#111' }}>
                {[med.duration, med.instruction || med.timing].filter(Boolean).filter((v, i, a) => a.indexOf(v) === i).join(', ')}
              </span>
            </div>
          ) : (
            <>
              <div className="rx-medicine-dose-grid">
                <span className="rx-dose-value">{med.morning}+{med.afternoon}+{med.evening}</span>
                {med.timing && <span className="rx-timing">{med.timing}</span>}
                {med.duration && <span className="rx-duration">{med.duration}</span>}
              </div>
              {med.instruction && (
                <div className="bn-text" style={{ fontSize: '8.5pt', color: '#374151', marginTop: 1, whiteSpace: 'pre-wrap' }}>
                  {med.instruction}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    );

    // Helper: render advice section
    const renderAdviceSection = () => (
      (prescription.advice || prescription.adviceBn) && (
        isSanowaraTheme ? (
          <div className="rx-sanowara-advice-box">
            <h4>পরামর্শ</h4>
            <div style={{ fontSize: '8.5pt', lineHeight: 1.45, whiteSpace: 'pre-wrap' }}>
              {prescription.advice}
            </div>
          </div>
        ) : (
          <>
            <div className="rx-section-title" style={{ marginTop: 8 }}>পরামর্শ / Advice</div>
            {prescription.advice && (
              <div style={{ fontSize: '8.8pt', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>{prescription.advice}</div>
            )}
            {prescription.adviceBn && (
              <div className="bn-text" style={{ fontSize: '8.8pt', lineHeight: 1.5, marginTop: 2 }}>
                {prescription.adviceBn}
              </div>
            )}
          </>
        )
      )
    );

    // Helper: render follow-up section
    const renderFollowUpSection = () => (
      (prescription.followUpText || prescription.followUpDate) && (
        <div style={{ marginTop: isSanowaraTheme ? 4 : 8 }}>
          <div className={isSanowaraTheme ? 'rx-sanowara-follow' : 'rx-followup'}>
            পরবর্তী সাক্ষাৎ: {prescription.followUpText || (prescription.followUpDate && formatDateDisplay(prescription.followUpDate))}
          </div>
        </div>
      )
    );

    // Helper: render signature and QR code for classic themes
    const renderSignatureSection = () => (
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: 10, gap: 12 }}>
        {!isSanowaraTheme && qrCodeUrl && prescription.showQrCode !== false && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <img src={qrCodeUrl} alt="Rx QR Code" style={{ width: 44, height: 44, borderRadius: 4 }} />
            <div style={{ fontSize: '6.5pt', color: '#64748b', lineHeight: 1.2 }}>
              <div style={{ fontWeight: 700, color: '#1e40af' }}>{prescription.prescriptionNumber}</div>
              <div>Scan to verify e-Rx</div>
              <div style={{ color: '#94a3b8' }}>EasyPad BD</div>
            </div>
          </div>
        )}

        <div className="rx-signature-area" style={{ marginLeft: 'auto' }}>
          {doctorProfile?.signatureUrl ? (
            <img src={doctorProfile.signatureUrl} alt="Signature" style={{ maxWidth: 100, maxHeight: 40 }} />
          ) : (
            <div style={{ borderBottom: '1px solid #374151', width: 90, marginLeft: 'auto', marginBottom: 2 }}></div>
          )}
          <div style={{ fontSize: '7.5pt', color: '#374151', textAlign: 'right' }}>Signature</div>
        </div>
      </div>
    );

    // Helper: render footer
    const renderFooter = () => (
      isPadMode ? (
        <div style={{ height: '18mm' }} className="pad-footer-spacing" />
      ) : isSanowaraTheme ? (
        <div className="rx-sanowara-footer">
          <div className="rx-sanowara-fl">
            <PopularLogoSvg size={40} />
            <div>
              <div className="tx bn-text">
                {doctorProfile?.clinicNameBn || 'পপুলার ডায়াগনস্টিক সেন্টার লিঃ'}
              </div>
              <div className="ad bn-text">
                {doctorProfile?.addressBn || '(বিল্ডিং-২, বাড়ি নং ৪৭৪) এবং হোল্ডিং নং ৬১৭ (বিল্ডিং-১), লক্ষ্মীপুর, রাজশাহী-'}
              </div>
            </div>
          </div>

          <div className="rx-sanowara-room bn-text">
            রুম নং-৩২২
            <br />
            ৩য় তলা
          </div>

          <div className="rx-sanowara-hot">
            <HotlinePhoneSvg size={36} />
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
            <div style={{ color: '#94a3b8', fontSize: '7pt', marginTop: 1 }}>Powered by EasyPad</div>
          </div>
        </div>
      )
    );

    // Helper: render patient bar with proper grouping
    const renderPatientBar = () => (
      isSanowaraTheme ? (
        <div className="rx-sanowara-bar">
          <div className="rx-sanowara-item">
            <span className="rx-sanowara-lb">রোগীর নাম :</span>
            <div className="rx-sanowara-fld rx-fld-name">
              {prescription.patient.nameBn || prescription.patient.name || 'Jesmin'}
            </div>
          </div>
          <div className="rx-sanowara-item">
            <span className="rx-sanowara-lb">আইডি :</span>
            <div className="rx-sanowara-fld rx-fld-id">
              {prescription.patient.patientId || prescription.prescriptionNumber || 'P - 202610339'}
            </div>
          </div>
          <div className="rx-sanowara-item">
            <span className="rx-sanowara-lb">বয়স :</span>
            <div className="rx-sanowara-fld rx-fld-age">
              {patientAge || '40Y22D'}
            </div>
          </div>
          <div className="rx-sanowara-item">
            <span className="rx-sanowara-lb">তারিখ :</span>
            <div className="rx-sanowara-fld rx-fld-date">
              {formatDateDisplay(prescription.date)}
            </div>
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
      )
    );

    // Helper: render Left Column
    const renderLeftColumn = (isMultiPageMode: boolean = false) => (
      <div className="rx-left-col">
        {/* Complaints */}
        {prescription.complaints && (
          <>
            <div className="rx-section-title">{isSanowaraTheme ? 'COMPLAINTS' : 'Complaints'}</div>
            {isSanowaraTheme ? (
              <ul className="rx-bullet-list">
                {prescription.complaints.split('\n').filter(Boolean).map((line, idx) => (
                  <li key={idx}>{line.replace(/^[•\-\*]\s*/, '')}</li>
                ))}
              </ul>
            ) : (
              <div style={{ fontSize: '8.8pt', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
                {prescription.complaints}
              </div>
            )}
            {prescription.complaintsBn && (
              <div className="bn-text" style={{ fontSize: '8.8pt', lineHeight: 1.5, marginTop: 1 }}>
                {prescription.complaintsBn}
              </div>
            )}
          </>
        )}

        {/* History */}
        {prescription.history && (
          <>
            <div className="rx-section-title">{isSanowaraTheme ? 'HISTORY' : 'History'}</div>
            {isSanowaraTheme ? (
              <ul className="rx-bullet-list">
                {prescription.history.split('\n').filter(Boolean).map((line, idx) => (
                  <li key={idx}>{line.replace(/^[•\-\*]\s*/, '')}</li>
                ))}
              </ul>
            ) : (
              <div style={{ fontSize: '8.8pt', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>{prescription.history}</div>
            )}
          </>
        )}

        {/* Investigations - In Sanowara theme, separate Past vs Requested if present */}
        {prescription.investigations.length > 0 && (() => {
          const requested = prescription.investigations.filter(i =>
            i.category === 'requested' || (i.instruction && i.instruction.toLowerCase().includes('requested'))
          );
          const past = requested.length > 0
            ? prescription.investigations.filter(i => i.category !== 'requested' && !(i.instruction && i.instruction.toLowerCase().includes('requested')))
            : prescription.investigations;

          return (
            <>
              {past.length > 0 && (
                <>
                  <div className="rx-section-title">{isSanowaraTheme ? (requested.length > 0 ? 'INVESTIGATION (Past)' : 'INVESTIGATION') : 'Investigation'}</div>
                  <ul className="rx-bullet-list">
                    {past.map(inv => (
                      <li key={inv.id}>
                        {inv.name}
                        {inv.instruction && !inv.instruction.toLowerCase().includes('requested') && (
                          <span style={{ color: '#6b7280', fontSize: '8pt' }}> ({inv.instruction})</span>
                        )}
                      </li>
                    ))}
                  </ul>
                </>
              )}

              {/* Findings / On Examination */}
              {prescription.onExamination && (
                <>
                  <div className="rx-section-title">{isSanowaraTheme ? 'FINDINGS' : 'On Examination'}</div>
                  {isSanowaraTheme ? (
                    <ul className="rx-bullet-list">
                      {prescription.onExamination.split('\n').filter(Boolean).map((line, idx) => (
                        <li key={idx}>{line.replace(/^[•\-\*]\s*/, '')}</li>
                      ))}
                    </ul>
                  ) : (
                    <div style={{ fontSize: '8.8pt', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>{prescription.onExamination}</div>
                  )}
                </>
              )}

              {requested.length > 0 && (
                <>
                  <div className="rx-section-title">{isSanowaraTheme ? 'INVESTIGATION (Requested)' : 'Requested Tests'}</div>
                  <ul className="rx-bullet-list">
                    {requested.map(inv => (
                      <li key={inv.id}>{inv.name}</li>
                    ))}
                  </ul>
                </>
              )}
            </>
          );
        })()}

        {/* If no investigations but onExamination exists */}
        {prescription.investigations.length === 0 && prescription.onExamination && (
          <>
            <div className="rx-section-title">{isSanowaraTheme ? 'FINDINGS' : 'On Examination'}</div>
            <div style={{ fontSize: '8.8pt', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>{prescription.onExamination}</div>
          </>
        )}

        {/* Diagnosis */}
        {prescription.diagnoses.length > 0 && (
          <>
            <div className="rx-section-title">{isSanowaraTheme ? 'DIAGNOSIS' : 'Diagnosis'}</div>
            <ul className="rx-bullet-list">
              {prescription.diagnoses.map(d => (
                <li key={d.id}>
                  {d.text}
                  {d.note && <span style={{ color: '#6b7280', fontSize: '8pt' }}> – {d.note}</span>}
                </li>
              ))}
            </ul>
          </>
        )}

        {/* If Single Page: Additional Notes & QR box in left column */}
        {!isMultiPageMode && isSanowaraTheme && prescription.additionalNotes && (
          <div style={{ marginTop: 6, fontSize: '8pt', lineHeight: 1.4, whiteSpace: 'pre-wrap' }}>
            {prescription.additionalNotes}
          </div>
        )}

        {!isMultiPageMode && isSanowaraTheme && (
          <div className="rx-sanowara-qr-box" style={{ marginTop: 'auto' }}>
            <JotnoQrSvg size={46} />
            <div>
              <div className="id">P-4G5B4HGSR</div>
              <div>JOTNO স্বাস্থ্য এ্যাপ্লিকেশন পেতে</div>
              <div>QR কোডটি স্ক্যান করুন</div>
              <div>Powered By JOTNO</div>
            </div>
          </div>
        )}
      </div>
    );

    return (
      <div
        ref={ref}
        className={`rx-preview theme-${theme} ${isPadMode ? 'pad-mode' : ''}`}
        style={{ transform: scale !== 1 ? `scale(${scale})` : undefined, transformOrigin: 'top left' }}
        aria-label="Prescription Preview"
      >
        {/* ══════════════════════════════════════════════════════════════════════════
            PAGE 1 (Sheet 1)
        ══════════════════════════════════════════════════════════════════════════ */}
        <div className="rx-page-sheet rx-page-1">
          <div className="rx-preview-inner">
            {/* Header */}
            {isPadMode ? (
              <div style={{ height: '52mm', display: 'flex', alignItems: 'center', justifyContent: 'center' }} className="pad-header-spacing">
                <div className="no-print" style={{
                  textAlign: 'center', padding: '12px 24px', color: '#94a3b8',
                  border: '1px dashed #cbd5e1', borderRadius: 8, fontSize: '8.5pt',
                  background: '#f8fafc', width: '100%',
                }}>
                  📄 Pre-printed Pad Mode (Doctor Header area reserved for your printed pad stationery)
                </div>
              </div>
            ) : isSanowaraTheme ? (
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
                  <div className="blue" style={{ fontSize: 15 }}>Spine, Ortho &amp; Trauma Surgeon</div>
                  <div className="sm">Dhaka Medical College Hospital (Ex)</div>
                  <div className="sm">Pongu Hospital (NITOR), Dhaka (Ex)</div>
                </div>

                <div className="rx-sanowara-hc">
                  {doctorProfile?.logoUrl ? (
                    <img src={doctorProfile.logoUrl} alt="Logo" style={{ width: 64, height: 'auto', display: 'block', margin: '0 auto' }} />
                  ) : (
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                      <CaduceusEmblem size={68} color="#1b2fa0" />
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
                <div className="rx-header-left">
                  <div className="rx-doctor-name">{doctorProfile.name}</div>
                  <div className="rx-degrees">{doctorProfile.degrees}</div>
                  {doctorProfile.specialty && <div className="rx-specialty">{doctorProfile.specialty}</div>}
                  {doctorProfile.clinicName && <div className="rx-clinic">{doctorProfile.clinicName}</div>}
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

                <div className="rx-header-center">
                  {doctorProfile.logoUrl ? (
                    <img src={doctorProfile.logoUrl} alt="Logo" style={{ maxWidth: 56, maxHeight: 56, objectFit: 'contain' }} />
                  ) : (
                    <div style={{
                      width: 56, height: 56, borderRadius: '50%',
                      background: 'linear-gradient(135deg, #1e40af, #3b82f6)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'white', fontWeight: 700, fontSize: '13pt'
                    }}>
                      {doctorProfile.name?.charAt(0) ?? 'D'}
                    </div>
                  )}
                </div>

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

            {/* Patient Bar */}
            {renderPatientBar()}

            {/* Prescription Number (Only for non-sanowara themes since sanowara already has it in patient bar) */}
            {!isSanowaraTheme && prescription.prescriptionNumber && (
              <div style={{ fontSize: '8pt', color: '#6b7280', marginBottom: '4px', textAlign: 'right' }}>
                Rx# {prescription.prescriptionNumber}
              </div>
            )}

            {/* Body */}
            <div className="rx-body" style={{ flex: 1, minHeight: 0 }}>
              {/* Left Column */}
              {renderLeftColumn(shouldSplit)}

              {/* Right Column */}
              <div className="rx-right-col" style={{ display: 'flex', flexDirection: 'column' }}>
                <div className="rx-symbol">℞</div>

                {/* Medicines for Page 1 */}
                {page1Meds.length === 0 && (
                  <div style={{ color: '#9ca3af', fontSize: '9pt', fontStyle: 'italic' }}>No medicines added</div>
                )}
                {page1Meds.map((med, idx) => renderMedicineRow(med, idx + 1))}

                {/* If Single Page: Advice, Followup, Signature */}
                {!shouldSplit && (
                  <>
                    {renderAdviceSection()}
                    {isSanowaraTheme ? (
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 4, marginBottom: 2 }}>
                        {(prescription.followUpText || prescription.followUpDate) ? (
                          <div className="rx-sanowara-follow" style={{ margin: 0 }}>
                            পরবর্তী সাক্ষাৎ: {prescription.followUpText || (prescription.followUpDate && formatDateDisplay(prescription.followUpDate))}
                          </div>
                        ) : <div />}
                        <div className="rx-signature-area" style={{ marginLeft: 'auto', textAlign: 'right' }}>
                          {doctorProfile?.signatureUrl ? (
                            <img src={doctorProfile.signatureUrl} alt="Signature" style={{ maxWidth: 85, maxHeight: 26 }} />
                          ) : (
                            <div style={{ borderBottom: '1px solid #333', width: 80, marginBottom: 2 }} />
                          )}
                          <div style={{ fontSize: '7.5pt', color: '#333' }}>Signature</div>
                        </div>
                      </div>
                    ) : (
                      <>
                        {renderFollowUpSection()}
                        {prescription.additionalNotes && (
                          <div style={{ marginTop: 6, fontSize: '8pt', color: '#374151', fontStyle: 'italic' }}>
                            {prescription.additionalNotes}
                          </div>
                        )}
                        <div style={{ marginTop: 'auto' }}>
                          {renderSignatureSection()}
                        </div>
                      </>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* If Multi-Page: Page 1 Continuation notice banner */}
            {shouldSplit && (
              <div className={isSanowaraTheme ? 'rx-page-continuation-sanowara' : 'rx-page-continuation'}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span>👉</span>
                  <span>ঔষধ ও পরামর্শ পরবর্তী পাতায় চলমান (Continued on Page 2)</span>
                </div>
                <span className={isSanowaraTheme ? 'rx-page2-badge-sanowara' : 'rx-page2-badge'}>
                  পাতা ১ / ২
                </span>
              </div>
            )}

            {/* Footer */}
            {renderFooter()}
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════════════════
            PAGE 2 (Sheet 2) - Only rendered when shouldSplit is true
        ══════════════════════════════════════════════════════════════════════════ */}
        {shouldSplit && (
          <div className="rx-page-sheet rx-page-2">
            <div className="rx-preview-inner">
              {/* Page 2 Header */}
              {isPadMode ? (
                <div style={{ height: '52mm', display: 'flex', alignItems: 'center', justifyContent: 'center' }} className="pad-header-spacing">
                  <div className="no-print" style={{
                    textAlign: 'center', padding: '8px 20px', color: '#94a3b8',
                    border: '1px dashed #cbd5e1', borderRadius: 8, fontSize: '8.5pt',
                    background: '#f8fafc', width: '100%',
                  }}>
                    📄 Pre-printed Pad Mode (Page 2 Header area reserved for your printed pad stationery)
                  </div>
                </div>
              ) : isSanowaraTheme ? (
                <div className="rx-page2-header-sanowara">
                  <div>
                    <div style={{ fontSize: '13pt', fontWeight: 700, color: '#111' }}>
                      {doctorProfile?.name || 'Dr. Md. Mizanur Rahman (Mizan)'}
                    </div>
                    <div style={{ fontSize: '8.5pt', color: '#475569' }}>
                      <span style={{ color: '#1b2fa0', fontWeight: 600 }}>Spine, Ortho &amp; Trauma Surgeon</span>
                      {' • '}BMDC Reg. {doctorProfile?.bmdcNumber || 'A-44183'}
                    </div>
                  </div>
                  <div className="rx-page2-badge-sanowara">
                    📄 পাতা ২ / ২ (Page 2 of 2)
                  </div>
                  <div style={{ textAlign: 'right', fontSize: '9pt' }}>
                    <div><strong>রোগী:</strong> {prescription.patient.nameBn || prescription.patient.name || 'Sanowara'}</div>
                    <div style={{ color: '#64748b', fontSize: '8pt' }}>
                      ID: {prescription.patient.patientId || prescription.prescriptionNumber || '–'} • {formatDateDisplay(prescription.date)}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rx-page2-header">
                  <div>
                    <div style={{ fontSize: '12pt', fontWeight: 700, color: '#1e3a8a' }}>
                      {doctorProfile?.name || 'Doctor'}
                    </div>
                    <div style={{ fontSize: '8.5pt', color: '#475569' }}>
                      {doctorProfile?.specialty || doctorProfile?.degrees || ''}
                      {doctorProfile?.bmdcNumber && ` • BMDC: ${doctorProfile.bmdcNumber}`}
                    </div>
                  </div>
                  <div className="rx-page2-badge">
                    📄 পাতা ২ / ২ (Page 2 of 2)
                  </div>
                  <div style={{ textAlign: 'right', fontSize: '8.5pt' }}>
                    <div><strong>Patient:</strong> {prescription.patient.nameBn || prescription.patient.name || '–'}</div>
                    <div style={{ color: '#64748b', fontSize: '8pt' }}>
                      {prescription.prescriptionNumber && `Rx# ${prescription.prescriptionNumber} • `}
                      {formatDateDisplay(prescription.date)}
                    </div>
                  </div>
                </div>
              )}

              {/* Page 2 Body */}
              <div className="rx-body" style={{ flex: 1, minHeight: 0 }}>
                {/* Left column on Page 2 */}
                <div className="rx-left-col" style={{ display: 'flex', flexDirection: 'column' }}>
                  {prescription.additionalNotes ? (
                    <>
                      <div className="rx-section-title">
                        {isSanowaraTheme ? 'TREATMENT PLAN' : 'Treatment Plan / Notes'}
                      </div>
                      <div style={{ fontSize: '8.5pt', lineHeight: 1.5, whiteSpace: 'pre-wrap', color: '#334155' }}>
                        {prescription.additionalNotes}
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="rx-section-title">
                        {isSanowaraTheme ? 'INSTRUCTIONS' : 'General Instructions'}
                      </div>
                      <div style={{ fontSize: '8.5pt', lineHeight: 1.5, color: '#475569' }}>
                        <p style={{ margin: '0 0 5px 0' }}>• সকল ঔষধ চিকিৎসকের নির্দেশিত মাত্রা ও সময় অনুযায়ী গ্রহণ করুন।</p>
                        <p style={{ margin: '0 0 5px 0' }}>• কোন ঔষধের অস্বাভাবিক প্রতিক্রিয়া দেখা দিলে অবিলম্বে চিকিৎসকের সাথে যোগাযোগ করুন।</p>
                        <p style={{ margin: '0 0 5px 0' }}>• পরবর্তী সাক্ষাতের সময় পূর্বের সকল কাগজপত্র সাথে আনবেন।</p>
                      </div>
                    </>
                  )}

                  {/* Sanowara QR Box */}
                  {isSanowaraTheme && (
                    <div className="rx-sanowara-qr-box" style={{ marginTop: 'auto' }}>
                      <JotnoQrSvg size={46} />
                      <div>
                        <div className="id">P-4G5B4HGSR</div>
                        <div>JOTNO স্বাস্থ্য এ্যাপ্লিকেশন পেতে</div>
                        <div>QR কোডটি স্ক্যান করুন</div>
                        <div>Powered By JOTNO</div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Right column on Page 2: Remaining Medicines, Advice, Follow-up, Signature */}
                <div className="rx-right-col" style={{ display: 'flex', flexDirection: 'column' }}>
                  <div className="rx-symbol" style={{ fontSize: '18pt', marginBottom: 2, display: 'flex', alignItems: 'baseline', gap: 8 }}>
                    ℞
                    <span style={{ fontSize: '8.5pt', fontStyle: 'normal', fontWeight: 600, color: '#64748b' }}>
                      (চলমান / Continued)
                    </span>
                  </div>

                  {/* Remaining medicines starting from splitIndex */}
                  {page2Meds.map((med, idx) => renderMedicineRow(med, splitIndex + idx + 1))}

                  {/* Advice Box */}
                  {renderAdviceSection()}

                  {/* Follow-up & Signature */}
                  {isSanowaraTheme ? (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 4, marginBottom: 2 }}>
                      {(prescription.followUpText || prescription.followUpDate) ? (
                        <div className="rx-sanowara-follow" style={{ margin: 0 }}>
                          পরবর্তী সাক্ষাৎ: {prescription.followUpText || (prescription.followUpDate && formatDateDisplay(prescription.followUpDate))}
                        </div>
                      ) : <div />}
                      <div className="rx-signature-area" style={{ marginLeft: 'auto', textAlign: 'right' }}>
                        {doctorProfile?.signatureUrl ? (
                          <img src={doctorProfile.signatureUrl} alt="Signature" style={{ maxWidth: 85, maxHeight: 26 }} />
                        ) : (
                          <div style={{ borderBottom: '1px solid #333', width: 80, marginBottom: 2 }} />
                        )}
                        <div style={{ fontSize: '7.5pt', color: '#333' }}>Signature</div>
                      </div>
                    </div>
                  ) : (
                    <>
                      {renderFollowUpSection()}
                      <div style={{ marginTop: 'auto' }}>
                        {renderSignatureSection()}
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Page 2 Footer */}
              {renderFooter()}
            </div>
          </div>
        )}
      </div>
    );
  }
);

PrescriptionPreview.displayName = 'PrescriptionPreview';
