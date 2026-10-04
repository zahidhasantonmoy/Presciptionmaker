import React from 'react';
import {
  FilePlus, FileText, Users, BookOpen, Star, Plus, Clock, Stethoscope, FlaskConical
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { formatDateDisplay } from '../utils/dateUtils';

export function Dashboard() {
  const {
    doctorProfile, prescriptions, patients, prescriptionTemplates,
    medicineCatalog, testCatalog, createPrescription, setActivePage, setCurrentPrescription
  } = useStore();

  const recentPrescriptions = [...prescriptions].sort((a, b) =>
    new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  ).slice(0, 5);

  const favMedicines = medicineCatalog.filter(m => m.isFavorite).slice(0, 6);
  const favTests = testCatalog.filter(t => t.isFavorite).slice(0, 6);

  const handleNewPrescription = () => {
    setCurrentPrescription(null);
    createPrescription();
    setActivePage('builder');
  };

  const today = new Date().toLocaleDateString('en-BD', { timeZone: 'Asia/Dhaka', weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div style={{ padding: 24, maxWidth: 1100 }}>
      {/* Welcome */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: '#1e293b', margin: 0 }}>
              {doctorProfile ? `Welcome, ${doctorProfile.name}` : 'Welcome to EasyPad'}
            </h1>
            <p style={{ color: '#64748b', margin: '4px 0 0', fontSize: 14 }}>{today} · Bangladesh</p>
            {!doctorProfile && (
              <button className="btn-ghost btn-sm" style={{ marginTop: 8 }} onClick={() => setActivePage('settings')}>
                ⚙️ Set up your doctor profile to get started
              </button>
            )}
          </div>
          <button className="btn-primary" style={{ fontSize: 15, padding: '10px 22px' }} onClick={handleNewPrescription}>
            <FilePlus size={18} /> New Prescription
          </button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12, marginBottom: 24 }}>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#dbeafe' }}>
            <FileText size={22} color="#1d4ed8" />
          </div>
          <div>
            <div className="stat-number">{prescriptions.length}</div>
            <div className="stat-label">Prescriptions</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#dcfce7' }}>
            <Users size={22} color="#15803d" />
          </div>
          <div>
            <div className="stat-number">{patients.length}</div>
            <div className="stat-label">Patients</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#fef3c7' }}>
            <BookOpen size={22} color="#b45309" />
          </div>
          <div>
            <div className="stat-number">{prescriptionTemplates.length}</div>
            <div className="stat-label">Templates</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#f3e8ff' }}>
            <Star size={22} color="#7c3aed" />
          </div>
          <div>
            <div className="stat-number">{favMedicines.length}</div>
            <div className="stat-label">Fav. Medicines</div>
          </div>
        </div>
        <div className="stat-card" style={{ cursor: 'pointer' }} onClick={handleNewPrescription}>
          <div className="stat-icon" style={{ background: '#ffe4e6' }}>
            <Plus size={22} color="#be123c" />
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#1e293b' }}>Quick Start</div>
            <div className="stat-label">New Prescription</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Recent prescriptions */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{
            padding: '14px 18px', borderBottom: '1px solid #e2e8f0',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <span style={{ fontWeight: 700, fontSize: 15, color: '#1e293b', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Clock size={16} color="#1e40af" /> Recent Prescriptions
            </span>
            <button className="btn-ghost btn-sm" onClick={() => setActivePage('history')}>View All</button>
          </div>
          {recentPrescriptions.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>
              No prescriptions yet. Create your first one!
            </div>
          ) : (
            <div>
              {recentPrescriptions.map(rx => (
                <div key={rx.id} style={{
                  padding: '12px 18px', borderBottom: '1px solid #f1f5f9',
                  display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer',
                  transition: 'background 0.1s',
                }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#f8faff')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  onClick={() => {
                    setCurrentPrescription(rx);
                    setActivePage('builder');
                  }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: '50%',
                    background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <FileText size={16} color="#1e40af" />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 13, color: '#1e293b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {rx.patient.name}
                      {rx.patient.nameBn && <span className="bn" style={{ fontFamily: 'var(--font-bn)', marginLeft: 4, color: '#64748b', fontSize: 12 }}>{rx.patient.nameBn}</span>}
                    </div>
                    <div style={{ fontSize: 11, color: '#94a3b8' }}>
                      {formatDateDisplay(rx.date)} · {rx.prescriptionNumber}
                      {rx.isDraft && <span className="badge badge-yellow" style={{ fontSize: 9, marginLeft: 4 }}>Draft</span>}
                    </div>
                  </div>
                  <div style={{ fontSize: 11, color: '#64748b', textAlign: 'right', flexShrink: 0 }}>
                    {rx.medicines.length} med{rx.medicines.length !== 1 ? 's' : ''}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick templates + favorites */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Templates */}
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '14px 18px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontWeight: 700, fontSize: 15, color: '#1e293b', display: 'flex', alignItems: 'center', gap: 6 }}>
                <BookOpen size={16} color="#1e40af" /> Templates
              </span>
              <button className="btn-ghost btn-sm" onClick={() => setActivePage('templates')}>Manage</button>
            </div>
            <div style={{ padding: '10px 16px' }}>
              {prescriptionTemplates.slice(0, 3).map(t => (
                <div key={t.id} style={{
                  padding: '8px 0', borderBottom: '1px solid #f1f5f9',
                  display: 'flex', alignItems: 'center', gap: 8,
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>{t.name}</div>
                    {t.isDemo && <span className="badge badge-demo" style={{ fontSize: 10 }}>Demo</span>}
                  </div>
                </div>
              ))}
              {prescriptionTemplates.length === 0 && (
                <div style={{ color: '#94a3b8', fontSize: 13, padding: '6px 0' }}>No templates yet</div>
              )}
            </div>
          </div>

          {/* Favorite Medicines */}
          {favMedicines.length > 0 && (
            <div className="card" style={{ padding: 16 }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: '#1e293b', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Star size={15} color="#f59e0b" fill="#f59e0b" /> Favorite Medicines
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {favMedicines.map(m => (
                  <span key={m.id} className="badge badge-blue" style={{ fontSize: 11 }}>
                    💊 {m.name.split('(')[0].trim()}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Favorite Tests */}
          {favTests.length > 0 && (
            <div className="card" style={{ padding: 16 }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: '#1e293b', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                <FlaskConical size={15} color="#7c3aed" /> Favorite Tests
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {favTests.map(t => (
                  <span key={t.id} className="badge badge-gray" style={{ fontSize: 11 }}>
                    🔬 {t.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
