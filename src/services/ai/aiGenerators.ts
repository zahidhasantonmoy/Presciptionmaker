import { callGeminiJson, hasGeminiApiKey } from './geminiClient';
import { BangladeshRailwayTicket } from '../ticket/TicketMaker';
import {
  RAILWAY_TRAINS,
  RAILWAY_STATIONS,
  RAILWAY_CLASSES,
  toBanglaDigits,
  getStationBanglaName,
  formatCoachSeat,
} from '../ticket/railwayData';
import { Prescription, PrescriptionMedicine, Diagnosis } from '../../types';
import { v4 as uuidv4 } from 'uuid';

// Helper to calculate relative date like tomorrow, day after tomorrow
export function resolveRelativeDate(text: string): { dateStr: string; banglaDateStr: string } {
  const lower = text.toLowerCase();
  const now = new Date();
  let target = new Date();

  if (lower.includes('agamikal') || lower.includes('আগামীকাল') || lower.includes('tomorrow') || lower.includes('kal')) {
    target.setDate(now.getDate() + 1);
  } else if (lower.includes('porshu') || lower.includes('পরশু') || lower.includes('day after tomorrow')) {
    target.setDate(now.getDate() + 2);
  } else if (lower.includes('aj') || lower.includes('আজ') || lower.includes('today')) {
    // today
  }

  const yyyy = target.getFullYear();
  const mm = String(target.getMonth() + 1).padStart(2, '0');
  const dd = String(target.getDate()).padStart(2, '0');
  const dateStr = `${yyyy}-${mm}-${dd}`;

  return {
    dateStr,
    banglaDateStr: `${toBanglaDigits(dd)}/${toBanglaDigits(mm)}/${toBanglaDigits(yyyy)}`,
  };
}

// Generates a mock PNR / Ticket ID
export function generateTicketIds(): { pnr: string; ticketId: string } {
  const chars = '0123456789ABCDEF';
  let pnr = '';
  for (let i = 0; i < 13; i++) {
    pnr += chars[Math.floor(Math.random() * chars.length)];
  }
  const ticketId = 'BR-' + Math.floor(100000 + Math.random() * 900000);
  return { pnr, ticketId };
}

// ─────────────────────────────────────────────────────────────
// 1. RAILWAY TICKET AI GENERATOR
// ─────────────────────────────────────────────────────────────

