import React, { useState, useEffect } from 'react';
import {
  Sparkles, Send, Loader2, Key, CheckCircle2,
  FileText, Eye, AlertCircle, RefreshCw, Lightbulb, Wifi, WifiOff, Zap
} from 'lucide-react';
import { hasGeminiApiKey } from '../../services/ai/geminiClient';
import { GeminiApiKeyModal } from './GeminiApiKeyModal';

export interface AiCommandBarProps {
  toolName: 'ticket' | 'prescription' | 'invoice' | 'certificate' | 'idcard';
  placeholder?: string;
  suggestions?: string[];
  onGenerate: (prompt: string) => Promise<string | void>;
  onReviewPdf?: () => void;
  onViewPreview?: () => void;
}

const DEFAULT_SUGGESTIONS: Record<string, string[]> = {
  ticket: [
    'আগামীকাল পদ্মা এক্সপ্রেস এ ১ জনের টিকিট বানাও',
    'ঢাকা থেকে চট্টগ্রাম সোনার বাংলা ২ জন স্নিগ্ধা',
    'কক্সবাজার এক্সপ্রেস ২ জনের টিকিট পরশু দিন',
    'চিত্রা এক্সপ্রেস ঢাকা থেকে ভেড়ামারা ১ জন শোবন চেয়ার',
  ],
  prescription: [
    'রোগী জ্বর ও কাশি ৩ দিন, নাপা এক্সটেন্ড এবং কাশির সিরাপ',
    'ডায়াবেটিস এবং উচ্চ রক্তচাপের রেগুলার প্রেসক্রিপশন',
    'পেটে তীব্র ব্যথা ও গ্যাস্ট্রিক সমস্যা, ওমিপ্রাজল ও এন্টাসিড',
  ],
  invoice: [
    'ওয়েব ডেভেলপমেন্ট ও সার্ভার সেটআপ, ক্লায়েন্ট রহিম এন্টারপ্রাইজ, ৫০,০০০ টাকা',
    'UI/UX ডিজাইন প্রজেক্ট ২০,০০০ টাকা, ৫% ডিসকাউন্ট',
  ],
  certificate: [
    'সারাহ রহমান - এক্সেলেন্স ইন ওয়েব ডেভেলপমেন্ট',
    'তানভীর আহমেদ - বেস্ট পারফরমার অ্যাওয়ার্ড ২০২৬',
  ],
  idcard: [
    'তানভীর আহমেদ - সিনিয়র সফটওয়্যার ইঞ্জিনিয়ার, ডিপার্টমেন্ট এআই',
    'ফারহানা হক - প্রোডাক্ট ডিজাইনার, ব্লাড গ্রুপ O+',
  ],
};

