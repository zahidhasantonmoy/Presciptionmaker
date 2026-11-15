import React, { useState, useEffect } from 'react';
import {
  Sparkles, ArrowRight, Lightbulb, Zap, Wifi, WifiOff,
  Compass, Loader2, CheckCircle2
} from 'lucide-react';
import { ServiceId } from '../../utils/navigation';
import { detectServiceFromPrompt } from '../../services/ai/aiGenerators';

interface HomeAiCommandHubProps {
  onSelectService: (id: ServiceId) => void;
}

const TOOL_META: Record<Exclude<ServiceId, 'hub'>, { name: string; icon: string; color: string; desc: string }> = {
  ticket: { name: 'Ticket Maker', icon: '🎟️', color: '#f59e0b', desc: 'ট্রেনের টিকিট ও রুট' },
  prescription: { name: 'Prescription Maker', icon: '🏥', color: '#3b82f6', desc: 'রোগীর প্রেসক্রিপশন' },
  invoice: { name: 'Invoice Maker', icon: '🧾', color: '#10b981', desc: 'বিল ও ইনভয়েস' },
  certificate: { name: 'Certificate Maker', icon: '🏆', color: '#a855f7', desc: 'সনদপত্র ও অ্যাওয়ার্ড' },
  idcard: { name: 'ID Card Maker', icon: '🪪', color: '#06b6d4', desc: 'অফিসিয়াল আইডি ব্যাজ' },
};

const SUGGESTIONS = [
  { text: 'আগামীকাল পদ্মা এক্সপ্রেস এ ১ জনের টিকিট বানাও', service: 'ticket' as ServiceId, label: '🎟️ টিকিট' },
  { text: 'রোগী জ্বর ও কাশি ৩ দিন, নাপা এক্সটেন্ড এবং কাশির সিরাপ প্রেসক্রাইব কর', service: 'prescription' as ServiceId, label: '🏥 প্রেসক্রিপশন' },
  { text: 'ওয়েব ডেভেলপমেন্ট সার্ভিস ৫০,০০০ টাকা ক্লায়েন্ট এপেক্স সলিউশন', service: 'invoice' as ServiceId, label: '🧾 ইনভয়েস' },
  { text: 'সারাহ রহমান - এক্সেলেন্স ইন ওয়েব ডিজাইন সার্টিফিকেট', service: 'certificate' as ServiceId, label: '🏆 সার্টিফিকেট' },
  { text: 'তানভীর আহমেদ - সিনিয়র সফটওয়্যার ইঞ্জিনিয়ার, ব্লাড O+ আইডি কার্ড', service: 'idcard' as ServiceId, label: '🪪 আইডি কার্ড' },
];

