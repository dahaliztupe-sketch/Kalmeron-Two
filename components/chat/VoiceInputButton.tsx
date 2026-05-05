"use client";

import { useEffect, useRef, useState } from "react";
import { Mic, MicOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/src/lib/utils";

interface Props {
  onTranscript: (text: string) => void;
  lang?: string;
  className?: string;
}

/**
 * Web Speech API voice input (Arabic by default). Gracefully no-ops on
 * browsers without SpeechRecognition (older Firefox). For those we render
 * a disabled button with a tooltip; the chat still works via typing.
 */
interface SpeechRecognitionResult {
  0: { transcript: string };
}
interface SpeechRecognitionEvent {
  results: ArrayLike<SpeechRecognitionResult>;
}
interface SpeechRecognitionInstance {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((e: SpeechRecognitionEvent) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}
type SpeechRecognitionCtor = new () => SpeechRecognitionInstance;

export function VoiceInputButton({ onTranscript, lang = "ar-EG", className }: Props) {
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const recRef = useRef<SpeechRecognitionInstance | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const w = window as unknown as {
      SpeechRecognition?: SpeechRecognitionCtor;
      webkitSpeechRecognition?: SpeechRecognitionCtor;
    };
    const SR = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!SR) return;
    void (async () => { setSupported(true); })();
    const r = new SR();
    r.lang = lang;
    r.continuous = false;
    r.interimResults = false;
    r.onresult = (e) => {
      const transcript = Array.from(e.results)
        .map((res) => res[0]?.transcript || "")
        .join(" ")
        .trim();
      if (transcript) onTranscript(transcript);
    };
    r.onend = () => setListening(false);
    r.onerror = () => setListening(false);
    recRef.current = r;
    return () => {
      try { r.abort(); } catch {}
    };
  }, [lang, onTranscript]);

  const toggle = () => {
    const r = recRef.current;
    if (!r) return;
    if (listening) {
      try { r.stop(); } catch {}
      setListening(false);
    } else {
      try {
        r.start();
        setListening(true);
      } catch {
        setListening(false);
      }
    }
  };

  if (!supported) {
    return (
      <Button
        type="button"
        size="icon"
        variant="ghost"
        disabled
        title="المتصفح لا يدعم التعرف على الصوت"
        className={className}
        aria-label="إدخال صوتي غير مدعوم"
      >
        <MicOff className="w-4 h-4" />
      </Button>
    );
  }

  return (
    <Button
      type="button"
      size="icon"
      variant="ghost"
      onClick={toggle}
      title={listening ? "إيقاف التسجيل" : "تحدّث بالعربية"}
      aria-label={listening ? "إيقاف التسجيل" : "بدء الإدخال الصوتي"}
      className={cn(
        listening && "text-rose-400 animate-pulse",
        className
      )}
    >
      <Mic className="w-4 h-4" />
    </Button>
  );
}
