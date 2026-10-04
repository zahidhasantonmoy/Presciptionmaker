import type { Prescription, DoctorProfile } from '../types';
import { formatDateDisplay } from './dateUtils';

export function generateWhatsAppPrescriptionText(
  prescription: Prescription,
  doctorProfile: DoctorProfile | null
): string {
  const p = prescription;
  const lines: string[] = [];

  // Header
  if (doctorProfile) {
    lines.push(`🩺 *${doctorProfile.name}*`);
    if (doctorProfile.degrees) lines.push(`_${doctorProfile.degrees}_`);
    if (doctorProfile.specialty) lines.push(doctorProfile.specialty);
    if (doctorProfile.clinicName) lines.push(`📍 ${doctorProfile.clinicName}`);
    lines.push('───────────────────────');
  }

  // Patient Info
  lines.push(`👤 *Patient:* ${p.patient.nameBn || p.patient.name || 'Patient'}`);
  if (p.patient.age) lines.push(`Age: ${p.patient.age}${p.patient.gender ? ` | ${p.patient.gender}` : ''}`);
  if (p.prescriptionNumber) lines.push(`Rx#: ${p.prescriptionNumber}`);
  lines.push(`Date: ${formatDateDisplay(p.date)}`);

  // Diagnoses
  if (p.diagnoses.length > 0) {
    lines.push('');
    lines.push('📋 *Diagnosis:*');
    p.diagnoses.forEach(d => lines.push(`• ${d.text}`));
  }

  // Medicines (℞)
  if (p.medicines.length > 0) {
    lines.push('');
    lines.push('℞ *Medicines:*');
    p.medicines.forEach((m, idx) => {
      let medLine = `${idx + 1}. *${m.name}*`;
      const dose = `${m.morning}+${m.afternoon}+${m.evening}`;
      const timing = m.timing ? ` (${m.timing})` : '';
      const duration = m.duration ? ` - ${m.duration}` : '';
      medLine += `\n   ↳ ${dose}${timing}${duration}`;
      if (m.instruction) {
        medLine += `\n   ↳ _${m.instruction}_`;
      }
      lines.push(medLine);
    });
  }

  // Investigations
  if (p.investigations.length > 0) {
    lines.push('');
    lines.push('🔬 *Tests / Investigations:*');
    p.investigations.forEach(inv => lines.push(`• ${inv.name}${inv.instruction ? ` (${inv.instruction})` : ''}`));
  }

  // Advice
  if (p.advice || p.adviceBn) {
    lines.push('');
    lines.push('💡 *Advice / পরামর্শ:*');
    if (p.advice) lines.push(p.advice);
    if (p.adviceBn) lines.push(p.adviceBn);
  }

  // Follow-up
  if (p.followUpText || p.followUpDate) {
    lines.push('');
    lines.push(`📅 *Next Visit / পরবর্তী সাক্ষাৎ:* ${p.followUpText || (p.followUpDate && formatDateDisplay(p.followUpDate))}`);
  }

  lines.push('');
  lines.push('────────── EasyPad ──────────');
  return lines.join('\n');
}

export function openWhatsAppPrescription(
  phone: string | undefined,
  prescription: Prescription,
  doctorProfile: DoctorProfile | null
) {
  const text = generateWhatsAppPrescriptionText(prescription, doctorProfile);
  // Clean phone number for Bangladesh (e.g. 017XXXXXXXX -> 88017XXXXXXXX)
  let cleanPhone = (phone || '').replace(/[^\d]/g, '');
  if (cleanPhone.startsWith('01')) {
    cleanPhone = '88' + cleanPhone;
  }
  const encoded = encodeURIComponent(text);
  const url = cleanPhone
    ? `https://wa.me/${cleanPhone}?text=${encoded}`
    : `https://wa.me/?text=${encoded}`;
  window.open(url, '_blank');
}
