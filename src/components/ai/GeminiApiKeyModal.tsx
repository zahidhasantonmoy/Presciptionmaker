import React, { useState, useEffect } from 'react';
import {
  Sparkles, CheckCircle, XCircle, ExternalLink, X,
  Loader2, ShieldCheck, Trash2, Cpu, Zap, Layers, RefreshCw
} from 'lucide-react';
import {
  getGeminiApiKey, setGeminiApiKey, testGeminiApiKey,
  getPreferredModel, setPreferredModel, AVAILABLE_MODELS
} from '../../services/ai/geminiClient';
import {
  getGroqApiKey, setGroqApiKey, testGroqApiKey,
  getGroqPreferredModel, setGroqPreferredModel, GROQ_AVAILABLE_MODELS
} from '../../services/ai/groqClient';

interface GeminiApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: () => void;
}

export function GeminiApiKeyModal({ isOpen, onClose, onSaved }: GeminiApiKeyModalProps) {
  const [activeTab, setActiveTab] = useState<'gemini' | 'groq'>('gemini');

  // Gemini state
  const [geminiKey, setGeminiKey] = useState('');
  const [geminiModel, setGeminiModel] = useState('gemini-2.5-flash-lite');
  const [showGeminiKey, setShowGeminiKey] = useState(false);

  // Groq state
  const [groqKey, setGroqKey] = useState('');
  const [groqModel, setGroqModel] = useState('llama-3.3-70b-versatile');
  const [showGroqKey, setShowGroqKey] = useState(false);

  // Testing & Feedback
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    if (isOpen) {
      setGeminiKey(getGeminiApiKey());
      const prefGemini = getPreferredModel();
      setGeminiModel(prefGemini.includes('2.0-flash-lite') ? 'gemini-2.5-flash-lite' : prefGemini);
      setGroqKey(getGroqApiKey());
      setGroqModel(getGroqPreferredModel());
      setTestResult(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);

    if (activeTab === 'gemini') {
      if (!geminiKey.trim()) {
        setTestResult({ success: false, message: 'অনুগ্রহ করে প্রথমে Gemini API Key প্রবেশ করান।' });
        setTesting(false);
        return;
      }
      const result = await testGeminiApiKey(geminiKey.trim(), geminiModel);
      setTestResult(result);
    } else {
      if (!groqKey.trim()) {
        setTestResult({ success: false, message: 'অনুগ্রহ করে প্রথমে Groq API Key প্রবেশ করান।' });
        setTesting(false);
        return;
      }
      const result = await testGroqApiKey(groqKey.trim(), groqModel);
      setTestResult(result);
    }

    setTesting(false);
  };

  const handleSave = () => {
    setGeminiApiKey(geminiKey.trim());
    setPreferredModel(geminiModel);
    setGroqApiKey(groqKey.trim());
    setGroqPreferredModel(groqModel);

    if (onSaved) onSaved();
    onClose();
  };

  const handleClearGemini = () => {
    setGeminiKey('');
    setGeminiApiKey('');
    setTestResult(null);
  };

  const handleClearGroq = () => {
    setGroqKey('');
    setGroqApiKey('');
    setTestResult(null);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(8px)',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#0f172a',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          borderRadius: 16,
          width: '100%',
          maxWidth: 530,
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 30px rgba(59, 130, 246, 0.2)',
          color: '#f8fafc',
          padding: 24,
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 50%, #f97316 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 16px rgba(139, 92, 246, 0.4)',
              }}
            >
              <Sparkles size={20} color="#fff" />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#fff' }}>
                AI Engine Settings & Multi-Provider Fallback
              </h3>
              <p style={{ margin: 0, fontSize: 11.5, color: '#94a3b8' }}>
                Google Gemini + Groq LPU আল্ট্রা-ফাস্ট ব্যাকআপ
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: 4,
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Status Indicator Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(30, 41, 59, 0.6)',
            padding: '7px 12px',
            borderRadius: 8,
            marginBottom: 14,
            fontSize: 11.5,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Layers size={13} color="#60a5fa" />
            <span style={{ color: '#cbd5e1', fontWeight: 600 }}>Active Engines:</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span
              style={{
                padding: '2px 7px',
                borderRadius: 12,
                fontSize: 10.5,
                fontWeight: 600,
                background: geminiKey.trim() ? 'rgba(16, 185, 129, 0.15)' : 'rgba(148, 163, 184, 0.15)',
                color: geminiKey.trim() ? '#34d399' : '#94a3b8',
                border: `1px solid ${geminiKey.trim() ? 'rgba(16, 185, 129, 0.3)' : 'rgba(148, 163, 184, 0.3)'}`,
              }}
            >
              Gemini {geminiKey.trim() ? '✓ Active' : '○ Not set'}
            </span>
            <span
              style={{
                padding: '2px 7px',
                borderRadius: 12,
                fontSize: 10.5,
                fontWeight: 600,
                background: groqKey.trim() ? 'rgba(249, 115, 22, 0.15)' : 'rgba(148, 163, 184, 0.15)',
                color: groqKey.trim() ? '#fb923c' : '#94a3b8',
                border: `1px solid ${groqKey.trim() ? 'rgba(249, 115, 22, 0.3)' : 'rgba(148, 163, 184, 0.3)'}`,
              }}
            >
              Groq {groqKey.trim() ? '✓ Fallback Ready' : '○ Not set'}
            </span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
          <button
            type="button"
            onClick={() => {
              setActiveTab('gemini');
              setTestResult(null);
            }}
            style={{
              flex: 1,
              padding: '8px 12px',
              borderRadius: 8,
              fontSize: 12,
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              transition: 'all 0.2s',
              background: activeTab === 'gemini' ? 'linear-gradient(135deg, #2563eb, #3b82f6)' : '#1e293b',
              color: activeTab === 'gemini' ? '#fff' : '#94a3b8',
              border: `1px solid ${activeTab === 'gemini' ? '#3b82f6' : '#334155'}`,
            }}
          >
            <Sparkles size={14} />
            <span>1. Google Gemini (Primary)</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('groq');
              setTestResult(null);
            }}
            style={{
              flex: 1,
              padding: '8px 12px',
              borderRadius: 8,
              fontSize: 12,
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              transition: 'all 0.2s',
              background: activeTab === 'groq' ? 'linear-gradient(135deg, #ea580c, #f97316)' : '#1e293b',
              color: activeTab === 'groq' ? '#fff' : '#94a3b8',
              border: `1px solid ${activeTab === 'groq' ? '#f97316' : '#334155'}`,
            }}
          >
            <Zap size={14} />
            <span>2. Groq AI (LPU Fallback)</span>
          </button>
        </div>

        {/* TAB 1: GEMINI */}
        {activeTab === 'gemini' && (
          <div>
            {/* Gemini Model Selector */}
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12, fontWeight: 600, color: '#cbd5e1', marginBottom: 6 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <Cpu size={13} color="#60a5fa" /> Gemini মডেল নির্বাচন
                </span>
                <span style={{ fontSize: 11, color: '#10b981', fontWeight: 700 }}>
                  🔥 Flash Lite = 500 Requests/Day
                </span>
              </label>

              <select
                value={geminiModel}
                onChange={(e) => setGeminiModel(e.target.value)}
                style={{
                  width: '100%',
                  background: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: 8,
                  padding: '9px 12px',
                  color: '#fff',
                  fontSize: 12.5,
                  outline: 'none',
                  cursor: 'pointer',
                }}
              >
                {AVAILABLE_MODELS.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} [{m.limit}] — {m.desc}
                  </option>
                ))}
              </select>
            </div>

            {/* Gemini API Key Input */}
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#cbd5e1', marginBottom: 6 }}>
                Gemini API Key
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showGeminiKey ? 'text' : 'password'}
                  value={geminiKey}
                  onChange={(e) => setGeminiKey(e.target.value)}
                  placeholder="AIzaSy..."
                  style={{
                    width: '100%',
                    background: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: 8,
                    padding: '10px 40px 10px 12px',
                    color: '#fff',
                    fontSize: 13,
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowGeminiKey(!showGeminiKey)}
                  style={{
                    position: 'absolute',
                    right: 8,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: '#94a3b8',
                    fontSize: 11,
                    cursor: 'pointer',
                    padding: '4px 6px',
                  }}
                >
                  {showGeminiKey ? 'Hide' : 'Show'}
                </button>
              </div>

              <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 11.5 }}>
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: '#60a5fa',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                    textDecoration: 'none',
                  }}
                >
                  <span>Google AI Studio থেকে ফ্রি Gemini Key নিন</span>
                  <ExternalLink size={11} />
                </a>
                {geminiKey && (
                  <button
                    type="button"
                    onClick={handleClearGemini}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#ef4444',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 3,
                      fontSize: 11,
                    }}
                  >
                    <Trash2 size={11} /> Clear
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: GROQ */}
        {activeTab === 'groq' && (
          <div>
            {/* Groq Model Selector */}
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12, fontWeight: 600, color: '#cbd5e1', marginBottom: 6 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <Cpu size={13} color="#f97316" /> Groq LPU মডেল নির্বাচন
                </span>
                <span style={{ fontSize: 11, color: '#f97316', fontWeight: 700 }}>
                  ⚡ Ultra-Fast 500+ Tokens/sec
                </span>
              </label>

              <select
                value={groqModel}
                onChange={(e) => setGroqModel(e.target.value)}
                style={{
                  width: '100%',
                  background: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: 8,
                  padding: '9px 12px',
                  color: '#fff',
                  fontSize: 12.5,
                  outline: 'none',
                  cursor: 'pointer',
                }}
              >
                {GROQ_AVAILABLE_MODELS.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} — {m.desc}
                  </option>
                ))}
              </select>
            </div>

            {/* Groq API Key Input */}
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#cbd5e1', marginBottom: 6 }}>
                Groq API Key
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showGroqKey ? 'text' : 'password'}
                  value={groqKey}
                  onChange={(e) => setGroqKey(e.target.value)}
                  placeholder="gsk_..."
                  style={{
                    width: '100%',
                    background: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: 8,
                    padding: '10px 40px 10px 12px',
                    color: '#fff',
                    fontSize: 13,
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowGroqKey(!showGroqKey)}
                  style={{
                    position: 'absolute',
                    right: 8,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: '#94a3b8',
                    fontSize: 11,
                    cursor: 'pointer',
                    padding: '4px 6px',
                  }}
                >
                  {showGroqKey ? 'Hide' : 'Show'}
                </button>
              </div>

              <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 11.5 }}>
                <a
                  href="https://console.groq.com/keys"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: '#fb923c',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                    textDecoration: 'none',
                  }}
                >
                  <span>console.groq.com/keys থেকে ফ্রি Groq Key নিন (14,400+ RPD)</span>
                  <ExternalLink size={11} />
                </a>
                {groqKey && (
                  <button
                    type="button"
                    onClick={handleClearGroq}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#ef4444',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 3,
                      fontSize: 11,
                    }}
                  >
                    <Trash2 size={11} /> Clear
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Test Result Message */}
        {testResult && (
          <div
            style={{
              padding: '8px 12px',
              borderRadius: 8,
              fontSize: 12,
              marginBottom: 14,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: testResult.success ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
              border: `1px solid ${testResult.success ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
              color: testResult.success ? '#34d399' : '#f87171',
            }}
          >
            {testResult.success ? <CheckCircle size={15} /> : <XCircle size={15} />}
            <span>{testResult.message}</span>
          </div>
        )}

        {/* Triple Cascade Explanation Box */}
        <div
          style={{
            background: 'rgba(30, 41, 59, 0.5)',
            padding: '10px 12px',
            borderRadius: 8,
            fontSize: 11.5,
            color: '#94a3b8',
            marginBottom: 16,
            lineHeight: 1.5,
            border: '1px solid rgba(255, 255, 255, 0.05)',
          }}
        >
          <div style={{ color: '#cbd5e1', fontWeight: 600, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 5 }}>
            <RefreshCw size={12} color="#60a5fa" /> ট্রিপল-লেয়ার স্বয়ংক্রিয় ব্যাকআপ আর্কিটেকচার:
          </div>
          <div>1️⃣ <strong>Gemini AI:</strong> প্রধান বুদ্ধিমত্তা হিসেবে প্রথমে চেষ্টা করবে।</div>
          <div>2️⃣ <strong>Groq LPU:</strong> Gemini-র লিমিট শেষ হলে বা এরর দিলে মিলি-সেকেন্ডে Groq ব্যাকআপ দেবে।</div>
          <div>3️⃣ <strong>Offline Engine:</strong> ইন্টারনেট না থাকলে অ্যাপ ১০০% লোকাল রুল দিয়ে কাজ চালিয়ে নিবে।</div>
        </div>

        {/* Footer Actions */}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button
            type="button"
            onClick={handleTest}
            disabled={testing}
            style={{
              background: '#1e293b',
              color: '#cbd5e1',
              border: '1px solid #334155',
              padding: '8px 14px',
              borderRadius: 8,
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            {testing ? <Loader2 size={13} className="spin" /> : <ShieldCheck size={13} />}
            {testing ? 'Testing...' : `Test ${activeTab === 'gemini' ? 'Gemini' : 'Groq'}`}
          </button>
          <button
            type="button"
            onClick={handleSave}
            style={{
              background: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)',
              color: '#fff',
              border: 'none',
              padding: '8px 18px',
              borderRadius: 8,
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(37, 99, 235, 0.4)',
            }}
          >
            Save & Continue
          </button>
        </div>
      </div>
    </div>
  );
}
