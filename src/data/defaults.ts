import { v4 as uuidv4 } from 'uuid';
import type {
  DoctorProfile, PrescriptionTemplate, MedicineCatalogItem,
  DiagnosisCatalogItem, TestCatalogItem, AdviceTemplate, Prescription
} from '../types';

export const DEFAULT_DOCTOR_PROFILE: DoctorProfile = {
  id: 'dr-rafiqul-islam-medicine',
  name: 'Prof. Dr. Mohammad Rafiqul Islam',
  nameBn: 'অধ্যাপক ডাঃ মোঃ রফিকুল ইসলাম',
  degrees: 'MBBS, FCPS (Medicine), MD (Internal Medicine)',
  degreesBn: 'এমবিবিএস, এফসিপিএস (মেডিসিন), এমডি (ইন্টারনাল মেডিসিন)',
  specialty: 'Medicine Specialist & Interventional Diabetologist',
  specialtyBn: 'মেডিসিন ও ডায়াবেটিস বিশেষজ্ঞ',
  bmdcNumber: 'A-45678',
  fellowId: 'F-9281',
  clinicName: 'Popular Diagnostic Centre Ltd.',
  clinicNameBn: 'পপুলার ডায়াগনস্টিক সেন্টার লিঃ',
  address: 'House 16, Road 2, Dhanmondi, Dhaka-1205',
  addressBn: 'বাড়ি ১৬, রোড ২, ধানমন্ডি, ঢাকা-১২০৫',
  phone: '+880 1711-000000',
  email: 'dr.rafiqul@example.com',
  consultationHours: 'Daily 5:00 PM – 9:00 PM (Friday Closed)',
  consultationHoursBn: 'প্রতিদিন বিকাল ৫:০০ - রাত ৯:০০ (শুক্রবার বন্ধ)',
  footerText: 'Emergency: Please visit nearest hospital emergency room',
  footerTextBn: 'জরুরী প্রয়োজনে নিকটস্থ হাসপাতালের জরুরী বিভাগে যোগাযোগ করুন',
  showBnHeader: true,
  theme: 'classic',
  updatedAt: new Date().toISOString(),
};

export const DR_MIZAN_PROFILE: DoctorProfile = {
  id: 'dr-mizanur-rahman-ortho',
  name: 'Dr. Md. Mizanur Rahman (Mizan)',
  nameBn: 'ডাঃ মোঃ মিজানুর রহমান (মিজান)',
  degrees: 'MBBS (SZMC), BCS (Health), FCPS (Ortho), MS (Ortho), FACS (USA), CCD (BIRDEM), Member of AO Spine (Switzerland), Special Training in Spine & Trauma (AO Spine & AO Trauma Surgery)',
  degreesBn: 'এমবিবিএস (এসজেডএমসি), বিসিএস (স্বাস্থ্য), এফসিপিএস (অর্থো-সার্জারি), এমএস (অর্থো), এফএপিএম (আমেরিকা), সিসিডি (বারডেম), মেম্বার এও স্পাইন (সুইজারল্যান্ড), স্পাইন এবং ট্রমা সার্জারিতে বিশেষ প্রশিক্ষণ (এও স্পাইন এবং এও ট্রমা সার্জ্যারি)',
  specialty: 'Consultant – Spine, Ortho & Trauma Surgeon (Ex Dhaka Medical College Hospital & Pongu Hospital NITOR)',
  specialtyBn: 'কনসালটেন্ট – স্পাইন, অর্থোপেডিক ও ট্রমা সার্জন (ঢাকা মেডিকেল কলেজ হাসপাতাল ও পঙ্গু হাসপাতাল নিটোর এক্স)',
  bmdcNumber: 'A-44183',
  fellowId: '8751',
  clinicName: 'Popular Diagnostic Centre Ltd.',
  clinicNameBn: 'পপুলার ডায়াগনস্টিক সেন্টার লিঃ',
  address: 'Room 322 (3rd Floor), Building-2, House 474 & Holding 617 (Building-1), Laxmipur, Rajshahi',
  addressBn: 'রুম নং-৩২২ (৩য় তলা), (বিল্ডিং-২, বাড়ি নং ৪৭৪) এবং হোল্ডিং নং ৬১৭ (বিল্ডিং-১), লক্ষ্মীপুর, রাজশাহী-',
  phone: '01663644611',
  consultationHours: '3:00 PM – 9:00 PM (Friday Closed)',
  consultationHoursBn: 'বিকাল ৩টা - রাত ৯টা (শুক্রবার বন্ধ)',
  footerText: 'Popular Diagnostic Centre Ltd. – Room 322 (3rd Floor) | Hotline: 01663644611',
  footerTextBn: 'পপুলার ডায়াগনস্টিক সেন্টার লিঃ – রুম নং-৩২২ (৩য় তলা) | হটলাইন: ০১৬৬৩৬৪৪৬১১',
  showBnHeader: true,
  theme: 'sanowara',
  updatedAt: new Date().toISOString(),
};

export const DEFAULT_DOCTOR_PROFILES: DoctorProfile[] = [
  DEFAULT_DOCTOR_PROFILE,
  DR_MIZAN_PROFILE,
];

export const JESMIN_SAMPLE_PATIENT = {
  id: 'patient-jesmin-sample',
  name: 'Jesmin',
  patientId: 'P - 202610339',
  age: '40Y22D',
  gender: 'female' as const,
  date: '2026-09-21',
};

