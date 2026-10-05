import React, { useState, useEffect, useRef, useMemo } from 'react';
import QRCode from 'qrcode';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import {
  Train, Download, Printer, Plus, CheckCircle2,
  Trash2, ArrowRight, ShieldCheck, Sparkles, Clock, MapPin,
  RefreshCw, Check, PenTool
} from 'lucide-react';
import { RailwayLogo } from './RailwayLogo';
import {
  RAILWAY_STATIONS, RAILWAY_TRAINS, RAILWAY_CLASSES,
  toBanglaDigits, formatRailwayDateTime, getStationBanglaName,
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
  pnrNumber: '6ABA12DE75581',
  passengerName: 'MD. ZAHID HASAN',
  idType: 'NID',
  idTypeBn: 'এন আই ডি',
  idNumber: '376****183',
  idNumberBn: '৩৭৬****১৮৩',
  mobileNumber: '017*****000',
  mobileNumberBn: '০১৭*****০০০',
  issueDate: '2026-09-28',
  issueTime: '13:10',
  journeyDate: '2026-10-03',
  journeyTime: '16:00',
  fromStation: 'Rajshahi',
  fromStationBn: 'রাজশাহী',
  toStation: 'Dhaka',
  toStationBn: 'ঢাকা',
  trainName: 'PADMA EXPRESS',
  trainNameBn: 'পদ্মা এক্সপ্রেস',
  trainNumber: '760',
  className: 'S_CHAIR',
  classNameBn: 'শো.চেয়ার',
  coachSeat: 'THA-92',
  coachSeatBn: 'ঠ-৯২',
  numSeats: 1,
  numAdults: 1,
  numSeniors: 0,
  numChildren: 0,
  fare: 450,
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

  // Resize listener for mobile responsiveness
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
        journeyTime: match.departureTime, // Auto-adjust train departure time!
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
      margin: 1,
      color: { dark: '#000000', light: '#ffffff' }
    }).then(setQrDataUrl).catch(console.error);
  }, [ticket.pnrNumber, ticket.passengerName, ticket.trainName, ticket.trainNumber, ticket.journeyDate, ticket.journeyTime, ticket.coachSeat, ticket.fare]);

  // Calculations
  const isBeddingClass = ticket.className === 'AC_B' || ticket.className === 'F_BERTH';
  const beddingCharge = isBeddingClass ? 50 * ticket.numSeats : 0;
  const totalFare = (ticket.fare * ticket.numAdults) + ticket.vat + ticket.serviceCharge + beddingCharge;

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

  // Download High-Resolution A4 PDF
  const handleDownloadPdf = async () => {
    if (!ticketRef.current) return;
    setIsGeneratingPdf(true);
    try {
      const canvas = await html2canvas(ticketRef.current, {
        scale: 2.5,
        useCORS: true,
        backgroundColor: '#ffffff',
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
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
        padding: '12px 20px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: '#0f172a',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 38, height: 38, borderRadius: 10,
            background: 'linear-gradient(135deg, #008037 0%, #047857 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', boxShadow: '0 4px 12px rgba(0, 128, 55, 0.35)'
          }}>
            <Train size={22} />
          </div>
          <div>
            <h1 style={{ fontSize: 17, fontWeight: 700, margin: 0 }}>Bangladesh Railway Ticket Maker</h1>
            <p style={{ fontSize: 11, color: '#94a3b8', margin: 0 }}>Official E-Ticket Generator with Exact 1:1 Pixel Match & Schedule Auto-Sync</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {isMobile && (
            <div style={{ display: 'flex', background: '#1e293b', borderRadius: 8, padding: 3, gap: 2 }}>
              <button
                onClick={() => setMobileTab('editor')}
                style={{
                  background: mobileTab === 'editor' ? '#008037' : 'transparent',
                  color: '#fff', border: 'none', borderRadius: 6, padding: '5px 10px', fontSize: 12, fontWeight: 600, cursor: 'pointer'
                }}
              >
                Form
              </button>
              <button
                onClick={() => setMobileTab('preview')}
                style={{
                  background: mobileTab === 'preview' ? '#008037' : 'transparent',
                  color: '#fff', border: 'none', borderRadius: 6, padding: '5px 10px', fontSize: 12, fontWeight: 600, cursor: 'pointer'
                }}
              >
                A4 Ticket
              </button>
            </div>
          )}

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
              background: 'linear-gradient(135deg, #008037 0%, #059669 100%)',
              color: '#fff', border: 'none', padding: '7px 14px', borderRadius: 8,
              fontSize: 12, fontWeight: 700, cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(0, 128, 55, 0.4)'
            }}
          >
            <Download size={15} /> {isGeneratingPdf ? 'Generating...' : 'PDF Download'}
          </button>
        </div>
      </div>

      {/* ─── Main Content Workspace ────────────────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Left Form: Railway Parameters & Stations */}
        {(!isMobile || mobileTab === 'editor') && (
          <div style={{
            width: isMobile ? '100%' : 440,
            borderRight: '1px solid rgba(255, 255, 255, 0.08)',
            background: '#0b1120',
            padding: '18px 20px',
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
                      background: manualStationMode ? '#008037' : 'rgba(255,255,255,0.06)',
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
                          placeholder="e.g. Rajshahi"
                          style={{ width: '100%', padding: '6px 8px', background: '#1e293b', border: '1px solid #334155', borderRadius: 6, color: '#fff', fontSize: 12, boxSizing: 'border-box' }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: 10.5, color: '#94a3b8', display: 'block', marginBottom: 2 }}>From (বাংলা)</label>
                        <input
                          type="text"
                          value={ticket.fromStationBn}
                          onChange={e => setTicket({ ...ticket, fromStationBn: e.target.value })}
                          placeholder="যেমনঃ রাজশাহী"
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
                          placeholder="e.g. Dhaka"
                          style={{ width: '100%', padding: '6px 8px', background: '#1e293b', border: '1px solid #334155', borderRadius: 6, color: '#fff', fontSize: 12, boxSizing: 'border-box' }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: 10.5, color: '#94a3b8', display: 'block', marginBottom: 2 }}>To (বাংলা)</label>
                        <input
                          type="text"
                          value={ticket.toStationBn}
                          onChange={e => setTicket({ ...ticket, toStationBn: e.target.value })}
                          placeholder="যেমনঃ ঢাকা"
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
                      background: manualTrainMode ? '#008037' : 'rgba(255,255,255,0.06)',
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
                        placeholder="PADMA EXPRESS"
                        style={{ width: '100%', padding: '6px 8px', background: '#1e293b', border: '1px solid #334155', borderRadius: 6, color: '#fff', fontSize: 12, boxSizing: 'border-box' }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: 10.5, color: '#94a3b8', display: 'block', marginBottom: 2 }}>Train (বাংলা)</label>
                      <input
                        type="text"
                        value={ticket.trainNameBn}
                        onChange={e => setTicket({ ...ticket, trainNameBn: e.target.value })}
                        placeholder="পদ্মা এক্সপ্রেস"
                        style={{ width: '100%', padding: '6px 8px', background: '#1e293b', border: '1px solid #334155', borderRadius: 6, color: '#fff', fontSize: 12, boxSizing: 'border-box' }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: 10.5, color: '#94a3b8', display: 'block', marginBottom: 2 }}>Number</label>
                      <input
                        type="text"
                        value={ticket.trainNumber}
                        onChange={e => setTicket({ ...ticket, trainNumber: e.target.value })}
                        placeholder="760"
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
                      background: manualClassMode ? '#008037' : 'rgba(255,255,255,0.06)',
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
                          placeholder="শো.চেয়ার"
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
                      placeholder="THA-92"
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
                        placeholder="6ABA12DE75581"
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
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6, marginBottom: 8 }}>
                  <div>
                    <label style={{ fontSize: 10, color: '#94a3b8', display: 'block', marginBottom: 2 }}>Seats (মোট)</label>
                    <input
                      type="number"
                      min={1}
                      value={ticket.numSeats}
                      onChange={e => setTicket({ ...ticket, numSeats: parseInt(e.target.value) || 1 })}
                      style={{ width: '100%', padding: '5px', background: '#1e293b', border: '1px solid #334155', borderRadius: 6, color: '#fff', fontSize: 12, boxSizing: 'border-box' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 10, color: '#94a3b8', display: 'block', marginBottom: 2 }}>Adult (প্রাপ্ত)</label>
                    <input
                      type="number"
                      min={0}
                      value={ticket.numAdults}
                      onChange={e => setTicket({ ...ticket, numAdults: parseInt(e.target.value) || 0 })}
                      style={{ width: '100%', padding: '5px', background: '#1e293b', border: '1px solid #334155', borderRadius: 6, color: '#fff', fontSize: 12, boxSizing: 'border-box' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 10, color: '#94a3b8', display: 'block', marginBottom: 2 }}>Senior (প্রবীণ)</label>
                    <input
                      type="number"
                      min={0}
                      value={ticket.numSeniors}
                      onChange={e => setTicket({ ...ticket, numSeniors: parseInt(e.target.value) || 0 })}
                      style={{ width: '100%', padding: '5px', background: '#1e293b', border: '1px solid #334155', borderRadius: 6, color: '#fff', fontSize: 12, boxSizing: 'border-box' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 10, color: '#94a3b8', display: 'block', marginBottom: 2 }}>Child (শিশু)</label>
                    <input
                      type="number"
                      min={0}
                      value={ticket.numChildren}
                      onChange={e => setTicket({ ...ticket, numChildren: parseInt(e.target.value) || 0 })}
                      style={{ width: '100%', padding: '5px', background: '#1e293b', border: '1px solid #334155', borderRadius: 6, color: '#fff', fontSize: 12, boxSizing: 'border-box' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }}>
                  <div>
                    <label style={{ fontSize: 10, color: '#94a3b8', display: 'block', marginBottom: 2 }}>Fare (ভাড়া)</label>
                    <input
                      type="number"
                      value={ticket.fare}
                      onChange={e => setTicket({ ...ticket, fare: parseFloat(e.target.value) || 0 })}
                      style={{ width: '100%', padding: '5px', background: '#1e293b', border: '1px solid #334155', borderRadius: 6, color: '#fff', fontSize: 12, boxSizing: 'border-box' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 10, color: '#94a3b8', display: 'block', marginBottom: 2 }}>Service (চার্জ)</label>
                    <input
                      type="number"
                      value={ticket.serviceCharge}
                      onChange={e => setTicket({ ...ticket, serviceCharge: parseFloat(e.target.value) || 0 })}
                      style={{ width: '100%', padding: '5px', background: '#1e293b', border: '1px solid #334155', borderRadius: 6, color: '#fff', fontSize: 12, boxSizing: 'border-box' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 10, color: '#94a3b8', display: 'block', marginBottom: 2 }}>VAT (ভ্যাট)</label>
                    <input
                      type="number"
                      value={ticket.vat}
                      onChange={e => setTicket({ ...ticket, vat: parseFloat(e.target.value) || 0 })}
                      style={{ width: '100%', padding: '5px', background: '#1e293b', border: '1px solid #334155', borderRadius: 6, color: '#fff', fontSize: 12, boxSizing: 'border-box' }}
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
                      border: `1px solid ${item.id === ticket.id ? '#008037' : 'rgba(255, 255, 255, 0.06)'}`,
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

        {/* Right Preview: Live A4 Bangladesh Railway Ticket View (Exact 100% pixel match to uploaded PDF) */}
        {(!isMobile || mobileTab === 'preview') && (
          <div style={{
            flex: 1,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'flex-start',
            padding: isMobile ? '12px 6px 80px' : '24px',
            background: '#040711',
            overflowY: 'auto'
          }}>
            {/* A4 Paper Sheet (White Paper with Margins) */}
            <div
              ref={ticketRef}
              style={{
                width: 794, // Standard A4 width in px @ 96 DPI
                minHeight: 1123, // Standard A4 height in px
                background: '#ffffff',
                color: '#000000',
                padding: '28px 30px', // Exact margin around official green box
                boxSizing: 'border-box',
                boxShadow: '0 20px 40px rgba(0,0,0,0.85)',
                fontFamily: "'Hind Siliguri', 'Noto Sans Bengali', Arial, sans-serif",
                WebkitFontSmoothing: 'antialiased',
              }}
            >
              {/* Official Bangladesh Railway Green Outer Frame */}
              <div style={{
                border: '2px solid #008037',
                borderRadius: 4,
                padding: '20px 22px 16px 22px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                minHeight: 1065,
                boxSizing: 'border-box',
                background: '#ffffff',
              }}>
                <div>
                  {/* ─── Official Header: Authentic Emblem, Title, Powered by & QR (Exact 1:1 match) ─── */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    {/* Official Bangladesh Railway Crest */}
                    <RailwayLogo size={74} />

                    {/* Title (BANGLADESH RAILWAY / বাংলাদেশ রেলওয়ে in exact #005d8f deep teal) */}
                    <div style={{ textAlign: 'center', flex: 1, padding: '0 8px' }}>
                      <h1 style={{
                        fontSize: 22,
                        fontWeight: 800,
                        color: '#005d8f',
                        letterSpacing: '0.02em',
                        margin: 0,
                        lineHeight: 1.15,
                        fontFamily: 'Inter, Arial, sans-serif'
                      }}>
                        BANGLADESH RAILWAY
                      </h1>
                      <h2 style={{
                        fontSize: 20,
                        fontWeight: 700,
                        color: '#005d8f',
                        margin: '3px 0 0',
                        lineHeight: 1.2,
                        fontFamily: "'Hind Siliguri', 'Noto Sans Bengali', sans-serif"
                      }}>
                        বাংলাদেশ রেলওয়ে
                      </h2>
                    </div>

                    {/* Powered By & Official QR Code */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, textAlign: 'right' }}>
                      <div style={{ lineHeight: 1.25 }}>
                        <div style={{ fontSize: 9.5, color: '#334155', fontWeight: 500 }}>Powered by</div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: '#005d8f' }}>Shohoz</div>
                        <div style={{ fontSize: 11, fontWeight: 600, color: '#475569' }}>Synesis</div>
                        <div style={{ fontSize: 11, fontWeight: 600, color: '#008037' }}>
                          Vincen <span style={{ fontSize: 13, fontWeight: 900, color: '#16a34a' }}>JV</span>
                        </div>
                      </div>

                      {qrDataUrl && (
                        <img
                          src={qrDataUrl}
                          alt="E-Ticket QR"
                          style={{ width: 80, height: 80, display: 'block' }}
                        />
                      )}
                    </div>
                  </div>

                  {/* ─── Greeting / Introduction Block (Direct continuation without divider line) ─── */}
                  <div style={{ margin: '14px 0 12px', fontSize: 10.5, color: '#000000', lineHeight: 1.38 }}>
                    <div style={{ fontWeight: 600, marginBottom: 2 }}>Dear {ticket.passengerName},</div>
                    <div>
                      Your request to book e-ticket for your journey in Bangladesh Railway was successful. You can travel on the train mentioned in the ticket subject to showing your NID or Photo ID card. The details of your e-ticket are as below:
                    </div>
                    <div style={{ marginTop: 5, fontFamily: "'Hind Siliguri', 'Noto Sans Bengali', sans-serif" }}>
                      বাংলাদেশ রেলওয়েতে ভ্রমণের জন্য আপনার চাহিত ই-টিকিট সফলভাবে প্রদান করা হয়েছে। আপনার এনআইডি কিংবা ছবি সম্বলিত আইডি দেখানো সাপেক্ষে আপনি টিকিটে বর্ণিত ট্রেনে যাত্রা করতে পারবেন। ই-টিকিটের বিস্তারিত নিম্নে দেয়া হল:-
                    </div>
                  </div>

                  {/* ─── Table 1: Journey Information (যাত্রার তথ্য) ─── */}
                  <div style={{ marginBottom: 12 }}>
                    {/* Green Header Banner */}
                    <div style={{
                      background: '#008037',
                      color: '#ffffff',
                      fontWeight: 700,
                      fontSize: 12,
                      padding: '3.5px 8px',
                      borderRadius: '3px 3px 0 0',
                    }}>
                      Journey Information (যাত্রার তথ্য)
                    </div>

                    {/* Table Body - Exact clean white rows matching official ticket */}
                    <table style={{
                      width: '100%',
                      borderCollapse: 'collapse',
                      fontSize: 10,
                      border: '1px solid #c8d1dc',
                      borderTop: 'none',
                    }}>
                      <tbody>
                        <tr style={{ borderBottom: '1px solid #c8d1dc' }}>
                          <td style={{ padding: '2.8px 8px', width: '48%', fontWeight: 500, color: '#000000' }}>
                            Issue Date & Time (প্রদানের তারিখ ও সময়)
                          </td>
                          <td style={{ padding: '2.8px 8px', width: '52%', color: '#000000', fontWeight: 500 }}>
                            {formatRailwayDateTime(ticket.issueDate, ticket.issueTime)}
                          </td>
                        </tr>

                        <tr style={{ borderBottom: '1px solid #c8d1dc' }}>
                          <td style={{ padding: '2.8px 8px', fontWeight: 500, color: '#000000' }}>
                            Journey Date & Time (যাত্রার তারিখ ও সময়)
                          </td>
                          <td style={{ padding: '2.8px 8px', color: '#000000', fontWeight: 500 }}>
                            {formatRailwayDateTime(ticket.journeyDate, ticket.journeyTime)}
                          </td>
                        </tr>

                        <tr style={{ borderBottom: '1px solid #c8d1dc' }}>
                          <td style={{ padding: '2.8px 8px', fontWeight: 500, color: '#000000' }}>
                            Train Name & Number (ট্রেন নম্বর ও নাম)
                          </td>
                          <td style={{ padding: '2.8px 8px', color: '#000000', fontWeight: 500 }}>
                            {ticket.trainName} [{ticket.trainNumber}] ({ticket.trainNameBn} [{toBanglaDigits(ticket.trainNumber)}])
                          </td>
                        </tr>

                        <tr style={{ borderBottom: '1px solid #c8d1dc' }}>
                          <td style={{ padding: '2.8px 8px', fontWeight: 500, color: '#000000' }}>
                            From Station (প্রারম্ভিক স্টেশন)
                          </td>
                          <td style={{ padding: '2.8px 8px', color: '#000000', fontWeight: 500 }}>
                            {ticket.fromStation} ({ticket.fromStationBn || getStationBanglaName(ticket.fromStation)})
                          </td>
                        </tr>

                        <tr style={{ borderBottom: '1px solid #c8d1dc' }}>
                          <td style={{ padding: '2.8px 8px', fontWeight: 500, color: '#000000' }}>
                            To Station (গন্তব্য স্টেশন)
                          </td>
                          <td style={{ padding: '2.8px 8px', color: '#000000', fontWeight: 500 }}>
                            {ticket.toStation} ({ticket.toStationBn || getStationBanglaName(ticket.toStation)})
                          </td>
                        </tr>

                        <tr style={{ borderBottom: '1px solid #c8d1dc' }}>
                          <td style={{ padding: '2.8px 8px', fontWeight: 500, color: '#000000' }}>
                            Class Name (শ্রেণির নাম)
                          </td>
                          <td style={{ padding: '2.8px 8px', color: '#000000', fontWeight: 500 }}>
                            {ticket.className} ({ticket.classNameBn})
                          </td>
                        </tr>

                        <tr style={{ borderBottom: '1px solid #c8d1dc' }}>
                          <td style={{ padding: '2.8px 8px', fontWeight: 500, color: '#000000' }}>
                            Coach Name / Seat(s) (কোচের নাম / আসন)
                          </td>
                          <td style={{ padding: '2.8px 8px', color: '#000000', fontWeight: 500 }}>
                            {formatCoachSeat(ticket.coachSeat, ticket.coachSeatBn)}
                          </td>
                        </tr>

                        <tr style={{ borderBottom: '1px solid #c8d1dc' }}>
                          <td style={{ padding: '2.8px 8px', fontWeight: 500, color: '#000000' }}>
                            No. of Seats (আসন সংখ্যা)
                          </td>
                          <td style={{ padding: '2.8px 8px', color: '#000000', fontWeight: 500 }}>
                            {ticket.numSeats} ({toBanglaDigits(ticket.numSeats)})
                          </td>
                        </tr>

                        <tr style={{ borderBottom: '1px solid #c8d1dc' }}>
                          <td style={{ padding: '2.8px 8px', fontWeight: 500, color: '#000000' }}>
                            No. of Adult Passenger(s) (প্রাপ্তবয়স্ক যাত্রীর সংখ্যা)
                          </td>
                          <td style={{ padding: '2.8px 8px', color: '#000000', fontWeight: 500 }}>
                            {ticket.numAdults} ({toBanglaDigits(ticket.numAdults)})
                          </td>
                        </tr>

                        <tr style={{ borderBottom: '1px solid #c8d1dc' }}>
                          <td style={{ padding: '2.8px 8px', fontWeight: 500, color: '#000000' }}>
                            No. of Senior Citizen Passenger(s) (প্রবীণ যাত্রীর সংখ্যা)
                          </td>
                          <td style={{ padding: '2.8px 8px', color: '#000000', fontWeight: 500 }}>
                            {ticket.numSeniors} ({toBanglaDigits(ticket.numSeniors)})
                          </td>
                        </tr>

                        <tr style={{ borderBottom: '1px solid #c8d1dc' }}>
                          <td style={{ padding: '2.8px 8px', fontWeight: 500, color: '#000000' }}>
                            No. of Child Passenger(s) (শিশু যাত্রীর সংখ্যা)
                          </td>
                          <td style={{ padding: '2.8px 8px', color: '#000000', fontWeight: 500 }}>
                            {ticket.numChildren} ({toBanglaDigits(ticket.numChildren)})
                          </td>
                        </tr>

                        <tr style={{ borderBottom: '1px solid #c8d1dc' }}>
                          <td style={{ padding: '2.8px 8px', fontWeight: 500, color: '#000000' }}>
                            Fare (ভাড়া)
                          </td>
                          <td style={{ padding: '2.8px 8px', color: '#000000', fontWeight: 500 }}>
                            BDT {ticket.fare.toFixed(2)} ({toBanglaDigits(ticket.fare.toFixed(2))} টাকা)
                          </td>
                        </tr>

                        <tr style={{ borderBottom: '1px solid #c8d1dc' }}>
                          <td style={{ padding: '2.8px 8px', fontWeight: 500, color: '#000000' }}>
                            VAT (ভ্যাট)
                          </td>
                          <td style={{ padding: '2.8px 8px', color: '#000000', fontWeight: 500 }}>
                            BDT {ticket.vat.toFixed(2)} ({toBanglaDigits(ticket.vat.toFixed(2))} টাকা)
                          </td>
                        </tr>

                        <tr style={{ borderBottom: '1px solid #c8d1dc' }}>
                          <td style={{ padding: '2.8px 8px', fontWeight: 500, color: '#000000' }}>
                            Service Charge (সেবা খরচ)
                          </td>
                          <td style={{ padding: '2.8px 8px', color: '#000000', fontWeight: 500 }}>
                            BDT {ticket.serviceCharge.toFixed(2)} ({toBanglaDigits(ticket.serviceCharge.toFixed(2))} টাকা)
                          </td>
                        </tr>

                        <tr>
                          <td style={{ padding: '3.5px 8px', fontWeight: 700, color: '#000000' }}>
                            Total Fare (মোট ভাড়া)**
                          </td>
                          <td style={{ padding: '3.5px 8px', color: '#000000', fontWeight: 700 }}>
                            BDT {totalFare.toFixed(2)} ({toBanglaDigits(totalFare.toFixed(2))} টাকা)
                          </td>
                        </tr>
                      </tbody>
                    </table>

                    {/* Bedding Charges Footnote */}
                    <div style={{ fontSize: 8.5, color: '#222222', marginTop: 2.5, lineHeight: 1.3 }}>
                      ** Total Fare includes BDT 50 Bedding Charges per seat for AC_B and F_BERTH seat classes. (এসি_বি এবং এফ_বাথ সিট ক্লাসের প্রতি সিটে মোট ভাড়ার সাথে ৳৫০ বেডিং চার্জ অন্তর্ভুক্ত)
                    </div>
                  </div>

                  {/* ─── Table 2: Passenger Information (যাত্রীর তথ্য) ─── */}
                  <div style={{ marginBottom: 12 }}>
                    {/* Green Header Banner */}
                    <div style={{
                      background: '#008037',
                      color: '#ffffff',
                      fontWeight: 700,
                      fontSize: 12,
                      padding: '3.5px 8px',
                      borderRadius: '3px 3px 0 0',
                    }}>
                      Passenger Information (যাত্রীর তথ্য)
                    </div>

                    <table style={{
                      width: '100%',
                      borderCollapse: 'collapse',
                      fontSize: 10,
                      border: '1px solid #c8d1dc',
                      borderTop: 'none',
                    }}>
                      <tbody>
                        <tr style={{ borderBottom: '1px solid #c8d1dc' }}>
                          <td style={{ padding: '2.8px 8px', width: '48%', fontWeight: 500, color: '#000000' }}>
                            Passenger Name (যাত্রীর নাম)
                          </td>
                          <td style={{ padding: '2.8px 8px', width: '52%', color: '#000000', fontWeight: 500 }}>
                            {ticket.passengerName}
                          </td>
                        </tr>

                        <tr style={{ borderBottom: '1px solid #c8d1dc' }}>
                          <td style={{ padding: '2.8px 8px', fontWeight: 500, color: '#000000' }}>
                            Identification Type (পরিচয়পত্র ধরণ)
                          </td>
                          <td style={{ padding: '2.8px 8px', color: '#000000', fontWeight: 500 }}>
                            {ticket.idType} ({ticket.idTypeBn || (ticket.idType === 'NID' ? 'এন আই ডি' : ticket.idType === 'Birth Certificate' ? 'জন্ম নিবন্ধন সনদ' : 'পাসপোর্ট')})
                          </td>
                        </tr>

                        <tr style={{ borderBottom: '1px solid #c8d1dc' }}>
                          <td style={{ padding: '2.8px 8px', fontWeight: 500, color: '#000000' }}>
                            Identification Number (পরিচয়পত্র নম্বর)
                          </td>
                          <td style={{ padding: '2.8px 8px', color: '#000000', fontWeight: 500 }}>
                            {ticket.idNumber} ({ticket.idNumberBn || toBanglaDigits(ticket.idNumber)})
                          </td>
                        </tr>

                        <tr style={{ borderBottom: '1px solid #c8d1dc' }}>
                          <td style={{ padding: '2.8px 8px', fontWeight: 500, color: '#000000' }}>
                            Mobile Number (মোবাইল নম্বর)
                          </td>
                          <td style={{ padding: '2.8px 8px', color: '#000000', fontWeight: 500 }}>
                            {ticket.mobileNumber} ({ticket.mobileNumberBn || toBanglaDigits(ticket.mobileNumber)})
                          </td>
                        </tr>

                        <tr>
                          <td style={{ padding: '2.8px 8px', fontWeight: 500, color: '#000000' }}>
                            PNR Number (পিএনআর নম্বর)
                          </td>
                          <td style={{ padding: '2.8px 8px', color: '#000000', fontWeight: 700, letterSpacing: '0.02em' }}>
                            {ticket.pnrNumber}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* ─── Section 3: Please Note / খেয়াল করুনঃ- (Exact bilingual format from official ticket) ─── */}
                  <div style={{
                    border: '1px solid #c8d1dc',
                    borderRadius: 3,
                    padding: '6px 10px',
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    columnGap: 16,
                    fontSize: 9.2,
                    lineHeight: 1.4,
                    color: '#000000',
                    marginBottom: 10,
                  }}>
                    {/* English Instructions */}
                    <div>
                      <div style={{ fontWeight: 700, marginBottom: 2, color: '#000000' }}>Please Note:-</div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                        <div>• Carrying NID or Photo ID while travelling is mandatory for each passenger.</div>
                        <div>• You can carry either soft copy or printed copy of your e-ticket while travelling.</div>
                        <div>• No need to print e-ticket from the counter.</div>
                        <div>• It is mandatory for children between 3 to 12 years old to purchase minor tickets.</div>
                      </div>
                    </div>

                    {/* Bangla Instructions */}
                    <div style={{ fontFamily: "'Hind Siliguri', 'Noto Sans Bengali', sans-serif" }}>
                      <div style={{ fontWeight: 700, marginBottom: 2, color: '#000000' }}>খেয়াল করুনঃ-</div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                        <div>- ভ্রমণের সময় প্রত্যেক যাত্রীর এনআইডি/ ছবি সম্বলিত পরিচয়পত্র সাথে রাখা বাধ্যতামূলক।</div>
                        <div>- ট্রেন ভ্রমণে আপনার ই-টিকিটের প্রিন্টেড কপি অথবা অনলাইন কপি সাথে রাখুন।</div>
                        <div>- কাউন্টার থেকে টিকিট প্রিন্ট করার প্রয়োজন নেই।</div>
                        <div>- তিন থেকে বারো বছরের শিশুদের জন্য অপ্রাপ্ত বয়স্ক টিকিট ক্রয় বাধ্যতামূলক।</div>
                      </div>
                    </div>
                  </div>

                  {/* ─── Helpline & Anti-Smoking Notices (Exact colors & wording) ─── */}
                  <div style={{ textAlign: 'center', marginBottom: 8 }}>
                    <div style={{
                      color: '#d01c1c',
                      fontSize: 10.5,
                      fontWeight: 700,
                      fontFamily: "'Hind Siliguri', 'Noto Sans Bengali', sans-serif",
                      lineHeight: 1.4,
                      marginBottom: 6
                    }}>
                      রেলওয়ে সেবার জন্য ১৩১ এবং আইন শৃঙ্খলা বিষয়ক সহায়তার জন্য রেলওয়ে পুলিশ হটলাইন ০১৩২০১৭৭৫৯৮ নম্বরে<br />যোগাযোগ করুন।
                    </div>

                    <div style={{
                      background: '#fee2e2',
                      border: '1px solid #fca5a5',
                      color: '#b91c1c',
                      fontSize: 10.5,
                      fontWeight: 700,
                      padding: '3px 12px',
                      borderRadius: 3,
                      display: 'inline-block',
                      fontFamily: "'Hind Siliguri', 'Noto Sans Bengali', sans-serif"
                    }}>
                      "ধূমপান ও তামাকজাত দ্রব্য ব্যবহার হইতে বিরত থাকুন, ইহা শাস্তিযোগ্য অপরাধ"
                    </div>
                  </div>
                </div>

                {/* ─── Bottom Sign-Off (Exact matching text & alignment) ─── */}
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-end',
                  justifyContent: 'space-between',
                  paddingTop: 4,
                  fontSize: 10,
                  lineHeight: 1.35,
                  color: '#000000'
                }}>
                  <div>
                    Wishing you a pleasant and safe journey-<br />
                    <strong style={{ fontSize: 11, fontWeight: 700, color: '#000000' }}>Bangladesh Railway</strong>
                  </div>

                  <div style={{ textAlign: 'right', fontFamily: "'Hind Siliguri', 'Noto Sans Bengali', sans-serif" }}>
                    আপনার ভ্রমণ সুখকর ও নিরাপদ হোক, এই কামনায়-<br />
                    <strong style={{ fontSize: 11, fontWeight: 700, color: '#000000' }}>বাংলাদেশ রেলওয়ে</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
