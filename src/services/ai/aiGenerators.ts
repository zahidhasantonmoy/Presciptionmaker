import { callSmartAiJson } from './aiOrchestrator';
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
  if (
    lower.includes('agamikal') ||
    lower.includes('আগামীকাল') ||
    lower.includes('tomorrow') ||
    lower.includes('kalk') ||
    lower.includes('kalke') ||
    lower.includes('kal') ||
    lower.includes('কাল') ||
    lower.includes('কালকে')
  ) {
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
  // Try online Multi-Provider AI (Gemini -> Groq fallback)
  if (isOnline()) {
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
}
RULES:
1. Multi-passenger: If multiple passenger names are provided (e.g. "জাহিদ, তনময় ও রাফি" or "3 persons: Zahid, Tanvir, Rafiq"), join their names with commas in "passengerName" (e.g. "MD. ZAHID HASAN, TANVIR AHMED, RAFIQUL ISLAM"), set "numSeats" and "numAdults" equal to the passenger count.
2. Consecutive Seats: For N passengers, generate N consecutive seats in the same coach (e.g. for 2 seats: "TA 34, 35", for 3 seats: "CHA 12, 13, 14").
3. Accurate Fare: Calculate "fare" = unitClassFare * numSeats, "serviceCharge" = 20 * numSeats.`;

      const userText = `Current Prompt: "${prompt}"\nBase Ticket Reference:\n${JSON.stringify({
        fromStation: baseTicket.fromStation,
        toStation: baseTicket.toStation,
        trainName: baseTicket.trainName,
        className: baseTicket.className,
      })}`;

      const res = await callSmartAiJson<Partial<BangladeshRailwayTicket>>(userText, systemInstruction);

      if (res.success && res.data) {
        const { pnr, ticketId } = generateTicketIds();
        const d = res.data;

        const fromStClean = d.fromStation || 'Dhaka';
        const toStClean = d.toStation || 'Rajshahi';

        // Find train with directional match first
        const matchedTrain = RAILWAY_TRAINS.find(
          t => (d.trainName && t.name.toLowerCase().includes(d.trainName.toLowerCase())) &&
               t.fromStation.toLowerCase() === fromStClean.toLowerCase() &&
               t.toStation.toLowerCase() === toStClean.toLowerCase()
        ) || RAILWAY_TRAINS.find(
          t => (d.trainName && t.name.toLowerCase().includes(d.trainName.toLowerCase())) &&
               t.fromStation.toLowerCase() === fromStClean.toLowerCase()
        ) || RAILWAY_TRAINS.find(
          t => (d.trainName && t.name.toLowerCase() === d.trainName.toLowerCase()) ||
               (d.trainNumber && t.number === d.trainNumber)
        );

        const fromBn = d.fromStationBn || getStationBanglaName(fromStClean);
        const toBn = d.toStationBn || getStationBanglaName(toStClean);
        const coachSeat = d.coachSeat || baseTicket.coachSeat;
        const coachSeatBn = getPureBanglaCoachSeat(coachSeat, d.coachSeatBn);

        const numSeats = Number(d.numSeats) || 1;
        const unitFare = matchedTrain?.fares[d.className || 'S_CHAIR'] || Number(d.fare) || 450;
        const totalFare = unitFare * numSeats;
        const serviceCharge = 20 * numSeats;

        const merged: BangladeshRailwayTicket = {
          ...baseTicket,
          ...d,
          id: ticketId,
          pnrNumber: pnr,
          fromStation: fromStClean,
          fromStationBn: fromBn,
          toStation: toStClean,
          toStationBn: toBn,
          coachSeat,
          coachSeatBn,
          trainNumber: matchedTrain ? matchedTrain.number : (d.trainNumber || '759'),
          trainName: matchedTrain ? matchedTrain.name : (d.trainName || 'PADMA EXPRESS'),
          trainNameBn: matchedTrain ? matchedTrain.nameBn : (d.trainNameBn || 'পদ্মা এক্সপ্রেস'),
          journeyTime: matchedTrain ? matchedTrain.departureTime : (d.journeyTime || '23:00'),
          fare: totalFare,
          vat: Number(d.vat) || 0,
          serviceCharge,
          numSeats,
          numAdults: numSeats,
          createdAt: new Date().toISOString(),
        };

        const aiTag = res.provider === 'groq' ? '⚡ Groq LPU AI' : '🌐 Gemini AI';

        return {
          ticket: merged,
          summary: `${aiTag}: ${merged.trainName} (${merged.trainNumber}), ${merged.fromStation} ➔ ${merged.toStation}, তারিখ: ${merged.journeyDate}, সিট: ${merged.coachSeat}`,
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

  // ─────────────────────────────────────────────────────────────
  // 1. Station Routing & Direction Detection
  // ─────────────────────────────────────────────────────────────
  let detectedFrom = '';
  let detectedTo = '';

  // Find all stations mentioned in prompt and their positions
  const matchedStations: { name: string; index: number }[] = [];
  for (const st of RAILWAY_STATIONS) {
    const sName = st.name.toLowerCase();
    const sBn = st.nameBn;

    let pos = -1;
    // Word boundary match for English station name
    const enRegex = new RegExp(`\\b${sName}\\b`, 'i');
    const matchEn = pLower.match(enRegex);
    if (matchEn && matchEn.index !== undefined) {
      pos = matchEn.index;
    } else {
      const idxBn = prompt.indexOf(sBn);
      if (idxBn !== -1) pos = idxBn;
    }

    if (pos !== -1) {
      if (!matchedStations.some(m => m.name.toLowerCase() === st.name.toLowerCase())) {
        matchedStations.push({ name: st.name, index: pos });
      }
    }
  }

  // Sort by appearance in prompt
  matchedStations.sort((a, b) => a.index - b.index);

  // Check specific "from" and "to" syntax (e.g. "dhaka theke", "theke rajshahi", "ঢাকা থেকে")
  for (const st of matchedStations) {
    const sLower = st.name.toLowerCase();
    const isFrom =
      new RegExp(`\\b${sLower}\\s*(?:theke|hote|থেকে|হতে)\\b`, 'i').test(pLower) ||
      new RegExp(`(?:from|theke|থেকে|হতে)\\s+${sLower}\\b`, 'i').test(pLower);

    const isTo =
      new RegExp(`(?:theke|থেকে|hote|হতে|to)\\s+.*?\\b${sLower}\\b`, 'i').test(pLower) ||
      new RegExp(`\\bto\\s+${sLower}\\b`, 'i').test(pLower) ||
      new RegExp(`\\b${sLower}\\s*(?:te|jabo|যাব|তে|পৌঁছাবে)\\b`, 'i').test(pLower);

    if (isFrom) {
      detectedFrom = st.name;
    } else if (isTo && (!detectedFrom || detectedFrom.toLowerCase() !== sLower)) {
      detectedTo = st.name;
    }
  }

  // If two stations appeared in sequence like "dhaka theke rajshahi"
  if (matchedStations.length >= 2) {
    if (!detectedFrom) detectedFrom = matchedStations[0].name;
    if (!detectedTo) {
      // Find the second station that isn't the origin
      const secondSt = matchedStations.find(s => s.name.toLowerCase() !== detectedFrom.toLowerCase());
      if (secondSt) detectedTo = secondSt.name;
    }
  } else if (matchedStations.length === 1 && !detectedFrom) {
    detectedFrom = matchedStations[0].name;
  }

  // ─────────────────────────────────────────────────────────────
  // 2. Train Detection (Matching Name + Directional Priority)
  // ─────────────────────────────────────────────────────────────
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
    'jamuna': 'JAMUNA EXPRESS',
    'যমুনা': 'JAMUNA EXPRESS',
    'kalni': 'KALNI EXPRESS',
    'কালনী': 'KALNI EXPRESS',
    'jayantika': 'JAYANTIKA EXPRESS',
    'জয়ন্তিকা': 'JAYANTIKA EXPRESS',
  };

  let targetTrainName = '';
  for (const [key, tName] of Object.entries(trainAliases)) {
    if (pLower.includes(key)) {
      targetTrainName = tName;
      break;
    }
  }

  if (!targetTrainName) {
    for (const t of RAILWAY_TRAINS) {
      if (pLower.includes(t.name.toLowerCase()) || prompt.includes(t.nameBn) || prompt.includes(t.number)) {
        targetTrainName = t.name;
        break;
      }
    }
  }

  let matchedTrain: any = null;
  if (targetTrainName) {
    // 1st priority: matching name AND origin AND destination
    if (detectedFrom && detectedTo) {
      matchedTrain = RAILWAY_TRAINS.find(
        t => t.name.toUpperCase().includes(targetTrainName) &&
             t.fromStation.toLowerCase() === detectedFrom.toLowerCase() &&
             t.toStation.toLowerCase() === detectedTo.toLowerCase()
      );
    }
    // 2nd priority: matching name AND origin
    if (!matchedTrain && detectedFrom) {
      matchedTrain = RAILWAY_TRAINS.find(
        t => t.name.toUpperCase().includes(targetTrainName) &&
             t.fromStation.toLowerCase() === detectedFrom.toLowerCase()
      );
    }
    // 3rd priority: matching name AND destination
    if (!matchedTrain && detectedTo) {
      matchedTrain = RAILWAY_TRAINS.find(
        t => t.name.toUpperCase().includes(targetTrainName) &&
             t.toStation.toLowerCase() === detectedTo.toLowerCase()
      );
    }
    // 4th priority: any train with that name
    if (!matchedTrain) {
      matchedTrain = RAILWAY_TRAINS.find(t => t.name.toUpperCase().includes(targetTrainName));
    }
  }

  // Fallback train
  if (!matchedTrain) {
    matchedTrain = RAILWAY_TRAINS.find(
      t => (!detectedFrom || t.fromStation.toLowerCase() === detectedFrom.toLowerCase()) &&
           (!detectedTo || t.toStation.toLowerCase() === detectedTo.toLowerCase())
    ) || RAILWAY_TRAINS[0];
  }

  const fromStation = detectedFrom || matchedTrain.fromStation;
  let toStation = detectedTo;
  if (!toStation || toStation.toLowerCase() === fromStation.toLowerCase()) {
    toStation = matchedTrain.toStation.toLowerCase() === fromStation.toLowerCase()
      ? matchedTrain.fromStation
      : matchedTrain.toStation;
  }

  // Final check: ensure directional train matches the resolved fromStation
  const directionalTrain = RAILWAY_TRAINS.find(
    t => t.name.toLowerCase() === matchedTrain.name.toLowerCase() &&
         t.fromStation.toLowerCase() === fromStation.toLowerCase() &&
         t.toStation.toLowerCase() === toStation.toLowerCase()
  ) || RAILWAY_TRAINS.find(
    t => t.name.toLowerCase() === matchedTrain.name.toLowerCase() &&
         t.fromStation.toLowerCase() === fromStation.toLowerCase()
  );
  if (directionalTrain) {
    matchedTrain = directionalTrain;
  }

  // ─────────────────────────────────────────────────────────────
  // 3. Passenger Names & Multi-Passenger Detection
  // ─────────────────────────────────────────────────────────────
  // Check for quoted names like "MD ZAHID HASAN" and "MD IMARGENCY MAN"
  const quotedNames = Array.from(prompt.matchAll(/"([^"]+)"/g))
    .map(m => m[1].trim())
    .filter(n => n.length > 1);

  // ─────────────────────────────────────────────────────────────
  // 4. Passenger Count & Ticket Quantities
  // ─────────────────────────────────────────────────────────────
  let numSeats = 1;
  const seatMatch = prompt.match(/(\d+)\s*(?:ta|টা|tikit|ticket|টিকিট|jon|জন|person|passenger|সিট|seat|টি)/i);
  if (seatMatch && seatMatch[1]) {
    numSeats = Math.min(4, Math.max(1, parseInt(seatMatch[1], 10)));
  } else if (
    pLower.match(/\b(?:2|dui|two)\s*(?:ta|tikit|ticket|jon|person|টি|টা)\b/) ||
    prompt.includes('২টি') || prompt.includes('২টা') || prompt.includes('২ জন') ||
    pLower.includes('2 ta') || pLower.includes('dui ta') || pLower.includes('duita')
  ) {
    numSeats = 2;
  } else if (
    pLower.match(/\b(?:3|tin|three)\s*(?:ta|tikit|ticket|jon|person|টি|টা)\b/) ||
    prompt.includes('৩টি') || prompt.includes('৩টা') || prompt.includes('৩ জন') ||
    pLower.includes('3 ta') || pLower.includes('tin ta') || pLower.includes('tinta')
  ) {
    numSeats = 3;
  } else if (
    pLower.match(/\b(?:4|char|four)\s*(?:ta|tikit|ticket|jon|person|টি|টা)\b/) ||
    prompt.includes('৪টি') || prompt.includes('৪টা') || prompt.includes('৪ জন') ||
    pLower.includes('4 ta') || pLower.includes('char ta')
  ) {
    numSeats = 4;
  }

  // If user provided multiple quoted names, seat count must match names count!
  if (quotedNames.length > numSeats) {
    numSeats = Math.min(4, quotedNames.length);
  }

  let passengerName = baseTicket.passengerName;
  if (quotedNames.length > 0) {
    passengerName = quotedNames.map(n => n.toUpperCase()).join(', ');
  } else {
    // Unquoted name matching
    const multiNameMatch = prompt.match(/(?:নাম|name|passenger|যাত্রী)\s*[:=]?\s*([A-Za-z\u0980-\u09FF,.\s&]+?)(?:-|\s+শোভন|\s+স্নিগ্ধা|\s+এসি|\s+টিকিট|\s+ticket|$)/i);
    if (multiNameMatch && multiNameMatch[1] && multiNameMatch[1].trim().length > 2) {
      const rawNames = multiNameMatch[1].split(/[,&এবং\s+and\s+ও\s+]+/)
        .map(n => n.trim())
        .filter(n => n.length > 2 && !['টাকা', 'জন', 'সিট', 'kato', 'tikit', 'ticket'].includes(n.toLowerCase()));
      if (rawNames.length > 1) {
        passengerName = rawNames.map(n => n.toUpperCase()).join(', ');
        if (rawNames.length > numSeats) {
          numSeats = Math.min(4, rawNames.length);
        }
      } else if (rawNames.length === 1) {
        passengerName = rawNames[0].toUpperCase();
      }
    } else {
      const nameMatch = prompt.match(/(?:name|naam|নাম|passenger)\s*[:=]\s*([A-Za-z.\s]+)/i) ||
                        prompt.match(/([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)\s*(?:এর|er)\s*(?:name|নামে)?/);
      if (nameMatch && nameMatch[1]) {
        passengerName = nameMatch[1].trim().toUpperCase();
      }
    }
  }

  // ─────────────────────────────────────────────────────────────
  // 5. Class Detection
  // ─────────────────────────────────────────────────────────────
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

  // ─────────────────────────────────────────────────────────────
  // 6. Coach & Consecutive Seat Generation
  // ─────────────────────────────────────────────────────────────
  const coachLetters = ['KHA', 'GA', 'GHA', 'CHA', 'JA', 'JHA', 'TA', 'THA', 'DA'];
  const coachLetter = coachLetters[Math.floor(Math.random() * coachLetters.length)];
  const startSeat = Math.floor(Math.random() * 35) + 1;
  const seatList: string[] = [];
  for (let i = 0; i < numSeats; i++) {
    seatList.push(`${coachLetter}-${startSeat + i}`);
  }
  const coachSeat = seatList.join(', ');
  const coachSeatBn = getPureBanglaCoachSeat(coachSeat);

  // ─────────────────────────────────────────────────────────────
  // 7. Accurate Fare Calculations
  // ─────────────────────────────────────────────────────────────
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
    summary: `⚡ এআই প্রসেস সম্পন্ন: ${generatedTicket.trainName} (${generatedTicket.trainNumber}), ${generatedTicket.fromStation} ➔ ${generatedTicket.toStation}, তারিখ: ${generatedTicket.journeyDate}, সিট: ${generatedTicket.coachSeat} (মোট ${numSeats}টি টিকিট, ভাড়া: ৳${totalFare})`,
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
  if (isOnline()) {
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

      const res = await callSmartAiJson<PrescriptionAiResult>(prompt, systemInstruction);
      if (res.success && res.data) {
        const aiTag = res.provider === 'groq' ? '⚡ Groq LPU AI' : '🌐 Gemini AI';
        return {
          ...res.data,
          summary: `${aiTag}: ${res.data.summary || 'প্রেসক্রিপশন সফলভাবে জেনারেট হয়েছে'}`,
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
  if (isOnline()) {
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
      const res = await callSmartAiJson<InvoiceAiResult>(prompt, systemInstruction);
      if (res.success && res.data) {
        const aiTag = res.provider === 'groq' ? '⚡ Groq LPU AI' : '🌐 Gemini AI';
        return {
          ...res.data,
          summary: `${aiTag}: ${res.data.summary || 'ইনভয়েস সফলভাবে জেনারেট হয়েছে'}`,
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
  if (isOnline()) {
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
      const res = await callSmartAiJson<CertificateAiResult>(prompt, systemInstruction);
      if (res.success && res.data) {
        const aiTag = res.provider === 'groq' ? '⚡ Groq LPU AI' : '🌐 Gemini AI';
        return {
          ...res.data,
          summary: `${aiTag}: ${res.data.summary || 'প্রশংসাপত্র সফলভাবে তৈরি হয়েছে'}`,
        };
      }
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
  if (isOnline()) {
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
      const res = await callSmartAiJson<IdCardAiResult>(prompt, systemInstruction);
      if (res.success && res.data) {
        const aiTag = res.provider === 'groq' ? '⚡ Groq LPU AI' : '🌐 Gemini AI';
        return {
          ...res.data,
          summary: `${aiTag}: ${res.data.summary || 'আইডি কার্ড সফলভাবে তৈরি হয়েছে'}`,
        };
      }
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
