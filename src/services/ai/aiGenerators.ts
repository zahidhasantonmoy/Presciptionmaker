import { callGeminiJson, hasGeminiApiKey } from './geminiClient';
import { BangladeshRailwayTicket } from '../ticket/TicketMaker';
import {
  RAILWAY_TRAINS,
  RAILWAY_STATIONS,
  RAILWAY_CLASSES,
  toBanglaDigits,
  getStationBanglaName,
  formatCoachSeat,
  getPureBanglaCoachSeat,
} from '../ticket/railwayData';
import { Prescription, PrescriptionMedicine, Diagnosis } from '../../types';
import { ServiceId } from '../../utils/navigation';
import { v4 as uuidv4 } from 'uuid';

// Detects which service a user prompt is intended for (Ticket, Prescription, Invoice, Certificate, ID Card)
export function detectServiceFromPrompt(prompt: string): ServiceId {
  const pLower = prompt.toLowerCase();

  // 1. Ticket signals
  const ticketKeywords = [
    'টিকিট', 'ticket', 'train', 'ট্রেন', 'রেল', 'railway', 'express',
    'পদ্মা', 'সুবর্ণ', 'সোনার বাংলা', 'চিত্রা', 'কক্সবাজার', 'পারাবত', 'উপবন',
    'বনলতা', 'ধূমকেতু', 'সিল্কসিটি', 'একতা', 'দ্রুতযান', 'রংপুর', 'কুড়িগ্রাম',
    'বেনাপোল', 'স্টেশন', 'সিট', 'বগি', 'কোচ', 'শোভন', 'স্নিগ্ধা', 'বার্থ',
    'জংশন', 'যাত্রী', 'station', 'shovon', 'snigdha', 'berth', 'seat', 'coach'
  ];
  if (ticketKeywords.some(k => pLower.includes(k) || prompt.includes(k))) {
    return 'ticket';
  }

  // 2. Prescription signals
  const rxKeywords = [
    'রোগী', 'প্রেসক্রিপশন', 'prescription', 'doctor', 'patient', 'dr.',
    'ডাক্তার', 'rx', 'জ্বর', 'কাশি', 'সর্দি', 'ওষুধ', 'মেডিসিন', 'medicine',
    'ট্যাবলেট', 'tab', 'cap', 'capsule', 'syrup', 'ব্যথা', 'ডায়াবেটিস',
    'প্রেসার', 'গ্যাস্ট্রিক', 'ইনভেস্টিগেশন', 'টেস্ট', 'fever', 'cough', 'cold'
  ];
  if (rxKeywords.some(k => pLower.includes(k) || prompt.includes(k))) {
    return 'prescription';
  }

  // 3. Invoice signals
  const invoiceKeywords = [
    'ইনভয়েস', 'invoice', 'টাকা', 'বিল', 'bill', 'billing', 'ক্লায়েন্ট',
    'client', 'payment', 'বকেয়া', 'পরিশোধ', 'subtotal', 'discount',
    'ভ্যাট', 'tax', 'rate', 'ফি', 'bdt'
  ];
  if (invoiceKeywords.some(k => pLower.includes(k) || prompt.includes(k))) {
    return 'invoice';
  }

  // 4. Certificate signals
  const certKeywords = [
    'সার্টিফিকেট', 'certificate', 'অ্যাওয়ার্ড', 'award', 'প্রশংসাপত্র',
    'সনদপত্র', 'diploma', 'completion', 'achievement', 'কোর্স শেষ', 'সম্মাননা'
  ];
  if (certKeywords.some(k => pLower.includes(k) || prompt.includes(k))) {
    return 'certificate';
  }

  // 5. ID Card signals
  const idKeywords = [
    'আইডি কার্ড', 'id card', 'idcard', 'কার্ড', 'পরিচয়পত্র', 'badge',
    'employee', 'কর্মকর্তা', 'ব্লাড গ্রুপ', 'blood group', 'designation', 'পদবি'
  ];
  if (idKeywords.some(k => pLower.includes(k) || prompt.includes(k))) {
    return 'idcard';
  }

  return 'ticket';
}

