import { callGeminiJson, hasGeminiApiKey, getPreferredModel } from './geminiClient';
import { callGroqJson, hasGroqApiKey, getGroqPreferredModel } from './groqClient';

export interface SmartAiResponse<T = any> {
  success: boolean;
  data?: T;
  provider: 'gemini' | 'groq' | 'offline';
  modelUsed?: string;
  error?: string;
}

export function isOnline(): boolean {
  return typeof navigator !== 'undefined' ? navigator.onLine : true;
}

export function hasAnyAiKey(): boolean {
  return hasGeminiApiKey() || hasGroqApiKey();
}

/**
 * Smart Multi-Provider AI Caller:
 * Priority 1: Google Gemini (High Reasoning & Multilingual)
 * Priority 2 (Fallback): Groq LPU (Ultra-fast Llama-3.3-70B / Instant responses)
 * Priority 3: 100% Client-side Offline Rule-based NLP Engine
 */
export async function callSmartAiJson<T = any>(
  prompt: string,
  systemInstruction: string
): Promise<SmartAiResponse<T>> {
  if (!isOnline()) {
    return {
      success: false,
      provider: 'offline',
      error: 'Device is offline',
    };
  }

  // ─── Priority 1: Google Gemini ───
  // If user has key or serverless endpoint is available
  if (hasGeminiApiKey()) {
    try {
      const geminiRes = await callGeminiJson<T>(prompt, systemInstruction);
      if (geminiRes.success && geminiRes.data) {
        return {
          success: true,
          data: geminiRes.data,
          provider: 'gemini',
          modelUsed: getPreferredModel(),
        };
      }
      // If error (quota limit 429, 404, etc.), automatically cascade to Groq!
    } catch {
      // Cascade to Groq
    }
  }

  // ─── Priority 2 (Automated Fallback): Groq LPU API ───
  // If user has Groq key or serverless Groq endpoint is available
  if (hasGroqApiKey()) {
    try {
      const groqRes = await callGroqJson<T>(prompt, systemInstruction);
      if (groqRes.success && groqRes.data) {
        return {
          success: true,
          data: groqRes.data,
          provider: 'groq',
          modelUsed: groqRes.modelUsed || getGroqPreferredModel(),
        };
      }
    } catch {
      // Cascade to Offline
    }
  }

  // Also try serverless fallback endpoints if user hasn't configured client keys
  if (!hasGeminiApiKey() && !hasGroqApiKey()) {
    // Try Gemini serverless first
    try {
      const geminiRes = await callGeminiJson<T>(prompt, systemInstruction);
      if (geminiRes.success && geminiRes.data) {
        return {
          success: true,
          data: geminiRes.data,
          provider: 'gemini',
          modelUsed: getPreferredModel(),
        };
      }
    } catch {
      // ignore
    }

    // Try Groq serverless second
    try {
      const groqRes = await callGroqJson<T>(prompt, systemInstruction);
      if (groqRes.success && groqRes.data) {
        return {
          success: true,
          data: groqRes.data,
          provider: 'groq',
          modelUsed: groqRes.modelUsed || getGroqPreferredModel(),
        };
      }
    } catch {
      // ignore
    }
  }

  // ─── Priority 3: Fallback to 100% Offline NLP Engine ───
  return {
    success: false,
    provider: 'offline',
    error: 'Cloud AI unavailable, fallback to offline',
  };
}
