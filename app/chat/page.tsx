'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Send, UserCircle, Bot, AlertCircle } from 'lucide-react';
import Link from 'next/link';

// Guest mode limits capabilities to 4 messages then prompts sign up
const MAX_GUEST_MESSAGES = 4;

export default function GuestChatPage() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q');
  const router = useRouter();

  const [messages, setMessages] = useState<{role: 'user'|'ai', content: string}[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSignupPrompt, setShowSignupPrompt] = useState(false);
  
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  // Send initial query automatically if present
  useEffect(() => {
    if (initialQuery && messages.length === 0) {
      sendMessage(initialQuery);
    }
  }, [initialQuery]);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || showSignupPrompt) return;
    
    const count = messages.filter(m => m.role === 'user').length;
    if (count >= MAX_GUEST_MESSAGES) {
       setShowSignupPrompt(true);
       return;
    }

    const newMessages = [...messages, { role: 'user' as const, content: text }];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      // Hit our new Supervisor/Chat API
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages,
          isGuest: true,
          uiContext: { page: 'guest_chat' }
        })
      });
      
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'ai', content: data.text }]);
      
      if (count + 1 >= MAX_GUEST_MESSAGES) {
        setShowSignupPrompt(true);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#0A0A0B] text-white font-sans" dir="rtl">
      
      {/* Header */}
      <header className="p-4 border-b border-white/10 flex justify-between items-center backdrop-blur bg-black/50 z-10">
        <h1 className="font-bold text-lg text-blue-400">Kalmeron</h1>
        <Link href="/register" className="text-sm bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-full transition-colors">
          إنشاء حساب مجاني
        </Link>
      </header>

      {/* Messages */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6">
        {messages.map((m, i) => (
          <div key={i} className={`flex gap-4 max-w-3xl mx-auto ${m.role === 'ai' ? '' : 'flex-row-reverse'}`}>
             <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${m.role === 'ai' ? 'bg-blue-600' : 'bg-neutral-600'}`}>
                {m.role === 'ai' ? <Bot size={16} /> : <UserCircle size={16} />}
             </div>
             <div className={`leading-relaxed text-sm md:text-base ${m.role === 'ai' ? 'text-neutral-200' : 'text-white'}`}>
                {m.content}
             </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-4 max-w-3xl mx-auto">
             <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center shrink-0 animate-pulse">
                <Bot size={16} />
             </div>
             <div className="h-6 w-24 bg-neutral-800 rounded animate-pulse"></div>
          </div>
        )}

        {/* Intercept / Paywall for Signup */}
        {showSignupPrompt && (
          <div className="max-w-2xl mx-auto mt-8 bg-neutral-900 border border-blue-500/30 rounded-2xl p-6 text-center shadow-2xl relative overflow-hidden">
             <div className="absolute inset-0 bg-blue-500/5 blur-3xl pointer-events-none"></div>
             <AlertCircle className="w-12 h-12 text-blue-400 mx-auto mb-4" />
             <h2 className="text-xl font-bold mb-2">يبدو أنك جاد في مشروعك! 🚀</h2>
             <p className="text-neutral-400 mb-6 text-sm">
                لقد استنفدت المحادثات المتاحة للضيف. أنشئ حسابك المجاني الآن للوصول إلى خطط أعمال كاملة، تحليل مالي، والأدوات الإدارية لمشروعك.
             </p>
             <Link href="/register" className="inline-block bg-white text-black font-semibold px-8 py-3 rounded-full hover:scale-105 transition-transform">
               إنشاء حساب مجاني والاستمرار
             </Link>
          </div>
        )}
        <div ref={endOfMessagesRef} />
      </main>

      {/* Input Area */}
      <footer className="p-4 bg-gradient-to-t from-[#0A0A0B] via-[#0A0A0B] to-transparent">
        <div className="max-w-3xl mx-auto relative relative">
          <form 
            onSubmit={(e) => { e.preventDefault(); sendMessage(input); }}
            className={`flex items-end bg-neutral-900 border border-neutral-700/50 rounded-3xl p-2 transition-all ${showSignupPrompt ? 'opacity-50 pointer-events-none' : ''}`}
          >
            <textarea
               value={input}
               onChange={(e) => setInput(e.target.value)}
               placeholder="استكمل نقاشك هنا..."
               className="flex-1 bg-transparent border-none outline-none resize-none text-white px-4 py-3 placeholder-neutral-500 max-h-32 min-h-[50px] custom-scrollbar"
               onKeyDown={(e) => {
                 if(e.key === 'Enter' && !e.shiftKey) {
                   e.preventDefault();
                   sendMessage(input);
                 }
               }}
            />
            <button 
              type="submit" 
              disabled={!input.trim() || isLoading || showSignupPrompt}
              className="bg-white text-black p-3 m-1 rounded-full disabled:opacity-30 transition-transform hover:scale-105"
            >
              <Send size={18} />
            </button>
          </form>
          <div className="text-center text-xs text-neutral-500 mt-2">
            يمكن للضيف استخدام عدد محدود من الرسائل قبل الحاجة لتسجيل حساب.
          </div>
        </div>
      </footer>
    </div>
  );
}
