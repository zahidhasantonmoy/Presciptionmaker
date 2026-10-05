// Bangladesh Railway Stations and Trains Master Dataset

export interface RailwayStation {
  name: string;
  nameBn: string;
  code: string;
  district: string;
}

export interface RailwayTrain {
  number: string;
  name: string;
  nameBn: string;
  fromStation: string;
  toStation: string;
  departureTime: string; // HH:mm (24h)
  arrivalTime: string;   // HH:mm (24h)
  offDay: string;
  fares: Record<string, number>;
}

export const RAILWAY_CLASSES: { code: string; label: string; labelBn: string; defaultFare: number }[] = [
  { code: 'S_CHAIR', label: 'S_CHAIR', labelBn: 'শোভন চেয়ার', defaultFare: 450 },
  { code: 'SNIGDHA', label: 'SNIGDHA', labelBn: 'স্নিগ্ধা', defaultFare: 865 },
  { code: 'AC_S', label: 'AC_S', labelBn: 'এসি সিট', defaultFare: 1035 },
  { code: 'AC_B', label: 'AC_B', labelBn: 'এসি বার্থ', defaultFare: 1555 },
  { code: 'F_BERTH', label: 'F_BERTH', labelBn: 'ফার্স্ট বার্থ', defaultFare: 1100 },
  { code: 'F_SEAT', label: 'F_SEAT', labelBn: 'ফার্স্ট সিট', defaultFare: 750 },
  { code: 'SHOVON', label: 'SHOVON', labelBn: 'শোভন', defaultFare: 375 },
  { code: 'AC_CHAIR', label: 'AC_CHAIR', labelBn: 'এসি চেয়ার', defaultFare: 865 },
];

export const RAILWAY_STATIONS: RailwayStation[] = [
  { name: 'Dhaka', nameBn: 'ঢাকা', code: 'DA', district: 'Dhaka' },
  { name: 'Dhaka Cantonment', nameBn: 'ঢাকা ক্যান্টনমেন্ট', code: 'DAC', district: 'Dhaka' },
  { name: 'Dhaka Biman Bandar', nameBn: 'ঢাকা বিমান বন্দর', code: 'BBA', district: 'Dhaka' },
  { name: 'Rajshahi', nameBn: 'রাজশাহী', code: 'RJ', district: 'Rajshahi' },
  { name: 'Chittagong', nameBn: 'চট্টগ্রাম', code: 'CG', district: 'Chittagong' },
  { name: 'Cox\'s Bazar', nameBn: 'কক্সবাজার', code: 'CXB', district: 'Cox\'s Bazar' },
  { name: 'Sylhet', nameBn: 'সিলেট', code: 'SY', district: 'Sylhet' },
  { name: 'Khulna', nameBn: 'খুলনা', code: 'KL', district: 'Khulna' },
  { name: 'Rangpur', nameBn: 'রংপুর', code: 'RP', district: 'Rangpur' },
  { name: 'Dinajpur', nameBn: 'দিনাজপুর', code: 'DJ', district: 'Dinajpur' },
  { name: 'Panchagarh', nameBn: 'পঞ্চগড়', code: 'PG', district: 'Panchagarh' },
  { name: 'Benapole', nameBn: 'বেনাপোল', code: 'BNP', district: 'Jashore' },
  { name: 'Cumilla', nameBn: 'কুমিল্লা', code: 'CUM', district: 'Cumilla' },
  { name: 'Feni', nameBn: 'ফেনী', code: 'FN', district: 'Feni' },
  { name: 'Brahmanbaria', nameBn: 'ব্রাহ্মণবাড়িয়া', code: 'BB', district: 'Brahmanbaria' },
  { name: 'Mymensingh', nameBn: 'ময়মনসিংহ', code: 'MS', district: 'Mymensingh' },
  { name: 'Jamalpur', nameBn: 'জামালপুর', code: 'JML', district: 'Jamalpur' },
  { name: 'Bogra', nameBn: 'বগুড়া', code: 'BG', district: 'Bogra' },
  { name: 'Ishwardi', nameBn: 'ঈশ্বরদী', code: 'ISD', district: 'Pabna' },
  { name: 'Pabna', nameBn: 'পাবনা', code: 'PB', district: 'Pabna' },
  { name: 'Sirajganj', nameBn: 'সিরাজগঞ্জ', code: 'SG', district: 'Sirajganj' },
  { name: 'Tangail', nameBn: 'টাঙ্গাইল', code: 'TG', district: 'Tangail' },
  { name: 'Joydebpur', nameBn: 'জয়দেবপুর', code: 'JDP', district: 'Gazipur' },
  { name: 'Kurigram', nameBn: 'কুড়িগ্রাম', code: 'KRG', district: 'Kurigram' },
  { name: 'Lalmonirhat', nameBn: 'লালমনিরহাট', code: 'LMH', district: 'Lalmonirhat' },
  { name: 'Kushtia', nameBn: 'কুষ্টিয়া', code: 'KST', district: 'Kushtia' },
  { name: 'Jashore', nameBn: 'যশোর', code: 'JSR', district: 'Jashore' },
  { name: 'Santahar', nameBn: 'সান্তাহার', code: 'STH', district: 'Bogra' },
  { name: 'Parbatipur', nameBn: 'পার্বতীপুর', code: 'PBP', district: 'Dinajpur' },
  { name: 'Srimangal', nameBn: 'শ্রীমঙ্গল', code: 'SMG', district: 'Moulvibazar' },
];

