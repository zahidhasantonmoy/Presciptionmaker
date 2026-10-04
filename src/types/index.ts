// ─────────────────────────────────────────────────────────────────────────────
// EasyPad – Core Type Definitions
// ─────────────────────────────────────────────────────────────────────────────

export type Gender = 'male' | 'female' | 'other';
export type MedicineForm = 'tablet' | 'capsule' | 'syrup' | 'injection' | 'cream' | 'ointment' | 'drops' | 'inhaler' | 'suppository' | 'other';
export type Language = 'en' | 'bn';
export type PrescriptionTheme = 'classic' | 'minimal' | 'modern' | 'compact' | 'sanowara';

// ─── Doctor Profile ───────────────────────────────────────────────────────────
export interface DoctorProfile {
  id: string;
  name: string;
  nameBn?: string;
  title?: string;
  degrees: string;
  degreesBn?: string;
  specialty: string;
  specialtyBn?: string;
  bmdcNumber?: string;
  fellowId?: string;
  clinicName?: string;
  clinicNameBn?: string;
  address?: string;
  addressBn?: string;
  phone?: string;
  email?: string;
  consultationHours?: string;
  consultationHoursBn?: string;
  logoUrl?: string;
  signatureUrl?: string;
  footerText?: string;
  footerTextBn?: string;
  showBnHeader: boolean;
  theme: PrescriptionTheme;
  isDefault?: boolean;
  updatedAt: string;
}

// ─── Patient ──────────────────────────────────────────────────────────────────
export interface Patient {
  id: string;
  patientId?: string;
  name: string;
  nameBn?: string;
  dateOfBirth?: string; // ISO date string
  age?: string; // display age, e.g. "40Y 6M"
  gender?: Gender;
  weight?: string;
  height?: string;
  bloodPressure?: string;
  phone?: string;
  address?: string;
  allergies?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Prescription Medicine ────────────────────────────────────────────────────
export interface PrescriptionMedicine {
  id: string;
  name: string;
  genericName?: string;
  form: MedicineForm;
  strength?: string;
  route?: string;
  morning: string;
  afternoon: string;
  evening: string;
  timing?: string; // "খাবারের পরে" / "After meal"
  duration?: string;
  quantity?: string;
  instruction?: string;
  isFavorite?: boolean;
  pregnancyCategory?: 'A' | 'B' | 'C' | 'D' | 'X';
  isLactationSafe?: boolean;
}

// ─── Diagnosis ────────────────────────────────────────────────────────────────
export interface Diagnosis {
  id: string;
  text: string;
  note?: string;
}

// ─── Test / Investigation ─────────────────────────────────────────────────────
export interface Investigation {
  id: string;
  name: string;
  instruction?: string;
  category?: string; // 'lab' | 'imaging' | 'other'
}

// ─── Prescription ─────────────────────────────────────────────────────────────
export interface Prescription {
  id: string;
  prescriptionNumber: string;
  date: string; // ISO date
  doctorProfileId: string;
  patient: Patient;
  complaints: string;
  complaintsBn?: string;
  onExamination?: string;
  history?: string;
  diagnoses: Diagnosis[];
  medicines: PrescriptionMedicine[];
  investigations: Investigation[];
  advice: string;
  adviceBn?: string;
  followUpDate?: string;
  followUpText?: string;
  followUpTextBn?: string;
  additionalNotes?: string;
  language: Language;
  theme: PrescriptionTheme;
  printMode?: 'full' | 'pad_only';
  showQrCode?: boolean;
  isDraft: boolean;
  createdAt: string;
  updatedAt: string;
}

// ─── Templates ────────────────────────────────────────────────────────────────
export interface MedicineTemplate {
  id: string;
  name: string;
  medicines: PrescriptionMedicine[];
  createdAt: string;
}

export interface PrescriptionTemplate {
  id: string;
  name: string;
  description?: string;
  complaints?: string;
  complaintsBn?: string;
  history?: string;
  diagnoses: Diagnosis[];
  medicines: PrescriptionMedicine[];
  investigations: Investigation[];
  onExamination?: string;
  advice: string;
  adviceBn?: string;
  followUpText?: string;
  additionalNotes?: string;
  theme?: PrescriptionTheme;
  doctorProfileId?: string;
  isDemo?: boolean;
  createdAt: string;
}

// ─── Medicine Catalog (doctor-maintained) ─────────────────────────────────────
export interface MedicineCatalogItem {
  id: string;
  name: string;
  genericName?: string;
  form: MedicineForm;
  strength?: string;
  isFavorite: boolean;
  useCount: number;
  lastUsed?: string;
  pregnancyCategory?: 'A' | 'B' | 'C' | 'D' | 'X';
  isLactationSafe?: boolean;
}

// ─── Diagnosis Catalog ────────────────────────────────────────────────────────
export interface DiagnosisCatalogItem {
  id: string;
  text: string;
  isFavorite: boolean;
  useCount: number;
  lastUsed?: string;
}

// ─── Test Catalog ─────────────────────────────────────────────────────────────
export interface TestCatalogItem {
  id: string;
  name: string;
  category: string;
  isFavorite: boolean;
  useCount: number;
  lastUsed?: string;
}

// ─── Advice Template ──────────────────────────────────────────────────────────
export interface AdviceTemplate {
  id: string;
  title: string;
  content: string;
  contentBn?: string;
  isFavorite: boolean;
  createdAt: string;
}

// ─── App Settings ─────────────────────────────────────────────────────────────
export interface AppSettings {
  language: Language;
  theme: PrescriptionTheme;
  autoSave: boolean;
  prescriptionNumberPrefix: string;
  prescriptionNumberCounter: number;
  defaultPrintMode?: 'full' | 'pad_only';
  padTopMarginMm?: number;
  padBottomMarginMm?: number;
  showQrCode?: boolean;
  lastBackup?: string;
}

// ─── App Store State ──────────────────────────────────────────────────────────
export interface AppState {
  doctorProfiles: DoctorProfile[];
  activeDoctorId: string;
  doctorProfile: DoctorProfile | null;
  patients: Patient[];
  prescriptions: Prescription[];
  prescriptionTemplates: PrescriptionTemplate[];
  medicineTemplates: MedicineTemplate[];
  medicineCatalog: MedicineCatalogItem[];
  diagnosisCatalog: DiagnosisCatalogItem[];
  testCatalog: TestCatalogItem[];
  adviceTemplates: AdviceTemplate[];
  settings: AppSettings;
  currentPrescription: Prescription | null;
  activePage: string;
}
