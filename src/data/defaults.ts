import { v4 as uuidv4 } from 'uuid';
import type { PrescriptionTemplate, MedicineCatalogItem, DiagnosisCatalogItem, TestCatalogItem, AdviceTemplate } from '../types';

export const DEMO_TEMPLATES: PrescriptionTemplate[] = [
  {
    id: uuidv4(),
    name: 'Upper Respiratory Infection (Demo)',
    description: 'Common cold / URI – demo template for UI testing only',
    diagnoses: [{ id: uuidv4(), text: 'Upper Respiratory Tract Infection (URTI)' }],
    medicines: [
      { id: uuidv4(), name: 'Tab. Napa Extend 665mg (Paracetamol)', genericName: 'Paracetamol', form: 'tablet', strength: '665mg', morning: '1', afternoon: '1', evening: '1', timing: 'After meal', duration: '5 days' },
      { id: uuidv4(), name: 'Cap. Sergel 20mg (Esomeprazole)', genericName: 'Esomeprazole', form: 'capsule', strength: '20mg', morning: '1', afternoon: '0', evening: '0', timing: 'Before meal', duration: '5 days' },
      { id: uuidv4(), name: 'Tab. Fexo 180mg (Fexofenadine)', genericName: 'Fexofenadine', form: 'tablet', strength: '180mg', morning: '0', afternoon: '0', evening: '1', timing: 'After meal', duration: '5 days' },
    ],
    investigations: [
      { id: uuidv4(), name: 'CBC with ESR', category: 'lab' },
      { id: uuidv4(), name: 'Dengue NS1 Ag', category: 'lab' },
    ],
    advice: 'Take plenty of fluids. Rest adequately. Return if fever persists beyond 3 days.',
    followUpText: 'Follow up within 5 days',
    isDemo: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: uuidv4(),
    name: 'Low Back Pain (Demo)',
    description: 'LBP management – demo template for UI testing only',
    diagnoses: [
      { id: uuidv4(), text: 'Low Back Pain (LBP)' },
      { id: uuidv4(), text: 'Lumbar Spondylosis' },
    ],
    medicines: [
      { id: uuidv4(), name: 'Tab. Naprosyn 500mg (Naproxen)', genericName: 'Naproxen', form: 'tablet', strength: '500mg', morning: '1', afternoon: '0', evening: '1', timing: 'After meal', duration: '7 days' },
      { id: uuidv4(), name: 'Tab. Flexilax 10mg (Baclofen)', genericName: 'Baclofen', form: 'tablet', strength: '10mg', morning: '1', afternoon: '0', evening: '1', timing: 'Full stomach', duration: '1 month' },
    ],
    investigations: [
      { id: uuidv4(), name: 'X-Ray Lumbosacral Spine B/V', category: 'imaging' },
    ],
    advice: 'Apply hot water bag. Avoid heavy lifting. Use lumbar corset. Do regular back strengthening exercises.',
    followUpText: 'Review after 2 weeks',
    isDemo: true,
    createdAt: new Date().toISOString(),
  },
];

export const DEFAULT_MEDICINE_CATALOG: MedicineCatalogItem[] = [
  { id: uuidv4(), name: 'Tab. Napa Extend 665mg (Paracetamol)', genericName: 'Paracetamol', form: 'tablet', strength: '665mg', isFavorite: true, useCount: 10 },
  { id: uuidv4(), name: 'Cap. Sergel 20mg (Esomeprazole)', genericName: 'Esomeprazole', form: 'capsule', strength: '20mg', isFavorite: true, useCount: 8 },
  { id: uuidv4(), name: 'Tab. Fexo 180mg (Fexofenadine)', genericName: 'Fexofenadine', form: 'tablet', strength: '180mg', isFavorite: false, useCount: 5 },
  { id: uuidv4(), name: 'Tab. Monas 10mg (Montelukast)', genericName: 'Montelukast', form: 'tablet', strength: '10mg', isFavorite: false, useCount: 3 },
  { id: uuidv4(), name: 'Tab. Naprosyn 500mg (Naproxen)', genericName: 'Naproxen', form: 'tablet', strength: '500mg', isFavorite: false, useCount: 4 },
  { id: uuidv4(), name: 'Tab. Flexilax 10mg (Baclofen)', genericName: 'Baclofen', form: 'tablet', strength: '10mg', isFavorite: false, useCount: 3 },
  { id: uuidv4(), name: 'Tab. Metformin 500mg', genericName: 'Metformin HCl', form: 'tablet', strength: '500mg', isFavorite: false, useCount: 2 },
  { id: uuidv4(), name: 'Tab. Amlodipine 5mg', genericName: 'Amlodipine', form: 'tablet', strength: '5mg', isFavorite: false, useCount: 2 },
];

