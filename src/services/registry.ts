import { ServiceItem } from './types';
import { PrescriptionService } from './prescription/PrescriptionService';
import { TicketMaker } from './ticket/TicketMaker';
import { InvoiceMaker } from './invoice/InvoiceMaker';
import { CertificateMaker } from './certificate/CertificateMaker';
import { IdCardMaker } from './idcard/IdCardMaker';

export const SERVICES_REGISTRY: ServiceItem[] = [
  {
    id: 'prescription',
    name: 'Prescription Maker',
    tagline: 'EasyPad Clinical Rx & Rx Verification',
    description: 'Create multi-page medical prescriptions with drug catalogs, ICD diagnoses, doctor profiles, and QR verification.',
    path: '/prescription',
    icon: '🏥',
    category: 'Healthcare',
    accentColor: '#3b82f6',
    gradient: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
    badge: 'Flagship',
    isAvailable: true,
    component: PrescriptionService,
  },
  {
    id: 'ticket',
    name: 'Ticket Maker',
    tagline: 'Event, Concert & Transit Pass Generator',
    description: 'Design custom tickets with perforated tear notches, attendee seating, pricing tiers, and scannable QR verification.',
    path: '/ticket',
    icon: '🎟️',
    category: 'Events',
    accentColor: '#f59e0b',
    gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    badge: 'Popular',
    isAvailable: true,
    component: TicketMaker,
  },
  {
    id: 'invoice',
    name: 'Invoice Maker',
    tagline: 'Client Invoicing & Payment Computation',
    description: 'Generate professional multi-currency invoices with dynamic line items, automated taxes, discounts, and wire instructions.',
    path: '/invoice',
    icon: '🧾',
    category: 'Finance',
    accentColor: '#10b981',
    gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    badge: 'Essential',
    isAvailable: true,
    component: InvoiceMaker,
  },
  {
    id: 'certificate',
    name: 'Certificate Maker',
    tagline: 'Diplomas, Awards & Achievements',
    description: 'Craft elegant framed completion awards and appreciation diplomas with custom citations, signatures, and tamper seals.',
    path: '/certificate',
    icon: '🏆',
    category: 'Documents',
    accentColor: '#a855f7',
    gradient: 'linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)',
    badge: 'New',
    isAvailable: true,
    component: CertificateMaker,
  },
  {
    id: 'idcard',
    name: 'ID & Badge Maker',
    tagline: 'Employee & Access Identity Passes',
    description: 'Produce standard CR80 identification badges with photo upload, security barcodes, designations, and blood group specs.',
    path: '/card',
    icon: '🪪',
    category: 'Identity',
    accentColor: '#06b6d4',
    gradient: 'linear-gradient(135deg, #06b6d4 0%, #0284c7 100%)',
    badge: 'New',
    isAvailable: true,
    component: IdCardMaker,
  },
];

export function getServiceById(id: string): ServiceItem | undefined {
  return SERVICES_REGISTRY.find(s => s.id === id);
}

export function getServiceByPath(path: string): ServiceItem | undefined {
  const cleanPath = path.toLowerCase().replace(/\/+$/, '') || '/';
  return SERVICES_REGISTRY.find(s => s.path === cleanPath);
}
