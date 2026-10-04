import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import type {
  AppState, DoctorProfile, Patient, Prescription, PrescriptionTemplate,
  MedicineTemplate, MedicineCatalogItem, AdviceTemplate, AppSettings
} from '../types';
import { getDhakaNow } from '../utils/dateUtils';
import { DEMO_TEMPLATES, DEFAULT_MEDICINE_CATALOG, DEFAULT_DIAGNOSIS_CATALOG, DEFAULT_TEST_CATALOG, DEFAULT_ADVICE_TEMPLATES, DEFAULT_DOCTOR_PROFILE } from '../data/defaults';

const DEFAULT_SETTINGS: AppSettings = {
  language: 'en',
  theme: 'classic',
  autoSave: true,
  prescriptionNumberPrefix: 'Rx',
  prescriptionNumberCounter: 1,
  defaultPrintMode: 'full',
  padTopMarginMm: 52,
  padBottomMarginMm: 25,
  showQrCode: true,
};

interface AppActions {
  // Doctor
  setDoctorProfile: (profile: DoctorProfile) => void;
  // Patients
  addPatient: (patient: Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>) => Patient;
  updatePatient: (id: string, updates: Partial<Patient>) => void;
  deletePatient: (id: string) => void;
  // Prescriptions
  createPrescription: (patientId?: string) => Prescription;
  savePrescription: (prescription: Prescription) => void;
  deletePrescription: (id: string) => void;
  duplicatePrescription: (id: string) => Prescription;
  setCurrentPrescription: (prescription: Prescription | null) => void;
  updateCurrentPrescription: (updates: Partial<Prescription>) => void;
  // Templates
  savePrescriptionTemplate: (template: Omit<PrescriptionTemplate, 'id' | 'createdAt'>) => void;
  deletePrescriptionTemplate: (id: string) => void;
  saveMedicineTemplate: (template: Omit<MedicineTemplate, 'id' | 'createdAt'>) => void;
  deleteMedicineTemplate: (id: string) => void;
  // Catalog
  addToCatalog: (item: Omit<MedicineCatalogItem, 'id' | 'useCount' | 'isFavorite'>) => void;
  toggleMedicineFavorite: (id: string) => void;
  addDiagnosisToCatalog: (text: string) => void;
  toggleDiagnosisFavorite: (id: string) => void;
  addTestToCatalog: (name: string, category: string) => void;
  toggleTestFavorite: (id: string) => void;
  // Advice
  saveAdviceTemplate: (template: Omit<AdviceTemplate, 'id' | 'createdAt'>) => void;
  deleteAdviceTemplate: (id: string) => void;
  toggleAdviceFavorite: (id: string) => void;
  // Settings
  updateSettings: (updates: Partial<AppSettings>) => void;
  // Navigation
  setActivePage: (page: string) => void;
  // Backup
  exportData: () => string;
  importData: (json: string) => void;
  clearAllData: () => void;
  // Prescription Number
  getNextPrescriptionNumber: () => string;
}

