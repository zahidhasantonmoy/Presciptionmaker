import React, { useState, useEffect, useRef, useMemo } from 'react';
import './ticketFonts.css';
import QRCode from 'qrcode';
import html2canvas from 'html2canvas';
import { domToCanvas } from 'modern-screenshot';
import jsPDF from 'jspdf';
import {
  Train, Download, Printer, Plus, CheckCircle2,
  Trash2, PenTool, Eye, EyeOff, ZoomIn, ZoomOut, MessageCircle, Clock,
  Copy, Image as ImageIcon, Check, FileCode, ArrowLeftRight, AlertTriangle, RefreshCw,
  ChevronDown, ChevronUp, Sparkles, BookmarkPlus, Users, UserPlus, MapPin, Search, X
} from 'lucide-react';
import {
  RAILWAY_STATIONS, RAILWAY_TRAINS, RAILWAY_CLASSES, RailwayTrain,
  doesTrainServeRouteInDirection, estimateSegmentSchedule, findDirectionalTrains,
  getOppositeDirectionTrain, isTrainOffDayOnDate, validateTrainRouteSelection,
  DirectionalTrainSuggestion, toBanglaDigits, getStationBanglaName,
  getPureBanglaCoachSeat,
  calculateTicketFareBreakdown, getSegmentStoppageDetails,
  generateSmartCoachSeats, syncCoachSeatCount, maskOfficialNumber
} from './railwayData';
import { lookupStationToStationTrains } from './railwayLookupClient';
import { SearchableStationSelect } from './SearchableStationSelect';
import { AiCommandBar } from '../../components/ai/AiCommandBar';
import { generateTicketAi } from '../ai/aiGenerators';
import { saveDocumentHistory } from '../history/documentHistory';
import { openWhatsAppTicket } from '../../utils/whatsappShare';
import { loadInlineFontsCss } from '../../utils/offlineFonts';
import { RecentHistoryModal } from '../../components/common/RecentHistoryModal';

export interface BangladeshRailwayTicket {
  id: string;
  pnrNumber: string;
  passengerName: string;
  idType: string;
  idTypeBn: string;
  idNumber: string;
  idNumberBn: string;
  mobileNumber: string;
  mobileNumberBn: string;
  issueDate: string; // YYYY-MM-DD
  issueTime: string; // HH:mm
  journeyDate: string; // YYYY-MM-DD
  journeyTime: string; // HH:mm
  fromStation: string;
  fromStationBn: string;
  toStation: string;
  toStationBn: string;
  trainName: string;
  trainNameBn: string;
  trainNumber: string;
  className: string;
  classNameBn: string;
  coachSeat: string;
  coachSeatBn: string;
  numSeats: number;
  numAdults: number;
  numSeniors: number;
  numChildren: number;
  fare: number;
  vat: number;
  serviceCharge: number;
  createdAt: string;
}

const DEFAULT_BR_TICKET: BangladeshRailwayTicket = {
  id: 'BR-' + Math.floor(100000 + Math.random() * 900000),
  pnrNumber: '6ABA16FCEEBCA',
  passengerName: 'MD. ZAHID HASAN',
  idType: 'NID',
  idTypeBn: 'এন আই ডি',
  idNumber: '376****183',
  idNumberBn: '৩৭৬****১৮৩',
  mobileNumber: '017*****000',
  mobileNumberBn: '০১৭*****০০০',
  issueDate: '2026-09-28',
  issueTime: '13:27',
  journeyDate: '2026-10-01',
  journeyTime: '19:30',
  fromStation: 'Dhaka',
  fromStationBn: 'ঢাকা',
  toStation: 'Bheramara',
  toStationBn: 'ভেড়ামারা',
  trainName: 'CHITRA EXPRESS',
  trainNameBn: 'চিত্রা',
  trainNumber: '764',
  className: 'S_CHAIR',
  classNameBn: 'শো.চেয়ার',
  coachSeat: 'TA-34',
  coachSeatBn: 'ট-৩৪',
  numSeats: 1,
  numAdults: 1,
  numSeniors: 0,
  numChildren: 0,
  fare: 455,
  vat: 0,
  serviceCharge: 20,
  createdAt: new Date().toISOString(),
};

export function generateOfficialTicketFileName(ext: 'pdf' | 'jpg' | 'html', pnr?: string): string {
  let seed = 123456789;
  const str = (pnr || 'BDRAILWAY') + 'SHOHOZ_ETICKET_GEN';
  for (let i = 0; i < str.length; i++) {
    seed = (Math.imul(seed ^ str.charCodeAt(i), 1597334677) >>> 0);
  }
  const nextDigit = () => {
    seed = (Math.imul(seed ^ (seed >>> 15), 2246822507) >>> 0);
    return (seed % 10).toString();
  };
  const makeDigits = (count: number) => {
    let res = '';
    for (let i = 0; i < count; i++) res += nextDigit();
    return res;
  };

  const seg1 = makeDigits(15);
  const seg2 = makeDigits(7);
  const seg3 = makeDigits(5);
  const seg4 = makeDigits(7);
  const seg5 = makeDigits(19);

  return `BDRAILWAY_TICKET${seg1}-${seg2}-${seg3}-${seg4}-${seg5}.${ext}`;
}

