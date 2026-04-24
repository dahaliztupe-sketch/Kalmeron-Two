import Link from "next/link";
import { promises as fs } from "node:fs";
import path from "node:path";
import { ArrowLeft, GitCommit } from "lucide-react";
import { BrandLogo } from "@/components/brand/BrandLogo";

export const metadata = {
  title: "سجل التحديثات — كلميرون",
  description: "كل تحديث، كل إصلاح، كل ميزة جديدة. شفافية كاملة.",
};

interface Entry {
  version: string;
  date?: string;
  body: string;
}

async function loadChangelog(): Promise<Entry[]> {
  try {
    const file = path.join(process.cwd(), "CHANGELOG.md");
    const raw = await fs.readFile(file, "utf-8");
    // Split on H2 (## v...) or H1; keep it forgiving
    const sections = raw.split(/\n(?=##\s+)/g).filter((s) => s.trim().startsWith("##"));
    if (sections.length === 0) {
      return [{ version: "Latest", body: raw }];
    }
    return sections.slice(0, 30).map((sec) => {
      const headerMatch = sec.match(/^##\s+(.+)$/m);
      const header = headerMatch?.[1] ?? "Update";
      const dateMatch = header.match(/(\d{4}-\d{2}-\d{2})/);
      const body = sec.replace(/^##\s+.+$/m, "").trim();
      return {
        version: header.replace(/\(\d{4}-\d{2}-\d{2}\)/, "").trim(),
        date: dateMatch?.[1],
        body,
      };
    });
  } catch {
    return [];
  }
}

export default async function ChangelogPage() {
  const entries = await loadChangelog();

  return (
    <div dir="rtl" className="min-h-screen bg-[#05070D] text-white">
      <header className="border-b border-white/[0.05] px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-neutral-300 hover:text-white text-sm">
            <ArrowLeft className="w-4 h-4" />
            الرئيسية
          </Link>
          <BrandLogo size={32} iconOnly />
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-12">
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-cyan-300 text-xs font-semibold mb-4">
            <GitCommit className="w-3 h-3" />
            سجل التحديثات
          </div>
          <h1 className="text-4xl font-bold mb-3">ما الجديد في كلميرون</h1>
          <p className="text-neutral-400 max-w-2xl">
            كل تحديث ننشره — صغيراً كان أم كبيراً — يصل هنا أولاً. شفافية كاملة، لأن ثقتك أهم من سمعتنا اللحظية.
          </p>
        </div>

        {entries.length === 0 ? (
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-8 text-center text-neutral-400">
            لا توجد تحديثات منشورة بعد. تابعنا قريباً.
          </div>
        ) : (
          <div className="space-y-8">
            {entries.map((e, i) => (
              <article
                key={`${e.version}-${i}`}
                className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6"
              >
                <div className="flex items-baseline justify-between mb-4 flex-wrap gap-2">
                  <h2 className="text-xl font-bold text-cyan-200">{e.version}</h2>
                  {e.date && <span className="text-neutral-500 text-xs tabular-nums">{e.date}</span>}
                </div>
                <pre className="whitespace-pre-wrap font-sans text-sm text-neutral-300 leading-relaxed">{e.body}</pre>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