export const SANOWARA_SAMPLE_PATIENT = {
  id: 'patient-sanowara-sample',
  name: 'Sanowara',
  patientId: '20265435',
  age: '70Y',
  gender: 'female' as const,
  date: '2026-09-21',
};

export const JESMIN_CERVICAL_TEMPLATE: PrescriptionTemplate = {
  id: 'template-jesmin-cervical-plid',
  name: 'Ortho, Spine & Cervical PID (Jesmin)',
  description: 'Dr. Md. Mizanur Rahman – Neck & Low Back Pain with Radiculopathy, Cervical PID C5/6 & Chronic PLID L4/5',
  complaints: 'Neck pain with radiculopathy ; Lt>Rt\nLBP with radiculopathy',
  history: 'Medical: Hypertension (HTN): Yes',
  onExamination: 'BP: 140 / 90mmHg',
  diagnoses: [
    { id: uuidv4(), text: 'LBP due to chronic PLID L4/5' },
    { id: uuidv4(), text: 'Neck pain due to Cervical PID C5/6' },
  ],
  medicines: [
    {
      id: uuidv4(),
      name: 'TAB NAPROSYN-PLUS 500+20mg',
      genericName: 'NAPROXEN SODIUM+ESOMEPRAZOLE',
      form: 'tablet',
      strength: '500+20mg',
      morning: '১',
      afternoon: '০',
      evening: '১',
      timing: 'খাওয়ার আধা ঘন্টা আগে',
      duration: '১ মাস',
      instruction: 'খাওয়ার আধা ঘন্টা আগে',
    },
    {
      id: uuidv4(),
      name: 'TAB FLEXILAX 10mg',
      genericName: 'BACLOFEN',
      form: 'tablet',
      strength: '10mg',
      morning: '১',
      afternoon: '১',
      evening: '১',
      timing: 'ভরা পেটে',
      duration: '১ মাস',
      instruction: 'ভরা পেটে',
    },
    {
      id: uuidv4(),
      name: 'TAB NEUCOS-B 100mg+200mg+200mcg',
      genericName: 'VITAMIN B1+VITAMIN B6+VITAMIN B12',
      form: 'tablet',
      strength: '100mg+200mg+200mcg',
      morning: '১',
      afternoon: '১',
      evening: '১',
      timing: 'খাওয়ার পরে',
      duration: '৩ মাস',
      instruction: 'খাওয়ার পরে',
    },
    {
      id: uuidv4(),
      name: 'TAB MECOLAGIN 0.5mg',
      genericName: 'MECOBALAMIN',
      form: 'tablet',
      strength: '0.5mg',
      morning: '১',
      afternoon: '০',
      evening: '১',
      timing: 'নিয়মিত',
      duration: '৩ মাস',
    },
    {
      id: uuidv4(),
      name: 'CAP ALFANE 300mg',
      genericName: 'ALPHA LIPOIC ACID',
      form: 'capsule',
      strength: '300mg',
      morning: '১',
      afternoon: '০',
      evening: '১',
      timing: 'নিয়মিত',
      duration: '৩ মাস',
    },
    {
      id: uuidv4(),
      name: 'TAB NUMIRA 2.5mg',
      genericName: 'MIROGABALIN BESYLATE',
      form: 'tablet',
      strength: '2.5mg',
      morning: '০',
      afternoon: '০',
      evening: '১',
      timing: 'রাতে',
      duration: '৩ মাস',
    },
    {
      id: uuidv4(),
      name: 'TAB DEFLACORT 6mg',
      genericName: 'DEFLAZACORT',
      form: 'tablet',
      strength: '6mg',
      morning: '১',
      afternoon: '১',
      evening: '১',
      timing: 'খাওয়ার পরে',
      duration: '১০ দিন (ধাপে ধাপে হ্রাস)',
      instruction: '১+১+১  ১০ দিন\nএরপর, ১+০+১  ১০ দিন\nএরপর, ১+০+০  ১০ দিন',
    },
    {
      id: uuidv4(),
      name: 'TAB BIZORAN 5mg+40mg',
      genericName: 'AMLODIPINE+OLMESARTAN MEDOXOMIL',
      form: 'tablet',
      strength: '5mg+40mg',
      morning: '০',
      afternoon: '০',
      evening: '১',
      timing: 'নিয়মিত',
      duration: 'চলবে',
    },
    {
      id: uuidv4(),
      name: 'TAB CORSIL-DX 600mg+400IU',
      genericName: 'CORAL CALCIUM+VITAMIN D3',
      form: 'tablet',
      strength: '600mg+400IU',
      morning: '০',
      afternoon: '১',
      evening: '০',
      timing: 'খাওয়ার পরে',
      duration: '১ মাস',
    },
    {
      id: uuidv4(),
      name: 'VOLTALIN SUPPOSITORY 50mg',
      genericName: 'DICLOFENAC SODIUM BP',
      form: 'suppository',
      strength: '50mg',
      morning: '১',
      afternoon: '০',
      evening: '০',
      timing: 'ব্যথা খুব বেশি হলে',
      duration: 'প্রয়োজনে',
      instruction: 'পায়খানার রাস্তায়; ব্যাথা খুব বেশি হলে',
    },
  ],
  investigations: [
    { id: uuidv4(), name: 'NCS of Left Upper Limb: Normal', category: 'past' },
    { id: uuidv4(), name: 'CBC with ESR: TC-9200 ESR-55', category: 'past' },
    { id: uuidv4(), name: 'RBS: 5.47', category: 'past' },
    { id: uuidv4(), name: 'Serum Creatinine: 0.79', category: 'past' },
    { id: uuidv4(), name: 'S.Uric Acid: 4.6', category: 'past' },
    { id: uuidv4(), name: 'Anti-CCP Antibody: 0.09', category: 'past' },
    { id: uuidv4(), name: 'MRI LUMBOSACRAL SPINE WITH SCREENING OF WHOLE SPINE: Bulging C5/6 & Herniation L4/5', category: 'past' },
    { id: uuidv4(), name: 'X Ray: Cervical Spine B/V', category: 'requested', instruction: 'Requested' },
  ],
  advice: `১. Hot water ব্যাগ দিয়ে স্যাক দিবেন।
২. CERVICAL COLLAR ব্যবহার করবেন
৩. Lumbar Corset ব্যবহার করবেন
৪. অনেকক্ষন ঘর নিচু করে কাজ করবেন না
৫. পাতলা ও নরম একটি বালিশ ব্যবহার করবেন
৬. চেয়ারে বসে নামাজ পড়বেন।
৭. হাই কমোড বা চেয়ার কমোড ব্যবহার করবেন।
৮. Physio-Therapy: Cervical & Pelvic Intermittent Traction, TENS, SWD, UST, IFT, Back Muscle strengthening exercise - Neck & Back`,
  followUpText: '২১ অক্টোবর, ২০২৬ (১ মাস পর)',
  additionalNotes: `TREATMENT PLAN:
• Conservative for Cervical PID
• Decompression & Fixation for PLID

SPECIAL NOTE:
• Improving >60%`,
  theme: 'sanowara',
  doctorProfileId: 'dr-mizanur-rahman-ortho',
  isDemo: true,
  createdAt: new Date().toISOString(),
};