export function AiCommandBar({
  toolName,
  placeholder,
  suggestions,
  onGenerate,
  onReviewPdf,
  onViewPreview,
}: AiCommandBarProps) {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [lastSummary, setLastSummary] = useState<string | null>(null);
  const [keyModalOpen, setKeyModalOpen] = useState(false);
  const [hasKey, setHasKey] = useState(() => hasGeminiApiKey());
  const [online, setOnline] = useState(() => typeof navigator !== 'undefined' ? navigator.onLine : true);

  useEffect(() => {
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const activeSuggestions = suggestions || DEFAULT_SUGGESTIONS[toolName] || [];
  const defaultPlaceholder = placeholder || (
    online
      ? 'AI দিয়ে তৈরি করুন... বাংলায় বা ইংরেজিতে লিখুন'
      : '⚡ অফলাইন মোড: বাংলায় বা ইংরেজিতে লিখুন (ইন্টারনেট ছাড়াই তৈরি হবে)'
  );

  const handleRun = async (overridePrompt?: string) => {
    const textToRun = (overridePrompt || prompt).trim();
    if (!textToRun || loading) return;

    setLoading(true);
    setLastSummary(null);

    try {
      const summary = await onGenerate(textToRun);
      if (summary && typeof summary === 'string') {
        setLastSummary(summary);
      } else {
        setLastSummary('সাফল্যের সাথে তৈরি হয়েছে!');
      }
    } catch (err: any) {
      setLastSummary(`Error: ${err?.message || 'প্রসেস করতে সমস্যা হয়েছে'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleRun();
    }
  };

  const selectSuggestion = (s: string) => {
    setPrompt(s);
    handleRun(s);
  };

  return (
    <div
      className="no-print"
      style={{
        background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.95) 100%)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(59, 130, 246, 0.3)',
        borderRadius: 14,
        padding: '12px 16px',
        marginBottom: 16,
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.25), 0 0 15px rgba(59, 130, 246, 0.1)',
        color: '#f8fafc',
        position: 'relative',
      }}
    >
      {/* Top row: Badge & Key status & Online/Offline mode */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, flexWrap: 'wrap', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              background: online
                ? 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)'
                : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: '#fff',
              fontSize: 11,
              fontWeight: 700,
              padding: '3px 9px',
              borderRadius: 20,
              boxShadow: online ? '0 2px 8px rgba(139, 92, 246, 0.4)' : '0 2px 8px rgba(16, 185, 129, 0.4)',
              letterSpacing: '0.3px',
            }}
          >
            {online ? <Sparkles size={12} /> : <Zap size={12} />}
            <span>{online ? 'GEMINI AI PROMPT BAR' : 'OFFLINE AI ENGINE (PWA)'}</span>
          </div>

          <span style={{ fontSize: 11.5, color: '#94a3b8' }}>
            {online ? 'এক ক্লিকে সম্পূর্ণ ডেটা এবং PDF রিভিউ তৈরি করুন' : 'ইন্টারনেট ছাড়াই ১০০% অফলাইনে প্রম্পট প্রসেসিং সক্রিয়'}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Network indicator badge */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              fontSize: 11,
              padding: '2px 7px',
              borderRadius: 12,
              background: online ? 'rgba(59, 130, 246, 0.1)' : 'rgba(16, 185, 129, 0.15)',
              border: `1px solid ${online ? 'rgba(59, 130, 246, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`,
              color: online ? '#93c5fd' : '#34d399',
            }}
            title={online ? 'Online: Cloud AI Active' : 'Offline: Local NLP Active'}
          >
            {online ? <Wifi size={11} /> : <WifiOff size={11} />}
            <span>{online ? 'Online' : 'Offline Ready'}</span>
          </div>

          <button
            type="button"
            onClick={() => setKeyModalOpen(true)}
            style={{
              background: hasKey ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
              border: `1px solid ${hasKey ? 'rgba(16, 185, 129, 0.4)' : 'rgba(245, 158, 11, 0.4)'}`,
              color: hasKey ? '#34d399' : '#fbbf24',
              padding: '3px 8px',
              borderRadius: 6,
              fontSize: 11,
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 5,
            }}
            title={hasKey ? 'Gemini API Key Connected' : 'Click to add Gemini API Key'}
          >
            <Key size={11} />
            <span>{hasKey ? 'Gemini Key Active' : 'Add Gemini Key'}</span>
          </button>
        </div>
      </div>

      {/* Main Input Row */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={defaultPlaceholder}
            disabled={loading}
            style={{
              width: '100%',
              background: '#0f172a',
              border: '1px solid #334155',
              borderRadius: 9,
              padding: '10px 14px',
              color: '#fff',
              fontSize: 13,
              outline: 'none',
              boxSizing: 'border-box',
              boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.4)',
              transition: 'border-color 0.2s',
            }}
            onFocus={(e) => (e.target.style.borderColor = '#3b82f6')}
            onBlur={(e) => (e.target.style.borderColor = '#334155')}
          />
        </div>

        <button
          type="button"
          onClick={() => handleRun()}
          disabled={loading || !prompt.trim()}
          style={{
            background: loading || !prompt.trim()
              ? '#334155'
              : 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
            color: '#fff',
            border: 'none',
            borderRadius: 9,
            padding: '10px 18px',
            fontSize: 12.5,
            fontWeight: 700,
            cursor: loading || !prompt.trim() ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 7,
            boxShadow: loading || !prompt.trim() ? 'none' : '0 4px 12px rgba(37, 99, 235, 0.4)',
            whiteSpace: 'nowrap',
            transition: 'all 0.15s ease',
          }}
        >
          {loading ? (
            <>
              <Loader2 size={14} className="spin" />
              <span>বানানো হচ্ছে...</span>
            </>
          ) : (
            <>
              <Sparkles size={14} />
              <span>Generate / তৈরি করুন</span>
            </>
          )}
        </button>
      </div>

      {/* Suggestion Chips */}
      {activeSuggestions.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginTop: 10 }}>
          <span style={{ fontSize: 11, color: '#64748b', display: 'flex', alignItems: 'center', gap: 4 }}>
            <Lightbulb size={11} color="#f59e0b" /> উদাহরণ:
          </span>
          {activeSuggestions.map((item, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => selectSuggestion(item)}
              disabled={loading}
              style={{
                background: 'rgba(30, 41, 59, 0.6)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                color: '#cbd5e1',
                padding: '3px 8px',
                borderRadius: 14,
                fontSize: 11,
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'background 0.15s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(59, 130, 246, 0.2)';
                e.currentTarget.style.color = '#fff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(30, 41, 59, 0.6)';
                e.currentTarget.style.color = '#cbd5e1';
              }}
            >
              {item}
            </button>
          ))}
        </div>
      )}

      {/* Generated Result & Quick Action bar */}
      {lastSummary && (
        <div
          style={{
            marginTop: 12,
            padding: '10px 14px',
            borderRadius: 8,
            background: 'rgba(16, 185, 129, 0.12)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 3, fontSize: 12, color: '#e2e8f0', flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <CheckCircle2 size={16} color="#34d399" style={{ flexShrink: 0 }} />
              <span style={{ fontWeight: 600 }}>{lastSummary}</span>
            </div>
            <div style={{ fontSize: 11, color: '#93c5fd', paddingLeft: 24 }}>
              ⚡ নিচের সেটিংস ফর্ম ও প্রিভিউ উভয়ই আপডেট হয়েছে — যেকোনো তথ্য সরাসরি ম্যানুয়ালি এডিট করতে পারবেন।
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {onViewPreview && (
              <button
                type="button"
                onClick={onViewPreview}
                style={{
                  background: 'rgba(59, 130, 246, 0.2)',
                  border: '1px solid rgba(59, 130, 246, 0.4)',
                  color: '#93c5fd',
                  padding: '5px 10px',
                  borderRadius: 6,
                  fontSize: 11.5,
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                <Eye size={12} />
                <span>প্রিভিউ দেখুন</span>
              </button>
            )}

            {onReviewPdf && (
              <button
                type="button"
                onClick={onReviewPdf}
                style={{
                  background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                  border: 'none',
                  color: '#fff',
                  padding: '5px 12px',
                  borderRadius: 6,
                  fontSize: 11.5,
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                  boxShadow: '0 2px 6px rgba(5, 150, 105, 0.4)',
                }}
              >
                <FileText size={13} />
                <span>📄 PDF রিভিউ ও ডাউনলোড</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* API Key Modal */}
      <GeminiApiKeyModal
        isOpen={keyModalOpen}
        onClose={() => setKeyModalOpen(false)}
        onSaved={() => setHasKey(hasGeminiApiKey())}
      />
    </div>
  );
}
