import React, { useState, useEffect, useRef, useMemo } from 'react';
import './ticketFonts.css';
import QRCode from 'qrcode';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import {
  Train, Download, Printer, Plus, CheckCircle2,
  Trash2, PenTool, Eye, ZoomIn, ZoomOut
} from 'lucide-react';
import { ShohozLogo } from './ShohozLogo';
import {
  RAILWAY_STATIONS, RAILWAY_TRAINS, RAILWAY_CLASSES,
  toBanglaDigits, getStationBanglaName,
  formatCoachSeat
} from './railwayData';

export interface BangladeshRailwayTicket {
  id: string;
  pnrNumber: string;
  passengerName: string;
  idType: string;
  idTypeBn: string;
  idNumber: string;
  idNumberBn: string;
  mobileNumber: string;
  mobileNumberBn: string;
  issueDate: string; // YYYY-MM-DD
  issueTime: string; // HH:mm
  journeyDate: string; // YYYY-MM-DD
  journeyTime: string; // HH:mm
  fromStation: string;
  fromStationBn: string;
  toStation: string;
  toStationBn: string;
  trainName: string;
  trainNameBn: string;
  trainNumber: string;
  className: string;
  classNameBn: string;
  coachSeat: string;
  coachSeatBn: string;
  numSeats: number;
  numAdults: number;
  numSeniors: number;
  numChildren: number;
  fare: number;
  vat: number;
  serviceCharge: number;
  createdAt: string;
}

const DEFAULT_BR_TICKET: BangladeshRailwayTicket = {
  id: 'BR-' + Math.floor(100000 + Math.random() * 900000),
  pnrNumber: '6ABA16FCEEBCA',
  passengerName: 'MD. ZAHID HASAN',
  idType: 'NID',
  idTypeBn: 'এন আই ডি',
  idNumber: '376****183',
  idNumberBn: '৩৭৬****১৮৩',
  mobileNumber: '017*****000',
  mobileNumberBn: '০১৭*****০০০',
  issueDate: '2026-09-28',
  issueTime: '13:27',
  journeyDate: '2026-10-01',
  journeyTime: '19:30',
  fromStation: 'Dhaka',
  fromStationBn: 'ঢাকা',
  toStation: 'Bheramara',
  toStationBn: 'ভেড়ামারা',
  trainName: 'CHITRA EXPRESS',
  trainNameBn: 'চিত্রা',
  trainNumber: '764',
  className: 'S_CHAIR',
  classNameBn: 'শো.চেয়ার',
  coachSeat: 'TA-34',
  coachSeatBn: 'ট-৩৪',
  numSeats: 1,
  numAdults: 1,
  numSeniors: 0,
  numChildren: 0,
  fare: 455,
  vat: 0,
  serviceCharge: 20,
  createdAt: new Date().toISOString(),
};