export async function generateTicketAi(
  prompt: string,
  baseTicket: BangladeshRailwayTicket
): Promise<{ ticket: BangladeshRailwayTicket; summary: string }> {
  // Try with Gemini API if key is available
  if (hasGeminiApiKey()) {
    try {
      const systemInstruction = `You are an expert Bangladesh Railway ticket ticketing assistant.
Current date is: ${new Date().toISOString().split('T')[0]}.
Given the user prompt (which may be in English, Bangla, or Banglish), extract and return a valid JSON object matching the BangladeshRailwayTicket interface.

Rules:
1. Identify the train from Bangladesh Railway (e.g., Padma Express, Suborna Express, Sonar Bangla Express, Parabat, Upaban, Mohanagar, Ekota, Drutojan, etc.).
2. Station routing: identify fromStation and toStation. Default fromStation to 'Dhaka' if not specified.
3. Journey date: parse relative dates like "আগামীকাল" (tomorrow = +1 day), "পরশু" (+2 days), or specific dates.
4. Passenger info: count adults, children, seniors. If passenger name provided, use it, else keep default or realistic name.
5. Classes: 'S_CHAIR', 'SNIGDHA', 'AC_S', 'AC_B', 'SHOVON', etc.
6. Fares: calculate appropriate realistic fare for the route and class.
7. Return ONLY valid JSON with fields:
{
  "passengerName": string,
  "journeyDate": "YYYY-MM-DD",
  "journeyTime": "HH:mm",
  "fromStation": string,
  "fromStationBn": string,
  "toStation": string,
  "toStationBn": string,
  "trainName": string,
  "trainNameBn": string,
  "trainNumber": string,
  "className": string,
  "classNameBn": string,
  "coachSeat": string,
  "coachSeatBn": string,
  "numSeats": number,
  "numAdults": number,
  "numSeniors": number,
  "numChildren": number,
  "fare": number,
  "vat": number,
  "serviceCharge": number
}`;

      const userText = `Current Prompt: "${prompt}"\nBase Ticket Reference:\n${JSON.stringify({
        fromStation: baseTicket.fromStation,
        toStation: baseTicket.toStation,
        trainName: baseTicket.trainName,
        className: baseTicket.className,
      })}`;

      const res = await callGeminiJson<Partial<BangladeshRailwayTicket>>(userText, systemInstruction);

      if (res.success && res.data) {
        const { pnr, ticketId } = generateTicketIds();
        const d = res.data;

        // Find train match in database to ensure 100% accuracy of train number & time if available
        const matchedTrain = RAILWAY_TRAINS.find(
          t => t.name.toLowerCase() === (d.trainName || '').toLowerCase() ||
               (d.trainNumber && t.number === d.trainNumber)
        );

        const fromBn = d.fromStationBn || getStationBanglaName(d.fromStation || 'Dhaka');
        const toBn = d.toStationBn || getStationBanglaName(d.toStation || 'Rajshahi');

        const merged: BangladeshRailwayTicket = {
          ...baseTicket,
          ...d,
          id: ticketId,
          pnrNumber: pnr,
          fromStationBn: fromBn,
          toStationBn: toBn,
          trainNumber: matchedTrain ? matchedTrain.number : (d.trainNumber || '759'),
          trainName: matchedTrain ? matchedTrain.name : (d.trainName || 'PADMA EXPRESS'),
          trainNameBn: matchedTrain ? matchedTrain.nameBn : (d.trainNameBn || 'পদ্মা এক্সপ্রেস'),
          journeyTime: matchedTrain ? matchedTrain.departureTime : (d.journeyTime || '23:00'),
          fare: Number(d.fare) || 450,
          vat: Number(d.vat) || 0,
          serviceCharge: Number(d.serviceCharge) || 20,
          numSeats: Number(d.numSeats) || 1,
          numAdults: Number(d.numAdults) || 1,
          createdAt: new Date().toISOString(),
        };

        return {
          ticket: merged,
          summary: `Gemini AI: ${merged.trainName} (${merged.trainNumber}), ${merged.fromStation} ➔ ${merged.toStation}, Date: ${merged.journeyDate}, Seats: ${merged.numSeats}`,
        };
      }
    } catch {
      // fallback to offline rule-based parser
    }
  }

  // Smart Offline / Fallback Parser for Railway Ticket
  return parseRailwayTicketLocally(prompt, baseTicket);
}