export function HomeAiCommandHub({ onSelectService }: HomeAiCommandHubProps) {
  const [prompt, setPrompt] = useState('');
  const [selectedToolOverride, setSelectedToolOverride] = useState<ServiceId | 'auto'>('auto');
  const [dispatching, setDispatching] = useState(false);
  const [dispatchedTool, setDispatchedTool] = useState<string | null>(null);
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

  // Compute detected target service in real-time as user types
  const detectedService = selectedToolOverride !== 'auto'
    ? selectedToolOverride
    : (prompt.trim() ? detectServiceFromPrompt(prompt) : 'ticket');

  const targetMeta = detectedService !== 'hub' ? TOOL_META[detectedService as Exclude<ServiceId, 'hub'>] : TOOL_META.ticket;

  const handleExecute = (overridePrompt?: string, overrideService?: ServiceId) => {
    const textToRun = (overridePrompt || prompt).trim();
    if (!textToRun || dispatching) return;

    const target = overrideService || (selectedToolOverride !== 'auto' ? selectedToolOverride : detectServiceFromPrompt(textToRun));

    setDispatching(true);
    setDispatchedTool(target);

    // Save prompt so target tool executes automatically on load
    try {
      sessionStorage.setItem('pending_ai_prompt', textToRun);
    } catch {
      // ignore
    }

    // Smooth transition
    setTimeout(() => {
      onSelectService(target);
    }, 400);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleExecute();
    }
  };

  return (
    <div
      style={{
        background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.95) 100%)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(99, 102, 241, 0.35)',
        borderRadius: 18,
        padding: '20px 24px',
        marginBottom: 32,
        boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.6), 0 0 35px rgba(99, 102, 241, 0.15)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Glow highlight in background */}
      <div
        style={{
          position: 'absolute',
          top: -60,
          right: -60,
          width: 200,
          height: 200,
          background: 'radial-gradient(circle, rgba(139, 92, 246, 0.25) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      {/* Top Header Row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, flexWrap: 'wrap', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 10,
              background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 15px rgba(139, 92, 246, 0.5)',
            }}
          >
            <Sparkles size={17} color="#fff" />
          </div>
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 800, margin: 0, color: '#fff', letterSpacing: '-0.01em' }}>
              Central AI Command Hub
            </h2>
            <p style={{ fontSize: 11.5, color: '#94a3b8', margin: 0 }}>
              যেকোনো প্রম্পট লিখুন — AI নিজে নির্দিষ্ট টুল বেছে নিয়ে কাজ সম্পন্ন করবে
            </p>
          </div>
        </div>

        {/* Real-time Target Tool Badge & Network status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              padding: '4px 10px',
              borderRadius: 20,
              background: 'rgba(30, 41, 59, 0.8)',
              border: `1px solid ${targetMeta.color}`,
              fontSize: 11.5,
              fontWeight: 700,
              color: '#f8fafc',
            }}
          >
            <span>টার্গেট টুল:</span>
            <span style={{ color: targetMeta.color, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <span>{targetMeta.icon}</span>
              <span>{targetMeta.name}</span>
            </span>
          </div>

          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              fontSize: 11,
              padding: '3px 8px',
              borderRadius: 12,
              background: online ? 'rgba(59, 130, 246, 0.15)' : 'rgba(16, 185, 129, 0.15)',
              border: `1px solid ${online ? 'rgba(59, 130, 246, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`,
              color: online ? '#93c5fd' : '#34d399',
            }}
          >
            {online ? <Wifi size={11} /> : <Zap size={11} />}
            <span>{online ? 'Online' : 'Offline PWA'}</span>
          </div>
        </div>
      </div>

      {/* Main Command Input Row */}
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 14 }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="যেমন: 'আগামীকাল পদ্মা এক্সপ্রেস এ ১ জনের টিকিট বানাও' বা 'রোগী জ্বর ৩ দিন নাপা এক্সটেন্ড'"
            disabled={dispatching}
            style={{
              width: '100%',
              background: '#0b1120',
              border: '1px solid #334155',
              borderRadius: 12,
              padding: '13px 18px',
              color: '#fff',
              fontSize: 14,
              outline: 'none',
              boxSizing: 'border-box',
              boxShadow: 'inset 0 2px 6px rgba(0, 0, 0, 0.5)',
              transition: 'border-color 0.2s, box-shadow 0.2s',
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#6366f1';
              e.target.style.boxShadow = '0 0 15px rgba(99, 102, 241, 0.3)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#334155';
              e.target.style.boxShadow = 'inset 0 2px 6px rgba(0, 0, 0, 0.5)';
            }}
          />
        </div>

        <button
          type="button"
          onClick={() => handleExecute()}
          disabled={dispatching || !prompt.trim()}
          style={{
            background: dispatching || !prompt.trim()
              ? '#334155'
              : 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            color: '#fff',
            border: 'none',
            borderRadius: 12,
            padding: '13px 24px',
            fontSize: 13.5,
            fontWeight: 700,
            cursor: dispatching || !prompt.trim() ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            boxShadow: dispatching || !prompt.trim() ? 'none' : '0 4px 16px rgba(139, 92, 246, 0.4)',
            whiteSpace: 'nowrap',
            transition: 'all 0.15s ease',
          }}
        >
          {dispatching ? (
            <>
              <Loader2 size={16} className="spin" />
              <span>ওপেন হচ্ছে...</span>
            </>
          ) : (
            <>
              <span>তৈরি করুন</span>
              <ArrowRight size={16} />
            </>
          )}
        </button>
      </div>

      {/* Tool Selector Filter Chips */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
        <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>টুল ফিল্টার:</span>

        <button
          type="button"
          onClick={() => setSelectedToolOverride('auto')}
          style={{
            background: selectedToolOverride === 'auto' ? '#4f46e5' : 'rgba(30, 41, 59, 0.6)',
            border: `1px solid ${selectedToolOverride === 'auto' ? '#818cf8' : 'rgba(255, 255, 255, 0.08)'}`,
            color: selectedToolOverride === 'auto' ? '#fff' : '#94a3b8',
            padding: '4px 10px',
            borderRadius: 20,
            fontSize: 11,
            fontWeight: 600,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
          }}
        >
          <Zap size={11} />
          <span>অটো ডিটেক্ট (Auto)</span>
        </button>

        {(Object.entries(TOOL_META) as [Exclude<ServiceId, 'hub'>, typeof TOOL_META['ticket']][]).map(([id, meta]) => {
          const isSelected = selectedToolOverride === id || (selectedToolOverride === 'auto' && detectedService === id && prompt.trim().length > 0);
          return (
            <button
              key={id}
              type="button"
              onClick={() => setSelectedToolOverride(id)}
              style={{
                background: isSelected ? meta.color : 'rgba(30, 41, 59, 0.6)',
                border: `1px solid ${isSelected ? meta.color : 'rgba(255, 255, 255, 0.08)'}`,
                color: isSelected ? '#000' : '#cbd5e1',
                padding: '4px 10px',
                borderRadius: 20,
                fontSize: 11,
                fontWeight: isSelected ? 800 : 500,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                transition: 'all 0.15s ease',
              }}
            >
              <span>{meta.icon}</span>
              <span>{meta.name}</span>
            </button>
          );
        })}
      </div>

      {/* Suggested Command Chips */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 11, color: '#64748b', display: 'flex', alignItems: 'center', gap: 4 }}>
          <Lightbulb size={12} color="#f59e0b" /> প্রম্পট উদাহরণ:
        </span>
        {SUGGESTIONS.map((item, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => {
              setPrompt(item.text);
              handleExecute(item.text, item.service);
            }}
            disabled={dispatching}
            style={{
              background: 'rgba(30, 41, 59, 0.5)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              color: '#cbd5e1',
              padding: '4px 9px',
              borderRadius: 14,
              fontSize: 11,
              cursor: 'pointer',
              textAlign: 'left',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              transition: 'all 0.15s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(99, 102, 241, 0.2)';
              e.currentTarget.style.color = '#fff';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(30, 41, 59, 0.5)';
              e.currentTarget.style.color = '#cbd5e1';
            }}
          >
            <span>{item.text}</span>
          </button>
        ))}
      </div>

      {/* Dispatching state banner */}
      {dispatching && dispatchedTool && (
        <div
          style={{
            marginTop: 14,
            padding: '10px 14px',
            borderRadius: 8,
            background: 'rgba(99, 102, 241, 0.15)',
            border: '1px solid rgba(99, 102, 241, 0.4)',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            fontSize: 12.5,
            color: '#c7d2fe',
          }}
        >
          <Loader2 size={16} className="spin" color="#818cf8" />
          <span>
            🚀 <strong>{TOOL_META[dispatchedTool as Exclude<ServiceId, 'hub'>]?.name || dispatchedTool}</strong>-এ রিডাইরেক্ট করে ডেটা ও পিডিএফ তৈরি করা হচ্ছে...
          </span>
        </div>
      )}
    </div>
  );
}
