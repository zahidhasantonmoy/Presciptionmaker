import { callSmartAiJson } from './aiOrchestrator';
import { BangladeshRailwayTicket } from '../ticket/TicketMaker';
import {
  RAILWAY_TRAINS,
  RAILWAY_STATIONS,
  RAILWAY_CLASSES,
  STATION_ALIASES,
  normalizeStationName,
  doesTrainServeRouteInDirection,
  estimateSegmentSchedule,
  isTrainOffDayOnDate,
  validateTrainRouteSelection,
  toBanglaDigits,
  getStationBanglaName,
  getPureBanglaCoachSeat,
  calculateTicketFareBreakdown,
  generateSmartCoachSeats,
  getOppositeDirectionTrain,
} from '../ticket/railwayData';
import { ServiceId } from '../../utils/navigation';

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

export interface TicketAiWarning {
  type: 'route_mismatch' | 'off_day' | 'station_not_found';
  message: string;
  messageBn: string;
}

// Checks if a train runs on the given journey date (YYYY-MM-DD in Asia/Dhaka)
export function checkTrainOffDay(train: { offDay: string; name: string }, journeyDate: string): TicketAiWarning | null {
  if (!train.offDay || train.offDay === 'None' || train.offDay === 'none') return null;
  if (!journeyDate) return null;

  const offStatus = isTrainOffDayOnDate(train.offDay, journeyDate);
  if (offStatus.isOffDay) {
    return {
      type: 'off_day',
      message: `⚠️ Off Day Alert: "${train.name}" does NOT run on ${train.offDay}s. The selected date (${journeyDate}) is a ${train.offDay}. Please choose a different date.`,
      messageBn: `⚠️ ছুটির দিন সতর্কতা: "${train.name}" ট্রেনটি ${offStatus.weekdayBn} চলে না! আপনার নির্বাচিত তারিখ (${journeyDate}) ${offStatus.weekdayBn}। দয়া করে অন্য তারিখ বেছে নিন।`,
    };
  }
  return null;
}

// Checks if a train serves the requested directional route
export function checkTrainRoute(
  trainName: string,
  fromStation: string,
  toStation: string,
  trainNumber = ''
): TicketAiWarning | null {
  const res = validateTrainRouteSelection(trainName, trainNumber, fromStation, toStation);
  if (res.valid) return null;
  return {
    type: 'route_mismatch',
    message: `⚠️ ${res.reasonEn || 'Route mismatch detected.'}`,
    messageBn: `⚠️ ${res.reasonBn || 'নির্বাচিত রুট ও ট্রেন মিলছে না।'}`,
  };
}

export function detectRoundTripIntent(prompt: string): { isRoundTrip: boolean; returnOffsetDays: number } {
  const pLower = prompt.toLowerCase();
  const roundTripPatterns = [
    /\bround[\s-]?trip\b/i,
    /\breturn\b/i,
    /\bboth\s+way/i,
    /\bup[\s-]?down\b/i,
    /যাওয়া[\s-]?আসা/,
    /যাওয়া[\s-]?আসা/,
    /আসা[\s-]?যাওয়া/,
    /আসা[\s-]?যাওয়া/,
    /যাওয়ার\s+(?:ও|এবং|আর)\s+আসার/,
    /যাওয়ার\s+(?:ও|এবং|আর)\s+আসার/,
    /রিটার্ন/,
    /ফেরার\s+টিকিট/,
    /ফিরতি\s+টিকিট/,
    /(?:২|দুই|2)\s*(?:টা|টি|দিকের)\s*টিকিট/,
  ];
  const isRoundTrip = roundTripPatterns.some(rx => rx.test(prompt) || rx.test(pLower));
  let returnOffsetDays = 1;
  const daysMatch = prompt.match(/(\d+|২|৩|৪|৫|৬|৭)\s*(?:দিন|days?)\s*(?:পর|পরে|later|after)/i);
  if (daysMatch) {
    const mapBn: Record<string, number> = { '২': 2, '৩': 3, '৪': 4, '৫': 5, '৬': 6, '৭': 7 };
    returnOffsetDays = mapBn[daysMatch[1]] || Math.max(1, parseInt(daysMatch[1], 10) || 1);
  }
  return { isRoundTrip, returnOffsetDays };
}

