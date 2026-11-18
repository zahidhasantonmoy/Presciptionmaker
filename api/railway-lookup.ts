interface LiveTrainPatch {
  number?: string;
  name?: string;
  departureTime?: string;
  arrivalTime?: string;
  offDay?: string;
  fares?: Record<string, number>;
}

/**
 * Queries Bangladesh Railway's open public route/train info endpoints safely with a short timeout.
 * Authenticated booking APIs return 401 when unauthenticated, so we fall back gracefully and signal
 * the client to use its verified local directional schedule matrix without throwing 500 errors.
 */
export async function probeLiveRailwaySchedule(
  fromStation: string,
  toStation: string,
  journeyDate: string
): Promise<{
  checkedLive: boolean;
  liveAvailable: boolean;
  serverTimestamp: string;
  liveMatches: LiveTrainPatch[];
}> {
  const serverTimestamp = new Date().toISOString();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 2200);

  try {
    const query = new URLSearchParams({
      from_city: fromStation,
      to_city: toStation,
      date_of_journey: journeyDate || new Date().toISOString().split('T')[0],
      seat_class: 'S_CHAIR',
    });

    const response = await fetch(
      `https://railspaapi.shohoz.com/v1.0/web/bookings/search-trips-v2?${query.toString()}`,
      {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'User-Agent': 'EasyPad-Railway-Schedule-Lookup/1.0',
        },
        signal: controller.signal,
      }
    );

    if (!response.ok) {
      return {
        checkedLive: true,
        liveAvailable: false,
        serverTimestamp,
        liveMatches: [],
      };
    }

    const json = (await response.json().catch(() => null)) as {
      data?: {
        trains?: Array<{
          trip_number?: string;
          train_model?: string;
          departure_date_time?: string;
          arrival_date_time?: string;
          seat_types?: Array<{ type?: string; fare?: number }>;
        }>;
      };
    } | null;

    const trains = json?.data?.trains;
    if (!Array.isArray(trains) || trains.length === 0) {
      return {
        checkedLive: true,
        liveAvailable: false,
        serverTimestamp,
        liveMatches: [],
      };
    }

    const liveMatches: LiveTrainPatch[] = trains.map(item => {
      const fares: Record<string, number> = {};
      if (Array.isArray(item.seat_types)) {
        for (const st of item.seat_types) {
          if (st.type && typeof st.fare === 'number' && st.fare > 0) {
            fares[st.type] = Math.round(st.fare);
          }
        }
      }
      const depMatch = item.departure_date_time?.match(/(\d{1,2}:\d{2})/);
      const arrMatch = item.arrival_date_time?.match(/(\d{1,2}:\d{2})/);
      return {
        number: item.train_model || undefined,
        name: item.trip_number?.replace(/\s*\(\d+\)\s*$/, '').toUpperCase() || undefined,
        departureTime: depMatch ? depMatch[1] : undefined,
        arrivalTime: arrMatch ? arrMatch[1] : undefined,
        fares: Object.keys(fares).length > 0 ? fares : undefined,
      };
    });

    return {
      checkedLive: true,
      liveAvailable: liveMatches.length > 0,
      serverTimestamp,
      liveMatches,
    };
  } catch {
    return {
      checkedLive: true,
      liveAvailable: false,
      serverTimestamp,
      liveMatches: [],
    };
  } finally {
    clearTimeout(timer);
  }
}

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const from = String(req.query?.from || '').trim();
  const to = String(req.query?.to || '').trim();
  const date = String(req.query?.date || '').trim();

  if (!from || !to) {
    return res.status(400).json({ ok: false, error: 'Missing from or to station parameter' });
  }

  const result = await probeLiveRailwaySchedule(from, to, date);
  return res.status(200).json({
    ok: true,
    from,
    to,
    date,
    ...result,
  });
}
