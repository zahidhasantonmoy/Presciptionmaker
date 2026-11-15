import React, { useState, useEffect } from 'react';
import {
  Sparkles, Key, CheckCircle, XCircle, ExternalLink, X,
  Loader2, ShieldCheck, Trash2, Cpu, Zap
} from 'lucide-react';
import {
  getGeminiApiKey, setGeminiApiKey, testGeminiApiKey,
  getPreferredModel, setPreferredModel, AVAILABLE_MODELS
} from '../../services/ai/geminiClient';

interface GeminiApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: () => void;
}

export function GeminiApiKeyModal({ isOpen, onClose, onSaved }: GeminiApiKeyModalProps) {
  const [key, setKey] = useState('');
  const [selectedModel, setSelectedModel] = useState('gemini-2.5-flash-lite');
  const [showKey, setShowKey] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    if (isOpen) {
      setKey(getGeminiApiKey());
      setSelectedModel(getPreferredModel());
      setTestResult(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTest = async () => {
    if (!key.trim()) {
      setTestResult({ success: false, message: 'Please enter a Gemini API Key first.' });
      return;
    }
    setTesting(true);
    setTestResult(null);
    const result = await testGeminiApiKey(key.trim(), selectedModel);
    setTesting(false);
    setTestResult(result);
  };

  const handleSave = () => {
    setGeminiApiKey(key.trim());
    setPreferredModel(selectedModel);
    if (onSaved) onSaved();
    onClose();
  };

  const handleClear = () => {
    setKey('');
    setGeminiApiKey('');
    setTestResult(null);
    if (onSaved) onSaved();
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
          maxWidth: 500,
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 30px rgba(59, 130, 246, 0.2)',
          color: '#f8fafc',
          padding: 24,
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 10,
                background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
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
                Google Gemini AI Settings
              </h3>
              <p style={{ margin: 0, fontSize: 12, color: '#94a3b8' }}>
                মডেল ও ভলিউম কোটা নির্বাচন (Flash Lite 500 RPD)
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

        {/* Gemini Model Selector */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12, fontWeight: 600, color: '#cbd5e1', marginBottom: 6 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <Cpu size={13} color="#60a5fa" /> পছন্দসই AI মডেল নির্বাচন
            </span>
            <span style={{ fontSize: 11, color: '#10b981', fontWeight: 700 }}>
              🔥 Flash Lite = 500 Requests/Day
            </span>
          </label>

          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
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

        {/* API Key Input */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#cbd5e1', marginBottom: 6 }}>
            Gemini API Key
          </label>
          <div style={{ position: 'relative' }}>
            <input
              type={showKey ? 'text' : 'password'}
              value={key}
              onChange={(e) => setKey(e.target.value)}
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
              onClick={() => setShowKey(!showKey)}
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
              {showKey ? 'Hide' : 'Show'}
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
              <span>Get Free Gemini Key from Google AI Studio</span>
              <ExternalLink size={11} />
            </a>
            {key && (
              <button
                type="button"
                onClick={handleClear}
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

        {/* Test Result Message */}
        {testResult && (
          <div
            style={{
              padding: '8px 12px',
              borderRadius: 8,
              fontSize: 12,
              marginBottom: 16,
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

        <div style={{ background: 'rgba(30, 41, 59, 0.5)', padding: 10, borderRadius: 8, fontSize: 11.5, color: '#94a3b8', marginBottom: 18, lineHeight: 1.5 }}>
          💡 <strong>অটোমেটিক ফলব্যাক:</strong> কোনো মডেলে লিমিট শেষ হলে (যেমন ২০ রিকোয়েস্ট পার ডে), সিস্টেম নিজে থেকেই পরবর্তী <strong>Flash Lite (৫০০ রিকোয়েস্ট/দিন)</strong> মডেলে অটো সুইচ করে সার্ভিস চালু রাখবে!
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
            {testing ? 'Testing...' : 'Test Model'}
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