type Store = AppState & AppActions;

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      // ─── Initial State ─────────────────────────────────────────────────────
      doctorProfile: DEFAULT_DOCTOR_PROFILE,
      patients: [],
      prescriptions: [],
      prescriptionTemplates: DEMO_TEMPLATES,
      medicineTemplates: [],
      medicineCatalog: DEFAULT_MEDICINE_CATALOG,
      diagnosisCatalog: DEFAULT_DIAGNOSIS_CATALOG,
      testCatalog: DEFAULT_TEST_CATALOG,
      adviceTemplates: DEFAULT_ADVICE_TEMPLATES,
      settings: DEFAULT_SETTINGS,
      currentPrescription: null,
      activePage: 'dashboard',

      // ─── Doctor ─────────────────────────────────────────────────────────────
      setDoctorProfile: (profile) => set({ doctorProfile: { ...profile, updatedAt: getDhakaNow() } }),

      // ─── Patients ───────────────────────────────────────────────────────────
      addPatient: (data) => {
        const patient: Patient = { ...data, id: uuidv4(), createdAt: getDhakaNow(), updatedAt: getDhakaNow() };
        set((s) => ({ patients: [patient, ...s.patients] }));
        return patient;
      },
      updatePatient: (id, updates) =>
        set((s) => ({ patients: s.patients.map(p => p.id === id ? { ...p, ...updates, updatedAt: getDhakaNow() } : p) })),
      deletePatient: (id) => set((s) => ({ patients: s.patients.filter(p => p.id !== id) })),

      // ─── Prescriptions ──────────────────────────────────────────────────────
      getNextPrescriptionNumber: () => {
        const { settings } = get();
        const num = `${settings.prescriptionNumberPrefix}-${String(settings.prescriptionNumberCounter).padStart(4, '0')}`;
        set((s) => ({ settings: { ...s.settings, prescriptionNumberCounter: s.settings.prescriptionNumberCounter + 1 } }));
        return num;
      },

      createPrescription: (patientId?) => {
        const { patients, doctorProfile, settings } = get();
        const patient = patientId ? patients.find(p => p.id === patientId) : undefined;
        const now = getDhakaNow();
        const rx: Prescription = {
          id: uuidv4(),
          prescriptionNumber: get().getNextPrescriptionNumber(),
          date: now,
          doctorProfileId: doctorProfile?.id ?? '',
          patient: patient ?? {
            id: uuidv4(), name: '', createdAt: now, updatedAt: now
          },
          complaints: '',
          diagnoses: [],
          medicines: [],
          investigations: [],
          advice: '',
          language: settings.language,
          theme: settings.theme,
          printMode: settings.defaultPrintMode || 'full',
          showQrCode: settings.showQrCode !== false,
          isDraft: true,
          createdAt: now,
          updatedAt: now,
        };
        set({ currentPrescription: rx });
        return rx;
      },

      savePrescription: (prescription) => {
        const updated = { ...prescription, isDraft: false, updatedAt: getDhakaNow() };
        set((s) => {
          const existing = s.prescriptions.findIndex(p => p.id === prescription.id);
          if (existing >= 0) {
            const list = [...s.prescriptions];
            list[existing] = updated;
            return { prescriptions: list, currentPrescription: updated };
          }
          // Save patient if new
          const patientExists = s.patients.find(p => p.id === prescription.patient.id);
          const patients = patientExists
            ? s.patients.map(p => p.id === prescription.patient.id ? { ...prescription.patient, updatedAt: getDhakaNow() } : p)
            : prescription.patient.name
              ? [{ ...prescription.patient, updatedAt: getDhakaNow() }, ...s.patients]
              : s.patients;
          return { prescriptions: [updated, ...s.prescriptions], patients, currentPrescription: updated };
        });
      },

      deletePrescription: (id) => set((s) => ({ prescriptions: s.prescriptions.filter(p => p.id !== id) })),

      duplicatePrescription: (id) => {
        const { prescriptions } = get();
        const orig = prescriptions.find(p => p.id === id);
        if (!orig) throw new Error('Prescription not found');
        const dup: Prescription = {
          ...orig,
          id: uuidv4(),
          prescriptionNumber: get().getNextPrescriptionNumber(),
          date: getDhakaNow(),
          isDraft: true,
          createdAt: getDhakaNow(),
          updatedAt: getDhakaNow(),
        };
        set({ currentPrescription: dup });
        return dup;
      },

      setCurrentPrescription: (prescription) => set({ currentPrescription: prescription }),
      updateCurrentPrescription: (updates) =>
        set((s) => s.currentPrescription
          ? { currentPrescription: { ...s.currentPrescription, ...updates, updatedAt: getDhakaNow() } }
          : {}),

      // ─── Templates ──────────────────────────────────────────────────────────
      savePrescriptionTemplate: (template) =>
        set((s) => ({
          prescriptionTemplates: [
            { ...template, id: uuidv4(), createdAt: getDhakaNow() },
            ...s.prescriptionTemplates.filter(t => !t.isDemo),
            ...s.prescriptionTemplates.filter(t => t.isDemo),
          ]
        })),
      deletePrescriptionTemplate: (id) =>
        set((s) => ({ prescriptionTemplates: s.prescriptionTemplates.filter(t => t.id !== id) })),

      saveMedicineTemplate: (template) =>
        set((s) => ({ medicineTemplates: [{ ...template, id: uuidv4(), createdAt: getDhakaNow() }, ...s.medicineTemplates] })),
      deleteMedicineTemplate: (id) =>
        set((s) => ({ medicineTemplates: s.medicineTemplates.filter(t => t.id !== id) })),

      // ─── Catalog ────────────────────────────────────────────────────────────
      addToCatalog: (item) => {
        set((s) => {
          const existing = s.medicineCatalog.find(m => m.name.toLowerCase() === item.name.toLowerCase());
          if (existing) {
            return {
              medicineCatalog: s.medicineCatalog.map(m => m.id === existing.id
                ? { ...m, useCount: m.useCount + 1, lastUsed: getDhakaNow() }
                : m)
            };
          }
          return {
            medicineCatalog: [{ ...item, id: uuidv4(), useCount: 1, isFavorite: false, lastUsed: getDhakaNow() }, ...s.medicineCatalog]
          };
        });
      },
      toggleMedicineFavorite: (id) =>
        set((s) => ({
          medicineCatalog: s.medicineCatalog.map(m => m.id === id ? { ...m, isFavorite: !m.isFavorite } : m)
        })),

      addDiagnosisToCatalog: (text) => {
        set((s) => {
          const existing = s.diagnosisCatalog.find(d => d.text.toLowerCase() === text.toLowerCase());
          if (existing) {
            return {
              diagnosisCatalog: s.diagnosisCatalog.map(d => d.id === existing.id
                ? { ...d, useCount: d.useCount + 1, lastUsed: getDhakaNow() }
                : d)
            };
          }
          return {
            diagnosisCatalog: [{ id: uuidv4(), text, isFavorite: false, useCount: 1, lastUsed: getDhakaNow() }, ...s.diagnosisCatalog]
          };
        });
      },
      toggleDiagnosisFavorite: (id) =>
        set((s) => ({
          diagnosisCatalog: s.diagnosisCatalog.map(d => d.id === id ? { ...d, isFavorite: !d.isFavorite } : d)
        })),

      addTestToCatalog: (name, category) => {
        set((s) => {
          const existing = s.testCatalog.find(t => t.name.toLowerCase() === name.toLowerCase());
          if (existing) {
            return {
              testCatalog: s.testCatalog.map(t => t.id === existing.id
                ? { ...t, useCount: t.useCount + 1, lastUsed: getDhakaNow() }
                : t)
            };
          }
          return {
            testCatalog: [{ id: uuidv4(), name, category, isFavorite: false, useCount: 1, lastUsed: getDhakaNow() }, ...s.testCatalog]
          };
        });
      },
      toggleTestFavorite: (id) =>
        set((s) => ({
          testCatalog: s.testCatalog.map(t => t.id === id ? { ...t, isFavorite: !t.isFavorite } : t)
        })),

      // ─── Advice ─────────────────────────────────────────────────────────────
      saveAdviceTemplate: (template) =>
        set((s) => ({ adviceTemplates: [{ ...template, id: uuidv4(), createdAt: getDhakaNow() }, ...s.adviceTemplates] })),
      deleteAdviceTemplate: (id) =>
        set((s) => ({ adviceTemplates: s.adviceTemplates.filter(a => a.id !== id) })),
      toggleAdviceFavorite: (id) =>
        set((s) => ({
          adviceTemplates: s.adviceTemplates.map(a => a.id === id ? { ...a, isFavorite: !a.isFavorite } : a)
        })),

      // ─── Settings ───────────────────────────────────────────────────────────
      updateSettings: (updates) => set((s) => ({ settings: { ...s.settings, ...updates } })),

      // ─── Navigation ─────────────────────────────────────────────────────────
      setActivePage: (page) => set({ activePage: page }),

      // ─── Backup ─────────────────────────────────────────────────────────────
      exportData: () => {
        const { doctorProfile, patients, prescriptions, prescriptionTemplates, medicineTemplates, medicineCatalog, diagnosisCatalog, testCatalog, adviceTemplates, settings } = get();
        return JSON.stringify({
          version: '1.0',
          exportedAt: getDhakaNow(),
          data: { doctorProfile, patients, prescriptions, prescriptionTemplates, medicineTemplates, medicineCatalog, diagnosisCatalog, testCatalog, adviceTemplates, settings }
        }, null, 2);
      },

      importData: (json) => {
        try {
          const parsed = JSON.parse(json);
          if (!parsed.data) throw new Error('Invalid backup format');
          const { data } = parsed;
          set({
            doctorProfile: data.doctorProfile ?? null,
            patients: data.patients ?? [],
            prescriptions: data.prescriptions ?? [],
            prescriptionTemplates: data.prescriptionTemplates ?? DEMO_TEMPLATES,
            medicineTemplates: data.medicineTemplates ?? [],
            medicineCatalog: data.medicineCatalog ?? DEFAULT_MEDICINE_CATALOG,
            diagnosisCatalog: data.diagnosisCatalog ?? DEFAULT_DIAGNOSIS_CATALOG,
            testCatalog: data.testCatalog ?? DEFAULT_TEST_CATALOG,
            adviceTemplates: data.adviceTemplates ?? DEFAULT_ADVICE_TEMPLATES,
            settings: data.settings ?? DEFAULT_SETTINGS,
          });
        } catch (e) {
          throw new Error('Failed to import: Invalid JSON or backup format');
        }
      },

      clearAllData: () => set({
        doctorProfile: null,
        patients: [],
        prescriptions: [],
        prescriptionTemplates: DEMO_TEMPLATES,
        medicineTemplates: [],
        medicineCatalog: DEFAULT_MEDICINE_CATALOG,
        diagnosisCatalog: DEFAULT_DIAGNOSIS_CATALOG,
        testCatalog: DEFAULT_TEST_CATALOG,
        adviceTemplates: DEFAULT_ADVICE_TEMPLATES,
        settings: DEFAULT_SETTINGS,
        currentPrescription: null,
      }),
    }),
    {
      name: 'easypad-store',
      partialize: (state) => ({
        doctorProfile: state.doctorProfile,
        patients: state.patients,
        prescriptions: state.prescriptions,
        prescriptionTemplates: state.prescriptionTemplates,
        medicineTemplates: state.medicineTemplates,
        medicineCatalog: state.medicineCatalog,
        diagnosisCatalog: state.diagnosisCatalog,
        testCatalog: state.testCatalog,
        adviceTemplates: state.adviceTemplates,
        settings: state.settings,
      }),
    }
  )
);