// Helper to calculate relative date like tomorrow, day after tomorrow, days of week, or specific dates
export function resolveRelativeDate(text: string): { dateStr: string; banglaDateStr: string } {
  const lower = text.toLowerCase();
  const now = new Date();
  let target = new Date();

  // 1. Relative keywords
  if (lower.includes('agamikal') || lower.includes('আগামীকাল') || lower.includes('tomorrow') || lower.includes('kal')) {
    target.setDate(now.getDate() + 1);
  } else if (lower.includes('porshu') || lower.includes('পরশু') || lower.includes('day after tomorrow')) {
    target.setDate(now.getDate() + 2);
  } else if (lower.includes('tarporer din') || lower.includes('৩ দিন পর') || lower.includes('3 days')) {
    target.setDate(now.getDate() + 3);
  } else {
    // 2. Weekday matching
    const daysMap: Record<string, number> = {
      'রবিবার': 0, 'sunday': 0,
      'সোমবার': 1, 'monday': 1,
      'মঙ্গলবার': 2, 'tuesday': 2,
      'বুধবার': 3, 'wednesday': 3,
      'বৃহস্পতিবার': 4, 'thursday': 4,
      'শুক্রবার': 5, 'friday': 5,
      'শনিবার': 6, 'saturday': 6,
    };

    for (const [dayName, dayIndex] of Object.entries(daysMap)) {
      if (lower.includes(dayName)) {
        const currentDay = now.getDay();
        let diff = dayIndex - currentDay;
        if (diff <= 0) diff += 7; // Next occurrence
        target.setDate(now.getDate() + diff);
        break;
      }
    }
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

// Check if currently online
export function isOnline(): boolean {
  return typeof navigator !== 'undefined' ? navigator.onLine : true;
}

// ─────────────────────────────────────────────────────────────
// 1. RAILWAY TICKET AI GENERATOR (ONLINE & OFFLINE)
// ─────────────────────────────────────────────────────────────

export async function generateTicketAi(
  prompt: string,
  baseTicket: BangladeshRailwayTicket
): Promise<{ ticket: BangladeshRailwayTicket; summary: string }> {
  // Try online Gemini API if internet and key are available
  if (isOnline() && hasGeminiApiKey()) {
    try {
      const systemInstruction = `You are an expert Bangladesh Railway ticketing assistant.
Current date is: ${new Date().toISOString().split('T')[0]}.
Given the user prompt (English, Bangla, or Banglish), extract and return valid JSON matching BangladeshRailwayTicket:
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

        const matchedTrain = RAILWAY_TRAINS.find(
          t => t.name.toLowerCase() === (d.trainName || '').toLowerCase() ||
               (d.trainNumber && t.number === d.trainNumber)
        );

        const fromBn = d.fromStationBn || getStationBanglaName(d.fromStation || 'Dhaka');
        const toBn = d.toStationBn || getStationBanglaName(d.toStation || 'Rajshahi');
        const coachSeat = d.coachSeat || baseTicket.coachSeat;
        const coachSeatBn = getPureBanglaCoachSeat(coachSeat, d.coachSeatBn);

        const merged: BangladeshRailwayTicket = {
          ...baseTicket,
          ...d,
          id: ticketId,
          pnrNumber: pnr,
          fromStationBn: fromBn,
          toStationBn: toBn,
          coachSeat,
          coachSeatBn,
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
          summary: `🌐 Gemini AI: ${merged.trainName} (${merged.trainNumber}), ${merged.fromStation} ➔ ${merged.toStation}, তারিখ: ${merged.journeyDate}, সিট: ${merged.coachSeat}`,
        };
      }
    } catch {
      // fallback to offline NLP
    }
  }

  // ⚡ 100% Client-Side Offline NLP Engine
  return parseRailwayTicketLocally(prompt, baseTicket);
}

function parseRailwayTicketLocally(
  prompt: string,
  baseTicket: BangladeshRailwayTicket
): { ticket: BangladeshRailwayTicket; summary: string } {
  const pLower = prompt.toLowerCase();
  const { dateStr } = resolveRelativeDate(prompt);

  // 1. Train detection across all 100+ Bangladesh Railway trains
  let matchedTrain: any = null;

  // Direct name or number match
  for (const t of RAILWAY_TRAINS) {
    if (
      pLower.includes(t.name.toLowerCase()) ||
      prompt.includes(t.nameBn) ||
      pLower.includes(t.name.toLowerCase().replace(' express', '')) ||
      prompt.includes(t.number)
    ) {
      matchedTrain = t;
      break;
    }
  }

  // Aliases and popular train keywords
  if (!matchedTrain) {
    const trainAliases: Record<string, string> = {
      'padma': 'PADMA EXPRESS',
      'পদ্মা': 'PADMA EXPRESS',
      'sonar bangla': 'SONAR BANGLA EXPRESS',
      'সোনার বাংলা': 'SONAR BANGLA EXPRESS',
      'suborno': 'SUBORNO EXPRESS',
      'suborna': 'SUBORNO EXPRESS',
      'সুবর্ণ': 'SUBORNO EXPRESS',
      'cox': 'COX\'S BAZAR EXPRESS',
      'কক্সবাজার': 'COX\'S BAZAR EXPRESS',
      'chitra': 'CHITRA EXPRESS',
      'চিত্রা': 'CHITRA EXPRESS',
      'parabat': 'PARABAT EXPRESS',
      'পারাবত': 'PARABAT EXPRESS',
      'upaban': 'UPABAN EXPRESS',
      'উপবন': 'UPABAN EXPRESS',
      'bana': 'BANALATA EXPRESS',
      'বনলতা': 'BANALATA EXPRESS',
      'silk': 'SILKCITY EXPRESS',
      'সিল্কসিটি': 'SILKCITY EXPRESS',
      'dhumketu': 'DHUMKETU EXPRESS',
      'ধূমকেতু': 'DHUMKETU EXPRESS',
      'ekota': 'EKOTA EXPRESS',
      'একতা': 'EKOTA EXPRESS',
      'druto': 'DRUTOJAN EXPRESS',
      'দ্রুতযান': 'DRUTOJAN EXPRESS',
      'kurigram': 'KURIGRAM EXPRESS',
      'কুড়িগ্রাম': 'KURIGRAM EXPRESS',
      'rangpur': 'RANGPUR EXPRESS',
      'রংপুর': 'RANGPUR EXPRESS',
      'benapole': 'BENAPOLE EXPRESS',
      'বেনাপোল': 'BENAPOLE EXPRESS',
      'sundarban': 'SUNDARBAN EXPRESS',
      'সুন্দরবন': 'SUNDARBAN EXPRESS',
    };

    for (const [key, tName] of Object.entries(trainAliases)) {
      if (pLower.includes(key)) {
        matchedTrain = RAILWAY_TRAINS.find(t => t.name.toUpperCase().includes(tName));
        if (matchedTrain) break;
      }
    }
  }

  if (!matchedTrain) {
    matchedTrain = RAILWAY_TRAINS[0]; // fallback
  }

  // 2. Station routing
  let fromStation = matchedTrain.fromStation;
  let toStation = matchedTrain.toStation;

  for (const st of RAILWAY_STATIONS) {
    const stEn = st.name.toLowerCase();
    const stBn = st.nameBn;

    if (pLower.includes(stEn) || prompt.includes(stBn)) {
      if (
        pLower.includes(`theke ${stEn}`) ||
        pLower.includes(`from ${stEn}`) ||
        prompt.includes(`${stBn} থেকে`) ||
        prompt.includes(`${stBn} হতে`)
      ) {
        fromStation = st.name;
      } else if (
        pLower.includes(`to ${stEn}`) ||
        pLower.includes(`${stEn} te`) ||
        pLower.includes(`${stEn} jabo`) ||
        prompt.includes(`${stBn} তে`) ||
        prompt.includes(`${stBn} যাব`) ||
        prompt.includes(`পৌঁছাবে ${stBn}`)
      ) {
        toStation = st.name;
      }
    }
  }

  // 3. Passenger count
  let numSeats = 1;
  const seatMatch = prompt.match(/(\d+)\s*(jon|person|passenger|সিট|জন|টি)/i);
  if (seatMatch && seatMatch[1]) {
    numSeats = Math.min(4, Math.max(1, parseInt(seatMatch[1], 10)));
  } else if (pLower.includes('2 jon') || pLower.includes('dui jon') || prompt.includes('২ জন') || pLower.includes('2 person')) {
    numSeats = 2;
  } else if (pLower.includes('3 jon') || pLower.includes('tin jon') || prompt.includes('৩ জন')) {
    numSeats = 3;
  } else if (pLower.includes('4 jon') || pLower.includes('char jon') || prompt.includes('৪ জন')) {
    numSeats = 4;
  }

  // 4. Passenger Name
  let passengerName = baseTicket.passengerName;
  const nameMatch = prompt.match(/(?:name|naam|নাম|passenger)\s*[:=]\s*([A-Za-z.\s]+)/i) ||
                    prompt.match(/([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)\s*(?:এর|er)\s*(?:name|নামে)?/);
  if (nameMatch && nameMatch[1]) {
    passengerName = nameMatch[1].trim().toUpperCase();
  }

  // 5. Class detection
  let selectedClass = RAILWAY_CLASSES[0]; // S_CHAIR default
  if (pLower.includes('snigdha') || prompt.includes('স্নিগ্ধা')) {
    selectedClass = RAILWAY_CLASSES.find(c => c.code === 'SNIGDHA') || selectedClass;
  } else if (pLower.includes('berth') || prompt.includes('বার্থ')) {
    selectedClass = RAILWAY_CLASSES.find(c => c.code === 'AC_B') || selectedClass;
  } else if (pLower.includes('ac') || prompt.includes('এসি')) {
    selectedClass = RAILWAY_CLASSES.find(c => c.code === 'AC_S' || c.code === 'SNIGDHA') || selectedClass;
  } else if (pLower.includes('shovon') || prompt.includes('শোভন')) {
    selectedClass = RAILWAY_CLASSES.find(c => c.code === 'SHOVON') || selectedClass;
  }

  // 6. Coach & Seat generation
  const coachLetters = ['KHA', 'GA', 'GHA', 'CHA', 'JA', 'JHA', 'TA', 'THA', 'DA'];
  const coachLetter = coachLetters[Math.floor(Math.random() * coachLetters.length)];
  const startSeat = Math.floor(Math.random() * 35) + 1;
  const seatList: string[] = [];
  for (let i = 0; i < numSeats; i++) {
    seatList.push(`${coachLetter}-${startSeat + i}`);
  }
  const coachSeat = seatList.join(', ');
  const coachSeatBn = getPureBanglaCoachSeat(coachSeat);

  // 7. Fare calculation
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
    passengerName,
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
    summary: `⚡ অফলাইন এআই: ${generatedTicket.trainName} (${generatedTicket.trainNumber}), ${generatedTicket.fromStation} ➔ ${generatedTicket.toStation}, তারিখ: ${generatedTicket.journeyDate}, সিট: ${generatedTicket.coachSeat} (১০০% অফলাইনে সফল)`,
  };
}

// ─────────────────────────────────────────────────────────────
// 2. PRESCRIPTION AI GENERATOR (ONLINE & OFFLINE)
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
  if (isOnline() && hasGeminiApiKey()) {
    try {
      const systemInstruction = `You are an AI Clinical Assistant for doctors in Bangladesh.
Extract clinical information from the prompt (English, Bangla, or Banglish).
Return JSON:
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
        return {
          ...res.data,
          summary: `🌐 Gemini AI: ${res.data.summary || 'প্রেসক্রিপশন সফলভাবে জেনারেট হয়েছে'}`,
        };
      }
    } catch {
      // fallback
    }
  }

  // ⚡ 100% Client-Side Offline Clinical NLP Engine
  const pLower = prompt.toLowerCase();
  const complaints: string[] = [];
  const medicines: any[] = [];
  const diagnosis: string[] = [];
  const investigations: string[] = [];
  const advice: string[] = ['পর্যাপ্ত পানি পান করুন ও বিশ্রাম নিন'];

  // Demographics parsing
  let patientName = 'Md. Rahim Uddin';
  const nameMatch = prompt.match(/(?:patient|রোগী|name|নাম)\s*[:=]\s*([A-Za-z\u0980-\u09FF.\s]+)/i);
  if (nameMatch && nameMatch[1]) {
    patientName = nameMatch[1].trim();
  }

  let age = '35 Y';
  const ageMatch = prompt.match(/(?:age|বয়স)\s*[:=]?\s*(\d+)/i) || prompt.match(/(\d+)\s*(?:years|বছর|yr)/i);
  if (ageMatch && ageMatch[1]) {
    age = `${ageMatch[1]} Y`;
  }

  let gender: 'male' | 'female' = 'male';
  if (pLower.includes('female') || prompt.includes('মহিলা') || prompt.includes('মেয়ে')) {
    gender = 'female';
  }

  // Symptoms & Medications matching
  if (pLower.includes('fever') || prompt.includes('জ্বর')) {
    complaints.push('Fever (জ্বর) for 3 days');
    diagnosis.push('Viral Pyrexia');
    medicines.push({
      name: 'Napa Extend 665mg',
      generic: 'Paracetamol',
      dosage: '1+1+1',
      timing: 'খাবারের পরে (After Meal)',
      duration: '5 Days',
      instructions: 'জ্বর ১০০° এর বেশি হলে সেবন করবেন',
    });
  }

  if (pLower.includes('cough') || prompt.includes('কাশি')) {
    complaints.push('Cough (কাশি)');
    medicines.push({
      name: 'Syp Tofen',
      generic: 'Ketotifen',
      dosage: '1 চামচ ২ বার',
      timing: 'খাবারের পরে (After Meal)',
      duration: '7 Days',
      instructions: 'খাওয়ার আগে ভালো করে ঝাঁকিয়ে নিন',
    });
  }

  if (pLower.includes('cold') || prompt.includes('সর্দি') || prompt.includes('হাঁচি')) {
    complaints.push('Common Cold & Sneezing (সর্দি)');
    medicines.push({
      name: 'Alatrol 10mg',
      generic: 'Cetirizine',
      dosage: '0+0+1',
      timing: 'রাতে খাবারের পরে (Night)',
      duration: '7 Days',
      instructions: 'রাতে ঘুমোনোর আগে সেব্য',
    });
  }

  if (pLower.includes('gas') || pLower.includes('acidity') || prompt.includes('গ্যাস') || prompt.includes('বুক জ্বালা')) {
    complaints.push('Hyperacidity & Dyspepsia (গ্যাসের সমস্যা)');
    diagnosis.push('GERD');
    medicines.push({
      name: 'Maxpro 20mg',
      generic: 'Esomeprazole',
      dosage: '1+0+1',
      timing: 'খাবারের ২০ মিনিট আগে (Before Meal)',
      duration: '14 Days',
      instructions: 'সকাল ও রাতে খালি পেটে খাবেন',
    });
  }

  if (pLower.includes('pain') || prompt.includes('ব্যথা') || prompt.includes('কোমর')) {
    complaints.push('Generalized / Back pain (শরীরে ব্যথা)');
    medicines.push({
      name: 'Napryn 500mg',
      generic: 'Naproxen',
      dosage: '1+0+1',
      timing: 'ভরা পেটে (After Meal)',
      duration: '5 Days',
      instructions: 'অবশ্যই ভারী খাবারের পর খাবেন',
    });
  }

  if (pLower.includes('diabetes') || prompt.includes('ডায়াবেটিস')) {
    complaints.push('Type 2 Diabetes Mellitus follow-up');
    diagnosis.push('T2DM');
    medicines.push({
      name: 'Metfo 500mg',
      generic: 'Metformin HCl',
      dosage: '1+0+1',
      timing: 'খাবারের মাঝে (With Meal)',
      duration: '30 Days',
      instructions: 'নিয়মিত সুগার চেক করবেন',
    });
    investigations.push('FBS & 2HABF', 'HbA1c');
    advice.push('মিষ্টি ও অতিরিক্ত কার্বোহাইড্রেট জাতীয় খাদ্য পরিহার করুন');
  }

  if (pLower.includes('pressure') || pLower.includes('bp') || prompt.includes('প্রেসার')) {
    complaints.push('Hypertension routine check');
    diagnosis.push('Essential Hypertension');
    medicines.push({
      name: 'Osartil 50mg',
      generic: 'Losartan Potassium',
      dosage: '1+0+0',
      timing: 'সকালে খাবারের পরে',
      duration: '30 Days',
      instructions: 'নিয়মিত প্রেসার মাপুন',
    });
    advice.push('কাঁচা লবণ বর্জন করুন এবং হালকা ব্যায়াম করুন');
  }

  // Fallback medicine if nothing matched
  if (medicines.length === 0) {
    complaints.push('General physical weakness and malaise');
    diagnosis.push('General Malaise');
    medicines.push({
      name: 'B-50 Forte',
      generic: 'Vitamin B Complex',
      dosage: '1+0+1',
      timing: 'খাবারের পরে (After Meal)',
      duration: '15 Days',
      instructions: 'নিয়মিত সেব্য',
    });
  }

  return {
    patientName,
    age,
    gender,
    complaints,
    diagnosis,
    medicines,
    investigations: investigations.length ? investigations : ['CBC', 'Serum Creatinine'],
    advice,
    summary: `⚡ অফলাইন এআই: রোগী ${patientName} (${age}), ${medicines.length}টি ওষুধ ও ক্লিনিকাল গাইডলাইন লোড হয়েছে (১০০% অফলাইনে সফল)`,
  };
}

// ─────────────────────────────────────────────────────────────
// 3. INVOICE AI GENERATOR (ONLINE & OFFLINE)
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
  if (isOnline() && hasGeminiApiKey()) {
    try {
      const systemInstruction = `You are an AI Invoice Assistant. Extract invoice billing details:
{
  "clientName": string,
  "clientEmail": string,
  "clientAddress": string,
  "items": [{ "description": string, "quantity": number, "rate": number }],
  "currency": string ("$" or "৳" or "BDT"),
  "taxRate": number,
  "discount": number,
  "notes": string,
  "summary": string
}`;
      const res = await callGeminiJson<InvoiceAiResult>(prompt, systemInstruction);
      if (res.success && res.data) {
        return {
          ...res.data,
          summary: `🌐 Gemini AI: ${res.data.summary || 'ইনভয়েস সফলভাবে জেনারেট হয়েছে'}`,
        };
      }
    } catch {
      // fallback
    }
  }

  // Offline Invoice Parser
  let clientName = 'Rahim Enterprises Ltd.';
  const clientMatch = prompt.match(/(?:client|ক্লায়েন্ট|customer|কোম্পানি)\s*[:=]?\s*([A-Za-z\u0980-\u09FF.\s]+?)(?:,|\s+টাকা|\s+bdt|\s+for|$)/i);
  if (clientMatch && clientMatch[1]) {
    clientName = clientMatch[1].trim();
  }

  let amount = 35000;
  const amountMatch = prompt.match(/(\d+[\d,]*)\s*(?:টাকা|taka|bdt|\$)/i);
  if (amountMatch && amountMatch[1]) {
    amount = parseFloat(amountMatch[1].replace(/,/g, ''));
  }

  return {
    clientName,
    clientEmail: 'billing@clientcorp.com',
    clientAddress: 'Motijheel Commercial Area, Dhaka',
    items: [
      { description: 'Professional Software Architecture & Implementation', quantity: 1, rate: amount },
      { description: 'Cloud Infrastructure & High Availability Support', quantity: 1, rate: Math.round(amount * 0.2) },
    ],
    currency: '৳',
    taxRate: 5,
    discount: 0,
    notes: 'Thank you for your business! Payment requested within 15 days via bank transfer.',
    summary: `⚡ অফলাইন এআই: ${clientName} এর জন্য ইনভয়েস (৳${amount.toLocaleString()}) প্রস্তুত (১০০% অফলাইনে সফল)`,
  };
}

