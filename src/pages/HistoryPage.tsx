import React, { useState } from 'react';
import {
  Plus, Search, FileText, Copy, Trash2, Printer, Edit3, Clock, User
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { PrescriptionPreview } from '../components/prescription/PrescriptionPreview';
import { PrintPreviewModal } from '../components/prescription/PrintPreviewModal';
import { ConfirmModal } from '../components/ui/Modal';
import { useToast } from '../components/ui/Toast';
import { formatDateDisplay } from '../utils/dateUtils';

export function HistoryPage() {
  const {
    prescriptions, doctorProfile, setActivePage, setCurrentPrescription,
    duplicatePrescription, deletePrescription
  } = useStore();
  const { showToast } = useToast();

  const [search, setSearch] = useState('');
  const [previewRx, setPreviewRx] = useState<string | null>(null);
  const [printRxId, setPrintRxId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filtered = prescriptions.filter(rx => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      rx.patient.name.toLowerCase().includes(q) ||
      (rx.patient.nameBn ?? '').toLowerCase().includes(q) ||
      (rx.patient.patientId ?? '').toLowerCase().includes(q) ||
      rx.prescriptionNumber.toLowerCase().includes(q) ||
      rx.diagnoses.some(d => d.text.toLowerCase().includes(q))
    );
  });

  const handleEdit = (id: string) => {
    const rx = prescriptions.find(p => p.id === id);
    if (!rx) return;
    setCurrentPrescription(rx);
    setActivePage('builder');
  };

  const handleDuplicate = (id: string) => {
    const dup = duplicatePrescription(id);
    setActivePage('builder');
    showToast('Prescription duplicated – editing copy', 'success');
  };

  const handleDelete = (id: string) => {
    deletePrescription(id);
    showToast('Prescription deleted', 'info');
    setDeleteId(null);
  };

  const previewPrescription = prescriptions.find(p => p.id === previewRx);
  const printPrescription = prescriptions.find(p => p.id === printRxId);

  return (
    <div style={{ padding: 24 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1e293b', margin: 0 }}>Prescription History</h1>
          <p style={{ color: '#64748b', margin: '2px 0 0', fontSize: 14 }}>
            {prescriptions.length} prescription{prescriptions.length !== 1 ? 's' : ''} saved
          </p>
        </div>
        <button className="btn-primary" onClick={() => { setCurrentPrescription(null); setActivePage('builder'); }}>
          <Plus size={16} /> New Prescription
        </button>
      </div>

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: 16 }}>
        <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
        <input
          className="form-input"
          style={{ paddingLeft: 36 }}
          placeholder="Search by patient name, ID, diagnosis..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: 48, color: '#94a3b8' }}>
          <FileText size={48} style={{ margin: '0 auto 12px', display: 'block', opacity: 0.4 }} />
          <div style={{ fontSize: 16, fontWeight: 600 }}>
            {prescriptions.length === 0 ? 'No prescriptions yet' : 'No matching prescriptions'}
          </div>
          <div style={{ fontSize: 13, marginTop: 4 }}>
            {prescriptions.length === 0
              ? 'Create your first prescription to see it here.'
              : 'Try a different search term.'}
          </div>
        </div>
      )}

      {/* Prescription cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {filtered.map(rx => (
          <div key={rx.id} className="card" style={{ padding: '14px 18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              {/* Patient info */}
              <div style={{ minWidth: 180, flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                  <User size={14} color="#64748b" />
                  <span style={{ fontWeight: 700, fontSize: 15, color: '#1e293b' }}>{rx.patient.name}</span>
                  {rx.patient.nameBn && (
                    <span className="bn" style={{ fontSize: 13, color: '#64748b', fontFamily: 'var(--font-bn)' }}>
                      ({rx.patient.nameBn})
                    </span>
                  )}
                  {rx.isDraft && <span className="badge badge-yellow" style={{ fontSize: 10 }}>Draft</span>}
                </div>
                <div style={{ display: 'flex', gap: 10, fontSize: 12, color: '#64748b', flexWrap: 'wrap' }}>
                  {rx.patient.age && <span>Age: {rx.patient.age}</span>}
                  {rx.patient.gender && <span>{rx.patient.gender}</span>}
                  {rx.patient.patientId && <span>ID: {rx.patient.patientId}</span>}
                </div>
              </div>

              {/* Diagnoses */}
              <div style={{ flex: 1 }}>
                {rx.diagnoses.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                    {rx.diagnoses.slice(0, 3).map(d => (
                      <span key={d.id} className="badge badge-green" style={{ fontSize: 11 }}>{d.text}</span>
                    ))}
                    {rx.diagnoses.length > 3 && (
                      <span className="badge badge-gray" style={{ fontSize: 11 }}>+{rx.diagnoses.length - 3}</span>
                    )}
                  </div>
                )}
                <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>
                  {rx.medicines.length} medicine{rx.medicines.length !== 1 ? 's' : ''}
                  {rx.investigations.length > 0 && ` · ${rx.investigations.length} test${rx.investigations.length !== 1 ? 's' : ''}`}
                </div>
              </div>

              {/* Date & Rx# */}
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 13, color: '#374151' }}>{formatDateDisplay(rx.date)}</div>
                <div style={{ fontSize: 11, color: '#94a3b8' }}>{rx.prescriptionNumber}</div>
                <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2, display: 'flex', alignItems: 'center', gap: 2, justifyContent: 'flex-end' }}>
                  <Clock size={10} /> {formatDateDisplay(rx.updatedAt)}
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                <button className="btn-icon" title="View preview" onClick={() => setPreviewRx(rx.id)}>
                  <FileText size={15} />
                </button>
                <button className="btn-icon" title="Edit" onClick={() => handleEdit(rx.id)}>
                  <Edit3 size={15} />
                </button>
                <button className="btn-icon" title="Print / PDF" onClick={() => setPrintRxId(rx.id)}>
                  <Printer size={15} />
                </button>
                <button className="btn-icon" title="Duplicate" onClick={() => handleDuplicate(rx.id)}>
                  <Copy size={15} />
                </button>
                <button className="btn-icon" title="Delete" style={{ color: '#ef4444' }}
                  onClick={() => setDeleteId(rx.id)}>
                  <Trash2 size={15} />
                </button>
              </div>
            </div>

            {/* Preview inline on click */}
            {previewRx === rx.id && (
              <div style={{ marginTop: 16, borderTop: '1px solid #e2e8f0', paddingTop: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
                  <button className="btn-ghost btn-sm" onClick={() => setPreviewRx(null)}>Close Preview</button>
                </div>
                <div style={{ overflowX: 'auto' }}>
                  <PrescriptionPreview prescription={rx} doctorProfile={doctorProfile} scale={0.7} />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Print modal */}
      {printRxId && printPrescription && (
        <PrintPreviewModal
          prescription={printPrescription}
          doctorProfile={doctorProfile}
          onClose={() => setPrintRxId(null)}
        />
      )}

      {/* Delete confirm */}
      <ConfirmModal
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && handleDelete(deleteId)}
        title="Delete Prescription"
        message="Are you sure you want to delete this prescription? This action cannot be undone."
        confirmLabel="Delete"
        dangerous
      />
    </div>
  );
}
