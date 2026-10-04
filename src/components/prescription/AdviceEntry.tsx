import React, { useState } from 'react';
import { Star, ChevronDown, ChevronUp } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { VoiceDictationButton } from '../ui/VoiceDictationButton';

interface AdviceEntryProps {
  advice: string;
  adviceBn: string;
  onAdviceChange: (value: string) => void;
  onAdviceBnChange: (value: string) => void;
}

export function AdviceEntry({ advice, adviceBn, onAdviceChange, onAdviceBnChange }: AdviceEntryProps) {
  const adviceTemplates = useStore(s => s.adviceTemplates);
  const [showTemplates, setShowTemplates] = useState(false);

  const applyTemplate = (content: string, contentBn?: string) => {
    onAdviceChange(advice ? `${advice}\n${content}` : content);
    if (contentBn) onAdviceBnChange(adviceBn ? `${adviceBn}\n${contentBn}` : contentBn);
    setShowTemplates(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {/* Templates toggle */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button className="btn-ghost btn-sm" onClick={() => setShowTemplates(!showTemplates)}>
          <Star size={13} /> Advice Templates {showTemplates ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
        </button>
      </div>

      {showTemplates && (
        <div style={{
          background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 8, padding: 10,
          display: 'flex', flexDirection: 'column', gap: 6,
        }}>
          {adviceTemplates.length === 0 && (
            <div style={{ color: '#92400e', fontSize: 12 }}>No advice templates saved. Go to Settings to add some.</div>
          )}
          {adviceTemplates.map(t => (
            <div key={t.id} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '6px 10px', background: 'white', borderRadius: 6,
              border: '1px solid #fde68a', cursor: 'pointer',
            }}
              onClick={() => applyTemplate(t.content, t.contentBn)}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 13 }}>{t.title}</div>
                <div style={{ fontSize: 11, color: '#78716c' }}>{t.content.substring(0, 60)}...</div>
              </div>
              <span className="badge badge-yellow" style={{ fontSize: 10 }}>Apply</span>
            </div>
          ))}
        </div>
      )}

      {/* English advice */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 }}>
          <label className="form-label" style={{ margin: 0 }}>Advice (English)</label>
          <VoiceDictationButton
            lang="en-US"
            onTranscript={t => onAdviceChange(advice ? `${advice}\n${t}` : t)}
            title="Dictate advice in English"
          />
        </div>
        <textarea
          className="form-input"
          value={advice}
          onChange={e => onAdviceChange(e.target.value)}
          placeholder="Enter advice in English..."
          rows={3}
          style={{ resize: 'vertical', lineHeight: 1.6 }}
        />
      </div>

      {/* Bangla advice */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 }}>
          <label className="form-label" style={{ margin: 0 }}>পরামর্শ (বাংলা)</label>
          <VoiceDictationButton
            lang="bn-BD"
            onTranscript={t => onAdviceBnChange(adviceBn ? `${adviceBn}\n${t}` : t)}
            title="পরামর্শ বাংলায় মুখে বলুন (ভয়েস টাইপিং)"
          />
        </div>
        <textarea
          className="form-input bn"
          value={adviceBn}
          onChange={e => onAdviceBnChange(e.target.value)}
          placeholder="বাংলায় পরামর্শ লিখুন (যেমন: গরম পানির সেঁক দিবেন, চেয়ারে বসে নামাজ পড়বেন)..."
          rows={3}
          style={{ resize: 'vertical', lineHeight: 1.7, fontFamily: 'var(--font-bn), sans-serif' }}
        />
      </div>
    </div>
  );
}
