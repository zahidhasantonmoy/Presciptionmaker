import React, { useState, useEffect, useRef, useMemo } from 'react';
import QRCode from 'qrcode';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import {
  Train, Download, Printer, Plus, CheckCircle2, RotateCcw,
  Trash2, Eye, Edit3, ArrowRight, ShieldCheck, Sparkles, Clock, MapPin
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
  idType: 'NID' | 'Birth Certificate' | 'Passport';
  idNumber: string;
  mobileNumber: string;
  issueDate: string; // YYYY-MM-DD
  issueTime: string; // HH:mm
  journeyDate: string; // YYYY-MM-DD
  journeyTime: string; // HH:mm
  fromStation: string;
  toStation: string;
  trainName: string;
  trainNumber: string;
  className: string;
  coachSeat: string;
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
  idNumber: '376****183',
  mobileNumber: '017*****000',
  issueDate: '2026-09-28',
  issueTime: '13:10',
  journeyDate: '2026-10-03',
  journeyTime: '16:00',
  fromStation: 'Rajshahi',
  toStation: 'Dhaka',
  trainName: 'PADMA EXPRESS',
  trainNumber: '760',
  className: 'S_CHAIR',
  coachSeat: 'THA-92',
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

  // Handle train change -> Automatically adjust departure time, train number, stations & fare!
  const handleSelectTrain = (trainName: string) => {
    const match = RAILWAY_TRAINS.find(t => t.name === trainName || `${t.name} [${t.number}]` === trainName);
    if (match) {
      const autoFare = match.fares[ticket.className] || RAILWAY_CLASSES.find(c => c.code === ticket.className)?.defaultFare || 450;
      setTicket(prev => ({
        ...prev,
        trainName: match.name,
        trainNumber: match.number,
        fromStation: match.fromStation,
        toStation: match.toStation,
        journeyTime: match.departureTime, // Auto-adjust train departure time!
        fare: autoFare,
      }));
    } else {
      setTicket(prev => ({ ...prev, trainName }));
    }
  };

  // Handle class change -> Auto calculate fare
  const handleClassChange = (newClass: string) => {
    const currentTrain = RAILWAY_TRAINS.find(t => t.number === ticket.trainNumber && t.name === ticket.trainName);
    const classFare = currentTrain?.fares[newClass] ?? (RAILWAY_CLASSES.find(c => c.code === newClass)?.defaultFare ?? 450);
    setTicket(prev => ({
      ...prev,
      className: newClass,
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

  // Selected train details
  const trainObj = RAILWAY_TRAINS.find(t => t.number === ticket.trainNumber && t.name === ticket.trainName);
  const trainBanglaName = trainObj?.nameBn || ticket.trainName;
  const classObj = RAILWAY_CLASSES.find(c => c.code === ticket.className);
  const classBanglaName = classObj?.labelBn || ticket.className;

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
            background: 'linear-gradient(135deg, #006633 0%, #047857 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', boxShadow: '0 4px 12px rgba(4, 120, 87, 0.3)'
          }}>
            <Train size={22} />
          </div>
          <div>
            <h1 style={{ fontSize: 17, fontWeight: 700, margin: 0 }}>Bangladesh Railway Ticket Maker</h1>
            <p style={{ fontSize: 11, color: '#94a3b8', margin: 0 }}>Official E-Ticket Generator with Automatic Schedules & Fares</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {isMobile && (
            <div style={{ display: 'flex', background: '#1e293b', borderRadius: 8, padding: 3, gap: 2 }}>
              <button
                onClick={() => setMobileTab('editor')}
                style={{
                  background: mobileTab === 'editor' ? '#047857' : 'transparent',
                  color: '#fff', border: 'none', borderRadius: 6, padding: '5px 10px', fontSize: 12, fontWeight: 600, cursor: 'pointer'
                }}
              >
                Form
              </button>
              <button
                onClick={() => setMobileTab('preview')}
                style={{
                  background: mobileTab === 'preview' ? '#047857' : 'transparent',
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
              background: 'linear-gradient(135deg, #006633 0%, #047857 100%)',
              color: '#fff', border: 'none', padding: '7px 14px', borderRadius: 8,
              fontSize: 12, fontWeight: 700, cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(4, 120, 87, 0.4)'
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
            width: isMobile ? '100%' : 420,
            borderRight: '1px solid rgba(255, 255, 255, 0.08)',
            background: '#0b1120',
            padding: '20px 22px',
            overflowY: 'auto',
            flexShrink: 0,
            boxSizing: 'border-box'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <span style={{ fontSize: 13, fontWeight: 800, color: '#10b981', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                🚂 Journey & Train Setup
              </span>
              <span style={{ fontSize: 11, color: '#94a3b8' }}>Auto-time adjustment active</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Station Selectors with Suggestion Data */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={{ fontSize: 11, color: '#94a3b8', display: 'block', marginBottom: 4 }}>
                    From Station (প্রারম্ভিক)
                  </label>
                  <select
                    value={ticket.fromStation}
                    onChange={e => {
                      const newFrom = e.target.value;
                      setTicket(prev => ({ ...prev, fromStation: newFrom }));
                    }}
                    style={{ width: '100%', padding: '8px 10px', background: '#1e293b', border: '1px solid #334155', borderRadius: 6, color: '#fff', fontSize: 13, boxSizing: 'border-box' }}
                  >
                    {RAILWAY_STATIONS.map(st => (
                      <option key={st.code + st.name} value={st.name}>
                        {st.name} ({st.nameBn})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: 11, color: '#94a3b8', display: 'block', marginBottom: 4 }}>
                    To Station (গন্তব্য)
                  </label>
                  <select
                    value={ticket.toStation}
                    onChange={e => {
                      const newTo = e.target.value;
                      setTicket(prev => ({ ...prev, toStation: newTo }));
                    }}
                    style={{ width: '100%', padding: '8px 10px', background: '#1e293b', border: '1px solid #334155', borderRadius: 6, color: '#fff', fontSize: 13, boxSizing: 'border-box' }}
                  >
                    {RAILWAY_STATIONS.map(st => (
                      <option key={st.code + st.name} value={st.name}>
                        {st.name} ({st.nameBn})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Train Selector (Adjusts Departure Time Automatically!) */}
              <div>
                <label style={{ fontSize: 11, color: '#94a3b8', display: 'block', marginBottom: 4 }}>
                  Train (ট্রেন নির্বাচন করুন - সময় অটো মিলবে)
                </label>
                <select
                  value={`${ticket.trainName} [${ticket.trainNumber}]`}
                  onChange={e => handleSelectTrain(e.target.value)}
                  style={{ width: '100%', padding: '8px 10px', background: '#1e293b', border: '1px solid #334155', borderRadius: 6, color: '#fff', fontSize: 13, boxSizing: 'border-box' }}
                >
                  {availableTrains.map(tr => (
                    <option key={tr.number} value={`${tr.name} [${tr.number}]`}>
                      {tr.name} [{tr.number}] ({tr.fromStation} → {tr.toStation} @ {tr.departureTime})
                    </option>
                  ))}
                  {/* Fallback to custom train */}
                  {!availableTrains.some(t => t.name === ticket.trainName && t.number === ticket.trainNumber) && (
                    <option value={`${ticket.trainName} [${ticket.trainNumber}]`}>
                      {ticket.trainName} [{ticket.trainNumber}]
                    </option>
                  )}
                </select>
              </div>

              {/* Class & Coach */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 10 }}>
                <div>
                  <label style={{ fontSize: 11, color: '#94a3b8', display: 'block', marginBottom: 4 }}>Class Name (শ্রেণি)</label>
                  <select
                    value={ticket.className}
                    onChange={e => handleClassChange(e.target.value)}
                    style={{ width: '100%', padding: '8px 10px', background: '#1e293b', border: '1px solid #334155', borderRadius: 6, color: '#fff', fontSize: 13, boxSizing: 'border-box' }}
                  >
                    {RAILWAY_CLASSES.map(cls => (
                      <option key={cls.code} value={cls.code}>
                        {cls.label} ({cls.labelBn})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: 11, color: '#94a3b8', display: 'block', marginBottom: 4 }}>Coach / Seat</label>
                  <input
                    type="text"
                    value={ticket.coachSeat}
                    onChange={e => setTicket({ ...ticket, coachSeat: e.target.value })}
                    placeholder="THA-92"
                    style={{ width: '100%', padding: '8px 10px', background: '#1e293b', border: '1px solid #334155', borderRadius: 6, color: '#fff', fontSize: 13, boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              {/* Journey Date & Automatically adjusted Departure Time */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={{ fontSize: 11, color: '#94a3b8', display: 'block', marginBottom: 4 }}>Journey Date (যাত্রার তারিখ)</label>
                  <input
                    type="date"
                    value={ticket.journeyDate}
                    onChange={e => setTicket({ ...ticket, journeyDate: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', background: '#1e293b', border: '1px solid #334155', borderRadius: 6, color: '#fff', fontSize: 13, boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: 11, color: '#10b981', display: 'flex', alignItems: 'center', gap: 4, marginBottom: 4 }}>
                    <Clock size={12} /> Train Time (সময়)
                  </label>
                  <input
                    type="text"
                    value={ticket.journeyTime}
                    onChange={e => setTicket({ ...ticket, journeyTime: e.target.value })}
                    placeholder="16:00"
                    style={{ width: '100%', padding: '8px 10px', background: '#1e293b', border: '1px solid #334155', borderRadius: 6, color: '#fff', fontSize: 13, boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              {/* Issue Date & Time */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={{ fontSize: 11, color: '#94a3b8', display: 'block', marginBottom: 4 }}>Issue Date (প্রদানের তারিখ)</label>
                  <input
                    type="date"
                    value={ticket.issueDate}
                    onChange={e => setTicket({ ...ticket, issueDate: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', background: '#1e293b', border: '1px solid #334155', borderRadius: 6, color: '#fff', fontSize: 13, boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: 11, color: '#94a3b8', display: 'block', marginBottom: 4 }}>Issue Time (প্রদানের সময়)</label>
                  <input
                    type="text"
                    value={ticket.issueTime}
                    onChange={e => setTicket({ ...ticket, issueTime: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', background: '#1e293b', border: '1px solid #334155', borderRadius: 6, color: '#fff', fontSize: 13, boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              {/* Passenger Details */}
              <div style={{ marginTop: 8, paddingTop: 12, borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <span style={{ fontSize: 12, fontWeight: 800, color: '#10b981', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                  👤 Passenger Details
                </span>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 10 }}>
                  <div>
                    <label style={{ fontSize: 11, color: '#94a3b8', display: 'block', marginBottom: 4 }}>Passenger Name (যাত্রীর নাম)</label>
                    <input
                      type="text"
                      value={ticket.passengerName}
                      onChange={e => setTicket({ ...ticket, passengerName: e.target.value })}
                      style={{ width: '100%', padding: '8px 10px', background: '#1e293b', border: '1px solid #334155', borderRadius: 6, color: '#fff', fontSize: 13, boxSizing: 'border-box' }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <div>
                      <label style={{ fontSize: 11, color: '#94a3b8', display: 'block', marginBottom: 4 }}>ID Type (পরিচয়পত্র)</label>
                      <select
                        value={ticket.idType}
                        onChange={e => setTicket({ ...ticket, idType: e.target.value as any })}
                        style={{ width: '100%', padding: '8px 10px', background: '#1e293b', border: '1px solid #334155', borderRadius: 6, color: '#fff', fontSize: 13, boxSizing: 'border-box' }}
                      >
                        <option value="NID">NID (এন আই ডি)</option>
                        <option value="Birth Certificate">Birth Certificate (জন্ম সনদ)</option>
                        <option value="Passport">Passport (পাসপোর্ট)</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ fontSize: 11, color: '#94a3b8', display: 'block', marginBottom: 4 }}>ID Number (নম্বর)</label>
                      <input
                        type="text"
                        value={ticket.idNumber}
                        onChange={e => setTicket({ ...ticket, idNumber: e.target.value })}
                        style={{ width: '100%', padding: '8px 10px', background: '#1e293b', border: '1px solid #334155', borderRadius: 6, color: '#fff', fontSize: 13, boxSizing: 'border-box' }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <div>
                      <label style={{ fontSize: 11, color: '#94a3b8', display: 'block', marginBottom: 4 }}>Mobile Number (মোবাইল)</label>
                      <input
                        type="text"
                        value={ticket.mobileNumber}
                        onChange={e => setTicket({ ...ticket, mobileNumber: e.target.value })}
                        style={{ width: '100%', padding: '8px 10px', background: '#1e293b', border: '1px solid #334155', borderRadius: 6, color: '#fff', fontSize: 13, boxSizing: 'border-box' }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: 11, color: '#94a3b8', display: 'block', marginBottom: 4 }}>PNR Number (পিএনআর)</label>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <input
                          type="text"
                          value={ticket.pnrNumber}
                          onChange={e => setTicket({ ...ticket, pnrNumber: e.target.value })}
                          style={{ flex: 1, padding: '8px 10px', background: '#1e293b', border: '1px solid #334155', borderRadius: 6, color: '#fff', fontSize: 13 }}
                        />
                        <button
                          type="button"
                          onClick={() => setTicket({ ...ticket, pnrNumber: Math.random().toString(36).substring(2, 8).toUpperCase() + Math.floor(100000 + Math.random() * 900000) })}
                          style={{ background: '#334155', border: 'none', borderRadius: 6, color: '#fff', padding: '0 8px', cursor: 'pointer' }}
                          title="Generate new PNR"
                        >
                          <RotateCcw size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Fares & Passenger Counts */}
              <div style={{ marginTop: 8, paddingTop: 12, borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <span style={{ fontSize: 12, fontWeight: 800, color: '#10b981', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                  💰 Fares & Seat Counts
                </span>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginTop: 10 }}>
                  <div>
                    <label style={{ fontSize: 11, color: '#94a3b8', display: 'block', marginBottom: 4 }}>Seats (আসন)</label>
                    <input
                      type="number"
                      value={ticket.numSeats}
                      onChange={e => setTicket({ ...ticket, numSeats: parseInt(e.target.value) || 1 })}
                      style={{ width: '100%', padding: '8px 10px', background: '#1e293b', border: '1px solid #334155', borderRadius: 6, color: '#fff', fontSize: 13, boxSizing: 'border-box' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, color: '#94a3b8', display: 'block', marginBottom: 4 }}>Adults (প্রাপ্তবয়স্ক)</label>
                    <input
                      type="number"
                      value={ticket.numAdults}
                      onChange={e => setTicket({ ...ticket, numAdults: parseInt(e.target.value) || 1 })}
                      style={{ width: '100%', padding: '8px 10px', background: '#1e293b', border: '1px solid #334155', borderRadius: 6, color: '#fff', fontSize: 13, boxSizing: 'border-box' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, color: '#94a3b8', display: 'block', marginBottom: 4 }}>Children (শিশু)</label>
                    <input
                      type="number"
                      value={ticket.numChildren}
                      onChange={e => setTicket({ ...ticket, numChildren: parseInt(e.target.value) || 0 })}
                      style={{ width: '100%', padding: '8px 10px', background: '#1e293b', border: '1px solid #334155', borderRadius: 6, color: '#fff', fontSize: 13, boxSizing: 'border-box' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginTop: 10 }}>
                  <div>
                    <label style={{ fontSize: 11, color: '#94a3b8', display: 'block', marginBottom: 4 }}>Fare (ভাড়া)</label>
                    <input
                      type="number"
                      value={ticket.fare}
                      onChange={e => setTicket({ ...ticket, fare: parseFloat(e.target.value) || 0 })}
                      style={{ width: '100%', padding: '8px 10px', background: '#1e293b', border: '1px solid #334155', borderRadius: 6, color: '#fff', fontSize: 13, boxSizing: 'border-box' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, color: '#94a3b8', display: 'block', marginBottom: 4 }}>Service (চার্জ)</label>
                    <input
                      type="number"
                      value={ticket.serviceCharge}
                      onChange={e => setTicket({ ...ticket, serviceCharge: parseFloat(e.target.value) || 0 })}
                      style={{ width: '100%', padding: '8px 10px', background: '#1e293b', border: '1px solid #334155', borderRadius: 6, color: '#fff', fontSize: 13, boxSizing: 'border-box' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, color: '#94a3b8', display: 'block', marginBottom: 4 }}>VAT (ভ্যাট)</label>
                    <input
                      type="number"
                      value={ticket.vat}
                      onChange={e => setTicket({ ...ticket, vat: parseFloat(e.target.value) || 0 })}
                      style={{ width: '100%', padding: '8px 10px', background: '#1e293b', border: '1px solid #334155', borderRadius: 6, color: '#fff', fontSize: 13, boxSizing: 'border-box' }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Saved Tickets History list */}
            <div style={{ marginTop: 24, paddingTop: 14, borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: 10 }}>
                Saved Tickets History ({savedTickets.length})
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {savedTickets.map(item => (
                  <div
                    key={item.id}
                    onClick={() => setTicket(item)}
                    style={{
                      background: item.id === ticket.id ? '#1e293b' : 'rgba(255, 255, 255, 0.03)',
                      border: `1px solid ${item.id === ticket.id ? '#047857' : 'rgba(255, 255, 255, 0.06)'}`,
                      borderRadius: 8,
                      padding: '8px 12px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: '#fff' }}>
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

        {/* Right Preview: Live A4 Bangladesh Railway Ticket View */}
        {(!isMobile || mobileTab === 'preview') && (
          <div style={{
            flex: 1,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'flex-start',
            padding: isMobile ? '16px 8px 80px' : '28px',
            background: '#040711',
            overflowY: 'auto'
          }}>
            {/* A4 Paper Board */}
            <div
              ref={ticketRef}
              style={{
                width: 794, // Standard A4 width in px @ 96 DPI
                minHeight: 1123, // Standard A4 height in px
                background: '#ffffff',
                color: '#000000',
                padding: '24px 28px',
                boxSizing: 'border-box',
                boxShadow: '0 20px 40px rgba(0,0,0,0.8)',
                border: '2.5px solid #006633', // Exact green outer border from official ticket!
                borderRadius: 4,
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                fontFamily: 'Inter, "Noto Sans Bengali", sans-serif',
              }}
            >
              <div>
                {/* ─── Official Header: Logo, Title, Powered by & QR ─── */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1.5px solid #006633', paddingBottom: 14 }}>
                  {/* Bangladesh Railway Logo */}
                  <RailwayLogo size={74} />

                  {/* Title */}
                  <div style={{ textAlign: 'center', flex: 1, padding: '0 12px' }}>
                    <h1 style={{
                      fontSize: 22,
                      fontWeight: 900,
                      color: '#005580',
                      letterSpacing: '0.04em',
                      margin: 0,
                      fontFamily: 'Inter, sans-serif'
                    }}>
                      BANGLADESH RAILWAY
                    </h1>
                    <h2 style={{
                      fontSize: 20,
                      fontWeight: 900,
                      color: '#005580',
                      margin: '2px 0 0',
                      fontFamily: 'var(--font-bn), sans-serif'
                    }}>
                      বাংলাদেশ রেলওয়ে
                    </h2>
                  </div>

                  {/* Powered By & Official QR Code */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, textAlign: 'right' }}>
                    <div>
                      <div style={{ fontSize: 10, color: '#334155', fontWeight: 600 }}>Powered by</div>
                      <div style={{ fontSize: 12, fontWeight: 800, color: '#005580', lineHeight: 1.1 }}>
                        Shohoz
                      </div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: '#475569' }}>
                        Synesis
                      </div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: '#006633' }}>
                        Vincen <span style={{ fontSize: 13, fontWeight: 900, color: '#16a34a' }}>JV</span>
                      </div>
                    </div>

                    {qrDataUrl && (
                      <div style={{
                        border: '1.5px solid #000',
                        padding: 2,
                        borderRadius: 2,
                        background: '#fff'
                      }}>
                        <img src={qrDataUrl} alt="E-Ticket QR" style={{ width: 84, height: 84, display: 'block' }} />
                      </div>
                    )}
                  </div>
                </div>

                {/* ─── Greeting / Introduction Block ─── */}
                <div style={{ margin: '14px 0 16px', fontSize: 11.5, color: '#1e293b', lineHeight: 1.5 }}>
                  <div style={{ fontWeight: 700, marginBottom: 2 }}>Dear {ticket.passengerName},</div>
                  <div>
                    Your request to book e-ticket for your journey in Bangladesh Railway was successful. You can travel on the train mentioned in the ticket subject to showing your NID or Photo ID card. The details of your e-ticket are as below:
                  </div>
                  <div style={{ marginTop: 6, fontFamily: 'var(--font-bn)' }}>
                    বাংলাদেশ রেলওয়েতে ভ্রমণের জন্য আপনার চাহিত ই-টিকিট সফলভাবে প্রদান করা হয়েছে। আপনার এনআইডি কিংবা ছবি সম্বলিত আইডি দেখানো সাপেক্ষে আপনি টিকিটে বর্ণিত ট্রেনে যাত্রা করতে পারবেন। ই-টিকিটের বিস্তারিত নিম্নে দেয়া হল:-
                  </div>
                </div>

                {/* ─── Table 1: Journey Information (যাত্রার তথ্য) ─── */}
                <div style={{ marginBottom: 16 }}>
                  {/* Green Header Banner */}
                  <div style={{
                    background: '#006633',
                    color: '#ffffff',
                    fontWeight: 800,
                    fontSize: 13.5,
                    padding: '6px 14px',
                    borderRadius: '6px 6px 0 0',
                    letterSpacing: '0.02em',
                  }}>
                    Journey Information (যাত্রার তথ্য)
                  </div>

                  {/* Table Body */}
                  <table style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    fontSize: 11.5,
                    border: '1px solid #cbd5e1',
                    borderTop: 'none',
                  }}>
                    <tbody>
                      <tr style={{ borderBottom: '1px solid #cbd5e1' }}>
                        <td style={{ padding: '6px 12px', width: '45%', fontWeight: 700, color: '#1e293b' }}>
                          Issue Date & Time (প্রদানের তারিখ ও সময়)
                        </td>
                        <td style={{ padding: '6px 12px', color: '#000', fontWeight: 600 }}>
                          {formatRailwayDateTime(ticket.issueDate, ticket.issueTime)}
                        </td>
                      </tr>

                      <tr style={{ borderBottom: '1px solid #cbd5e1', background: '#fafafa' }}>
                        <td style={{ padding: '6px 12px', fontWeight: 700, color: '#1e293b' }}>
                          Journey Date & Time (যাত্রার তারিখ ও সময়)
                        </td>
                        <td style={{ padding: '6px 12px', color: '#000', fontWeight: 600 }}>
                          {formatRailwayDateTime(ticket.journeyDate, ticket.journeyTime)}
                        </td>
                      </tr>

                      <tr style={{ borderBottom: '1px solid #cbd5e1' }}>
                        <td style={{ padding: '6px 12px', fontWeight: 700, color: '#1e293b' }}>
                          Train Name & Number (ট্রেন নম্বর ও নাম)
                        </td>
                        <td style={{ padding: '6px 12px', color: '#000', fontWeight: 600 }}>
                          {ticket.trainName} [{ticket.trainNumber}] ({trainBanglaName} [{toBanglaDigits(ticket.trainNumber)}])
                        </td>
                      </tr>

                      <tr style={{ borderBottom: '1px solid #cbd5e1', background: '#fafafa' }}>
                        <td style={{ padding: '6px 12px', fontWeight: 700, color: '#1e293b' }}>
                          From Station (প্রারম্ভিক স্টেশন)
                        </td>
                        <td style={{ padding: '6px 12px', color: '#000', fontWeight: 600 }}>
                          {ticket.fromStation} ({getStationBanglaName(ticket.fromStation)})
                        </td>
                      </tr>

                      <tr style={{ borderBottom: '1px solid #cbd5e1' }}>
                        <td style={{ padding: '6px 12px', fontWeight: 700, color: '#1e293b' }}>
                          To Station (গন্তব্য স্টেশন)
                        </td>
                        <td style={{ padding: '6px 12px', color: '#000', fontWeight: 600 }}>
                          {ticket.toStation} ({getStationBanglaName(ticket.toStation)})
                        </td>
                      </tr>

                      <tr style={{ borderBottom: '1px solid #cbd5e1', background: '#fafafa' }}>
                        <td style={{ padding: '6px 12px', fontWeight: 700, color: '#1e293b' }}>
                          Class Name (শ্রেণির নাম)
                        </td>
                        <td style={{ padding: '6px 12px', color: '#000', fontWeight: 600 }}>
                          {ticket.className} ({classBanglaName})
                        </td>
                      </tr>

                      <tr style={{ borderBottom: '1px solid #cbd5e1' }}>
                        <td style={{ padding: '6px 12px', fontWeight: 700, color: '#1e293b' }}>
                          Coach Name / Seat(s) (কোচের নাম / আসন)
                        </td>
                        <td style={{ padding: '6px 12px', color: '#000', fontWeight: 600 }}>
                          {formatCoachSeat(ticket.coachSeat)}
                        </td>
                      </tr>

                      <tr style={{ borderBottom: '1px solid #cbd5e1', background: '#fafafa' }}>
                        <td style={{ padding: '6px 12px', fontWeight: 700, color: '#1e293b' }}>
                          No. of Seats (আসন সংখ্যা)
                        </td>
                        <td style={{ padding: '6px 12px', color: '#000', fontWeight: 600 }}>
                          {ticket.numSeats} ({toBanglaDigits(ticket.numSeats)})
                        </td>
                      </tr>

                      <tr style={{ borderBottom: '1px solid #cbd5e1' }}>
                        <td style={{ padding: '6px 12px', fontWeight: 700, color: '#1e293b' }}>
                          No. of Adult Passenger(s) (প্রাপ্তবয়স্ক যাত্রীর সংখ্যা)
                        </td>
                        <td style={{ padding: '6px 12px', color: '#000', fontWeight: 600 }}>
                          {ticket.numAdults} ({toBanglaDigits(ticket.numAdults)})
                        </td>
                      </tr>

                      <tr style={{ borderBottom: '1px solid #cbd5e1', background: '#fafafa' }}>
                        <td style={{ padding: '6px 12px', fontWeight: 700, color: '#1e293b' }}>
                          No. of Senior Citizen Passenger(s) (প্রবীণ যাত্রীর সংখ্যা)
                        </td>
                        <td style={{ padding: '6px 12px', color: '#000', fontWeight: 600 }}>
                          {ticket.numSeniors} ({toBanglaDigits(ticket.numSeniors)})
                        </td>
                      </tr>

                      <tr style={{ borderBottom: '1px solid #cbd5e1' }}>
                        <td style={{ padding: '6px 12px', fontWeight: 700, color: '#1e293b' }}>
                          No. of Child Passenger(s) (শিশু যাত্রীর সংখ্যা)
                        </td>
                        <td style={{ padding: '6px 12px', color: '#000', fontWeight: 600 }}>
                          {ticket.numChildren} ({toBanglaDigits(ticket.numChildren)})
                        </td>
                      </tr>

                      <tr style={{ borderBottom: '1px solid #cbd5e1', background: '#fafafa' }}>
                        <td style={{ padding: '6px 12px', fontWeight: 700, color: '#1e293b' }}>
                          Fare (ভাড়া)
                        </td>
                        <td style={{ padding: '6px 12px', color: '#000', fontWeight: 600 }}>
                          BDT {ticket.fare.toFixed(2)} ({toBanglaDigits(ticket.fare.toFixed(2))} টাকা)
                        </td>
                      </tr>

                      <tr style={{ borderBottom: '1px solid #cbd5e1' }}>
                        <td style={{ padding: '6px 12px', fontWeight: 700, color: '#1e293b' }}>
                          VAT (ভ্যাট)
                        </td>
                        <td style={{ padding: '6px 12px', color: '#000', fontWeight: 600 }}>
                          BDT {ticket.vat.toFixed(2)} ({toBanglaDigits(ticket.vat.toFixed(2))} টাকা)
                        </td>
                      </tr>

                      <tr style={{ borderBottom: '1px solid #cbd5e1', background: '#fafafa' }}>
                        <td style={{ padding: '6px 12px', fontWeight: 700, color: '#1e293b' }}>
                          Service Charge (সেবা খরচ)
                        </td>
                        <td style={{ padding: '6px 12px', color: '#000', fontWeight: 600 }}>
                          BDT {ticket.serviceCharge.toFixed(2)} ({toBanglaDigits(ticket.serviceCharge.toFixed(2))} টাকা)
                        </td>
                      </tr>

                      <tr>
                        <td style={{ padding: '7px 12px', fontWeight: 800, color: '#006633', fontSize: 12 }}>
                          Total Fare (মোট ভাড়া)**
                        </td>
                        <td style={{ padding: '7px 12px', color: '#006633', fontWeight: 800, fontSize: 12 }}>
                          BDT {totalFare.toFixed(2)} ({toBanglaDigits(totalFare.toFixed(2))} টাকা)
                        </td>
                      </tr>
                    </tbody>
                  </table>

                  {/* Bedding Charges Footnote */}
                  <div style={{ fontSize: 9.5, color: '#475569', marginTop: 4, fontStyle: 'italic', lineHeight: 1.3 }}>
                    ** Total Fare includes BDT 50 Bedding Charges per seat for AC_B and F_BERTH seat classes. (এসি_বি এবং এফ_বার্থ সিট ক্লাসের প্রতি সিটে মোট ভাড়ার সাথে ৳৫০ বেডিং চার্জ অন্তর্ভুক্ত)
                  </div>
                </div>

                {/* ─── Table 2: Passenger Information (যাত্রীর তথ্য) ─── */}
                <div style={{ marginBottom: 16 }}>
                  {/* Green Header Banner */}
                  <div style={{
                    background: '#006633',
                    color: '#ffffff',
                    fontWeight: 800,
                    fontSize: 13.5,
                    padding: '6px 14px',
                    borderRadius: '6px 6px 0 0',
                    letterSpacing: '0.02em',
                  }}>
                    Passenger Information (যাত্রীর তথ্য)
                  </div>

                  <table style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    fontSize: 11.5,
                    border: '1px solid #cbd5e1',
                    borderTop: 'none',
                  }}>
                    <tbody>
                      <tr style={{ borderBottom: '1px solid #cbd5e1' }}>
                        <td style={{ padding: '6px 12px', width: '45%', fontWeight: 700, color: '#1e293b' }}>
                          Passenger Name (যাত্রীর নাম)
                        </td>
                        <td style={{ padding: '6px 12px', color: '#000', fontWeight: 700 }}>
                          {ticket.passengerName}
                        </td>
                      </tr>

                      <tr style={{ borderBottom: '1px solid #cbd5e1', background: '#fafafa' }}>
                        <td style={{ padding: '6px 12px', fontWeight: 700, color: '#1e293b' }}>
                          Identification Type (পরিচয়পত্র ধরণ)
                        </td>
                        <td style={{ padding: '6px 12px', color: '#000', fontWeight: 600 }}>
                          {ticket.idType === 'NID' ? 'NID (এন আই ডি)' : ticket.idType === 'Birth Certificate' ? 'Birth Certificate (জন্ম নিবন্ধন সনদ)' : 'Passport (পাসপোর্ট)'}
                        </td>
                      </tr>

                      <tr style={{ borderBottom: '1px solid #cbd5e1' }}>
                        <td style={{ padding: '6px 12px', fontWeight: 700, color: '#1e293b' }}>
                          Identification Number (পরিচয়পত্র নম্বর)
                        </td>
                        <td style={{ padding: '6px 12px', color: '#000', fontWeight: 600 }}>
                          {ticket.idNumber} ({toBanglaDigits(ticket.idNumber)})
                        </td>
                      </tr>

                      <tr style={{ borderBottom: '1px solid #cbd5e1', background: '#fafafa' }}>
                        <td style={{ padding: '6px 12px', fontWeight: 700, color: '#1e293b' }}>
                          Mobile Number (মোবাইল নম্বর)
                        </td>
                        <td style={{ padding: '6px 12px', color: '#000', fontWeight: 600 }}>
                          {ticket.mobileNumber} ({toBanglaDigits(ticket.mobileNumber)})
                        </td>
                      </tr>

                      <tr>
                        <td style={{ padding: '6px 12px', fontWeight: 700, color: '#1e293b' }}>
                          PNR Number (পিএনআর নম্বর)
                        </td>
                        <td style={{ padding: '6px 12px', color: '#000', fontWeight: 800, fontFamily: 'monospace', letterSpacing: '0.05em' }}>
                          {ticket.pnrNumber}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* ─── Section 3: Please Note / খেয়াল করুনঃ- ─── */}
                <div style={{
                  border: '1px solid #cbd5e1',
                  borderRadius: 6,
                  padding: '10px 14px',
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 16,
                  fontSize: 10.5,
                  lineHeight: 1.4,
                  color: '#1e293b',
                  marginBottom: 14,
                }}>
                  {/* English Instructions */}
                  <div>
                    <div style={{ fontWeight: 800, marginBottom: 4, color: '#006633' }}>Please Note:-</div>
                    <ul style={{ margin: 0, paddingLeft: 14, listStyleType: 'disc' }}>
                      <li>Carrying NID or Photo ID while travelling is mandatory for each passenger.</li>
                      <li>You can carry either soft copy or printed copy of your e-ticket while travelling.</li>
                      <li>No need to print e-ticket from the counter.</li>
                      <li>It is mandatory for children between 3 to 12 years old to purchase minor tickets.</li>
                    </ul>
                  </div>

                  {/* Bangla Instructions */}
                  <div style={{ fontFamily: 'var(--font-bn)' }}>
                    <div style={{ fontWeight: 800, marginBottom: 4, color: '#006633' }}>খেয়াল করুনঃ-</div>
                    <ul style={{ margin: 0, paddingLeft: 14, listStyleType: 'disc' }}>
                      <li>ভ্রমণের সময় প্রত্যেক যাত্রীর এনআইডি/ ছবি সম্বলিত পরিচয়পত্র সাথে রাখা বাধ্যতামূলক।</li>
                      <li>ট্রেন ভ্রমণে আপনার ই-টিকিটের প্রিন্টেড কপি অথবা অনলাইন কপি সাথে রাখুন।</li>
                      <li>কাউন্টার থেকে টিকিট প্রিন্ট করার প্রয়োজন নেই।</li>
                      <li>তিন থেকে বারো বছরের শিশুদের জন্য অপ্রাপ্ত বয়স্ক টিকিট ক্রয় বাধ্যতামূলক।</li>
                    </ul>
                  </div>
                </div>

                {/* ─── Helpline & Anti-Smoking Notices ─── */}
                <div style={{ textAlign: 'center', marginBottom: 12 }}>
                  <div style={{
                    color: '#dc2626',
                    fontSize: 11.5,
                    fontWeight: 800,
                    fontFamily: 'var(--font-bn)',
                    marginBottom: 8
                  }}>
                    রেলওয়ে সেবার জন্য ১৩১ এবং আইন শৃঙ্খলা বিষয়ক সহায়তার জন্য রেলওয়ে পুলিশ হটলাইন ০১৩২০১৭৭৫৯৮ নম্বরে যোগাযোগ করুন।
                  </div>

                  <div style={{
                    background: '#fef2f2',
                    border: '1px solid #fecaca',
                    color: '#b91c1c',
                    fontSize: 12,
                    fontWeight: 800,
                    padding: '6px 12px',
                    borderRadius: 4,
                    display: 'inline-block',
                    fontFamily: 'var(--font-bn)'
                  }}>
                    "ধূমপান ও তামাকজাত দ্রব্য ব্যবহার হইতে বিরত থাকুন, ইহা শাস্তিযোগ্য অপরাধ"
                  </div>
                </div>
              </div>

              {/* ─── Bottom Sign-Off ─── */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderTop: '1px solid #006633',
                paddingTop: 10,
                fontSize: 11,
                fontWeight: 600,
                color: '#1e293b'
              }}>
                <div>
                  Wishing you a pleasant and safe journey—<br />
                  <strong style={{ color: '#006633', fontSize: 12 }}>Bangladesh Railway</strong>
                </div>

                <div style={{ textAlign: 'right', fontFamily: 'var(--font-bn)' }}>
                  আপনার ভ্রমণ সুখকর ও নিরাপদ হোক, এই কামনায়—<br />
                  <strong style={{ color: '#006633', fontSize: 12 }}>বাংলাদেশ রেলওয়ে</strong>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