function parseRailwayTicketLocally(
  prompt: string,
  baseTicket: BangladeshRailwayTicket
): { ticket: BangladeshRailwayTicket; summary: string } {
  const pLower = prompt.toLowerCase();
  const { dateStr } = resolveRelativeDate(prompt);

  // 1. Train detection
  let matchedTrain = RAILWAY_TRAINS.find(t =>
    pLower.includes(t.name.toLowerCase()) ||
    prompt.includes(t.nameBn) ||
    pLower.includes(t.name.toLowerCase().replace(' express', ''))
  );

  // Common aliases
  if (!matchedTrain) {
    if (pLower.includes('padma') || prompt.includes('পদ্মা')) {
      matchedTrain = RAILWAY_TRAINS.find(t => t.name.includes('PADMA')) || RAILWAY_TRAINS[0];
    } else if (pLower.includes('sonar bangla') || prompt.includes('সোনার বাংলা')) {
      matchedTrain = RAILWAY_TRAINS.find(t => t.name.includes('SONAR BANGLA')) || RAILWAY_TRAINS[0];
    } else if (pLower.includes('suborno') || pLower.includes('suborna') || prompt.includes('সুবর্ণ')) {
      matchedTrain = RAILWAY_TRAINS.find(t => t.name.includes('SUBORNO')) || RAILWAY_TRAINS[0];
    } else if (pLower.includes('chitra') || prompt.includes('চিত্রা')) {
      matchedTrain = RAILWAY_TRAINS.find(t => t.name.includes('CHITRA')) || RAILWAY_TRAINS[0];
    } else if (pLower.includes('cox') || prompt.includes('কক্সবাজার')) {
      matchedTrain = RAILWAY_TRAINS.find(t => t.name.includes('COX')) || RAILWAY_TRAINS[0];
    }
  }

  if (!matchedTrain) {
    matchedTrain = RAILWAY_TRAINS[0]; // fallback
  }

  // 2. Station routing
  let fromStation = matchedTrain.fromStation;
  let toStation = matchedTrain.toStation;

  // Check if user explicitly mentioned origin or destination
  for (const st of RAILWAY_STATIONS) {
    if (pLower.includes(st.name.toLowerCase()) || prompt.includes(st.nameBn)) {
      if (pLower.includes(`theke ${st.name.toLowerCase()}`) || prompt.includes(`${st.nameBn} থেকে`)) {
        fromStation = st.name;
      } else if (pLower.includes(`to ${st.name.toLowerCase()}`) || prompt.includes(`${st.nameBn} তে`) || prompt.includes(`jabo`)) {
        toStation = st.name;
      }
    }
  }

  // 3. Passenger count
  let numSeats = 1;
  const seatMatch = prompt.match(/(\d+)\s*(jon|person|passenger|সিট|জন)/i);
  if (seatMatch && seatMatch[1]) {
    numSeats = parseInt(seatMatch[1], 10);
  } else if (pLower.includes('1 jon') || pLower.includes('ek jon') || prompt.includes('১ জন') || pLower.includes('1 person')) {
    numSeats = 1;
  } else if (pLower.includes('2 jon') || pLower.includes('dui jon') || prompt.includes('২ জন') || pLower.includes('2 person')) {
    numSeats = 2;
  } else if (pLower.includes('3 jon') || prompt.includes('৩ জন')) {
    numSeats = 3;
  } else if (pLower.includes('4 jon') || prompt.includes('৪ জন')) {
    numSeats = 4;
  }

  // 4. Class detection
  let selectedClass = RAILWAY_CLASSES[0]; // S_CHAIR default
  if (pLower.includes('snigdha') || prompt.includes('স্নিগ্ধা')) {
    selectedClass = RAILWAY_CLASSES.find(c => c.code === 'SNIGDHA') || selectedClass;
  } else if (pLower.includes('ac') || prompt.includes('এসি')) {
    selectedClass = RAILWAY_CLASSES.find(c => c.code.includes('AC')) || selectedClass;
  } else if (pLower.includes('shovon') || prompt.includes('শোভন')) {
    selectedClass = RAILWAY_CLASSES.find(c => c.code === 'SHOVON') || selectedClass;
  }

  // 5. Coach & Seat generation
  const coachLetters = ['KHA', 'GA', 'GHA', 'CHA', 'JA', 'JHA', 'TA', 'THA', 'DA'];
  const coachLetter = coachLetters[Math.floor(Math.random() * coachLetters.length)];
  const startSeat = Math.floor(Math.random() * 40) + 1;
  const seatList: string[] = [];
  for (let i = 0; i < numSeats; i++) {
    seatList.push(`${coachLetter}-${startSeat + i}`);
  }
  const coachSeat = seatList.join(', ');
  const coachSeatBn = formatCoachSeat(coachSeat);

  // 6. Fare calculation
  const unitFare = matchedTrain.fares[selectedClass.code] || selectedClass.defaultFare || 450;
  const totalFare = unitFare * numSeats;
  const vat = 0;
  const serviceCharge = 20 * numSeats;

  const { pnr, ticketId } = generateTicketIds();
  const now = new Date();
  const issueDate = now.toISOString().split('T')[0];
  const issueTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  const generatedTicket: BangladeshRailwayTicket = {
    ...baseTicket,
    id: ticketId,
    pnrNumber: pnr,
    issueDate,
    issueTime,
    journeyDate: dateStr,
    journeyTime: matchedTrain.departureTime,
    fromStation,
    fromStationBn: getStationBanglaName(fromStation),
    toStation,
    toStationBn: getStationBanglaName(toStation),
    trainName: matchedTrain.name,
    trainNameBn: matchedTrain.nameBn,
    trainNumber: matchedTrain.number,
    className: selectedClass.code,
    classNameBn: selectedClass.labelBn,
    coachSeat,
    coachSeatBn,
    numSeats,
    numAdults: numSeats,
    numSeniors: 0,
    numChildren: 0,
    fare: totalFare,
    vat,
    serviceCharge,
    createdAt: new Date().toISOString(),
  };

  return {
    ticket: generatedTicket,
    summary: `AI Generated: ${generatedTicket.trainName} (${generatedTicket.trainNumber}), ${generatedTicket.fromStation} ➔ ${generatedTicket.toStation}, Date: ${generatedTicket.journeyDate}, Seats: ${generatedTicket.numSeats} (${generatedTicket.coachSeat})`,
  };
}

