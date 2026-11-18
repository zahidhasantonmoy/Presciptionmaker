import React, { useRef, useState, useCallback } from 'react';
import {
  Printer, Download, X, MessageSquare, FileText, Layers, FileDown,
  ZoomIn, ZoomOut, Maximize2, Image as ImageIcon, Copy, Check, FileCode
} from 'lucide-react';
import type { Prescription, DoctorProfile } from '../../types';
import { PrescriptionPreview } from './PrescriptionPreview';
import { useToast } from '../ui/Toast';
import { openWhatsAppPrescription } from '../../utils/whatsappShare';
import { loadInlineFontsCss } from '../../utils/offlineFonts';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface PrintPreviewModalProps {
  prescription: Prescription;
  doctorProfile: DoctorProfile | null;
  onClose: () => void;
  initialBlankMode?: boolean;
}

export function PrintPreviewModal({ prescription, doctorProfile, onClose, initialBlankMode = false }: PrintPreviewModalProps) {
  const previewRef = useRef<HTMLDivElement>(null);
  const { showToast } = useToast();
  const [isPadMode, setIsPadMode] = useState<boolean>(prescription.printMode === 'pad_only');
  const [isBlankPadMode, setIsBlankPadMode] = useState<boolean>(initialBlankMode);
  // Default to '1' page unless explicitly set to '2' or auto with >11 medicines
  const [pageMode, setPageMode] = useState<'1' | '2' | 'auto'>(prescription.pageCount || '1');
  const [splitAfter, setSplitAfter] = useState<number>(
    prescription.splitAfterMedicine || Math.min(6, Math.max(1, Math.ceil((prescription.medicines.length || 1) / 2)))
  );
  const [zoomScale, setZoomScale] = useState<number>(0.9);
  const [copiedHtml, setCopiedHtml] = useState(false);

  const blankPrescription: Prescription = {
    ...prescription,
    patient: {
      ...prescription.patient,
      name: '',
      nameBn: '',
      age: '',
      gender: '' as any,
      phone: '',
      patientId: '',
    },
    prescriptionNumber: '',
    complaints: '',
    history: '',
    onExamination: '',
    diagnoses: [],
    investigations: [],
    medicines: [],
    advice: '',
    adviceBn: '',
    followUpDate: '',
    followUpText: '',
    additionalNotes: '',
    printMode: isPadMode ? 'pad_only' : 'full',
    pageCount: '1',
  };

  const activePrescription: Prescription = isBlankPadMode ? blankPrescription : {
    ...prescription,
    printMode: isPadMode ? 'pad_only' : 'full',
    pageCount: pageMode,
    splitAfterMedicine: splitAfter,
  };

  const isMultiPage = pageMode === '2' || (pageMode === 'auto' && prescription.medicines.length > 11);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  const waitForExportFonts = useCallback(async () => {
    if (typeof document !== 'undefined' && document.fonts) {
      await document.fonts.ready;
      await Promise.allSettled([
        document.fonts.load('900 48px "Noto Serif Bengali"'),
        document.fonts.load('600 16px "Noto Sans Bengali"'),
        document.fonts.load('700 16px "Noto Sans Bengali"'),
      ]);
    }
  }, []);

  const getExportClinicLabel = useCallback(() => {
    if (prescription.theme === 'sanmun' || doctorProfile?.clinicName?.includes('সানমুন')) {
      return 'Sanmun_Dental_Care';
    }
    const raw = (doctorProfile?.clinicName || doctorProfile?.name || prescription.theme || 'Pad').trim();
    const asciiSafe = raw
      .replace(/\s+/g, '_')
      .replace(/[^\x20-\x7E]/g, '')
      .replace(/_+/g, '_')
      .replace(/^_+|_+$/g, '');
    if (asciiSafe) return asciiSafe;
    const fallback = (doctorProfile?.name || prescription.theme || 'Pad').replace(/\s+/g, '_').replace(/[^\w-]/g, '');
    return fallback || 'Pad';
  }, [doctorProfile, prescription.theme]);

  const captureSheetCanvas = useCallback(async (target: HTMLElement) => {
    await waitForExportFonts();
    const exportWidth = target.offsetWidth || Math.round(210 * (96 / 25.4));
    const exportHeight = target.offsetHeight || Math.round(297 * (96 / 25.4));

    return html2canvas(target, {
      scale: 3,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      width: exportWidth,
      height: exportHeight,
      windowWidth: exportWidth,
      windowHeight: exportHeight,
      scrollX: 0,
      scrollY: 0,
      onclone: (clonedDoc, clonedEl) => {
        const noPrints = clonedDoc.querySelectorAll<HTMLElement>('.no-print');
        noPrints.forEach((np) => {
          np.style.display = 'none';
        });

        let cur: HTMLElement | null = clonedEl.parentElement;
        while (cur && cur !== clonedDoc.body) {
          cur.style.transform = 'none';
          cur.style.webkitTransform = 'none';
          cur.style.zoom = '1';
          cur.style.width = 'auto';
          cur.style.maxWidth = 'none';
          cur.style.padding = '0';
          cur.style.margin = '0';
          cur.style.boxShadow = 'none';
          cur.style.overflow = 'visible';
          cur.style.backdropFilter = 'none';
          if (cur.classList.contains('modal-overlay')) {
            cur.style.position = 'static';
            cur.style.display = 'block';
            cur.style.background = '#ffffff';
          }
          cur = cur.parentElement;
        }

        clonedEl.style.transform = 'none';
        clonedEl.style.margin = '0';
        clonedEl.style.boxShadow = 'none';
        clonedEl.style.width = `${exportWidth}px`;
        clonedEl.style.height = `${exportHeight}px`;
        clonedEl.style.maxHeight = `${exportHeight}px`;
      },
    });
  }, [waitForExportFonts]);

  const handleDownloadPDF = useCallback(async () => {
    if (!previewRef.current) return;
    showToast('Generating high-resolution 1-Page A4 PDF (300 DPI)...', 'info');
    try {
      const sheets = previewRef.current.querySelectorAll<HTMLElement>('.rx-page-sheet');
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4', compress: true });
      const pdfWidth = 210;
      const pdfHeight = 297;

      if (sheets.length > 0) {
        for (let i = 0; i < sheets.length; i++) {
          if (i > 0) pdf.addPage();
          const canvas = await captureSheetCanvas(sheets[i]);
          const imgData = canvas.toDataURL('image/jpeg', 0.95);
          pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
        }
      } else {
        const canvas = await captureSheetCanvas(previewRef.current);
        const imgData = canvas.toDataURL('image/jpeg', 0.95);
        pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
      }

      const clinicOrDoctor = getExportClinicLabel();
      const patientName = (prescription.patient.name || 'Patient').replace(/\s+/g, '_');
      const date = prescription.date.substring(0, 10);
      const pageInfo = sheets.length > 1 ? `_${sheets.length}pages` : '';
      const filename = isBlankPadMode
        ? `Blank_Pad_${clinicOrDoctor}_A4.pdf`
        : `Rx_${patientName}_${date}${pageInfo}.pdf`;
      pdf.save(filename);
      showToast(
        isBlankPadMode
          ? 'ব্ল্যাঙ্ক প্রেসক্রিপশন প্যাড (PDF) সফলভাবে ডাউনলোড হয়েছে!'
          : `PDF saved successfully (${sheets.length || 1} Page${(sheets.length || 1) > 1 ? 's' : ''})!`,
        'success'
      );
    } catch (err) {
      console.error(err);
      showToast('Failed to generate PDF. Try printing instead.', 'error');
    }
  }, [captureSheetCanvas, getExportClinicLabel, isBlankPadMode, prescription, showToast]);

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
        const clinicOrDoctor = getExportClinicLabel();
        for (let i = 0; i < sheets.length; i++) {
          const canvas = await captureSheetCanvas(sheets[i]);
          const pageSuffix = sheets.length > 1 ? `_page${i + 1}` : '';
          const filename = isBlankPadMode
            ? `Blank_Pad_${clinicOrDoctor}_A4${pageSuffix}.jpg`
            : `Rx_${patientName}_${date}${pageSuffix}.jpg`;
          downloadCanvasAsJpg(canvas, filename);
          if (i < sheets.length - 1) {
            await new Promise((resolve) => setTimeout(resolve, 300));
          }
        }
      } else {
        const canvas = await captureSheetCanvas(previewRef.current);
        downloadCanvasAsJpg(canvas, `Rx_${patientName}_${date}.jpg`);
      }

      showToast('High-quality JPG image downloaded successfully!', 'success');
    } catch (err) {
      console.error(err);
      showToast('Failed to generate JPG image.', 'error');
    }
  }, [captureSheetCanvas, getExportClinicLabel, isBlankPadMode, prescription, showToast]);

  const buildStandaloneHtml = useCallback(async () => {
    if (!previewRef.current) return '';
    const clone = previewRef.current.cloneNode(true) as HTMLElement;
    clone.querySelectorAll('.no-print').forEach((el) => el.remove());
    clone.style.transform = 'none';
    clone.style.margin = '0';
    clone.querySelectorAll<HTMLElement>('.rx-preview, .rx-page-sheet').forEach((el) => {
      el.style.transform = 'none';
      el.style.margin = '0 auto';
    });

    const origin = typeof window !== 'undefined' && window.location.origin ? window.location.origin : '';
    const cssBlocks: string[] = [];
    if (typeof document !== 'undefined') {
      Array.from(document.styleSheets).forEach((sheet) => {
        try {
          if (sheet.cssRules) {
            const rules = Array.from(sheet.cssRules).map((r) => r.cssText).join('\n');
            if (rules.trim()) cssBlocks.push(rules);
          }
        } catch {
          // skip cross-origin stylesheets
        }
      });
    }

    const inlineFontsCss = await loadInlineFontsCss();
    const combinedCss = cssBlocks
      .join('\n')
      .replace(/@font-face\s*\{[^}]*\/fonts\/[^}]*\}/gi, '')
      .replace(/url\((["']?)\/fonts\//g, `url($1${origin}/fonts/`);

    const clinicOrDoctor = getExportClinicLabel();
    const patientName = (prescription.patient.name || 'Patient').trim().replace(/\s+/g, '_');
    const docTitle = isBlankPadMode
      ? `${clinicOrDoctor.replace(/_/g, ' ')} – Blank Prescription Pad`
      : `Prescription – ${patientName.replace(/_/g, ' ')}`;

    return `<!DOCTYPE html>
<html lang="bn">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${docTitle}</title>
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700&family=Noto+Sans+Bengali:wght@300;400;500;600;700;800;900&family=Noto+Serif+Bengali:wght@700;900&family=Roboto:wght@400;500;700;900&family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
<style>
  ${inlineFontsCss}
  ${combinedCss}
  @page { size: A4 portrait; margin: 0; }
  html, body {
    margin: 0;
    padding: 0;
    background: #e2e8f0;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .rx-export-wrap {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    padding: 16px 0;
  }
  @media print {
    html, body { background: #ffffff !important; }
    .rx-export-wrap { display: block; padding: 0; gap: 0; }
    .rx-page-sheet {
      box-shadow: none !important;
      margin: 0 !important;
      page-break-after: always;
      break-after: page;
    }
    .rx-page-sheet:last-child {
      page-break-after: auto;
      break-after: auto;
    }
  }
</style>
</head>
<body>
  <div class="rx-export-wrap">
    ${clone.outerHTML}
  </div>
</body>
</html>`;
  }, [getExportClinicLabel, isBlankPadMode, prescription.patient.name]);

  const handleCopyHtml = useCallback(async () => {
    try {
      const html = await buildStandaloneHtml();
      if (!html) return;
      await navigator.clipboard.writeText(html);
      setCopiedHtml(true);
      setTimeout(() => setCopiedHtml(false), 2500);
      showToast('অফলাইন ফন্টসহ HTML কোড ক্লিপবোর্ডে কপি করা হয়েছে!', 'success');
    } catch (err) {
      console.error(err);
      showToast('Failed to copy HTML to clipboard.', 'error');
    }
  }, [buildStandaloneHtml, showToast]);

  const handleDownloadHtml = useCallback(async () => {
    try {
      const html = await buildStandaloneHtml();
      if (!html) return;
      const clinicOrDoctor = getExportClinicLabel();
      const patientName = (prescription.patient.name || 'Patient').replace(/\s+/g, '_');
      const date = prescription.date.substring(0, 10);
      const filename = isBlankPadMode
        ? `Blank_Pad_${clinicOrDoctor}_A4.html`
        : `Rx_${patientName}_${date}.html`;

      const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      showToast(
        isBlankPadMode
          ? 'অফলাইন ফন্টসহ ব্ল্যাঙ্ক প্যাড (HTML) ডাউনলোড হয়েছে!'
          : `Offline-ready HTML downloaded: ${filename}`,
        'success'
      );
    } catch (err) {
      console.error(err);
      showToast('Failed to download HTML file.', 'error');
    }
  }, [buildStandaloneHtml, getExportClinicLabel, isBlankPadMode, prescription, showToast]);

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

        {/* Blank Template Pad Toggle */}
        <button
          type="button"
          className="btn-ghost btn-sm"
          style={{
            background: isBlankPadMode ? '#ecfdf5' : '#f8fafc',
            color: isBlankPadMode ? '#065f46' : '#475569',
            border: `1px solid ${isBlankPadMode ? '#10b981' : '#cbd5e1'}`,
            fontWeight: 700,
            fontSize: 12,
            padding: '4px 10px',
            display: 'flex',
            alignItems: 'center',
            gap: 5,
          }}
          onClick={() => setIsBlankPadMode(!isBlankPadMode)}
          title="Toggle Blank Prescription Template (প্যাডে কোনো তথ্য না রেখে কেবল ব্ল্যাঙ্ক টেমপ্লেট প্যাড দেখুন ও ডাউনলোড করুন)"
        >
          <FileDown size={13} color={isBlankPadMode ? '#059669' : '#64748b'} />
          {isBlankPadMode ? 'Blank Pad: ON (শুধু টেমপ্লেট)' : 'Blank Pad: OFF'}
        </button>

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
          {isPadMode ? 'Pre-printed (ON)' : 'Pre-printed (OFF)'}
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

        <button
          type="button"
          className="btn-secondary btn-sm"
          style={{
            padding: '6px 12px',
            fontSize: 12,
            background: copiedHtml ? '#ecfdf5' : '#f8fafc',
            color: copiedHtml ? '#065f46' : '#0f172a',
            border: `1px solid ${copiedHtml ? '#10b981' : '#cbd5e1'}`,
            display: 'flex',
            alignItems: 'center',
            gap: 5,
          }}
          onClick={handleCopyHtml}
          title="Copy standalone printable HTML code to clipboard"
        >
          {copiedHtml ? <Check size={14} color="#059669" /> : <Copy size={14} color="#475569" />}
          {copiedHtml ? 'Copied HTML!' : 'Copy HTML'}
        </button>

        <button
          type="button"
          className="btn-secondary btn-sm"
          style={{
            padding: '6px 12px',
            fontSize: 12,
            background: '#f8fafc',
            color: '#0f172a',
            border: '1px solid #cbd5e1',
            display: 'flex',
            alignItems: 'center',
            gap: 5,
          }}
          onClick={handleDownloadHtml}
          title="Download standalone printable HTML file"
        >
          <FileCode size={14} color="#7c3aed" /> Download HTML
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
