import React, { useState, useRef, useEffect } from 'react';
import QRCode from 'qrcode';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import {
  Award, Download, Printer, Plus, CheckCircle2, ShieldCheck
} from 'lucide-react';

interface CertificateData {
  id: string;
  title: string;
  recipientName: string;
  courseOrAchievement: string;
  date: string;
  issuerName: string;
  issuerTitle: string;
  organization: string;
}

const DEFAULT_CERTIFICATE: CertificateData = {
  id: 'CRT-2026-' + Math.floor(1000 + Math.random() * 9000),
  title: 'CERTIFICATE OF ACHIEVEMENT',
  recipientName: 'Sarah Jenkins',
  courseOrAchievement: 'has demonstrated exemplary competence and mastery in Full-Stack Systems Architecture and Cloud Engineering.',
  date: '2026-10-05',
  issuerName: 'Dr. Arthur Vance',
  issuerTitle: 'Director of Academic Affairs',
  organization: 'Nexus Institute of Technology',
};

export function CertificateMaker() {
  const [cert, setCert] = useState<CertificateData>(DEFAULT_CERTIFICATE);
  const [qrUrl, setQrUrl] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const certRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    QRCode.toDataURL(JSON.stringify({ id: cert.id, recipient: cert.recipientName, org: cert.organization }), {
      width: 100,
      margin: 1,
      color: { dark: '#1e293b', light: '#ffffff' }
    }).then(setQrUrl).catch(console.error);
  }, [cert.id, cert.recipientName, cert.organization]);

  const handleDownloadPdf = async () => {
    if (!certRef.current) return;
    setIsGenerating(true);
    try {
      const canvas = await html2canvas(certRef.current, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
      });
      pdf.addImage(imgData, 'PNG', 0, 0, 297, 210);
      pdf.save(`Certificate_${cert.recipientName.replace(/\s+/g, '_')}.pdf`);
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
      {/* Header */}
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
            background: 'linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', boxShadow: '0 4px 12px rgba(168, 85, 247, 0.3)'
          }}>
            <Award size={22} />
          </div>
          <div>
            <h1 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Certificate Maker</h1>
            <p style={{ fontSize: 12, color: '#94a3b8', margin: 0 }}>Design and issue verified diplomas & certificates</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={() => {
              setCert({
                ...DEFAULT_CERTIFICATE,
                id: 'CRT-2026-' + Math.floor(1000 + Math.random() * 9000),
              });
            }}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
              color: '#f1f5f9', padding: '8px 14px', borderRadius: 8, fontSize: 13, cursor: 'pointer'
            }}
          >
            <Plus size={16} /> New
          </button>
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
              background: 'linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)',
              color: '#fff', border: 'none', padding: '8px 16px', borderRadius: 8,
              fontSize: 13, fontWeight: 600, cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(168, 85, 247, 0.4)'
            }}
          >
            <Download size={16} /> {isGenerating ? 'Generating...' : 'Download PDF'}
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
          <h2 style={{ fontSize: 14, fontWeight: 700, color: '#a855f7', textTransform: 'uppercase', marginBottom: 14 }}>
            Certificate Form
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ fontSize: 12, color: '#94a3b8', display: 'block', marginBottom: 4 }}>Certificate Title</label>
              <input
                type="text"
                value={cert.title}
                onChange={e => setCert({ ...cert, title: e.target.value })}
                style={{ width: '100%', padding: '8px 10px', background: '#1e293b', border: '1px solid #334155', borderRadius: 6, color: '#fff', fontSize: 13, boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ fontSize: 12, color: '#94a3b8', display: 'block', marginBottom: 4 }}>Recipient Full Name</label>
              <input
                type="text"
                value={cert.recipientName}
                onChange={e => setCert({ ...cert, recipientName: e.target.value })}
                style={{ width: '100%', padding: '8px 10px', background: '#1e293b', border: '1px solid #334155', borderRadius: 6, color: '#fff', fontSize: 13, boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ fontSize: 12, color: '#94a3b8', display: 'block', marginBottom: 4 }}>Citation / Achievement Text</label>
              <textarea
                rows={3}
                value={cert.courseOrAchievement}
                onChange={e => setCert({ ...cert, courseOrAchievement: e.target.value })}
                style={{ width: '100%', padding: '8px 10px', background: '#1e293b', border: '1px solid #334155', borderRadius: 6, color: '#fff', fontSize: 13, boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ fontSize: 12, color: '#94a3b8', display: 'block', marginBottom: 4 }}>Organization / Institution</label>
              <input
                type="text"
                value={cert.organization}
                onChange={e => setCert({ ...cert, organization: e.target.value })}
                style={{ width: '100%', padding: '8px 10px', background: '#1e293b', border: '1px solid #334155', borderRadius: 6, color: '#fff', fontSize: 13, boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <label style={{ fontSize: 12, color: '#94a3b8', display: 'block', marginBottom: 4 }}>Signatory Name</label>
                <input
                  type="text"
                  value={cert.issuerName}
                  onChange={e => setCert({ ...cert, issuerName: e.target.value })}
                  style={{ width: '100%', padding: '8px 10px', background: '#1e293b', border: '1px solid #334155', borderRadius: 6, color: '#fff', fontSize: 13, boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ fontSize: 12, color: '#94a3b8', display: 'block', marginBottom: 4 }}>Signatory Title</label>
                <input
                  type="text"
                  value={cert.issuerTitle}
                  onChange={e => setCert({ ...cert, issuerTitle: e.target.value })}
                  style={{ width: '100%', padding: '8px 10px', background: '#1e293b', border: '1px solid #334155', borderRadius: 6, color: '#fff', fontSize: 13, boxSizing: 'border-box' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <label style={{ fontSize: 12, color: '#94a3b8', display: 'block', marginBottom: 4 }}>Date of Issue</label>
                <input
                  type="date"
                  value={cert.date}
                  onChange={e => setCert({ ...cert, date: e.target.value })}
                  style={{ width: '100%', padding: '8px 10px', background: '#1e293b', border: '1px solid #334155', borderRadius: 6, color: '#fff', fontSize: 13, boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ fontSize: 12, color: '#94a3b8', display: 'block', marginBottom: 4 }}>Certificate ID</label>
                <input
                  type="text"
                  value={cert.id}
                  onChange={e => setCert({ ...cert, id: e.target.value })}
                  style={{ width: '100%', padding: '8px 10px', background: '#1e293b', border: '1px solid #334155', borderRadius: 6, color: '#fff', fontSize: 13, boxSizing: 'border-box' }}
                />
              </div>
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
          {/* Certificate Board */}
          <div
            ref={certRef}
            style={{
              width: 820,
              height: 580,
              background: '#ffffff',
              color: '#0f172a',
              borderRadius: 8,
              padding: '24px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
              boxSizing: 'border-box',
              position: 'relative',
            }}
          >
            {/* Ornamental Double Border */}
            <div style={{
              width: '100%',
              height: '100%',
              border: '4px solid #b45309',
              boxSizing: 'border-box',
              padding: 16,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              alignItems: 'center',
              textAlign: 'center',
              position: 'relative',
              background: 'radial-gradient(ellipse at center, #ffffff 0%, #fefce8 100%)',
            }}>
              {/* Inner thin frame */}
              <div style={{
                position: 'absolute',
                top: 8, bottom: 8, left: 8, right: 8,
                border: '1px solid #d97706',
                pointerEvents: 'none'
              }} />

              {/* Organization Header */}
              <div style={{ marginTop: 12 }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: '#b45309', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
                  {cert.organization}
                </div>
                <h1 style={{
                  fontSize: 28,
                  fontWeight: 900,
                  letterSpacing: '0.08em',
                  color: '#1e293b',
                  margin: '12px 0 6px',
                  fontFamily: 'Georgia, serif'
                }}>
                  {cert.title}
                </h1>
                <div style={{ fontSize: 13, color: '#64748b', fontStyle: 'italic' }}>
                  This official honor is proudly presented to
                </div>
              </div>

              {/* Recipient Name */}
              <div style={{ margin: '8px 0' }}>
                <div style={{
                  fontSize: 36,
                  fontWeight: 800,
                  color: '#0f172a',
                  borderBottom: '2px solid #b45309',
                  paddingBottom: 6,
                  display: 'inline-block',
                  minWidth: 320,
                  fontFamily: 'Georgia, serif'
                }}>
                  {cert.recipientName}
                </div>
                <p style={{
                  fontSize: 14,
                  color: '#475569',
                  maxWidth: 580,
                  margin: '16px auto 0',
                  lineHeight: 1.6
                }}>
                  {cert.courseOrAchievement}
                </p>
              </div>

              {/* Bottom Signatures & QR Seal */}
              <div style={{
                width: '100%',
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'space-between',
                padding: '0 32px 12px'
              }}>
                {/* Date */}
                <div style={{ textAlign: 'center', width: 140 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', borderBottom: '1px solid #94a3b8', paddingBottom: 4 }}>
                    {cert.date}
                  </div>
                  <div style={{ fontSize: 10, color: '#64748b', textTransform: 'uppercase', marginTop: 4 }}>Date of Issue</div>
                </div>

                {/* Golden Badge & QR */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  {qrUrl && (
                    <img src={qrUrl} alt="Verify QR" style={{ width: 64, height: 64, border: '1px solid #e2e8f0', borderRadius: 4 }} />
                  )}
                  <div style={{ fontSize: 9, color: '#64748b', marginTop: 4, fontFamily: 'monospace' }}>{cert.id}</div>
                </div>

                {/* Signatory */}
                <div style={{ textAlign: 'center', width: 180 }}>
                  <div style={{ fontSize: 14, fontWeight: 800, color: '#1e293b', borderBottom: '1px solid #94a3b8', paddingBottom: 4, fontFamily: 'cursive' }}>
                    {cert.issuerName}
                  </div>
                  <div style={{ fontSize: 10, color: '#64748b', textTransform: 'uppercase', marginTop: 4 }}>
                    {cert.issuerTitle}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