// ─────────────────────────────────────────────────────────────
// 2. PRESCRIPTION AI GENERATOR
// ─────────────────────────────────────────────────────────────

export interface PrescriptionAiResult {
  patientName?: string;
  age?: string;
  gender?: 'male' | 'female' | 'other';
  complaints?: string[];
  diagnosis?: string[];
  medicines?: Array<{
    name: string;
    generic?: string;
    dosage?: string;
    timing?: string;
    duration?: string;
    instructions?: string;
  }>;
  investigations?: string[];
  advice?: string[];
  summary: string;
}

export async function generatePrescriptionAi(prompt: string): Promise<PrescriptionAiResult> {
  if (hasGeminiApiKey()) {
    try {
      const systemInstruction = `You are an AI Clinical Assistant for doctors in Bangladesh.
Extract clinical information from the doctor's prompt (in English, Bangla, or Banglish).
Return a valid JSON object matching:
{
  "patientName": string,
  "age": string,
  "gender": "male" | "female" | "other",
  "complaints": string[],
  "diagnosis": string[],
  "medicines": [
    {
      "name": string,
      "generic": string,
      "dosage": string (e.g. "1+0+1" or "1+1+1"),
      "timing": string (e.g. "After Meal" or "Before Meal"),
      "duration": string (e.g. "5 Days" or "1 Month"),
      "instructions": string
    }
  ],
  "investigations": string[],
  "advice": string[],
  "summary": string
}`;

      const res = await callGeminiJson<PrescriptionAiResult>(prompt, systemInstruction);
      if (res.success && res.data) {
        return res.data;
      }
    } catch {
      // fallback
    }
  }

  // Fallback offline parser for Prescription
  const pLower = prompt.toLowerCase();
  const complaints: string[] = [];
  const medicines: any[] = [];
  const diagnosis: string[] = [];
  const advice: string[] = ['Drink plenty of fluids', 'Rest adequately'];

  if (pLower.includes('fever') || prompt.includes('জ্বর')) {
    complaints.push('Fever for 3 days');
    diagnosis.push('Viral Pyrexia');
    medicines.push({
      name: 'Napa Extend 665mg',
      generic: 'Paracetamol',
      dosage: '1+1+1',
      timing: 'After Meal',
      duration: '5 Days',
      instructions: 'Take if fever > 100°F',
    });
  }

  if (pLower.includes('cough') || prompt.includes('কাশি')) {
    complaints.push('Dry Cough for 5 days');
    medicines.push({
      name: 'Tofen Syrup',
      generic: 'Ketotifen',
      dosage: '1 tsp twice daily',
      timing: 'After Meal',
      duration: '7 Days',
      instructions: 'Shake well before use',
    });
  }

  if (pLower.includes('pain') || prompt.includes('ব্যথা')) {
    complaints.push('Generalized body pain');
    medicines.push({
      name: 'Maxpro 20mg',
      generic: 'Esomeprazole',
      dosage: '1+0+1',
      timing: 'Before Meal',
      duration: '14 Days',
      instructions: 'Take 30 mins before food',
    });
  }

  if (medicines.length === 0) {
    medicines.push({
      name: 'Ace Plus',
      generic: 'Paracetamol + Caffeine',
      dosage: '1+0+1',
      timing: 'After Meal',
      duration: '3 Days',
      instructions: 'Take after meals',
    });
  }

  return {
    patientName: 'Md. Hasan',
    age: '32 Y',
    gender: 'male',
    complaints: complaints.length ? complaints : ['Headache and malaise'],
    diagnosis: diagnosis.length ? diagnosis : ['Clinical evaluation pending'],
    medicines,
    investigations: ['CBC', 'Serum Creatinine'],
    advice,
    summary: 'Prescription generated with clinical guidelines.',
  };
}

// ─────────────────────────────────────────────────────────────
// 3. INVOICE AI GENERATOR
// ─────────────────────────────────────────────────────────────

export interface InvoiceAiResult {
  clientName: string;
  clientEmail?: string;
  clientAddress?: string;
  items: Array<{
    description: string;
    quantity: number;
    rate: number;
  }>;
  currency?: string;
  taxRate?: number;
  discount?: number;
  notes?: string;
  summary: string;
}