export function buildReturnTicketFromOutbound(
  outbound: BangladeshRailwayTicket,
  offsetDays = 1
): BangladeshRailwayTicket {
  const returnFrom = outbound.toStation;
  const returnFromBn = outbound.toStationBn || getStationBanglaName(returnFrom);
  const returnTo = outbound.fromStation;
  const returnToBn = outbound.fromStationBn || getStationBanglaName(returnTo);

  const returnTrain = getOppositeDirectionTrain(
    outbound.trainName,
    outbound.trainNumber,
    returnFrom,
    returnTo
  );

  // Compute return date (advance by offsetDays and skip off-day if needed)
  const baseDate = outbound.journeyDate
    ? new Date(`${outbound.journeyDate}T12:00:00+06:00`)
    : new Date();
  if (!isNaN(baseDate.getTime())) {
    baseDate.setUTCDate(baseDate.getUTCDate() + Math.max(1, offsetDays));
    if (returnTrain && isTrainOffDayOnDate(returnTrain.offDay, baseDate.toISOString().split('T')[0]).isOffDay) {
      baseDate.setUTCDate(baseDate.getUTCDate() + 1);
    }
  }
  const returnDateStr = !isNaN(baseDate.getTime())
    ? baseDate.toISOString().split('T')[0]
    : outbound.journeyDate;

  const returnTrainName = returnTrain ? returnTrain.name : outbound.trainName;
  const returnTrainNameBn = returnTrain ? returnTrain.nameBn : outbound.trainNameBn;
  const returnTrainNumber = returnTrain ? returnTrain.number : outbound.trainNumber;

  const seg = returnTrain
    ? estimateSegmentSchedule(returnTrain, returnFrom, returnTo, outbound.className)
    : null;
  const unitFare =
    seg?.segmentFare ||
    returnTrain?.fares[outbound.className] ||
    RAILWAY_CLASSES.find(c => c.code === outbound.className)?.defaultFare ||
    outbound.fare ||
    450;

  const breakdown = calculateTicketFareBreakdown(
    unitFare,
    outbound.className,
    outbound.numAdults,
    outbound.numSeniors,
    outbound.numChildren
  );
  const smartSeats = generateSmartCoachSeats(outbound.className, outbound.numSeats, outbound.coachSeat);
  const { pnr, ticketId } = generateTicketIds();

  return {
    ...outbound,
    id: ticketId,
    pnrNumber: pnr,
    fromStation: returnFrom,
    fromStationBn: returnFromBn,
    toStation: returnTo,
    toStationBn: returnToBn,
    trainName: returnTrainName,
    trainNameBn: returnTrainNameBn,
    trainNumber: returnTrainNumber,
    journeyDate: returnDateStr,
    journeyTime: seg?.boardingTime || returnTrain?.departureTime || outbound.journeyTime,
    coachSeat: smartSeats.coachSeat,
    coachSeatBn: smartSeats.coachSeatBn,
    fare: breakdown.fare,
    vat: breakdown.vat,
    serviceCharge: breakdown.serviceCharge,
    createdAt: new Date().toISOString(),
  };
}

