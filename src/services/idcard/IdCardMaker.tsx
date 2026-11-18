import React, { useState, useRef, useEffect } from 'react';
import QRCode from 'qrcode';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import {
  CreditCard, Download, Printer, Plus, User, Upload, Image as ImageIcon, CheckCircle2, Clock
} from 'lucide-react';
import { AiCommandBar } from '../../components/ai/AiCommandBar';
import { generateIdCardAi } from '../ai/aiGenerators';
import { saveDocumentHistory } from '../history/documentHistory';
import { RecentHistoryModal } from '../../components/common/RecentHistoryModal';

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
  const [isGeneratingJpg, setIsGeneratingJpg] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth < 1024);
  const [mobileTab, setMobileTab] = useState<'editor' | 'preview'>('editor');
  const [statusNotice, setStatusNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const showNotice = (text: string, type: 'success' | 'error' = 'success') => {
    setStatusNotice({ type, text });
    setTimeout(() => setStatusNotice(null), 3500);
  };

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

  const captureCardCanvas = async () => {
    if (!cardRef.current) return null;
    if (typeof document !== 'undefined' && document.fonts) {
      await document.fonts.ready;
    }
    const target = cardRef.current;
    const exportWidth = target.offsetWidth || 320;
    const exportHeight = target.offsetHeight || 500;
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
        clonedDoc.querySelectorAll<HTMLElement>('.no-print').forEach((np) => {
          np.style.display = 'none';
        });
        let cur: HTMLElement | null = clonedEl.parentElement;
        while (cur && cur !== clonedDoc.body) {
          cur.style.transform = 'none';
          cur.style.webkitTransform = 'none';
          cur.style.zoom = '1';
          cur.style.overflow = 'visible';
          cur.style.boxShadow = 'none';
          cur = cur.parentElement;
        }
        clonedEl.style.transform = 'none';
        clonedEl.style.boxShadow = 'none';
      },
    });
  };

  const handleSaveCard = () => {
    saveDocumentHistory({
      service: 'idcard',
      title: card.fullName || 'ID Badge',
      subtitle: `${card.role} — ${card.company}`,
      badge: card.id,
      data: card,
    });
    showNotice('ID card saved to local history!', 'success');
  };

  const handleDownloadPdf = async () => {
    if (!cardRef.current) return;
    setIsGenerating(true);
    try {
      const canvas = await captureCardCanvas();
      if (!canvas) return;
      const imgData = canvas.toDataURL('image/jpeg', 0.96);
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [85.6, 53.98], // Standard CR80 badge
        compress: true,
      });
      pdf.addImage(imgData, 'JPEG', 0, 0, 53.98, 85.6, undefined, 'FAST');
      pdf.save(`Badge_${card.fullName.replace(/\s+/g, '_')}.pdf`);
      showNotice('ID Card PDF exported successfully!', 'success');
    } catch (e) {
      console.error(e);
      showNotice('Could not export PDF. Please try again.', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadJpg = async () => {
    if (!cardRef.current) return;
    setIsGeneratingJpg(true);
    try {
      const canvas = await captureCardCanvas();
      if (!canvas) return;
      const imgData = canvas.toDataURL('image/jpeg', 0.96);
      const fileName = `Badge_${card.fullName.replace(/\s+/g, '_')}.jpg`;
      const link = document.createElement('a');
      link.download = fileName;
      link.href = imgData;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showNotice(`ID Card JPG downloaded: ${fileName}`, 'success');
    } catch (e) {
      console.error(e);
      showNotice('Could not export JPG. Please try again.', 'error');
    } finally {
      setIsGeneratingJpg(false);
    }
  };

  const handleAiIdCard = async (promptText: string): Promise<string> => {
    const res = await generateIdCardAi(promptText);
    const nextCard: IdCardData = {
      ...card,
      fullName: res.fullName || card.fullName,
      role: res.role || card.role,
      company: res.company || card.company,
      department: res.department || card.department,
      bloodGroup: res.bloodGroup || card.bloodGroup,
      validUntil: res.validUntil || card.validUntil,
    };
    setCard(nextCard);
    saveDocumentHistory({
      service: 'idcard',
      title: nextCard.fullName || 'ID Badge',
      subtitle: `${nextCard.role} — ${nextCard.company}`,
      badge: nextCard.id,
      data: nextCard,
    });
    return res.summary;
  };

  // Auto-run if redirected from Home Central AI Hub
  useEffect(() => {
    try {
      const pending = sessionStorage.getItem('pending_ai_prompt');
      if (pending) {
        sessionStorage.removeItem('pending_ai_prompt');
        Promise.resolve().then(() => handleAiIdCard(pending));
      }
    } catch {
      // ignore
    }
  }, []);

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
        padding: isMobile ? '8px 12px' : '14px 20px',
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
            background: 'linear-gradient(135deg, #06b6d4 0%, #0284c7 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', boxShadow: '0 4px 12px rgba(6, 182, 212, 0.3)',
            flexShrink: 0
          }}>
            <CreditCard size={isMobile ? 18 : 22} />
          </div>
          <div>
            <h1 style={{ fontSize: isMobile ? 15 : 18, fontWeight: 700, margin: 0 }}>ID & Badge Maker</h1>
            {!isMobile && (
              <p style={{ fontSize: 12, color: '#94a3b8', margin: 0 }}>Employee badges, visitor credentials & student cards</p>
            )}
          </div>
        </div>

        {isMobile ? (
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <button
              onClick={() => {
                setCard({
                  ...DEFAULT_CARD,
                  id: 'EMP-' + Math.floor(1000 + Math.random() * 9000),
                });
              }}
              style={{
                background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
                color: '#f1f5f9', padding: '5px 8px', borderRadius: 6, fontSize: 11, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 4
              }}
              title="Reset Card"
            >
              <Plus size={13} /> Reset
            </button>
            <button
              onClick={() => setHistoryOpen(true)}
              style={{
                background: 'rgba(6, 182, 212, 0.14)', border: '1px solid rgba(6, 182, 212, 0.35)',
                color: '#67e8f9', padding: '5px 8px', borderRadius: 6, fontSize: 11, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 3
              }}
              title="Badge History"
            >
              <Clock size={13} />
            </button>
            <div style={{ display: 'flex', background: '#1e293b', borderRadius: 6, padding: 2, gap: 2 }}>
              <button
                onClick={() => setMobileTab('editor')}
                style={{
                  background: mobileTab === 'editor' ? '#0284c7' : 'transparent',
                  color: '#fff', border: 'none', borderRadius: 5, padding: '4px 8px', fontSize: 11, fontWeight: 600, cursor: 'pointer'
                }}
              >
                Form
              </button>
              <button
                onClick={() => setMobileTab('preview')}
                style={{
                  background: mobileTab === 'preview' ? '#0284c7' : 'transparent',
                  color: '#fff', border: 'none', borderRadius: 5, padding: '4px 8px', fontSize: 11, fontWeight: 600, cursor: 'pointer'
                }}
              >
                Badge
              </button>
            </div>
            <button
              onClick={handleDownloadPdf}
              disabled={isGenerating}
              style={{
                background: 'linear-gradient(135deg, #06b6d4 0%, #0284c7 100%)',
                color: '#fff', border: 'none', padding: '5px 8px', borderRadius: 6,
                fontSize: 11, fontWeight: 700, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 3
              }}
            >
              <Download size={13} /> PDF
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button
              onClick={() => {
                setCard({
                  ...DEFAULT_CARD,
                  id: 'EMP-' + Math.floor(1000 + Math.random() * 9000),
                });
              }}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
                color: '#f1f5f9', padding: '8px 12px', borderRadius: 8, fontSize: 13, cursor: 'pointer'
              }}
            >
              <Plus size={15} /> New
            </button>
            <button
              onClick={handleSaveCard}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
                color: '#f1f5f9', padding: '8px 12px', borderRadius: 8, fontSize: 13, cursor: 'pointer'
              }}
            >
              <CheckCircle2 size={15} /> Save
            </button>
            <button
              onClick={() => setHistoryOpen(true)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                background: 'rgba(6, 182, 212, 0.14)', border: '1px solid rgba(6, 182, 212, 0.35)',
                color: '#67e8f9', padding: '8px 12px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer'
              }}
            >
              <Clock size={15} /> History
            </button>
            <button
              onClick={() => window.print()}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
                color: '#f1f5f9', padding: '8px 12px', borderRadius: 8, fontSize: 13, cursor: 'pointer'
              }}
            >
              <Printer size={15} /> Print
            </button>
            <button
              onClick={handleDownloadJpg}
              disabled={isGeneratingJpg}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                background: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)',
                color: '#fff', border: 'none', padding: '8px 14px', borderRadius: 8,
                fontSize: 13, fontWeight: 600, cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(37, 99, 235, 0.35)'
              }}
            >
              <ImageIcon size={15} /> {isGeneratingJpg ? 'Processing...' : 'Download JPG'}
            </button>
            <button
              onClick={handleDownloadPdf}
              disabled={isGenerating}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                background: 'linear-gradient(135deg, #06b6d4 0%, #0284c7 100%)',
                color: '#fff', border: 'none', padding: '8px 14px', borderRadius: 8,
                fontSize: 13, fontWeight: 600, cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(6, 182, 212, 0.4)'
              }}
            >
              <Download size={15} /> {isGenerating ? 'Generating...' : 'Download PDF'}
            </button>
          </div>
        )}
      </div>

      {/* Main Workspace */}
      {statusNotice && (
        <div
          className="no-print"
          style={{
            padding: '8px 16px',
            background: statusNotice.type === 'error' ? '#7f1d1d' : '#065f46',
            color: '#fff',
            fontSize: 12,
            fontWeight: 600,
            textAlign: 'center',
            borderBottom: '1px solid rgba(255,255,255,0.12)',
          }}
        >
          {statusNotice.text}
        </div>
      )}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', position: 'relative' }}>
        {/* Editor */}
        {(!isMobile || mobileTab === 'editor') && (
          <div style={{
            width: isMobile ? '100%' : 380,
            borderRight: isMobile ? 'none' : '1px solid rgba(255, 255, 255, 0.08)',
            background: '#0b1120',
            padding: isMobile ? '16px 14px 80px' : 20,
            overflowY: 'auto',
            WebkitOverflowScrolling: 'touch',
            flexShrink: 0,
            boxSizing: 'border-box'
          }}>
          {/* ── AI Assistant Bar ── */}
          <AiCommandBar
            toolName="idcard"
            placeholder="যেমন: 'তানভীর আহমেদ - সিনিয়র সফটওয়্যার ইঞ্জিনিয়ার, ডিপার্টমেন্ট এআই'"
            onGenerate={handleAiIdCard}
            onReviewPdf={handleDownloadPdf}
            onDownloadJpg={handleDownloadJpg}
            onViewPreview={() => {
              if (isMobile) setMobileTab('preview');
            }}
            onRestoreHistory={(data) => setCard(data)}
          />

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
      )}

      {/* Live Preview */}
      {(!isMobile || mobileTab === 'preview') && (
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: isMobile ? 'flex-start' : 'center',
          padding: isMobile ? '20px 12px 80px' : 30,
          background: '#020617',
          overflowY: 'auto',
          overflowX: 'auto',
          height: '100%',
          boxSizing: 'border-box'
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

          {/* Mobile bottom bar for quick PDF / JPG / Save while in preview tab */}
          {isMobile && (
            <div className="no-print" style={{
              position: 'fixed',
              bottom: 0,
              left: 0,
              right: 0,
              background: 'rgba(15, 23, 42, 0.95)',
              backdropFilter: 'blur(10px)',
              borderTop: '1px solid rgba(255, 255, 255, 0.1)',
              padding: '10px 12px',
              display: 'flex',
              gap: 8,
              zIndex: 40,
              boxSizing: 'border-box'
            }}>
              <button
                onClick={handleSaveCard}
                style={{
                  flex: 1,
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: '#fff',
                  padding: '10px 8px',
                  borderRadius: 8,
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 5
                }}
              >
                <CheckCircle2 size={15} /> Save
              </button>
              <button
                onClick={handleDownloadJpg}
                disabled={isGeneratingJpg}
                style={{
                  flex: 1,
                  background: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)',
                  border: 'none',
                  color: '#fff',
                  padding: '10px 8px',
                  borderRadius: 8,
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 5
                }}
              >
                <ImageIcon size={15} /> JPG
              </button>
              <button
                onClick={handleDownloadPdf}
                disabled={isGenerating}
                style={{
                  flex: 1.5,
                  background: 'linear-gradient(135deg, #06b6d4 0%, #0284c7 100%)',
                  border: 'none',
                  color: '#fff',
                  padding: '10px 8px',
                  borderRadius: 8,
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 5,
                  boxShadow: '0 4px 12px rgba(6, 182, 212, 0.4)'
                }}
              >
                <Download size={15} /> {isGenerating ? '...' : 'PDF'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>

    <RecentHistoryModal
      isOpen={historyOpen}
      service="idcard"
      title="আইডি কার্ড হিস্টোরি ও ড্রাফট"
      onClose={() => setHistoryOpen(false)}
      onRestore={(data) => {
        setCard(data);
        showNotice('Saved ID card restored from history!', 'success');
      }}
    />
  </div>
  );
}
