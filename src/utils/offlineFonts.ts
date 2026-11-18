// Offline Base64 Font Inliner for 100% self-contained standalone HTML exports

interface FontSourceSpec {
  family: string;
  url: string;
  format: 'woff2' | 'woff' | 'truetype';
  weight: string;
  mime: string;
}

const FONT_SPECS: FontSourceSpec[] = [
  {
    family: 'Noto Serif Bengali',
    url: '/fonts/NotoSerifBengali-Black.woff2',
    format: 'woff2',
    weight: '900',
    mime: 'font/woff2',
  },
  {
    family: 'Noto Sans Bengali',
    url: '/fonts/NotoSansBengali.woff2',
    format: 'woff2',
    weight: '100 900',
    mime: 'font/woff2',
  },
  {
    family: 'SolaimanLipi',
    url: '/fonts/SolaimanLipi.woff',
    format: 'woff',
    weight: 'normal',
    mime: 'font/woff',
  },
  {
    family: 'Roboto',
    url: '/fonts/Roboto.ttf',
    format: 'truetype',
    weight: 'normal',
    mime: 'font/ttf',
  },
];

let cachedFontsCssPromise: Promise<string> | null = null;

async function blobToDataUri(blob: Blob, fallbackMime: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        // Ensure accurate font mime type rather than generic application/octet-stream
        const base64Part = reader.result.split(',')[1];
        if (base64Part) {
          resolve(`data:${fallbackMime};base64,${base64Part}`);
          return;
        }
        resolve(reader.result);
      } else {
        reject(new Error('Failed to encode font blob'));
      }
    };
    reader.onerror = () => reject(reader.error || new Error('FileReader error'));
    reader.readAsDataURL(blob);
  });
}

async function fetchFontCssBlock(spec: FontSourceSpec): Promise<string> {
  const origin = typeof window !== 'undefined' && window.location.origin ? window.location.origin : '';
  const fallbackUrl = `${origin}${spec.url}`;
  try {
    const res = await fetch(spec.url, { cache: 'force-cache' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const blob = await res.blob();
    const dataUri = await blobToDataUri(blob, spec.mime);
    return `@font-face {
  font-family: '${spec.family}';
  src: url('${dataUri}') format('${spec.format}');
  font-weight: ${spec.weight};
  font-style: normal;
  font-display: swap;
}`;
  } catch {
    return `@font-face {
  font-family: '${spec.family}';
  src: url('${fallbackUrl}') format('${spec.format}');
  font-weight: ${spec.weight};
  font-style: normal;
  font-display: swap;
}`;
  }
}

export async function loadInlineFontsCss(): Promise<string> {
  if (!cachedFontsCssPromise) {
    cachedFontsCssPromise = Promise.all(FONT_SPECS.map(fetchFontCssBlock))
      .then((blocks) => blocks.join('\n'))
      .catch(() => {
        cachedFontsCssPromise = null;
        return '';
      });
  }
  return cachedFontsCssPromise;
}
