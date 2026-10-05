// Standard Path-based Navigation and Service Routing

export type ServiceId = 'hub' | 'prescription' | 'ticket' | 'invoice' | 'certificate' | 'idcard';

export const SERVICE_PATHS: Record<ServiceId, string> = {
  hub: '/',
  prescription: '/prescription',
  ticket: '/ticket',
  invoice: '/invoice',
  certificate: '/certificate',
  idcard: '/card',
};

export const PATH_TO_SERVICE: Record<string, ServiceId> = {
  '': 'hub',
  '/': 'hub',
  'hub': 'hub',
  'prescription': 'prescription',
  'rx': 'prescription',
  'ticket': 'ticket',
  'tickets': 'ticket',
  'invoice': 'invoice',
  'invoices': 'invoice',
  'certificate': 'certificate',
  'certificates': 'certificate',
  'card': 'idcard',
  'idcard': 'idcard',
  'badge': 'idcard',
};

/**
 * Detects the active service from window.location pathname or query:
 * e.g. /ticket -> 'ticket'
 * e.g. /prescription -> 'prescription'
 * e.g. / or '' -> 'hub'
 */
export function detectActiveService(): ServiceId {
  if (typeof window === 'undefined') return 'hub';

  try {
    const url = new URL(window.location.href);

    // 1. Check query parameter (?service=ticket)
    const queryService = url.searchParams.get('service')?.toLowerCase();
    if (queryService && queryService in PATH_TO_SERVICE) {
      return PATH_TO_SERVICE[queryService];
    }
    if (queryService === 'hub') return 'hub';

    // 2. Check pathname (/ticket, /prescription, /services/invoice)
    const segments = url.pathname.split('/').filter(Boolean);
    if (segments.length === 0) return 'hub';

    const first = segments[0].toLowerCase();
    if (first === 'services' && segments[1]) {
      const second = segments[1].toLowerCase();
      if (second in PATH_TO_SERVICE) return PATH_TO_SERVICE[second];
    }

    if (first in PATH_TO_SERVICE) {
      return PATH_TO_SERVICE[first];
    }
  } catch (e) {
    console.error('Error detecting route service:', e);
  }

  return 'hub';
}

/**
 * Navigates to a target service via HTML5 History pushState
 */
export function navigateToService(serviceId: ServiceId) {
  if (typeof window === 'undefined') return;
  const targetPath = SERVICE_PATHS[serviceId] || '/';
  window.history.pushState({}, '', targetPath);
  window.dispatchEvent(new PopStateEvent('popstate'));
}