export const SANOWARA_ORTHO_TEMPLATE: PrescriptionTemplate = {
  id: 'template-sanowara-ortho-plid',
  name: 'Ortho, Spine & PLID (Sanowara)',
  description: 'Dr. Md. Mizanur Rahman – Lumbar PLID L4/5 & L5/S1 with Spinal Canal Stenosis (Real Bangladeshi Clinical Case)',
  complaints: 'LBP with radiculopathy ; Both lower limbs\nDifficulty in walking and prolonged standing',
  history: 'Medical: H/O Fall',
  diagnoses: [
    { id: uuidv4(), text: 'LBP due to Lumbar PLID L4/5 & L5/S1 with Spinal Canal Stenosis' },
  ],
  medicines: [
    {
      id: uuidv4(),
      name: 'TAB NAPROXCIN 500mg',
      genericName: 'Naproxen',
      form: 'tablet',
      strength: '500mg',
      morning: '১',
      afternoon: '০',
      evening: '১',
      timing: 'ভরা পেটে',
      duration: '১৪ দিন',
      instruction: 'ভরা পেটে',
    },
    {
      id: uuidv4(),
      name: 'TAB PANTONIX 20mg',
      genericName: 'Pantoprazole',
      form: 'tablet',
      strength: '20mg',
      morning: '১',
      afternoon: '০',
      evening: '১',
      timing: 'খাওয়ার ৩০ মিনিট আগে',
      duration: '১৪ দিন',
      instruction: 'খাওয়ার ৩০ মিনিট আগে',
    },
    {
      id: uuidv4(),
      name: 'TAB NEUCOS-B 100mg+200mg+200mcg',
      genericName: 'VITAMIN B1+VITAMIN B6+VITAMIN B12',
      form: 'tablet',
      strength: '100mg+200mg+200mcg',
      morning: '১',
      afternoon: '০',
      evening: '১',
      timing: 'খাওয়ার পরে',
      duration: '১ মাস',
      instruction: 'খাওয়ার পরে',
    },
    {
      id: uuidv4(),
      name: 'TAB NUMIRA 2.5mg',
      genericName: 'MIROGABALIN BESYLATE',
      form: 'tablet',
      strength: '2.5mg',
      morning: '০',
      afternoon: '০',
      evening: '১',
      timing: 'রাতে',
      duration: '১ মাস',
    },
    {
      id: uuidv4(),
      name: 'TAB CORSIL-DX 600mg+400IU',
      genericName: 'CORAL CALCIUM+VITAMIN D3',
      form: 'tablet',
      strength: '600mg+400IU',
      morning: '০',
      afternoon: '০',
      evening: '১',
      timing: 'খাওয়ার পরে',
      duration: '১ মাস',
    },
    {
      id: uuidv4(),
      name: 'TAB EVION 400mg',
      genericName: 'Vitamin E',
      form: 'tablet',
      strength: '400mg',
      morning: '১',
      afternoon: '০',
      evening: '০',
      timing: 'খাওয়ার পরে',
      duration: '১ মাস',
      instruction: 'খাওয়ার পরে',
    },
    {
      id: uuidv4(),
      name: 'TAB Zinc-B',
      genericName: 'Zinc + Vitamin B Complex',
      form: 'tablet',
      strength: 'Standard',
      morning: '১',
      afternoon: '০',
      evening: '০',
      timing: 'খাওয়ার পরে',
      duration: '১ মাস',
      instruction: 'খাওয়ার পরে',
    },
    {
      id: uuidv4(),
      name: 'TAB BIZORAN 5mg+40mg',
      genericName: 'Amlodipine + Olmesartan',
      form: 'tablet',
      strength: '5mg+40mg',
      morning: '১',
      afternoon: '০',
      evening: '১',
      timing: 'নিয়মিত',
      duration: 'চলবে',
    },
    {
      id: uuidv4(),
      name: 'VOLTALIN SUPPOSITORY 50mg',
      genericName: 'DICLOFENAC SODIUM BP',
      form: 'suppository',
      strength: '50mg',
      morning: '১',
      afternoon: '০',
      evening: '০',
      timing: 'ব্যথা খুব বেশি হলে',
      duration: 'প্রয়োজনে',
      instruction: 'পায়খানার রাস্তায়; ব্যথা খুব বেশি হলে',
    },
  ],
  investigations: [
    { id: uuidv4(), name: 'RBS: 6.42 mmol/L', category: 'lab' },
    { id: uuidv4(), name: 'Serum Creatinine: 0.77 mg/dl', category: 'lab' },
    { id: uuidv4(), name: 'S.Uric Acid: 5.3 mg/dl', category: 'lab' },
    { id: uuidv4(), name: 'RA Test: Negative', category: 'lab' },
    { id: uuidv4(), name: 'MRI: LUMBOSACRAL SPINE; Moderate Spinal Canal Stenosis, Bulging C4-C6 & Herniation L4/5, L5/S1', category: 'imaging' },
  ],
  advice: `১. Hot water ব্যাগ দিয়ে কোমরে সেঁক দিবেন।
২. Lumbar Corset ব্যবহার করবেন।
৩. অনেকক্ষণ নিচু হয়ে বা ঝুঁকে কাজ করবেন না। ভারী জিনিস তুলবেন না।
৪. পাতলা ও নরম একটি বালিশ ব্যবহার করবেন।
৫. চেয়ারে বসে নামাজ পড়বেন।
৬. হাই কমোড বা চেয়ার কমোড ব্যবহার করবেন।
৭. Physio-Therapy: Pelvic Intermittent Traction, IFT, UST, Back Muscle strengthening exercise - Lower Back`,
  followUpText: '১ মাস পর (BMD রিপোর্ট সহ)',
  additionalNotes: `Treatment plan:
Adv: BMD of Lumbar Spine.
Decompression & Fixation for PLID (Subject to BMD report).`,
  theme: 'sanowara',
  doctorProfileId: 'dr-mizanur-rahman-ortho',
  isDemo: true,
  createdAt: new Date().toISOString(),
};