export async function generateTicketAi(
  prompt: string,
  baseTicket: BangladeshRailwayTicket
): Promise<{
  ticket: BangladeshRailwayTicket;
  returnTicket?: BangladeshRailwayTicket;
  summary: string;
  warnings?: TicketAiWarning[];
}> {
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
1. Multi-passenger: If multiple passenger names are provided (e.g. "জাহিদ, তনময় ও রাফি" or "3 persons: Zahid, Tanvir, Rafiq" or "nam zahid, robiul, kamel"), join all names with commas in "passengerName" (e.g. "MD. ZAHID HASAN, ROBIUL ISLAM, KAMEL HOSSAIN"), set "numSeats" and "numAdults" equal to the passenger count.
2. Consecutive Seats: For N passengers, generate N consecutive seats in the same coach (e.g. for 2 seats: "TA 34, 35", for 3 seats: "CHA 12, 13, 14").
3. Accurate Fare: Calculate "fare" = unitClassFare * numSeats, "serviceCharge" = 20 * numSeats.
4. Strict Station Extraction: Extract the exact destination into "toStation" and exact origin into "fromStation" from the user prompt (e.g. "Ibrahimabad", "Rajshahi", "Dhaka"). NEVER replace or auto-correct the user's requested destination with the train's terminal station.`;

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

        // Cross-verify with local detection to preserve explicitly requested intermediate/origin/destination stations
        const localDetection = parseRailwayTicketLocallyDetailed(prompt, baseTicket);
        const aiFrom = d.fromStation ? normalizeStationName(d.fromStation) : '';
        const aiTo = d.toStation ? normalizeStationName(d.toStation) : '';
        const fromStClean = localDetection.hasExplicitFrom
          ? localDetection.ticket.fromStation
          : (aiFrom || localDetection.ticket.fromStation || 'Dhaka');
        const toStClean = localDetection.hasExplicitTo
          ? localDetection.ticket.toStation
          : (aiTo || localDetection.ticket.toStation || 'Rajshahi');

        // Find train with directional match first (handles intermediate corridor stops like Dhaka -> Ibrahimabad on Silkcity)
        const trainNameMatches = (t: { name: string }) =>
          Boolean(d.trainName && (
            t.name.toLowerCase().includes(d.trainName.toLowerCase()) ||
            d.trainName.toLowerCase().includes(t.name.toLowerCase())
          ));

        const matchedTrain = RAILWAY_TRAINS.find(
          t => trainNameMatches(t) &&
               t.fromStation.toLowerCase() === fromStClean.toLowerCase() &&
               t.toStation.toLowerCase() === toStClean.toLowerCase()
        ) || RAILWAY_TRAINS.find(
          t => trainNameMatches(t) &&
               doesTrainServeRouteInDirection(t, fromStClean, toStClean)
        ) || RAILWAY_TRAINS.find(
          t => trainNameMatches(t) &&
               t.fromStation.toLowerCase() === fromStClean.toLowerCase()
        ) || RAILWAY_TRAINS.find(
          t => trainNameMatches(t) ||
               (d.trainNumber && t.number === d.trainNumber)
        );

        const fromBn = d.fromStationBn || getStationBanglaName(fromStClean);
        const toBn = d.toStationBn || getStationBanglaName(toStClean);
        const coachSeat = d.coachSeat || baseTicket.coachSeat;
        const coachSeatBn = getPureBanglaCoachSeat(coachSeat, d.coachSeatBn);

        const numSeats = Number(d.numSeats) || 1;
        const chosenClass = d.className || 'S_CHAIR';
        const segEstimate = matchedTrain
          ? estimateSegmentSchedule(matchedTrain, fromStClean, toStClean, chosenClass)
          : null;
        const unitFare = segEstimate?.segmentFare || matchedTrain?.fares[chosenClass] || Number(d.fare) || 450;
        const breakdown = calculateTicketFareBreakdown(unitFare, chosenClass, numSeats, 0, 0);

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
          journeyTime: segEstimate ? segEstimate.boardingTime : (matchedTrain ? matchedTrain.departureTime : (d.journeyTime || '23:00')),
          fare: breakdown.fare,
          vat: Number(d.vat) > 0 ? Number(d.vat) : breakdown.vat,
          serviceCharge: breakdown.serviceCharge,
          numSeats,
          numAdults: numSeats,
          createdAt: new Date().toISOString(),
        };

        const aiTag = res.provider === 'groq' ? '⚡ Groq LPU AI' : '🌐 Gemini AI';

        // Run validation warnings on AI result
        const aiWarnings: TicketAiWarning[] = [];
        const routeWarn = checkTrainRoute(merged.trainName, fromStClean, toStClean, merged.trainNumber);
        if (routeWarn) aiWarnings.push(routeWarn);
        const offDayWarn = merged.journeyDate ? checkTrainOffDay({ offDay: matchedTrain?.offDay || 'None', name: merged.trainName }, merged.journeyDate) : null;
        if (offDayWarn) aiWarnings.push(offDayWarn);

        const roundTrip = detectRoundTripIntent(prompt);
        const returnTicket = roundTrip.isRoundTrip
          ? buildReturnTicketFromOutbound(merged, roundTrip.returnOffsetDays)
          : undefined;

        return {
          ticket: merged,
          returnTicket,
          summary: returnTicket
            ? `${aiTag} রাউন্ড-ট্রিপ: যাওয়া ${merged.trainName} [${merged.trainNumber}] (${merged.journeyDate}) + আসা ${returnTicket.trainName} [${returnTicket.trainNumber}] (${returnTicket.journeyDate})`
            : `${aiTag}: ${merged.trainName} (${merged.trainNumber}), ${merged.fromStation} ➔ ${merged.toStation}, তারিখ: ${merged.journeyDate}, সিট: ${merged.coachSeat}`,
          warnings: aiWarnings.length > 0 ? aiWarnings : undefined,
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
): {
  ticket: BangladeshRailwayTicket;
  returnTicket?: BangladeshRailwayTicket;
  summary: string;
  warnings?: TicketAiWarning[];
} {
  const { ticket, summary, warnings } = parseRailwayTicketLocallyDetailed(prompt, baseTicket);
  const roundTrip = detectRoundTripIntent(prompt);
  const returnTicket = roundTrip.isRoundTrip
    ? buildReturnTicketFromOutbound(ticket, roundTrip.returnOffsetDays)
    : undefined;

  return {
    ticket,
    returnTicket,
    summary: returnTicket
      ? `⚡ রাউন্ড-ট্রিপ সম্পন্ন: যাওয়া ${ticket.trainName} [${ticket.trainNumber}] (${ticket.fromStation} ➔ ${ticket.toStation}, ${ticket.journeyDate}) ও ফেরার ${returnTicket.trainName} [${returnTicket.trainNumber}] (${returnTicket.fromStation} ➔ ${returnTicket.toStation}, ${returnTicket.journeyDate})`
      : summary,
    warnings,
  };
}

const NON_STATION_PROMPT_WORDS = new Set([
  'agamikal', 'tomorrow', 'porshu', 'kalke', 'kal', 'sunday', 'monday',
  'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'theke', 'hote',
  'porjonto', 'express', 'intercity', 'train', 'commuter', 'shuttle',
  'ticket', 'tikit', 'snigdha', 'shovon', 'shulov', 'berth', 'chair',
  'passenger', 'seat', 'seats', 'silkcity', 'dhumketu', 'banalata', 'bonolota',
  'suborno', 'suborna', 'parabat', 'upaban', 'ekota', 'drutojan', 'banglabandha',
  'panchagarh', 'agnibeena', 'tungipara', 'karatoa', 'dolonchapa', 'madhumati',
  'modhumoti', 'sundarban', 'jayantika', 'kapotaksha', 'kapotakkha', 'sagordari',
  'mahanagar', 'paharika', 'mohonganj', 'jamalpur', 'sonar', 'bangla',
]);

function parseRailwayTicketLocallyDetailed(
  prompt: string,
  baseTicket: BangladeshRailwayTicket
): {
  ticket: BangladeshRailwayTicket;
  summary: string;
  warnings?: TicketAiWarning[];
  hasExplicitFrom: boolean;
  hasExplicitTo: boolean;
} {
  const pLower = prompt.toLowerCase();
  const { dateStr } = resolveRelativeDate(prompt);

  // ─────────────────────────────────────────────────────────────
  // 1. Station Routing & Direction Detection (Exact + Banglish + Fuzzy)
  // ─────────────────────────────────────────────────────────────
  let detectedFrom = '';
  let detectedTo = '';

  const trainKeywords = [
    'express', 'mail', 'intercity', 'train', 'commuter', 'shuttle',
    'এক্সপ্রেস', 'মেইল', 'ট্রেন', 'ইন্টারসিটি', 'কমিউটার'
  ];

  interface MatchedStationSpan {
    name: string;
    nameBn: string;
    index: number;
    endIndex: number;
  }

  const matchedStations: MatchedStationSpan[] = [];

  const isTrainReferenceAtSpan = (idx: number, endIdx: number): boolean => {
    const afterStr = pLower.slice(endIdx).trim();
    const beforeStr = pLower.slice(0, idx).trim();
    const firstWordAfter = afterStr.split(/\s+/)[0] || '';
    const isTrainFollow = trainKeywords.some(kw => firstWordAfter.toLowerCase() === kw.toLowerCase());
    const lastWordBefore = beforeStr.split(/\s+/).pop() || '';
    const isTrainPrecede = ['train', 'ট্রেন'].includes(lastWordBefore.toLowerCase());
    return isTrainFollow || isTrainPrecede;
  };

  const addStationSpan = (canonicalName: string, idx: number, endIdx: number) => {
    const stObj = RAILWAY_STATIONS.find(s => s.name.toLowerCase() === canonicalName.toLowerCase());
    if (!stObj) return;
    if (isTrainReferenceAtSpan(idx, endIdx)) return;
    // Skip if overlapping an already matched longer span
    const overlaps = matchedStations.some(
      m => idx < m.endIndex && endIdx > m.index
    );
    if (!overlaps) {
      matchedStations.push({
        name: stObj.name,
        nameBn: stObj.nameBn,
        index: idx,
        endIndex: endIdx,
      });
    }
  };

  // (a) Longest-first English station names + Banglish/spelling aliases
  const candidatePatterns: { needle: string; canonical: string }[] = [
    ...RAILWAY_STATIONS.map(st => ({ needle: st.name.toLowerCase(), canonical: st.name })),
    ...Object.entries(STATION_ALIASES).map(([alias, canonical]) => ({
      needle: alias.toLowerCase(),
      canonical,
    })),
  ].sort((a, b) => b.needle.length - a.needle.length);

  const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  for (const { needle, canonical } of candidatePatterns) {
    if (!needle) continue;
    const isAscii = /^[a-z0-9\s'-]+$/i.test(needle);
    if (isAscii) {
      const re = new RegExp(`\\b${escapeRegex(needle)}\\b`, 'gi');
      let match: RegExpExecArray | null;
      while ((match = re.exec(pLower)) !== null) {
        addStationSpan(canonical, match.index, match.index + match[0].length);
      }
    } else {
      let idxBn = prompt.indexOf(needle);
      while (idxBn !== -1) {
        addStationSpan(canonical, idxBn, idxBn + needle.length);
        idxBn = prompt.indexOf(needle, idxBn + needle.length);
      }
    }
  }

  // (b) Exact Bangla station names
  for (const st of RAILWAY_STATIONS) {
    let idxBn = prompt.indexOf(st.nameBn);
    while (idxBn !== -1) {
      addStationSpan(st.name, idxBn, idxBn + st.nameBn.length);
      idxBn = prompt.indexOf(st.nameBn, idxBn + st.nameBn.length);
    }
  }

  // (c) Bounded fuzzy matching for remaining unmatched alphabetic tokens (e.g., "ibrahimbad")
  const tokenRegex = /[a-z][a-z'-]{4,}/gi;
  let tokMatch: RegExpExecArray | null;
  while ((tokMatch = tokenRegex.exec(pLower)) !== null) {
    const word = tokMatch[0];
    const start = tokMatch.index;
    const end = start + word.length;
    if (NON_STATION_PROMPT_WORDS.has(word)) continue;
    if (matchedStations.some(m => start < m.endIndex && end > m.index)) continue;
    const resolved = normalizeStationName(word);
    if (resolved && resolved.toLowerCase() !== word.toLowerCase()) {
      addStationSpan(resolved, start, end);
    }
  }

  // Sort by appearance in prompt
  matchedStations.sort((a, b) => a.index - b.index);

  // Direct sequence pattern using actual span indices (handles typos & aliases seamlessly)
  for (let i = 0; i < matchedStations.length - 1; i++) {
    const stA = matchedStations[i];
    const stB = matchedStations[i + 1];
    if (stA.name.toLowerCase() === stB.name.toLowerCase()) continue;
    const between = prompt.slice(stA.endIndex, stB.index).trim().toLowerCase();
    const beforeA = prompt.slice(0, stA.index).trim().toLowerCase();

    if (/^(theke|hote|থেকে|হতে|to|-|–|—|>)$/.test(between) || /\b(theke|hote|থেকে|হতে|to)\b/.test(between)) {
      detectedFrom = stA.name;
      detectedTo = stB.name;
      break;
    }
    if (/\bfrom$/.test(beforeA) && /^(to|-|–|—|>|)$/.test(between)) {
      detectedFrom = stA.name;
      detectedTo = stB.name;
      break;
    }
  }

  // Individual contextual markers around matched spans
  if (!detectedFrom || !detectedTo) {
    for (const st of matchedStations) {
      const beforeStr = prompt.slice(0, st.index).trim().toLowerCase();
      const afterStr = prompt.slice(st.endIndex).trim().toLowerCase();

      const isFrom =
        /^(theke|hote|থেকে|হতে)\b/i.test(afterStr) ||
        /\bfrom$/i.test(beforeStr);

      const isTo =
        /\b(to|theke|থেকে|hote|হতে)$/i.test(beforeStr) ||
        /(?:theke|থেকে|hote|হতে)\b/i.test(beforeStr) ||
        /^(te|jabo|যাব|তে|পৌঁছাবে|পর্যন্ত|porjonto)\b/i.test(afterStr);

      if (isFrom && !detectedFrom) {
        detectedFrom = st.name;
      } else if (isTo && !detectedTo && (!detectedFrom || detectedFrom.toLowerCase() !== st.name.toLowerCase())) {
        detectedTo = st.name;
      }
    }
  }

  // Fallback positional sequence if two stations appeared (e.g. "dhaka ibrahimbad")
  if (matchedStations.length >= 2) {
    if (!detectedFrom) detectedFrom = matchedStations[0].name;
    if (!detectedTo) {
      const secondSt = matchedStations.find(s => s.name.toLowerCase() !== detectedFrom.toLowerCase());
      if (secondSt) detectedTo = secondSt.name;
    }
  } else if (matchedStations.length === 1 && !detectedFrom) {
    const onlySt = matchedStations[0];
    const beforeStr = prompt.slice(0, onlySt.index).trim().toLowerCase();
    const afterStr = prompt.slice(onlySt.endIndex).trim().toLowerCase();
    if (/\bto$/i.test(beforeStr) || /^(te|jabo|যাব|তে|porjonto|পর্যন্ত)\b/i.test(afterStr)) {
      detectedTo = onlySt.name;
    } else {
      detectedFrom = onlySt.name;
    }
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
    'parjatak': 'PARJATAK EXPRESS',
    'পর্যটক': 'PARJATAK EXPRESS',
    'chitra': 'CHITRA EXPRESS',
    'চিত্রা': 'CHITRA EXPRESS',
    'parabat': 'PARABAT EXPRESS',
    'পারাবত': 'PARABAT EXPRESS',
    'upaban': 'UPABAN EXPRESS',
    'উপবন': 'UPABAN EXPRESS',
    'bana': 'BANALATA EXPRESS',
    'banalata': 'BANALATA EXPRESS',
    'bonolota': 'BANALATA EXPRESS',
    'বনলতা': 'BANALATA EXPRESS',
    'silk': 'SILKCITY EXPRESS',
    'সিল্কসিটি': 'SILKCITY EXPRESS',
    'dhumketu': 'DHUMKETU EXPRESS',
    'ধূমকেতু': 'DHUMKETU EXPRESS',
    'ekota': 'EKOTA EXPRESS',
    'একতা': 'EKOTA EXPRESS',
    'drutojan': 'DRUTOJAN EXPRESS',
    'druto': 'DRUTOJAN EXPRESS',
    'দ্রুতযান': 'DRUTOJAN EXPRESS',
    'banglabandha': 'BANGLABANDHA EXPRESS',
    'বাংলাবান্ধা': 'BANGLABANDHA EXPRESS',
    'tista': 'TISTA EXPRESS',
    'তিস্তা': 'TISTA EXPRESS',
    'agnibeena': 'AGNIBEENA EXPRESS',
    'অগ্নিবীণা': 'AGNIBEENA EXPRESS',
    'tungipara': 'TUNGIPARA EXPRESS',
    'টুঙ্গিপাড়া': 'TUNGIPARA EXPRESS',
    'টুঙ্গিপাড়া': 'TUNGIPARA EXPRESS',
    'karatoa': 'KARATOA EXPRESS',
    'করতোয়া': 'KARATOA EXPRESS',
    'dolonchapa': 'DOLONCHAPA EXPRESS',
    'দোলনচাঁপা': 'DOLONCHAPA EXPRESS',
    'দোলনচাপা': 'DOLONCHAPA EXPRESS',
    'madhumati': 'MADHUMATI EXPRESS',
    'modhumoti': 'MADHUMATI EXPRESS',
    'মধুমতী': 'MADHUMATI EXPRESS',
    'burimari': 'BURIMARI EXPRESS',
    'বুড়িমারী': 'BURIMARI EXPRESS',
    'বুড়িমারী': 'BURIMARI EXPRESS',
    'chilahati': 'CHILAHATI EXPRESS',
    'চিলাহাটি': 'CHILAHATI EXPRESS',
    'kurigram': 'KURIGRAM EXPRESS',
    'কুড়িগ্রাম': 'KURIGRAM EXPRESS',
    'কুড়িগ্রাম': 'KURIGRAM EXPRESS',
    'rangpur': 'RANGPUR EXPRESS',
    'রংপুর': 'RANGPUR EXPRESS',
    'lalmoni': 'LALMONI EXPRESS',
    'লালমনি': 'LALMONI EXPRESS',
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
    'kapotaksha': 'KAPOTAKKHA EXPRESS',
    'kapotakkha': 'KAPOTAKKHA EXPRESS',
    'কপোতাক্ষ': 'KAPOTAKKHA EXPRESS',
    'sagordari': 'SAGORDARI EXPRESS',
    'সাগরদাঁড়ী': 'SAGORDARI EXPRESS',
    'সাগরদাড়ী': 'SAGORDARI EXPRESS',
    'rupsha': 'RUPSHA EXPRESS',
    'রূপসা': 'RUPSHA EXPRESS',
    'simanta': 'SIMANTA EXPRESS',
    'সীমান্ত': 'SIMANTA EXPRESS',
    'turna': 'TURNA EXPRESS',
    'তূর্ণা': 'TURNA EXPRESS',
    'mahanagar': 'MAHANAGAR EXPRESS',
    'মহানগর': 'MAHANAGAR EXPRESS',
    'chattala': 'CHATTALA EXPRESS',
    'চট্টলা': 'CHATTALA EXPRESS',
    'bijoy': 'BIJOY EXPRESS',
    'বিজয়': 'BIJOY EXPRESS',
    'paharika': 'PAHARIKA EXPRESS',
    'পাহাড়িকা': 'PAHARIKA EXPRESS',
    'পাহাড়িকা': 'PAHARIKA EXPRESS',
    'udayan': 'UDAYAN EXPRESS',
    'উদয়ন': 'UDAYAN EXPRESS',
    'sirajganj': 'SIRAJGANJ EXPRESS',
    'সিরাজগঞ্জ': 'SIRAJGANJ EXPRESS',
    'haor': 'HAOR EXPRESS',
    'হাওর': 'HAOR EXPRESS',
    'mohonganj': 'MOHANGANJ EXPRESS',
    'মোহনগঞ্জ': 'MOHANGANJ EXPRESS',
    'meghna': 'MEGHNA EXPRESS',
    'মেঘনা': 'MEGHNA EXPRESS',
    'jamalpur': 'JAMALPUR EXPRESS',
    'জামালপুর': 'JAMALPUR EXPRESS',
  };

  let targetTrainName = '';
  for (const [key, tName] of Object.entries(trainAliases)) {
    if (pLower.includes(key)) {
      targetTrainName = tName;
      break;
    }
  }

  // Normalize BANALATA variant: match both "BANA LATA EXPRESS" and "BANALATA EXPRESS"
  const isBanalata = targetTrainName === 'BANALATA EXPRESS' || pLower.includes('bana lata');
  const trainNameMatcher = (t: { name: string }) => {
    const tUp = t.name.toUpperCase().replace(/\s+/g, '');
    const target = targetTrainName.replace(/\s+/g, '');
    return tUp.includes(target) || (isBanalata && t.name.toUpperCase().includes('BANA'));
  };

  if (!targetTrainName) {
    for (const t of RAILWAY_TRAINS) {
      if (pLower.includes(t.name.toLowerCase()) || pLower.includes(t.name.toLowerCase().replace(/\s+/g, '')) || prompt.includes(t.nameBn) || prompt.includes(t.number)) {
        targetTrainName = t.name;
        break;
      }
    }
  }

  let matchedTrain: any = null;
  let routeValidationWarning = ''; // ← Route validation warning

  if (targetTrainName) {
    // 1st priority: matching name AND exact directional stop sequence
    if (detectedFrom && detectedTo) {
      matchedTrain = RAILWAY_TRAINS.find(
        t => trainNameMatcher(t) &&
             t.fromStation.toLowerCase() === detectedFrom.toLowerCase() &&
             t.toStation.toLowerCase() === detectedTo.toLowerCase()
      ) || RAILWAY_TRAINS.find(
        t => trainNameMatcher(t) && doesTrainServeRouteInDirection(t, detectedFrom, detectedTo)
      );
    }
    // 2nd priority: matching name AND origin
    if (!matchedTrain && detectedFrom) {
      matchedTrain = RAILWAY_TRAINS.find(
        t => trainNameMatcher(t) &&
             t.fromStation.toLowerCase() === detectedFrom.toLowerCase()
      );
    }
    // 3rd priority: matching name AND destination
    if (!matchedTrain && detectedTo) {
      matchedTrain = RAILWAY_TRAINS.find(
        t => trainNameMatcher(t) &&
             t.toStation.toLowerCase() === detectedTo.toLowerCase()
      );
    }
    // 4th priority: any train with that name
    if (!matchedTrain) {
      matchedTrain = RAILWAY_TRAINS.find(t => trainNameMatcher(t));
    }

    // ── Route Validation: Check if detected train actually serves the requested route ──
    if (matchedTrain && detectedFrom && detectedTo) {
      const routeWarn = checkTrainRoute(matchedTrain.name, detectedFrom, detectedTo, matchedTrain.number);
      if (routeWarn) {
        routeValidationWarning = routeWarn.messageBn;
      }
    }
  }

  // Fallback train: pick a directional match on requested stations first
  if (!matchedTrain) {
    matchedTrain = RAILWAY_TRAINS.find(
      t => (!detectedFrom || t.fromStation.toLowerCase() === detectedFrom.toLowerCase()) &&
           (!detectedTo || t.toStation.toLowerCase() === detectedTo.toLowerCase())
    ) || RAILWAY_TRAINS.find(
      t => Boolean(detectedFrom && detectedTo && doesTrainServeRouteInDirection(t, detectedFrom, detectedTo))
    ) || RAILWAY_TRAINS[0];
  }

  const fromStation = detectedFrom || matchedTrain.fromStation;
  let toStation = detectedTo;
  if (!toStation || toStation.toLowerCase() === fromStation.toLowerCase()) {
    toStation = matchedTrain.toStation.toLowerCase() === fromStation.toLowerCase()
      ? matchedTrain.fromStation
      : matchedTrain.toStation;
  }

  // Final check: ensure directional train variant serves fromStation -> toStation in order
  const directionalTrain = RAILWAY_TRAINS.find(
    t => t.name.toLowerCase() === matchedTrain.name.toLowerCase() &&
         t.fromStation.toLowerCase() === fromStation.toLowerCase() &&
         t.toStation.toLowerCase() === toStation.toLowerCase()
  ) || RAILWAY_TRAINS.find(
    t => t.name.toLowerCase() === matchedTrain.name.toLowerCase() &&
         doesTrainServeRouteInDirection(t, fromStation, toStation)
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
    const multiNameMatch = prompt.match(/(?:passenger\s+name|যাত্রীর\s+নাম|যাত্রী|passenger|নাম|name|nam|naam)\s*[:=]?\s*([A-Za-z\u0980-\u09FF,.\s&]+)/i);
    if (multiNameMatch && multiNameMatch[1] && multiNameMatch[1].trim().length > 2) {
      let rawPart = multiNameMatch[1];
      const cutoffPatterns = [
        /\b(?:express|mail|intercity|train|commuter|shuttle|এক্সপ্রেস|মেইল|ট্রেন)\b/i,
        /\b(?:padma|sonar\s*bangla|suborno|suborna|cox|parjatak|chitra|parabat|upaban|bana\s*lata|banalata|bonolota|silkcity|dhumketu|ekota|drutojan|banglabandha|tista|agnibeena|tungipara|karatoa|dolonchapa|madhumati|burimari|chilahati|kurigram|rangpur|lalmoni|benapole|sundarban|jamuna|kalni|jayantika|kapotakkha|sagordari|rupsha|simanta|turna|mahanagar|chattala|bijoy|paharika|udayan|sirajganj|haor|mohonganj|meghna|jamalpur)\b/i,
        /\b(?:dhaka|rajshahi|chattogram|chittagong|sylhet|cox's\s*bazar|khulna|rangpur|dinajpur|ibrahimabad)\b/i,
        /\b(?:shovon|shovon_chair|snigdha|ac|ac_s|ac_b|f_seat|f_berth|শোভন|স্নিগ্ধা|এসি|সিট|আসন|seat)\b/i,
        /\b(?:round[\s-]?trip|return|up[\s-]?down|যাওয়া[\s-]?আসা|যাওয়া[\s-]?আসা|রিটার্ন|ফেরার|ফিরতি|দিন\s+পর|days?\s+(?:later|after))\b/i,
        /\b(?:tikit|ticket|টিকিট|kato|kato\s*ta|কাটো|কাটুন|দিন|দেন|বুক|book)\b/i,
        /\b\d+\s*(?:ta|টা|jon|জন|person|টি|দিন)\b/i
      ];
      for (const pat of cutoffPatterns) {
        const cMatch = rawPart.match(pat);
        if (cMatch && cMatch.index !== undefined) {
          rawPart = rawPart.slice(0, cMatch.index);
        }
      }
      const rawNames = rawPart.split(/\s*(?:,|&|এবং|\band\b|\+|ও)\s*/)
        .map(n => n.trim())
        .filter(n => n.length >= 2 && !['kato', 'tikit', 'ticket', 'jon', 'ta', 'er', 'theke', 'hote', 'to', 'and', 'name', 'nam', 'টাকা', 'জন', 'সিট'].includes(n.toLowerCase()));
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
  const generatedSeats = generateSmartCoachSeats(selectedClass.code, numSeats);
  const coachSeat = generatedSeats.coachSeat;
  const coachSeatBn = generatedSeats.coachSeatBn;

  // ─────────────────────────────────────────────────────────────
  // 7. Accurate Segment Fare, AC VAT & Boarding Time Calculations
  // ─────────────────────────────────────────────────────────────
  const segEstimate = estimateSegmentSchedule(matchedTrain, fromStation, toStation, selectedClass.code);
  const unitFare = segEstimate.segmentFare || matchedTrain.fares[selectedClass.code] || selectedClass.defaultFare || 450;
  const breakdown = calculateTicketFareBreakdown(unitFare, selectedClass.code, numSeats, 0, 0);
  const totalFare = breakdown.fare;
  const vat = breakdown.vat;
  const serviceCharge = breakdown.serviceCharge;

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
    journeyTime: segEstimate.boardingTime,
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

  // -- Warnings: off-day + route mismatch checks --
  const finalWarnings: TicketAiWarning[] = [];
  const offDayWarn = checkTrainOffDay({ offDay: matchedTrain.offDay, name: matchedTrain.name }, dateStr);
  if (offDayWarn) finalWarnings.push(offDayWarn);
  if (routeValidationWarning || (detectedFrom && detectedTo)) {
    const routeWarn = checkTrainRoute(matchedTrain.name, fromStation, toStation, matchedTrain.number);
    if (routeWarn) finalWarnings.push(routeWarn);
  }

  return {
    ticket: generatedTicket,
    summary: `⚡ এআই প্রসেস সম্পন্ন: ${generatedTicket.trainName} (${generatedTicket.trainNumber}), ${generatedTicket.fromStation} ➔ ${generatedTicket.toStation}, তারিখ: ${generatedTicket.journeyDate}, সিট: ${generatedTicket.coachSeat} (মোট ${numSeats}টি টিকিট, ভাড়া: ৳${totalFare})`,
    warnings: finalWarnings.length > 0 ? finalWarnings : undefined,
    hasExplicitFrom: Boolean(detectedFrom),
    hasExplicitTo: Boolean(detectedTo),
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