export const RAILWAY_TRAINS: RailwayTrain[] = [
  {
    number: '760',
    name: 'PADMA EXPRESS',
    nameBn: 'পদ্মা এক্সপ্রেস',
    fromStation: 'Rajshahi',
    toStation: 'Dhaka',
    departureTime: '16:00',
    arrivalTime: '21:40',
    offDay: 'Tuesday',
    fares: { S_CHAIR: 450, SNIGDHA: 865, AC_S: 1035, AC_B: 1555, SHOVON: 375 },
  },
  {
    number: '759',
    name: 'PADMA EXPRESS',
    nameBn: 'পদ্মা এক্সপ্রেস',
    fromStation: 'Dhaka',
    toStation: 'Rajshahi',
    departureTime: '23:00',
    arrivalTime: '04:30',
    offDay: 'Tuesday',
    fares: { S_CHAIR: 450, SNIGDHA: 865, AC_S: 1035, AC_B: 1555, SHOVON: 375 },
  },
  {
    number: '754',
    name: 'SILKCITY EXPRESS',
    nameBn: 'সিল্কসিটি এক্সপ্রেস',
    fromStation: 'Rajshahi',
    toStation: 'Dhaka',
    departureTime: '07:40',
    arrivalTime: '13:30',
    offDay: 'Sunday',
    fares: { S_CHAIR: 450, SNIGDHA: 865, AC_S: 1035, AC_B: 1555, SHOVON: 375 },
  },
  {
    number: '753',
    name: 'SILKCITY EXPRESS',
    nameBn: 'সিল্কসিটি এক্সপ্রেস',
    fromStation: 'Dhaka',
    toStation: 'Rajshahi',
    departureTime: '14:45',
    arrivalTime: '20:35',
    offDay: 'Sunday',
    fares: { S_CHAIR: 450, SNIGDHA: 865, AC_S: 1035, AC_B: 1555, SHOVON: 375 },
  },
  {
    number: '770',
    name: 'DHUMKETU EXPRESS',
    nameBn: 'ধূমকেতু এক্সপ্রেস',
    fromStation: 'Rajshahi',
    toStation: 'Dhaka',
    departureTime: '23:20',
    arrivalTime: '04:55',
    offDay: 'Wednesday',
    fares: { S_CHAIR: 450, SNIGDHA: 865, AC_S: 1035, AC_B: 1555, SHOVON: 375 },
  },
  {
    number: '769',
    name: 'DHUMKETU EXPRESS',
    nameBn: 'ধূমকেতু এক্সপ্রেস',
    fromStation: 'Dhaka',
    toStation: 'Rajshahi',
    departureTime: '06:00',
    arrivalTime: '11:40',
    offDay: 'Thursday',
    fares: { S_CHAIR: 450, SNIGDHA: 865, AC_S: 1035, AC_B: 1555, SHOVON: 375 },
  },
  {
    number: '702',
    name: 'SUBORNO EXPRESS',
    nameBn: 'সুবর্ণ এক্সপ্রেস',
    fromStation: 'Dhaka',
    toStation: 'Chittagong',
    departureTime: '16:30',
    arrivalTime: '21:50',
    offDay: 'Monday',
    fares: { S_CHAIR: 500, SNIGDHA: 960, AC_S: 1150, SHOVON: 420 },
  },
  {
    number: '701',
    name: 'SUBORNO EXPRESS',
    nameBn: 'সুবর্ণ এক্সপ্রেস',
    fromStation: 'Chittagong',
    toStation: 'Dhaka',
    departureTime: '07:00',
    arrivalTime: '12:20',
    offDay: 'Monday',
    fares: { S_CHAIR: 500, SNIGDHA: 960, AC_S: 1150, SHOVON: 420 },
  },
  {
    number: '788',
    name: 'SONAR BANGLA EXPRESS',
    nameBn: 'সোনার বাংলা এক্সপ্রেস',
    fromStation: 'Dhaka',
    toStation: 'Chittagong',
    departureTime: '07:00',
    arrivalTime: '12:15',
    offDay: 'Wednesday',
    fares: { S_CHAIR: 520, SNIGDHA: 1000, AC_S: 1200, SHOVON: 430 },
  },
  {
    number: '787',
    name: 'SONAR BANGLA EXPRESS',
    nameBn: 'সোনার বাংলা এক্সপ্রেস',
    fromStation: 'Chittagong',
    toStation: 'Dhaka',
    departureTime: '17:00',
    arrivalTime: '22:15',
    offDay: 'Wednesday',
    fares: { S_CHAIR: 520, SNIGDHA: 1000, AC_S: 1200, SHOVON: 430 },
  },
  {
    number: '814',
    name: 'COX\'S BAZAR EXPRESS',
    nameBn: 'কক্সবাজার এক্সপ্রেস',
    fromStation: 'Dhaka',
    toStation: 'Cox\'s Bazar',
    departureTime: '22:30',
    arrivalTime: '06:40',
    offDay: 'Monday',
    fares: { S_CHAIR: 695, SNIGDHA: 1325, AC_S: 1590, AC_B: 2380, SHOVON: 590 },
  },
  {
    number: '813',
    name: 'COX\'S BAZAR EXPRESS',
    nameBn: 'কক্সবাজার এক্সপ্রেস',
    fromStation: 'Cox\'s Bazar',
    toStation: 'Dhaka',
    departureTime: '12:30',
    arrivalTime: '21:10',
    offDay: 'Monday',
    fares: { S_CHAIR: 695, SNIGDHA: 1325, AC_S: 1590, AC_B: 2380, SHOVON: 590 },
  },
  {
    number: '816',
    name: 'PARJATAK EXPRESS',
    nameBn: 'পর্যটক এক্সপ্রেস',
    fromStation: 'Dhaka',
    toStation: 'Cox\'s Bazar',
    departureTime: '06:15',
    arrivalTime: '15:00',
    offDay: 'Sunday',
    fares: { S_CHAIR: 695, SNIGDHA: 1325, AC_S: 1590, AC_B: 2380, SHOVON: 590 },
  },
  {
    number: '815',
    name: 'PARJATAK EXPRESS',
    nameBn: 'পর্যটক এক্সপ্রেস',
    fromStation: 'Cox\'s Bazar',
    toStation: 'Dhaka',
    departureTime: '20:00',
    arrivalTime: '04:30',
    offDay: 'Sunday',
    fares: { S_CHAIR: 695, SNIGDHA: 1325, AC_S: 1590, AC_B: 2380, SHOVON: 590 },
  },
  {
    number: '709',
    name: 'PARABAT EXPRESS',
    nameBn: 'পারাবত এক্সপ্রেস',
    fromStation: 'Dhaka',
    toStation: 'Sylhet',
    departureTime: '06:20',
    arrivalTime: '13:00',
    offDay: 'Tuesday',
    fares: { S_CHAIR: 410, SNIGDHA: 785, AC_S: 940, SHOVON: 345 },
  },
  {
    number: '710',
    name: 'PARABAT EXPRESS',
    nameBn: 'পারাবত এক্সপ্রেস',
    fromStation: 'Sylhet',
    toStation: 'Dhaka',
    departureTime: '15:45',
    arrivalTime: '22:40',
    offDay: 'Tuesday',
    fares: { S_CHAIR: 410, SNIGDHA: 785, AC_S: 940, SHOVON: 345 },
  },
  {
    number: '739',
    name: 'UPABAN EXPRESS',
    nameBn: 'উপবন এক্সপ্রেস',
    fromStation: 'Dhaka',
    toStation: 'Sylhet',
    departureTime: '20:30',
    arrivalTime: '05:00',
    offDay: 'Wednesday',
    fares: { S_CHAIR: 410, SNIGDHA: 785, AC_S: 940, AC_B: 1410, SHOVON: 345 },
  },
  {
    number: '764',
    name: 'CHITRA EXPRESS',
    nameBn: 'চিত্রা এক্সপ্রেস',
    fromStation: 'Khulna',
    toStation: 'Dhaka',
    departureTime: '09:00',
    arrivalTime: '17:55',
    offDay: 'Monday',
    fares: { S_CHAIR: 530, SNIGDHA: 1015, AC_S: 1220, AC_B: 1830, SHOVON: 440 },
  },
  {
    number: '726',
    name: 'SUNDARBAN EXPRESS',
    nameBn: 'সুন্দরবন এক্সপ্রেস',
    fromStation: 'Khulna',
    toStation: 'Dhaka',
    departureTime: '21:45',
    arrivalTime: '06:10',
    offDay: 'Wednesday',
    fares: { S_CHAIR: 530, SNIGDHA: 1015, AC_S: 1220, AC_B: 1830, SHOVON: 440 },
  },
  {
    number: '796',
    name: 'BENAPOLE EXPRESS',
    nameBn: 'বেনাপোল এক্সপ্রেস',
    fromStation: 'Benapole',
    toStation: 'Dhaka',
    departureTime: '13:00',
    arrivalTime: '20:45',
    offDay: 'Wednesday',
    fares: { S_CHAIR: 535, SNIGDHA: 1025, AC_S: 1230, AC_B: 1845, SHOVON: 445 },
  },
  {
    number: '772',
    name: 'RANGPUR EXPRESS',
    nameBn: 'রংপুর এক্সপ্রেস',
    fromStation: 'Rangpur',
    toStation: 'Dhaka',
    departureTime: '20:00',
    arrivalTime: '06:05',
    offDay: 'Sunday',
    fares: { S_CHAIR: 560, SNIGDHA: 1075, AC_S: 1290, AC_B: 1935, SHOVON: 465 },
  },
  {
    number: '798',
    name: 'KURIGRAM EXPRESS',
    nameBn: 'কুড়িগ্রাম এক্সপ্রেস',
    fromStation: 'Kurigram',
    toStation: 'Dhaka',
    departureTime: '07:15',
    arrivalTime: '17:25',
    offDay: 'Wednesday',
    fares: { S_CHAIR: 560, SNIGDHA: 1075, AC_S: 1290, SHOVON: 465 },
  },
];

