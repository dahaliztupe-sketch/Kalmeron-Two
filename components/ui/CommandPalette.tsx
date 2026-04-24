"use client";

/**
 * Kalmeron Command Palette
 * -------------------------
 * Vanilla ⌘K palette built atop @base-ui/react/dialog (no `cmdk` dep).
 * Searches across the canonical NAV_SECTIONS — single source of truth.
 *
 * Behavior:
 *   - ⌘K / Ctrl+K toggles open from anywhere (global keydown listener).
 *   - Esc closes.
 *   - ↑/↓ navigates results, Enter activates.
 *   - Reduced-motion safe: no spring transitions, only opacity fade.
 *   - RTL-aware: alignment flips automatically.
 *
 * Search ranking: simple substring match weighted by label position.
 * Returns at most 12 items grouped by section.
 */

import * as React from "react";
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { useRouter } from "next/navigation";
import { Search, CornerDownLeft, ArrowUp, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { NAV_SECTIONS, FLAT_NAV, type NavItem } from "@/lib/navigation";

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Optional UI language for placeholder/footer hints. */
  locale?: "ar" | "en";
}

interface RankedItem extends NavItem {
  section: string;
  score: number;
}

function rank(query: string, items: NavItem[], sections: typeof NAV_SECTIONS): RankedItem[] {
  if (!query.trim()) {
    // Empty query → top 8 from primary section.
    return sections[0].items.slice(0, 8).map((it) => ({
      ...it,
      section: sections[0].heading,
      score: 1,
    }));
  }
  const q = query.trim().toLowerCase();
  const ranked: RankedItem[] = [];
  for (const section of sections) {
    for (const item of section.items) {
      const label = item.label.toLowerCase();
      const href = item.href.toLowerCase();
      let score = 0;
      if (label.startsWith(q)) score = 100;
      else if (label.includes(q)) score = 60;
      else if (href.includes(q)) score = 30;
      if (score > 0) ranked.push({ ...item, section: section.heading, score });
    }
  }
  return ranked.sort((a, b) => b.score - a.score).slice(0, 12);
}

