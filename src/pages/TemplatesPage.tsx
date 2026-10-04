import React, { useState } from 'react';
import { Plus, Trash2, Edit3, Save, Star, X } from 'lucide-react';
import { useStore } from '../store/useStore';
import { useToast } from '../components/ui/Toast';
import { ConfirmModal } from '../components/ui/Modal';
import type { PrescriptionTemplate } from '../types';
import { v4 as uuidv4 } from 'uuid';

export function TemplatesPage() {
  const {
    prescriptionTemplates, savePrescriptionTemplate, deletePrescriptionTemplate,
    medicineCatalog, adviceTemplates, saveAdviceTemplate, deleteAdviceTemplate,
    toggleAdviceFavorite, toggleMedicineFavorite, toggleDiagnosisFavorite,
    diagnosisCatalog, testCatalog, toggleTestFavorite,
  } = useStore();
  const { showToast } = useToast();

  const [tab, setTab] = useState<'templates' | 'medicines' | 'tests' | 'advice'>('templates');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteType, setDeleteType] = useState<'template' | 'advice'>('template');
  const [newAdviceTitle, setNewAdviceTitle] = useState('');
  const [newAdviceContent, setNewAdviceContent] = useState('');
  const [newAdviceContentBn, setNewAdviceContentBn] = useState('');
  const [showNewAdvice, setShowNewAdvice] = useState(false);

  const handleDeleteTemplate = (id: string) => {
    deletePrescriptionTemplate(id);
    showToast('Template deleted', 'info');
    setDeleteId(null);
  };

  const handleDeleteAdvice = (id: string) => {
    deleteAdviceTemplate(id);
    showToast('Advice template deleted', 'info');
    setDeleteId(null);
  };

  const handleSaveAdvice = () => {
    if (!newAdviceTitle.trim()) { showToast('Title is required', 'error'); return; }
    if (!newAdviceContent.trim()) { showToast('Content is required', 'error'); return; }
    saveAdviceTemplate({
      title: newAdviceTitle,
      content: newAdviceContent,
      contentBn: newAdviceContentBn,
      isFavorite: false,
    });
    setNewAdviceTitle(''); setNewAdviceContent(''); setNewAdviceContentBn(''); setShowNewAdvice(false);
    showToast('Advice template saved!', 'success');
  };

  const TABS = [
    { key: 'templates', label: 'Prescription Templates' },
    { key: 'medicines', label: 'Medicine Catalog' },
    { key: 'tests', label: 'Test Catalog' },
    { key: 'advice', label: 'Advice Templates' },
  ] as const;

  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1e293b', marginBottom: 16 }}>Templates & Catalog</h1>

      {/* Tab bar */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20, borderBottom: '2px solid #e2e8f0', paddingBottom: 0 }}>
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            style={{
              padding: '8px 16px', background: 'none', border: 'none', cursor: 'pointer',
              fontSize: 13, fontWeight: tab === t.key ? 700 : 500,
              color: tab === t.key ? '#1e40af' : '#64748b',
              borderBottom: tab === t.key ? '2px solid #1e40af' : '2px solid transparent',
              marginBottom: -2, transition: 'all 0.15s',
            }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ─── Prescription Templates ──────────────────────────────────────── */}
      {tab === 'templates' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
            <p style={{ color: '#64748b', fontSize: 14, margin: 0 }}>
              Save common prescription patterns as templates for quick reuse.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
            {prescriptionTemplates.map(t => (
              <div key={t.id} className="card" style={{ padding: 16 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 14, color: '#1e40af' }}>{t.name}</div>
                    {t.isDemo && <span className="badge badge-demo" style={{ fontSize: 10, marginTop: 4 }}>Demo</span>}
                    {t.description && <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>{t.description}</div>}
                  </div>
                  {!t.isDemo && (
                    <button className="btn-icon" style={{ color: '#ef4444' }}
                      onClick={() => { setDeleteId(t.id); setDeleteType('template'); }}>
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
                <div style={{ marginTop: 10, fontSize: 12, color: '#6b7280' }}>
                  {t.diagnoses.length > 0 && <div>🩺 {t.diagnoses.map(d => d.text).join(', ')}</div>}
                  {t.medicines.length > 0 && <div>💊 {t.medicines.length} medicine{t.medicines.length !== 1 ? 's' : ''}</div>}
                  {t.investigations.length > 0 && <div>🔬 {t.investigations.length} test{t.investigations.length !== 1 ? 's' : ''}</div>}
                  {t.advice && <div>📋 Has advice</div>}
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 16, padding: 16, background: '#f8faff', borderRadius: 10, border: '1.5px dashed #c7d7fa' }}>
            <div style={{ fontSize: 13, color: '#64748b' }}>
              💡 Tip: To create a new template, build a prescription in the builder, then use <strong>Save as Template</strong> (coming in next update). 
              Templates help you quickly fill in common diagnosis+medicine combinations for frequent conditions.
            </div>
          </div>
        </div>
      )}

      {/* ─── Medicine Catalog ──────────────────────────────────────────────── */}
      {tab === 'medicines' && (
        <div>
          <p style={{ color: '#64748b', fontSize: 14, marginBottom: 14 }}>
            Your personal medicine catalog. Medicines are added automatically when you use them in prescriptions.
            Mark favorites for quick access.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {medicineCatalog.sort((a, b) => (Number(b.isFavorite) - Number(a.isFavorite)) || (b.useCount - a.useCount)).map(m => (
              <div key={m.id} className="card" style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
                <button className="btn-icon" onClick={() => toggleMedicineFavorite(m.id)} title="Toggle favorite">
                  <Star size={16} fill={m.isFavorite ? '#f59e0b' : 'none'} color={m.isFavorite ? '#f59e0b' : '#94a3b8'} />
                </button>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 13, color: '#1e293b' }}>{m.name}</div>
                  {m.genericName && <div style={{ fontSize: 11, color: '#64748b' }}>{m.genericName}</div>}
                </div>
                <span className="badge badge-gray" style={{ fontSize: 10 }}>{m.form}</span>
                <span style={{ fontSize: 11, color: '#94a3b8' }}>used {m.useCount}×</span>
              </div>
            ))}
            {medicineCatalog.length === 0 && (
              <div style={{ textAlign: 'center', padding: 32, color: '#94a3b8', fontSize: 13 }}>
                No medicines yet. They'll appear here as you use them.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── Test Catalog ──────────────────────────────────────────────────── */}
      {tab === 'tests' && (
        <div>
          <p style={{ color: '#64748b', fontSize: 14, marginBottom: 14 }}>
            Your test and investigation catalog. Mark favorites for quick access during prescription creation.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {testCatalog.sort((a, b) => (Number(b.isFavorite) - Number(a.isFavorite)) || (b.useCount - a.useCount)).map(t => (
              <div key={t.id} className="card" style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
                <button className="btn-icon" onClick={() => toggleTestFavorite(t.id)} title="Toggle favorite">
                  <Star size={16} fill={t.isFavorite ? '#f59e0b' : 'none'} color={t.isFavorite ? '#f59e0b' : '#94a3b8'} />
                </button>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{t.name}</div>
                </div>
                <span className={`badge ${t.category === 'lab' ? 'badge-blue' : t.category === 'imaging' ? 'badge-yellow' : 'badge-gray'}`} style={{ fontSize: 10 }}>
                  {t.category}
                </span>
                <span style={{ fontSize: 11, color: '#94a3b8' }}>used {t.useCount}×</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── Advice Templates ─────────────────────────────────────────────── */}
      {tab === 'advice' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
            <p style={{ color: '#64748b', fontSize: 14, margin: 0 }}>
              Save reusable advice text (English + Bangla) to quickly apply during prescription creation.
            </p>
            <button className="btn-primary btn-sm" onClick={() => setShowNewAdvice(true)}>
              <Plus size={14} /> New Advice Template
            </button>
          </div>

          {/* New advice form */}
          {showNewAdvice && (
            <div className="card" style={{ padding: 16, marginBottom: 14, border: '1.5px solid #c7d7fa' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                <span style={{ fontWeight: 700, fontSize: 14, color: '#1e40af' }}>New Advice Template</span>
                <button className="btn-icon" onClick={() => setShowNewAdvice(false)}><X size={16} /></button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div>
                  <label className="form-label">Title *</label>
                  <input className="form-input" value={newAdviceTitle} onChange={e => setNewAdviceTitle(e.target.value)} placeholder="e.g. Back Pain Advice" />
                </div>
                <div>
                  <label className="form-label">Advice (English) *</label>
                  <textarea className="form-input" value={newAdviceContent} onChange={e => setNewAdviceContent(e.target.value)} rows={3} placeholder="Enter advice in English..." style={{ resize: 'vertical' }} />
                </div>
                <div>
                  <label className="form-label">পরামর্শ (বাংলা)</label>
                  <textarea className="form-input bn" value={newAdviceContentBn} onChange={e => setNewAdviceContentBn(e.target.value)} rows={3} placeholder="বাংলায় পরামর্শ লিখুন..." style={{ resize: 'vertical', fontFamily: 'var(--font-bn), sans-serif' }} />
                </div>
                <button className="btn-primary" style={{ alignSelf: 'flex-start' }} onClick={handleSaveAdvice}>
                  <Save size={14} /> Save Template
                </button>
              </div>
            </div>
          )}

          {/* Advice list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {adviceTemplates.map(a => (
              <div key={a.id} className="card" style={{ padding: '12px 16px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <button className="btn-icon" onClick={() => toggleAdviceFavorite(a.id)}>
                    <Star size={16} fill={a.isFavorite ? '#f59e0b' : 'none'} color={a.isFavorite ? '#f59e0b' : '#94a3b8'} />
                  </button>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 14, color: '#1e293b', marginBottom: 4 }}>{a.title}</div>
                    <div style={{ fontSize: 12, color: '#374151', lineHeight: 1.5 }}>{a.content}</div>
                    {a.contentBn && (
                      <div className="bn" style={{ fontFamily: 'var(--font-bn)', fontSize: 12, color: '#6b7280', marginTop: 4, lineHeight: 1.7 }}>
                        {a.contentBn}
                      </div>
                    )}
                  </div>
                  <button className="btn-icon" style={{ color: '#ef4444' }}
                    onClick={() => { setDeleteId(a.id); setDeleteType('advice'); }}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
            {adviceTemplates.length === 0 && (
              <div style={{ textAlign: 'center', padding: 32, color: '#94a3b8', fontSize: 13 }}>
                No advice templates yet. Add one above.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Delete confirm */}
      <ConfirmModal
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => {
          if (!deleteId) return;
          if (deleteType === 'template') handleDeleteTemplate(deleteId);
          else handleDeleteAdvice(deleteId);
        }}
        title={`Delete ${deleteType === 'template' ? 'Template' : 'Advice Template'}`}
        message="Are you sure you want to delete this? This cannot be undone."
        confirmLabel="Delete"
        dangerous
      />
    </div>
  );
}
