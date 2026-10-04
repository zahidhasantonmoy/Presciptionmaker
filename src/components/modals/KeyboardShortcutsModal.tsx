import React from 'react';
import { Keyboard, X } from 'lucide-react';

interface KeyboardShortcutsModalProps {
  onClose: () => void;
}

const SHORTCUTS = [
  { key: 'Ctrl + S', description: 'Save current prescription', descriptionBn: 'প্রেসক্রিপশন সেভ করুন' },
  { key: 'Ctrl + P', description: 'Open Print / PDF Preview', descriptionBn: 'প্রিন্ট অথবা পিডিএফ ডাউনলোড' },
  { key: 'Alt + M', description: 'Add new medicine', descriptionBn: 'নতুন ওষুধ যোগ করুন' },
  { key: 'Alt + C', description: 'Pediatric Dose Calculator', descriptionBn: 'শিশুদের ডোজ ক্যালকুলেটর' },
  { key: 'Alt + D', description: 'Open / Focus Diagnosis', descriptionBn: 'রোগের ডায়াগনসিস যোগ করুন' },
  { key: 'Alt + T', description: 'Open Tests / Investigations', descriptionBn: 'টেস্ট ও ইনভেস্টিগেশন যোগ করুন' },
  { key: 'Alt + N', description: 'Start New Prescription', descriptionBn: 'নতুন ব্ল্যাংক প্রেসক্রিপশন শুরু' },
  { key: 'Alt + P', description: 'Toggle Pad Mode (Pre-printed)', descriptionBn: 'ছাপানো প্যাড মোড অন/অফ' },
  { key: 'Escape', description: 'Close any active modal', descriptionBn: 'যেকোনো পপআপ উইন্ডো বন্ধ করুন' },
];

export function KeyboardShortcutsModal({ onClose }: KeyboardShortcutsModalProps) {
  return (
    <div className="modal-overlay" style={{ zIndex: 300 }}>
      <div className="modal-box" style={{ maxWidth: 500 }}>
        {/* Header */}
        <div className="modal-header" style={{ background: '#f8faff' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8, background: '#1e40af',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white'
            }}>
              <Keyboard size={18} />
            </div>
            <div>
              <div className="modal-title" style={{ fontSize: 16, color: '#1e40af' }}>
                ⌨️ Keyboard Shortcuts
              </div>
              <div style={{ fontSize: 11, color: '#64748b' }}>
                চেম্বারে দ্রুত প্রেসক্রিপশন লেখার হটকি নির্দেশিকা
              </div>
            </div>
          </div>
          <button className="btn-icon" onClick={onClose}><X size={18} /></button>
        </div>

        {/* Body */}
        <div className="modal-body" style={{ padding: '16px 20px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {SHORTCUTS.map(s => (
              <div
                key={s.key}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 12px',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: 8,
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13, color: '#1e293b' }}>
                    {s.description}
                  </div>
                  <div style={{ fontSize: 11, color: '#64748b', fontFamily: 'var(--font-bn)' }}>
                    {s.descriptionBn}
                  </div>
                </div>
                <kbd style={{
                  background: 'white',
                  border: '1px solid #cbd5e1',
                  borderBottom: '2px solid #94a3b8',
                  borderRadius: 6,
                  padding: '4px 8px',
                  fontSize: 12,
                  fontWeight: 700,
                  color: '#1e40af',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                  fontFamily: 'monospace',
                }}>
                  {s.key}
                </kbd>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer" style={{ background: '#f8fafc' }}>
          <button className="btn-primary" onClick={onClose} style={{ width: '100%' }}>
            Got it (বুঝেছি)
          </button>
        </div>
      </div>
    </div>
  );
}
