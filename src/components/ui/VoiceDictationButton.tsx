import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff } from 'lucide-react';
import { useToast } from './Toast';

interface VoiceDictationButtonProps {
  onTranscript: (text: string) => void;
  lang?: 'bn-BD' | 'en-US';
  title?: string;
  size?: number;
}

export function VoiceDictationButton({
  onTranscript,
  lang = 'bn-BD',
  title = 'বাংলায় মুখে বলুন (ভয়েস টাইপিং)',
  size = 14
}: VoiceDictationButtonProps) {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  const { showToast } = useToast();

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = lang;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          onTranscript(transcript);
          showToast(`ভয়েস রেকর্ড হয়েছে: "${transcript}"`, 'success');
        }
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        if (event.error === 'not-allowed') {
          showToast('মাইক্রোফোন পারমিশন প্রয়োজন। ব্রাউজার সেটিংসে গিয়ে পারমিশন অন করুন।', 'error');
        } else if (event.error !== 'no-speech') {
          showToast(`ভয়েস টাইপিং সমস্যা: ${event.error}`, 'error');
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
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
  }, [lang, onTranscript, showToast]);

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!recognitionRef.current) {
      showToast('ভয়েস টাইপিং শুধুমাত্র Google Chrome ও Edge ব্রাউজারে সাপোর্টেড।', 'info');
      return;
    }

    if (isListening) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        showToast('🎙️ কথা বলুন (বাংলায় শুনছি)...', 'info');
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <button
      type="button"
      className={`btn-icon ${isListening ? 'listening-pulse' : ''}`}
      style={{
        width: 26,
        height: 26,
        padding: 0,
        background: isListening ? '#fee2e2' : '#f8fafc',
        color: isListening ? '#ef4444' : '#64748b',
        border: `1px solid ${isListening ? '#fca5a5' : '#cbd5e1'}`,
        borderRadius: 6,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.15s ease',
        cursor: 'pointer',
      }}
      onClick={handleToggle}
      title={isListening ? 'রেকর্ডিং বন্ধ করতে ক্লিক করুন' : title}
    >
      {isListening ? <MicOff size={size} color="#ef4444" /> : <Mic size={size} />}
    </button>
  );
}