// ─────────────────────────────────────────────────────────────
// 4. CERTIFICATE AI GENERATOR (ONLINE & OFFLINE)
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
  if (isOnline() && hasGeminiApiKey()) {
    try {
      const systemInstruction = `You are an AI Certificate Assistant. Extract certificate details:
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
      if (res.success && res.data) return {
        ...res.data,
        summary: `🌐 Gemini AI: ${res.data.summary}`,
      };
    } catch {
      // fallback
    }
  }

  let recipientName = 'Md. Zahid Hasan';
  const nameMatch = prompt.match(/([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/);
  if (nameMatch && nameMatch[1]) {
    recipientName = nameMatch[1].trim();
  }

  return {
    title: 'CERTIFICATE OF ACHIEVEMENT',
    recipientName,
    courseOrAchievement: 'has successfully demonstrated exemplary mastery in Full-Stack AI Application Architecture.',
    issuerName: 'Prof. Rafiqul Islam',
    issuerTitle: 'Academic Director',
    organization: 'National Institute of Technology',
    date: new Date().toISOString().split('T')[0],
    summary: `⚡ অফলাইন এআই: ${recipientName} এর প্রশংসাপত্র প্রস্তুত (১০০% অফলাইনে সফল)`,
  };
}

// ─────────────────────────────────────────────────────────────
// 5. ID CARD AI GENERATOR (ONLINE & OFFLINE)
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
  if (isOnline() && hasGeminiApiKey()) {
    try {
      const systemInstruction = `You are an AI Employee ID Card Generator. Extract details:
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
      if (res.success && res.data) return {
        ...res.data,
        summary: `🌐 Gemini AI: ${res.data.summary}`,
      };
    } catch {
      // fallback
    }
  }

  let fullName = 'Tanvir Ahmed';
  const nameMatch = prompt.match(/([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/);
  if (nameMatch && nameMatch[1]) {
    fullName = nameMatch[1].trim();
  }

  return {
    fullName,
    role: 'Lead AI Engineer',
    company: 'Apex Digital Solutions Ltd.',
    department: 'Artificial Intelligence & Systems',
    bloodGroup: 'B+',
    validUntil: '2028-12-31',
    summary: `⚡ অফলাইন এআই: ${fullName} এর আইডি কার্ড প্রস্তুত (১০০% অফলাইনে সফল)`,
  };
}