export const DEFAULT_DIAGNOSIS_CATALOG: DiagnosisCatalogItem[] = [
  { id: uuidv4(), text: 'Upper Respiratory Tract Infection (URTI)', isFavorite: true, useCount: 10 },
  { id: uuidv4(), text: 'Low Back Pain (LBP)', isFavorite: true, useCount: 8 },
  { id: uuidv4(), text: 'Hypertension (HTN)', isFavorite: false, useCount: 5 },
  { id: uuidv4(), text: 'Type 2 Diabetes Mellitus (T2DM)', isFavorite: false, useCount: 4 },
  { id: uuidv4(), text: 'Lumbar Spondylosis', isFavorite: false, useCount: 3 },
  { id: uuidv4(), text: 'Urinary Tract Infection (UTI)', isFavorite: false, useCount: 3 },
  { id: uuidv4(), text: 'Anxiety Disorder', isFavorite: false, useCount: 2 },
  { id: uuidv4(), text: 'Vitamin D Deficiency', isFavorite: false, useCount: 2 },
  { id: uuidv4(), text: 'Anemia', isFavorite: false, useCount: 2 },
  { id: uuidv4(), text: 'Cervical Spondylosis', isFavorite: false, useCount: 2 },
  { id: uuidv4(), text: 'Peptic Ulcer Disease (PUD)', isFavorite: false, useCount: 1 },
  { id: uuidv4(), text: 'Irritable Bowel Syndrome (IBS)', isFavorite: false, useCount: 1 },
];

export const DEFAULT_TEST_CATALOG: TestCatalogItem[] = [
  { id: uuidv4(), name: 'CBC with ESR', category: 'lab', isFavorite: true, useCount: 10 },
  { id: uuidv4(), name: 'Blood Glucose (Fasting)', category: 'lab', isFavorite: true, useCount: 8 },
  { id: uuidv4(), name: 'Serum Creatinine', category: 'lab', isFavorite: false, useCount: 5 },
  { id: uuidv4(), name: 'Urine R/E', category: 'lab', isFavorite: false, useCount: 4 },
  { id: uuidv4(), name: 'Dengue NS1 Ag', category: 'lab', isFavorite: false, useCount: 3 },
  { id: uuidv4(), name: 'Thyroid Profile (T3, T4, TSH)', category: 'lab', isFavorite: false, useCount: 3 },
  { id: uuidv4(), name: 'Lipid Profile', category: 'lab', isFavorite: false, useCount: 2 },
  { id: uuidv4(), name: 'HbA1c', category: 'lab', isFavorite: false, useCount: 2 },
  { id: uuidv4(), name: 'Liver Function Test (LFT)', category: 'lab', isFavorite: false, useCount: 2 },
  { id: uuidv4(), name: 'X-Ray Chest PA View', category: 'imaging', isFavorite: false, useCount: 3 },
  { id: uuidv4(), name: 'X-Ray Lumbosacral Spine B/V', category: 'imaging', isFavorite: false, useCount: 2 },
  { id: uuidv4(), name: 'Ultrasonogram (USG) Abdomen', category: 'imaging', isFavorite: false, useCount: 2 },
  { id: uuidv4(), name: 'ECG', category: 'other', isFavorite: false, useCount: 2 },
  { id: uuidv4(), name: 'Blood Pressure Monitoring', category: 'other', isFavorite: false, useCount: 1 },
];

export const DEFAULT_ADVICE_TEMPLATES: AdviceTemplate[] = [
  {
    id: uuidv4(),
    title: 'General Rest & Hydration',
    content: 'Take plenty of fluids. Rest adequately. Avoid cold food and drinks.',
    contentBn: 'প্রচুর পানি পান করুন। পর্যাপ্ত বিশ্রাম নিন। ঠান্ডা খাবার ও পানীয় এড়িয়ে চলুন।',
    isFavorite: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: uuidv4(),
    title: 'Diabetic Advice',
    content: 'Follow strict diabetic diet. Regular exercise. Check blood sugar regularly.',
    contentBn: 'কঠোর ডায়াবেটিক খাদ্য মেনে চলুন। নিয়মিত ব্যায়াম করুন। নিয়মিত রক্তের চিনি পরীক্ষা করুন।',
    isFavorite: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: uuidv4(),
    title: 'Hypertension Advice',
    content: 'Reduce salt intake. Avoid fatty foods. Regular blood pressure monitoring. Take medication regularly.',
    contentBn: 'লবণ কম খান। চর্বিযুক্ত খাবার এড়িয়ে চলুন। নিয়মিত রক্তচাপ পরীক্ষা করুন। নিয়মিত ওষুধ খান।',
    isFavorite: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: uuidv4(),
    title: 'Back Pain Advice',
    content: 'Apply hot water bag. Avoid heavy lifting. Use lumbar corset. Do regular back strengthening exercises.',
    contentBn: 'গরম পানির ব্যাগ দিয়ে সেঁক নিন। ভারী জিনিস তোলা থেকে বিরত থাকুন। লাম্বার কর্সেট ব্যবহার করুন। নিয়মিত ব্যায়াম করুন।',
    isFavorite: false,
    createdAt: new Date().toISOString(),
  },
];
