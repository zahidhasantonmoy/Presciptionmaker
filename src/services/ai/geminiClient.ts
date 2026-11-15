// Google Gemini API Client for Antigravity / Suite Generator

const STORAGE_KEY = 'gemini_api_key';

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

const CANDIDATE_MODELS = [
  'gemini-2.5-flash',
  'gemini-2.0-flash',
  'gemini-1.5-flash',
];

export async function testGeminiApiKey(apiKey: string): Promise<{ success: boolean; message: string }> {
  if (!apiKey || !apiKey.trim()) {
    return { success: false, message: 'API key is empty.' };
  }

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey.trim()}`;
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

    return { success: true, message: 'Gemini API connection successful!' };
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

  if (!apiKey) {
    return {
      success: false,
      error: 'NO_API_KEY',
    };
  }

  let lastError = '';

  for (const model of CANDIDATE_MODELS) {
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
        // If 404 model not found, loop to next candidate
        if (response.status === 404) continue;
        // If 400 or other, don't try other models if it's invalid key
        if (response.status === 400 && errMsg.includes('API key')) {
          return { success: false, error: errMsg };
        }
        continue;
      }

      const resJson = await response.json();
      const candidateText =
        resJson?.candidates?.[0]?.content?.parts?.[0]?.text || '';

      if (!candidateText) {
        return { success: false, error: 'Empty response received from Gemini.' };
      }

      try {
        // Strip code fence if present
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
