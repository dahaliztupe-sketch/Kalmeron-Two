"use client";

import React, { useRef, useEffect } from "react";
import { useChat } from "@ai-sdk/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Paperclip, Bot, User, Loader2, Sparkles } from "lucide-react";

const SUGGESTIONS = [
  "حلل فكرتي بناءً على السوق المصري",
  "ابنِ لي خطة عمل مبدئية",
  "ما هي الأخطاء الشائعة في التقنية المالية؟",
  "ابحث عن فرص تمويل مسبق التأسيس",
];

export default function ChatPage() {
  const { messages, input, handleInputChange, handleSubmit, setInput, isLoading } = useChat({
    api: "/api/chat",
    initialMessages: [
      {
        id: "welcome",
        role: "assistant",
        content: "أهلاً بك! أنا كلميرون، مساعدك المؤسس للذكاء الاصطناعي ولدي وصول لكافة الوكلاء المتخصصين. كيف يمكنني مساعدة مشروعك اليوم؟",
      }
    ]
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-background" dir="rtl">
      <ScrollArea className="flex-1 p-4 md:p-8">
        <div className="max-w-4xl mx-auto space-y-6 pb-20">
          {messages.map((m) => (
            <div key={m.id} className={`flex gap-4 items-end ${m.role === "user" ? "flex-row-reverse" : ""}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border shadow-sm ${m.role === "user" ? "bg-primary text-primary-foreground" : "bg-card text-foreground"}`}>
                {m.role === "user" ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5 text-primary" />}
              </div>
              <div className={`px-5 py-3.5 rounded-2xl max-w-[85%] shadow-sm text-sm md:text-base leading-relaxed ${m.role === "user" ? "bg-primary text-primary-foreground rounded-br-none" : "bg-muted text-foreground border border-border/50 rounded-bl-none"}`}>
                {m.content}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-4 items-end">
              <div className="w-10 h-10 rounded-full flex items-center justify-center bg-card border shadow-sm">
                <Bot className="w-5 h-5 text-primary" />
              </div>
              <div className="px-5 py-3.5 rounded-2xl bg-muted border border-border/50 rounded-bl-none flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
                <span className="text-sm text-muted-foreground animate-pulse">كلميرون يحلل البيانات...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>
      <div className="p-4 bg-background border-t">
        <div className="max-w-4xl mx-auto">
          {messages.length === 1 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {SUGGESTIONS.map((suggestion, idx) => (
                <Button key={idx} variant="outline" size="sm" className="rounded-full bg-muted/50 border-primary/20 hover:border-primary hover:bg-primary/10 transition-colors text-xs text-foreground" onClick={() => setInput(suggestion)}>
                  <Sparkles className="w-3 h-3 ml-2 text-primary" />
                  {suggestion}
                </Button>
              ))}
            </div>
          )}
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Button type="button" variant="outline" size="icon" className="shrink-0 h-12 w-12 rounded-xl border-dashed">
              <Paperclip className="w-5 h-5 text-muted-foreground" />
            </Button>
            <Input className="flex-1 h-12 rounded-xl bg-muted/50 border-transparent focus-visible:ring-primary focus-visible:bg-background transition-all px-4" value={input} placeholder="تحدث مع كلميرون ووجه وكلاءك..." disabled={isLoading} onChange={handleInputChange} />
            <Button type="submit" disabled={isLoading || !input.trim()} className="h-12 w-12 rounded-xl shrink-0" size="icon">
              <Send className="w-5 h-5 rtl:-scale-x-100" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
