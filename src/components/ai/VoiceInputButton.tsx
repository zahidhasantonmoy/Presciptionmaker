import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Loader2 } from 'lucide-react';

interface VoiceInputButtonProps {
  onTranscript: (text: string) => void;
  lang?: string;
  disabled?: boolean;
}

export function VoiceInputButton({
  onTranscript,
  lang = 'bn-BD',
  disabled = false,
}: VoiceInputButtonProps) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = lang;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        if (currentTranscript && currentTranscript.trim()) {
          onTranscript(currentTranscript.trim());
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition event:', event?.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    } catch (err) {
      console.warn('Failed to initialize speech recognition:', err);
      setIsSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // ignore
        }
      }
    };
  }, [lang, onTranscript]);

  const toggleListening = () => {
    if (!isSupported) {
      alert('আপনার ব্রাউজারটি বাংলা ভয়েস রিকগনিশন সাপোর্ট করে না। Google Chrome বা Microsoft Edge ব্যবহার করুন।');
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current?.start();
      } catch (err) {
        console.warn('Speech recognition start failed:', err);
      }
    }
  };

  if (!isSupported) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={toggleListening}
      disabled={disabled}
      title={isListening ? 'ভয়েস ইনপুট বন্ধ করুন (Listening...)' : 'বাংলা ভয়েস দিয়ে বলুন (Voice Prompt)'}
      style={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: isListening
          ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
          : 'rgba(255, 255, 255, 0.08)',
        border: `1px solid ${isListening ? '#f87171' : 'rgba(255, 255, 255, 0.15)'}`,
        color: isListening ? '#ffffff' : '#94a3b8',
        borderRadius: 8,
        width: 36,
        height: 36,
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'all 0.2s',
        boxShadow: isListening ? '0 0 14px rgba(239, 68, 68, 0.6)' : 'none',
        flexShrink: 0,
      }}
    >
      {isListening ? (
        <>
          <span
            style={{
              position: 'absolute',
              inset: -4,
              borderRadius: 12,
              border: '2px solid rgba(239, 68, 68, 0.6)',
              animation: 'pulse 1.2s infinite',
            }}
          />
          <Mic size={16} />
        </>
      ) : (
        <Mic size={16} />
      )}
      <style>{`
        @keyframes pulse {
          0% { transform: scale(0.95); opacity: 0.8; }
          50% { transform: scale(1.15); opacity: 0.3; }
          100% { transform: scale(0.95); opacity: 0.8; }
        }
      `}</style>
    </button>
  );
}
