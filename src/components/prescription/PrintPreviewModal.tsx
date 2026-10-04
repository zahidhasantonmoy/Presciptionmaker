import React, { useRef, useCallback } from 'react';
import { Printer, Download, X } from 'lucide-react';
import type { Prescription, DoctorProfile } from '../../types';
import { PrescriptionPreview } from './PrescriptionPreview';
import { useToast } from '../ui/Toast';
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

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  const handleDownloadPDF = useCallback(async () => {
    if (!previewRef.current) return;
    showToast('Generating PDF...', 'info');
    try {
      // Use html2canvas to capture the full A4 element
      const canvas = await html2canvas(previewRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: previewRef.current.scrollWidth,
        height: previewRef.current.scrollHeight,
        windowWidth: previewRef.current.scrollWidth,
        windowHeight: previewRef.current.scrollHeight,
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

      const pdfWidth = 210;
      const pdfHeight = 297;
      const canvasAspect = canvas.height / canvas.width;
      const imgHeight = pdfWidth * canvasAspect;

      if (imgHeight <= pdfHeight) {
        pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, imgHeight);
      } else {
        // Multi-page for long prescriptions
        let yOffset = 0;
        const pageHeightPx = (canvas.width * pdfHeight) / pdfWidth;
        while (yOffset < canvas.height) {
          if (yOffset > 0) pdf.addPage();
          const sliceCanvas = document.createElement('canvas');
          sliceCanvas.width = canvas.width;
          sliceCanvas.height = Math.min(pageHeightPx, canvas.height - yOffset);
          const ctx = sliceCanvas.getContext('2d')!;
          ctx.drawImage(canvas, 0, -yOffset);
          pdf.addImage(sliceCanvas.toDataURL('image/jpeg', 0.95), 'JPEG', 0, 0, pdfWidth, pdfHeight);
          yOffset += pageHeightPx;
        }
      }

      const patientName = prescription.patient.name || 'Patient';
      const date = prescription.date.substring(0, 10);
      pdf.save(`Rx_${patientName.replace(/\s+/g, '_')}_${date}.pdf`);
      showToast('PDF downloaded successfully!', 'success');
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
        display: 'flex', alignItems: 'center', gap: 12, zIndex: 300,
      }}>
        <span style={{ fontWeight: 700, color: '#1e40af', fontSize: 15 }}>Print Preview</span>
        <div style={{ width: 1, height: 24, background: '#e2e8f0' }}></div>
        <button className="btn-primary" onClick={handlePrint}>
          <Printer size={16} /> Print
        </button>
        <button className="btn-secondary" onClick={handleDownloadPDF}>
          <Download size={16} /> Download PDF
        </button>
        <button className="btn-ghost" onClick={onClose}>
          <X size={16} /> Close
        </button>
      </div>

      {/* Preview area */}
      <div style={{
        marginTop: 80, width: '100%', display: 'flex', justifyContent: 'center',
        paddingBottom: 40,
      }}>
        <div className="print-only" style={{ width: '210mm' }}>
          <PrescriptionPreview ref={previewRef} prescription={prescription} doctorProfile={doctorProfile} />
        </div>
      </div>
    </div>
  );
}
