import React, { useRef, useState, useCallback } from 'react';
import { Printer, Download, X, MessageSquare, FileText, Layers } from 'lucide-react';
import type { Prescription, DoctorProfile } from '../../types';
import { PrescriptionPreview } from './PrescriptionPreview';
import { useToast } from '../ui/Toast';
import { openWhatsAppPrescription } from '../../utils/whatsappShare';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface PrintPreviewModalProps {
  prescription: Prescription;
  doctorProfile: DoctorProfile | null;
  onClose: () => void;
}

export function PrintPreviewModal({ prescription, doctorProfile, onClose }: PrintPreviewModalProps) {
  const previewRef = useRef<HTMLDivElement>(null);
  const { showToast } = useToast();
  const [isPadMode, setIsPadMode] = useState<boolean>(prescription.printMode === 'pad_only');
  const [pageMode, setPageMode] = useState<'auto' | '1' | '2'>(prescription.pageCount || 'auto');
  const [splitAfter, setSplitAfter] = useState<number>(
    prescription.splitAfterMedicine || Math.min(6, Math.max(1, Math.ceil((prescription.medicines.length || 1) / 2)))
  );

  const activePrescription: Prescription = {
    ...prescription,
    printMode: isPadMode ? 'pad_only' : 'full',
    pageCount: pageMode,
    splitAfterMedicine: splitAfter,
  };

  const isMultiPage = pageMode === '2' || (pageMode === 'auto' && prescription.medicines.length > 7);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  const handleDownloadPDF = useCallback(async () => {
    if (!previewRef.current) return;
    showToast('Generating high-resolution PDF...', 'info');
    try {
      const sheets = previewRef.current.querySelectorAll<HTMLElement>('.rx-page-sheet');
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pdfWidth = 210;
      const pdfHeight = 297;

      if (sheets.length > 0) {
        for (let i = 0; i < sheets.length; i++) {
          if (i > 0) pdf.addPage();
          const sheet = sheets[i];
          const canvas = await html2canvas(sheet, {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#ffffff',
            width: sheet.scrollWidth,
            height: sheet.scrollHeight,
            windowWidth: sheet.scrollWidth,
            windowHeight: sheet.scrollHeight,
          });
          const imgData = canvas.toDataURL('image/jpeg', 0.95);
          pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
        }
      } else {
        const canvas = await html2canvas(previewRef.current, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff',
          width: previewRef.current.scrollWidth,
          height: previewRef.current.scrollHeight,
        });
        const imgData = canvas.toDataURL('image/jpeg', 0.95);
        pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
      }

      const patientName = prescription.patient.name || 'Patient';
      const date = prescription.date.substring(0, 10);
      const pageInfo = sheets.length > 1 ? `_${sheets.length}pages` : '';
      pdf.save(`Rx_${patientName.replace(/\s+/g, '_')}_${date}${pageInfo}.pdf`);
      showToast(`PDF saved successfully (${sheets.length || 1} Page${(sheets.length || 1) > 1 ? 's' : ''})!`, 'success');
    } catch (err) {
      console.error(err);
      showToast('Failed to generate PDF. Try printing instead.', 'error');
    }
  }, [prescription, showToast]);

  return (
    <div className="modal-overlay" style={{ alignItems: 'flex-start', paddingTop: 16 }}>
      {/* Toolbar */}
      <div className="no-print" style={{
        position: 'fixed', top: 16, left: '50%', transform: 'translateX(-50%)',
        background: 'white', borderRadius: 12, padding: '10px 20px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
        display: 'flex', alignItems: 'center', gap: 10, zIndex: 300,
        flexWrap: 'wrap',
      }}>
        <span style={{ fontWeight: 700, color: '#1e40af', fontSize: 15 }}>Print &amp; PDF</span>
        <div style={{ width: 1, height: 24, background: '#e2e8f0' }}></div>

        {/* Page Mode Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#f8fafc', padding: '4px 8px', borderRadius: 8, border: '1px solid #cbd5e1' }}>
          <Layers size={14} color="#64748b" />
          <span style={{ fontSize: 12, fontWeight: 600, color: '#334155' }}>Pages:</span>
          <select
            className="form-select"
            style={{ fontSize: 12, padding: '2px 8px', height: 28, width: 95 }}
            value={pageMode}
            onChange={(e) => setPageMode(e.target.value as 'auto' | '1' | '2')}
            title="Auto (1 page if <= 7 meds, 2 pages if > 7 meds), or force 1 or 2 pages"
          >
            <option value="auto">Auto ({isMultiPage ? '2 Pgs' : '1 Pg'})</option>
            <option value="1">1 Page</option>
            <option value="2">2 Pages</option>
          </select>

          {isMultiPage && prescription.medicines.length > 1 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginLeft: 4 }}>
              <span style={{ fontSize: 11, color: '#64748b' }}>Split after:</span>
              <select
                className="form-select"
                style={{ fontSize: 12, padding: '2px 6px', height: 28, width: 75 }}
                value={splitAfter}
                onChange={(e) => setSplitAfter(Number(e.target.value))}
                title="Number of medicines on Page 1 before continuing to Page 2"
              >
                {prescription.medicines.slice(0, -1).map((_, idx) => (
                  <option key={idx + 1} value={idx + 1}>Med #{idx + 1}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Pre-printed Pad Mode Toggle */}
        <button
          type="button"
          className="btn-ghost btn-sm"
          style={{
            background: isPadMode ? '#fef3c7' : '#f8fafc',
            color: isPadMode ? '#92400e' : '#475569',
            border: `1px solid ${isPadMode ? '#f59e0b' : '#cbd5e1'}`,
            fontWeight: 600,
          }}
          onClick={() => setIsPadMode(!isPadMode)}
          title="Toggle Pre-printed Pad Stationery Mode"
        >
          <FileText size={14} />
          {isPadMode ? 'Pad Mode (ON)' : 'Pad Mode (OFF)'}
        </button>

        {/* WhatsApp Share */}
        <button
          type="button"
          className="btn-ghost btn-sm"
          style={{
            background: '#f0fdf4',
            color: '#166534',
            border: '1px solid #86efac',
            fontWeight: 600,
          }}
          onClick={() => openWhatsAppPrescription(prescription.patient.phone, activePrescription, doctorProfile)}
          title="Share formatted prescription to patient via WhatsApp"
        >
          <MessageSquare size={14} /> WhatsApp
        </button>

        <button className="btn-primary btn-sm" onClick={handlePrint}>
          <Printer size={15} /> Print ({isMultiPage ? '2 Pages' : '1 Page'})
        </button>

        <button className="btn-secondary btn-sm" onClick={handleDownloadPDF}>
          <Download size={15} /> Download PDF
        </button>

        <button className="btn-ghost btn-sm" onClick={onClose}>
          <X size={16} /> Close
        </button>
      </div>

      {/* Preview area */}
      <div style={{
        marginTop: 80, width: '100%', display: 'flex', justifyContent: 'center',
        paddingBottom: 40,
      }}>
        <div className="print-only" style={{ width: '210mm' }}>
          <PrescriptionPreview
            ref={previewRef}
            prescription={activePrescription}
            doctorProfile={doctorProfile}
          />
        </div>
      </div>
    </div>
  );
}
