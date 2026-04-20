// @ts-nocheck
'use client';

import React from 'react';
import { AppShell } from "@/components/layout/AppShell";
import { Mic, Square, Loader2, Volume2, ShieldCheck, Activity } from 'lucide-react';
import { useAudioAgent } from '@/hooks/use-audio-agent';

export default function VoiceAdvisorPage() {
  const { isRecording, isAgentSpeaking, toggleRecording } = useAudioAgent();

  return (
    <AppShell>
      <div className="min-h-[85vh] flex flex-col items-center justify-center p-8 text-white relative overflow-hidden" dir="rtl">
        
        {/* Background ambient effects */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-30">
          <div className={`w-[500px] h-[500px] rounded-full blur-[120px] transition-all duration-1000 ${
            isAgentSpeaking ? 'bg-indigo-600/40 scale-110' : 
            isRecording ? 'bg-rose-600/20 scale-100' : 'bg-neutral-800/50 scale-90'
          }`} />
        </div>

        <div className="z-10 max-w-2xl w-full text-center space-y-12">
          
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-full text-sm font-medium mb-4">
              <Activity className="w-4 h-4" />
              <span>Multimodal Live API (Low Latency)</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">المستشار المالي المباشر</h1>
            <p className="text-xl text-neutral-400 max-w-lg mx-auto">
              تحدث مباشرة مع المدير المالي الافتراضي (CFO) لاستعراض القوائم المالية وطلب المشورة اللحظية بصوتك.
            </p>
          </div>

          {/* Visualization Area */}
          <div className="h-48 flex items-center justify-center">
            {isAgentSpeaking ? (
              <div className="flex flex-col items-center gap-6 animate-in fade-in zoom-in duration-500">
                <div className="relative">
                  <div className="absolute -inset-4 bg-indigo-500/30 blur-xl rounded-full animate-pulse" />
                  <div className="w-24 h-24 bg-indigo-500/20 border-2 border-indigo-400 rounded-full flex items-center justify-center relative z-10">
                    <Volume2 className="w-10 h-10 text-indigo-400 animate-pulse" />
                  </div>
                </div>
                <span className="text-indigo-300 font-medium">الوكيل يتحدث الآن...</span>
              </div>
            ) : isRecording ? (
              <div className="flex flex-col items-center gap-6 animate-in fade-in zoom-in duration-500">
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div 
                      key={i} 
                      className="w-2 bg-rose-500 rounded-full animate-bounce" 
                      style={{ 
                        height: `${Math.max(16, Math.random() * 64)}px`,
                        animationDelay: `${i * 0.1}s` 
                      }} 
                    />
                  ))}
                </div>
                <span className="text-rose-400 font-medium">جاري الاستماع... (تحدث الآن)</span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4 opacity-50">
                <Mic className="w-12 h-12 text-neutral-500" />
                <span className="text-neutral-500 font-medium">انقر للبدء بالمحادثة الصوتية</span>
              </div>
            )}
          </div>

          {/* Action Button */}
          <div className="flex justify-center">
            <button
              onClick={toggleRecording}
              className={`group relative flex items-center justify-center w-24 h-24 rounded-full transition-all duration-300 shadow-2xl ${
                isRecording 
                  ? 'bg-neutral-800 hover:bg-neutral-700 border-2 border-rose-500/50' 
                  : 'bg-indigo-600 hover:bg-indigo-500 hover:scale-105'
              }`}
            >
              <div className="absolute inset-0 rounded-full bg-white opacity-0 group-hover:opacity-10 transition-opacity" />
              {isRecording ? (
                <Square className="w-8 h-8 text-rose-500 fill-rose-500 flex-shrink-0" />
              ) : (
                <Mic className="w-10 h-10 text-white flex-shrink-0" />
              )}
            </button>
          </div>

          {/* Security Indicator */}
          <div className="flex items-center justify-center gap-2 text-xs text-neutral-500 font-mono">
            <ShieldCheck className="w-4 h-4 text-green-500" />
            <span>مشفر - يتم تصفية وتدقيق الصوت آنياً</span>
          </div>

        </div>
      </div>
    </AppShell>
  );
}
