import {
  DirectionalTrainSuggestion,
  findDirectionalTrains,
  normalizeStationName,
} from './railwayData';

export interface RouteLookupResponse {
  suggestions: DirectionalTrainSuggestion[];
  syncState: 'live' | 'verified' | 'offline';
  checkedAt?: string;
}

interface CachedLivePatch {
  liveAvailable: boolean;
  serverTimestamp: string;
  liveMatches: Array<{
    number?: string;
    name?: string;
    departureTime?: string;
    arrivalTime?: string;
    offDay?: string;
    fares?: Record<string, number>;
  }>;
  cachedAt: number;
}

const LIVE_CACHE = new Map<string, CachedLivePatch>();
const CACHE_TTL_MS = 5 * 60 * 1000;

function mergeLiveData(
  base: DirectionalTrainSuggestion[],
  patch: CachedLivePatch | undefined
): DirectionalTrainSuggestion[] {
  if (!patch || !patch.liveAvailable || patch.liveMatches.length === 0) {
    return base;
  }

  return base.map(entry => {
    const liveMatch = patch.liveMatches.find(
      m =>
        (m.number && m.number === entry.train.number) ||
        (m.name && m.name.toUpperCase() === entry.train.name.toUpperCase())
    );
    if (!liveMatch) return entry;

    return {
      ...entry,
      source: 'live',
      schedule: {
        ...entry.schedule,
        boardingTime: liveMatch.departureTime || entry.schedule.boardingTime,
        alightingTime: liveMatch.arrivalTime || entry.schedule.alightingTime,
      },
      train: {
        ...entry.train,
        fares: liveMatch.fares
          ? { ...entry.train.fares, ...liveMatch.fares }
          : entry.train.fares,
      },
    };
  });
}

export async function lookupStationToStationTrains(
  fromStation: string,
  toStation: string,
  journeyDate: string,
  className: string,
  signal?: AbortSignal
): Promise<RouteLookupResponse> {
  const fromNorm = normalizeStationName(fromStation);
  const toNorm = normalizeStationName(toStation);
  const localSuggestions = findDirectionalTrains(fromNorm, toNorm, journeyDate, className);

  const isOffline = typeof navigator !== 'undefined' && !navigator.onLine;
  if (isOffline || !fromNorm || !toNorm || fromNorm.toLowerCase() === toNorm.toLowerCase()) {
    return {
      suggestions: localSuggestions,
      syncState: isOffline ? 'offline' : 'verified',
    };
  }

  const cacheKey = `${fromNorm.toLowerCase()}|${toNorm.toLowerCase()}|${journeyDate}`;
  const cached = LIVE_CACHE.get(cacheKey);
  if (cached && Date.now() - cached.cachedAt < CACHE_TTL_MS) {
    return {
      suggestions: mergeLiveData(localSuggestions, cached),
      syncState: cached.liveAvailable ? 'live' : 'verified',
      checkedAt: cached.serverTimestamp,
    };
  }

  try {
    const qs = new URLSearchParams({
      from: fromNorm,
      to: toNorm,
      date: journeyDate || '',
    });
    const res = await fetch(`/api/railway-lookup?${qs.toString()}`, {
      method: 'GET',
      signal,
    });
    if (!res.ok) {
      return { suggestions: localSuggestions, syncState: 'verified' };
    }
    const payload = (await res.json()) as {
      ok?: boolean;
      liveAvailable?: boolean;
      serverTimestamp?: string;
      liveMatches?: CachedLivePatch['liveMatches'];
    };

    const cachedEntry: CachedLivePatch = {
      liveAvailable: Boolean(payload.liveAvailable),
      serverTimestamp: payload.serverTimestamp || new Date().toISOString(),
      liveMatches: Array.isArray(payload.liveMatches) ? payload.liveMatches : [],
      cachedAt: Date.now(),
    };
    LIVE_CACHE.set(cacheKey, cachedEntry);

    return {
      suggestions: mergeLiveData(localSuggestions, cachedEntry),
      syncState: cachedEntry.liveAvailable ? 'live' : 'verified',
      checkedAt: cachedEntry.serverTimestamp,
    };
  } catch {
    return {
      suggestions: localSuggestions,
      syncState: 'verified',
    };
  }
}