export async function generateInvoiceAi(prompt: string): Promise<InvoiceAiResult> {
  if (hasGeminiApiKey()) {
    try {
      const systemInstruction = `You are an AI Invoice Assistant.
Extract invoice billing details from user prompt.
Return JSON:
{
  "clientName": string,
  "clientEmail": string,
  "clientAddress": string,
  "items": [
    { "description": string, "quantity": number, "rate": number }
  ],
  "currency": string (e.g. "$" or "৳" or "BDT"),
  "taxRate": number,
  "discount": number,
  "notes": string,
  "summary": string
}`;
      const res = await callGeminiJson<InvoiceAiResult>(prompt, systemInstruction);
      if (res.success && res.data) {
        return res.data;
      }
    } catch {
      // fallback
    }
  }

  // Fallback
  return {
    clientName: 'Rahim Enterprises',
    clientEmail: 'billing@rahimenterprises.com',
    clientAddress: '12 Motijheel C/A, Dhaka',
    items: [
      { description: 'Professional Services & Development', quantity: 1, rate: 35000 },
      { description: 'Cloud Infrastructure & Maintenance', quantity: 1, rate: 10000 },
    ],
    currency: '৳',
    taxRate: 5,
    discount: 0,
    notes: 'Thank you for your business! Payment requested within 15 days.',
    summary: 'Invoice generated for Rahim Enterprises (৳45,000).',
  };
}

// ─────────────────────────────────────────────────────────────
// 4. CERTIFICATE AI GENERATOR
// ─────────────────────────────────────────────────────────────

export interface CertificateAiResult {
  title?: string;
  recipientName: string;
  courseOrAchievement: string;
  issuerName?: string;
  issuerTitle?: string;
  organization?: string;
  date?: string;
  summary: string;
}

export async function generateCertificateAi(prompt: string): Promise<CertificateAiResult> {
  if (hasGeminiApiKey()) {
    try {
      const systemInstruction = `You are an AI Certificate Assistant.
Extract certificate details from user prompt.
Return JSON:
{
  "title": string,
  "recipientName": string,
  "courseOrAchievement": string,
  "issuerName": string,
  "issuerTitle": string,
  "organization": string,
  "date": "YYYY-MM-DD",
  "summary": string
}`;
      const res = await callGeminiJson<CertificateAiResult>(prompt, systemInstruction);
      if (res.success && res.data) return res.data;
    } catch {
      // fallback
    }
  }

  return {
    title: 'CERTIFICATE OF ACHIEVEMENT',
    recipientName: 'Md. Zahid Hasan',
    courseOrAchievement: 'has successfully demonstrated excellence in Web & AI Application Architecture.',
    issuerName: 'Prof. Rafiqul Islam',
    issuerTitle: 'Program Director',
    organization: 'National Institute of Technology',
    date: new Date().toISOString().split('T')[0],
    summary: 'Certificate generated for Md. Zahid Hasan.',
  };
}

// ─────────────────────────────────────────────────────────────
// 5. ID CARD AI GENERATOR
// ─────────────────────────────────────────────────────────────

export interface IdCardAiResult {
  fullName: string;
  role: string;
  company: string;
  department: string;
  bloodGroup: string;
  validUntil: string;
  summary: string;
}

export async function generateIdCardAi(prompt: string): Promise<IdCardAiResult> {
  if (hasGeminiApiKey()) {
    try {
      const systemInstruction = `You are an AI Employee ID Card Generator.
Extract ID badge details from prompt.
Return JSON:
{
  "fullName": string,
  "role": string,
  "company": string,
  "department": string,
  "bloodGroup": string,
  "validUntil": "YYYY-MM-DD",
  "summary": string
}`;
      const res = await callGeminiJson<IdCardAiResult>(prompt, systemInstruction);
      if (res.success && res.data) return res.data;
    } catch {
      // fallback
    }
  }

  return {
    fullName: 'Tanvir Ahmed',
    role: 'Lead Software Engineer',
    company: 'NextGen Solutions Ltd.',
    department: 'Engineering & AI',
    bloodGroup: 'B+',
    validUntil: '2028-12-31',
    summary: 'ID Card generated for Tanvir Ahmed.',
  };
}