export function CommandPalette({ open, onOpenChange, locale = "ar" }: CommandPaletteProps) {
  const router = useRouter();
  const [query, setQuery] = React.useState("");
  const [activeIndex, setActiveIndex] = React.useState(0);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const results = React.useMemo(() => rank(query, FLAT_NAV, NAV_SECTIONS), [query]);

  // Reset state on open/close
  React.useEffect(() => {
    if (open) {
      setQuery("");
      setActiveIndex(0);
      // Slight delay so base-ui finishes mounting.
      const t = setTimeout(() => inputRef.current?.focus(), 30);
      return () => clearTimeout(t);
    }
  }, [open]);

  // Keep activeIndex inside bounds when results change.
  React.useEffect(() => {
    if (activeIndex >= results.length) setActiveIndex(0);
  }, [results, activeIndex]);

  const go = (item: NavItem) => {
    onOpenChange(false);
    router.push(item.href);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(results.length - 1, i + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(0, i - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (results[activeIndex]) go(results[activeIndex]);
    }
  };

  const placeholder = locale === "ar" ? "ابحث في كلميرون…" : "Search Kalmeron…";
  const hintNav = locale === "ar" ? "تنقّل" : "navigate";
  const hintOpen = locale === "ar" ? "افتح" : "open";
  const hintClose = locale === "ar" ? "إغلاق" : "close";
  const noResults = locale === "ar" ? "لا نتائج مطابقة." : "No matching results.";

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Backdrop
          className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm data-[starting-style]:opacity-0 data-[ending-style]:opacity-0 transition-opacity duration-200"
        />
        <DialogPrimitive.Popup
          className={cn(
            "fixed left-1/2 top-[15vh] -translate-x-1/2 z-[101] w-[min(640px,92vw)]",
            "bg-[#0B1020]/95 border border-white/10 rounded-2xl shadow-[0_30px_80px_-20px_rgb(0_0_0/0.8)]",
            "backdrop-blur-xl outline-none",
            "data-[starting-style]:opacity-0 data-[starting-style]:scale-[0.98]",
            "data-[ending-style]:opacity-0 transition-[opacity,transform] duration-200",
          )}
          dir={locale === "ar" ? "rtl" : "ltr"}
        >
          <DialogPrimitive.Title className="sr-only">
            {locale === "ar" ? "لوحة الأوامر" : "Command palette"}
          </DialogPrimitive.Title>
          <DialogPrimitive.Description className="sr-only">
            {locale === "ar"
              ? "ابحث وانتقل إلى أي صفحة في كلميرون"
              : "Search and navigate to any page in Kalmeron"}
          </DialogPrimitive.Description>

          {/* Search bar */}
          <div className="flex items-center gap-3 px-4 py-3.5 border-b border-white/5">
            <Search className="w-4 h-4 text-neutral-500 shrink-0" aria-hidden />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setActiveIndex(0);
              }}
              onKeyDown={onKeyDown}
              placeholder={placeholder}
              className="flex-1 bg-transparent text-[15px] text-white placeholder:text-neutral-500 outline-none"
              aria-label={placeholder}
            />
            <kbd className="text-[10px] font-mono text-neutral-500 bg-white/[0.04] border border-white/10 rounded-md px-1.5 py-0.5">
              Esc
            </kbd>
          </div>

          {/* Results */}
          <div role="listbox" className="max-h-[50vh] overflow-y-auto scrollbar-hide py-2">
            {results.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-neutral-500">{noResults}</div>
            ) : (
              <ul className="space-y-0.5">
                {results.map((item, i) => {
                  const Icon = item.icon;
                  const active = i === activeIndex;
                  return (
                    <li key={item.href}>
                      <button
                        type="button"
                        role="option"
                        aria-selected={active}
                        onMouseEnter={() => setActiveIndex(i)}
                        onClick={() => go(item)}
                        className={cn(
                          "w-full flex items-center gap-3 px-4 py-2.5 text-start transition-colors",
                          active
                            ? "bg-white/[0.06] text-white"
                            : "text-neutral-300 hover:bg-white/[0.04]",
                        )}
                      >
                        <Icon
                          className={cn("w-4 h-4 shrink-0", active ? "text-cyan-300" : "text-neutral-500")}
                          aria-hidden
                        />
                        <span className="flex-1 text-sm font-medium truncate">{item.label}</span>
                        <span className="text-[10px] text-neutral-500 uppercase tracking-wider shrink-0">
                          {item.section}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* Footer hints */}
          <div className="flex items-center justify-between gap-3 px-4 py-2.5 border-t border-white/5 text-[11px] text-neutral-500">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <kbd className="font-mono bg-white/[0.04] border border-white/10 rounded px-1 py-0.5">
                  <ArrowUp className="w-2.5 h-2.5 inline" aria-hidden />
                </kbd>
                <kbd className="font-mono bg-white/[0.04] border border-white/10 rounded px-1 py-0.5">
                  <ArrowDown className="w-2.5 h-2.5 inline" aria-hidden />
                </kbd>
                {hintNav}
              </span>
              <span className="flex items-center gap-1">
                <kbd className="font-mono bg-white/[0.04] border border-white/10 rounded px-1 py-0.5">
                  <CornerDownLeft className="w-2.5 h-2.5 inline" aria-hidden />
                </kbd>
                {hintOpen}
              </span>
            </div>
            <span>
              <kbd className="font-mono bg-white/[0.04] border border-white/10 rounded px-1 py-0.5">Esc</kbd>{" "}
              {hintClose}
            </span>
          </div>
        </DialogPrimitive.Popup>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

/**
 * Hook: registers a global ⌘K / Ctrl+K listener.
 * Use in a top-level client component (e.g. AppShell) alongside the palette.
 */
export function useCommandPaletteShortcut(setOpen: (v: boolean) => void) {
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setOpen]);
}
