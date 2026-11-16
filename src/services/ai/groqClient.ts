// Groq LPU Inference API Client (High-Throughput & Fallback Engine)

const GROQ_STORAGE_KEY = 'groq_api_key';
const GROQ_MODEL_STORAGE_KEY = 'groq_preferred_model';

export const GROQ_AVAILABLE_MODELS = [
  { id: 'llama-3.3-70b-versatile', name: 'Llama 3.3 70B Versatile', desc: '🚀 সেরা ইন্টেলিজেন্স ও সুপার ফাস্ট (সুপারিশকৃত)' },
  { id: 'llama-3.1-8b-instant', name: 'Llama 3.1 8B Instant', desc: '⚡ আল্ট্রা ফাস্ট রেসপন্স ও লো-লেটেন্সি' },
  { id: 'openai/gpt-oss-120b', name: 'GPT-OSS 120B (OpenAI on Groq)', desc: '১,০০০ রিকোয়েস্ট/দিন ও হাই কোয়ালিটি' },
  { id: 'openai/gpt-oss-20b', name: 'GPT-OSS 20B (OpenAI on Groq)', desc: '১,০০০ রিকোয়েস্ট/দিন ও লো-লেটেন্সি' },
  { id: 'qwen/qwen3.8-27b', name: 'Qwen 3.8 27B', desc: '১,০০০ রিকোয়েস্ট/দিন ও এক্সিলেন্ট রিজনাল সাপোর্ট' },
  { id: 'mixtral-8x7b-32768', name: 'Mixtral 8x7B (32k Context)', desc: 'হাই থ্রুপুট ও বড় কনটেক্সট' },
  { id: 'gemma2-9b-it', name: 'Gemma 2 9B IT', desc: 'গুগল আর্কিটেকচার বেসড ওপেন মডেল' },
];

export function getGroqPreferredModel(): string {
  try {
    const stored = localStorage.getItem(GROQ_MODEL_STORAGE_KEY);
    if (stored && stored.trim()) return stored.trim();
  } catch {
    // ignore
  }
  return 'llama-3.3-70b-versatile';
}

export function setGroqPreferredModel(model: string): void {
  try {
    localStorage.setItem(GROQ_MODEL_STORAGE_KEY, model.trim());
  } catch {
    // ignore
  }
}

export function getGroqApiKey(): string {
  try {
    const stored = localStorage.getItem(GROQ_STORAGE_KEY);
    if (stored && stored.trim()) return stored.trim();
  } catch {
    // ignore
  }

  const envKey = import.meta.env.VITE_GROQ_API_KEY;
  if (envKey && typeof envKey === 'string' && envKey.trim()) {
    return envKey.trim();
  }

  return '';
}

export function setGroqApiKey(key: string): void {
  try {
    if (!key || !key.trim()) {
      localStorage.removeItem(GROQ_STORAGE_KEY);
    } else {
      localStorage.setItem(GROQ_STORAGE_KEY, key.trim());
    }
  } catch {
    // ignore
  }
}

export function hasGroqApiKey(): boolean {
  return getGroqApiKey().length > 0;
}

export interface GroqResponse<T = any> {
  success: boolean;
  data?: T;
  rawText?: string;
  error?: string;
  modelUsed?: string;
}

export async function testGroqApiKey(
  apiKey: string,
  modelOverride?: string
): Promise<{ success: boolean; message: string }> {
  if (!apiKey || !apiKey.trim()) {
    return { success: false, message: 'Groq API Key is empty.' };
  }

  const model = modelOverride || getGroqPreferredModel();

  try {
    const url = 'https://api.groq.com/openai/v1/chat/completions';
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey.trim()}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'user', content: 'Respond with valid JSON only: {"status": "ok"}' },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.1,
      }),
    });

    if (!response.ok) {
      const errJson = await response.json().catch(() => ({}));
      const errMsg = errJson?.error?.message || response.statusText;
      return { success: false, message: `Error (${response.status}): ${errMsg}` };
    }

    return { success: true, message: `Groq API connection successful! Model: ${model}` };
  } catch (err: any) {
    return { success: false, message: err?.message || 'Network error connecting to Groq API.' };
  }
}

export async function callGroqJson<T = any>(
  prompt: string,
  systemInstruction: string,
  providedKey?: string
): Promise<GroqResponse<T>> {
  const apiKey = (providedKey || getGroqApiKey()).trim();
  const preferred = getGroqPreferredModel();

  // If no client-side key, try serverless endpoint /api/groq
  if (!apiKey) {
    try {
      const serverRes = await fetch('/api/groq', {
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
          return { success: true, data: parsed, rawText: candidateText, modelUsed: resJson?.model || preferred };
        }
      }
    } catch {
      // serverless unavailable
    }

    return {
      success: false,
      error: 'NO_GROQ_API_KEY',
    };
  }

  const modelsToTry = [
    preferred,
    ...GROQ_AVAILABLE_MODELS.map(m => m.id).filter(m => m !== preferred),
  ];

  let lastError = '';

  for (const model of modelsToTry) {
    try {
      const url = 'https://api.groq.com/openai/v1/chat/completions';
      const messages: any[] = [];
      if (systemInstruction) {
        messages.push({ role: 'system', content: systemInstruction + '\nCRITICAL: Always output strictly valid JSON without extra markdown.' });
      }
      messages.push({ role: 'user', content: prompt });

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages,
          response_format: { type: 'json_object' },
          temperature: 0.2,
        }),
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        const errMsg = errJson?.error?.message || `HTTP ${response.status}`;
        lastError = `[${model}] ${errMsg}`;

        if (response.status === 401 || (response.status === 400 && errMsg.includes('API key'))) {
          return { success: false, error: errMsg };
        }
        continue;
      }

      const resJson = await response.json();
      const candidateText = resJson?.choices?.[0]?.message?.content || '';

      if (!candidateText) continue;

      let cleaned = candidateText.trim();
      if (cleaned.startsWith('```')) {
        cleaned = cleaned.replace(/^```[a-z]*\s*/i, '').replace(/\s*```$/, '');
      }
      const parsed = JSON.parse(cleaned) as T;
      return { success: true, data: parsed, rawText: candidateText, modelUsed: model };
    } catch (err: any) {
      lastError = err?.message || 'Network request failed';
    }
  }

  return {
    success: false,
    error: lastError || 'Failed to generate response from Groq.',
  };
}
