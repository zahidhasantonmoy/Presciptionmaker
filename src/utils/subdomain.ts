// Subdomain and Multi-Service Routing Utility

export type ServiceId = 'hub' | 'prescription' | 'ticket' | 'invoice' | 'certificate' | 'idcard';

// Mapping of subdomains to Service IDs
export const SUBDOMAIN_TO_SERVICE: Record<string, ServiceId> = {
  prescription: 'prescription',
  rx: 'prescription',
  ticket: 'ticket',
  tickets: 'ticket',
  invoice: 'invoice',
  invoices: 'invoice',
  certificate: 'certificate',
  certificates: 'certificate',
  cert: 'certificate',
  card: 'idcard',
  idcard: 'idcard',
  badge: 'idcard',
};

// Known root hostnames that represent the Central Hub
const ROOT_HOSTNAMES = ['localhost', '127.0.0.1'];

/**
 * Detects the active service based on window.location:
 * 1. Query parameter: ?service=ticket (works on any domain, great for testing/local dev)
 * 2. Pathname prefix: /ticket or /services/ticket
 * 3. Subdomain: ticket.example.com -> 'ticket'
 * 4. Default: 'hub' (Central Dashboard)
 */
export function detectActiveService(baseDomain?: string): ServiceId {
  if (typeof window === 'undefined') return 'hub';

  try {
    const url = new URL(window.location.href);

    // 1. Query param override (?service=ticket)
    const queryService = url.searchParams.get('service')?.toLowerCase();
    if (queryService && queryService in SUBDOMAIN_TO_SERVICE) {
      return SUBDOMAIN_TO_SERVICE[queryService];
    }
    if (queryService === 'hub') return 'hub';

    // 2. Path prefix override (/ticket, /services/ticket, /prescription)
    const pathParts = url.pathname.split('/').filter(Boolean);
    if (pathParts.length > 0) {
      const firstSegment = pathParts[0].toLowerCase();
      if (firstSegment === 'services' && pathParts[1]) {
        const second = pathParts[1].toLowerCase();
        if (second in SUBDOMAIN_TO_SERVICE) return SUBDOMAIN_TO_SERVICE[second];
      }
      if (firstSegment in SUBDOMAIN_TO_SERVICE) {
        return SUBDOMAIN_TO_SERVICE[firstSegment];
      }
      if (firstSegment === 'hub') return 'hub';
    }

    // 3. Subdomain extraction
    const hostname = window.location.hostname.toLowerCase();

    // Check if localhost or IP
    if (ROOT_HOSTNAMES.includes(hostname)) {
      // If someone uses prescription.localhost:5173
      const parts = hostname.split('.');
      if (parts.length > 1 && parts[0] in SUBDOMAIN_TO_SERVICE) {
        return SUBDOMAIN_TO_SERVICE[parts[0]];
      }
      return 'hub';
    }

    // Custom base domain detection (e.g. example.com)
    // If hostname is "prescription.example.com"
    const parts = hostname.split('.');
    if (parts.length >= 3) {
      const sub = parts[0];
      if (sub in SUBDOMAIN_TO_SERVICE) {
        return SUBDOMAIN_TO_SERVICE[sub];
      }
    } else if (parts.length === 2 && baseDomain) {
      // apex domain e.g. example.com
      return 'hub';
    }
  } catch (e) {
    console.error('Error detecting service from URL:', e);
  }

  return 'hub';
}

/**
 * Builds the URL to navigate to a target service.
 * In production with a custom domain, points to the subdomain (e.g. ticket.example.com).
 * In local dev or without subdomains configured, uses path or query param.
 */
export function getServiceUrl(serviceId: ServiceId, customApexDomain?: string): string {
  if (typeof window === 'undefined') return '/';

  const hostname = window.location.hostname;
  const protocol = window.location.protocol;
  const port = window.location.port ? `:${window.location.port}` : '';

  // If on localhost or IP without subdomains
  if (ROOT_HOSTNAMES.includes(hostname) || hostname.endsWith('.localhost')) {
    if (serviceId === 'hub') {
      return `${protocol}//${window.location.host}/`;
    }
    return `${protocol}//${window.location.host}/?service=${serviceId}`;
  }

  // If a custom apex domain is defined or detected (e.g. example.com)
  const apex = customApexDomain || getApexDomain(hostname);
  if (apex && apex !== 'localhost') {
    if (serviceId === 'hub') {
      return `${protocol}//${apex}${port}/`;
    }
    return `${protocol}//${serviceId}.${apex}${port}/`;
  }

  // Fallback to query param
  return `/?service=${serviceId}`;
}

/**
 * Extracts the apex domain (e.g. "example.com" from "prescription.example.com" or "example.com")
 */
export function getApexDomain(hostname: string): string {
  const parts = hostname.split('.');
  if (parts.length <= 2) return hostname;
  return parts.slice(-2).join('.');
}

/**
 * Sets a cross-subdomain cookie valid for .example.com
 */
export function setCrossSubdomainCookie(name: string, value: string, days = 30) {
  if (typeof document === 'undefined') return;

  const hostname = window.location.hostname;
  const apex = getApexDomain(hostname);
  const expires = new Date(Date.now() + days * 864e5).toUTCString();

  // If apex is not localhost or an IP, set domain with leading dot
  const isLocal = ROOT_HOSTNAMES.includes(hostname) || hostname.endsWith('.localhost');
  const domainAttr = isLocal ? '' : `; domain=.${apex}`;

  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/${domainAttr}; SameSite=Lax; Secure`;
}

/**
 * Reads a cookie by name
 */
export function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
  return match ? decodeURIComponent(match[3]) : null;
}

/**
 * Clears cross-subdomain cookie
 */
export function removeCrossSubdomainCookie(name: string) {
  if (typeof document === 'undefined') return;
  const hostname = window.location.hostname;
  const apex = getApexDomain(hostname);
  const isLocal = ROOT_HOSTNAMES.includes(hostname) || hostname.endsWith('.localhost');
  const domainAttr = isLocal ? '' : `; domain=.${apex}`;
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/${domainAttr}`;
}
