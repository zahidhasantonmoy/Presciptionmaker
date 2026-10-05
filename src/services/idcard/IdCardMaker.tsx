import React, { useState, useRef, useEffect } from 'react';
import QRCode from 'qrcode';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import {
  CreditCard, Download, Printer, Plus, User, Building, ShieldCheck, Upload
} from 'lucide-react';

interface IdCardData {
  id: string;
  fullName: string;
  role: string;
  company: string;
  department: string;
  bloodGroup: string;
  validUntil: string;
  photoUrl: string;
}

const DEFAULT_CARD: IdCardData = {
  id: 'EMP-9082',
  fullName: 'Marcus Vance',
  role: 'Principal Software Architect',
  company: 'Cyberdyne Systems',
  department: 'Core Infrastructure',
  bloodGroup: 'O+',
  validUntil: '2028-12-31',
  photoUrl: '',
};

export function IdCardMaker() {
  const [card, setCard] = useState<IdCardData>(DEFAULT_CARD);
  const [qrUrl, setQrUrl] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    QRCode.toDataURL(JSON.stringify({ id: card.id, name: card.fullName, company: card.company }), {
      width: 90,
      margin: 1,
      color: { dark: '#0f172a', light: '#ffffff' }
    }).then(setQrUrl).catch(console.error);
  }, [card.id, card.fullName, card.company]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setCard({ ...card, photoUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDownloadPdf = async () => {
    if (!cardRef.current) return;
    setIsGenerating(true);
    try {
      const canvas = await html2canvas(cardRef.current, { scale: 3, useCORS: true });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [85.6, 53.98], // Standard CR80 badge
      });
      pdf.addImage(imgData, 'PNG', 0, 0, 53.98, 85.6);
      pdf.save(`Badge_${card.fullName.replace(/\s+/g, '_')}.pdf`);
    } catch (e) {
      console.error(e);
      alert('Could not export PDF');
    } finally {
      setIsGenerating(false);
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
      {/* Top Header */}
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
            background: 'linear-gradient(135deg, #06b6d4 0%, #0284c7 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', boxShadow: '0 4px 12px rgba(6, 182, 212, 0.3)'
          }}>
            <CreditCard size={22} />
          </div>
          <div>
            <h1 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>ID & Badge Maker</h1>
            <p style={{ fontSize: 12, color: '#94a3b8', margin: 0 }}>Employee badges, visitor credentials & student cards</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={() => window.print()}
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
            disabled={isGenerating}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: 'linear-gradient(135deg, #06b6d4 0%, #0284c7 100%)',
              color: '#fff', border: 'none', padding: '8px 16px', borderRadius: 8,
              fontSize: 13, fontWeight: 600, cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(6, 182, 212, 0.4)'
            }}
          >
            <Download size={16} /> {isGenerating ? 'Generating...' : 'Download Card PDF'}
          </button>
        </div>
      </div>

      {/* Main Workspace */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Editor */}
        <div style={{
          width: 380,
          borderRight: '1px solid rgba(255, 255, 255, 0.08)',
          background: '#0b1120',
          padding: 20,
          overflowY: 'auto'
        }}>
          <h2 style={{ fontSize: 14, fontWeight: 700, color: '#06b6d4', textTransform: 'uppercase', marginBottom: 14 }}>
            ID Card Information
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ fontSize: 12, color: '#94a3b8', display: 'block', marginBottom: 4 }}>Full Name</label>
              <input
                type="text"
                value={card.fullName}
                onChange={e => setCard({ ...card, fullName: e.target.value })}
                style={{ width: '100%', padding: '8px 10px', background: '#1e293b', border: '1px solid #334155', borderRadius: 6, color: '#fff', fontSize: 13, boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ fontSize: 12, color: '#94a3b8', display: 'block', marginBottom: 4 }}>Designation / Role</label>
              <input
                type="text"
                value={card.role}
                onChange={e => setCard({ ...card, role: e.target.value })}
                style={{ width: '100%', padding: '8px 10px', background: '#1e293b', border: '1px solid #334155', borderRadius: 6, color: '#fff', fontSize: 13, boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ fontSize: 12, color: '#94a3b8', display: 'block', marginBottom: 4 }}>Company / Organization</label>
              <input
                type="text"
                value={card.company}
                onChange={e => setCard({ ...card, company: e.target.value })}
                style={{ width: '100%', padding: '8px 10px', background: '#1e293b', border: '1px solid #334155', borderRadius: 6, color: '#fff', fontSize: 13, boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <label style={{ fontSize: 12, color: '#94a3b8', display: 'block', marginBottom: 4 }}>Department</label>
                <input
                  type="text"
                  value={card.department}
                  onChange={e => setCard({ ...card, department: e.target.value })}
                  style={{ width: '100%', padding: '8px 10px', background: '#1e293b', border: '1px solid #334155', borderRadius: 6, color: '#fff', fontSize: 13, boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ fontSize: 12, color: '#94a3b8', display: 'block', marginBottom: 4 }}>ID Number</label>
                <input
                  type="text"
                  value={card.id}
                  onChange={e => setCard({ ...card, id: e.target.value })}
                  style={{ width: '100%', padding: '8px 10px', background: '#1e293b', border: '1px solid #334155', borderRadius: 6, color: '#fff', fontSize: 13, boxSizing: 'border-box' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <label style={{ fontSize: 12, color: '#94a3b8', display: 'block', marginBottom: 4 }}>Blood Group</label>
                <input
                  type="text"
                  value={card.bloodGroup}
                  onChange={e => setCard({ ...card, bloodGroup: e.target.value })}
                  style={{ width: '100%', padding: '8px 10px', background: '#1e293b', border: '1px solid #334155', borderRadius: 6, color: '#fff', fontSize: 13, boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ fontSize: 12, color: '#94a3b8', display: 'block', marginBottom: 4 }}>Valid Until</label>
                <input
                  type="date"
                  value={card.validUntil}
                  onChange={e => setCard({ ...card, validUntil: e.target.value })}
                  style={{ width: '100%', padding: '8px 10px', background: '#1e293b', border: '1px solid #334155', borderRadius: 6, color: '#fff', fontSize: 13, boxSizing: 'border-box' }}
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: 12, color: '#94a3b8', display: 'block', marginBottom: 4 }}>Badge Photo</label>
              <label style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                padding: '10px 14px', background: '#1e293b', border: '1px dashed #475569',
                borderRadius: 8, cursor: 'pointer', color: '#cbd5e1', fontSize: 13
              }}>
                <Upload size={16} /> Choose Image File
                <input type="file" accept="image/*" onChange={handlePhotoUpload} style={{ display: 'none' }} />
              </label>
            </div>
          </div>
        </div>

        {/* Live Preview */}
        <div style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 30,
          background: '#020617',
          overflowY: 'auto'
        }}>
          {/* CR80 Badge Frame */}
          <div
            ref={cardRef}
            style={{
              width: 320,
              height: 500,
              background: '#ffffff',
              color: '#0f172a',
              borderRadius: 18,
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 20px rgba(6, 182, 212, 0.2)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              boxSizing: 'border-box',
              position: 'relative',
            }}
          >
            {/* Top Lanyard Slot Simulation */}
            <div style={{
              position: 'absolute',
              top: 10,
              left: '50%',
              transform: 'translateX(-50%)',
              width: 44,
              height: 8,
              background: '#e2e8f0',
              borderRadius: 4,
            }} />

            {/* Header Banner */}
            <div style={{
              background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
              padding: '30px 20px 24px',
              textAlign: 'center',
              color: '#fff',
            }}>
              <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                {card.company}
              </div>
              <div style={{ fontSize: 10, opacity: 0.8, marginTop: 2 }}>OFFICIAL CREDENTIAL</div>
            </div>

            {/* Photo & Body */}
            <div style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: '0 24px 20px',
              marginTop: -38,
            }}>
              {/* Photo Box */}
              <div style={{
                width: 86,
                height: 86,
                borderRadius: '50%',
                background: '#fff',
                padding: 4,
                boxShadow: '0 6px 12px rgba(0,0,0,0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden'
              }}>
                {card.photoUrl ? (
                  <img src={card.photoUrl} alt="Badge" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', background: '#e2e8f0', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <User size={40} color="#94a3b8" />
                  </div>
                )}
              </div>

              {/* Name & Title */}
              <div style={{ textAlign: 'center', marginTop: 10 }}>
                <h3 style={{ fontSize: 18, fontWeight: 900, color: '#0f172a', margin: 0 }}>{card.fullName}</h3>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#0284c7', marginTop: 2 }}>{card.role}</div>
                <div style={{ fontSize: 11, color: '#64748b', marginTop: 1 }}>{card.department}</div>
              </div>

              {/* Info Table */}
              <div style={{
                width: '100%',
                background: '#f8fafc',
                borderRadius: 10,
                padding: '10px 14px',
                marginTop: 14,
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: 11,
              }}>
                <div>
                  <div style={{ color: '#94a3b8', fontWeight: 600 }}>ID NUMBER</div>
                  <div style={{ fontWeight: 800, color: '#0f172a', marginTop: 2 }}>{card.id}</div>
                </div>
                <div>
                  <div style={{ color: '#94a3b8', fontWeight: 600 }}>BLOOD</div>
                  <div style={{ fontWeight: 800, color: '#dc2626', marginTop: 2 }}>{card.bloodGroup}</div>
                </div>
                <div>
                  <div style={{ color: '#94a3b8', fontWeight: 600 }}>EXPIRES</div>
                  <div style={{ fontWeight: 800, color: '#0f172a', marginTop: 2 }}>{card.validUntil}</div>
                </div>
              </div>

              {/* Scannable QR Code */}
              <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                {qrUrl && (
                  <img src={qrUrl} alt="Card QR" style={{ width: 68, height: 68 }} />
                )}
                <div style={{ fontSize: 8, color: '#94a3b8', marginTop: 2, letterSpacing: '0.05em' }}>
                  SECURITY ENCRYPTED
                </div>
              </div>
            </div>

            {/* Bottom Color Stripe */}
            <div style={{ height: 6, background: '#0284c7' }} />
          </div>
        </div>
      </div>
    </div>
  );
}