export function TicketMaker() {
  const [ticket, setTicket] = useState<BangladeshRailwayTicket>(DEFAULT_BR_TICKET);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [savedTickets, setSavedTickets] = useState<BangladeshRailwayTicket[]>(() => {
    try {
      const stored = localStorage.getItem('personal_railway_tickets_db');
      return stored ? JSON.parse(stored) : [DEFAULT_BR_TICKET];
    } catch {
      return [DEFAULT_BR_TICKET];
    }
  });

  // Manual entry toggle states
  const [manualStationMode, setManualStationMode] = useState(false);
  const [manualTrainMode, setManualTrainMode] = useState(false);
  const [manualClassMode, setManualClassMode] = useState(false);
  const [aiUpdatedNotice, setAiUpdatedNotice] = useState<string | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);

  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [isGeneratingJpg, setIsGeneratingJpg] = useState(false);
  const [copiedHtml, setCopiedHtml] = useState(false);
  const [aiWarningPopup, setAiWarningPopup] = useState<{ title: string; messageBn: string; messageEn: string } | null>(null);
  const [routeConflictModal, setRouteConflictModal] = useState<{
    trainName: string;
    trainNumber: string;
    fromStation: string;
    toStation: string;
    reasonBn: string;
    reasonEn: string;
    validTrains: RailwayTrain[];
  } | null>(null);
  const [overriddenConflictKey, setOverriddenConflictKey] = useState<string>('');
  const [routeLookupStatus, setRouteLookupStatus] = useState<'checking' | 'live' | 'verified' | 'offline'>('verified');
  const [liveRouteSuggestions, setLiveRouteSuggestions] = useState<DirectionalTrainSuggestion[] | null>(null);
  const [showStoppageTimeline, setShowStoppageTimeline] = useState(false);
  const [trainSearchQuery, setTrainSearchQuery] = useState('');
  const [roundTripPair, setRoundTripPair] = useState<{
    outbound: BangladeshRailwayTicket;
    returnTicket: BangladeshRailwayTicket;
    activeLeg: 'outbound' | 'return';
  } | null>(null);

  interface SavedPassengerProfile {
    id: string;
    name: string;
    idType: string;
    idNumber: string;
    mobileNumber: string;
  }
  const [savedPassengers, setSavedPassengers] = useState<SavedPassengerProfile[]>(() => {
    try {
      const raw = localStorage.getItem('br_saved_passengers_v1');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // ignore
    }
    return [
      {
        id: 'preset-zahid',
        name: 'MD. ZAHID HASAN',
        idType: 'NID',
        idNumber: '376****183',
        mobileNumber: '017*****000',
      },
    ];
  });
  const [rawPrivacyStore, setRawPrivacyStore] = useState<{ idNumber: string; mobileNumber: string }>({
    idNumber: '',
    mobileNumber: '',
  });
  const [coPassengerRoles, setCoPassengerRoles] = useState<('adult' | 'senior' | 'child')[]>([]);

  const [mobileTab, setMobileTab] = useState<'editor' | 'preview'>('editor');
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth < 1024);
  const ticketRef = useRef<HTMLDivElement>(null);

  const calculateFitScale = () => {
    if (typeof window !== 'undefined') {
      const availableWidth = Math.max(260, window.innerWidth - (window.innerWidth < 640 ? 16 : 32));
      return Math.min(1, parseFloat((availableWidth / 794).toFixed(3)));
    }
    return 1;
  };

  const [previewScale, setPreviewScale] = useState<number>(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      const availableWidth = Math.max(260, window.innerWidth - (window.innerWidth < 640 ? 16 : 32));
      return Math.min(1, parseFloat((availableWidth / 794).toFixed(3)));
    }
    return 1;
  });

  // Resize listener for mobile responsiveness and preview scale
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) {
        setPreviewScale(calculateFitScale());
      } else {
        setPreviewScale(1);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fitToScreen = () => setPreviewScale(calculateFitScale());
  const zoomIn = () => setPreviewScale(prev => Math.min(1.5, parseFloat((prev + 0.1).toFixed(2))));
  const zoomOut = () => setPreviewScale(prev => Math.max(0.25, parseFloat((prev - 0.1).toFixed(2))));
  const resetZoom = () => setPreviewScale(1);

  // Compute directional trains locally in <5ms for current route
  const localDirectionalSuggestions = useMemo(
    () => findDirectionalTrains(ticket.fromStation, ticket.toStation, ticket.journeyDate, ticket.className),
    [ticket.fromStation, ticket.toStation, ticket.journeyDate, ticket.className]
  );

  const routeSuggestions = useMemo(
    () => (liveRouteSuggestions && liveRouteSuggestions.length > 0 ? liveRouteSuggestions : localDirectionalSuggestions),
    [liveRouteSuggestions, localDirectionalSuggestions]
  );

  // Sync non-blocking live lookup whenever stations or date change
  useEffect(() => {
    if (!ticket.fromStation || !ticket.toStation || ticket.fromStation.toLowerCase() === ticket.toStation.toLowerCase()) {
      setLiveRouteSuggestions(null);
      return;
    }
    const controller = new AbortController();
    setRouteLookupStatus(typeof navigator !== 'undefined' && !navigator.onLine ? 'offline' : 'checking');

    lookupStationToStationTrains(
      ticket.fromStation,
      ticket.toStation,
      ticket.journeyDate,
      ticket.className,
      controller.signal
    ).then(res => {
      if (!controller.signal.aborted) {
        setRouteLookupStatus(res.syncState);
        setLiveRouteSuggestions(res.suggestions);
      }
    }).catch(() => {
      if (!controller.signal.aborted) {
        setRouteLookupStatus('verified');
      }
    });

    return () => controller.abort();
  }, [ticket.fromStation, ticket.toStation, ticket.journeyDate, ticket.className]);

  // Unique dropdown list of all trains for secondary group (allows testing invalid routes safely)
  const otherTrainsList = useMemo(() => {
    const matchedIds = new Set(routeSuggestions.map(s => `${s.train.number}-${s.train.name}`));
    return RAILWAY_TRAINS.filter(t => !matchedIds.has(`${t.number}-${t.name}`));
  }, [routeSuggestions]);

  // Instant Quick Train Search across train number, EN name, BN name, origin/destination stations
  const filteredQuickTrains = useMemo(() => {
    const q = trainSearchQuery.trim().toLowerCase();
    if (!q) return [];
    const tokens = q.split(/\s+/).filter(Boolean);
    const matches = RAILWAY_TRAINS.filter(tr => {
      const hay = `${tr.number} ${tr.name} ${tr.nameBn} ${tr.fromStation} ${tr.toStation}`.toLowerCase();
      return tokens.every(tok => hay.includes(tok));
    });
    return matches
      .sort((a, b) => {
        const aExactNum = a.number.toLowerCase().startsWith(q) ? 1 : 0;
        const bExactNum = b.number.toLowerCase().startsWith(q) ? 1 : 0;
        if (aExactNum !== bExactNum) return bExactNum - aExactNum;
        const aRouteMatch = doesTrainServeRouteInDirection(a, ticket.fromStation, ticket.toStation) ? 1 : 0;
        const bRouteMatch = doesTrainServeRouteInDirection(b, ticket.fromStation, ticket.toStation) ? 1 : 0;
        return bRouteMatch - aRouteMatch;
      })
      .slice(0, 8);
  }, [trainSearchQuery, ticket.fromStation, ticket.toStation]);

  // Active train record & off-day detection for Journey Date
  const activeTrainRecord = useMemo(
    () =>
      RAILWAY_TRAINS.find(
        t => t.number === ticket.trainNumber && t.name.toLowerCase() === ticket.trainName.toLowerCase()
      ) ||
      RAILWAY_TRAINS.find(t => t.number === ticket.trainNumber) ||
      RAILWAY_TRAINS.find(t => t.name.toLowerCase() === ticket.trainName.toLowerCase()),
    [ticket.trainNumber, ticket.trainName]
  );

  const activeOffDayStatus = useMemo(
    () => isTrainOffDayOnDate(activeTrainRecord?.offDay, ticket.journeyDate),
    [activeTrainRecord?.offDay, ticket.journeyDate]
  );

  const segmentStoppage = useMemo(
    () => getSegmentStoppageDetails(activeTrainRecord, ticket.fromStation, ticket.toStation),
    [activeTrainRecord, ticket.fromStation, ticket.toStation]
  );

  const availableClassesForTrain = useMemo(() => {
    const trainFareKeys = activeTrainRecord ? Object.keys(activeTrainRecord.fares) : [];
    const available = RAILWAY_CLASSES.filter(c => trainFareKeys.length === 0 || trainFareKeys.includes(c.code));
    const unavailable = RAILWAY_CLASSES.filter(c => trainFareKeys.length > 0 && !trainFareKeys.includes(c.code));
    return { available, unavailable, hasFilter: trainFareKeys.length > 0 };
  }, [activeTrainRecord]);

  const computeUnitSegmentFare = (
    trainObj: RailwayTrain | undefined,
    fromSt: string,
    toSt: string,
    clsCode: string
  ): number => {
    if (trainObj) {
      const seg = estimateSegmentSchedule(trainObj, fromSt, toSt, clsCode);
      if (seg.segmentFare > 0) return seg.segmentFare;
      if (trainObj.fares[clsCode]) return trainObj.fares[clsCode];
    }
    return RAILWAY_CLASSES.find(c => c.code === clsCode)?.defaultFare ?? 450;
  };

  const resolveCompatibleClass = (trainObj: RailwayTrain | undefined, desiredClass: string): string => {
    if (!trainObj) return desiredClass;
    const keys = Object.keys(trainObj.fares);
    if (keys.length === 0 || keys.includes(desiredClass)) return desiredClass;
    return keys.includes('S_CHAIR') ? 'S_CHAIR' : keys[0];
  };

  const buildMismatchKey = (name: string, num: string, from: string, to: string) =>
    `${name.toUpperCase()}|${num}|${from.toLowerCase()}|${to.toLowerCase()}`;

  // Apply train while preserving chosen intermediate stations whenever compatible
  const applyTrainSelection = (
    match: RailwayTrain,
    options?: {
      fromStationOverride?: string;
      fromStationBnOverride?: string;
      toStationOverride?: string;
      toStationBnOverride?: string;
      bypassConflictCheck?: boolean;
    }
  ) => {
    const targetFrom = options?.fromStationOverride ?? ticket.fromStation;
    const targetFromBn = options?.fromStationBnOverride ?? ticket.fromStationBn;
    const targetTo = options?.toStationOverride ?? ticket.toStation;
    const targetToBn = options?.toStationBnOverride ?? ticket.toStationBn;

    const validation = validateTrainRouteSelection(match.name, match.number, targetFrom, targetTo);
    const conflictKey = buildMismatchKey(match.name, match.number, targetFrom, targetTo);

    if (!options?.bypassConflictCheck && !validation.valid && overriddenConflictKey !== conflictKey) {
      setRouteConflictModal({
        trainName: match.name,
        trainNumber: match.number,
        fromStation: targetFrom,
        toStation: targetTo,
        reasonBn: validation.reasonBn || 'নির্বাচিত রুট ও ট্রেন মিলছে না।',
        reasonEn: validation.reasonEn || 'Selected train does not operate on this route.',
        validTrains: validation.validTrains,
      });
      return;
    }

    const compatibleClass = resolveCompatibleClass(match, ticket.className);
    const clsMeta = RAILWAY_CLASSES.find(c => c.code === compatibleClass);
    const seg = estimateSegmentSchedule(match, targetFrom, targetTo, compatibleClass);
    const unitFare = seg.segmentFare || match.fares[compatibleClass] || clsMeta?.defaultFare || 450;
    const breakdown = calculateTicketFareBreakdown(
      unitFare,
      compatibleClass,
      ticket.numAdults,
      ticket.numSeniors,
      ticket.numChildren
    );

    setTicket(prev => ({
      ...prev,
      trainName: match.name,
      trainNameBn: match.nameBn,
      trainNumber: match.number,
      fromStation: targetFrom,
      fromStationBn: targetFromBn || getStationBanglaName(targetFrom),
      toStation: targetTo,
      toStationBn: targetToBn || getStationBanglaName(targetTo),
      className: compatibleClass,
      classNameBn: clsMeta?.labelBn || prev.classNameBn,
      journeyTime: seg.boardingTime,
      fare: breakdown.fare,
      vat: breakdown.vat,
      serviceCharge: breakdown.serviceCharge,
    }));
  };

  // Handle train selection from dropdown or suggestion chip
  const handleSelectTrain = (identifier: string) => {
    if (identifier === 'MANUAL_MODE') {
      setManualTrainMode(true);
      return;
    }
    const match = RAILWAY_TRAINS.find(
      t => `${t.name} [${t.number}]` === identifier || t.number === identifier || t.name === identifier
    );
    if (match) {
      applyTrainSelection(match);
    }
  };

  // Handle From/To station update -> auto-suggest & auto-fill best matching train while preserving stops
  const handleStationsUpdated = (
    nextFrom: string,
    nextFromBn: string,
    nextTo: string,
    nextToBn: string,
    fromSwap = false
  ) => {
    const suggestions = findDirectionalTrains(nextFrom, nextTo, ticket.journeyDate, ticket.className);

    let chosenMatch: RailwayTrain | null = null;
    if (fromSwap) {
      chosenMatch = getOppositeDirectionTrain(ticket.trainName, ticket.trainNumber, nextFrom, nextTo);
    } else if (activeTrainRecord && doesTrainServeRouteInDirection(activeTrainRecord, nextFrom, nextTo)) {
      chosenMatch = activeTrainRecord;
    } else if (suggestions.length > 0) {
      chosenMatch = suggestions[0].train;
    }

    if (chosenMatch) {
      const compatibleClass = resolveCompatibleClass(chosenMatch, ticket.className);
      const clsMeta = RAILWAY_CLASSES.find(c => c.code === compatibleClass);
      const seg = estimateSegmentSchedule(chosenMatch, nextFrom, nextTo, compatibleClass);
      const unitFare = seg.segmentFare || chosenMatch.fares[compatibleClass] || 450;
      const breakdown = calculateTicketFareBreakdown(
        unitFare,
        compatibleClass,
        ticket.numAdults,
        ticket.numSeniors,
        ticket.numChildren
      );
      setTicket(prev => ({
        ...prev,
        fromStation: nextFrom,
        fromStationBn: nextFromBn,
        toStation: nextTo,
        toStationBn: nextToBn,
        trainName: chosenMatch!.name,
        trainNameBn: chosenMatch!.nameBn,
        trainNumber: chosenMatch!.number,
        className: compatibleClass,
        classNameBn: clsMeta?.labelBn || prev.classNameBn,
        journeyTime: seg.boardingTime,
        fare: breakdown.fare,
        vat: breakdown.vat,
        serviceCharge: breakdown.serviceCharge,
      }));
      setOverriddenConflictKey('');
      if (chosenMatch.number !== ticket.trainNumber || chosenMatch.name !== ticket.trainName) {
        setAiUpdatedNotice(
          `${nextFrom} ➔ ${nextTo} রুটের জন্য "${chosenMatch.name} [${chosenMatch.number}]" (${seg.boardingTime}) স্বয়ংক্রিয়ভাবে নির্বাচন করা হয়েছে।`
        );
      }
    } else {
      setTicket(prev => ({
        ...prev,
        fromStation: nextFrom,
        fromStationBn: nextFromBn,
        toStation: nextTo,
        toStationBn: nextToBn,
      }));
      const validation = validateTrainRouteSelection(ticket.trainName, ticket.trainNumber, nextFrom, nextTo);
      const key = buildMismatchKey(ticket.trainName, ticket.trainNumber, nextFrom, nextTo);
      if (!validation.valid && overriddenConflictKey !== key) {
        setRouteConflictModal({
          trainName: ticket.trainName,
          trainNumber: ticket.trainNumber,
          fromStation: nextFrom,
          toStation: nextTo,
          reasonBn: validation.reasonBn || 'নির্বাচিত রুট ও ট্রেন মিলছে না।',
          reasonEn: validation.reasonEn || 'Selected train does not serve this route.',
          validTrains: validation.validTrains,
        });
      }
    }
  };

  // Handle Station selection
  const handleFromStationSelect = (stName: string) => {
    if (stName === 'MANUAL_MODE') {
      setManualStationMode(true);
      return;
    }
    const match = RAILWAY_STATIONS.find(s => s.name === stName);
    const bn = match?.nameBn || getStationBanglaName(stName);
    handleStationsUpdated(stName, bn, ticket.toStation, ticket.toStationBn);
  };

  const handleToStationSelect = (stName: string) => {
    if (stName === 'MANUAL_MODE') {
      setManualStationMode(true);
      return;
    }
    const match = RAILWAY_STATIONS.find(s => s.name === stName);
    const bn = match?.nameBn || getStationBanglaName(stName);
    handleStationsUpdated(ticket.fromStation, ticket.fromStationBn, stName, bn);
  };

  const handleSwapStations = () => {
    handleStationsUpdated(
      ticket.toStation,
      ticket.toStationBn || getStationBanglaName(ticket.toStation),
      ticket.fromStation,
      ticket.fromStationBn || getStationBanglaName(ticket.fromStation),
      true
    );
  };

  const handleShiftToNextOperatingDay = () => {
    if (!ticket.journeyDate) return;
    const dt = new Date(`${ticket.journeyDate}T12:00:00+06:00`);
    if (isNaN(dt.getTime())) return;
    dt.setUTCDate(dt.getUTCDate() + 1);
    const nextDate = dt.toISOString().split('T')[0];
    setTicket(prev => ({ ...prev, journeyDate: nextDate }));
    setAiUpdatedNotice(`যাত্রার তারিখ পরিবর্তন করে ${nextDate} নির্ধারণ করা হয়েছে।`);
  };

  // Handle class change -> segment-aware fare + 15% AC VAT sync
  const handleClassChange = (newClass: string) => {
    if (newClass === 'MANUAL_MODE') {
      setManualClassMode(true);
      return;
    }
    const clsObj = RAILWAY_CLASSES.find(c => c.code === newClass);
    const unitFare = computeUnitSegmentFare(activeTrainRecord, ticket.fromStation, ticket.toStation, newClass);
    const breakdown = calculateTicketFareBreakdown(
      unitFare,
      newClass,
      ticket.numAdults,
      ticket.numSeniors,
      ticket.numChildren
    );

    setTicket(prev => ({
      ...prev,
      className: newClass,
      classNameBn: clsObj?.labelBn || newClass,
      fare: breakdown.fare,
      vat: breakdown.vat,
      serviceCharge: breakdown.serviceCharge,
    }));
  };

  // Smart consecutive seat generator & passenger count sync
  const handleAutoGenerateSeats = () => {
    const { coachSeat, coachSeatBn } = generateSmartCoachSeats(
      ticket.className,
      ticket.numSeats,
      ticket.coachSeat
    );
    setTicket(prev => ({ ...prev, coachSeat, coachSeatBn }));
    setAiUpdatedNotice(`নতুন সিট সেট করা হয়েছে: ${coachSeat} (${coachSeatBn})`);
  };

  const passengerNamesList = useMemo(() => {
    const parts = ticket.passengerName.split(',').map(p => p.trim());
    return parts.length > 0 ? parts : [''];
  }, [ticket.passengerName]);

  const leadPassengerName = passengerNamesList[0] || ticket.passengerName;
  const coPassengersList = useMemo(
    () => passengerNamesList.slice(1).filter(Boolean),
    [passengerNamesList]
  );
  const isCompactMultiPax = coPassengersList.length >= 4;

  const applySeatAndCategoryCounts = (
    nextAdults: number,
    nextSeniors: number,
    nextChildren: number,
    nextNames?: string[]
  ) => {
    const adults = Math.max(0, nextAdults);
    const seniors = Math.max(0, nextSeniors);
    const children = Math.max(0, nextChildren);
    const totalSeats = Math.max(1, adults + seniors + children);
    const unitFare = computeUnitSegmentFare(
      activeTrainRecord,
      ticket.fromStation,
      ticket.toStation,
      ticket.className
    );
    const breakdown = calculateTicketFareBreakdown(unitFare, ticket.className, adults, seniors, children);
    const syncedSeats = syncCoachSeatCount(ticket.coachSeat, ticket.className, totalSeats);

    setTicket(prev => ({
      ...prev,
      numSeats: totalSeats,
      numAdults: adults,
      numSeniors: seniors,
      numChildren: children,
      passengerName: nextNames ? nextNames.join(', ') : prev.passengerName,
      coachSeat: syncedSeats.coachSeat,
      coachSeatBn: syncedSeats.coachSeatBn,
      fare: breakdown.fare,
      vat: breakdown.vat,
      serviceCharge: breakdown.serviceCharge,
    }));
  };

  const handleTotalSeatsChange = (rawCount: number) => {
    const seats = Math.max(1, Math.min(12, Math.floor(rawCount || 1)));
    const currentNames = ticket.passengerName.split(',').map(p => p.trim()).filter(Boolean);
    const leadName = currentNames[0] || ticket.passengerName.trim() || 'PASSENGER';
    const nextNames = [...currentNames];
    while (nextNames.length < seats) {
      nextNames.push(`CO-PASSENGER ${nextNames.length + 1}`);
    }
    if (nextNames.length > seats) {
      nextNames.length = seats;
    }
    if (nextNames.length === 0) nextNames.push(leadName);

    const nextRoles = [...coPassengerRoles];
    while (nextRoles.length < Math.max(0, seats - 1)) nextRoles.push('adult');
    nextRoles.length = Math.max(0, seats - 1);
    setCoPassengerRoles(nextRoles);

    const adults = 1 + nextRoles.filter(r => r === 'adult').length;
    const seniors = nextRoles.filter(r => r === 'senior').length;
    const children = nextRoles.filter(r => r === 'child').length;
    applySeatAndCategoryCounts(adults, seniors, children, nextNames);
  };

  const handleAddCoPassenger = () => {
    if (ticket.numSeats >= 4) return;
    handleTotalSeatsChange(ticket.numSeats + 1);
  };

  const handleRemoveCoPassenger = (coIdx: number) => {
    const fullIdx = coIdx + 1;
    const currentNames = [...passengerNamesList];
    if (currentNames.length > fullIdx) {
      currentNames.splice(fullIdx, 1);
    }
    const nextRoles = [...coPassengerRoles];
    if (nextRoles.length > coIdx) {
      nextRoles.splice(coIdx, 1);
    }
    setCoPassengerRoles(nextRoles);
    const adults = 1 + nextRoles.filter(r => r === 'adult').length;
    const seniors = nextRoles.filter(r => r === 'senior').length;
    const children = nextRoles.filter(r => r === 'child').length;
    applySeatAndCategoryCounts(adults, seniors, children, currentNames.filter(Boolean));
  };

  const handleCoPassengerNameChange = (fullIdx: number, val: string) => {
    const next = [...passengerNamesList];
    while (next.length <= fullIdx) next.push('');
    next[fullIdx] = val;
    setTicket(prev => ({ ...prev, passengerName: next.join(', ') }));
  };

  const handleCoPassengerRoleChange = (coIdx: number, role: 'adult' | 'senior' | 'child') => {
    const nextRoles = [...coPassengerRoles];
    while (nextRoles.length <= coIdx) nextRoles.push('adult');
    nextRoles[coIdx] = role;
    setCoPassengerRoles(nextRoles);
    const adults = 1 + nextRoles.filter(r => r === 'adult').length;
    const seniors = nextRoles.filter(r => r === 'senior').length;
    const children = nextRoles.filter(r => r === 'child').length;
    applySeatAndCategoryCounts(adults, seniors, children);
  };

  const handleSavePassengerProfile = () => {
    const leadName = (passengerNamesList[0] || ticket.passengerName).trim();
    if (!leadName) return;
    const profile: SavedPassengerProfile = {
      id: 'pax-' + Date.now(),
      name: leadName,
      idType: ticket.idType,
      idNumber: ticket.idNumber,
      mobileNumber: ticket.mobileNumber,
    };
    const next = [profile, ...savedPassengers.filter(p => p.name.toLowerCase() !== leadName.toLowerCase())].slice(0, 8);
    setSavedPassengers(next);
    try {
      localStorage.setItem('br_saved_passengers_v1', JSON.stringify(next));
    } catch {
      // ignore
    }
    setAiUpdatedNotice(`যাত্রী প্রোফাইল সেভ হয়েছে: ${leadName}`);
  };

  const handleApplyPassengerProfile = (profile: SavedPassengerProfile) => {
    const leadName = profile.name;
    const rest = passengerNamesList.slice(1);
    const combinedName = rest.length > 0 ? [leadName, ...rest].join(', ') : leadName;
    const bnType =
      profile.idType === 'NID'
        ? 'এন আই ডি'
        : profile.idType === 'Birth Certificate'
          ? 'জন্ম নিবন্ধন সনদ'
          : 'পাসপোর্ট';
    setRawPrivacyStore({
      idNumber: profile.idNumber.includes('*') ? '' : profile.idNumber,
      mobileNumber: profile.mobileNumber.includes('*') ? '' : profile.mobileNumber,
    });
    setTicket(prev => ({
      ...prev,
      passengerName: combinedName,
      idType: profile.idType,
      idTypeBn: bnType,
      idNumber: profile.idNumber,
      idNumberBn: toBanglaDigits(profile.idNumber),
      mobileNumber: profile.mobileNumber,
      mobileNumberBn: toBanglaDigits(profile.mobileNumber),
    }));
    setAiUpdatedNotice(`যাত্রীর তথ্য লোড হয়েছে: ${leadName}`);
  };

  const handleDeletePassengerProfile = (id: string) => {
    const next = savedPassengers.filter(p => p.id !== id);
    setSavedPassengers(next);
    try {
      localStorage.setItem('br_saved_passengers_v1', JSON.stringify(next));
    } catch {
      // ignore
    }
  };

  const isPrivacyMasked =
    ticket.idNumber.includes('*') || ticket.mobileNumber.includes('*');

  const handleTogglePrivacyMask = () => {
    if (!isPrivacyMasked) {
      setRawPrivacyStore({
        idNumber: ticket.idNumber,
        mobileNumber: ticket.mobileNumber,
      });
      const maskedId = maskOfficialNumber(ticket.idNumber, 3, 3);
      const maskedMob = maskOfficialNumber(ticket.mobileNumber, 3, 3);
      setTicket(prev => ({
        ...prev,
        idNumber: maskedId,
        idNumberBn: toBanglaDigits(maskedId),
        mobileNumber: maskedMob,
        mobileNumberBn: toBanglaDigits(maskedMob),
      }));
    } else if (rawPrivacyStore.idNumber || rawPrivacyStore.mobileNumber) {
      const nextId = rawPrivacyStore.idNumber || ticket.idNumber;
      const nextMob = rawPrivacyStore.mobileNumber || ticket.mobileNumber;
      setTicket(prev => ({
        ...prev,
        idNumber: nextId,
        idNumberBn: toBanglaDigits(nextId),
        mobileNumber: nextMob,
        mobileNumberBn: toBanglaDigits(nextMob),
      }));
    } else {
      setAiUpdatedNotice('আসল নম্বর আনমাস্ক করতে নিচে পূর্ণ NID ও মোবাইল লিখুন; পরে অটো টগল করতে পারবেন।');
    }
  };

  const handleSplitSecondPnrGroup = () => {
    saveCurrentTicket();
    const randomPnr =
      Math.random().toString(36).substring(2, 8).toUpperCase() +
      Math.floor(100000 + Math.random() * 900000);
    const nextSeats = generateSmartCoachSeats(ticket.className, 1, ticket.coachSeat);
    const unitFare = computeUnitSegmentFare(activeTrainRecord, ticket.fromStation, ticket.toStation, ticket.className);
    const breakdown = calculateTicketFareBreakdown(unitFare, ticket.className, 1, 0, 0);
    setCoPassengerRoles([]);
    setTicket(prev => ({
      ...prev,
      id: 'BR-' + Math.floor(100000 + Math.random() * 900000),
      pnrNumber: randomPnr,
      passengerName: 'PASSENGER 5',
      numSeats: 1,
      numAdults: 1,
      numSeniors: 0,
      numChildren: 0,
      coachSeat: nextSeats.coachSeat,
      coachSeatBn: nextSeats.coachSeatBn,
      fare: breakdown.fare,
      vat: breakdown.vat,
      serviceCharge: breakdown.serviceCharge,
      createdAt: new Date().toISOString(),
    }));
    setAiUpdatedNotice(`প্রথম ৪ আসনের টিকিট সেভ হয়েছে! এখন ২য় PNR (${randomPnr}) দিয়ে বাকি যাত্রীদের টিকিট তৈরি করুন।`);
  };

  // Generate QR Code containing official verification URL / payload
  useEffect(() => {
    const qrPayload = JSON.stringify({
      pnr: ticket.pnrNumber,
      passenger: ticket.passengerName,
      train: `${ticket.trainName} [${ticket.trainNumber}]`,
      from: ticket.fromStation,
      to: ticket.toStation,
      date: `${ticket.journeyDate} ${ticket.journeyTime}`,
      seat: ticket.coachSeat,
      fare: ticket.fare,
    });

    QRCode.toDataURL(qrPayload, {
      width: 140,
      margin: 0,
      color: { dark: '#000000', light: '#ffffff' }
    }).then(setQrDataUrl).catch(console.error);
  }, [ticket.pnrNumber, ticket.passengerName, ticket.trainName, ticket.trainNumber, ticket.fromStation, ticket.toStation, ticket.journeyDate, ticket.journeyTime, ticket.coachSeat, ticket.fare]);

  // Calculations
  const isBeddingClass = ticket.className === 'AC_B' || ticket.className === 'F_BERTH';
  const beddingCharge = isBeddingClass ? 50 * ticket.numSeats : 0;
  const totalFare = ticket.fare + ticket.vat + ticket.serviceCharge + beddingCharge;

  // Format date helper
  const formatDateEn = (dateStr: string, timeStr: string) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    const formatted = parts.length === 3 ? `${parts[2]}-${parts[1]}-${parts[0]}` : dateStr;
    return `${formatted} ${timeStr || '00:00'}`;
  };

  const formatDateBn = (dateStr: string, timeStr: string) => {
    const en = formatDateEn(dateStr, timeStr);
    return toBanglaDigits(en);
  };

  // Save current ticket
  const saveCurrentTicket = () => {
    const updated = [ticket, ...savedTickets.filter(t => t.id !== ticket.id)];
    setSavedTickets(updated);
    localStorage.setItem('personal_railway_tickets_db', JSON.stringify(updated));

    // Save to unified local document history
    saveDocumentHistory({
      service: 'ticket',
      title: `${ticket.trainName} [${ticket.trainNumber}]`,
      subtitle: `${ticket.fromStation} ➔ ${ticket.toStation} | ${ticket.passengerName} (${ticket.coachSeat})`,
      badge: ticket.pnrNumber,
      data: ticket,
    });

    setAiUpdatedNotice('বাংলাদেশ রেলওয়ে টিকিট ড্রাফট ও হিস্টোরিতে সংরক্ষিত হয়েছে!');
  };

  const handleWhatsAppShare = () => {
    const totalWithCharges = ticket.fare + (ticket.serviceCharge || 20) + (ticket.vat || 0);
    openWhatsAppTicket(ticket.mobileNumber, {
      pnrNumber: ticket.pnrNumber,
      passengerName: ticket.passengerName,
      trainName: ticket.trainName,
      trainNumber: ticket.trainNumber,
      fromStation: ticket.fromStation,
      toStation: ticket.toStation,
      journeyDate: ticket.journeyDate,
      journeyTime: ticket.journeyTime,
      className: ticket.className,
      coachSeat: ticket.coachSeat,
      noOfSeats: ticket.numSeats,
      totalFare: totalWithCharges,
      mobileNumber: ticket.mobileNumber,
    });
  };

  const createNewTicket = () => {
    const newId = 'BR-' + Math.floor(100000 + Math.random() * 900000);
    const randomPnr = Math.random().toString(36).substring(2, 8).toUpperCase() + Math.floor(100000 + Math.random() * 900000);
    setTicket({
      ...DEFAULT_BR_TICKET,
      id: newId,
      pnrNumber: randomPnr,
      createdAt: new Date().toISOString(),
    });
  };

  const generateRandomPnr = () => {
    const randomPnr = Math.random().toString(36).substring(2, 8).toUpperCase() + Math.floor(100000 + Math.random() * 900000);
    setTicket(prev => ({ ...prev, pnrNumber: randomPnr }));
  };

  const deleteTicket = (id: string) => {
    const filtered = savedTickets.filter(t => t.id !== id);
    setSavedTickets(filtered);
    localStorage.setItem('personal_railway_tickets_db', JSON.stringify(filtered));
  };

  const handleSwitchRoundTripLeg = (targetLeg: 'outbound' | 'return') => {
    if (!roundTripPair || roundTripPair.activeLeg === targetLeg) return;
    const updatedPair = {
      outbound: roundTripPair.activeLeg === 'outbound' ? ticket : roundTripPair.outbound,
      returnTicket: roundTripPair.activeLeg === 'return' ? ticket : roundTripPair.returnTicket,
      activeLeg: targetLeg,
    };
    const nextTicket = targetLeg === 'outbound' ? updatedPair.outbound : updatedPair.returnTicket;
    setRoundTripPair(updatedPair);
    setTicket(nextTicket);
    setOverriddenConflictKey('');
    setSavedTickets(prevSaved => {
      const hasTicket = prevSaved.some(s => s.id === ticket.id);
      const nextSaved = hasTicket
        ? prevSaved.map(s => (s.id === ticket.id ? ticket : s))
        : prevSaved;
      localStorage.setItem('personal_railway_tickets_db', JSON.stringify(nextSaved));
      return nextSaved;
    });
  };

  const handleAiGenerate = async (promptText: string): Promise<string> => {
    const result = await generateTicketAi(promptText, ticket);
    setTicket(result.ticket);

    if (result.returnTicket) {
      const returnTkt = result.returnTicket;
      setRoundTripPair({
        outbound: result.ticket,
        returnTicket: returnTkt,
        activeLeg: 'outbound',
      });
      // Save both Outbound & Return tickets to Saved Tickets & Document History
      const deduped = savedTickets.filter(
        t => t.id !== result.ticket.id && t.id !== returnTkt.id
      );
      const nextSaved = [result.ticket, returnTkt, ...deduped];
      setSavedTickets(nextSaved);
      localStorage.setItem('personal_railway_tickets_db', JSON.stringify(nextSaved));

      saveDocumentHistory({
        service: 'ticket',
        title: `${returnTkt.trainName} [${returnTkt.trainNumber}] (Return)`,
        subtitle: `${returnTkt.fromStation} ➔ ${returnTkt.toStation} | ${returnTkt.passengerName} (${returnTkt.coachSeat})`,
        badge: returnTkt.pnrNumber,
        data: returnTkt,
      });
      saveDocumentHistory({
        service: 'ticket',
        title: `${result.ticket.trainName} [${result.ticket.trainNumber}] (Outbound)`,
        subtitle: `${result.ticket.fromStation} ➔ ${result.ticket.toStation} | ${result.ticket.passengerName} (${result.ticket.coachSeat})`,
        badge: result.ticket.pnrNumber,
        data: result.ticket,
      });

      setAiUpdatedNotice(
        `রাউন্ড-ট্রিপ তৈরি সম্পন্ন! যাওয়া: ${result.ticket.trainName} [${result.ticket.trainNumber}] (${result.ticket.journeyDate}) এবং ফেরা: ${returnTkt.trainName} [${returnTkt.trainNumber}] (${returnTkt.journeyDate}) — উভয় টিকিট সেভ করা হয়েছে।`
      );
    } else {
      setRoundTripPair(null);
      saveDocumentHistory({
        service: 'ticket',
        title: `${result.ticket.trainName} [${result.ticket.trainNumber}]`,
        subtitle: `${result.ticket.fromStation} ➔ ${result.ticket.toStation} | ${result.ticket.passengerName} (${result.ticket.coachSeat})`,
        badge: result.ticket.pnrNumber,
        data: result.ticket,
      });

      setAiUpdatedNotice(
        `AI আপডেট সম্পন্ন! ট্রেন: ${result.ticket.trainName} [${result.ticket.trainNumber}], রুট: ${result.ticket.fromStation} → ${result.ticket.toStation}, সিট: ${result.ticket.coachSeat}। নিচের ফর্মের সব সেটিংস ও লাইভ টিকিট স্বয়ংক্রিয়ভাবে আপডেট করা হয়েছে।`
      );
    }

    // Show actionable warning popup for route mismatch or off-day
    if (result.warnings && result.warnings.length > 0) {
      const routeWarn = result.warnings.find(w => w.type === 'route_mismatch');
      if (routeWarn) {
        const validation = validateTrainRouteSelection(
          result.ticket.trainName,
          result.ticket.trainNumber,
          result.ticket.fromStation,
          result.ticket.toStation
        );
        setRouteConflictModal({
          trainName: result.ticket.trainName,
          trainNumber: result.ticket.trainNumber,
          fromStation: result.ticket.fromStation,
          toStation: result.ticket.toStation,
          reasonBn: routeWarn.messageBn,
          reasonEn: routeWarn.message,
          validTrains: validation.validTrains,
        });
      } else {
        const warn = result.warnings[0];
        setAiWarningPopup({
          title: warn.type === 'off_day' ? '⚠️ ছুটির দিন সতর্কতা!' : '⚠️ রুট সমস্যা!',
          messageBn: warn.messageBn,
          messageEn: warn.message,
        });
      }
    }

    return result.summary;
  };
  // Auto-run if redirected from Home Central AI Hub
  useEffect(() => {
    try {
      const pending = sessionStorage.getItem('pending_ai_prompt');
      if (pending) {
        sessionStorage.removeItem('pending_ai_prompt');
        Promise.resolve().then(() => handleAiGenerate(pending));
      }
    } catch {
      // ignore
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const prepareTicketCloneForCanvas = (clonedDoc: Document) => {
    const fixStyle = clonedDoc.createElement('style');
    fixStyle.textContent = `
      .railway-ticket-page td .td-c { padding: 0.5px 6px 5.5px 6px !important; line-height: 12px !important; }
      .railway-ticket-page .note-row td .td-c { padding: 1.5px 6px 5.5px 6px !important; line-height: 9.5px !important; }
      .railway-ticket-page .bar { padding: 0 7px 5px 7px !important; }
      .railway-ticket-page .banner1 { padding: 0 12px 7px 12px !important; }
      .railway-ticket-page .banner2 { padding: 0 8px 6px 8px !important; }
    `;
    clonedDoc.head.appendChild(fixStyle);

    const clonedPage = clonedDoc.getElementById('page');
    if (clonedPage) {
      const parent = clonedPage.parentElement;
      if (parent) {
        parent.style.width = '793.7px';
        parent.style.height = '1122.5px';
        parent.style.overflow = 'visible';
        parent.style.boxShadow = 'none';
      }
      clonedPage.style.transform = 'none';
      clonedPage.style.position = 'relative';
      clonedPage.style.top = '0';
      clonedPage.style.left = '0';
      clonedPage.style.width = '793.7px';
      clonedPage.style.height = '1122.5px';
      clonedPage.style.margin = '0';
      clonedPage.style.paddingTop = '61.7px';
      clonedPage.style.boxSizing = 'border-box';
    }
  };

  // Capture 1:1 DOM Snapshot using native browser SVG foreignObject (modern-screenshot),
  // with safe html2canvas fallback if browser SVG foreignObject rendering fails.
  const captureTicketCanvas = async (el: HTMLElement): Promise<HTMLCanvasElement> => {
    if (document.fonts) {
      await document.fonts.ready;
    }

    // Ensure logo & QR images are fully decoded before snapshotting
    const imgs = Array.from(el.querySelectorAll('img'));
    await Promise.all(
      imgs.map((img) =>
        img.complete
          ? img.decode?.().catch(() => undefined)
          : new Promise<void>((resolve) => {
              img.addEventListener('load', () => resolve(), { once: true });
              img.addEventListener('error', () => resolve(), { once: true });
            })
      )
    );

    try {
      const inlineFontsCss = await loadInlineFontsCss();
      const canvas = await domToCanvas(el, {
        scale: 3,
        width: 794,
        height: 1123,
        backgroundColor: '#ffffff',
        drawImageInterval: 50,
        style: {
          transform: 'none',
          transformOrigin: 'top left',
          position: 'relative',
          top: '0',
          left: '0',
          margin: '0',
          width: '793.7px',
          height: '1122.5px',
          paddingTop: el.classList.contains('compact-pax') ? '32px' : '61.7px',
          boxSizing: 'border-box',
        },
        font: inlineFontsCss ? { cssText: inlineFontsCss } : undefined,
      });

      if (canvas && canvas.width > 0 && canvas.height > 0) {
        return canvas;
      }
      throw new Error('Empty canvas returned from domToCanvas');
    } catch (primaryErr) {
      console.warn('domToCanvas capture failed, falling back to html2canvas:', primaryErr);
      return html2canvas(el, {
        scale: 3,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
        scrollX: 0,
        scrollY: 0,
        width: 794,
        height: 1123,
        windowWidth: 794,
        windowHeight: 1123,
        onclone: prepareTicketCloneForCanvas,
      });
    }
  };

  // Download High-Resolution A4 PDF with exact Shohoz BD Railway filename pattern
  const handleDownloadPdf = async () => {
    if (!ticketRef.current) return;
    setIsGeneratingPdf(true);
    try {
      const canvas = await captureTicketCanvas(ticketRef.current);
      const imgData = canvas.toDataURL('image/jpeg', 0.97);
      const pdf = new jsPDF({
        orientation: 'p',
        unit: 'pt',
        format: 'a4',
        compress: true,
      });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
      const fileName = generateOfficialTicketFileName('pdf', ticket.pnrNumber);
      pdf.save(fileName);
      setAiUpdatedNotice(`PDF ডাউনলোড সম্পন্ন হয়েছে: ${fileName}`);
    } catch (err) {
      console.error('Failed to export PDF:', err);
      setAiUpdatedNotice('PDF তৈরি করতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Download High-Resolution JPG Image
  const handleDownloadJpg = async () => {
    if (!ticketRef.current) return;
    setIsGeneratingJpg(true);
    try {
      const canvas = await captureTicketCanvas(ticketRef.current);
      const imgData = canvas.toDataURL('image/jpeg', 0.97);
      const fileName = generateOfficialTicketFileName('jpg', ticket.pnrNumber);
      const link = document.createElement('a');
      link.download = fileName;
      link.href = imgData;
      link.click();
      setAiUpdatedNotice(`JPG ইমেজ ডাউনলোড সম্পন্ন হয়েছে: ${fileName}`);
    } catch (err) {
      console.error('Failed to export JPG:', err);
      setAiUpdatedNotice('JPG তৈরি করতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।');
    } finally {
      setIsGeneratingJpg(false);
    }
  };

  // Generate self-contained standalone HTML matching official BDRAILWAY_TICKET (with Base64 offline fonts)
  const getStandaloneTicketHtml = async (): Promise<string> => {
    if (!ticketRef.current) return '';
    let inner = ticketRef.current.innerHTML;
    try {
      const logoEl = ticketRef.current.querySelector('img.logo') as HTMLImageElement | null;
      if (logoEl && logoEl.complete && logoEl.naturalWidth > 0) {
        const c = document.createElement('canvas');
        c.width = logoEl.naturalWidth;
        c.height = logoEl.naturalHeight;
        const ctx = c.getContext('2d');
        if (ctx) {
          ctx.drawImage(logoEl, 0, 0);
          const dataUri = c.toDataURL('image/png');
          inner = inner.replaceAll('src="/20428_4-78474535-icon.png"', `src="${dataUri}"`);
        }
      }
      if (inner.includes('/20428_4-78474535-icon.png')) {
        const resp = await fetch('/20428_4-78474535-icon.png', { cache: 'force-cache' });
        if (resp.ok) {
          const blob = await resp.blob();
          const dataUri = await new Promise<string>((resolve) => {
            const r = new FileReader();
            r.onloadend = () => resolve(typeof r.result === 'string' ? r.result : '');
            r.readAsDataURL(blob);
          });
          if (dataUri) inner = inner.replaceAll('src="/20428_4-78474535-icon.png"', `src="${dataUri}"`);
        }
      }
    } catch {
      // keep existing src if tainted
    }

    const inlineFontsCss = await loadInlineFontsCss();

    return `<!DOCTYPE html>
<html lang="bn">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Bangladesh Railway e-Ticket - ${ticket.pnrNumber}</title>
<link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&family=Noto+Sans+Bengali:wght@400;500;700&display=swap" rel="stylesheet">
<style>
  ${inlineFontsCss}
  @page { size: A4; margin: 0; }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { background: #ffffff; }
  body { font-family: Roboto, 'Helvetica Neue', Arial, sans-serif; color: #333333; }
  .bn { font-family: 'Noto Sans Bengali', 'SolaimanLipi', 'Kalpurush', sans-serif; }
  .page { width: 210mm; min-height: 297mm; margin: 0 auto; background: #ffffff; padding-top: 61.7px; }
  .frame { margin: 0 56.96px 0 56.96px; border: 4.5px solid #039d48; padding: 15.1px; min-height: 979.6px; position: relative; }
  .hdr { position: relative; height: 64.9px; }
  .logo { position: absolute; top: 1.6px; left: 7.7px; width: 44.2px; height: 57.9px; object-fit: contain; }
  .titlewrap { position: absolute; left: 0; width: 100%; top: 0; text-align: center; }
  .title-en { color: #1f7ec7; font-size: 21px; line-height: 22px; font-weight: 700; letter-spacing: -0.75px; position: absolute; top: 10.5px; width: 100%; }
  .title-bn { color: #1f7ec7; font-size: 21px; line-height: 21px; font-weight: 500; position: absolute; top: 34.8px; width: 100%; }
  .hdr-right { position: absolute; top: 0; right: 0; width: 84px; height: 146px; }
  .powered { color: #333; font-size: 8.3px; line-height: 10px; font-weight: 700; position: absolute; top: 3px; left: 0; white-space: nowrap; }
  .jv { color: #05b454; font-weight: 700; font-size: 11px; line-height: 11px; position: absolute; top: 15px; left: 0; white-space: nowrap; }
  .jv .big { font-size: 15px; line-height: 1; vertical-align: -1px; letter-spacing: -0.4px; }
  .qr { position: absolute; top: 61px; left: 0; width: 80px; height: 80px; display: block; }
  .intro { margin-top: 2.8px; font-size: 7.3pt; letter-spacing: -0.08px; line-height: 11.84px; color: #333; padding-right: 88px; }
  .intro-bn { margin-top: 10.9px; width: 100%; font-size: 6.75pt; letter-spacing: -0.05px; line-height: 11.84px; padding-right: 88px; }
  .bar { background: #039d48; color: #ffffff; font-size: 10.5pt; font-weight: 700; height: 29.4px; display: flex; align-items: center; padding: 0 7px 1px 7px; margin-top: 8.4px; line-height: 1.2; }
  table.outer + .bar { margin-top: 18px; }
  table { width: 100%; border-collapse: separate; border-spacing: 0; table-layout: fixed; font-size: 8pt; }
  td { border: none; border-top: 1px solid #c7c7c7; border-left: 1px solid #c7c7c7; padding: 0; vertical-align: middle; height: auto; }
  td:first-child { width: 320.3px; border-left: none; }
  td.b { font-weight: 700; }
  td .td-c { display: block; padding: 2.5px 6px 3px 6px; line-height: 12.5px; width: 100%; }
  table.outer { border: 1.3px solid #039d48; }
  table.outer tr:first-child td { border-top: none; }
  .note-row td { height: auto; }
  .note-row td .td-c { font-size: 5.7pt; line-height: 9.5px; padding: 2.5px 6px 4px 6px; }
  .pleasenote { margin-top: 7px; font-size: 8pt; }
  .pn-cols { display: flex; }
  .pn-en { width: 315px; flex: none; padding-right: 8px; }
  .pn-bn { flex: 1; }
  .pn-head { line-height: 11px; font-weight: 700; }
  .pn-en div.it { margin-top: 12px; font-size: 8pt; line-height: 14px; }
  .pn-bn div.it { margin-top: 12px; font-size: 8pt; line-height: 14px; }
  .banner1 { background: #e8f5e9; color: #e65100; font-weight: 700; text-align: center; font-size: 11.5pt; line-height: 19px; height: 51.5px; margin-top: 9px; display: flex; align-items: center; justify-content: center; padding: 2px 12px; }
  .banner2 { background: #fbe8d3; color: #b71c1c; font-weight: 700; text-align: center; font-size: 11.5pt; line-height: 16px; height: 36.8px; margin-top: 9.5px; display: flex; align-items: center; justify-content: center; padding: 2px 8px; }
  .footer { display: flex; margin-top: 14.9px; }
  .f-en { width: 50%; font-size: 9pt; line-height: 14px; }
  .f-en .big { font-size: 11pt; font-weight: 700; }
  .f-bn { width: 50%; font-size: 9pt; line-height: 14px; }
  .f-bn .big { font-size: 11pt; font-weight: 700; }
  .page.compact-pax { padding-top: 32px; }
  .page.compact-pax .frame { padding: 11px 15.1px; }
  .page.compact-pax td .td-c { padding: 1.5px 6px 2px 6px; line-height: 11.2px; }
  .page.compact-pax table.outer + .bar { margin-top: 10px; }
  .page.compact-pax .bar { height: 25px; margin-top: 6px; }
  .page.compact-pax .pn-en div.it, .page.compact-pax .pn-bn div.it { margin-top: 6px; line-height: 12.5px; }
  .page.compact-pax .banner1 { height: 44px; margin-top: 6px; font-size: 10.5pt; line-height: 16px; }
  .page.compact-pax .banner2 { height: 32px; margin-top: 6px; font-size: 10.5pt; line-height: 14px; }
  .page.compact-pax .footer { margin-top: 10px; }
</style>
</head>
<body>
<div class="page${isCompactMultiPax ? ' compact-pax' : ''}" id="page">
${inner.replace(/<style>[\s\S]*?<\/style>/i, '')}
</div>
</body>
</html>`;
  };

  // Copy HTML to clipboard
  const handleCopyHtml = async () => {
    try {
      const html = await getStandaloneTicketHtml();
      if (!html) return;
      await navigator.clipboard.writeText(html);
      setCopiedHtml(true);
      setTimeout(() => setCopiedHtml(false), 2500);
      setAiUpdatedNotice('অফলাইন ফন্টসহ টিকেটের অফিসিয়াল HTML কোড ক্লিপবোর্ডে কপি করা হয়েছে!');
    } catch (err) {
      console.error('Failed to copy HTML:', err);
      setAiUpdatedNotice('HTML কপি করতে সমস্যা হয়েছে।');
    }
  };

  // Download standalone HTML file
  const handleDownloadHtml = async () => {
    try {
      const html = await getStandaloneTicketHtml();
      if (!html) return;
      const fileName = generateOfficialTicketFileName('html', ticket.pnrNumber);
      const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      setAiUpdatedNotice(`অফিসিয়াল HTML ফাইল ডাউনলোড সম্পন্ন হয়েছে: ${fileName}`);
    } catch (err) {
      console.error('Failed to download HTML:', err);
      setAiUpdatedNotice('HTML ফাইল ডাউনলোড করতে সমস্যা হয়েছে।');
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      background: '#090d16',
      color: '#f8fafc',
      overflow: 'hidden',
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      {/* ─── Route Conflict Warning Modal (Train vs Station Mismatch) ─── */}
      {routeConflictModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="route-conflict-title"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            background: 'rgba(2, 6, 23, 0.84)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
          }}
        >
          <div style={{
            background: '#0f172a',
            borderRadius: 12,
            padding: 24,
            maxWidth: 520,
            width: '100%',
            border: '1px solid rgba(220, 38, 38, 0.55)',
            boxShadow: '0 24px 64px rgba(0,0,0,0.72)',
            maxHeight: '90vh',
            overflowY: 'auto',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <div style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                background: 'rgba(220, 38, 38, 0.16)',
                border: '1px solid rgba(220, 38, 38, 0.35)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                <AlertTriangle size={18} color="#f87171" />
              </div>
              <div>
                <h2
                  id="route-conflict-title"
                  style={{ fontSize: 16, fontWeight: 800, color: '#fca5a5', margin: 0 }}
                >
                  রুট সতর্কতা: ট্রেনটি এই রুটে চলে না
                </h2>
                <div style={{ fontSize: 12, color: '#94a3b8', fontVariantNumeric: 'tabular-nums' }}>
                  {routeConflictModal.trainName} [{routeConflictModal.trainNumber}] · {routeConflictModal.fromStation} ➔ {routeConflictModal.toStation}
                </div>
              </div>
            </div>

            <p style={{
              fontSize: 13.5,
              color: '#f1f5f9',
              lineHeight: 1.6,
              margin: '0 0 6px 0',
              fontFamily: "'Noto Sans Bengali', sans-serif",
            }}>
              {routeConflictModal.reasonBn}
            </p>
            <p style={{ fontSize: 11.5, color: '#94a3b8', lineHeight: 1.45, margin: '0 0 16px 0' }}>
              {routeConflictModal.reasonEn}
            </p>

            {routeConflictModal.validTrains.length > 0 ? (
              <div style={{ marginBottom: 18 }}>
                <div style={{ fontSize: 11.5, fontWeight: 700, color: '#34d399', marginBottom: 8 }}>
                  {routeConflictModal.fromStation} ➔ {routeConflictModal.toStation} রুটের সঠিক ট্রেন বাছুন:
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 6, maxHeight: 210, overflowY: 'auto' }}>
                  {routeConflictModal.validTrains.map(vt => {
                    const seg = estimateSegmentSchedule(vt, routeConflictModal.fromStation, routeConflictModal.toStation, ticket.className);
                    const offStatus = isTrainOffDayOnDate(vt.offDay, ticket.journeyDate);
                    return (
                      <button
                        key={vt.number + '-' + vt.name}
                        type="button"
                        onClick={() => {
                          setRouteConflictModal(null);
                          applyTrainSelection(vt, {
                            fromStationOverride: routeConflictModal.fromStation,
                            toStationOverride: routeConflictModal.toStation,
                            bypassConflictCheck: true,
                          });
                          setAiUpdatedNotice(`সঠিক ট্রেন সেট করা হয়েছে: ${vt.name} [${vt.number}] (${seg.boardingTime})`);
                        }}
                        style={{
                          width: '100%',
                          padding: '9px 12px',
                          background: '#131e32',
                          border: '1px solid #1e293b',
                          borderRadius: 8,
                          color: '#f8fafc',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: 8,
                          cursor: 'pointer',
                          textAlign: 'left',
                          fontVariantNumeric: 'tabular-nums',
                        }}
                      >
                        <span style={{ minWidth: 0 }}>
                          <span style={{ fontSize: 12.5, fontWeight: 700, color: '#f8fafc', display: 'block' }}>
                            {vt.name} [{vt.number}]
                          </span>
                          <span style={{ fontSize: 11, color: '#94a3b8' }}>
                            {seg.boardingTime} → {seg.alightingTime} ({seg.durationLabel})
                            {vt.offDay && vt.offDay !== 'None' ? ` · Off: ${vt.offDay}` : ''}
                            {offStatus.isOffDay ? ' · ⚠️ এই তারিখে বন্ধ' : ''}
                          </span>
                        </span>
                        <span style={{ fontSize: 12, fontWeight: 700, color: '#34d399', flexShrink: 0, whiteSpace: 'nowrap' }}>
                          ৳{seg.segmentFare}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div style={{
                padding: '10px 12px',
                background: '#131e32',
                border: '1px solid #1e293b',
                borderRadius: 8,
                fontSize: 12,
                color: '#cbd5e1',
                marginBottom: 16,
              }}>
                এই দুটি স্টেশনের মধ্যে সরাসরি আন্তঃনগর ট্রেন পাওয়া যায়নি। চাইলে কাস্টম টিকিট হিসেবে অনুমোদন করতে পারেন অথবা স্টেশন পরিবর্তন করতে পারেন।
              </div>
            )}

            {(() => {
              const officialMatch =
                RAILWAY_TRAINS.find(
                  t => t.number === routeConflictModal.trainNumber && t.name === routeConflictModal.trainName
                ) || RAILWAY_TRAINS.find(t => t.number === routeConflictModal.trainNumber);
              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {officialMatch && (
                    <button
                      type="button"
                      data-testid="switch-to-train-route-btn"
                      onClick={() => {
                        setRouteConflictModal(null);
                        setOverriddenConflictKey('');
                        applyTrainSelection(officialMatch, {
                          fromStationOverride: officialMatch.fromStation,
                          toStationOverride: officialMatch.toStation,
                          bypassConflictCheck: true,
                        });
                        setAiUpdatedNotice(
                          `রুট আপডেট করা হয়েছে: "${officialMatch.name} [${officialMatch.number}]" এর আসল রুট (${officialMatch.fromStation} ➔ ${officialMatch.toStation})।`
                        );
                      }}
                      style={{
                        width: '100%',
                        minHeight: 40,
                        padding: '8px 14px',
                        background: 'rgba(16, 185, 129, 0.14)',
                        border: '1px solid #10b981',
                        color: '#34d399',
                        borderRadius: 8,
                        fontSize: 12.5,
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      এই ট্রেনের আসল রুটে সুইচ করুন ({officialMatch.fromStation} ➔ {officialMatch.toStation})
                    </button>
                  )}

                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      onClick={() => {
                        const conflictKey = buildMismatchKey(
                          routeConflictModal.trainName,
                          routeConflictModal.trainNumber,
                          routeConflictModal.fromStation,
                          routeConflictModal.toStation
                        );
                        setOverriddenConflictKey(conflictKey);
                        setRouteConflictModal(null);
                        if (officialMatch) {
                          applyTrainSelection(officialMatch, {
                            fromStationOverride: routeConflictModal.fromStation,
                            toStationOverride: routeConflictModal.toStation,
                            bypassConflictCheck: true,
                          });
                        }
                        setAiUpdatedNotice(`ম্যানুয়াল অনুমোদন: "${routeConflictModal.trainName}" কাস্টম রুটে ব্যবহার করা হচ্ছে।`);
                      }}
                      style={{
                        flex: 1,
                        minHeight: 40,
                        padding: '8px 14px',
                        background: '#1e293b',
                        border: '1px solid #334155',
                        color: '#f1f5f9',
                        borderRadius: 8,
                        fontSize: 12.5,
                        fontWeight: 600,
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      তবুও ব্যবহার করুন (Allow Anyway)
                    </button>
                    <button
                      type="button"
                      onClick={() => setRouteConflictModal(null)}
                      style={{
                        flex: 1,
                        minHeight: 40,
                        padding: '8px 14px',
                        background: '#dc2626',
                        border: 'none',
                        color: '#fff',
                        borderRadius: 8,
                        fontSize: 12.5,
                        fontWeight: 700,
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      রুট পরিবর্তন করুন
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* ─── AI Warning Popup Modal (Off-Day Alert) ──────────────────────────────── */}
      {aiWarningPopup && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: 'rgba(0,0,0,0.80)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 16,
        }}>
          <div style={{
            background: '#1e293b', borderRadius: 14, padding: 28,
            maxWidth: 480, width: '100%',
            border: '2px solid #f59e0b',
            boxShadow: '0 20px 60px rgba(0,0,0,0.7)',
          }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#fbbf24', marginBottom: 14 }}>
              {aiWarningPopup.title}
            </div>
            <div style={{ fontSize: 15, color: '#e2e8f0', lineHeight: 1.7, marginBottom: 10, fontFamily: "'Noto Sans Bengali', sans-serif" }}>
              {aiWarningPopup.messageBn}
            </div>
            <div style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.5, marginBottom: 22 }}>
              {aiWarningPopup.messageEn}
            </div>
            <button
              onClick={() => setAiWarningPopup(null)}
              style={{
                background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                color: '#000', border: 'none', borderRadius: 8,
                padding: '11px 24px', fontWeight: 700, fontSize: 15, cursor: 'pointer',
                width: '100%',
              }}
            >
              বুঝেছি, ঠিক আছে (OK)
            </button>
          </div>
        </div>
      )}
      {/* ─── Top Control Header ────────────────────────────────────────── */}
      <div style={{
        padding: isMobile ? '8px 12px' : '12px 20px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: '#0f172a',
        flexShrink: 0,
        boxSizing: 'border-box'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 8 : 12 }}>
          <div style={{
            width: isMobile ? 32 : 38,
            height: isMobile ? 32 : 38,
            borderRadius: isMobile ? 8 : 10,
            background: 'linear-gradient(135deg, #039d48 0%, #05b454 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            boxShadow: '0 4px 12px rgba(3, 157, 72, 0.35)',
            flexShrink: 0
          }}>
            <Train size={isMobile ? 18 : 22} />
          </div>
          <div>
            <h1 style={{ fontSize: isMobile ? 14 : 17, fontWeight: 700, margin: 0, whiteSpace: 'nowrap' }}>
              Railway Ticket Maker
            </h1>
            {!isMobile && (
              <p style={{ fontSize: 11, color: '#94a3b8', margin: 0 }}>
                100% Exact Official Template with Pixel-to-Pixel Alignment & Automated Schedule
              </p>
            )}
          </div>
        </div>

        {/* Desktop Buttons */}
        {!isMobile ? (
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button
              onClick={createNewTicket}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
                color: '#f1f5f9', padding: '7px 12px', borderRadius: 8, fontSize: 12, cursor: 'pointer'
              }}
            >
              <Plus size={15} /> New
            </button>
            <button
              onClick={saveCurrentTicket}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
                color: '#f1f5f9', padding: '7px 12px', borderRadius: 8, fontSize: 12, cursor: 'pointer'
              }}
            >
              <CheckCircle2 size={15} /> Save
            </button>
            <button
              onClick={handleWhatsAppShare}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                background: 'rgba(37, 211, 102, 0.15)', border: '1px solid rgba(37, 211, 102, 0.4)',
                color: '#25d366', padding: '7px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer'
              }}
              title="যাত্রীকে হোয়াটসঅ্যাপে টিকিট পাঠান"
            >
              <MessageCircle size={15} /> WhatsApp
            </button>
            <button
              onClick={() => setHistoryOpen(true)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                background: 'rgba(59, 130, 246, 0.12)', border: '1px solid rgba(59, 130, 246, 0.3)',
                color: '#93c5fd', padding: '7px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer'
              }}
              title="সংরক্ষিত টিকিট ইতিহাস"
            >
              <Clock size={15} /> History
            </button>
            <button
              onClick={() => window.print()}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
                color: '#f1f5f9', padding: '7px 12px', borderRadius: 8, fontSize: 12, cursor: 'pointer'
              }}
            >
              <Printer size={15} /> Print
            </button>
            <button
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                background: 'linear-gradient(135deg, #039d48 0%, #05b454 100%)',
                color: '#fff', border: 'none', padding: '7px 14px', borderRadius: 8,
                fontSize: 12, fontWeight: 700, cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(3, 157, 72, 0.4)'
              }}
              title="Official PDF Download"
            >
              <Download size={15} /> {isGeneratingPdf ? 'Generating...' : 'PDF Download'}
            </button>
            <button
              onClick={handleDownloadJpg}
              disabled={isGeneratingJpg}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                background: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)',
                color: '#fff', border: 'none', padding: '7px 14px', borderRadius: 8,
                fontSize: 12, fontWeight: 700, cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(37, 99, 235, 0.4)'
              }}
              title="Official High-Resolution JPG Download"
            >
              <ImageIcon size={15} /> {isGeneratingJpg ? 'Processing...' : 'JPG Download'}
            </button>
            <button
              onClick={handleCopyHtml}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                background: copiedHtml ? 'rgba(34, 197, 94, 0.2)' : 'rgba(255,255,255,0.06)',
                border: copiedHtml ? '1px solid #22c55e' : '1px solid rgba(255,255,255,0.15)',
                color: copiedHtml ? '#4ade80' : '#f1f5f9',
                padding: '7px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              title="Copy Standalone Official HTML to Clipboard"
            >
              {copiedHtml ? <Check size={15} /> : <Copy size={15} />}
              {copiedHtml ? 'HTML Copied!' : 'Copy HTML'}
            </button>
            <button
              onClick={handleDownloadHtml}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
                border: 'none',
                color: '#fff',
                padding: '7px 12px', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(124, 58, 237, 0.35)'
              }}
              title="Official Standalone HTML File Download (100% Offline Fonts)"
            >
              <FileCode size={15} /> Download HTML
            </button>
          </div>
        ) : (
          /* Mobile Top Bar Segmented Switcher & Quick New */
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <button
              onClick={createNewTicket}
              style={{
                background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
                color: '#f1f5f9', padding: '5px 8px', borderRadius: 6, fontSize: 11, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 4
              }}
              title="New Ticket"
            >
              <Plus size={13} /> New
            </button>
            <button
              onClick={handleWhatsAppShare}
              style={{
                background: 'rgba(37, 211, 102, 0.15)', border: '1px solid rgba(37, 211, 102, 0.4)',
                color: '#25d366', padding: '5px 8px', borderRadius: 6, fontSize: 11, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 3
              }}
              title="WhatsApp"
            >
              <MessageCircle size={13} />
            </button>
            <button
              onClick={() => setHistoryOpen(true)}
              style={{
                background: 'rgba(59, 130, 246, 0.12)', border: '1px solid rgba(59, 130, 246, 0.3)',
                color: '#93c5fd', padding: '5px 8px', borderRadius: 6, fontSize: 11, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 3
              }}
              title="History"
            >
              <Clock size={13} />
            </button>
            <div style={{ display: 'flex', background: '#1e293b', borderRadius: 6, padding: 2, gap: 2 }}>
              <button
                onClick={() => setMobileTab('editor')}
                style={{
                  background: mobileTab === 'editor' ? '#039d48' : 'transparent',
                  color: '#fff', border: 'none', borderRadius: 5, padding: '4px 8px', fontSize: 11, fontWeight: 600, cursor: 'pointer'
                }}
              >
                Form
              </button>
              <button
                onClick={() => setMobileTab('preview')}
                style={{
                  background: mobileTab === 'preview' ? '#039d48' : 'transparent',
                  color: '#fff', border: 'none', borderRadius: 5, padding: '4px 8px', fontSize: 11, fontWeight: 600, cursor: 'pointer'
                }}
              >
                Ticket
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ─── Main Content Workspace ────────────────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', position: 'relative' }}>
        {/* Left Form: Railway Parameters & Stations */}
        {(!isMobile || mobileTab === 'editor') && (
          <div style={{
            width: isMobile ? '100%' : 440,
            borderRight: isMobile ? 'none' : '1px solid rgba(255, 255, 255, 0.08)',
            background: '#0b1120',
            padding: isMobile ? '14px 12px 100px' : '18px 20px',
            overflowY: 'auto',
            flexShrink: 0,
            boxSizing: 'border-box'
          }}>
            {/* ── AI Implementation Prompt Bar ── */}
            <AiCommandBar
              toolName="ticket"
              placeholder="যেমন: 'আগামীকাল পদ্মা এক্সপ্রেস এ ১ জনের একটা টিকিট বানাও'"
              onGenerate={handleAiGenerate}
              onReviewPdf={handleDownloadPdf}
              onDownloadJpg={handleDownloadJpg}
              onCopyHtml={handleCopyHtml}
              onViewPreview={() => {
                if (isMobile) setMobileTab('preview');
              }}
              onRestoreHistory={(data) => setTicket(data)}
            />

            {/* AI Update Confirmation & Notice */}
            {aiUpdatedNotice && (
              <div style={{
                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(5, 150, 105, 0.15) 100%)',
                border: '1px solid rgba(16, 185, 129, 0.4)',
                borderRadius: 8,
                padding: '10px 12px',
                marginBottom: 14,
                display: 'flex',
                alignItems: 'flex-start',
                gap: 10,
                fontSize: 12,
                color: '#a7f3d0'
              }}>
                <CheckCircle2 size={16} color="#34d399" style={{ flexShrink: 0, marginTop: 2 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, color: '#34d399', marginBottom: 2 }}>
                    ✅ নিচের ফর্মের সেটিংস ও লাইভ টিকিট স্বয়ংক্রিয়ভাবে আপডেট হয়েছে
                  </div>
                  <div style={{ fontSize: 11.5, color: '#e2e8f0' }}>
                    {aiUpdatedNotice}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setAiUpdatedNotice(null)}
                  style={{ background: 'transparent', border: 'none', color: '#6ee7b7', cursor: 'pointer', fontSize: 16, lineHeight: 1 }}
                  title="Close"
                >
                  ×
                </button>
              </div>
            )}

            {/* Round-Trip Outbound / Return Switcher Banner */}
            {roundTripPair && (
              <div
                data-testid="round-trip-switcher"
                style={{
                  marginBottom: 14,
                  padding: '10px 12px',
                  background: '#131e32',
                  border: '1px solid #10b981',
                  borderRadius: 8,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <span style={{ fontSize: 11.5, fontWeight: 700, color: '#34d399' }}>
                    🔁 রাউন্ড-ট্রিপ (যাওয়া ও ফেরার টিকিট — ২টিই Saved History-তে সেভ হয়েছে)
                  </span>
                  <button
                    type="button"
                    onClick={() => setRoundTripPair(null)}
                    title="Close Round-Trip Switcher"
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#94a3b8',
                      cursor: 'pointer',
                      padding: 2,
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    <X size={14} />
                  </button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  {(['outbound', 'return'] as const).map(leg => {
                    const storedLeg = leg === 'outbound' ? roundTripPair.outbound : roundTripPair.returnTicket;
                    const legData = roundTripPair.activeLeg === leg ? ticket : storedLeg;
                    const isActive = roundTripPair.activeLeg === leg;
                    return (
                      <button
                        key={leg}
                        type="button"
                        data-testid={leg === 'outbound' ? 'round-trip-outbound-btn' : 'round-trip-return-btn'}
                        onClick={() => handleSwitchRoundTripLeg(leg)}
                        style={{
                          padding: '8px 10px',
                          minHeight: 44,
                          borderRadius: 7,
                          background: isActive ? 'rgba(16, 185, 129, 0.16)' : '#1e293b',
                          border: isActive ? '1px solid #10b981' : '1px solid #334155',
                          color: isActive ? '#ecfdf5' : '#cbd5e1',
                          textAlign: 'left',
                          cursor: 'pointer',
                          fontVariantNumeric: 'tabular-nums',
                        }}
                      >
                        <div style={{ fontSize: 11, fontWeight: 800, color: isActive ? '#34d399' : '#94a3b8', marginBottom: 2 }}>
                          {leg === 'outbound' ? 'যাওয়া (Outbound)' : 'ফেরা (Return)'}
                        </div>
                        <div style={{ fontSize: 11.5, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {legData.trainName} [{legData.trainNumber}]
                        </div>
                        <div style={{ fontSize: 10.5, color: '#94a3b8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {legData.fromStation} ➔ {legData.toStation} · {legData.journeyDate}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <span style={{ fontSize: 13, fontWeight: 800, color: '#10b981', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                🚂 Journey & Train Setup
              </span>
              <span style={{ fontSize: 11, color: '#94a3b8' }}>Auto-time adjustment active</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* ── Focused Stations Card (CSS Selector 1 & 2) ── */}
              <div style={{ background: '#131e32', border: '1px solid #1e293b', borderRadius: 8, padding: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <div style={{ minWidth: 0 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#e2e8f0', display: 'block' }}>
                      Stations (স্টেশন নির্বাচন)
                    </span>
                    <span style={{ fontSize: 10.5, color: '#94a3b8' }}>
                      {routeLookupStatus === 'checking'
                        ? 'সার্ভার শিডিউল যাচাই চলছে...'
                        : routeLookupStatus === 'live'
                          ? 'Live Railway Sync সক্রিয়'
                          : routeLookupStatus === 'offline'
                            ? 'Offline Verified শিডিউল'
                            : 'Verified Railway ডেটাসেট'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setManualStationMode(!manualStationMode)}
                    style={{
                      background: manualStationMode ? '#039d48' : 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.12)',
                      borderRadius: 6,
                      padding: '5px 10px',
                      minHeight: 32,
                      fontSize: 11,
                      color: '#fff',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      whiteSpace: 'nowrap',
                      flexShrink: 0,
                    }}
                  >
                    <PenTool size={12} /> {manualStationMode ? 'Search Menu' : 'Manual Write (হাতে লিখুন)'}
                  </button>
                </div>

                {!manualStationMode ? (
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'minmax(0, 1fr) auto minmax(0, 1fr)',
                    gap: 8,
                    alignItems: 'end',
                  }}>
                    <SearchableStationSelect
                      label="From Station (প্রারম্ভিক)"
                      value={ticket.fromStation}
                      valueBn={ticket.fromStationBn}
                      onSelect={handleFromStationSelect}
                      onManualMode={() => setManualStationMode(true)}
                      testId="from-station-picker"
                    />

                    <button
                      type="button"
                      onClick={handleSwapStations}
                      title="রুট ও ট্রেন উল্টে দিন (Swap From ⇄ To)"
                      aria-label="Swap From and To stations"
                      data-testid="swap-stations-btn"
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 7,
                        background: '#1e293b',
                        border: '1px solid #334155',
                        color: '#34d399',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        flexShrink: 0,
                      }}
                    >
                      <ArrowLeftRight size={15} />
                    </button>

                    <SearchableStationSelect
                      label="To Station (গন্তব্য)"
                      value={ticket.toStation}
                      valueBn={ticket.toStationBn}
                      onSelect={handleToStationSelect}
                      onManualMode={() => setManualStationMode(true)}
                      testId="to-station-picker"
                    />
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                      <div>
                        <label style={{ fontSize: 10.5, color: '#94a3b8', display: 'block', marginBottom: 2 }}>From (English)</label>
                        <input
                          type="text"
                          value={ticket.fromStation}
                          onChange={e => setTicket({ ...ticket, fromStation: e.target.value })}
                          placeholder="e.g. Dhaka"
                          style={{ width: '100%', padding: '6px 8px', background: '#1e293b', border: '1px solid #334155', borderRadius: 6, color: '#fff', fontSize: 12, boxSizing: 'border-box' }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: 10.5, color: '#94a3b8', display: 'block', marginBottom: 2 }}>From (বাংলা)</label>
                        <input
                          type="text"
                          value={ticket.fromStationBn}
                          onChange={e => setTicket({ ...ticket, fromStationBn: e.target.value })}
                          placeholder="যেমনঃ ঢাকা"
                          style={{ width: '100%', padding: '6px 8px', background: '#1e293b', border: '1px solid #334155', borderRadius: 6, color: '#fff', fontSize: 12, boxSizing: 'border-box' }}
                        />
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                      <div>
                        <label style={{ fontSize: 10.5, color: '#94a3b8', display: 'block', marginBottom: 2 }}>To (English)</label>
                        <input
                          type="text"
                          value={ticket.toStation}
                          onChange={e => setTicket({ ...ticket, toStation: e.target.value })}
                          placeholder="e.g. Bheramara"
                          style={{ width: '100%', padding: '6px 8px', background: '#1e293b', border: '1px solid #334155', borderRadius: 6, color: '#fff', fontSize: 12, boxSizing: 'border-box' }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: 10.5, color: '#94a3b8', display: 'block', marginBottom: 2 }}>To (বাংলা)</label>
                        <input
                          type="text"
                          value={ticket.toStationBn}
                          onChange={e => setTicket({ ...ticket, toStationBn: e.target.value })}
                          placeholder="যেমনঃ ভেড়ামারা"
                          style={{ width: '100%', padding: '6px 8px', background: '#1e293b', border: '1px solid #334155', borderRadius: 6, color: '#fff', fontSize: 12, boxSizing: 'border-box' }}
                        />
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleStationsUpdated(ticket.fromStation, ticket.fromStationBn, ticket.toStation, ticket.toStationBn)}
                      style={{
                        padding: '6px 10px',
                        background: '#1e293b',
                        border: '1px solid #334155',
                        borderRadius: 6,
                        color: '#34d399',
                        fontSize: 11.5,
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 6,
                      }}
                    >
                      <RefreshCw size={12} /> এই রুটের ট্রেন যাচাই ও সাজেশন আপডেট করুন
                    </button>
                  </div>
                )}
              </div>

              {/* ── Focused Train Card with Auto-Suggestions (CSS Selector 3) ── */}
              <div style={{ background: '#131e32', border: '1px solid #1e293b', borderRadius: 8, padding: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <div style={{ minWidth: 0 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#e2e8f0', display: 'block' }}>
                      Train Name & No. (ট্রেন নির্বাচন)
                    </span>
                    <span style={{ fontSize: 10.5, color: '#94a3b8', fontVariantNumeric: 'tabular-nums' }}>
                      {ticket.fromStation} ➔ {ticket.toStation} ({routeSuggestions.length} টি রুট ম্যাচ)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setManualTrainMode(!manualTrainMode)}
                    style={{
                      background: manualTrainMode ? '#039d48' : 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.12)',
                      borderRadius: 6,
                      padding: '5px 10px',
                      minHeight: 32,
                      fontSize: 11,
                      color: '#fff',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      whiteSpace: 'nowrap',
                      flexShrink: 0,
                    }}
                  >
                    <PenTool size={12} /> {manualTrainMode ? 'Switch to Menu' : 'Manual Train (হাতে লিখুন)'}
                  </button>
                </div>

                {/* Quick Train Search Bar (Number / EN / BN Name / Station) */}
                {!manualTrainMode && (
                  <div style={{ marginBottom: 10, position: 'relative' }}>
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                      <Search
                        size={13}
                        color="#94a3b8"
                        style={{ position: 'absolute', left: 10, pointerEvents: 'none' }}
                      />
                      <input
                        type="text"
                        data-testid="quick-train-search-input"
                        value={trainSearchQuery}
                        onChange={e => setTrainSearchQuery(e.target.value)}
                        placeholder="নম্বর বা নাম দিয়ে দ্রুত খুঁজুন (যেমন: 769 / ধূমকেতু / Suborno)..."
                        style={{
                          width: '100%',
                          minHeight: 36,
                          padding: '6px 32px 6px 30px',
                          background: '#0f172a',
                          border: '1px solid #334155',
                          borderRadius: 7,
                          color: '#f8fafc',
                          fontSize: 12,
                          boxSizing: 'border-box',
                        }}
                      />
                      {trainSearchQuery && (
                        <button
                          type="button"
                          data-testid="quick-train-search-clear"
                          onClick={() => setTrainSearchQuery('')}
                          title="Clear search"
                          style={{
                            position: 'absolute',
                            right: 6,
                            background: 'transparent',
                            border: 'none',
                            color: '#94a3b8',
                            cursor: 'pointer',
                            padding: 4,
                            display: 'flex',
                            alignItems: 'center',
                          }}
                        >
                          <X size={13} />
                        </button>
                      )}
                    </div>

                    {trainSearchQuery.trim() && (
                      <div
                        data-testid="quick-train-results"
                        style={{
                          marginTop: 6,
                          maxHeight: 210,
                          overflowY: 'auto',
                          background: '#0f172a',
                          border: '1px solid #334155',
                          borderRadius: 7,
                          display: 'flex',
                          flexDirection: 'column',
                        }}
                      >
                        {filteredQuickTrains.length > 0 ? (
                          filteredQuickTrains.map((tr, idx) => {
                            const servesRoute = doesTrainServeRouteInDirection(tr, ticket.fromStation, ticket.toStation);
                            return (
                              <button
                                key={`qtr-${tr.number}-${tr.name}-${idx}`}
                                type="button"
                                onClick={() => {
                                  setTrainSearchQuery('');
                                  applyTrainSelection(tr);
                                }}
                                style={{
                                  width: '100%',
                                  padding: '8px 10px',
                                  background: 'transparent',
                                  border: 'none',
                                  borderBottom: idx < filteredQuickTrains.length - 1 ? '1px solid #1e293b' : 'none',
                                  color: '#f8fafc',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  gap: 8,
                                  cursor: 'pointer',
                                  textAlign: 'left',
                                  fontVariantNumeric: 'tabular-nums',
                                }}
                              >
                                <span style={{ minWidth: 0 }}>
                                  <span style={{ fontSize: 12, fontWeight: 700, display: 'block', color: '#f8fafc' }}>
                                    {tr.name} [{tr.number}] · {tr.nameBn}
                                  </span>
                                  <span style={{ fontSize: 10.5, color: '#94a3b8' }}>
                                    {tr.fromStation} ➔ {tr.toStation} · {tr.departureTime}
                                  </span>
                                </span>
                                <span
                                  style={{
                                    fontSize: 10.5,
                                    fontWeight: 700,
                                    padding: '2px 6px',
                                    borderRadius: 5,
                                    flexShrink: 0,
                                    whiteSpace: 'nowrap',
                                    background: servesRoute ? 'rgba(16, 185, 129, 0.14)' : 'rgba(245, 158, 11, 0.12)',
                                    color: servesRoute ? '#34d399' : '#fbbf24',
                                    border: servesRoute ? '1px solid rgba(16, 185, 129, 0.35)' : '1px solid rgba(245, 158, 11, 0.35)',
                                  }}
                                >
                                  {servesRoute ? 'রুট ম্যাচ' : 'অন্য রুট'}
                                </span>
                              </button>
                            );
                          })
                        ) : (
                          <div style={{ padding: '10px 12px', fontSize: 11.5, color: '#94a3b8' }}>
                            "{trainSearchQuery}" নামে কোনো ট্রেন পাওয়া যায়নি। Manual Train মোডে লিখে নিতে পারেন।
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Clickable Station-to-Station Auto Train Suggestion Chips */}
                {!manualTrainMode && routeSuggestions.length > 0 && (
                  <div style={{ marginBottom: 10 }}>
                    <div style={{ fontSize: 10.5, color: '#94a3b8', marginBottom: 5 }}>
                      অটো-সাজেশন ট্রেন (ক্লিক করে বাছুন — মধ্যবর্তী স্টেশন অটুট থাকবে):
                    </div>
                    <div style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: 6,
                    }}>
                      {routeSuggestions.map(s => {
                        const isActive =
                          s.train.number === ticket.trainNumber &&
                          s.train.name.toLowerCase() === ticket.trainName.toLowerCase();
                        return (
                          <button
                            key={`chip-${s.train.number}-${s.train.name}`}
                            type="button"
                            onClick={() => applyTrainSelection(s.train)}
                            style={{
                              padding: '6px 10px',
                              minHeight: 40,
                              borderRadius: 7,
                              background: isActive ? 'rgba(16, 185, 129, 0.16)' : '#1e293b',
                              border: isActive
                                ? '1px solid #10b981'
                                : s.isOffDay
                                  ? '1px solid rgba(217, 119, 6, 0.5)'
                                  : '1px solid #334155',
                              color: isActive ? '#34d399' : '#f1f5f9',
                              fontSize: 11.5,
                              cursor: 'pointer',
                              textAlign: 'left',
                              display: 'flex',
                              flexDirection: 'column',
                              justifyContent: 'center',
                              gap: 1,
                              fontVariantNumeric: 'tabular-nums',
                              transition: 'border-color 150ms ease, background 150ms ease',
                            }}
                          >
                            <span style={{ fontWeight: 700, whiteSpace: 'nowrap' }}>
                              {s.train.name} [{s.train.number}]
                            </span>
                            <span style={{ fontSize: 10.5, color: s.isOffDay ? '#fbbf24' : '#94a3b8', whiteSpace: 'nowrap' }}>
                              {s.schedule.boardingTime} → {s.schedule.alightingTime} · ৳{s.schedule.segmentFare}
                              {s.isOffDay ? ` · বন্ধ (${s.offDayWeekdayBn})` : ''}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {!manualTrainMode && routeSuggestions.length === 0 && ticket.fromStation && ticket.toStation && (
                  <div style={{
                    padding: '8px 10px',
                    background: 'rgba(217, 119, 6, 0.1)',
                    border: '1px solid rgba(217, 119, 6, 0.35)',
                    borderRadius: 6,
                    fontSize: 11.5,
                    color: '#fcd34d',
                    marginBottom: 8,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}>
                    <AlertTriangle size={14} style={{ flexShrink: 0 }} />
                    <span>{ticket.fromStation} ➔ {ticket.toStation} রুটে সরাসরি আন্তঃনগর ট্রেন পাওয়া যায়নি।</span>
                  </div>
                )}

                {!manualTrainMode ? (
                  <div>
                    <label style={{ fontSize: 10.5, color: '#94a3b8', display: 'block', marginBottom: 3 }}>
                      Train Selection (রুট ও সকল ট্রেন তালিকা — ভুল রুট দিলে সতর্কতা আসবে)
                    </label>
                    <select
                      value={`${ticket.trainName} [${ticket.trainNumber}]`}
                      onChange={e => handleSelectTrain(e.target.value)}
                      data-testid="train-selector-dropdown"
                      style={{ width: '100%', minHeight: 40, padding: '8px 10px', background: '#1e293b', border: '1px solid #334155', borderRadius: 7, color: '#fff', fontSize: 12.5, boxSizing: 'border-box', fontVariantNumeric: 'tabular-nums' }}
                    >
                      {routeSuggestions.length > 0 && (
                        <optgroup label={`✅ ${ticket.fromStation} → ${ticket.toStation} রুটের ট্রেন (${routeSuggestions.length})`}>
                          {routeSuggestions.map(s => (
                            <option key={'match-' + s.train.number + '-' + s.train.name} value={`${s.train.name} [${s.train.number}]`}>
                              {s.train.name} [{s.train.number}] · {s.schedule.boardingTime} → {s.schedule.alightingTime} · ৳{s.schedule.segmentFare}
                              {s.isOffDay ? ' (Off-Day)' : ''}
                            </option>
                          ))}
                        </optgroup>
                      )}
                      {!RAILWAY_TRAINS.some(t => t.name === ticket.trainName && t.number === ticket.trainNumber) && (
                        <option value={`${ticket.trainName} [${ticket.trainNumber}]`}>
                          {ticket.trainName} [{ticket.trainNumber}]
                        </option>
                      )}
                      <optgroup label="🌐 অন্যান্য রুটের ট্রেন (রুট চেকসহ)">
                        {otherTrainsList.map((tr, idx) => (
                          <option key={'other-' + tr.number + '-' + tr.name + '-' + idx} value={`${tr.name} [${tr.number}]`}>
                            {tr.name} [{tr.number}] ({tr.fromStation} → {tr.toStation} @ {tr.departureTime})
                          </option>
                        ))}
                      </optgroup>
                      <option value="MANUAL_MODE">✏️ Custom Train / অন্য কোনো ট্রেন লিখুন...</option>
                    </select>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 0.6fr', gap: 6 }}>
                      <div>
                        <label style={{ fontSize: 10.5, color: '#94a3b8', display: 'block', marginBottom: 2 }}>Train (EN)</label>
                        <input
                          type="text"
                          value={ticket.trainName}
                          onChange={e => setTicket({ ...ticket, trainName: e.target.value })}
                          placeholder="CHITRA EXPRESS"
                          style={{ width: '100%', padding: '6px 8px', background: '#1e293b', border: '1px solid #334155', borderRadius: 6, color: '#fff', fontSize: 12, boxSizing: 'border-box' }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: 10.5, color: '#94a3b8', display: 'block', marginBottom: 2 }}>Train (বাংলা)</label>
                        <input
                          type="text"
                          value={ticket.trainNameBn}
                          onChange={e => setTicket({ ...ticket, trainNameBn: e.target.value })}
                          placeholder="চিত্রা"
                          style={{ width: '100%', padding: '6px 8px', background: '#1e293b', border: '1px solid #334155', borderRadius: 6, color: '#fff', fontSize: 12, boxSizing: 'border-box' }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: 10.5, color: '#94a3b8', display: 'block', marginBottom: 2 }}>Number</label>
                        <input
                          type="text"
                          value={ticket.trainNumber}
                          onChange={e => setTicket({ ...ticket, trainNumber: e.target.value })}
                          placeholder="764"
                          style={{ width: '100%', padding: '6px 8px', background: '#1e293b', border: '1px solid #334155', borderRadius: 6, color: '#fff', fontSize: 12, boxSizing: 'border-box' }}
                        />
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const v = validateTrainRouteSelection(ticket.trainName, ticket.trainNumber, ticket.fromStation, ticket.toStation);
                        if (!v.valid) {
                          setRouteConflictModal({
                            trainName: ticket.trainName,
                            trainNumber: ticket.trainNumber,
                            fromStation: ticket.fromStation,
                            toStation: ticket.toStation,
                            reasonBn: v.reasonBn || 'নির্বাচিত রুট ও ট্রেন মিলছে না।',
                            reasonEn: v.reasonEn || 'Route mismatch detected.',
                            validTrains: v.validTrains,
                          });
                        } else {
                          setAiUpdatedNotice(`"${ticket.trainName}" নির্বাচিত রুটের জন্য বৈধ।`);
                        }
                      }}
                      style={{
                        padding: '6px 10px',
                        background: '#1e293b',
                        border: '1px solid #334155',
                        borderRadius: 6,
                        color: '#93c5fd',
                        fontSize: 11.5,
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      রুট বৈধতা যাচাই করুন
                    </button>
                  </div>
                )}

                {/* Weekly Off-Day Inline Warning */}
                {activeOffDayStatus.isOffDay && (
                  <div
                    role="alert"
                    style={{
                      marginTop: 8,
                      padding: '8px 10px',
                      background: 'rgba(217, 119, 6, 0.14)',
                      border: '1px solid rgba(217, 119, 6, 0.45)',
                      borderRadius: 7,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 8,
                      fontSize: 11.5,
                      color: '#fde68a',
                    }}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <AlertTriangle size={14} color="#fbbf24" style={{ flexShrink: 0 }} />
                      <span>
                        ছুটির দিন সতর্কতা: {ticket.trainName} প্রতি <strong>{activeOffDayStatus.weekdayBn}</strong> বন্ধ থাকে ({ticket.journeyDate})।
                      </span>
                    </span>
                    <button
                      type="button"
                      onClick={handleShiftToNextOperatingDay}
                      style={{
                        padding: '4px 8px',
                        background: '#d97706',
                        border: 'none',
                        borderRadius: 5,
                        color: '#fff',
                        fontSize: 11,
                        fontWeight: 700,
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        flexShrink: 0,
                      }}
                    >
                      +১ দিন পরের তারিখ দিন
                    </button>
                  </div>
                )}

                {/* Collapsible Route Stoppage & Duration Preview Strip */}
                {segmentStoppage && (
                  <div style={{
                    marginTop: 8,
                    background: '#0f172a',
                    border: '1px solid #1e293b',
                    borderRadius: 7,
                    overflow: 'hidden',
                  }}>
                    <button
                      type="button"
                      data-testid="toggle-stoppages-btn"
                      onClick={() => setShowStoppageTimeline(prev => !prev)}
                      style={{
                        width: '100%',
                        minHeight: 36,
                        padding: '6px 10px',
                        background: 'transparent',
                        border: 'none',
                        color: '#cbd5e1',
                        fontSize: 11,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 8,
                        cursor: 'pointer',
                        fontVariantNumeric: 'tabular-nums',
                      }}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
                        <MapPin size={13} color="#34d399" style={{ flexShrink: 0 }} />
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {segmentStoppage.stops.length}টি স্টপেজ · {segmentStoppage.durationLabel} ({segmentStoppage.boardingTime} → {segmentStoppage.alightingTime})
                        </span>
                        {segmentStoppage.isNextDayArrival && (
                          <span style={{ fontSize: 10, color: '#fbbf24', fontWeight: 700, flexShrink: 0 }}>
                            +১ দিন
                          </span>
                        )}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 3, color: '#34d399', fontWeight: 600, flexShrink: 0 }}>
                        {showStoppageTimeline ? 'বন্ধ করুন' : 'স্টপেজ দেখুন'}
                        {showStoppageTimeline ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                      </span>
                    </button>

                    {showStoppageTimeline && (
                      <div
                        data-testid="stoppage-timeline-panel"
                        style={{
                          padding: '8px 10px 10px',
                          borderTop: '1px solid #1e293b',
                          display: 'flex',
                          flexWrap: 'wrap',
                          alignItems: 'center',
                          gap: 5,
                        }}
                      >
                        {segmentStoppage.stops.map((st, idx) => {
                          const isEnd = idx === 0 || idx === segmentStoppage.stops.length - 1;
                          return (
                            <React.Fragment key={st.name + '-' + idx}>
                              <span style={{
                                padding: '3px 7px',
                                borderRadius: 5,
                                fontSize: 10.5,
                                fontWeight: isEnd ? 700 : 500,
                                background: isEnd ? 'rgba(16, 185, 129, 0.14)' : '#1e293b',
                                border: isEnd ? '1px solid rgba(16, 185, 129, 0.45)' : '1px solid #334155',
                                color: isEnd ? '#6ee7b7' : '#cbd5e1',
                              }}>
                                {st.name} <span style={{ color: '#94a3b8', fontSize: 10 }}>({st.nameBn})</span>
                              </span>
                              {idx < segmentStoppage.stops.length - 1 && (
                                <span style={{ color: '#64748b', fontSize: 10 }}>→</span>
                              )}
                            </React.Fragment>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* ── Class Name & Coach/Seat ── */}
              <div style={{ background: '#131e32', border: '1px solid #1e293b', borderRadius: 8, padding: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <div>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#e2e8f0', display: 'block' }}>Class &amp; Coach / Seat</span>
                    {availableClassesForTrain.hasFilter && (
                      <span style={{ fontSize: 10, color: '#94a3b8' }}>
                        {ticket.trainName}: {availableClassesForTrain.available.map(c => c.code).join(', ')}
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setManualClassMode(!manualClassMode)}
                    style={{
                      background: manualClassMode ? '#039d48' : 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.12)',
                      borderRadius: 6,
                      padding: '4px 9px',
                      fontSize: 11,
                      color: '#fff',
                      cursor: 'pointer'
                    }}
                  >
                    {manualClassMode ? 'Preset Classes' : 'Custom Class'}
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.15fr 0.85fr', gap: 8 }}>
                  {!manualClassMode ? (
                    <div>
                      <label style={{ fontSize: 10.5, color: '#94a3b8', display: 'block', marginBottom: 3 }}>Class Name (শ্রেণি)</label>
                      <select
                        data-testid="class-selector-dropdown"
                        value={ticket.className}
                        onChange={e => handleClassChange(e.target.value)}
                        style={{ width: '100%', minHeight: 36, padding: '7px 8px', background: '#1e293b', border: '1px solid #334155', borderRadius: 6, color: '#fff', fontSize: 12, boxSizing: 'border-box' }}
                      >
                        <optgroup label={availableClassesForTrain.hasFilter ? '✅ এই ট্রেনের উপলব্ধ শ্রেণি' : 'শ্রেণি সমূহ'}>
                          {availableClassesForTrain.available.map(cls => {
                            const segF = computeUnitSegmentFare(activeTrainRecord, ticket.fromStation, ticket.toStation, cls.code);
                            return (
                              <option key={cls.code} value={cls.code}>
                                {cls.label} ({cls.labelBn}) · ৳{segF}
                              </option>
                            );
                          })}
                        </optgroup>
                        {availableClassesForTrain.unavailable.length > 0 && (
                          <optgroup label="অন্যান্য শ্রেণি (এই ট্রেনে সাধারণত নেই)">
                            {availableClassesForTrain.unavailable.map(cls => (
                              <option key={cls.code} value={cls.code}>
                                {cls.label} ({cls.labelBn})
                              </option>
                            ))}
                          </optgroup>
                        )}
                        {!RAILWAY_CLASSES.some(cls => cls.code.toUpperCase() === ticket.className.toUpperCase()) && ticket.className && (
                          <option value={ticket.className}>
                            {ticket.className} ({ticket.classNameBn || ticket.className})
                          </option>
                        )}
                        <option value="MANUAL_MODE">✏️ Custom Class Name...</option>
                      </select>
                    </div>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
                      <div>
                        <label style={{ fontSize: 10, color: '#94a3b8', display: 'block', marginBottom: 2 }}>Class EN</label>
                        <input
                          type="text"
                          value={ticket.className}
                          onChange={e => setTicket({ ...ticket, className: e.target.value })}
                          placeholder="S_CHAIR"
                          style={{ width: '100%', padding: '6px', background: '#1e293b', border: '1px solid #334155', borderRadius: 6, color: '#fff', fontSize: 11.5, boxSizing: 'border-box' }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: 10, color: '#94a3b8', display: 'block', marginBottom: 2 }}>Class BN</label>
                        <input
                          type="text"
                          value={ticket.classNameBn}
                          onChange={e => setTicket({ ...ticket, classNameBn: e.target.value })}
                          placeholder="শো.চেয়ার"
                          style={{ width: '100%', padding: '6px', background: '#1e293b', border: '1px solid #334155', borderRadius: 6, color: '#fff', fontSize: 11.5, boxSizing: 'border-box' }}
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 }}>
                      <label style={{ fontSize: 10.5, color: '#94a3b8' }}>Coach / Seat</label>
                      <button
                        type="button"
                        data-testid="auto-seat-btn"
                        onClick={handleAutoGenerateSeats}
                        title="শ্রেণি অনুযায়ী অটো কোচ ও সিট নম্বর বসান"
                        style={{
                          background: 'rgba(16, 185, 129, 0.12)',
                          border: '1px solid rgba(16, 185, 129, 0.35)',
                          color: '#34d399',
                          borderRadius: 4,
                          padding: '1px 6px',
                          fontSize: 10,
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 3,
                        }}
                      >
                        <Sparkles size={10} /> Auto
                      </button>
                    </div>
                    <input
                      type="text"
                      data-testid="coach-seat-input"
                      value={ticket.coachSeat}
                      onChange={e => {
                        const val = e.target.value;
                        setTicket({
                          ...ticket,
                          coachSeat: val,
                          coachSeatBn: getPureBanglaCoachSeat(val)
                        });
                      }}
                      placeholder="TA-34, TA-35"
                      style={{ width: '100%', minHeight: 36, padding: '7px 8px', background: '#1e293b', border: '1px solid #334155', borderRadius: 6, color: '#fff', fontSize: 12, boxSizing: 'border-box', fontVariantNumeric: 'tabular-nums' }}
                    />
                  </div>
                </div>
              </div>

              {/* ── Journey Date & Departure Time (Auto-adjusts) ── */}
              <div style={{ background: '#131e32', border: '1px solid #1e293b', borderRadius: 8, padding: 12 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#e2e8f0', display: 'block', marginBottom: 8 }}>
                  Schedule & Dates (তারিখ ও সময়)
                </span>
                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 8, marginBottom: 8 }}>
                  <div>
                    <label style={{ fontSize: 10.5, color: '#94a3b8', display: 'block', marginBottom: 2 }}>Journey Date (যাত্রার তারিখ)</label>
                    <input
                      type="date"
                      value={ticket.journeyDate}
                      onChange={e => setTicket({ ...ticket, journeyDate: e.target.value })}
                      style={{ width: '100%', padding: '6px 8px', background: '#1e293b', border: '1px solid #334155', borderRadius: 6, color: '#fff', fontSize: 12, boxSizing: 'border-box' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 10.5, color: '#94a3b8', display: 'block', marginBottom: 2 }}>Journey Time</label>
                    <input
                      type="time"
                      value={ticket.journeyTime}
                      onChange={e => setTicket({ ...ticket, journeyTime: e.target.value })}
                      style={{ width: '100%', padding: '6px 8px', background: '#1e293b', border: '1px solid #334155', borderRadius: 6, color: '#fff', fontSize: 12, boxSizing: 'border-box' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 8 }}>
                  <div>
                    <label style={{ fontSize: 10.5, color: '#94a3b8', display: 'block', marginBottom: 2 }}>Issue Date (প্রদানের তারিখ)</label>
                    <input
                      type="date"
                      value={ticket.issueDate}
                      onChange={e => setTicket({ ...ticket, issueDate: e.target.value })}
                      style={{ width: '100%', padding: '6px 8px', background: '#1e293b', border: '1px solid #334155', borderRadius: 6, color: '#fff', fontSize: 12, boxSizing: 'border-box' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 10.5, color: '#94a3b8', display: 'block', marginBottom: 2 }}>Issue Time</label>
                    <input
                      type="time"
                      value={ticket.issueTime}
                      onChange={e => setTicket({ ...ticket, issueTime: e.target.value })}
                      style={{ width: '100%', padding: '6px 8px', background: '#1e293b', border: '1px solid #334155', borderRadius: 6, color: '#fff', fontSize: 12, boxSizing: 'border-box' }}
                    />
                  </div>
                </div>
              </div>

              {/* ── Passenger Info + Saved Profiles + Multi-Passenger (1-4 Seats) ── */}
              <div style={{ background: '#131e32', border: '1px solid #1e293b', borderRadius: 8, padding: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#e2e8f0' }}>
                    Passenger Information (যাত্রীর তথ্য)
                  </span>
                  <div style={{ display: 'flex', gap: 5 }}>
                    <button
                      type="button"
                      data-testid="mask-privacy-btn"
                      onClick={handleTogglePrivacyMask}
                      title={isPrivacyMasked ? 'Unmask NID & Mobile' : 'Mask NID & Mobile (e.g. 017*****000)'}
                      style={{
                        background: isPrivacyMasked ? 'rgba(59, 130, 246, 0.16)' : 'rgba(255,255,255,0.06)',
                        border: isPrivacyMasked ? '1px solid rgba(59, 130, 246, 0.45)' : '1px solid rgba(255,255,255,0.12)',
                        borderRadius: 6,
                        padding: '4px 8px',
                        fontSize: 10.5,
                        color: isPrivacyMasked ? '#93c5fd' : '#cbd5e1',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                      }}
                    >
                      {isPrivacyMasked ? <Eye size={11} /> : <EyeOff size={11} />}
                      {isPrivacyMasked ? 'Unmask' : 'Mask'}
                    </button>
                    <button
                      type="button"
                      data-testid="save-passenger-profile-btn"
                      onClick={handleSavePassengerProfile}
                      title="এই যাত্রীর প্রোফাইল সেভ করুন"
                      style={{
                        background: 'rgba(16, 185, 129, 0.14)',
                        border: '1px solid rgba(16, 185, 129, 0.35)',
                        borderRadius: 6,
                        padding: '4px 8px',
                        fontSize: 10.5,
                        color: '#34d399',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                      }}
                    >
                      <BookmarkPlus size={11} /> Save Profile
                    </button>
                  </div>
                </div>

                {/* Quick Saved Passenger Profiles */}
                {savedPassengers.length > 0 && (
                  <div style={{ marginBottom: 9 }}>
                    <div style={{ fontSize: 10, color: '#94a3b8', marginBottom: 4 }}>
                      সেভ করা যাত্রী (১-ক্লিকে পূরণ করুন):
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                      {savedPassengers.map(prof => (
                        <div
                          key={prof.id}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            background: '#1e293b',
                            border: '1px solid #334155',
                            borderRadius: 6,
                            overflow: 'hidden',
                          }}
                        >
                          <button
                            type="button"
                            onClick={() => handleApplyPassengerProfile(prof)}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: '#e2e8f0',
                              fontSize: 10.5,
                              padding: '4px 7px',
                              cursor: 'pointer',
                              fontWeight: 600,
                            }}
                          >
                            {prof.name}
                          </button>
                          {savedPassengers.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleDeletePassengerProfile(prof.id)}
                              aria-label={`Remove ${prof.name}`}
                              style={{
                                background: 'transparent',
                                border: 'none',
                                borderLeft: '1px solid #334155',
                                color: '#64748b',
                                padding: '4px 5px',
                                cursor: 'pointer',
                                fontSize: 10,
                              }}
                            >
                              ×
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
                      <label style={{ fontSize: 10.5, color: '#94a3b8' }}>
                        {passengerNamesList.length > 1 ? 'Lead Passenger #1 (মূল যাত্রী — NID ও মোবাইলধারী)' : 'Passenger Name (যাত্রীর নাম)'}
                      </label>
                      {ticket.numSeats < 4 && (
                        <button
                          type="button"
                          data-testid="add-co-passenger-btn"
                          onClick={handleAddCoPassenger}
                          style={{
                            background: 'rgba(16, 185, 129, 0.12)',
                            border: '1px solid rgba(16, 185, 129, 0.35)',
                            borderRadius: 5,
                            color: '#34d399',
                            fontSize: 10.5,
                            fontWeight: 700,
                            padding: '2px 7px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                          }}
                        >
                          <UserPlus size={11} /> + সহযাত্রী ({ticket.numSeats}/4)
                        </button>
                      )}
                    </div>
                    <input
                      type="text"
                      data-testid="lead-passenger-input"
                      value={passengerNamesList.length > 1 ? passengerNamesList[0] : ticket.passengerName}
                      onChange={e => {
                        if (passengerNamesList.length > 1) {
                          handleCoPassengerNameChange(0, e.target.value);
                        } else {
                          setTicket({ ...ticket, passengerName: e.target.value });
                        }
                      }}
                      placeholder="MD. ZAHID HASAN"
                      style={{ width: '100%', padding: '7px 8px', background: '#1e293b', border: '1px solid #334155', borderRadius: 6, color: '#fff', fontSize: 12, boxSizing: 'border-box' }}
                    />
                  </div>

                  {/* Multi-Passenger Co-Traveler Rows (2 to 4 passengers) */}
                  {(ticket.numSeats > 1 || passengerNamesList.length > 1) && (
                    <div
                      data-testid="co-passengers-section"
                      style={{
                        background: '#0f172a',
                        border: '1px solid #1e293b',
                        borderRadius: 7,
                        padding: 8,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 6,
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 10.5, color: '#94a3b8' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontWeight: 600, color: '#cbd5e1' }}>
                          <Users size={12} color="#34d399" />
                          সহযাত্রী তালিকা ({Math.max(ticket.numSeats, passengerNamesList.length)} জন)
                        </span>
                        <span>১ PNR-এ সর্বোচ্চ ৪ আসন (১টি NID)</span>
                      </div>

                      {Array.from({ length: Math.max(0, Math.max(ticket.numSeats, passengerNamesList.length) - 1) }).map((_, coIdx) => {
                        const fullIdx = coIdx + 1;
                        const paxName = passengerNamesList[fullIdx] ?? '';
                        const paxRole = coPassengerRoles[coIdx] || 'adult';
                        return (
                          <div
                            key={`copax-${coIdx}`}
                            style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 92px 26px', gap: 5, alignItems: 'center' }}
                          >
                            <input
                              type="text"
                              data-testid={`co-passenger-name-${fullIdx}`}
                              value={paxName}
                              onChange={e => handleCoPassengerNameChange(fullIdx, e.target.value)}
                              placeholder={`Passenger #${fullIdx + 1} Name`}
                              style={{ width: '100%', padding: '5px 7px', background: '#1e293b', border: '1px solid #334155', borderRadius: 5, color: '#fff', fontSize: 11.5, boxSizing: 'border-box' }}
                            />
                            <select
                              aria-label={`Passenger ${fullIdx + 1} Category`}
                              value={paxRole}
                              onChange={e => handleCoPassengerRoleChange(coIdx, e.target.value as 'adult' | 'senior' | 'child')}
                              style={{ width: '100%', padding: '5px 4px', background: '#1e293b', border: '1px solid #334155', borderRadius: 5, color: '#e2e8f0', fontSize: 10.5, boxSizing: 'border-box' }}
                            >
                              <option value="adult">Adult</option>
                              <option value="senior">Senior</option>
                              <option value="child">Child (৫০%)</option>
                            </select>
                            <button
                              type="button"
                              onClick={() => handleRemoveCoPassenger(coIdx)}
                              title="সহযাত্রী বাদ দিন"
                              style={{
                                width: 26,
                                height: 26,
                                background: 'rgba(220, 38, 38, 0.14)',
                                border: '1px solid rgba(220, 38, 38, 0.35)',
                                borderRadius: 5,
                                color: '#fca5a5',
                                cursor: 'pointer',
                                fontSize: 13,
                                lineHeight: 1,
                              }}
                            >
                              ×
                            </button>
                          </div>
                        );
                      })}

                      {ticket.numSeats >= 4 && (
                        <button
                          type="button"
                          onClick={handleSplitSecondPnrGroup}
                          style={{
                            marginTop: 2,
                            padding: '5px 8px',
                            background: 'rgba(59, 130, 246, 0.14)',
                            border: '1px solid rgba(59, 130, 246, 0.35)',
                            borderRadius: 5,
                            color: '#93c5fd',
                            fontSize: 10.5,
                            fontWeight: 600,
                            cursor: 'pointer',
                            textAlign: 'center',
                          }}
                        >
                          ৪+ যাত্রী? এই ৪ আসন Save করে ২য় PNR শুরু করুন
                        </button>
                      )}
                    </div>
                  )}

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    <div>
                      <label style={{ fontSize: 10.5, color: '#94a3b8', display: 'block', marginBottom: 2 }}>ID Type (পরিচয়পত্র ধরণ)</label>
                      <select
                        value={ticket.idType}
                        onChange={e => {
                          const val = e.target.value;
                          const bn = val === 'NID' ? 'এন আই ডি' : val === 'Birth Certificate' ? 'জন্ম নিবন্ধন সনদ' : 'পাসপোর্ট';
                          setTicket({ ...ticket, idType: val, idTypeBn: bn });
                        }}
                        style={{ width: '100%', padding: '6px 8px', background: '#1e293b', border: '1px solid #334155', borderRadius: 6, color: '#fff', fontSize: 12, boxSizing: 'border-box' }}
                      >
                        <option value="NID">NID (এন আই ডি)</option>
                        <option value="Birth Certificate">Birth Certificate (জন্ম নিবন্ধন সনদ)</option>
                        <option value="Passport">Passport (পাসপোর্ট)</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ fontSize: 10.5, color: '#94a3b8', display: 'block', marginBottom: 2 }}>ID Number (পরিচয়পত্র নম্বর)</label>
                      <input
                        type="text"
                        data-testid="id-number-input"
                        value={ticket.idNumber}
                        onChange={e => {
                          const val = e.target.value;
                          if (!val.includes('*')) {
                            setRawPrivacyStore(prev => ({ ...prev, idNumber: val }));
                          }
                          setTicket({
                            ...ticket,
                            idNumber: val,
                            idNumberBn: toBanglaDigits(val)
                          });
                        }}
                        placeholder="376****183"
                        style={{ width: '100%', padding: '6px 8px', background: '#1e293b', border: '1px solid #334155', borderRadius: 6, color: '#fff', fontSize: 12, boxSizing: 'border-box', fontVariantNumeric: 'tabular-nums' }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    <div>
                      <label style={{ fontSize: 10.5, color: '#94a3b8', display: 'block', marginBottom: 2 }}>Mobile Number (মোবাইল নম্বর)</label>
                      <input
                        type="text"
                        data-testid="mobile-number-input"
                        value={ticket.mobileNumber}
                        onChange={e => {
                          const val = e.target.value;
                          if (!val.includes('*')) {
                            setRawPrivacyStore(prev => ({ ...prev, mobileNumber: val }));
                          }
                          setTicket({
                            ...ticket,
                            mobileNumber: val,
                            mobileNumberBn: toBanglaDigits(val)
                          });
                        }}
                        placeholder="017*****000"
                        style={{ width: '100%', padding: '6px 8px', background: '#1e293b', border: '1px solid #334155', borderRadius: 6, color: '#fff', fontSize: 12, boxSizing: 'border-box', fontVariantNumeric: 'tabular-nums' }}
                      />
                    </div>

                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
                        <label style={{ fontSize: 10.5, color: '#94a3b8' }}>PNR Number</label>
                        <button
                          type="button"
                          onClick={generateRandomPnr}
                          style={{ background: 'none', border: 'none', color: '#10b981', fontSize: 10, cursor: 'pointer', padding: 0 }}
                        >
                          Generate
                        </button>
                      </div>
                      <input
                        type="text"
                        value={ticket.pnrNumber}
                        onChange={e => setTicket({ ...ticket, pnrNumber: e.target.value.toUpperCase() })}
                        placeholder="6ABA16FCEEBCA"
                        style={{ width: '100%', padding: '6px 8px', background: '#1e293b', border: '1px solid #334155', borderRadius: 6, color: '#fff', fontSize: 12, boxSizing: 'border-box', fontFamily: 'monospace' }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Passengers Count & Fares ── */}
              <div style={{ background: '#131e32', border: '1px solid #1e293b', borderRadius: 8, padding: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#e2e8f0' }}>
                    Fares &amp; Passenger Counts (ভাড়া ও যাত্রী সংখ্যা)
                  </span>
                  <span style={{ fontSize: 10.5, color: '#34d399', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
                    মোট: ৳{totalFare}
                  </span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: 6, marginBottom: 8 }}>
                  <div>
                    <label style={{ fontSize: 10, color: '#94a3b8', display: 'block', marginBottom: 2 }}>Seats (মোট)</label>
                    <input
                      type="number"
                      min={1}
                      max={12}
                      data-testid="total-seats-input"
                      value={ticket.numSeats}
                      onChange={e => handleTotalSeatsChange(parseInt(e.target.value, 10) || 1)}
                      style={{ width: '100%', padding: '6px 8px', background: '#1e293b', border: '1px solid #334155', borderRadius: 6, color: '#fff', fontSize: 12, boxSizing: 'border-box', fontVariantNumeric: 'tabular-nums' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 10, color: '#94a3b8', display: 'block', marginBottom: 2 }}>Adult (প্রাপ্ত)</label>
                    <input
                      type="number"
                      min={0}
                      value={ticket.numAdults}
                      onChange={e => applySeatAndCategoryCounts(parseInt(e.target.value, 10) || 0, ticket.numSeniors, ticket.numChildren)}
                      style={{ width: '100%', padding: '6px 8px', background: '#1e293b', border: '1px solid #334155', borderRadius: 6, color: '#fff', fontSize: 12, boxSizing: 'border-box', fontVariantNumeric: 'tabular-nums' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 10, color: '#94a3b8', display: 'block', marginBottom: 2 }}>Senior (প্রবীণ)</label>
                    <input
                      type="number"
                      min={0}
                      value={ticket.numSeniors}
                      onChange={e => applySeatAndCategoryCounts(ticket.numAdults, parseInt(e.target.value, 10) || 0, ticket.numChildren)}
                      style={{ width: '100%', padding: '6px 8px', background: '#1e293b', border: '1px solid #334155', borderRadius: 6, color: '#fff', fontSize: 12, boxSizing: 'border-box', fontVariantNumeric: 'tabular-nums' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 10, color: '#94a3b8', display: 'block', marginBottom: 2 }}>Child (শিশু)</label>
                    <input
                      type="number"
                      min={0}
                      value={ticket.numChildren}
                      onChange={e => applySeatAndCategoryCounts(ticket.numAdults, ticket.numSeniors, parseInt(e.target.value, 10) || 0)}
                      style={{ width: '100%', padding: '6px 8px', background: '#1e293b', border: '1px solid #334155', borderRadius: 6, color: '#fff', fontSize: 12, boxSizing: 'border-box', fontVariantNumeric: 'tabular-nums' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
                  <div>
                    <label style={{ fontSize: 10, color: '#94a3b8', display: 'block', marginBottom: 2 }}>Fare (ভাড়া)</label>
                    <input
                      type="number"
                      data-testid="fare-input"
                      value={ticket.fare}
                      onChange={e => setTicket({ ...ticket, fare: parseFloat(e.target.value) || 0 })}
                      style={{ width: '100%', padding: '6px 8px', background: '#1e293b', border: '1px solid #334155', borderRadius: 6, color: '#fff', fontSize: 12, boxSizing: 'border-box', fontVariantNumeric: 'tabular-nums' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 10, color: '#94a3b8', display: 'block', marginBottom: 2 }}>Service (চার্জ)</label>
                    <input
                      type="number"
                      value={ticket.serviceCharge}
                      onChange={e => setTicket({ ...ticket, serviceCharge: parseFloat(e.target.value) || 0 })}
                      style={{ width: '100%', padding: '6px 8px', background: '#1e293b', border: '1px solid #334155', borderRadius: 6, color: '#fff', fontSize: 12, boxSizing: 'border-box', fontVariantNumeric: 'tabular-nums' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 10, color: '#94a3b8', display: 'block', marginBottom: 2 }}>VAT (১৫% এসি)</label>
                    <input
                      type="number"
                      data-testid="vat-input"
                      value={ticket.vat}
                      onChange={e => setTicket({ ...ticket, vat: parseFloat(e.target.value) || 0 })}
                      style={{ width: '100%', padding: '6px 8px', background: '#1e293b', border: '1px solid #334155', borderRadius: 6, color: '#fff', fontSize: 12, boxSizing: 'border-box', fontVariantNumeric: 'tabular-nums' }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Saved Tickets History list */}
            <div style={{ marginTop: 20, paddingTop: 12, borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <div style={{ fontSize: 11.5, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: 8 }}>
                Saved Tickets History ({savedTickets.length})
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {savedTickets.map(item => (
                  <div
                    key={item.id}
                    onClick={() => setTicket(item)}
                    style={{
                      background: item.id === ticket.id ? '#1e293b' : 'rgba(255, 255, 255, 0.03)',
                      border: `1px solid ${item.id === ticket.id ? '#039d48' : 'rgba(255, 255, 255, 0.06)'}`,
                      borderRadius: 6,
                      padding: '7px 10px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div>
                      <div style={{ fontSize: 11.5, fontWeight: 700, color: '#fff' }}>
                        {item.trainName} • {item.fromStation} → {item.toStation}
                      </div>
                      <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 1 }}>
                        {item.passengerName} • PNR: {item.pnrNumber}
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteTicket(item.id);
                      }}
                      style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: 4 }}
                      title="Delete"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Right Preview: Live A4 Bangladesh Railway Ticket View (Exact official HTML/SVG system match) */}
        {(!isMobile || mobileTab === 'preview') && (
          <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            background: '#040711',
            overflowY: 'auto',
            overflowX: 'auto',
            height: '100%',
            position: 'relative'
          }}>
            {/* Zoom & Quick Controls Bar */}
            <div className="no-print" style={{
              position: 'sticky',
              top: 0,
              zIndex: 30,
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '6px 12px',
              background: 'rgba(15, 23, 42, 0.94)',
              backdropFilter: 'blur(10px)',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              boxSizing: 'border-box'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <button
                  onClick={zoomOut}
                  style={{
                    background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
                    color: '#cbd5e1', borderRadius: 6, width: 28, height: 28, display: 'flex',
                    alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
                  }}
                  title="Zoom Out"
                >
                  <ZoomOut size={14} />
                </button>
                <span style={{ fontSize: 11, color: '#94a3b8', minWidth: 36, textAlign: 'center', fontWeight: 600 }}>
                  {Math.round(previewScale * 100)}%
                </span>
                <button
                  onClick={zoomIn}
                  style={{
                    background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
                    color: '#cbd5e1', borderRadius: 6, width: 28, height: 28, display: 'flex',
                    alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
                  }}
                  title="Zoom In"
                >
                  <ZoomIn size={14} />
                </button>
                <button
                  onClick={fitToScreen}
                  style={{
                    background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
                    color: '#cbd5e1', borderRadius: 6, padding: '4px 8px', fontSize: 11, fontWeight: 600, cursor: 'pointer'
                  }}
                  title="Fit to Screen"
                >
                  Fit
                </button>
                <button
                  onClick={resetZoom}
                  style={{
                    background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
                    color: '#cbd5e1', borderRadius: 6, padding: '4px 8px', fontSize: 11, fontWeight: 600, cursor: 'pointer'
                  }}
                  title="100% Size"
                >
                  100%
                </button>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <button
                  onClick={handleDownloadPdf}
                  disabled={isGeneratingPdf}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 5,
                    background: 'linear-gradient(135deg, #039d48 0%, #05b454 100%)',
                    color: '#fff', border: 'none', padding: '5px 11px', borderRadius: 6,
                    fontSize: 11.5, fontWeight: 700, cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(3, 157, 72, 0.4)'
                  }}
                  title="PDF Download"
                >
                  <Download size={13} /> {isGeneratingPdf ? '...' : 'PDF'}
                </button>
                <button
                  onClick={handleDownloadJpg}
                  disabled={isGeneratingJpg}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 5,
                    background: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)',
                    color: '#fff', border: 'none', padding: '5px 11px', borderRadius: 6,
                    fontSize: 11.5, fontWeight: 700, cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(37, 99, 235, 0.4)'
                  }}
                  title="JPG Download"
                >
                  <ImageIcon size={13} /> {isGeneratingJpg ? '...' : 'JPG'}
                </button>
                <button
                  onClick={handleCopyHtml}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 5,
                    background: copiedHtml ? 'rgba(34, 197, 94, 0.2)' : 'rgba(255,255,255,0.08)',
                    border: copiedHtml ? '1px solid #22c55e' : '1px solid rgba(255,255,255,0.15)',
                    color: copiedHtml ? '#4ade80' : '#fff', padding: '5px 10px', borderRadius: 6,
                    fontSize: 11.5, fontWeight: 600, cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  title="Copy Standalone HTML to Clipboard"
                >
                  {copiedHtml ? <Check size={13} /> : <Copy size={13} />}
                  <span>{copiedHtml ? 'Copied' : 'HTML'}</span>
                </button>
                <button
                  onClick={() => window.print()}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 5,
                    background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)',
                    color: '#fff', padding: '5px 9px', borderRadius: 6,
                    fontSize: 11.5, cursor: 'pointer'
                  }}
                  title="Print"
                >
                  <Printer size={13} />
                </button>
              </div>
            </div>

            {/* Scaled Preview Wrapper */}
            <div style={{
              padding: isMobile ? '16px 8px 110px' : '24px 24px 60px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'flex-start',
              width: '100%',
              boxSizing: 'border-box'
            }}>
              <div style={{
                width: `${Math.round(793.7 * previewScale)}px`,
                height: `${Math.round(1122.5 * previewScale)}px`,
                position: 'relative',
                flexShrink: 0,
                boxShadow: '0 20px 50px rgba(0,0,0,0.85)',
                borderRadius: 4,
                background: '#ffffff',
                overflow: 'hidden'
              }}>
                {/* 1:1 Exact Official Bangladesh Railway Ticket Board */}
                <div
                  id="page"
                  ref={ticketRef}
                  className={`railway-ticket-page${isCompactMultiPax ? ' compact-pax' : ''}`}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '793.7px',
                    height: '1122.5px',
                    background: '#ffffff',
                    paddingTop: isCompactMultiPax ? '32px' : '61.7px',
                    boxSizing: 'border-box',
                    userSelect: 'none',
                    transform: `scale(${previewScale})`,
                    transformOrigin: 'top left',
                  }}
                >
                  {/* Embedded Strict Stylesheet for 1:1 Bangladesh Railway Table Layout (inside #page for 1:1 foreignObject capture) */}
                  <style>{`
                    .railway-ticket-page { font-family: Roboto, 'Helvetica Neue', Arial, sans-serif; color: #333333; }
                    .railway-ticket-page * { box-sizing: border-box; }
                    .railway-ticket-page .bn { font-family: 'Noto Sans Bengali', 'SolaimanLipi', 'Kalpurush', sans-serif; }
                    .railway-ticket-page .frame {
                      margin: 0 56.96px 0 56.96px;
                      border: 4.5px solid #039d48;
                      padding: 15.1px;
                      min-height: 979.6px;
                      position: relative;
                    }
                    .railway-ticket-page .hdr { position: relative; height: 64.9px; }
                    .railway-ticket-page .logo { position: absolute; top: 1.6px; left: 7.7px; width: 44.2px; height: 57.9px; object-fit: contain; }
                    .railway-ticket-page .titlewrap { position: absolute; left: 0; width: 100%; top: 0; text-align: center; }
                    .railway-ticket-page .title-en { color: #1f7ec7; font-size: 21px; line-height: 22px; font-weight: 700; letter-spacing: -0.75px; position: absolute; top: 10.5px; width: 100%; }
                    .railway-ticket-page .title-bn { color: #1f7ec7; font-size: 21px; line-height: 21px; font-weight: 500; position: absolute; top: 34.8px; width: 100%; }
                    .railway-ticket-page .hdr-right { position: absolute; top: 0; right: 0; width: 84px; height: 146px; }
                    .railway-ticket-page .powered { color: #333; font-size: 8.3px; line-height: 10px; font-weight: 700; position: absolute; top: 3px; left: 0; white-space: nowrap; }
                    .railway-ticket-page .jv { color: #05b454; font-weight: 700; font-size: 11px; line-height: 11px; position: absolute; top: 15px; left: 0; white-space: nowrap; }
                    .railway-ticket-page .jv .big { font-size: 15px; line-height: 1; vertical-align: -1px; letter-spacing: -0.4px; }
                    .railway-ticket-page .qr { position: absolute; top: 61px; left: 0; width: 80px; height: 80px; display: block; }
                    .railway-ticket-page .intro { margin-top: 2.8px; font-size: 7.3pt; letter-spacing: -0.08px; line-height: 11.84px; color: #333; padding-right: 88px; }
                    .railway-ticket-page .intro-bn { margin-top: 10.9px; width: 100%; font-size: 6.75pt; letter-spacing: -0.05px; line-height: 11.84px; padding-right: 88px; }
                    .railway-ticket-page .bar {
                      background: #039d48; color: #ffffff; font-size: 10.5pt; font-weight: 700;
                      height: 29.4px; display: flex; align-items: center; padding: 0 7px 1px 7px; margin-top: 8.4px; line-height: 1.2;
                    }
                    .railway-ticket-page table.outer + .bar { margin-top: 18px; }
                    .railway-ticket-page table { width: 100%; border-collapse: separate; border-spacing: 0; table-layout: fixed; font-size: 8pt; }
                    .railway-ticket-page td { border: none; border-top: 1px solid #c7c7c7; border-left: 1px solid #c7c7c7; padding: 0; vertical-align: middle; height: auto; }
                    .railway-ticket-page td:first-child { width: 320.3px; border-left: none; }
                    .railway-ticket-page td.b { font-weight: 700; }
                    .railway-ticket-page td .td-c { display: block; padding: 2.5px 6px 3px 6px; line-height: 12.5px; width: 100%; }
                    .railway-ticket-page table.outer { border: 1.3px solid #039d48; }
                    .railway-ticket-page table.outer tr:first-child td { border-top: none; }
                    .railway-ticket-page .note-row td { height: auto; }
                    .railway-ticket-page .note-row td .td-c { font-size: 5.7pt; line-height: 9.5px; padding: 2.5px 6px 4px 6px; }
                    .railway-ticket-page .pleasenote { margin-top: 7px; font-size: 8pt; }
                    .railway-ticket-page .pn-cols { display: flex; }
                    .railway-ticket-page .pn-en { width: 315px; flex: none; padding-right: 8px; }
                    .railway-ticket-page .pn-bn { flex: 1; }
                    .railway-ticket-page .pn-head { line-height: 11px; font-weight: 700; }
                    .railway-ticket-page .pn-en div.it { margin-top: 12px; font-size: 8pt; line-height: 14px; }
                    .railway-ticket-page .pn-bn div.it { margin-top: 12px; font-size: 8pt; line-height: 14px; }
                    .railway-ticket-page .banner1 {
                      background: #e8f5e9; color: #e65100; font-weight: 700; text-align: center;
                      font-size: 11.5pt; line-height: 19px; height: 51.5px; margin-top: 9px;
                      display: flex; align-items: center; justify-content: center; padding: 2px 12px;
                    }
                    .railway-ticket-page .banner2 {
                      background: #fbe8d3; color: #b71c1c; font-weight: 700; text-align: center;
                      font-size: 11.5pt; line-height: 16px; height: 36.8px; margin-top: 9.5px;
                      display: flex; align-items: center; justify-content: center; padding: 2px 8px;
                    }
                    .railway-ticket-page .footer { display: flex; margin-top: 14.9px; }
                    .railway-ticket-page .f-en { width: 50%; font-size: 9pt; line-height: 14px; }
                    .railway-ticket-page .f-en .big { font-size: 11pt; font-weight: 700; }
                    .railway-ticket-page .f-bn { width: 50%; font-size: 9pt; line-height: 14px; }
                    .railway-ticket-page .f-bn .big { font-size: 11pt; font-weight: 700; }
                    .railway-ticket-page.compact-pax .frame { padding: 11px 15.1px; }
                    .railway-ticket-page.compact-pax td .td-c { padding: 1.5px 6px 2px 6px; line-height: 11.2px; }
                    .railway-ticket-page.compact-pax table.outer + .bar { margin-top: 10px; }
                    .railway-ticket-page.compact-pax .bar { height: 25px; margin-top: 6px; }
                    .railway-ticket-page.compact-pax .pn-en div.it, .railway-ticket-page.compact-pax .pn-bn div.it { margin-top: 6px; line-height: 12.5px; }
                    .railway-ticket-page.compact-pax .banner1 { height: 44px; margin-top: 6px; font-size: 10.5pt; line-height: 16px; }
                    .railway-ticket-page.compact-pax .banner2 { height: 32px; margin-top: 6px; font-size: 10.5pt; line-height: 14px; }
                    .railway-ticket-page.compact-pax .footer { margin-top: 10px; }
                  `}</style>
                  <div className="frame">
                    {/* Header */}
                    <div className="hdr">
                      <img
                        className="logo"
                        src="/20428_4-78474535-icon.png"
                        alt="Bangladesh Railway"
                      />
                      <div className="titlewrap">
                        <div className="title-en">BANGLADESH RAILWAY</div>
                        <div className="title-bn bn">বাংলাদেশ রেলওয়ে</div>
                      </div>
                      <div className="hdr-right">
                        <div className="powered">Powered by</div>
                        <div className="jv">
                          Shohoz<br />Synesis<br />Vincen<span className="big">&nbsp;JV</span>
                        </div>
                        {qrDataUrl && (
                          <img className="qr" src={qrDataUrl} alt="QR code" />
                        )}
                      </div>
                    </div>

                    {/* Intro Confirmation */}
                    <div className="intro">
                      Dear {ticket.passengerName.includes(',') ? ticket.passengerName.split(',')[0].trim() : ticket.passengerName},<br />
                      Your request to book e-ticket for your journey in Bangladesh Railway was successful. You can travel on the train mentioned in<br />
                      the ticket subject to showing your NID or Photo ID card. The details of your e-ticket are as below:
                    </div>

                    <div className="intro-bn bn">
                      বাংলাদেশ রেলওয়েতে ভ্রমণের জন্য আপনার চাহিদ ই-টিকিট সফলভাবে প্রদান করা হয়েছে। আপনার এনআইডি কিংবা ছবি সংলগ্ন আইডি দেখানো সাপেক্ষে<br />
                      আপনি টিকিটে বর্ণিত ট্রেনে যাত্রা করতে পারবেন। ই-টিকিটের বিস্তারিত নিন্মে দেয়া হলো:-
                    </div>

                    {/* Table 1: Journey Information */}
                    <div className="bar">
                      <span>Journey Information <span className="bn">(যাত্রার তথ্য)</span></span>
                    </div>
                    <table className="outer">
                      <tbody>
                        <tr>
                          <td><div className="td-c"><span>Issue Date &amp; Time <span className="bn">(প্রদানের তারিখ ও সময়)</span></span></div></td>
                          <td><div className="td-c"><span>
                            {formatDateEn(ticket.issueDate, ticket.issueTime)} <span className="bn">({formatDateBn(ticket.issueDate, ticket.issueTime)})</span>
                          </span></div></td>
                        </tr>
                        <tr>
                          <td><div className="td-c"><span>Journey Date &amp; Time <span className="bn">(যাত্রার তারিখ ও সময়)</span></span></div></td>
                          <td><div className="td-c"><span>
                            {formatDateEn(ticket.journeyDate, ticket.journeyTime)} <span className="bn">({formatDateBn(ticket.journeyDate, ticket.journeyTime)})</span>
                          </span></div></td>
                        </tr>
                        <tr>
                          <td><div className="td-c"><span>Train Name &amp; Number <span className="bn">(ট্রেন নম্বর ও নাম)</span></span></div></td>
                          <td><div className="td-c"><span>
                            {ticket.trainName} [{ticket.trainNumber}] <span className="bn">({ticket.trainNameBn} [{toBanglaDigits(ticket.trainNumber)}])</span>
                          </span></div></td>
                        </tr>
                        <tr>
                          <td><div className="td-c"><span>From Station <span className="bn">(প্রারম্ভিক স্টেশন)</span></span></div></td>
                          <td><div className="td-c"><span>
                            {ticket.fromStation} <span className="bn">({ticket.fromStationBn || getStationBanglaName(ticket.fromStation)})</span>
                          </span></div></td>
                        </tr>
                        <tr>
                          <td><div className="td-c"><span>To Station <span className="bn">(গন্তব্য স্টেশন)</span></span></div></td>
                          <td><div className="td-c"><span>
                            {ticket.toStation} <span className="bn">({ticket.toStationBn || getStationBanglaName(ticket.toStation)})</span>
                          </span></div></td>
                        </tr>
                        <tr>
                          <td><div className="td-c"><span>Class Name <span className="bn">(শ্রেণির নাম)</span></span></div></td>
                          <td><div className="td-c"><span>
                            {ticket.className} <span className="bn">({ticket.classNameBn})</span>
                          </span></div></td>
                        </tr>
                        <tr>
                          <td><div className="td-c"><span>Coach Name / Seat(s) <span className="bn">(কোচের নাম / আসন)</span></span></div></td>
                          <td><div className="td-c"><span>
                            {ticket.coachSeat} <span className="bn">({getPureBanglaCoachSeat(ticket.coachSeat, ticket.coachSeatBn)})</span>
                          </span></div></td>
                        </tr>
                        <tr>
                          <td><div className="td-c"><span>No. of Seats <span className="bn">(আসন সংখ্যা)</span></span></div></td>
                          <td><div className="td-c"><span>
                            {ticket.numSeats} <span className="bn">({toBanglaDigits(ticket.numSeats)})</span>
                          </span></div></td>
                        </tr>
                        <tr>
                          <td><div className="td-c"><span>No. of Adult Passenger(s) <span className="bn">(প্রাপ্তবয়স্ক যাত্রীর সংখ্যা)</span></span></div></td>
                          <td><div className="td-c"><span>
                            {ticket.numAdults} <span className="bn">({toBanglaDigits(ticket.numAdults)})</span>
                          </span></div></td>
                        </tr>
                        <tr>
                          <td><div className="td-c"><span>No. of Senior Citizen Passenger(s) <span className="bn">(প্রবীণ যাত্রীর সংখ্যা)</span></span></div></td>
                          <td><div className="td-c"><span>
                            {ticket.numSeniors} <span className="bn">({toBanglaDigits(ticket.numSeniors)})</span>
                          </span></div></td>
                        </tr>
                        <tr>
                          <td><div className="td-c"><span>No. of Child Passenger(s) <span className="bn">(শিশু যাত্রীর সংখ্যা)</span></span></div></td>
                          <td><div className="td-c"><span>
                            {ticket.numChildren} <span className="bn">({toBanglaDigits(ticket.numChildren)})</span>
                          </span></div></td>
                        </tr>
                        <tr>
                          <td><div className="td-c"><span>Fare <span className="bn">(ভাড়া)</span></span></div></td>
                          <td><div className="td-c"><span>
                            BDT {ticket.fare.toFixed(2)} <span className="bn">({toBanglaDigits(ticket.fare.toFixed(2))} টাকা)</span>
                          </span></div></td>
                        </tr>
                        <tr>
                          <td><div className="td-c"><span>VAT <span className="bn">(ভ্যাট)</span></span></div></td>
                          <td><div className="td-c"><span>
                            BDT {ticket.vat.toFixed(2)} <span className="bn">({toBanglaDigits(ticket.vat.toFixed(2))} টাকা)</span>
                          </span></div></td>
                        </tr>
                        <tr>
                          <td><div className="td-c"><span>Service Charge <span className="bn">(সেবা খরচ)</span></span></div></td>
                          <td><div className="td-c"><span>
                            BDT {ticket.serviceCharge.toFixed(2)} <span className="bn">({toBanglaDigits(ticket.serviceCharge.toFixed(2))} টাকা)</span>
                          </span></div></td>
                        </tr>
                        <tr>
                          <td><div className="td-c"><span>Total Fare <span className="bn">(মোট ভাড়া)</span>**</span></div></td>
                          <td className="b"><div className="td-c"><span>
                            BDT {totalFare.toFixed(2)} <span className="bn">({toBanglaDigits(totalFare.toFixed(2))} টাকা)</span>
                          </span></div></td>
                        </tr>
                        <tr className="note-row">
                          <td colSpan={2}><div className="td-c"><span>
                            ** Total Fare includes BDT 50 Bedding Charges per seat for AC_B and F_BERTH seat classes. <span className="bn">(এসি_বি এবং এফ_বার্থ সিট ক্লাসের প্রতি সিটে মোট ভাড়ার সাথে ৫০ টাকা বেডিং চার্জ অন্তর্ভুক্ত)</span>
                          </span></div></td>
                        </tr>
                      </tbody>
                    </table>

                    {/* Table 2: Passenger Information */}
                    <div className="bar">
                      <span>Passenger Information <span className="bn">(যাত্রীর তথ্য)</span></span>
                    </div>
                    <table className="outer">
                      <tbody>
                        <tr>
                          <td><div className="td-c"><span>Passenger Name <span className="bn">(যাত্রীর নাম)</span></span></div></td>
                          <td><div className="td-c"><span>{leadPassengerName}</span></div></td>
                        </tr>
                        <tr>
                          <td><div className="td-c"><span>Identification Type <span className="bn">(পরিচয়পত্র ধরণ)</span></span></div></td>
                          <td><div className="td-c"><span>{ticket.idType} <span className="bn">({ticket.idTypeBn})</span></span></div></td>
                        </tr>
                        <tr>
                          <td><div className="td-c"><span>Identification Number <span className="bn">(পরিচয়পত্র নম্বর)</span></span></div></td>
                          <td className="b"><div className="td-c"><span>{ticket.idNumber} <span className="bn">({toBanglaDigits(ticket.idNumber)})</span></span></div></td>
                        </tr>
                        <tr>
                          <td><div className="td-c"><span>Mobile Number <span className="bn">(মোবাইল নম্বর)</span></span></div></td>
                          <td className="b"><div className="td-c"><span>{ticket.mobileNumber} <span className="bn">({toBanglaDigits(ticket.mobileNumber)})</span></span></div></td>
                        </tr>
                        <tr>
                          <td><div className="td-c"><span>PNR Number <span className="bn">(পিএনআর নম্বর)</span></span></div></td>
                          <td className="b"><div className="td-c"><span>{ticket.pnrNumber}</span></div></td>
                        </tr>
                        {coPassengersList.map((coName, idx) => (
                          <tr key={`co-pax-row-${idx}`}>
                            <td><div className="td-c"><span>Co Passenger {idx + 1} <span className="bn">(সহযাত্রী {toBanglaDigits(idx + 1)})</span></span></div></td>
                            <td><div className="td-c"><span>{coName}</span></div></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    {/* Please Note */}
                    <div className="pleasenote">
                      <div className="pn-cols">
                        <div className="pn-en">
                          <div className="pn-head">Please Note:-</div>
                          <div className="it">
                            &bull; Carrying NID or Photo ID while travelling is mandatory for each passenger.<br />
                            &bull; You can carry either soft copy or printed copy of your e-ticket while travelling.<br />
                            &bull; No need to print e-ticket from the counter.<br />
                            &bull; It is mandatory for children between 3 to 12 years old to purchase minor tickets.
                          </div>
                        </div>
                        <div className="pn-bn bn">
                          <div className="pn-head">খেয়াল করুনঃ-</div>
                          <div className="it">
                            - ভ্রমণের সময় প্রত্যেক যাত্রীর এনআইডি/ ছবি সংবলিত পরিচয়পত্র সাথে রাখা বাধ্যতামূলক।<br />
                            - ট্রেন ভ্রমণে আপনার ই-টিকিটের প্রিন্টেড কপি অথবা অনলাইন কপি সাথে রাখুন।<br />
                            - কাউন্টার থেকে টিকিট প্রিন্ট করার প্রয়োজন নেই।<br />
                            - তিন থেকে বারো বছরের শিশুদের জন্য অপ্রাপ্ত বয়স্ক টিকিট ক্রয় বাধ্যতামূলক।
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Banners */}
                    <div className="banner1 bn">
                      <span>রেলওয়ে সেবার জন্য ১৩১ এবং আইন শৃঙ্খলা বিষয়ক সহায়তার জন্য রেলওয়ে পুলিশ হটলাইন ০১৩২০১৭৭৫৯৮ নম্বরে যোগাযোগ করুন।</span>
                    </div>

                    <div className="banner2 bn">
                      <span>"ধূমপান ও তামাকজাত দ্রব্য ব্যবহার হইতে বিরত থাকুন, ইহা শাস্তিযোগ্য অপরাধ"</span>
                    </div>

                    {/* Footer */}
                    <div className="footer">
                      <div className="f-en">
                        Wishing you a pleasant and safe journey-
                        <div className="big">Bangladesh Railway</div>
                      </div>
                      <div className="f-bn bn">
                        আপনার ভ্রমণ সুখকর ও নিরাপদ হোক, এই কামনায়-
                        <div className="big">বাংলাদেশ রেলওয়ে</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ─── Mobile Bottom Navigation Dock ─── */}
      {isMobile && (
        <nav className="no-print" style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          height: 56,
          background: 'rgba(15, 23, 42, 0.96)',
          backdropFilter: 'blur(16px)',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-around',
          padding: '0 6px',
          zIndex: 999,
          boxShadow: '0 -4px 20px rgba(0,0,0,0.6)',
        }}>
          <button
            onClick={() => setMobileTab('editor')}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
              background: 'none', border: 'none',
              color: mobileTab === 'editor' ? '#10b981' : '#94a3b8',
              fontSize: 10.5, fontWeight: mobileTab === 'editor' ? 700 : 500,
              cursor: 'pointer', padding: '4px 10px', borderRadius: 8,
            }}
          >
            <PenTool size={17} />
            <span>Form</span>
          </button>

          <button
            onClick={() => setMobileTab('preview')}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
              background: 'none', border: 'none',
              color: mobileTab === 'preview' ? '#10b981' : '#94a3b8',
              fontSize: 10.5, fontWeight: mobileTab === 'preview' ? 700 : 500,
              cursor: 'pointer', padding: '4px 10px', borderRadius: 8,
            }}
          >
            <Eye size={17} />
            <span>A4 Ticket</span>
          </button>

          <button
            onClick={saveCurrentTicket}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
              background: 'none', border: 'none',
              color: '#94a3b8',
              fontSize: 10.5, fontWeight: 500,
              cursor: 'pointer', padding: '4px 10px', borderRadius: 8,
            }}
          >
            <CheckCircle2 size={17} />
            <span>Save</span>
          </button>

          <button
            onClick={handleDownloadPdf}
            disabled={isGeneratingPdf}
            style={{
              display: 'flex', alignItems: 'center', gap: 4,
              background: 'linear-gradient(135deg, #039d48 0%, #05b454 100%)',
              color: '#fff', border: 'none',
              padding: '6px 10px', borderRadius: 16,
              fontSize: 11, fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(3, 157, 72, 0.4)',
            }}
          >
            <Download size={13} />
            <span>PDF</span>
          </button>

          <button
            onClick={handleDownloadJpg}
            disabled={isGeneratingJpg}
            style={{
              display: 'flex', alignItems: 'center', gap: 4,
              background: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)',
              color: '#fff', border: 'none',
              padding: '6px 10px', borderRadius: 16,
              fontSize: 11, fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(37, 99, 235, 0.4)',
            }}
          >
            <ImageIcon size={13} />
            <span>JPG</span>
          </button>

          <button
            onClick={handleCopyHtml}
            style={{
              display: 'flex', alignItems: 'center', gap: 4,
              background: copiedHtml ? 'rgba(34, 197, 94, 0.25)' : 'rgba(255, 255, 255, 0.08)',
              border: copiedHtml ? '1px solid #22c55e' : '1px solid rgba(255, 255, 255, 0.15)',
              color: copiedHtml ? '#4ade80' : '#fff',
              padding: '6px 9px', borderRadius: 16,
              fontSize: 11, fontWeight: 600,
              cursor: 'pointer',
            }}
            title="Copy HTML"
          >
            {copiedHtml ? <Check size={13} /> : <Copy size={13} />}
            <span>Copy</span>
          </button>

          <button
            onClick={handleDownloadHtml}
            style={{
              display: 'flex', alignItems: 'center', gap: 4,
              background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
              border: 'none',
              color: '#fff',
              padding: '6px 9px', borderRadius: 16,
              fontSize: 11, fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(124, 58, 237, 0.4)',
            }}
            title="Download HTML File"
          >
            <FileCode size={13} />
            <span>HTML</span>
          </button>
        </nav>
      )}

      <style>{`
        .ticket-span {
          position: absolute;
          white-space: pre;
          line-height: 20pt;
          height: 20pt;
          margin: 0;
          padding: 0;
          font-kerning: none;
          font-synthesis: none;
          text-rendering: geometricPrecision;
          -webkit-font-smoothing: antialiased;
        }
        .ticket-r {
          font-family: "Roboto", sans-serif;
        }
        .ticket-s {
          font-family: "SolaimanLipi", "Kalpurush", sans-serif;
        }
        @media print {
          @page {
            size: A4;
            margin: 0;
          }
          body {
            background: #fff !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          .no-print {
            display: none !important;
          }
          #page {
            position: absolute !important;
            top: 0 !important;
            left: 0 !important;
            transform: none !important;
            box-shadow: none !important;
            margin: 0 !important;
          }
        }
      `}</style>

      {/* Recent History Modal */}
      <RecentHistoryModal
        isOpen={historyOpen}
        service="ticket"
        title="বাংলাদেশ রেলওয়ে টিকিট ড্রাফট ও হিস্টোরি"
        onClose={() => setHistoryOpen(false)}
        onRestore={(data) => {
          setTicket(data);
          setAiUpdatedNotice(`ড্রাফট থেকে টিকিট রিস্টোর সম্পন্ন হয়েছে! ট্রেন: ${data.trainName} [${data.trainNumber}]`);
        }}
      />
    </div>
  );
}