export const DEMO_TEMPLATES: PrescriptionTemplate[] = [
  JESMIN_CERVICAL_TEMPLATE,
  SANOWARA_ORTHO_TEMPLATE,
  {
    id: uuidv4(),
    name: 'Upper Respiratory Infection (Demo)',
    description: 'Common cold / URI – demo template for UI testing only',
    diagnoses: [{ id: uuidv4(), text: 'Upper Respiratory Tract Infection (URTI)' }],
    medicines: [
      { id: uuidv4(), name: 'Tab. Napa Extend 665mg', genericName: 'Paracetamol', form: 'tablet', strength: '665mg', morning: '1', afternoon: '1', evening: '1', timing: 'After meal', duration: '5 days' },
      { id: uuidv4(), name: 'Cap. Sergel 20mg', genericName: 'Esomeprazole', form: 'capsule', strength: '20mg', morning: '1', afternoon: '0', evening: '0', timing: 'Before meal', duration: '5 days' },
      { id: uuidv4(), name: 'Tab. Fexo 180mg', genericName: 'Fexofenadine', form: 'tablet', strength: '180mg', morning: '0', afternoon: '0', evening: '1', timing: 'After meal', duration: '5 days' },
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
      { id: uuidv4(), name: 'Tab. Naprosyn 500mg', genericName: 'Naproxen', form: 'tablet', strength: '500mg', morning: '1', afternoon: '0', evening: '1', timing: 'After meal', duration: '7 days' },
      { id: uuidv4(), name: 'Tab. Flexilax 10mg', genericName: 'Baclofen', form: 'tablet', strength: '10mg', morning: '1', afternoon: '0', evening: '1', timing: 'Full stomach', duration: '1 month' },
    ],
    investigations: [
      { id: uuidv4(), name: 'X-Ray Lumbosacral Spine B/V', category: 'imaging' },
    ],
    advice: 'Apply hot water bag. Avoid heavy lifting. Use lumbar corset. Do regular back strengthening exercises.',
    followUpText: 'Review after 2 weeks',
    isDemo: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: uuidv4(),
    name: 'Hypertension & Diabetes (Demo)',
    description: 'HTN & T2DM routine follow-up',
    diagnoses: [
      { id: uuidv4(), text: 'Hypertension (HTN)' },
      { id: uuidv4(), text: 'Type 2 Diabetes Mellitus (T2DM)' },
    ],
    medicines: [
      { id: uuidv4(), name: 'Tab. Bizoran 5/20mg', genericName: 'Amlodipine + Olmesartan', form: 'tablet', strength: '5/20mg', morning: '1', afternoon: '0', evening: '0', timing: 'Morning only', duration: 'Continue' },
      { id: uuidv4(), name: 'Tab. Metfo 500mg', genericName: 'Metformin HCl', form: 'tablet', strength: '500mg', morning: '1', afternoon: '0', evening: '1', timing: 'With meal', duration: 'Continue' },
      { id: uuidv4(), name: 'Cap. Maxpro 20mg', genericName: 'Esomeprazole', form: 'capsule', strength: '20mg', morning: '1', afternoon: '0', evening: '0', timing: 'Before meal', duration: '14 days' },
    ],
    investigations: [
      { id: uuidv4(), name: 'Blood Glucose (Fasting)', category: 'lab' },
      { id: uuidv4(), name: 'HbA1c', category: 'lab' },
      { id: uuidv4(), name: 'Serum Creatinine', category: 'lab' },
      { id: uuidv4(), name: 'Lipid Profile', category: 'lab' },
    ],
    advice: 'Low salt, low carbohydrate diet. Walk at least 30 minutes daily. Monitor blood sugar and blood pressure weekly.',
    followUpText: 'Review after 1 month with test reports',
    isDemo: true,
    createdAt: new Date().toISOString(),
  },
];

