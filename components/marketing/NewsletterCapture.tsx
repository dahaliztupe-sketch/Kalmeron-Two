"use client";

import { useState } from "react";
import { Send, CheckCircle2, Loader2 } from "lucide-react";

interface Props {
  source?: string;
  variant?: "inline" | "card";
}

export function NewsletterCapture({ source = "footer", variant = "inline" }: Props) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setState("loading");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email: email.trim(), source, locale: "ar" }),
      });
      const data = await res.json();
      if (data.ok) {
        setState("success");
        setMessage(data.message || "تم الاشتراك بنجاح!");
        setEmail("");
      } else {
        setState("error");
        setMessage(
          data.error === "invalid_email"
            ? "البريد الإلكتروني غير صحيح"
            : "حدث خطأ، حاول مرة أخرى"
        );
      }
    } catch {
      setState("error");
      setMessage("تعذّر الاتصال، حاول مرة أخرى");
    }
  };

  if (state === "success") {
    return (
      <div
        className={`flex items-center gap-2 text-emerald-300 ${
          variant === "card"
            ? "rounded-2xl bg-emerald-500/10 border border-emerald-500/30 p-6"
            : ""
        }`}
      >
        <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
        <span className="text-sm">{message}</span>
      </div>
    );
  }

  if (variant === "card") {
    return (
      <div className="rounded-3xl bg-gradient-to-br from-cyan-500/10 to-indigo-600/10 border border-white/10 p-6 md:p-8">
        <h3 className="text-xl md:text-2xl font-bold text-white mb-2">
          استراتيجيات أسبوعية لرواد الأعمال
        </h3>
        <p className="text-zinc-300 mb-5 text-sm md:text-base">
          مقالات حصرية، فرص جديدة، وأخبار MENA Tech. مرة في الأسبوع، بدون spam.
        </p>
        <form onSubmit={submit} className="flex flex-col sm:flex-row gap-2">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="بريدك الإلكتروني"
            className="flex-1 px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white placeholder:text-zinc-500 focus:outline-none focus:border-cyan-400"
            disabled={state === "loading"}
            dir="ltr"
          />
          <button
            type="submit"
            disabled={state === "loading"}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-medium hover:opacity-90 transition disabled:opacity-50"
          >
            {state === "loading" ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Send className="w-4 h-4" />
                اشترك
              </>
            )}
          </button>
        </form>
        {state === "error" && message && (
          <p className="text-rose-400 text-sm mt-3">{message}</p>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="flex flex-col sm:flex-row gap-2">
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="بريدك الإلكتروني"
        className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-zinc-600 text-sm focus:outline-none focus:border-cyan-400"
        disabled={state === "loading"}
        dir="ltr"
      />
      <button
        type="submit"
        disabled={state === "loading"}
        className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-200 text-sm transition disabled:opacity-50"
      >
        {state === "loading" ? <Loader2 className="w-4 h-4 animate-spin" /> : "اشترك"}
      </button>
    </form>
  );
}
