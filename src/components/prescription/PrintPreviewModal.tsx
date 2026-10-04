import React, { useRef, useState, useCallback } from 'react';
import {
  Printer, Download, X, MessageSquare, FileText, Layers,
  ZoomIn, ZoomOut, Maximize2, Image as ImageIcon
} from 'lucide-react';
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
  // Default to '1' page unless explicitly set to '2' or auto with >11 medicines
  const [pageMode, setPageMode] = useState<'1' | '2' | 'auto'>(prescription.pageCount || '1');
  const [splitAfter, setSplitAfter] = useState<number>(
    prescription.splitAfterMedicine || Math.min(6, Math.max(1, Math.ceil((prescription.medicines.length || 1) / 2)))
  );
  const [zoomScale, setZoomScale] = useState<number>(0.9);

  const activePrescription: Prescription = {
    ...prescription,
    printMode: isPadMode ? 'pad_only' : 'full',
    pageCount: pageMode,
    splitAfterMedicine: splitAfter,
  };

  const isMultiPage = pageMode === '2' || (pageMode === 'auto' && prescription.medicines.length > 11);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  const handleDownloadPDF = useCallback(async () => {
    if (!previewRef.current) return;
    showToast('Generating high-resolution 1-Page A4 PDF (300 DPI)...', 'info');
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
            scale: 3,
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#ffffff',
            width: sheet.scrollWidth,
            height: sheet.scrollHeight,
            windowWidth: sheet.scrollWidth,
            windowHeight: sheet.scrollHeight,
          });
          const imgData = canvas.toDataURL('image/jpeg', 0.98);
          pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
        }
      } else {
        const canvas = await html2canvas(previewRef.current, {
          scale: 3,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff',
          width: previewRef.current.scrollWidth,
          height: previewRef.current.scrollHeight,
        });
        const imgData = canvas.toDataURL('image/jpeg', 0.98);
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

  const handleDownloadJPG = useCallback(async () => {
    if (!previewRef.current) return;
    showToast('Generating high-resolution JPG image (300 DPI)...', 'info');
    try {
      const sheets = previewRef.current.querySelectorAll<HTMLElement>('.rx-page-sheet');
      const patientName = (prescription.patient.name || 'Patient').replace(/\s+/g, '_');
      const date = prescription.date.substring(0, 10);

      const downloadCanvasAsJpg = (canvas: HTMLCanvasElement, filename: string) => {
        const link = document.createElement('a');
        link.download = filename;
        link.href = canvas.toDataURL('image/jpeg', 0.98);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      };

      if (sheets.length > 0) {
        for (let i = 0; i < sheets.length; i++) {
          const sheet = sheets[i];
          const canvas = await html2canvas(sheet, {
            scale: 3,
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#ffffff',
            width: sheet.scrollWidth,
            height: sheet.scrollHeight,
            windowWidth: sheet.scrollWidth,
            windowHeight: sheet.scrollHeight,
          });
          const pageSuffix = sheets.length > 1 ? `_page${i + 1}` : '';
          downloadCanvasAsJpg(canvas, `Rx_${patientName}_${date}${pageSuffix}.jpg`);
          if (i < sheets.length - 1) {
            await new Promise((resolve) => setTimeout(resolve, 300));
          }
        }
      } else {
        const canvas = await html2canvas(previewRef.current, {
          scale: 3,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff',
          width: previewRef.current.scrollWidth,
          height: previewRef.current.scrollHeight,
        });
        downloadCanvasAsJpg(canvas, `Rx_${patientName}_${date}.jpg`);
      }

      showToast('High-quality JPG image downloaded successfully!', 'success');
    } catch (err) {
      console.error(err);
      showToast('Failed to generate JPG image.', 'error');
    }
  }, [prescription, showToast]);

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
        padding: '0 16px 80px 16px',
        zIndex: 9999,
        background: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(6px)',
        cursor: 'default',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Pinned Sticky Toolbar */}
      <div
        className="no-print"
        style={{
          position: 'sticky',
          top: 14,
          background: '#ffffff',
          borderRadius: 14,
          padding: '8px 16px',
          boxShadow: '0 12px 36px rgba(0,0,0,0.3)',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          zIndex: 10000,
          flexWrap: 'wrap',
          marginTop: 14,
          marginBottom: 18,
          border: '1px solid #cbd5e1',
          maxWidth: '96vw',
        }}
      >
        <span style={{ fontWeight: 800, color: '#1e40af', fontSize: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
          📄 Print &amp; PDF
        </span>
        <div style={{ width: 1, height: 22, background: '#e2e8f0' }} />

        {/* Page Mode Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, background: '#f8fafc', padding: '3px 8px', borderRadius: 8, border: '1px solid #cbd5e1' }}>
          <Layers size={13} color="#64748b" />
          <span style={{ fontSize: 11, fontWeight: 700, color: '#334155' }}>Pages:</span>
          <select
            className="form-select"
            style={{ fontSize: 11, padding: '2px 6px', height: 26, width: 85 }}
            value={pageMode}
            onChange={(e) => setPageMode(e.target.value as '1' | '2' | 'auto')}
            title="Page Count: 1 Page (default), 2 Pages, or Auto"
          >
            <option value="1">1 Page</option>
            <option value="2">2 Pages</option>
            <option value="auto">Auto ({isMultiPage ? '2 Pgs' : '1 Pg'})</option>
          </select>

          {isMultiPage && prescription.medicines.length > 1 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginLeft: 4 }}>
              <span style={{ fontSize: 10, color: '#64748b' }}>Split after:</span>
              <select
                className="form-select"
                style={{ fontSize: 11, padding: '2px 4px', height: 26, width: 72 }}
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
            fontSize: 12,
            padding: '4px 10px',
          }}
          onClick={() => setIsPadMode(!isPadMode)}
          title="Toggle Pre-printed Pad Stationery Mode"
        >
          <FileText size={13} />
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
            fontWeight: 700,
            fontSize: 12,
            padding: '4px 10px',
          }}
          onClick={() => openWhatsAppPrescription(prescription.patient.phone, activePrescription, doctorProfile)}
          title="Share formatted prescription to patient via WhatsApp"
        >
          <MessageSquare size={13} color="#16a34a" /> WhatsApp
        </button>

        <div style={{ width: 1, height: 22, background: '#e2e8f0' }} />

        {/* Zoom Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#f8fafc', padding: '2px 6px', borderRadius: 8, border: '1px solid #cbd5e1' }}>
          <button
            className="btn-icon"
            style={{ width: 24, height: 24 }}
            onClick={() => setZoomScale(s => Math.max(0.5, parseFloat((s - 0.1).toFixed(2))))}
            title="Zoom out"
          >
            <ZoomOut size={13} />
          </button>
          <span style={{ fontSize: 11, fontWeight: 700, color: '#334155', minWidth: 36, textAlign: 'center' }}>
            {Math.round(zoomScale * 100)}%
          </span>
          <button
            className="btn-icon"
            style={{ width: 24, height: 24 }}
            onClick={() => setZoomScale(s => Math.min(1.2, parseFloat((s + 0.1).toFixed(2))))}
            title="Zoom in"
          >
            <ZoomIn size={13} />
          </button>
          <button
            className="btn-ghost btn-sm"
            style={{ fontSize: 11, padding: '2px 6px', height: 24 }}
            onClick={() => setZoomScale(0.85)}
            title="Fit to Screen"
          >
            <Maximize2 size={11} /> Fit
          </button>
        </div>

        <div style={{ width: 1, height: 22, background: '#e2e8f0' }} />

        <button className="btn-primary btn-sm" style={{ padding: '6px 14px', fontSize: 12 }} onClick={handlePrint}>
          <Printer size={14} /> Print ({isMultiPage ? '2 Pages' : '1 Page'})
        </button>

        <button className="btn-secondary btn-sm" style={{ padding: '6px 14px', fontSize: 12 }} onClick={handleDownloadPDF}>
          <Download size={14} /> Download PDF ({isMultiPage ? '2 Pages' : '1 Page'})
        </button>

        <button className="btn-secondary btn-sm" style={{ padding: '6px 14px', fontSize: 12, background: '#f8fafc', color: '#0f172a', border: '1px solid #cbd5e1' }} onClick={handleDownloadJPG} title="Download high-resolution JPG image (300 DPI)">
          <ImageIcon size={14} color="#2563eb" /> Download Image (JPG)
        </button>

        <button className="btn-ghost btn-sm" style={{ padding: '6px 10px' }} onClick={onClose} title="Close Preview">
          <X size={16} />
        </button>
      </div>

      {/* Scrollable Preview Area */}
      <div
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
          paddingBottom: 60,
        }}
      >
        <div
          style={{
            width: `${Math.round(794 * zoomScale)}px`,
            boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
            borderRadius: 4,
            background: '#ffffff',
            transition: 'width 0.15s ease',
          }}
        >
          <div
            style={{
              width: '210mm',
              transform: `scale(${zoomScale})`,
              transformOrigin: 'top left',
            }}
          >
            <PrescriptionPreview
              ref={previewRef}
              prescription={activePrescription}
              doctorProfile={doctorProfile}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