export const JESMIN_FULL_PRESCRIPTION: Prescription = {
  id: 'rx-jesmin-cervical-plid',
  prescriptionNumber: 'P - 202610339',
  date: '2026-09-21T09:00:00.000Z',
  doctorProfileId: DR_MIZAN_PROFILE.id,
  patient: {
    id: 'patient-jesmin-sample',
    patientId: 'P - 202610339',
    name: 'Jesmin',
    age: '40Y22D',
    gender: 'female',
    bloodPressure: '140/90',
    createdAt: '2026-09-21T09:00:00.000Z',
    updatedAt: '2026-09-21T09:00:00.000Z',
  },
  complaints: 'Neck pain with radiculopathy ; Lt>Rt\nLBP with radiculopathy',
  history: 'Medical: Hypertension (HTN): Yes',
  onExamination: 'BP: 140 / 90mmHg',
  diagnoses: [
    { id: uuidv4(), text: 'LBP due to chronic PLID L4/5' },
    { id: uuidv4(), text: 'Neck pain due to Cervical PID C5/6' },
  ],
  medicines: JESMIN_CERVICAL_TEMPLATE.medicines,
  investigations: JESMIN_CERVICAL_TEMPLATE.investigations,
  advice: JESMIN_CERVICAL_TEMPLATE.advice,
  followUpText: '২১ অক্টোবর, ২০২৬ (১ মাস পর)',
  additionalNotes: `TREATMENT PLAN:
• Conservative for Cervical PID
• Decompression & Fixation for PLID

SPECIAL NOTE:
• Improving >60%`,
  language: 'bn',
  theme: 'sanowara',
  printMode: 'full',
  showQrCode: true,
  isDraft: false,
  createdAt: '2026-09-21T09:00:00.000Z',
  updatedAt: '2026-09-21T09:00:00.000Z',
};

export const SANOWARA_FULL_PRESCRIPTION: Prescription = {
  id: 'rx-sanowara-ortho-plid',
  prescriptionNumber: '20265435',
  date: '2026-09-21T09:00:00.000Z',
  doctorProfileId: DR_MIZAN_PROFILE.id,
  patient: {
    id: 'patient-sanowara-sample',
    patientId: '20265435',
    name: 'Sanowara',
    age: '70Y',
    gender: 'female',
    createdAt: '2026-09-21T09:00:00.000Z',
    updatedAt: '2026-09-21T09:00:00.000Z',
  },
  complaints: 'LBP with radiculopathy ; Both lower limbs\nDifficulty in walking and prolonged standing',
  history: 'Medical\n• H/O Fall',
  diagnoses: [
    { id: uuidv4(), text: 'LBP due to Lumbar PLID L4/5 & L5/S1 with Spinal Canal Stenosis' },
  ],
  medicines: SANOWARA_ORTHO_TEMPLATE.medicines,
  investigations: SANOWARA_ORTHO_TEMPLATE.investigations,
  advice: SANOWARA_ORTHO_TEMPLATE.advice,
  followUpText: '১ মাস পর (BMD রিপোর্ট সহ)',
  additionalNotes: `Treatment plan:
• Adv: BMD of Lumbar Spine.
• Decompression & Fixation for PLID (Subject to BMD report).`,
  language: 'bn',
  theme: 'sanowara',
  printMode: 'full',
  showQrCode: true,
  isDraft: false,
  createdAt: '2026-09-21T09:00:00.000Z',
  updatedAt: '2026-09-21T09:00:00.000Z',
};

export const DEMO_PRESCRIPTIONS: Prescription[] = [
  JESMIN_FULL_PRESCRIPTION,
  SANOWARA_FULL_PRESCRIPTION,
];

