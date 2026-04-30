import Image from "next/image";

export default function Loading() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#04060B]" aria-label="جارٍ التحميل">
      <div
        aria-hidden
        className="absolute inset-0 opacity-50"
        style={{
          background:
            "radial-gradient(ellipse at 30% 20%, rgba(56,189,248,0.12), transparent 55%), radial-gradient(ellipse at 70% 80%, rgba(232,121,249,0.08), transparent 55%)",
        }}
      />
      <div className="relative z-10 flex flex-col items-center gap-5">
        {/* Brand mark */}
        <div className="relative w-16 h-16 rounded-2xl border border-white/10 bg-[#070A18]/80 backdrop-blur-md flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-cyan-500/20 via-indigo-500/20 to-fuchsia-500/20 blur-xl animate-pulse" />
          <Image alt="Kalmeron AI"
            src="/brand/kalmeron-mark.svg"
            width={48}
            height={48}
            className="relative w-[72%] h-[72%] object-contain"
            priority
          />
        </div>
        {/* Progress bar only — no text to avoid flash of Arabic on every navigation */}
        <div className="relative h-[2px] w-32 overflow-hidden rounded-full bg-white/[0.05]">
          <div className="absolute inset-y-0 -left-1/3 w-1/3 rounded-full bg-gradient-to-r from-cyan-400 via-indigo-500 to-fuchsia-500 animate-[loading-bar_1.2s_ease-in-out_infinite]" />
        </div>
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
