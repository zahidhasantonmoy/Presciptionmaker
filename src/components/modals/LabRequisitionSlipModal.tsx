import React, { useRef, useCallback } from 'react';
import { Printer, Download, X, FlaskConical } from 'lucide-react';
import type { Prescription, DoctorProfile } from '../../types';
import { PopularLogoSvg, HotlinePhoneSvg } from '../../assets/sanowaraAssets';
import { formatDateDisplay } from '../../utils/dateUtils';
import { useToast } from '../ui/Toast';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface LabRequisitionSlipModalProps {
  prescription: Prescription;
  doctorProfile: DoctorProfile | null;
  onClose: () => void;
}

export function LabRequisitionSlipModal({
  prescription,
  doctorProfile,
  onClose
}: LabRequisitionSlipModalProps) {
  const slipRef = useRef<HTMLDivElement>(null);
  const { showToast } = useToast();

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  const handleDownloadPDF = useCallback(async () => {
    if (!slipRef.current) return;
    showToast('Generating Lab Requisition Slip PDF...', 'info');
    try {
      const canvas = await html2canvas(slipRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
      });
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const imgData = canvas.toDataURL('image/jpeg', 0.98);
      pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297);
      pdf.save(`Lab_Order_${(prescription.patient.name || 'Patient').replace(/\s+/g, '_')}.pdf`);
      showToast('Lab Order Slip downloaded!', 'success');
    } catch (err) {
      console.error(err);
      showToast('Failed to download PDF', 'error');
    }
  }, [prescription.patient.name, showToast]);

  const requestedTests = prescription.investigations.length > 0
    ? prescription.investigations
    : [
        { id: '1', name: 'CBC with ESR', category: 'lab', instruction: 'Routine' },
        { id: '2', name: 'RBS (Random Blood Sugar)', category: 'lab', instruction: 'Fasting preferred' },
        { id: '3', name: 'MRI: LUMBOSACRAL SPINE', category: 'imaging', instruction: 'Screening whole spine' },
        { id: '4', name: 'X-Ray Cervical Spine B/V', category: 'imaging', instruction: 'Requested' },
      ];

  return (
    <div
      className="modal-overlay print-modal-scroll-wrap"
      style={{
        position: 'fixed',
        inset: 0,
        overflowY: 'auto',
        overflowX: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '0 16px 60px 16px',
        zIndex: 9999,
        background: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(6px)',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Sticky Toolbar */}
      <div
        className="no-print"
        style={{
          position: 'sticky',
          top: 14,
          background: '#ffffff',
          borderRadius: 14,
          padding: '8px 18px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          zIndex: 10000,
          marginTop: 14,
          marginBottom: 16,
          border: '1px solid #cbd5e1',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 800, color: '#047857', fontSize: 14 }}>
          <FlaskConical size={18} /> ডায়াগনস্টিক ল্যাব টেস্ট রিকুইজিশন স্লিপ
        </div>
        <div style={{ width: 1, height: 22, background: '#e2e8f0' }} />

        <button className="btn-primary btn-sm" onClick={handlePrint}>
          <Printer size={14} /> প্রিন্ট স্লিপ
        </button>

        <button className="btn-secondary btn-sm" onClick={handleDownloadPDF}>
          <Download size={14} /> ডাউনলোড PDF
        </button>

        <button className="btn-ghost btn-sm" onClick={onClose}>
          <X size={16} />
        </button>
      </div>

      {/* Lab Slip Sheet (A4 format) */}
      <div
        ref={slipRef}
        style={{
          width: '210mm',
          minHeight: '297mm',
          background: '#ffffff',
          padding: '24px 28px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
          borderRadius: 4,
          boxSizing: 'border-box',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          color: '#0f172a',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Lab Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #047857', paddingBottom: 12, marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <PopularLogoSvg size={52} />
            <div>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#047857', letterSpacing: -0.3 }}>
                পপুলার ডায়াগনস্টিক সেন্টার লিঃ
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#334155' }}>
                POPULAR DIAGNOSTIC CENTRE LTD. • RAJSHAHI BRANCH
              </div>
              <div style={{ fontSize: 11, color: '#64748b' }}>
                (বিল্ডিং-২, বাড়ি নং ৪৭৪) এবং হোল্ডিং নং ৬১৭ (বিল্ডিং-১), লক্ষ্মীপুর, রাজশাহী
              </div>
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{
              background: '#047857',
              color: '#ffffff',
              padding: '4px 12px',
              borderRadius: 6,
              fontSize: 12,
              fontWeight: 800,
              display: 'inline-block',
              marginBottom: 4,
              letterSpacing: 0.5
            }}>
              INVESTIGATION REQUISITION SLIP
            </div>
            <div style={{ fontSize: 12, color: '#475569' }}>
              তারিখ: <strong>{formatDateDisplay(prescription.date)}</strong>
            </div>
            <div style={{ fontSize: 12, color: '#475569' }}>
              Rx Ref: <strong>{prescription.prescriptionNumber || prescription.id}</strong>
            </div>
          </div>
        </div>

        {/* Referring Doctor Info */}
        <div style={{
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: 8,
          padding: '10px 14px',
          marginBottom: 14,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <div style={{ fontSize: 11, textTransform: 'uppercase', color: '#64748b', fontWeight: 700 }}>
              রেফারিং চিকিৎসক (Referred By)
            </div>
            <div style={{ fontSize: 15, fontWeight: 800, color: '#0f172a' }}>
              {doctorProfile?.name || 'Dr. Md. Mizanur Rahman (Mizan)'}
            </div>
            <div style={{ fontSize: 12, color: '#475569' }}>
              {doctorProfile?.degrees || 'MBBS (SZMC), BCS (Health), FCPS (Ortho), MS (Ortho)'} • BMDC Reg: {doctorProfile?.bmdcNumber || 'A-44183'}
            </div>
          </div>
          <div style={{
            background: '#6b1a4f',
            color: '#ffffff',
            padding: '6px 12px',
            borderRadius: 6,
            textAlign: 'center',
            fontSize: 12,
            fontWeight: 700
          }}>
            রুম নং-৩২২ (৩য় তলা)
          </div>
        </div>

        {/* Patient Info Bar */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 10,
          background: '#f1f5f9',
          border: '1px solid #cbd5e1',
          borderRadius: 8,
          padding: '10px 14px',
          marginBottom: 16,
          fontSize: 13
        }}>
          <div>
            <span style={{ color: '#64748b', fontSize: 11 }}>রোগীর নাম:</span>
            <div style={{ fontWeight: 800 }}>{prescription.patient.nameBn || prescription.patient.name}</div>
          </div>
          <div>
            <span style={{ color: '#64748b', fontSize: 11 }}>পেশেন্ট আইডি:</span>
            <div style={{ fontWeight: 800, fontFamily: 'monospace' }}>{prescription.patient.patientId || prescription.prescriptionNumber}</div>
          </div>
          <div>
            <span style={{ color: '#64748b', fontSize: 11 }}>বয়স / লিঙ্গ:</span>
            <div style={{ fontWeight: 700 }}>{prescription.patient.age || '–'} / {prescription.patient.gender || '–'}</div>
          </div>
          <div>
            <span style={{ color: '#64748b', fontSize: 11 }}>মোবাইল:</span>
            <div style={{ fontWeight: 700 }}>{prescription.patient.phone || '–'}</div>
          </div>
        </div>

        {/* Clinical Diagnosis / Indication */}
        {prescription.diagnoses.length > 0 && (
          <div style={{ marginBottom: 14, fontSize: 13 }}>
            <strong>ক্লিনিক্যাল ডায়াগনোসিস (Provisional Diagnosis):</strong>{' '}
            <span style={{ color: '#0f172a' }}>{prescription.diagnoses.map(d => d.text).join(' • ')}</span>
          </div>
        )}

        {/* Test List Table */}
        <div style={{ flex: 1 }}>
          <div style={{
            background: '#047857',
            color: '#ffffff',
            padding: '8px 12px',
            borderRadius: '6px 6px 0 0',
            fontWeight: 800,
            fontSize: 13,
            display: 'flex',
            justifyContent: 'space-between'
          }}>
            <span>প্রয়োজনীয় ইনভেস্টিগেশন / টেস্টের বিবরণ (Tests Required)</span>
            <span>মোট: {requestedTests.length} টি</span>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #cbd5e1' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #cbd5e1', fontSize: 12, textAlign: 'left' }}>
                <th style={{ padding: '8px 12px', width: 45 }}>#</th>
                <th style={{ padding: '8px 12px' }}>টেস্টের নাম (Investigation Name)</th>
                <th style={{ padding: '8px 12px', width: 140 }}>বিভাগ (Department)</th>
                <th style={{ padding: '8px 12px', width: 180 }}>বিশেষ নির্দেশনা (Instructions)</th>
              </tr>
            </thead>
            <tbody>
              {requestedTests.map((test, index) => (
                <tr key={test.id || index} style={{ borderBottom: '1px solid #e2e8f0', fontSize: 13.5 }}>
                  <td style={{ padding: '10px 12px', fontWeight: 700, color: '#047857' }}>{index + 1}.</td>
                  <td style={{ padding: '10px 12px', fontWeight: 700, color: '#0f172a' }}>{test.name}</td>
                  <td style={{ padding: '10px 12px', color: '#475569', fontSize: 12, textTransform: 'capitalize' }}>
                    {test.category === 'imaging' ? 'Radiology & Imaging' : 'Clinical Pathology / Lab'}
                  </td>
                  <td style={{ padding: '10px 12px', color: '#64748b', fontSize: 12 }}>
                    {test.instruction || 'As per doctor order'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Patient Instructions */}
          <div style={{ marginTop: 20, background: '#fefce8', border: '1px solid #fef08a', borderRadius: 8, padding: '10px 14px', fontSize: 12, color: '#854d0e' }}>
            <strong>রোগীর জ্ঞাতার্থে জরুরি নির্দেশনা:</strong>
            <ul style={{ margin: '4px 0 0 0', paddingLeft: 18 }}>
              <li>রক্তের সুগার বা লিপিড প্রোফাইল টেস্টের জন্য ৮-১০ ঘণ্টা খালি পেটে আসতে হবে।</li>
              <li>এমআরআই বা এক্স-রে করানোর পূর্বে ধাতব বস্তু (চেইন, আংটি, বেল্ট) খুলে রাখতে হবে।</li>
              <li>টেস্টের রিপোর্ট পাওয়ার পর রিপোর্টসহ চিকিৎসকের চেম্বারে পরামর্শ নিন।</li>
            </ul>
          </div>
        </div>

        {/* Footer & Signature */}
        <div style={{ marginTop: 'auto', paddingTop: 20, borderTop: '1px solid #cbd5e1' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div>
              <div style={{ fontSize: 11, color: '#64748b' }}>
                Hotline for Appointments &amp; Serial: <strong>01663644611</strong>
              </div>
              <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 2 }}>
                Generated via EasyPad Medical Systems • Valid for Popular Diagnostic Centre
              </div>
            </div>

            <div style={{ textAlign: 'center' }}>
              <div style={{ borderBottom: '1px solid #334155', width: 140, marginBottom: 4 }} />
              <div style={{ fontSize: 11, fontWeight: 700, color: '#334155' }}>রেফারিং ডাক্তারের স্বাক্ষর</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