export const DEFAULT_MEDICINE_CATALOG: MedicineCatalogItem[] = [
  // Ortho, Spine & Neurology
  { id: uuidv4(), name: 'Tab. Naprosyn-Plus 500+20mg', genericName: 'Naproxen Sodium + Esomeprazole', form: 'tablet', strength: '500+20mg', isFavorite: true, useCount: 25 },
  { id: uuidv4(), name: 'Tab. Naproxcin 500mg', genericName: 'Naproxen', form: 'tablet', strength: '500mg', isFavorite: true, useCount: 20 },
  { id: uuidv4(), name: 'Tab. Flexilax 10mg', genericName: 'Baclofen', form: 'tablet', strength: '10mg', isFavorite: true, useCount: 21 },
  { id: uuidv4(), name: 'Tab. Neucos-B', genericName: 'Vitamin B1 + B6 + B12', form: 'tablet', strength: '100mg+200mg+200mcg', isFavorite: true, useCount: 19 },
  { id: uuidv4(), name: 'Tab. Mecolagin 0.5mg', genericName: 'Mecobalamin', form: 'tablet', strength: '0.5mg', isFavorite: true, useCount: 18 },
  { id: uuidv4(), name: 'Cap. Alfane 300mg', genericName: 'Alpha Lipoic Acid', form: 'capsule', strength: '300mg', isFavorite: true, useCount: 17 },
  { id: uuidv4(), name: 'Tab. Numira 2.5mg', genericName: 'Mirogabalin Besylate', form: 'tablet', strength: '2.5mg', isFavorite: true, useCount: 16 },
  { id: uuidv4(), name: 'Tab. Deflacort 6mg', genericName: 'Deflazacort', form: 'tablet', strength: '6mg', isFavorite: true, useCount: 16 },
  { id: uuidv4(), name: 'Tab. Corsil-DX 600mg+400IU', genericName: 'Coral Calcium + Vitamin D3', form: 'tablet', strength: '600mg+400IU', isFavorite: true, useCount: 18 },
  { id: uuidv4(), name: 'Tab. Evion 400mg', genericName: 'Vitamin E', form: 'tablet', strength: '400mg', isFavorite: true, useCount: 15 },
  { id: uuidv4(), name: 'Tab. Zinc-B', genericName: 'Zinc + Vitamin B Complex', form: 'tablet', strength: 'Standard', isFavorite: true, useCount: 14 },
  { id: uuidv4(), name: 'Voltalin Suppository 50mg', genericName: 'Diclofenac Sodium BP', form: 'suppository', strength: '50mg', isFavorite: true, useCount: 12 },
  // Antipyretics / Analgesics
  { id: uuidv4(), name: 'Tab. Napa 500mg', genericName: 'Paracetamol', form: 'tablet', strength: '500mg', isFavorite: true, useCount: 15 },
  { id: uuidv4(), name: 'Tab. Napa Extend 665mg', genericName: 'Paracetamol', form: 'tablet', strength: '665mg', isFavorite: true, useCount: 14 },
  { id: uuidv4(), name: 'Tab. Ace Plus', genericName: 'Paracetamol + Caffeine', form: 'tablet', strength: '500mg/65mg', isFavorite: true, useCount: 12 },
  { id: uuidv4(), name: 'Syp. Napa 120mg/5ml', genericName: 'Paracetamol', form: 'syrup', strength: '120mg/5ml', isFavorite: false, useCount: 6 },
  { id: uuidv4(), name: 'Tab. Naprosyn 500mg', genericName: 'Naproxen', form: 'tablet', strength: '500mg', isFavorite: false, useCount: 8 },
  { id: uuidv4(), name: 'Tab. Torax 10mg', genericName: 'Ketorolac Tromethamine', form: 'tablet', strength: '10mg', isFavorite: false, useCount: 4 },

  // PPI / Gastrointestinal
  { id: uuidv4(), name: 'Cap. Sergel 20mg', genericName: 'Esomeprazole', form: 'capsule', strength: '20mg', isFavorite: true, useCount: 18 },
  { id: uuidv4(), name: 'Cap. Seclo 20mg', genericName: 'Omeprazole', form: 'capsule', strength: '20mg', isFavorite: true, useCount: 15 },
  { id: uuidv4(), name: 'Cap. Maxpro 20mg', genericName: 'Esomeprazole', form: 'capsule', strength: '20mg', isFavorite: true, useCount: 12 },
  { id: uuidv4(), name: 'Tab. Pantonix 20mg', genericName: 'Pantoprazole', form: 'tablet', strength: '20mg', isFavorite: false, useCount: 7 },
  { id: uuidv4(), name: 'Syp. Gaviscon', genericName: 'Sodium Alginate + Potassium Bicarbonate', form: 'syrup', strength: 'Oral Susp', isFavorite: false, useCount: 5 },

  // Antihistamines & Respiratory
  { id: uuidv4(), name: 'Tab. Fexo 120mg', genericName: 'Fexofenadine HCl', form: 'tablet', strength: '120mg', isFavorite: true, useCount: 10 },
  { id: uuidv4(), name: 'Tab. Fexo 180mg', genericName: 'Fexofenadine HCl', form: 'tablet', strength: '180mg', isFavorite: true, useCount: 9 },
  { id: uuidv4(), name: 'Tab. Monas 10mg', genericName: 'Montelukast', form: 'tablet', strength: '10mg', isFavorite: true, useCount: 11 },
  { id: uuidv4(), name: 'Tab. Bilashin 20mg', genericName: 'Bilastine', form: 'tablet', strength: '20mg', isFavorite: false, useCount: 6 },
  { id: uuidv4(), name: 'Syp. Tusca', genericName: 'Dextromethorphan + Guaiphenesin', form: 'syrup', strength: '100ml', isFavorite: false, useCount: 5 },
  { id: uuidv4(), name: 'Syp. Adovas', genericName: 'Vasaka Herbal Cough Syrup', form: 'syrup', strength: '100ml', isFavorite: false, useCount: 4 },

  // Antibiotics
  { id: uuidv4(), name: 'Tab. Azithrocin 500mg', genericName: 'Azithromycin', form: 'tablet', strength: '500mg', isFavorite: true, useCount: 8 },
  { id: uuidv4(), name: 'Cap. Cef-3 200mg', genericName: 'Cefixime', form: 'capsule', strength: '200mg', isFavorite: false, useCount: 6 },
  { id: uuidv4(), name: 'Tab. Ciprocin 500mg', genericName: 'Ciprofloxacin', form: 'tablet', strength: '500mg', isFavorite: false, useCount: 5 },
  { id: uuidv4(), name: 'Tab. Moxaclav 625mg', genericName: 'Amoxicillin + Clavulanic Acid', form: 'tablet', strength: '625mg', isFavorite: false, useCount: 4 },

  // Muscle Relaxants & Neuro
  { id: uuidv4(), name: 'Tab. Flexilax 10mg', genericName: 'Baclofen', form: 'tablet', strength: '10mg', isFavorite: false, useCount: 6 },
  { id: uuidv4(), name: 'Tab. Neuro-B', genericName: 'Vitamin B1 + B6 + B12', form: 'tablet', strength: 'High Potency', isFavorite: false, useCount: 8 },
  { id: uuidv4(), name: 'Tab. Rivotril 0.5mg', genericName: 'Clonazepam', form: 'tablet', strength: '0.5mg', isFavorite: false, useCount: 5 },

  // Antihypertensives & Cardiovascular
  { id: uuidv4(), name: 'Tab. Amlodipine 5mg', genericName: 'Amlodipine', form: 'tablet', strength: '5mg', isFavorite: false, useCount: 7 },
  { id: uuidv4(), name: 'Tab. Bizoran 5/20mg', genericName: 'Amlodipine + Olmesartan', form: 'tablet', strength: '5/20mg', isFavorite: true, useCount: 9 },
  { id: uuidv4(), name: 'Tab. Losartan 50mg', genericName: 'Losartan Potassium', form: 'tablet', strength: '50mg', isFavorite: false, useCount: 6 },
  { id: uuidv4(), name: 'Tab. Rosuva 10mg', genericName: 'Rosuvastatin', form: 'tablet', strength: '10mg', isFavorite: false, useCount: 5 },

  // Antidiabetic
  { id: uuidv4(), name: 'Tab. Metformin 500mg', genericName: 'Metformin HCl', form: 'tablet', strength: '500mg', isFavorite: true, useCount: 8 },
  { id: uuidv4(), name: 'Tab. Comprid 2mg', genericName: 'Glimepiride', form: 'tablet', strength: '2mg', isFavorite: false, useCount: 4 },

  // Supplements
  { id: uuidv4(), name: 'Cap. D-Rise 20000 IU', genericName: 'Cholecalciferol (Vit D3)', form: 'capsule', strength: '20000 IU', isFavorite: true, useCount: 7 },
  { id: uuidv4(), name: 'Tab. Bextram Gold', genericName: 'Multivitamin & Multimineral', form: 'tablet', strength: 'A to Z Gold', isFavorite: false, useCount: 6 },
];