// Helper: Convert English Digits to Bengali Digits
const BN_DIGITS: Record<string, string> = {
  '0': '০', '1': '১', '2': '২', '3': '৩', '4': '৪',
  '5': '৫', '6': '৬', '7': '৭', '8': '৮', '9': '৯',
};

export function toBanglaDigits(input: string | number): string {
  return String(input).replace(/[0-9]/g, match => BN_DIGITS[match] || match);
}

// Helper: Format DateTime for Bangladesh Railway Ticket
// e.g. "28-09-2026 13:10 (২৮-০৯-২০২৬ ১৩:১০)"
export function formatRailwayDateTime(dateStr: string, timeStr: string): string {
  if (!dateStr) return '';
  // dateStr is YYYY-MM-DD
  const parts = dateStr.split('-');
  const formattedEnDate = parts.length === 3 ? `${parts[2]}-${parts[1]}-${parts[0]}` : dateStr;
  const enFull = `${formattedEnDate} ${timeStr}`;
  const bnFull = toBanglaDigits(enFull);
  return `${enFull} (${bnFull})`;
}

// Helper: Map Station English to Bengali
export function getStationBanglaName(stationName: string): string {
  const match = RAILWAY_STATIONS.find(s => s.name.toLowerCase() === stationName.toLowerCase());
  return match ? match.nameBn : stationName;
}

// Helper: Map Coach English to Bengali
// e.g. THA-92 -> ঠ-৯২
const COACH_BN_MAP: Record<string, string> = {
  KA: 'ক', KHA: 'খ', GA: 'গ', GHA: 'ঘ', UMA: 'ঙ',
  CHA: 'চ', CHHA: 'ছ', JA: 'জ', JHA: 'ঝ', THA: 'ঠ',
  DA: 'ড', DHA: 'ঢ', TA: 'ত', FA: 'ফ', BA: 'ব', BHA: 'ভ',
  MA: 'ম', RA: 'র', LA: 'ল', SHA: 'শ',
};

export function formatCoachSeat(coachSeat: string): string {
  if (!coachSeat) return '';
  const parts = coachSeat.split('-');
  if (parts.length === 2) {
    const prefix = parts[0].toUpperCase();
    const num = parts[1];
    const bnPrefix = COACH_BN_MAP[prefix] || prefix;
    const bnNum = toBanglaDigits(num);
    return `${coachSeat} (${bnPrefix}-${bnNum})`;
  }
  return `${coachSeat} (${toBanglaDigits(coachSeat)})`;
}
