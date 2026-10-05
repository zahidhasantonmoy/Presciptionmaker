import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import {
  Ticket, Calendar, Clock, MapPin, User, Download, Printer,
  Sparkles, RefreshCw, Trash2, Plus, CheckCircle2, Shield
} from 'lucide-react';

interface TicketData {
  id: string;
  eventName: string;
  category: string;
  attendeeName: string;
  date: string;
  time: string;
  venue: string;
  seat: string;
  gate: string;
  ticketTier: string;
  price: string;
  currency: string;
  organizer: string;
  createdAt: string;
}

const DEFAULT_TICKET: TicketData = {
  id: 'TCK-' + Math.floor(100000 + Math.random() * 900000),
  eventName: 'Global Tech Conference 2026',
  category: 'Keynote & Networking Pass',
  attendeeName: 'Alex Mercer',
  date: '2026-11-15',
  time: '09:30 AM',
  venue: 'Grand Convention Center, Hall 4',
  seat: 'VIP-A14',
  gate: 'Gate 2',
  ticketTier: 'VIP ACCESS',
  price: '150',
  currency: 'USD',
  organizer: 'Nexus Innovators Guild',
  createdAt: new Date().toISOString(),
};

export function TicketMaker() {
  const [ticket, setTicket] = useState<TicketData>(DEFAULT_TICKET);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [savedTickets, setSavedTickets] = useState<TicketData[]>(() => {
    try {
      const stored = localStorage.getItem('personal_tickets_db');
      return stored ? JSON.parse(stored) : [DEFAULT_TICKET];
    } catch {
      return [DEFAULT_TICKET];
    }
  });
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const ticketRef = useRef<HTMLDivElement>(null);

  // Generate QR code whenever ticket ID or event changes
  useEffect(() => {
    const payload = JSON.stringify({
      id: ticket.id,
      event: ticket.eventName,
      name: ticket.attendeeName,
      seat: ticket.seat,
    });
    QRCode.toDataURL(payload, { width: 140, margin: 1, color: { dark: '#0f172a', light: '#ffffff' } })
      .then(url => setQrDataUrl(url))
      .catch(console.error);
  }, [ticket.id, ticket.eventName, ticket.attendeeName, ticket.seat]);

  // Persist tickets
  const saveCurrentTicket = () => {
    const updated = [ticket, ...savedTickets.filter(t => t.id !== ticket.id)];
    setSavedTickets(updated);
    localStorage.setItem('personal_tickets_db', JSON.stringify(updated));
    alert('Ticket saved to local history!');
  };

  const createNewTicket = () => {
    const newId = 'TCK-' + Math.floor(100000 + Math.random() * 900000);
    setTicket({
      ...DEFAULT_TICKET,
      id: newId,
      createdAt: new Date().toISOString(),
    });
  };

  const deleteTicket = (id: string) => {
    const filtered = savedTickets.filter(t => t.id !== id);
    setSavedTickets(filtered);
    localStorage.setItem('personal_tickets_db', JSON.stringify(filtered));
  };

  // Export PDF
  const handleDownloadPdf = async () => {
    if (!ticketRef.current) return;
    setIsGeneratingPdf(true);
    try {
      const canvas = await html2canvas(ticketRef.current, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: [canvas.width * 0.264583, canvas.height * 0.264583],
      });
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width * 0.264583, canvas.height * 0.264583);
      pdf.save(`${ticket.eventName.replace(/\s+/g, '_')}_${ticket.id}.pdf`);
    } catch (err) {
      console.error('Failed to export ticket PDF:', err);
      alert('Could not export PDF. Please check console.');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handlePrint = () => {
    window.print();
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
      {/* Service Header Bar */}
      <div style={{
        padding: '16px 24px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: '#0f172a',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10,
            background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)'
          }}>
            <Ticket size={22} />
          </div>
          <div>
            <h1 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Ticket Maker</h1>
            <p style={{ fontSize: 12, color: '#94a3b8', margin: 0 }}>Create, design, and print verified event passes</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={createNewTicket}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
              color: '#f1f5f9', padding: '8px 14px', borderRadius: 8, fontSize: 13, cursor: 'pointer'
            }}
          >
            <Plus size={16} /> New Ticket
          </button>
          <button
            onClick={saveCurrentTicket}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
              color: '#f1f5f9', padding: '8px 14px', borderRadius: 8, fontSize: 13, cursor: 'pointer'
            }}
          >
            <CheckCircle2 size={16} /> Save
          </button>
          <button
            onClick={handlePrint}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
              color: '#f1f5f9', padding: '8px 14px', borderRadius: 8, fontSize: 13, cursor: 'pointer'
            }}
          >
            <Printer size={16} /> Print
          </button>
          <button
            onClick={handleDownloadPdf}
            disabled={isGeneratingPdf}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: 'linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)',
              color: '#fff', border: 'none', padding: '8px 16px', borderRadius: 8,
              fontSize: 13, fontWeight: 600, cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(245, 158, 11, 0.4)'
            }}
          >
            <Download size={16} /> {isGeneratingPdf ? 'Generating...' : 'Download PDF'}
          </button>
        </div>
      </div>

      {/* Main Workspace (Editor + Live Preview) */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Editor Form */}
        <div style={{
          width: 380,
          borderRight: '1px solid rgba(255, 255, 255, 0.08)',
          background: '#0b1120',
          padding: 20,
          overflowY: 'auto'
        }}>
          <h2 style={{ fontSize: 14, fontWeight: 700, color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 16 }}>
            Ticket Details
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ fontSize: 12, color: '#94a3b8', display: 'block', marginBottom: 4 }}>Event Title</label>
              <input
                type="text"
                value={ticket.eventName}
                onChange={e => setTicket({ ...ticket, eventName: e.target.value })}
                style={{ width: '100%', padding: '9px 12px', background: '#1e293b', border: '1px solid #334155', borderRadius: 6, color: '#fff', fontSize: 13, boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <label style={{ fontSize: 12, color: '#94a3b8', display: 'block', marginBottom: 4 }}>Ticket Tier</label>
                <input
                  type="text"
                  value={ticket.ticketTier}
                  onChange={e => setTicket({ ...ticket, ticketTier: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', background: '#1e293b', border: '1px solid #334155', borderRadius: 6, color: '#fff', fontSize: 13, boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ fontSize: 12, color: '#94a3b8', display: 'block', marginBottom: 4 }}>Price</label>
                <input
                  type="text"
                  value={ticket.price}
                  onChange={e => setTicket({ ...ticket, price: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', background: '#1e293b', border: '1px solid #334155', borderRadius: 6, color: '#fff', fontSize: 13, boxSizing: 'border-box' }}
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: 12, color: '#94a3b8', display: 'block', marginBottom: 4 }}>Attendee Name</label>
              <input
                type="text"
                value={ticket.attendeeName}
                onChange={e => setTicket({ ...ticket, attendeeName: e.target.value })}
                style={{ width: '100%', padding: '9px 12px', background: '#1e293b', border: '1px solid #334155', borderRadius: 6, color: '#fff', fontSize: 13, boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <label style={{ fontSize: 12, color: '#94a3b8', display: 'block', marginBottom: 4 }}>Date</label>
                <input
                  type="date"
                  value={ticket.date}
                  onChange={e => setTicket({ ...ticket, date: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', background: '#1e293b', border: '1px solid #334155', borderRadius: 6, color: '#fff', fontSize: 13, boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ fontSize: 12, color: '#94a3b8', display: 'block', marginBottom: 4 }}>Time</label>
                <input
                  type="text"
                  value={ticket.time}
                  onChange={e => setTicket({ ...ticket, time: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', background: '#1e293b', border: '1px solid #334155', borderRadius: 6, color: '#fff', fontSize: 13, boxSizing: 'border-box' }}
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: 12, color: '#94a3b8', display: 'block', marginBottom: 4 }}>Venue / Location</label>
              <input
                type="text"
                value={ticket.venue}
                onChange={e => setTicket({ ...ticket, venue: e.target.value })}
                style={{ width: '100%', padding: '9px 12px', background: '#1e293b', border: '1px solid #334155', borderRadius: 6, color: '#fff', fontSize: 13, boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <label style={{ fontSize: 12, color: '#94a3b8', display: 'block', marginBottom: 4 }}>Seat</label>
                <input
                  type="text"
                  value={ticket.seat}
                  onChange={e => setTicket({ ...ticket, seat: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', background: '#1e293b', border: '1px solid #334155', borderRadius: 6, color: '#fff', fontSize: 13, boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ fontSize: 12, color: '#94a3b8', display: 'block', marginBottom: 4 }}>Gate</label>
                <input
                  type="text"
                  value={ticket.gate}
                  onChange={e => setTicket({ ...ticket, gate: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', background: '#1e293b', border: '1px solid #334155', borderRadius: 6, color: '#fff', fontSize: 13, boxSizing: 'border-box' }}
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: 12, color: '#94a3b8', display: 'block', marginBottom: 4 }}>Organizer</label>
              <input
                type="text"
                value={ticket.organizer}
                onChange={e => setTicket({ ...ticket, organizer: e.target.value })}
                style={{ width: '100%', padding: '9px 12px', background: '#1e293b', border: '1px solid #334155', borderRadius: 6, color: '#fff', fontSize: 13, boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ fontSize: 12, color: '#94a3b8', display: 'block', marginBottom: 4 }}>Ticket Serial #</label>
              <div style={{ display: 'flex', gap: 6 }}>
                <input
                  type="text"
                  value={ticket.id}
                  onChange={e => setTicket({ ...ticket, id: e.target.value })}
                  style={{ flex: 1, padding: '9px 12px', background: '#1e293b', border: '1px solid #334155', borderRadius: 6, color: '#fff', fontSize: 13 }}
                />
                <button
                  type="button"
                  onClick={() => setTicket({ ...ticket, id: 'TCK-' + Math.floor(100000 + Math.random() * 900000) })}
                  style={{ background: '#334155', border: 'none', borderRadius: 6, color: '#fff', padding: '0 10px', cursor: 'pointer' }}
                  title="Generate new ID"
                >
                  <RefreshCw size={14} />
                </button>
              </div>
            </div>
          </div>

          {/* Saved History */}
          <div style={{ marginTop: 28, paddingTop: 18, borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <h3 style={{ fontSize: 13, color: '#94a3b8', textTransform: 'uppercase', marginBottom: 12 }}>Saved Tickets ({savedTickets.length})</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {savedTickets.map(item => (
                <div
                  key={item.id}
                  style={{
                    background: item.id === ticket.id ? '#1e293b' : 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid',
                    borderColor: item.id === ticket.id ? '#f59e0b' : 'rgba(255, 255, 255, 0.06)',
                    borderRadius: 8,
                    padding: '8px 12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer'
                  }}
                  onClick={() => setTicket(item)}
                >
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>{item.eventName}</div>
                    <div style={{ fontSize: 11, color: '#94a3b8' }}>{item.attendeeName} · {item.id}</div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteTicket(item.id);
                    }}
                    style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: 4 }}
                    title="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Live Ticket Preview */}
        <div style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 40,
          background: 'radial-gradient(circle at center, #1e293b 0%, #090d16 100%)',
          overflowY: 'auto'
        }}>
          {/* Ticket Canvas */}
          <div
            ref={ticketRef}
            style={{
              width: 720,
              height: 290,
              display: 'flex',
              background: '#ffffff',
              color: '#0f172a',
              borderRadius: 16,
              overflow: 'hidden',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 30px rgba(245, 158, 11, 0.2)',
              position: 'relative',
            }}
          >
            {/* Left Main Body (Event & Attendee Info) */}
            <div style={{
              flex: 1,
              padding: '28px 32px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
              position: 'relative',
            }}>
              {/* Event Header */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{
                    fontSize: 11, fontWeight: 800, letterSpacing: '0.1em',
                    background: '#0f172a', color: '#fff', padding: '3px 10px', borderRadius: 4
                  }}>
                    {ticket.ticketTier}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#f59e0b', fontSize: 12, fontWeight: 700 }}>
                    <Shield size={14} /> VERIFIED PASS
                  </div>
                </div>

                <h2 style={{ fontSize: 24, fontWeight: 900, color: '#0f172a', margin: '4px 0 2px', lineHeight: 1.2 }}>
                  {ticket.eventName}
                </h2>
                <div style={{ fontSize: 13, color: '#64748b' }}>Hosted by {ticket.organizer}</div>
              </div>

              {/* Grid Information */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: 12,
                padding: '12px 14px',
                background: '#f1f5f9',
                borderRadius: 10,
                marginTop: 8
              }}>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Date</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{ticket.date}</div>
                </div>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Time</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{ticket.time}</div>
                </div>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Seat</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{ticket.seat}</div>
                </div>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Gate</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{ticket.gate}</div>
                </div>
              </div>

              {/* Bottom Row */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 }}>
                <div>
                  <div style={{ fontSize: 10, color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Attendee</div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: '#0f172a' }}>{ticket.attendeeName}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 10, color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Venue</div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#334155' }}>{ticket.venue}</div>
                </div>
              </div>
            </div>

            {/* Perforated Divider */}
            <div style={{
              width: 2,
              borderLeft: '2px dashed #cbd5e1',
              position: 'relative',
              background: '#f8fafc',
            }}>
              {/* Top Notch */}
              <div style={{
                position: 'absolute',
                top: -12,
                left: -12,
                width: 24,
                height: 24,
                background: '#090d16',
                borderRadius: '50%',
              }} />
              {/* Bottom Notch */}
              <div style={{
                position: 'absolute',
                bottom: -12,
                left: -12,
                width: 24,
                height: 24,
                background: '#090d16',
                borderRadius: '50%',
              }} />
            </div>

            {/* Right Stub (QR Code & Scan) */}
            <div style={{
              width: 210,
              padding: '24px 20px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: '#fafaf9',
              textAlign: 'center',
            }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 800, color: '#f59e0b', letterSpacing: '0.05em' }}>ADMIT ONE</div>
                <div style={{ fontSize: 16, fontWeight: 900, color: '#0f172a', margin: '2px 0' }}>
                  {ticket.currency} ${ticket.price}
                </div>
              </div>

              {/* Scannable QR */}
              {qrDataUrl && (
                <div style={{
                  padding: 6,
                  background: '#fff',
                  border: '1px solid #e2e8f0',
                  borderRadius: 10,
                  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)'
                }}>
                  <img src={qrDataUrl} alt="Ticket QR" style={{ width: 110, height: 110, display: 'block' }} />
                </div>
              )}

              <div>
                <div style={{ fontSize: 10, fontFamily: 'monospace', color: '#64748b', fontWeight: 700 }}>
                  {ticket.id}
                </div>
                <div style={{ fontSize: 9, color: '#94a3b8', marginTop: 2 }}>Scan for Entry Verification</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