export const DEFAULT_DIAGNOSIS_CATALOG: DiagnosisCatalogItem[] = [
  { id: uuidv4(), text: 'Upper Respiratory Tract Infection (URTI)', isFavorite: true, useCount: 15 },
  { id: uuidv4(), text: 'Low Back Pain (LBP)', isFavorite: true, useCount: 12 },
  { id: uuidv4(), text: 'Hypertension (HTN)', isFavorite: true, useCount: 10 },
  { id: uuidv4(), text: 'Type 2 Diabetes Mellitus (T2DM)', isFavorite: true, useCount: 10 },
  { id: uuidv4(), text: 'Peptic Ulcer Disease (PUD) / GERD', isFavorite: true, useCount: 9 },
  { id: uuidv4(), text: 'Urinary Tract Infection (UTI)', isFavorite: false, useCount: 8 },
  { id: uuidv4(), text: 'Lumbar Spondylosis', isFavorite: false, useCount: 7 },
  { id: uuidv4(), text: 'Cervical Spondylosis', isFavorite: false, useCount: 5 },
  { id: uuidv4(), text: 'Acute Gastroenteritis (AGE)', isFavorite: false, useCount: 6 },
  { id: uuidv4(), text: 'Bronchial Asthma', isFavorite: false, useCount: 5 },
  { id: uuidv4(), text: 'Vitamin D Deficiency', isFavorite: false, useCount: 4 },
  { id: uuidv4(), text: 'Iron Deficiency Anemia', isFavorite: false, useCount: 4 },
  { id: uuidv4(), text: 'Dengue Fever', isFavorite: false, useCount: 4 },
  { id: uuidv4(), text: 'Irritable Bowel Syndrome (IBS)', isFavorite: false, useCount: 3 },
  { id: uuidv4(), text: 'Generalized Anxiety Disorder (GAD)', isFavorite: false, useCount: 3 },
];

