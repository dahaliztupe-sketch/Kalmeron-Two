// Lean global loading screen — pure CSS, zero JS animations.
// Was: full motion-based scene with 3 radial gradients + starfield + 5 motion components.
// Now: <2KB markup, animation handled by `marquee`/`animate-pulse` Tailwind utilities.

export default function Loading() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#04060B]">
      <div
        aria-hidden
        className="absolute inset-0 opacity-60"
        style={{
          background:
            "radial-gradient(ellipse at 30% 20%, rgba(56,189,248,0.15), transparent 55%), radial-gradient(ellipse at 70% 80%, rgba(232,121,249,0.12), transparent 55%)",
        }}
      />
      <div className="relative z-10 flex flex-col items-center gap-6">
        <div className="relative w-24 h-24 rounded-3xl border border-white/10 bg-[#070A18]/80 backdrop-blur-md flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-cyan-500/30 via-indigo-500/30 to-fuchsia-500/30 blur-2xl animate-pulse" />
          <span className="relative font-display text-2xl font-black text-white tracking-wider">K</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="font-display text-xl font-black uppercase text-white tracking-[0.3em]">KALMERON</span>
          <span className="mt-1.5 text-[10px] uppercase tracking-[0.35em] text-cyan-300/70">AI · Studio</span>
        </div>
        <div className="relative h-[3px] w-48 overflow-hidden rounded-full bg-white/[0.05]">
          <div className="absolute inset-y-0 -left-1/3 w-1/3 rounded-full bg-gradient-to-r from-cyan-400 via-indigo-500 to-fuchsia-500 animate-[loading-bar_1.4s_ease-in-out_infinite]" />
        </div>
        <p className="text-neutral-500 text-xs" dir="rtl">جارٍ التحضير…</p>
      </div>
      <style>{`
        @keyframes loading-bar {
          0% { transform: translateX(0); }
          100% { transform: translateX(450%); }
        }
      `}</style>
    </div>
  );
}