export function TicketMaker() {
  const [ticket, setTicket] = useState<BangladeshRailwayTicket>(DEFAULT_BR_TICKET);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [savedTickets, setSavedTickets] = useState<BangladeshRailwayTicket[]>(() => {
    try {
      const stored = localStorage.getItem('personal_railway_tickets_db');
      return stored ? JSON.parse(stored) : [DEFAULT_BR_TICKET];
    } catch {
      return [DEFAULT_BR_TICKET];
    }
  });

  // Manual entry toggle states
  const [manualStationMode, setManualStationMode] = useState(false);
  const [manualTrainMode, setManualTrainMode] = useState(false);
  const [manualClassMode, setManualClassMode] = useState(false);

  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [mobileTab, setMobileTab] = useState<'editor' | 'preview'>('editor');
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth < 1024);
  const ticketRef = useRef<HTMLDivElement>(null);

  const calculateFitScale = () => {
    if (typeof window !== 'undefined') {
      const availableWidth = Math.max(260, window.innerWidth - (window.innerWidth < 640 ? 16 : 32));
      return Math.min(1, parseFloat((availableWidth / 794).toFixed(3)));
    }
    return 1;
  };

  const [previewScale, setPreviewScale] = useState<number>(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      const availableWidth = Math.max(260, window.innerWidth - (window.innerWidth < 640 ? 16 : 32));
      return Math.min(1, parseFloat((availableWidth / 794).toFixed(3)));
    }
    return 1;
  });

  // Resize listener for mobile responsiveness and preview scale
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) {
        setPreviewScale(calculateFitScale());
      } else {
        setPreviewScale(1);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fitToScreen = () => setPreviewScale(calculateFitScale());
  const zoomIn = () => setPreviewScale(prev => Math.min(1.5, parseFloat((prev + 0.1).toFixed(2))));
  const zoomOut = () => setPreviewScale(prev => Math.max(0.25, parseFloat((prev - 0.1).toFixed(2))));
  const resetZoom = () => setPreviewScale(1);

  // Filter trains for selected origin and destination
  const availableTrains = useMemo(() => {
    if (!ticket.fromStation && !ticket.toStation) return RAILWAY_TRAINS;
    return RAILWAY_TRAINS.filter(t => {
      const matchFrom = !ticket.fromStation || t.fromStation.toLowerCase() === ticket.fromStation.toLowerCase();
      const matchTo = !ticket.toStation || t.toStation.toLowerCase() === ticket.toStation.toLowerCase();
      return matchFrom && matchTo;
    });
  }, [ticket.fromStation, ticket.toStation]);

  // Handle train selection -> Automatically adjust departure time, train number, stations & fare!
  const handleSelectTrain = (identifier: string) => {
    if (identifier === 'MANUAL_MODE') {
      setManualTrainMode(true);
      return;
    }
    const match = RAILWAY_TRAINS.find(t => `${t.name} [${t.number}]` === identifier || t.number === identifier || t.name === identifier);
    if (match) {
      const autoFare = match.fares[ticket.className] || RAILWAY_CLASSES.find(c => c.code === ticket.className)?.defaultFare || 450;
      const fromStMatch = RAILWAY_STATIONS.find(s => s.name.toLowerCase() === match.fromStation.toLowerCase());
      const toStMatch = RAILWAY_STATIONS.find(s => s.name.toLowerCase() === match.toStation.toLowerCase());

      setTicket(prev => ({
        ...prev,
        trainName: match.name,
        trainNameBn: match.nameBn,
        trainNumber: match.number,
        fromStation: match.fromStation,
        fromStationBn: fromStMatch?.nameBn || prev.fromStationBn,
        toStation: match.toStation,
        toStationBn: toStMatch?.nameBn || prev.toStationBn,
        journeyTime: match.departureTime,
        fare: autoFare,
      }));
    }
  };

  // Handle Station selection
  const handleFromStationSelect = (stName: string) => {
    if (stName === 'MANUAL_MODE') {
      setManualStationMode(true);
      return;
    }
    const match = RAILWAY_STATIONS.find(s => s.name === stName);
    setTicket(prev => ({
      ...prev,
      fromStation: stName,
      fromStationBn: match?.nameBn || stName,
    }));
  };

  const handleToStationSelect = (stName: string) => {
    if (stName === 'MANUAL_MODE') {
      setManualStationMode(true);
      return;
    }
    const match = RAILWAY_STATIONS.find(s => s.name === stName);
    setTicket(prev => ({
      ...prev,
      toStation: stName,
      toStationBn: match?.nameBn || stName,
    }));
  };

  // Handle class change -> Auto calculate fare
  const handleClassChange = (newClass: string) => {
    if (newClass === 'MANUAL_MODE') {
      setManualClassMode(true);
      return;
    }
    const clsObj = RAILWAY_CLASSES.find(c => c.code === newClass);
    const currentTrain = RAILWAY_TRAINS.find(t => t.number === ticket.trainNumber);
    const classFare = currentTrain?.fares[newClass] ?? (clsObj?.defaultFare ?? 450);
    setTicket(prev => ({
      ...prev,
      className: newClass,
      classNameBn: clsObj?.labelBn || newClass,
      fare: classFare,
    }));
  };

  // Generate QR Code containing official verification URL / payload
  useEffect(() => {
    const qrPayload = JSON.stringify({
      pnr: ticket.pnrNumber,
      passenger: ticket.passengerName,
      train: `${ticket.trainName} [${ticket.trainNumber}]`,
      from: ticket.fromStation,
      to: ticket.toStation,
      date: `${ticket.journeyDate} ${ticket.journeyTime}`,
      seat: ticket.coachSeat,
      fare: ticket.fare,
    });

    QRCode.toDataURL(qrPayload, {
      width: 140,
      margin: 0,
      color: { dark: '#000000', light: '#ffffff' }
    }).then(setQrDataUrl).catch(console.error);
  }, [ticket.pnrNumber, ticket.passengerName, ticket.trainName, ticket.trainNumber, ticket.journeyDate, ticket.journeyTime, ticket.coachSeat, ticket.fare]);

  // Calculations
  const isBeddingClass = ticket.className === 'AC_B' || ticket.className === 'F_BERTH';
  const beddingCharge = isBeddingClass ? 50 * ticket.numSeats : 0;
  const totalFare = (ticket.fare * ticket.numAdults) + ticket.vat + ticket.serviceCharge + beddingCharge;

  // Format date helper
  const formatDateEn = (dateStr: string, timeStr: string) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    const formatted = parts.length === 3 ? `${parts[2]}-${parts[1]}-${parts[0]}` : dateStr;
    return `${formatted} ${timeStr || '00:00'}`;
  };

  const formatDateBn = (dateStr: string, timeStr: string) => {
    const en = formatDateEn(dateStr, timeStr);
    return toBanglaDigits(en);
  };

  // Save current ticket
  const saveCurrentTicket = () => {
    const updated = [ticket, ...savedTickets.filter(t => t.id !== ticket.id)];
    setSavedTickets(updated);
    localStorage.setItem('personal_railway_tickets_db', JSON.stringify(updated));
    alert('Bangladesh Railway ticket saved to history!');
  };

  const createNewTicket = () => {
    const newId = 'BR-' + Math.floor(100000 + Math.random() * 900000);
    const randomPnr = Math.random().toString(36).substring(2, 8).toUpperCase() + Math.floor(100000 + Math.random() * 900000);
    setTicket({
      ...DEFAULT_BR_TICKET,
      id: newId,
      pnrNumber: randomPnr,
      createdAt: new Date().toISOString(),
    });
  };

  const generateRandomPnr = () => {
    const randomPnr = Math.random().toString(36).substring(2, 8).toUpperCase() + Math.floor(100000 + Math.random() * 900000);
    setTicket(prev => ({ ...prev, pnrNumber: randomPnr }));
  };

  const deleteTicket = (id: string) => {
    const filtered = savedTickets.filter(t => t.id !== id);
    setSavedTickets(filtered);
    localStorage.setItem('personal_railway_tickets_db', JSON.stringify(filtered));
  };

  // Download High-Resolution A4 PDF matching exact points with perfect line alignment & small file size
  const handleDownloadPdf = async () => {
    if (!ticketRef.current) return;
    setIsGeneratingPdf(true);
    try {
      if (document.fonts) {
        await document.fonts.ready;
      }
      const el = ticketRef.current;

      const canvas = await html2canvas(el, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
        scrollX: 0,
        scrollY: 0,
        windowWidth: 1200,
        windowHeight: 1600,
        onclone: (clonedDoc) => {
          // 1. Reset scale on cloned page so it captures at crisp 595.28pt without affecting mobile view
          const clonedPage = clonedDoc.getElementById('page');
          if (clonedPage) {
            clonedPage.style.transform = 'none';
            clonedPage.style.position = 'relative';
            clonedPage.style.margin = '0';
          }

          // 2. Fix html2canvas line-height / vertical baseline bug:
          // In browsers, line-height: 20pt adds (20 - fontSize)/2 half-leading to center text vertically.
          // html2canvas ignores this and renders text directly from top, causing table lines to cut through text.
          // By applying the exact half-leading in the clone, html2canvas renders the text perfectly centered in cells!
          const spans = clonedDoc.querySelectorAll<HTMLElement>('.ticket-span');
          spans.forEach(span => {
            const fs = parseFloat(span.style.fontSize) || 7.5;
            const currentTop = parseFloat(span.style.top);
            if (!isNaN(currentTop)) {
              const halfLeading = (20 - fs) / 2;
              span.style.top = `${currentTop + halfLeading}pt`;
              span.style.lineHeight = 'normal';
              span.style.height = 'auto';
            }
          });
        }
      });

      // Compress to high-quality JPEG (0.92) to keep PDF under ~250 KB instead of 6 MB!
      const imgData = canvas.toDataURL('image/jpeg', 0.92);
      const pdf = new jsPDF({
        orientation: 'p',
        unit: 'pt',
        format: 'a4',
        compress: true,
      });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
      pdf.save(`BR_ETicket_${ticket.pnrNumber}_${ticket.passengerName.replace(/\s+/g, '_')}.pdf`);
    } catch (err) {
      console.error('Failed to export PDF:', err);
      alert('Could not export PDF. Please check console.');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      background: '#090d16',
      color: '#f8fafc',
      overflow: 'hidden',
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      {/* ─── Top Control Header ────────────────────────────────────────── */}
      <div style={{
        padding: isMobile ? '8px 12px' : '12px 20px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: '#0f172a',
        flexShrink: 0,
        boxSizing: 'border-box'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 8 : 12 }}>
          <div style={{
            width: isMobile ? 32 : 38,
            height: isMobile ? 32 : 38,
            borderRadius: isMobile ? 8 : 10,
            background: 'linear-gradient(135deg, #039d48 0%, #05b454 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            boxShadow: '0 4px 12px rgba(3, 157, 72, 0.35)',
            flexShrink: 0
          }}>
            <Train size={isMobile ? 18 : 22} />
          </div>
          <div>
            <h1 style={{ fontSize: isMobile ? 14 : 17, fontWeight: 700, margin: 0, whiteSpace: 'nowrap' }}>
              Railway Ticket Maker
            </h1>
            {!isMobile && (
              <p style={{ fontSize: 11, color: '#94a3b8', margin: 0 }}>
                100% Exact Official Template with Pixel-to-Pixel Alignment & Automated Schedule
              </p>
            )}
          </div>
        </div>

        {/* Desktop Buttons */}
        {!isMobile ? (
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button
              onClick={createNewTicket}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
                color: '#f1f5f9', padding: '7px 12px', borderRadius: 8, fontSize: 12, cursor: 'pointer'
              }}
            >
              <Plus size={15} /> New
            </button>
            <button
              onClick={saveCurrentTicket}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
                color: '#f1f5f9', padding: '7px 12px', borderRadius: 8, fontSize: 12, cursor: 'pointer'
              }}
            >
              <CheckCircle2 size={15} /> Save
            </button>
            <button
              onClick={() => window.print()}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
                color: '#f1f5f9', padding: '7px 12px', borderRadius: 8, fontSize: 12, cursor: 'pointer'
              }}
            >
              <Printer size={15} /> Print
            </button>
            <button
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                background: 'linear-gradient(135deg, #039d48 0%, #05b454 100%)',
                color: '#fff', border: 'none', padding: '7px 14px', borderRadius: 8,
                fontSize: 12, fontWeight: 700, cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(3, 157, 72, 0.4)'
              }}
            >
              <Download size={15} /> {isGeneratingPdf ? 'Generating...' : 'PDF Download'}
            </button>
          </div>
        ) : (
          /* Mobile Top Bar Segmented Switcher & Quick New */
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <button
              onClick={createNewTicket}
              style={{
                background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
                color: '#f1f5f9', padding: '5px 8px', borderRadius: 6, fontSize: 11, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 4
              }}
              title="New Ticket"
            >
              <Plus size={13} /> New
            </button>
            <div style={{ display: 'flex', background: '#1e293b', borderRadius: 6, padding: 2, gap: 2 }}>
              <button
                onClick={() => setMobileTab('editor')}
                style={{
                  background: mobileTab === 'editor' ? '#039d48' : 'transparent',
                  color: '#fff', border: 'none', borderRadius: 5, padding: '4px 8px', fontSize: 11, fontWeight: 600, cursor: 'pointer'
                }}
              >
                Form
              </button>
              <button
                onClick={() => setMobileTab('preview')}
                style={{
                  background: mobileTab === 'preview' ? '#039d48' : 'transparent',
                  color: '#fff', border: 'none', borderRadius: 5, padding: '4px 8px', fontSize: 11, fontWeight: 600, cursor: 'pointer'
                }}
              >
                Ticket
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ─── Main Content Workspace ────────────────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', position: 'relative' }}>
        {/* Left Form: Railway Parameters & Stations */}
        {(!isMobile || mobileTab === 'editor') && (
          <div style={{
            width: isMobile ? '100%' : 440,
            borderRight: isMobile ? 'none' : '1px solid rgba(255, 255, 255, 0.08)',
            background: '#0b1120',
            padding: isMobile ? '14px 12px 100px' : '18px 20px',
            overflowY: 'auto',
            flexShrink: 0,
            boxSizing: 'border-box'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <span style={{ fontSize: 13, fontWeight: 800, color: '#10b981', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                🚂 Journey & Train Setup
              </span>
              <span style={{ fontSize: 11, color: '#94a3b8' }}>Auto-time adjustment active</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* ── Station Selection & Manual Input Switch ── */}
              <div style={{ background: '#131e32', border: '1px solid #1e293b', borderRadius: 8, padding: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#e2e8f0' }}>Stations (স্টেশন নির্বাচন)</span>
                  <button
                    onClick={() => setManualStationMode(!manualStationMode)}
                    style={{
                      background: manualStationMode ? '#039d48' : 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.12)',
                      borderRadius: 6,
                      padding: '3px 8px',
                      fontSize: 11,
                      color: '#fff',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4
                    }}
                  >
                    <PenTool size={12} /> {manualStationMode ? 'Switch to Menu' : 'Manual Write (হাতে লিখুন)'}
                  </button>
                </div>

                {!manualStationMode ? (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    <div>
                      <label style={{ fontSize: 10.5, color: '#94a3b8', display: 'block', marginBottom: 3 }}>
                        From Station (প্রারম্ভিক)
                      </label>
                      <select
                        value={ticket.fromStation}
                        onChange={e => handleFromStationSelect(e.target.value)}
                        style={{ width: '100%', padding: '7px 8px', background: '#1e293b', border: '1px solid #334155', borderRadius: 6, color: '#fff', fontSize: 12, boxSizing: 'border-box' }}
                      >
                        {RAILWAY_STATIONS.map(st => (
                          <option key={'from-' + st.code + '-' + st.name} value={st.name}>
                            {st.name} ({st.nameBn})
                          </option>
                        ))}
                        <option value="MANUAL_MODE">✏️ Custom / অন্য স্টেশন লিখুন...</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ fontSize: 10.5, color: '#94a3b8', display: 'block', marginBottom: 3 }}>
                        To Station (গন্তব্য)
                      </label>
                      <select
                        value={ticket.toStation}
                        onChange={e => handleToStationSelect(e.target.value)}
                        style={{ width: '100%', padding: '7px 8px', background: '#1e293b', border: '1px solid #334155', borderRadius: 6, color: '#fff', fontSize: 12, boxSizing: 'border-box' }}
                      >
                        {RAILWAY_STATIONS.map(st => (
                          <option key={'to-' + st.code + '-' + st.name} value={st.name}>
                            {st.name} ({st.nameBn})
                          </option>
                        ))}
                        <option value="MANUAL_MODE">✏️ Custom / অন্য স্টেশন লিখুন...</option>
                      </select>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                      <div>
                        <label style={{ fontSize: 10.5, color: '#94a3b8', display: 'block', marginBottom: 2 }}>From (English)</label>
                        <input
                          type="text"
                          value={ticket.fromStation}
                          onChange={e => setTicket({ ...ticket, fromStation: e.target.value })}
                          placeholder="e.g. Dhaka"
                          style={{ width: '100%', padding: '6px 8px', background: '#1e293b', border: '1px solid #334155', borderRadius: 6, color: '#fff', fontSize: 12, boxSizing: 'border-box' }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: 10.5, color: '#94a3b8', display: 'block', marginBottom: 2 }}>From (বাংলা)</label>
                        <input
                          type="text"
                          value={ticket.fromStationBn}
                          onChange={e => setTicket({ ...ticket, fromStationBn: e.target.value })}
                          placeholder="যেমনঃ ঢাকা"
                          style={{ width: '100%', padding: '6px 8px', background: '#1e293b', border: '1px solid #334155', borderRadius: 6, color: '#fff', fontSize: 12, boxSizing: 'border-box' }}
                        />
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                      <div>
                        <label style={{ fontSize: 10.5, color: '#94a3b8', display: 'block', marginBottom: 2 }}>To (English)</label>
                        <input
                          type="text"
                          value={ticket.toStation}
                          onChange={e => setTicket({ ...ticket, toStation: e.target.value })}
                          placeholder="e.g. Bheramara"
                          style={{ width: '100%', padding: '6px 8px', background: '#1e293b', border: '1px solid #334155', borderRadius: 6, color: '#fff', fontSize: 12, boxSizing: 'border-box' }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: 10.5, color: '#94a3b8', display: 'block', marginBottom: 2 }}>To (বাংলা)</label>
                        <input
                          type="text"
                          value={ticket.toStationBn}
                          onChange={e => setTicket({ ...ticket, toStationBn: e.target.value })}
                          placeholder="যেমনঃ ভেড়ামারা"
                          style={{ width: '100%', padding: '6px 8px', background: '#1e293b', border: '1px solid #334155', borderRadius: 6, color: '#fff', fontSize: 12, boxSizing: 'border-box' }}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* ── Train Selector with Manual Write Toggle ── */}
              <div style={{ background: '#131e32', border: '1px solid #1e293b', borderRadius: 8, padding: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#e2e8f0' }}>Train Name & No. (ট্রেন)</span>
                  <button
                    onClick={() => setManualTrainMode(!manualTrainMode)}
                    style={{
                      background: manualTrainMode ? '#039d48' : 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.12)',
                      borderRadius: 6,
                      padding: '3px 8px',
                      fontSize: 11,
                      color: '#fff',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4
                    }}
                  >
                    <PenTool size={12} /> {manualTrainMode ? 'Switch to Menu' : 'Manual Train (হাতে লিখুন)'}
                  </button>
                </div>

                {!manualTrainMode ? (
                  <div>
                    <label style={{ fontSize: 10.5, color: '#94a3b8', display: 'block', marginBottom: 3 }}>
                      Train Selection (ট্রেন বাছুন - সময় ও ভাড়া অটো মিলবে)
                    </label>
                    <select
                      value={`${ticket.trainName} [${ticket.trainNumber}]`}
                      onChange={e => handleSelectTrain(e.target.value)}
                      style={{ width: '100%', padding: '8px 10px', background: '#1e293b', border: '1px solid #334155', borderRadius: 6, color: '#fff', fontSize: 12.5, boxSizing: 'border-box' }}
                    >
                      {availableTrains.map(tr => (
                        <option key={tr.number + '-' + tr.name} value={`${tr.name} [${tr.number}]`}>
                          {tr.name} [{tr.number}] ({tr.fromStation} → {tr.toStation} @ {tr.departureTime})
                        </option>
                      ))}
                      {!availableTrains.some(t => t.name === ticket.trainName && t.number === ticket.trainNumber) && (
                        <option value={`${ticket.trainName} [${ticket.trainNumber}]`}>
                          {ticket.trainName} [{ticket.trainNumber}]
                        </option>
                      )}
                      <option value="MANUAL_MODE">✏️ Custom Train / অন্য কোনো ট্রেন লিখুন...</option>
                    </select>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 0.6fr', gap: 6 }}>
                    <div>
                      <label style={{ fontSize: 10.5, color: '#94a3b8', display: 'block', marginBottom: 2 }}>Train (EN)</label>
                      <input
                        type="text"
                        value={ticket.trainName}
                        onChange={e => setTicket({ ...ticket, trainName: e.target.value })}
                        placeholder="CHITRA EXPRESS"
                        style={{ width: '100%', padding: '6px 8px', background: '#1e293b', border: '1px solid #334155', borderRadius: 6, color: '#fff', fontSize: 12, boxSizing: 'border-box' }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: 10.5, color: '#94a3b8', display: 'block', marginBottom: 2 }}>Train (বাংলা)</label>
                      <input
                        type="text"
                        value={ticket.trainNameBn}
                        onChange={e => setTicket({ ...ticket, trainNameBn: e.target.value })}
                        placeholder="চিত্রা"
                        style={{ width: '100%', padding: '6px 8px', background: '#1e293b', border: '1px solid #334155', borderRadius: 6, color: '#fff', fontSize: 12, boxSizing: 'border-box' }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: 10.5, color: '#94a3b8', display: 'block', marginBottom: 2 }}>Number</label>
                      <input
                        type="text"
                        value={ticket.trainNumber}
                        onChange={e => setTicket({ ...ticket, trainNumber: e.target.value })}
                        placeholder="764"
                        style={{ width: '100%', padding: '6px 8px', background: '#1e293b', border: '1px solid #334155', borderRadius: 6, color: '#fff', fontSize: 12, boxSizing: 'border-box' }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* ── Class Name & Coach/Seat ── */}
              <div style={{ background: '#131e32', border: '1px solid #1e293b', borderRadius: 8, padding: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#e2e8f0' }}>Class & Coach / Seat</span>
                  <button
                    onClick={() => setManualClassMode(!manualClassMode)}
                    style={{
                      background: manualClassMode ? '#039d48' : 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.12)',
                      borderRadius: 6,
                      padding: '3px 8px',
                      fontSize: 11,
                      color: '#fff',
                      cursor: 'pointer'
                    }}
                  >
                    {manualClassMode ? 'Preset Classes' : 'Custom Class'}
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 8 }}>
                  {!manualClassMode ? (
                    <div>
                      <label style={{ fontSize: 10.5, color: '#94a3b8', display: 'block', marginBottom: 3 }}>Class Name (শ্রেণি)</label>
                      <select
                        value={ticket.className}
                        onChange={e => handleClassChange(e.target.value)}
                        style={{ width: '100%', padding: '7px 8px', background: '#1e293b', border: '1px solid #334155', borderRadius: 6, color: '#fff', fontSize: 12, boxSizing: 'border-box' }}
                      >
                        {RAILWAY_CLASSES.map(cls => (
                          <option key={cls.code} value={cls.code}>
                            {cls.label} ({cls.labelBn})
                          </option>
                        ))}
                        <option value="MANUAL_MODE">✏️ Custom Class Name...</option>
                      </select>
                    </div>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
                      <div>
                        <label style={{ fontSize: 10, color: '#94a3b8', display: 'block', marginBottom: 2 }}>Class EN</label>
                        <input
                          type="text"
                          value={ticket.className}
                          onChange={e => setTicket({ ...ticket, className: e.target.value })}
                          placeholder="S_CHAIR"
                          style={{ width: '100%', padding: '6px', background: '#1e293b', border: '1px solid #334155', borderRadius: 6, color: '#fff', fontSize: 11.5, boxSizing: 'border-box' }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: 10, color: '#94a3b8', display: 'block', marginBottom: 2 }}>Class BN</label>
                        <input
                          type="text"
                          value={ticket.classNameBn}
                          onChange={e => setTicket({ ...ticket, classNameBn: e.target.value })}
                          placeholder="শো.চেয়ার"
                          style={{ width: '100%', padding: '6px', background: '#1e293b', border: '1px solid #334155', borderRadius: 6, color: '#fff', fontSize: 11.5, boxSizing: 'border-box' }}
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <label style={{ fontSize: 10.5, color: '#94a3b8', display: 'block', marginBottom: 3 }}>Coach / Seat</label>
                    <input
                      type="text"
                      value={ticket.coachSeat}
                      onChange={e => {
                        const val = e.target.value;
                        const formatted = formatCoachSeat(val);
                        const matchBn = formatted.match(/\((.*?)\)/);
                        setTicket({
                          ...ticket,
                          coachSeat: val,
                          coachSeatBn: matchBn ? matchBn[1] : toBanglaDigits(val)
                        });
                      }}
                      placeholder="TA-34"
                      style={{ width: '100%', padding: '7px 8px', background: '#1e293b', border: '1px solid #334155', borderRadius: 6, color: '#fff', fontSize: 12, boxSizing: 'border-box' }}
                    />
                  </div>
                </div>
              </div>

              {/* ── Journey Date & Departure Time (Auto-adjusts) ── */}
              <div style={{ background: '#131e32', border: '1px solid #1e293b', borderRadius: 8, padding: 12 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#e2e8f0', display: 'block', marginBottom: 8 }}>
                  Schedule & Dates (তারিখ ও সময়)
                </span>
                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 8, marginBottom: 8 }}>
                  <div>
                    <label style={{ fontSize: 10.5, color: '#94a3b8', display: 'block', marginBottom: 2 }}>Journey Date (যাত্রার তারিখ)</label>
                    <input
                      type="date"
                      value={ticket.journeyDate}
                      onChange={e => setTicket({ ...ticket, journeyDate: e.target.value })}
                      style={{ width: '100%', padding: '6px 8px', background: '#1e293b', border: '1px solid #334155', borderRadius: 6, color: '#fff', fontSize: 12, boxSizing: 'border-box' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 10.5, color: '#94a3b8', display: 'block', marginBottom: 2 }}>Journey Time</label>
                    <input
                      type="time"
                      value={ticket.journeyTime}
                      onChange={e => setTicket({ ...ticket, journeyTime: e.target.value })}
                      style={{ width: '100%', padding: '6px 8px', background: '#1e293b', border: '1px solid #334155', borderRadius: 6, color: '#fff', fontSize: 12, boxSizing: 'border-box' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 8 }}>
                  <div>
                    <label style={{ fontSize: 10.5, color: '#94a3b8', display: 'block', marginBottom: 2 }}>Issue Date (প্রদানের তারিখ)</label>
                    <input
                      type="date"
                      value={ticket.issueDate}
                      onChange={e => setTicket({ ...ticket, issueDate: e.target.value })}
                      style={{ width: '100%', padding: '6px 8px', background: '#1e293b', border: '1px solid #334155', borderRadius: 6, color: '#fff', fontSize: 12, boxSizing: 'border-box' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 10.5, color: '#94a3b8', display: 'block', marginBottom: 2 }}>Issue Time</label>
                    <input
                      type="time"
                      value={ticket.issueTime}
                      onChange={e => setTicket({ ...ticket, issueTime: e.target.value })}
                      style={{ width: '100%', padding: '6px 8px', background: '#1e293b', border: '1px solid #334155', borderRadius: 6, color: '#fff', fontSize: 12, boxSizing: 'border-box' }}
                    />
                  </div>
                </div>
              </div>

              {/* ── Passenger Info ── */}
              <div style={{ background: '#131e32', border: '1px solid #1e293b', borderRadius: 8, padding: 12 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#e2e8f0', display: 'block', marginBottom: 8 }}>
                  Passenger Information (যাত্রীর তথ্য)
                </span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div>
                    <label style={{ fontSize: 10.5, color: '#94a3b8', display: 'block', marginBottom: 2 }}>Passenger Name (যাত্রীর নাম)</label>
                    <input
                      type="text"
                      value={ticket.passengerName}
                      onChange={e => setTicket({ ...ticket, passengerName: e.target.value })}
                      placeholder="MD. ZAHID HASAN"
                      style={{ width: '100%', padding: '7px 8px', background: '#1e293b', border: '1px solid #334155', borderRadius: 6, color: '#fff', fontSize: 12, boxSizing: 'border-box' }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    <div>
                      <label style={{ fontSize: 10.5, color: '#94a3b8', display: 'block', marginBottom: 2 }}>ID Type (পরিচয়পত্র ধরণ)</label>
                      <select
                        value={ticket.idType}
                        onChange={e => {
                          const val = e.target.value;
                          const bn = val === 'NID' ? 'এন আই ডি' : val === 'Birth Certificate' ? 'জন্ম নিবন্ধন সনদ' : 'পাসপোর্ট';
                          setTicket({ ...ticket, idType: val, idTypeBn: bn });
                        }}
                        style={{ width: '100%', padding: '6px 8px', background: '#1e293b', border: '1px solid #334155', borderRadius: 6, color: '#fff', fontSize: 12, boxSizing: 'border-box' }}
                      >
                        <option value="NID">NID (এন আই ডি)</option>
                        <option value="Birth Certificate">Birth Certificate (জন্ম নিবন্ধন সনদ)</option>
                        <option value="Passport">Passport (পাসপোর্ট)</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ fontSize: 10.5, color: '#94a3b8', display: 'block', marginBottom: 2 }}>ID Number (পরিচয়পত্র নম্বর)</label>
                      <input
                        type="text"
                        value={ticket.idNumber}
                        onChange={e => setTicket({
                          ...ticket,
                          idNumber: e.target.value,
                          idNumberBn: toBanglaDigits(e.target.value)
                        })}
                        placeholder="376****183"
                        style={{ width: '100%', padding: '6px 8px', background: '#1e293b', border: '1px solid #334155', borderRadius: 6, color: '#fff', fontSize: 12, boxSizing: 'border-box' }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    <div>
                      <label style={{ fontSize: 10.5, color: '#94a3b8', display: 'block', marginBottom: 2 }}>Mobile Number (মোবাইল নম্বর)</label>
                      <input
                        type="text"
                        value={ticket.mobileNumber}
                        onChange={e => setTicket({
                          ...ticket,
                          mobileNumber: e.target.value,
                          mobileNumberBn: toBanglaDigits(e.target.value)
                        })}
                        placeholder="017*****000"
                        style={{ width: '100%', padding: '6px 8px', background: '#1e293b', border: '1px solid #334155', borderRadius: 6, color: '#fff', fontSize: 12, boxSizing: 'border-box' }}
                      />
                    </div>

                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
                        <label style={{ fontSize: 10.5, color: '#94a3b8' }}>PNR Number</label>
                        <button
                          onClick={generateRandomPnr}
                          style={{ background: 'none', border: 'none', color: '#10b981', fontSize: 10, cursor: 'pointer', padding: 0 }}
                        >
                          Generate
                        </button>
                      </div>
                      <input
                        type="text"
                        value={ticket.pnrNumber}
                        onChange={e => setTicket({ ...ticket, pnrNumber: e.target.value.toUpperCase() })}
                        placeholder="6ABA16FCEEBCA"
                        style={{ width: '100%', padding: '6px 8px', background: '#1e293b', border: '1px solid #334155', borderRadius: 6, color: '#fff', fontSize: 12, boxSizing: 'border-box', fontFamily: 'monospace' }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Passengers Count & Fares ── */}
              <div style={{ background: '#131e32', border: '1px solid #1e293b', borderRadius: 8, padding: 12 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#e2e8f0', display: 'block', marginBottom: 8 }}>
                  Fares & Passenger Counts (ভাড়া ও যাত্রী সংখ্যা)
                </span>
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: 6, marginBottom: 8 }}>
                  <div>
                    <label style={{ fontSize: 10, color: '#94a3b8', display: 'block', marginBottom: 2 }}>Seats (মোট)</label>
                    <input
                      type="number"
                      min={1}
                      value={ticket.numSeats}
                      onChange={e => setTicket({ ...ticket, numSeats: parseInt(e.target.value) || 1 })}
                      style={{ width: '100%', padding: '6px 8px', background: '#1e293b', border: '1px solid #334155', borderRadius: 6, color: '#fff', fontSize: 12, boxSizing: 'border-box' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 10, color: '#94a3b8', display: 'block', marginBottom: 2 }}>Adult (প্রাপ্ত)</label>
                    <input
                      type="number"
                      min={0}
                      value={ticket.numAdults}
                      onChange={e => setTicket({ ...ticket, numAdults: parseInt(e.target.value) || 0 })}
                      style={{ width: '100%', padding: '6px 8px', background: '#1e293b', border: '1px solid #334155', borderRadius: 6, color: '#fff', fontSize: 12, boxSizing: 'border-box' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 10, color: '#94a3b8', display: 'block', marginBottom: 2 }}>Senior (প্রবীণ)</label>
                    <input
                      type="number"
                      min={0}
                      value={ticket.numSeniors}
                      onChange={e => setTicket({ ...ticket, numSeniors: parseInt(e.target.value) || 0 })}
                      style={{ width: '100%', padding: '6px 8px', background: '#1e293b', border: '1px solid #334155', borderRadius: 6, color: '#fff', fontSize: 12, boxSizing: 'border-box' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 10, color: '#94a3b8', display: 'block', marginBottom: 2 }}>Child (শিশু)</label>
                    <input
                      type="number"
                      min={0}
                      value={ticket.numChildren}
                      onChange={e => setTicket({ ...ticket, numChildren: parseInt(e.target.value) || 0 })}
                      style={{ width: '100%', padding: '6px 8px', background: '#1e293b', border: '1px solid #334155', borderRadius: 6, color: '#fff', fontSize: 12, boxSizing: 'border-box' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
                  <div>
                    <label style={{ fontSize: 10, color: '#94a3b8', display: 'block', marginBottom: 2 }}>Fare (ভাড়া)</label>
                    <input
                      type="number"
                      value={ticket.fare}
                      onChange={e => setTicket({ ...ticket, fare: parseFloat(e.target.value) || 0 })}
                      style={{ width: '100%', padding: '6px 8px', background: '#1e293b', border: '1px solid #334155', borderRadius: 6, color: '#fff', fontSize: 12, boxSizing: 'border-box' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 10, color: '#94a3b8', display: 'block', marginBottom: 2 }}>Service (চার্জ)</label>
                    <input
                      type="number"
                      value={ticket.serviceCharge}
                      onChange={e => setTicket({ ...ticket, serviceCharge: parseFloat(e.target.value) || 0 })}
                      style={{ width: '100%', padding: '6px 8px', background: '#1e293b', border: '1px solid #334155', borderRadius: 6, color: '#fff', fontSize: 12, boxSizing: 'border-box' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 10, color: '#94a3b8', display: 'block', marginBottom: 2 }}>VAT (ভ্যাট)</label>
                    <input
                      type="number"
                      value={ticket.vat}
                      onChange={e => setTicket({ ...ticket, vat: parseFloat(e.target.value) || 0 })}
                      style={{ width: '100%', padding: '6px 8px', background: '#1e293b', border: '1px solid #334155', borderRadius: 6, color: '#fff', fontSize: 12, boxSizing: 'border-box' }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Saved Tickets History list */}
            <div style={{ marginTop: 20, paddingTop: 12, borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <div style={{ fontSize: 11.5, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: 8 }}>
                Saved Tickets History ({savedTickets.length})
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {savedTickets.map(item => (
                  <div
                    key={item.id}
                    onClick={() => setTicket(item)}
                    style={{
                      background: item.id === ticket.id ? '#1e293b' : 'rgba(255, 255, 255, 0.03)',
                      border: `1px solid ${item.id === ticket.id ? '#039d48' : 'rgba(255, 255, 255, 0.06)'}`,
                      borderRadius: 6,
                      padding: '7px 10px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div>
                      <div style={{ fontSize: 11.5, fontWeight: 700, color: '#fff' }}>
                        {item.trainName} • {item.fromStation} → {item.toStation}
                      </div>
                      <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 1 }}>
                        {item.passengerName} • PNR: {item.pnrNumber}
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteTicket(item.id);
                      }}
                      style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: 4 }}
                      title="Delete"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Right Preview: Live A4 Bangladesh Railway Ticket View (Exact official HTML/SVG system match) */}
        {(!isMobile || mobileTab === 'preview') && (
          <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            background: '#040711',
            overflowY: 'auto',
            overflowX: 'auto',
            height: '100%',
            position: 'relative'
          }}>
            {/* Zoom & Quick Controls Bar */}
            <div className="no-print" style={{
              position: 'sticky',
              top: 0,
              zIndex: 30,
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '6px 12px',
              background: 'rgba(15, 23, 42, 0.94)',
              backdropFilter: 'blur(10px)',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              boxSizing: 'border-box'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <button
                  onClick={zoomOut}
                  style={{
                    background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
                    color: '#cbd5e1', borderRadius: 6, width: 28, height: 28, display: 'flex',
                    alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
                  }}
                  title="Zoom Out"
                >
                  <ZoomOut size={14} />
                </button>
                <span style={{ fontSize: 11, color: '#94a3b8', minWidth: 36, textAlign: 'center', fontWeight: 600 }}>
                  {Math.round(previewScale * 100)}%
                </span>
                <button
                  onClick={zoomIn}
                  style={{
                    background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
                    color: '#cbd5e1', borderRadius: 6, width: 28, height: 28, display: 'flex',
                    alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
                  }}
                  title="Zoom In"
                >
                  <ZoomIn size={14} />
                </button>
                <button
                  onClick={fitToScreen}
                  style={{
                    background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
                    color: '#cbd5e1', borderRadius: 6, padding: '4px 8px', fontSize: 11, fontWeight: 600, cursor: 'pointer'
                  }}
                  title="Fit to Screen"
                >
                  Fit
                </button>
                <button
                  onClick={resetZoom}
                  style={{
                    background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
                    color: '#cbd5e1', borderRadius: 6, padding: '4px 8px', fontSize: 11, fontWeight: 600, cursor: 'pointer'
                  }}
                  title="100% Size"
                >
                  100%
                </button>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <button
                  onClick={handleDownloadPdf}
                  disabled={isGeneratingPdf}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 5,
                    background: 'linear-gradient(135deg, #039d48 0%, #05b454 100%)',
                    color: '#fff', border: 'none', padding: '5px 12px', borderRadius: 6,
                    fontSize: 11.5, fontWeight: 700, cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(3, 157, 72, 0.4)'
                  }}
                >
                  <Download size={13} /> {isGeneratingPdf ? '...' : 'PDF'}
                </button>
                <button
                  onClick={() => window.print()}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 5,
                    background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)',
                    color: '#fff', padding: '5px 9px', borderRadius: 6,
                    fontSize: 11.5, cursor: 'pointer'
                  }}
                  title="Print"
                >
                  <Printer size={13} />
                </button>
              </div>
            </div>

            {/* Scaled Preview Wrapper */}
            <div style={{
              padding: isMobile ? '16px 8px 110px' : '24px 24px 60px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'flex-start',
              width: '100%',
              boxSizing: 'border-box'
            }}>
              <div style={{
                width: `${Math.round(793.7 * previewScale)}px`,
                height: `${Math.round(1122.5 * previewScale)}px`,
                position: 'relative',
                flexShrink: 0,
                boxShadow: '0 20px 50px rgba(0,0,0,0.85)',
                borderRadius: 4,
                background: '#ffffff',
                overflow: 'hidden'
              }}>
                {/* 1:1 Exact Official Bangladesh Railway Ticket Board */}
                <div
                  id="page"
                  ref={ticketRef}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '595.28pt',
                    height: '841.89pt',
                    background: '#ffffff',
                    overflow: 'hidden',
                    userSelect: 'none',
                    transform: `scale(${previewScale})`,
                    transformOrigin: 'top left',
                  }}
                >
              {/* Green Outer Frame */}
              <div
                id="frame"
                style={{
                  position: 'absolute',
                  left: '42.5pt',
                  top: '45.4pt',
                  width: '510.3pt',
                  height: '735pt',
                  boxSizing: 'border-box',
                  border: '3.6pt solid #039d48',
                  background: '#ffffff',
                }}
              />

              {/* Exact Official SVG Canvas Layer */}
              <svg
                style={{ position: 'absolute', left: 0, top: 0, pointerEvents: 'none' }}
                width="595.28pt"
                height="841.89pt"
                viewBox="0 0 595.28 841.89"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Table Header Banners & Highlight Boxes */}
                <rect x="57.895" y="169.123" width="479.491" height="22.461" fill="#039d48" />
                <rect x="57.895" y="411.371" width="479.491" height="22.461" fill="#039d48" />
                <rect x="57.520" y="602.113" width="480.241" height="43.200" fill="#e8f5e9" />
                <rect x="57.520" y="650.188" width="480.241" height="24.600" fill="#fdebd3" />

                {/* Table 1: Outer & Inner Grid Lines */}
                <line x1="57.895" y1="169.123" x2="57.895" y2="191.209" stroke="#05b454" strokeWidth="0.750" />
                <line x1="537.385" y1="169.123" x2="537.385" y2="191.209" stroke="#05b454" strokeWidth="0.750" />
                <line x1="57.895" y1="169.123" x2="537.385" y2="169.123" stroke="#05b454" strokeWidth="0.750" />

                <line x1="57.895" y1="191.584" x2="57.895" y2="204.450" stroke="#05b454" strokeWidth="0.750" />
                <line x1="297.640" y1="191.584" x2="297.640" y2="204.450" stroke="#999999" strokeWidth="0.750" />
                <line x1="57.895" y1="191.584" x2="297.640" y2="191.584" stroke="#999999" strokeWidth="0.750" />

                <line x1="57.895" y1="204.450" x2="57.895" y2="217.317" stroke="#05b454" strokeWidth="0.750" />
                <line x1="297.640" y1="204.450" x2="297.640" y2="217.317" stroke="#999999" strokeWidth="0.750" />
                <line x1="57.895" y1="204.450" x2="297.640" y2="204.450" stroke="#999999" strokeWidth="0.750" />

                <line x1="57.895" y1="217.317" x2="57.895" y2="230.183" stroke="#05b454" strokeWidth="0.750" />
                <line x1="297.640" y1="217.317" x2="297.640" y2="230.183" stroke="#999999" strokeWidth="0.750" />
                <line x1="57.895" y1="217.317" x2="297.640" y2="217.317" stroke="#999999" strokeWidth="0.750" />

                <line x1="57.895" y1="230.183" x2="57.895" y2="243.049" stroke="#05b454" strokeWidth="0.750" />
                <line x1="297.640" y1="230.183" x2="297.640" y2="243.049" stroke="#999999" strokeWidth="0.750" />
                <line x1="57.895" y1="230.183" x2="297.640" y2="230.183" stroke="#999999" strokeWidth="0.750" />

                <line x1="57.895" y1="243.049" x2="57.895" y2="255.915" stroke="#05b454" strokeWidth="0.750" />
                <line x1="297.640" y1="243.049" x2="297.640" y2="255.915" stroke="#999999" strokeWidth="0.750" />
                <line x1="57.895" y1="243.049" x2="297.640" y2="243.049" stroke="#999999" strokeWidth="0.750" />

                <line x1="57.895" y1="255.915" x2="57.895" y2="268.782" stroke="#05b454" strokeWidth="0.750" />
                <line x1="297.640" y1="255.915" x2="297.640" y2="268.782" stroke="#999999" strokeWidth="0.750" />
                <line x1="57.895" y1="255.915" x2="297.640" y2="255.915" stroke="#999999" strokeWidth="0.750" />

                <line x1="57.895" y1="268.782" x2="57.895" y2="281.648" stroke="#05b454" strokeWidth="0.750" />
                <line x1="297.640" y1="268.782" x2="297.640" y2="281.648" stroke="#999999" strokeWidth="0.750" />
                <line x1="57.895" y1="268.782" x2="297.640" y2="268.782" stroke="#999999" strokeWidth="0.750" />

                <line x1="57.895" y1="281.648" x2="57.895" y2="294.514" stroke="#05b454" strokeWidth="0.750" />
                <line x1="297.640" y1="281.648" x2="297.640" y2="294.514" stroke="#999999" strokeWidth="0.750" />
                <line x1="57.895" y1="281.648" x2="297.640" y2="281.648" stroke="#999999" strokeWidth="0.750" />

                <line x1="57.895" y1="294.514" x2="57.895" y2="307.380" stroke="#05b454" strokeWidth="0.750" />
                <line x1="297.640" y1="294.514" x2="297.640" y2="307.380" stroke="#999999" strokeWidth="0.750" />
                <line x1="57.895" y1="294.514" x2="297.640" y2="294.514" stroke="#999999" strokeWidth="0.750" />

                <line x1="57.895" y1="307.380" x2="57.895" y2="320.247" stroke="#05b454" strokeWidth="0.750" />
                <line x1="297.640" y1="307.380" x2="297.640" y2="320.247" stroke="#999999" strokeWidth="0.750" />
                <line x1="57.895" y1="307.380" x2="297.640" y2="307.380" stroke="#999999" strokeWidth="0.750"/>

                <line x1="57.895" y1="320.247" x2="57.895" y2="333.113" stroke="#05b454" strokeWidth="0.750" />
                <line x1="297.640" y1="320.247" x2="297.640" y2="333.113" stroke="#999999" strokeWidth="0.750" />
                <line x1="57.895" y1="320.247" x2="297.640" y2="320.247" stroke="#999999" strokeWidth="0.750" />

                <line x1="57.895" y1="333.113" x2="57.895" y2="345.979" stroke="#05b454" strokeWidth="0.750" />
                <line x1="297.640" y1="333.113" x2="297.640" y2="345.979" stroke="#999999" strokeWidth="0.750" />
                <line x1="57.895" y1="333.113" x2="297.640" y2="333.113" stroke="#999999" strokeWidth="0.750" />

                <line x1="57.895" y1="345.979" x2="57.895" y2="358.845" stroke="#05b454" strokeWidth="0.750" />
                <line x1="297.640" y1="345.979" x2="297.640" y2="358.845" stroke="#999999" strokeWidth="0.750" />
                <line x1="57.895" y1="345.979" x2="297.640" y2="345.979" stroke="#999999" strokeWidth="0.750" />

                <line x1="57.895" y1="358.845" x2="57.895" y2="371.712" stroke="#05b454" strokeWidth="0.750" />
                <line x1="297.640" y1="358.845" x2="297.640" y2="371.712" stroke="#999999" strokeWidth="0.750" />
                <line x1="57.895" y1="358.845" x2="297.640" y2="358.845" stroke="#999999" strokeWidth="0.750" />

                <line x1="57.895" y1="371.712" x2="57.895" y2="384.578" stroke="#05b454" strokeWidth="0.750" />
                <line x1="297.640" y1="371.712" x2="297.640" y2="384.578" stroke="#999999" strokeWidth="0.750" />
                <line x1="57.895" y1="371.712" x2="297.640" y2="371.712" stroke="#999999" strokeWidth="0.750" />

                <line x1="57.895" y1="384.578" x2="57.895" y2="395.621" stroke="#05b454" strokeWidth="0.750" />
                <line x1="57.895" y1="395.621" x2="537.385" y2="395.621" stroke="#05b454" strokeWidth="0.750" />
                <line x1="537.385" y1="384.578" x2="537.385" y2="395.621" stroke="#999999" strokeWidth="0.750" />
                <line x1="57.895" y1="384.578" x2="537.385" y2="384.578" stroke="#999999" strokeWidth="0.750" />

                {/* Table 1: Right Column Lines */}
                <line x1="537.385" y1="191.584" x2="537.385" y2="204.450" stroke="#05b454" strokeWidth="0.750" />
                <line x1="297.640" y1="191.584" x2="537.385" y2="191.584" stroke="#999999" strokeWidth="0.750" />
                <line x1="537.385" y1="204.450" x2="537.385" y2="217.317" stroke="#05b454" strokeWidth="0.750" />
                <line x1="297.640" y1="204.450" x2="537.385" y2="204.450" stroke="#999999" strokeWidth="0.750" />
                <line x1="537.385" y1="217.317" x2="537.385" y2="230.183" stroke="#05b454" strokeWidth="0.750" />
                <line x1="297.640" y1="217.317" x2="537.385" y2="217.317" stroke="#999999" strokeWidth="0.750" />
                <line x1="537.385" y1="230.183" x2="537.385" y2="243.049" stroke="#05b454" strokeWidth="0.750" />
                <line x1="297.640" y1="230.183" x2="537.385" y2="230.183" stroke="#999999" strokeWidth="0.750" />
                <line x1="537.385" y1="243.049" x2="537.385" y2="255.915" stroke="#05b454" strokeWidth="0.750" />
                <line x1="297.640" y1="243.049" x2="537.385" y2="243.049" stroke="#999999" strokeWidth="0.750" />
                <line x1="537.385" y1="255.915" x2="537.385" y2="268.782" stroke="#05b454" strokeWidth="0.750" />
                <line x1="297.640" y1="255.915" x2="537.385" y2="255.915" stroke="#999999" strokeWidth="0.750" />
                <line x1="537.385" y1="268.782" x2="537.385" y2="281.648" stroke="#05b454" strokeWidth="0.750" />
                <line x1="297.640" y1="268.782" x2="537.385" y2="268.782" stroke="#999999" strokeWidth="0.750" />
                <line x1="537.385" y1="281.648" x2="537.385" y2="294.514" stroke="#05b454" strokeWidth="0.750" />
                <line x1="297.640" y1="281.648" x2="537.385" y2="281.648" stroke="#999999" strokeWidth="0.750" />
                <line x1="537.385" y1="294.514" x2="537.385" y2="307.380" stroke="#05b454" strokeWidth="0.750" />
                <line x1="297.640" y1="294.514" x2="537.385" y2="294.514" stroke="#999999" strokeWidth="0.750" />
                <line x1="537.385" y1="307.380" x2="537.385" y2="320.247" stroke="#05b454" strokeWidth="0.750" />
                <line x1="297.640" y1="307.380" x2="537.385" y2="307.380" stroke="#999999" strokeWidth="0.750" />
                <line x1="537.385" y1="320.247" x2="537.385" y2="333.113" stroke="#05b454" strokeWidth="0.750" />
                <line x1="297.640" y1="320.247" x2="537.385" y2="320.247" stroke="#999999" strokeWidth="0.750" />
                <line x1="537.385" y1="333.113" x2="537.385" y2="345.979" stroke="#05b454" strokeWidth="0.750" />
                <line x1="297.640" y1="333.113" x2="537.385" y2="333.113" stroke="#999999" strokeWidth="0.750" />
                <line x1="537.385" y1="345.979" x2="537.385" y2="358.845" stroke="#05b454" strokeWidth="0.750" />
                <line x1="297.640" y1="345.979" x2="537.385" y2="345.979" stroke="#999999" strokeWidth="0.750" />
                <line x1="537.385" y1="358.845" x2="537.385" y2="371.712" stroke="#05b454" strokeWidth="0.750" />
                <line x1="297.640" y1="358.845" x2="537.385" y2="358.845" stroke="#999999" strokeWidth="0.750" />
                <line x1="537.385" y1="371.712" x2="537.385" y2="384.203" stroke="#05b454" strokeWidth="0.750" />
                <line x1="297.640" y1="371.712" x2="537.385" y2="371.712" stroke="#999999" strokeWidth="0.750" />

                {/* Table 2: Passenger Information Grid Lines */}
                <line x1="57.895" y1="411.371" x2="57.895" y2="433.457" stroke="#05b454" strokeWidth="0.750" />
                <line x1="537.385" y1="411.371" x2="537.385" y2="433.457" stroke="#05b454" strokeWidth="0.750" />
                <line x1="57.895" y1="411.371" x2="537.385" y2="411.371" stroke="#05b454" strokeWidth="0.750" />

                <line x1="57.895" y1="433.832" x2="57.895" y2="446.698" stroke="#05b454" strokeWidth="0.750" />
                <line x1="297.640" y1="433.832" x2="297.640" y2="446.698" stroke="#999999" strokeWidth="0.750" />
                <line x1="57.895" y1="433.832" x2="297.640" y2="433.832" stroke="#999999" strokeWidth="0.750" />

                <line x1="57.895" y1="446.698" x2="57.895" y2="459.564" stroke="#05b454" strokeWidth="0.750" />
                <line x1="297.640" y1="446.698" x2="297.640" y2="459.564" stroke="#999999" strokeWidth="0.750" />
                <line x1="57.895" y1="446.698" x2="297.640" y2="446.698" stroke="#999999" strokeWidth="0.750" />

                <line x1="57.895" y1="459.564" x2="57.895" y2="472.431" stroke="#05b454" strokeWidth="0.750" />
                <line x1="297.640" y1="459.564" x2="297.640" y2="472.431" stroke="#999999" strokeWidth="0.750" />
                <line x1="57.895" y1="459.564" x2="297.640" y2="459.564" stroke="#999999" strokeWidth="0.750" />

                <line x1="57.895" y1="472.431" x2="57.895" y2="485.297" stroke="#05b454" strokeWidth="0.750" />
                <line x1="297.640" y1="472.431" x2="297.640" y2="485.297" stroke="#999999" strokeWidth="0.750" />
                <line x1="57.895" y1="472.431" x2="297.640" y2="472.431" stroke="#999999" strokeWidth="0.750" />

                <line x1="57.895" y1="485.297" x2="57.895" y2="498.163" stroke="#05b454" strokeWidth="0.750" />
                <line x1="57.895" y1="498.163" x2="297.640" y2="498.163" stroke="#05b454" strokeWidth="0.750" />
                <line x1="297.640" y1="485.297" x2="297.640" y2="498.163" stroke="#999999" strokeWidth="0.750" />
                <line x1="57.895" y1="485.297" x2="297.640" y2="485.297" stroke="#999999" strokeWidth="0.750" />

                <line x1="537.385" y1="433.832" x2="537.385" y2="446.698" stroke="#05b454" strokeWidth="0.750" />
                <line x1="297.640" y1="433.832" x2="537.385" y2="433.832" stroke="#999999" strokeWidth="0.750" />
                <line x1="537.385" y1="446.698" x2="537.385" y2="459.564" stroke="#05b454" strokeWidth="0.750" />
                <line x1="297.640" y1="446.698" x2="537.385" y2="446.698" stroke="#999999" strokeWidth="0.750" />
                <line x1="537.385" y1="459.564" x2="537.385" y2="472.431" stroke="#05b454" strokeWidth="0.750" />
                <line x1="297.640" y1="459.564" x2="537.385" y2="459.564" stroke="#999999" strokeWidth="0.750" />
                <line x1="537.385" y1="472.431" x2="537.385" y2="485.297" stroke="#05b454" strokeWidth="0.750" />
                <line x1="297.640" y1="472.431" x2="537.385" y2="472.431" stroke="#999999" strokeWidth="0.750" />
                <line x1="297.640" y1="498.163" x2="537.385" y2="498.163" stroke="#05b454" strokeWidth="0.750" />
                <line x1="537.385" y1="485.297" x2="537.385" y2="498.163" stroke="#05b454" strokeWidth="0.750" />
                <line x1="297.640" y1="485.297" x2="537.385" y2="485.297" stroke="#999999" strokeWidth="0.750" />

                {/* Outer Frame Edge Accents */}
                <line x1="42.520" y1="47.229" x2="552.760" y2="47.229" stroke="#039d48" strokeWidth="3.750" />
                <line x1="42.520" y1="778.479" x2="552.760" y2="778.479" stroke="#039d48" strokeWidth="3.750" />
                <line x1="44.395" y1="45.354" x2="44.395" y2="780.354" stroke="#039d48" strokeWidth="3.750" />
                <line x1="550.885" y1="45.354" x2="550.885" y2="780.354" stroke="#039d48" strokeWidth="3.750" />
              </svg>

              {/* Official Bangladesh Railway Crest */}
              <img
                alt="Bangladesh Railway"
                style={{
                  position: 'absolute',
                  left: '57.5pt',
                  top: '60.4pt',
                  width: '45pt',
                  height: '45pt',
                  objectFit: 'contain',
                  display: 'block'
                }}
                src="/20428_4-78474535-icon.png"
              />

              {/* Official Powered By Shohoz Synesis Vincen JV Branding Block */}
              <ShohozLogo
                style={{
                  position: 'absolute',
                  left: '477.7pt',
                  top: '64.1pt',
                  width: '52.5pt',
                  height: '37.6pt',
                }}
              />

              {/* Dynamic QR Code */}
              {qrDataUrl && (
                <img
                  src={qrDataUrl}
                  alt="QR Code"
                  style={{
                    position: 'absolute',
                    left: '477.7pt',
                    top: '105.4pt',
                    width: '58.3pt',
                    height: '58.3pt',
                    display: 'block'
                  }}
                />
              )}

              {/* ─── EXACT POSITIONED TEXT SPANS (Points coordinate engine) ─── */}
              {/* Header Titles */}
              <span className="ticket-span ticket-r" style={{ left: '212.218pt', top: '63.723pt', fontSize: '15.00pt', color: '#1f7ec7', WebkitTextStroke: '0.500pt #1f7ec7' }}>
                BANGLADESH RAILWAY
              </span>
              <span className="ticket-span ticket-s" style={{ left: '242.293pt', top: '82.633pt', fontSize: '15.00pt', color: '#1f7ec7' }}>
                বাংলাদেশ রেলওয়ে
              </span>

              {/* Greeting & Introductory Confirmation */}
              <span className="ticket-span ticket-r" style={{ left: '57.270pt', top: '103.937pt', fontSize: '7.50pt', color: '#333333' }}>
                Dear {ticket.passengerName},
              </span>
              <span className="ticket-span ticket-r" style={{ left: '57.520pt', top: '112.937pt', fontSize: '7.50pt', color: '#333333' }}>
                Your request to book e-ticket for your journey in Bangladesh Railway was successful. You can travel on the train mentioned in
              </span>
              <span className="ticket-span ticket-r" style={{ left: '57.520pt', top: '121.937pt', fontSize: '7.50pt', color: '#333333' }}>
                the ticket subject to showing your NID or Photo ID card. The details of your e-ticket are as below:
              </span>
              <span className="ticket-span ticket-s" style={{ left: '57.520pt', top: '139.141pt', fontSize: '7.50pt', color: '#333333' }}>
                বাংলাদেশ রেলওয়েতে ভ্রমণের জন্য আপনার চাহিত ই-টিকিট সফলভাবে প্রদান করা হয়েছে। আপনার এনআইডি কিংবা ছবি সম্বলিত আইডি দেখানো সাপেক্ষে
              </span>
              <span className="ticket-span ticket-s" style={{ left: '57.270pt', top: '148.141pt', fontSize: '7.50pt', color: '#333333' }}>
                আপনি টিকিটে বর্ণিত ট্রেনে যাত্রা করতে পারবেন। ই-টিকিটের বিস্তারিত নিম্নে দেয়া হল:-
              </span>

              {/* Table 1: Journey Information Banner */}
              <span className="ticket-span ticket-r" style={{ left: '62.020pt', top: '170.998pt', fontSize: '12.00pt', color: '#ffffff', WebkitTextStroke: '0.400pt #ffffff' }}>
                Journey Information{' '}
              </span>
              <span className="ticket-span ticket-s" style={{ left: '173.056pt', top: '171.086pt', fontSize: '12.00pt', color: '#ffffff', WebkitTextStroke: '0.400pt #ffffff' }}>
                (যাত্রার তথ্য)
              </span>

              {/* Row 1: Issue Date */}
              <span className="ticket-span ticket-r" style={{ left: '61.770pt', top: '189.287pt', fontSize: '7.50pt', color: '#333333' }}>
                Issue Date &amp; Time{' '}
              </span>
              <span className="ticket-span ticket-s" style={{ left: '124.035pt', top: '188.591pt', fontSize: '7.50pt', color: '#333333' }}>
                (প্রদানের তারিখ ও সময়)
              </span>
              <span className="ticket-span ticket-r" style={{ left: '301.765pt', top: '189.287pt', fontSize: '7.50pt', color: '#333333' }}>
                {formatDateEn(ticket.issueDate, ticket.issueTime)}{' '}
              </span>
              <span className="ticket-span ticket-s" style={{ left: '361.770pt', top: '188.591pt', fontSize: '7.50pt', color: '#333333' }}>
                ({formatDateBn(ticket.issueDate, ticket.issueTime)})
              </span>

              {/* Row 2: Journey Date */}
              <span className="ticket-span ticket-r" style={{ left: '61.770pt', top: '202.087pt', fontSize: '7.50pt', color: '#333333' }}>
                Journey Date &amp; Time{' '}
              </span>
              <span className="ticket-span ticket-s" style={{ left: '132.892pt', top: '201.391pt', fontSize: '7.50pt', color: '#333333' }}>
                (যাত্রার তারিখ ও সময়)
              </span>
              <span className="ticket-span ticket-r" style={{ left: '301.765pt', top: '202.087pt', fontSize: '7.50pt', color: '#333333' }}>
                {formatDateEn(ticket.journeyDate, ticket.journeyTime)}{' '}
              </span>
              <span className="ticket-span ticket-s" style={{ left: '361.770pt', top: '201.391pt', fontSize: '7.50pt', color: '#333333' }}>
                ({formatDateBn(ticket.journeyDate, ticket.journeyTime)})
              </span>

              {/* Row 3: Train Name & Number */}
              <span className="ticket-span ticket-r" style={{ left: '61.770pt', top: '214.737pt', fontSize: '7.50pt', color: '#333333' }}>
                Train Name &amp; Number{' '}
              </span>
              <span className="ticket-span ticket-s" style={{ left: '137.670pt', top: '214.041pt', fontSize: '7.50pt', color: '#333333' }}>
                (ট্রেন নম্বর ও নাম)
              </span>
              <span className="ticket-span ticket-r" style={{ left: '301.515pt', top: '214.737pt', fontSize: '7.50pt', color: '#333333' }}>
                {ticket.trainName} [{ticket.trainNumber}]{' '}
              </span>
              <span className="ticket-span ticket-s" style={{ left: '381.442pt', top: '214.041pt', fontSize: '7.50pt', color: '#333333' }}>
                ({ticket.trainNameBn} [{toBanglaDigits(ticket.trainNumber)}])
              </span>

              {/* Row 4: From Station */}
              <span className="ticket-span ticket-r" style={{ left: '61.770pt', top: '227.637pt', fontSize: '7.50pt', color: '#333333' }}>
                From Station{' '}
              </span>
              <span className="ticket-span ticket-s" style={{ left: '106.687pt', top: '226.941pt', fontSize: '7.50pt', color: '#333333' }}>
                (প্রারম্ভিক স্টেশন)
              </span>
              <span className="ticket-span ticket-r" style={{ left: '301.515pt', top: '227.637pt', fontSize: '7.50pt', color: '#333333' }}>
                {ticket.fromStation}{' '}
              </span>
              <span className="ticket-span ticket-s" style={{ left: '324.390pt', top: '226.941pt', fontSize: '7.50pt', color: '#333333' }}>
                ({ticket.fromStationBn || getStationBanglaName(ticket.fromStation)})
              </span>

              {/* Row 5: To Station */}
              <span className="ticket-span ticket-r" style={{ left: '61.770pt', top: '240.937pt', fontSize: '7.50pt', color: '#333333' }}>
                To Station{' '}
              </span>
              <span className="ticket-span ticket-s" style={{ left: '97.912pt', top: '240.241pt', fontSize: '7.50pt', color: '#333333' }}>
                (গন্তব্য স্টেশন)
              </span>
              <span className="ticket-span ticket-r" style={{ left: '301.515pt', top: '240.937pt', fontSize: '7.50pt', color: '#333333' }}>
                {ticket.toStation}{' '}
              </span>
              <span className="ticket-span ticket-s" style={{ left: '340.035pt', top: '240.241pt', fontSize: '7.50pt', color: '#333333' }}>
                ({ticket.toStationBn || getStationBanglaName(ticket.toStation)})
              </span>

              {/* Row 6: Class Name */}
              <span className="ticket-span ticket-r" style={{ left: '61.770pt', top: '253.837pt', fontSize: '7.50pt', color: '#333333' }}>
                Class Name{' '}
              </span>
              <span className="ticket-span ticket-s" style={{ left: '103.987pt', top: '252.391pt', fontSize: '7.50pt', color: '#333333' }}>
                (শ্রেণির নাম)
              </span>
              <span className="ticket-span ticket-r" style={{ left: '301.515pt', top: '253.837pt', fontSize: '7.50pt', color: '#333333' }}>
                {ticket.className}{' '}
              </span>
              <span className="ticket-span ticket-s" style={{ left: '332.985pt', top: '252.391pt', fontSize: '7.50pt', color: '#333333' }}>
                ({ticket.classNameBn})
              </span>

              {/* Row 7: Coach Name / Seat(s) */}
              <span className="ticket-span ticket-r" style={{ left: '61.770pt', top: '266.487pt', fontSize: '7.50pt', color: '#333333' }}>
                Coach Name / Seat(s){' '}
              </span>
              <span className="ticket-span ticket-s" style={{ left: '137.565pt', top: '265.791pt', fontSize: '7.50pt', color: '#333333' }}>
                (কোচের নাম / আসন)
              </span>
              <span className="ticket-span ticket-r" style={{ left: '301.515pt', top: '266.487pt', fontSize: '7.50pt', color: '#333333' }}>
                {ticket.coachSeat}{' '}
              </span>
              <span className="ticket-span ticket-s" style={{ left: '323.242pt', top: '265.791pt', fontSize: '7.50pt', color: '#333333' }}>
                {' '}({ticket.coachSeatBn || toBanglaDigits(ticket.coachSeat)})
              </span>

              {/* Row 8: No. of Seats */}
              <span className="ticket-span ticket-r" style={{ left: '61.770pt', top: '279.287pt', fontSize: '7.50pt', color: '#333333' }}>
                No. of Seats{' '}
              </span>
              <span className="ticket-span ticket-s" style={{ left: '104.647pt', top: '278.591pt', fontSize: '7.50pt', color: '#333333' }}>
                (আসন সংখ্যা)
              </span>
              <span className="ticket-span ticket-r" style={{ left: '301.515pt', top: '279.287pt', fontSize: '7.50pt', color: '#333333' }}>
                {ticket.numSeats}{' '}
              </span>
              <span className="ticket-span ticket-s" style={{ left: '307.590pt', top: '278.591pt', fontSize: '7.50pt', color: '#333333' }}>
                ({toBanglaDigits(ticket.numSeats)})
              </span>

              {/* Row 9: No. of Adult Passenger(s) */}
              <span className="ticket-span ticket-r" style={{ left: '61.770pt', top: '291.937pt', fontSize: '7.50pt', color: '#333333' }}>
                No. of Adult Passenger(s){' '}
              </span>
              <span className="ticket-span ticket-s" style={{ left: '149.640pt', top: '291.241pt', fontSize: '7.50pt', color: '#333333' }}>
                (প্রাপ্তবয়স্ক যাত্রীর সংখ্যা)
              </span>
              <span className="ticket-span ticket-r" style={{ left: '301.515pt', top: '291.937pt', fontSize: '7.50pt', color: '#333333' }}>
                {ticket.numAdults}{' '}
              </span>
              <span className="ticket-span ticket-s" style={{ left: '307.590pt', top: '291.241pt', fontSize: '7.50pt', color: '#333333' }}>
                ({toBanglaDigits(ticket.numAdults)})
              </span>

              {/* Row 10: No. of Senior Citizen Passenger(s) */}
              <span className="ticket-span ticket-r" style={{ left: '62.020pt', top: '304.837pt', fontSize: '7.50pt', color: '#333333' }}>
                No. of Senior Citizen Passenger(s){' '}
              </span>
              <span className="ticket-span ticket-s" style={{ left: '177.982pt', top: '304.141pt', fontSize: '7.50pt', color: '#333333' }}>
                (প্রবীণ যাত্রীর সংখ্যা)
              </span>
              <span className="ticket-span ticket-r" style={{ left: '301.515pt', top: '304.837pt', fontSize: '7.50pt', color: '#333333' }}>
                {ticket.numSeniors}{' '}
              </span>
              <span className="ticket-span ticket-s" style={{ left: '307.590pt', top: '304.141pt', fontSize: '7.50pt', color: '#333333' }}>
                ({toBanglaDigits(ticket.numSeniors)})
              </span>

              {/* Row 11: No. of Child Passenger(s) */}
              <span className="ticket-span ticket-r" style={{ left: '61.770pt', top: '317.637pt', fontSize: '7.50pt', color: '#333333' }}>
                No. of Child Passenger(s){' '}
              </span>
              <span className="ticket-span ticket-s" style={{ left: '149.002pt', top: '316.941pt', fontSize: '7.50pt', color: '#333333' }}>
                (শিশু যাত্রীর সংখ্যা)
              </span>
              <span className="ticket-span ticket-r" style={{ left: '301.515pt', top: '317.637pt', fontSize: '7.50pt', color: '#333333' }}>
                {ticket.numChildren}{' '}
              </span>
              <span className="ticket-span ticket-s" style={{ left: '307.590pt', top: '316.941pt', fontSize: '7.50pt', color: '#333333' }}>
                ({toBanglaDigits(ticket.numChildren)})
              </span>

              {/* Row 12: Fare */}
              <span className="ticket-span ticket-r" style={{ left: '61.770pt', top: '331.037pt', fontSize: '7.50pt', color: '#333333' }}>
                Fare{' '}
              </span>
              <span className="ticket-span ticket-s" style={{ left: '78.367pt', top: '330.341pt', fontSize: '7.50pt', color: '#333333' }}>
                (ভাড়া)
              </span>
              <span className="ticket-span ticket-r" style={{ left: '301.515pt', top: '331.037pt', fontSize: '7.50pt', color: '#333333' }}>
                BDT {ticket.fare.toFixed(2)}{' '}
              </span>
              <span className="ticket-span ticket-s" style={{ left: '342.352pt', top: '330.341pt', fontSize: '7.50pt', color: '#333333' }}>
                ({toBanglaDigits(ticket.fare.toFixed(2))} টাকা)
              </span>

              {/* Row 13: VAT */}
              <span className="ticket-span ticket-r" style={{ left: '61.770pt', top: '343.187pt', fontSize: '7.50pt', color: '#333333' }}>
                VAT{' '}
              </span>
              <span className="ticket-span ticket-s" style={{ left: '77.767pt', top: '342.491pt', fontSize: '7.50pt', color: '#333333' }}>
                (ভ্যাট)
              </span>
              <span className="ticket-span ticket-r" style={{ left: '301.515pt', top: '343.187pt', fontSize: '7.50pt', color: '#333333' }}>
                BDT {ticket.vat.toFixed(2)}{' '}
              </span>
              <span className="ticket-span ticket-s" style={{ left: '333.922pt', top: '342.491pt', fontSize: '7.50pt', color: '#333333' }}>
                ({toBanglaDigits(ticket.vat.toFixed(2))} টাকা)
              </span>

              {/* Row 14: Service Charge */}
              <span className="ticket-span ticket-r" style={{ left: '61.770pt', top: '356.487pt', fontSize: '7.50pt', color: '#333333' }}>
                Service Charge{' '}
              </span>
              <span className="ticket-span ticket-s" style={{ left: '113.610pt', top: '355.791pt', fontSize: '7.50pt', color: '#333333' }}>
                (সেবা খরচ)
              </span>
              <span className="ticket-span ticket-r" style={{ left: '301.515pt', top: '356.487pt', fontSize: '7.50pt', color: '#333333' }}>
                BDT {ticket.serviceCharge.toFixed(2)}{' '}
              </span>
              <span className="ticket-span ticket-s" style={{ left: '338.137pt', top: '355.791pt', fontSize: '7.50pt', color: '#333333' }}>
                ({toBanglaDigits(ticket.serviceCharge.toFixed(2))} টাকা)
              </span>

              {/* Row 15: Total Fare (Bold Stroke) */}
              <span className="ticket-span ticket-r" style={{ left: '62.020pt', top: '369.137pt', fontSize: '7.50pt', color: '#333333', WebkitTextStroke: '0.250pt #333333' }}>
                Total Fare{' '}
              </span>
              <span className="ticket-span ticket-s" style={{ left: '97.585pt', top: '368.441pt', fontSize: '7.50pt', color: '#333333', WebkitTextStroke: '0.250pt #333333' }}>
                (মোট ভাড়া)**
              </span>
              <span className="ticket-span ticket-r" style={{ left: '301.765pt', top: '369.837pt', fontSize: '7.50pt', color: '#333333', WebkitTextStroke: '0.250pt #333333' }}>
                BDT {totalFare.toFixed(2)}{' '}
              </span>
              <span className="ticket-span ticket-s" style={{ left: '342.602pt', top: '369.141pt', fontSize: '7.50pt', color: '#333333', WebkitTextStroke: '0.250pt #333333' }}>
                ({toBanglaDigits(totalFare.toFixed(2))} টাকা)
              </span>

              {/* Bedding Charges Footnote */}
              <span className="ticket-span ticket-r" style={{ left: '62.020pt', top: '380.399pt', fontSize: '6.00pt', color: '#333333' }}>
                ** Total Fare includes BDT 50 Bedding Charges per seat for AC_B and F_BERTH seat classes.{' '}
              </span>
              <span className="ticket-span ticket-s" style={{ left: '310.488pt', top: '380.443pt', fontSize: '6.00pt', color: '#333333' }}>
                (এসি_বি এবং এফ_বার্থ সিট ক্লাসের প্রতি সিটে মোট ভাড়ার সাথে ৳৫০ বেডিং চার্জ অন্তর্ভুক্ত)
              </span>

              {/* Table 2: Passenger Information Banner */}
              <span className="ticket-span ticket-r" style={{ left: '62.020pt', top: '413.298pt', fontSize: '12.00pt', color: '#ffffff', WebkitTextStroke: '0.400pt #ffffff' }}>
                Passenger Information{' '}
              </span>
              <span className="ticket-span ticket-s" style={{ left: '186.880pt', top: '413.386pt', fontSize: '12.00pt', color: '#ffffff', WebkitTextStroke: '0.400pt #ffffff' }}>
                (যাত্রীর তথ্য)
              </span>

              {/* Table 2 Row 1: Passenger Name */}
              <span className="ticket-span ticket-r" style={{ left: '61.770pt', top: '431.487pt', fontSize: '7.50pt', color: '#333333' }}>
                Passenger Name{' '}
              </span>
              <span className="ticket-span ticket-s" style={{ left: '120.847pt', top: '430.791pt', fontSize: '7.50pt', color: '#333333' }}>
                (যাত্রীর নাম)
              </span>
              <span className="ticket-span ticket-r" style={{ left: '301.515pt', top: '431.587pt', fontSize: '7.50pt', color: '#333333' }}>
                {ticket.passengerName}
              </span>

              {/* Table 2 Row 2: Identification Type */}
              <span className="ticket-span ticket-r" style={{ left: '61.770pt', top: '444.387pt', fontSize: '7.50pt', color: '#333333' }}>
                Identification Type{' '}
              </span>
              <span className="ticket-span ticket-s" style={{ left: '125.475pt', top: '443.691pt', fontSize: '7.50pt', color: '#333333' }}>
                (পরিচয়পত্র ধরণ)
              </span>
              <span className="ticket-span ticket-r" style={{ left: '301.515pt', top: '444.387pt', fontSize: '7.50pt', color: '#333333' }}>
                {ticket.idType}{' '}
              </span>
              <span className="ticket-span ticket-s" style={{ left: '315.682pt', top: '443.691pt', fontSize: '7.50pt', color: '#333333' }}>
                ({ticket.idTypeBn})
              </span>

              {/* Table 2 Row 3: Identification Number */}
              <span className="ticket-span ticket-r" style={{ left: '61.770pt', top: '457.037pt', fontSize: '7.50pt', color: '#333333' }}>
                Identification Number{' '}
              </span>
              <span className="ticket-span ticket-s" style={{ left: '136.035pt', top: '456.341pt', fontSize: '7.50pt', color: '#333333' }}>
                (পরিচয়পত্র নম্বর)
              </span>
              <span className="ticket-span ticket-r" style={{ left: '301.515pt', top: '457.037pt', fontSize: '7.50pt', color: '#333333' }}>
                {ticket.idNumber}{' '}
              </span>
              <span className="ticket-span ticket-s" style={{ left: '341.595pt', top: '456.341pt', fontSize: '7.50pt', color: '#333333' }}>
                ({ticket.idNumberBn})
              </span>

              {/* Table 2 Row 4: Mobile Number */}
              <span className="ticket-span ticket-r" style={{ left: '61.770pt', top: '469.837pt', fontSize: '7.50pt', color: '#333333' }}>
                Mobile Number{' '}
              </span>
              <span className="ticket-span ticket-s" style={{ left: '114.907pt', top: '469.141pt', fontSize: '7.50pt', color: '#333333' }}>
                (মোবাইল নম্বর)
              </span>
              <span className="ticket-span ticket-r" style={{ left: '301.765pt', top: '470.337pt', fontSize: '7.50pt', color: '#333333', WebkitTextStroke: '0.250pt #333333' }}>
                {ticket.mobileNumber}{' '}
              </span>
              <span className="ticket-span ticket-s" style={{ left: '345.077pt', top: '469.641pt', fontSize: '7.50pt', color: '#333333', WebkitTextStroke: '0.250pt #333333' }}>
                ({ticket.mobileNumberBn})
              </span>

              {/* Table 2 Row 5: PNR Number */}
              <span className="ticket-span ticket-r" style={{ left: '61.770pt', top: '483.237pt', fontSize: '7.50pt', color: '#333333' }}>
                PNR Number
              </span>
              <span className="ticket-span ticket-s" style={{ left: '105.097pt', top: '482.541pt', fontSize: '7.50pt', color: '#333333' }}>
                {' '}(পিএনআর নম্বর)
              </span>
              <span className="ticket-span ticket-r" style={{ left: '301.765pt', top: '483.337pt', fontSize: '7.50pt', color: '#333333', WebkitTextStroke: '0.250pt #333333' }}>
                {ticket.pnrNumber}
              </span>

              {/* ─── Please Note / খেয়াল করুনঃ- Dual Column Section ─── */}
              <span className="ticket-span ticket-r" style={{ left: '64.770pt', top: '495.524pt', fontSize: '9.00pt', color: '#333333' }}>
                Please Note:-
              </span>
              <span className="ticket-span ticket-s" style={{ left: '301.140pt', top: '496.390pt', fontSize: '9.00pt', color: '#333333' }}>
                খেয়াল করুনঃ-
              </span>

              <span className="ticket-span ticket-r" style={{ left: '65.020pt', top: '517.374pt', fontSize: '9.00pt', color: '#333333' }}>
                • Carrying NID or Photo ID while travelling is mandatory
              </span>
              <span className="ticket-span ticket-s" style={{ left: '301.140pt', top: '517.990pt', fontSize: '9.00pt', color: '#333333' }}>
                - ভ্রমণের সময় প্রত্যেক যাত্রীর এনআইডি/ ছবি সম্বলিত পরিচয়পত্র সাথে
              </span>

              <span className="ticket-span ticket-r" style={{ left: '64.770pt', top: '527.924pt', fontSize: '9.00pt', color: '#333333' }}>
                for each passenger.
              </span>
              <span className="ticket-span ticket-s" style={{ left: '301.140pt', top: '528.540pt', fontSize: '9.00pt', color: '#333333' }}>
                রাখা বাধ্যতামূলক।
              </span>

              <span className="ticket-span ticket-r" style={{ left: '64.770pt', top: '538.974pt', fontSize: '9.00pt', color: '#333333' }}>
                • You can carry either soft copy or printed copy of your e-
              </span>
              <span className="ticket-span ticket-s" style={{ left: '301.140pt', top: '539.840pt', fontSize: '9.00pt', color: '#333333' }}>
                - ট্রেন ভ্রমণে আপনার ই-টিকেটের প্রিন্টেড কপি অথবা অনলাইন কপি
              </span>

              <span className="ticket-span ticket-r" style={{ left: '64.770pt', top: '549.524pt', fontSize: '9.00pt', color: '#333333' }}>
                ticket while travelling.
              </span>
              <span className="ticket-span ticket-s" style={{ left: '301.140pt', top: '550.390pt', fontSize: '9.00pt', color: '#333333' }}>
                সাথে রাখুন।
              </span>

              <span className="ticket-span ticket-r" style={{ left: '65.020pt', top: '560.824pt', fontSize: '9.00pt', color: '#333333' }}>
                • No need to print e-ticket from the counter.
              </span>
              <span className="ticket-span ticket-s" style={{ left: '301.140pt', top: '560.940pt', fontSize: '9.00pt', color: '#333333' }}>
                - কাউন্টার থেকে টিকেট প্রিন্ট করার প্রয়োজন নেই।
              </span>

              <span className="ticket-span ticket-r" style={{ left: '65.020pt', top: '571.374pt', fontSize: '9.00pt', color: '#333333' }}>
                • It is mandatory for children between 3 to 12 years old to
              </span>
              <span className="ticket-span ticket-s" style={{ left: '301.140pt', top: '571.990pt', fontSize: '9.00pt', color: '#333333' }}>
                - তিন থেকে বারো বছরের শিশুদের জন্য অপ্রাপ্ত বয়স্ক টিকিট ক্রয়
              </span>

              <span className="ticket-span ticket-r" style={{ left: '64.770pt', top: '581.924pt', fontSize: '9.00pt', color: '#333333' }}>
                purchase minor tickets.
              </span>
              <span className="ticket-span ticket-s" style={{ left: '301.140pt', top: '582.540pt', fontSize: '9.00pt', color: '#333333' }}>
                বাধ্যতামূলক।
              </span>

              {/* ─── Helpline Section (Light Green Fill Box) ─── */}
              <span className="ticket-span ticket-s" style={{ left: '72.098pt', top: '608.138pt', fontSize: '10.50pt', color: '#e65100', WebkitTextStroke: '0.350pt #e65100' }}>
                রেলওয়ে সেবার জন্য ১৩১ এবং আইন শৃঙ্খলা বিষয়ক সহায়তার জন্য রেলওয়ে পুলিশ হটলাইন ০১৩২০১৭৭৫৯৮ নম্বরে
              </span>
              <span className="ticket-span ticket-s" style={{ left: '260.815pt', top: '620.988pt', fontSize: '10.50pt', color: '#e65100', WebkitTextStroke: '0.350pt #e65100' }}>
                যোগাযোগ করুন।
              </span>

              {/* ─── Anti-Smoking Notice (Peach Fill Box) ─── */}
              <span className="ticket-span ticket-s" style={{ left: '143.309pt', top: '653.238pt', fontSize: '10.50pt', color: '#b71c1c', WebkitTextStroke: '0.350pt #b71c1c' }}>
                "ধূমপান ও তামাকজাত দ্রব্য ব্যবহার হইতে বিরত থাকুন, ইহা শাস্তিযোগ্য অপরাধ"
              </span>

              {/* ─── Bottom Sign-Off ─── */}
              <span className="ticket-span ticket-r" style={{ left: '61.270pt', top: '680.724pt', fontSize: '9.00pt', color: '#333333' }}>
                Wishing you a pleasant and safe journey-
              </span>
              <span className="ticket-span ticket-s" style={{ left: '301.140pt', top: '681.690pt', fontSize: '9.00pt', color: '#333333' }}>
                আপনার ভ্রমণ সুখকর ও নিরাপদ হোক, এই কামনায়-
              </span>
              <span className="ticket-span ticket-s" style={{ left: '61.270pt', top: '692.888pt', fontSize: '10.50pt', color: '#333333', WebkitTextStroke: '0.350pt #333333' }}>
                Bangladesh Railway
              </span>
              <span className="ticket-span ticket-s" style={{ left: '301.390pt', top: '692.888pt', fontSize: '10.50pt', color: '#333333', WebkitTextStroke: '0.350pt #333333' }}>
                বাংলাদেশ রেলওয়ে
              </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ─── Mobile Bottom Navigation Dock ─── */}
      {isMobile && (
        <nav className="no-print" style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          height: 56,
          background: 'rgba(15, 23, 42, 0.96)',
          backdropFilter: 'blur(16px)',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-around',
          padding: '0 6px',
          zIndex: 999,
          boxShadow: '0 -4px 20px rgba(0,0,0,0.6)',
        }}>
          <button
            onClick={() => setMobileTab('editor')}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
              background: 'none', border: 'none',
              color: mobileTab === 'editor' ? '#10b981' : '#94a3b8',
              fontSize: 10.5, fontWeight: mobileTab === 'editor' ? 700 : 500,
              cursor: 'pointer', padding: '4px 10px', borderRadius: 8,
            }}
          >
            <PenTool size={17} />
            <span>Form</span>
          </button>

          <button
            onClick={() => setMobileTab('preview')}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
              background: 'none', border: 'none',
              color: mobileTab === 'preview' ? '#10b981' : '#94a3b8',
              fontSize: 10.5, fontWeight: mobileTab === 'preview' ? 700 : 500,
              cursor: 'pointer', padding: '4px 10px', borderRadius: 8,
            }}
          >
            <Eye size={17} />
            <span>A4 Ticket</span>
          </button>

          <button
            onClick={saveCurrentTicket}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
              background: 'none', border: 'none',
              color: '#94a3b8',
              fontSize: 10.5, fontWeight: 500,
              cursor: 'pointer', padding: '4px 10px', borderRadius: 8,
            }}
          >
            <CheckCircle2 size={17} />
            <span>Save</span>
          </button>

          <button
            onClick={handleDownloadPdf}
            disabled={isGeneratingPdf}
            style={{
              display: 'flex', alignItems: 'center', gap: 5,
              background: 'linear-gradient(135deg, #039d48 0%, #05b454 100%)',
              color: '#fff', border: 'none',
              padding: '7px 14px', borderRadius: 18,
              fontSize: 11.5, fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(3, 157, 72, 0.4)',
            }}
          >
            <Download size={14} />
            <span>{isGeneratingPdf ? 'Wait...' : 'PDF'}</span>
          </button>
        </nav>
      )}

      <style>{`
        .ticket-span {
          position: absolute;
          white-space: pre;
          line-height: 20pt;
          height: 20pt;
          margin: 0;
          padding: 0;
          font-kerning: none;
          font-synthesis: none;
          text-rendering: geometricPrecision;
          -webkit-font-smoothing: antialiased;
        }
        .ticket-r {
          font-family: "Roboto", sans-serif;
        }
        .ticket-s {
          font-family: "SolaimanLipi", "Kalpurush", sans-serif;
        }
        @media print {
          @page {
            size: A4;
            margin: 0;
          }
          body {
            background: #fff !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          .no-print {
            display: none !important;
          }
          #page {
            position: absolute !important;
            top: 0 !important;
            left: 0 !important;
            transform: none !important;
            box-shadow: none !important;
            margin: 0 !important;
          }
        }
      `}</style>
    </div>
  );
}
