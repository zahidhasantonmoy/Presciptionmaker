// Google Gemini API Client for Antigravity / Suite Generator

const STORAGE_KEY = 'gemini_api_key';
const MODEL_STORAGE_KEY = 'gemini_preferred_model';

export const AVAILABLE_MODELS = [
  { id: 'gemini-2.5-flash-lite', name: 'Gemini 2.5 Flash Lite', limit: '500 RPD', desc: '🔥 বেস্ট ভলিউম ও সুপার ফাস্ট (৫০০ রিকোয়েস্ট/দিন)' },
  { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', limit: '20 RPD', desc: 'ম্যাক্সিমাম কোয়ালিটি ও রিজনিং (২০ রিকোয়েস্ট/দিন)' },
  { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash', limit: '15 RPM', desc: 'স্ট্যান্ডার্ড মাল্টিমোডাল মডেল' },
  { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', limit: 'High Quota', desc: 'স্ট্যাবল ও নির্ভরযোগ্য' },
];

export function getPreferredModel(): string {
  try {
    const stored = localStorage.getItem(MODEL_STORAGE_KEY);
    if (stored && stored.trim() && !stored.includes('2.0')) return stored.trim();
  } catch {
    // ignore
  }
  return 'gemini-2.5-flash-lite'; // Default to Flash Lite (500 RPD) for high volume!
}

export function setPreferredModel(model: string): void {
  try {
    localStorage.setItem(MODEL_STORAGE_KEY, model.trim());
  } catch {
    // ignore
  }
}

export function getGeminiApiKey(): string {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && stored.trim()) return stored.trim();
  } catch {
    // ignore
  }

  // Fallback to Vite env variable if provided
  const envKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (envKey && typeof envKey === 'string' && envKey.trim()) {
    return envKey.trim();
  }

  return '';
}

export function setGeminiApiKey(key: string): void {
  try {
    if (!key || !key.trim()) {
      localStorage.removeItem(STORAGE_KEY);
    } else {
      localStorage.setItem(STORAGE_KEY, key.trim());
    }
  } catch {
    // ignore
  }
}

export function hasGeminiApiKey(): boolean {
  return getGeminiApiKey().length > 0;
}

export interface GeminiResponse<T = any> {
  success: boolean;
  data?: T;
  rawText?: string;
  error?: string;
}

// Candidates sorted so 500 RPD Flash-Lite models are prioritized first
const CANDIDATE_MODELS = [
  'gemini-2.5-flash-lite',
  'gemini-2.5-flash',
  'gemini-1.5-flash',
];

export async function testGeminiApiKey(apiKey: string, modelOverride?: string): Promise<{ success: boolean; message: string }> {
  if (!apiKey || !apiKey.trim()) {
    return { success: false, message: 'API key is empty.' };
  }

  const rawModel = modelOverride || getPreferredModel();
  const model = rawModel && !rawModel.includes('2.0-flash-lite') ? rawModel : 'gemini-2.5-flash-lite';

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey.trim()}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: 'Respond with: {"status": "ok"}' }] }],
        generationConfig: { responseMimeType: 'application/json' },
      }),
    });

    if (!response.ok) {
      const errJson = await response.json().catch(() => ({}));
      const errMsg = errJson?.error?.message || response.statusText;
      return { success: false, message: `Error (${response.status}): ${errMsg}` };
    }

    return { success: true, message: `Gemini API connection successful! Model: ${model}` };
  } catch (err: any) {
    return { success: false, message: err?.message || 'Network error connecting to Gemini API.' };
  }
}

export async function callGeminiJson<T = any>(
  prompt: string,
  systemInstruction: string,
  providedKey?: string
): Promise<GeminiResponse<T>> {
  const apiKey = (providedKey || getGeminiApiKey()).trim();
  const preferred = getPreferredModel();

  // If no client-side key, try the serverless backend API (/api/gemini)
  if (!apiKey) {
    try {
      const serverRes = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, systemInstruction, preferredModel: preferred }),
      });

      if (serverRes.ok) {
        const resJson = await serverRes.json();
        const candidateText = resJson?.text || '';
        if (candidateText) {
          let cleaned = candidateText.trim();
          if (cleaned.startsWith('```')) {
            cleaned = cleaned.replace(/^```[a-z]*\s*/i, '').replace(/\s*```$/, '');
          }
          const parsed = JSON.parse(cleaned) as T;
          return { success: true, data: parsed, rawText: candidateText };
        }
      }
    } catch {
      // serverless endpoint not available
    }

    return {
      success: false,
      error: 'NO_API_KEY',
    };
  }

  let lastError = '';

  // Put preferred model first, then remaining candidates as fallback
  const modelsToTry = [
    preferred,
    ...CANDIDATE_MODELS.filter((m) => m !== preferred),
  ];

  for (const model of modelsToTry) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const payload: any = {
        contents: [
          {
            role: 'user',
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          temperature: 0.2,
          responseMimeType: 'application/json',
        },
      };

      if (systemInstruction) {
        payload.systemInstruction = {
          parts: [{ text: systemInstruction }],
        };
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        const errMsg = errJson?.error?.message || `HTTP ${response.status}`;
        lastError = `[${model}] ${errMsg}`;

        // If 400 with invalid API key, no need to try other models
        if (response.status === 400 && errMsg.includes('API key')) {
          return { success: false, error: errMsg };
        }

        // On 429 (quota exceeded) or 404 (model not available), try next model in fallback list
        continue;
      }

      const resJson = await response.json();
      const candidateText =
        resJson?.candidates?.[0]?.content?.parts?.[0]?.text || '';

      if (!candidateText) {
        continue;
      }

      try {
        let cleaned = candidateText.trim();
        if (cleaned.startsWith('```')) {
          cleaned = cleaned.replace(/^```[a-z]*\s*/i, '').replace(/\s*```$/, '');
        }
        const parsed = JSON.parse(cleaned) as T;
        return { success: true, data: parsed, rawText: candidateText };
      } catch (parseErr: any) {
        return {
          success: false,
          rawText: candidateText,
          error: `JSON parse error: ${parseErr.message}`,
        };
      }
    } catch (err: any) {
      lastError = err?.message || 'Network request failed';
    }
  }

  return {
    success: false,
    error: lastError || 'Failed to generate response from Gemini.',
  };
}