export const DEFAULT_TEST_CATALOG: TestCatalogItem[] = [
  { id: uuidv4(), name: 'CBC with ESR', category: 'lab', isFavorite: true, useCount: 18 },
  { id: uuidv4(), name: 'Urine R/E', category: 'lab', isFavorite: true, useCount: 14 },
  { id: uuidv4(), name: 'Blood Glucose (Fasting & 2h ABBF)', category: 'lab', isFavorite: true, useCount: 15 },
  { id: uuidv4(), name: 'HbA1c', category: 'lab', isFavorite: true, useCount: 12 },
  { id: uuidv4(), name: 'Serum Creatinine', category: 'lab', isFavorite: true, useCount: 12 },
  { id: uuidv4(), name: 'Lipid Profile', category: 'lab', isFavorite: false, useCount: 9 },
  { id: uuidv4(), name: 'Serum SGPT / ALT', category: 'lab', isFavorite: false, useCount: 8 },
  { id: uuidv4(), name: 'Thyroid Profile (TSH, FT4)', category: 'lab', isFavorite: false, useCount: 7 },
  { id: uuidv4(), name: 'Serum Electrolytes', category: 'lab', isFavorite: false, useCount: 6 },
  { id: uuidv4(), name: 'Dengue NS1 Ag & Dengue Antibody', category: 'lab', isFavorite: false, useCount: 6 },
  { id: uuidv4(), name: 'Serum Uric Acid', category: 'lab', isFavorite: false, useCount: 5 },
  { id: uuidv4(), name: 'Serum 25-OH Vitamin D', category: 'lab', isFavorite: false, useCount: 5 },
  { id: uuidv4(), name: 'X-Ray Chest PA View', category: 'imaging', isFavorite: true, useCount: 10 },
  { id: uuidv4(), name: 'X-Ray Lumbosacral Spine B/V', category: 'imaging', isFavorite: false, useCount: 7 },
  { id: uuidv4(), name: 'USG of Whole Abdomen', category: 'imaging', isFavorite: false, useCount: 8 },
  { id: uuidv4(), name: 'ECG (12-Lead)', category: 'other', isFavorite: true, useCount: 11 },
  { id: uuidv4(), name: 'Echocardiogram', category: 'other', isFavorite: false, useCount: 4 },
];

export const DEFAULT_ADVICE_TEMPLATES: AdviceTemplate[] = [
  {
    id: uuidv4(),
    title: 'General Rest & Hydration',
    content: 'Take plenty of fluids. Rest adequately. Avoid cold food and drinks.',
    contentBn: 'প্রচুর তরল ও কুসুম গরম পানি পান করুন। পর্যাপ্ত বিশ্রাম নিন। ঠান্ডা খাবার ও ফ্রিজের পানি পরিহার করুন।',
    isFavorite: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: uuidv4(),
    title: 'Gastritis & PUD Advice',
    content: 'Take meals on time. Avoid oily, spicy, and deep-fried food. Do not lie down immediately after dinner.',
    contentBn: 'সময়মতো খাবার গ্রহণ করুন। অতিরিক্ত তেল, ঝাল, চর্বিযুক্ত ও ভাজাপোড়া খাবার পরিহার করুন। রাতের খাবারের সাথে সাথেই শুয়ে পড়বেন না (কমপক্ষে ২ ঘণ্টা পর ঘুমাবেন)।',
    isFavorite: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: uuidv4(),
    title: 'Diabetic Lifestyle Advice',
    content: 'Follow a strict diabetic diet. Engage in brisk walking 30-45 minutes daily. Monitor blood sugar regularly.',
    contentBn: 'মিষ্টি ও চিনিযুক্ত খাবার সম্পূর্ণ পরিহার করুন। প্রতিদিন কমপক্ষে ৩০-৪০ মিনিট হাঁটুন। নিয়মিত রক্তের গ্লুকোজ পরীক্ষা করুন এবং চার্ট সংরক্ষণ করুন।',
    isFavorite: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: uuidv4(),
    title: 'Hypertension & Heart Advice',
    content: 'Reduce dietary salt strictly (no added salt). Avoid red meat and excess ghee/oil. Check blood pressure regularly.',
    contentBn: 'খাবারে বাড়তি কাঁচা লবণ ও অতিরিক্ত লবণযুক্ত খাবার সম্পূর্ণ বর্জন করুন। গরু/খাসির মাংস ও চর্বি এড়িয়ে চলুন। নিয়মিত রক্তচাপ মাপুন।',
    isFavorite: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: uuidv4(),
    title: 'Back Pain & Spine Advice',
    content: 'Apply hot compress. Avoid heavy lifting and bending forward. Use hard, flat bed. Wear lumbar support if advised.',
    contentBn: 'গরম পানির ব্যাগ দিয়ে দিনে ২-৩ বার সেঁক দিন। সামনের দিকে ঝুঁকে ভারী জিনিস তুলবেন না। শক্ত ও সমতল বিছানায় ঘুমাবেন। নিয়মিত পিঠের ব্যায়াম করবেন।',
    isFavorite: false,
    createdAt: new Date().toISOString(),
  },
];
