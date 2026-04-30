"use client";

import Image from "next/image";
import Link from "next/link";
import { cn } from "@/src/lib/utils";

type Props = {
  size?: number;
  showWordmark?: boolean;
  href?: string | null;
  className?: string;
  glow?: boolean;
  /** when true, renders only the icon mark (no inline wordmark) */
  iconOnly?: boolean;
  /** color variant for the inline wordmark */
  wordmarkTone?: "light" | "muted";
};

/**
 * BrandLogo — renders the Kalmeron AI brand mark as an inline SVG.
 *
 * Two variants:
 *   • icon-only  → just the chain-link mark (square, scalable)
 *   • with wordmark → mark + "KALMERON / AI Studio" lockup
 *
 * The SVG mark itself is `/brand/kalmeron-mark.svg` (also mirrored as
 * `/brand/logo-mark.svg` for legacy references).
 */
export function BrandLogo({
  size = 40,
  showWordmark = true,
  href = "/",
  className,
  glow = false,
  iconOnly,
  wordmarkTone = "light",
}: Props) {
  const useIconOnly = iconOnly ?? !showWordmark;

  const inner = (
    <div className={cn("flex items-center gap-3 select-none", className)}>
      <div
        className={cn(
          "relative shrink-0 rounded-2xl",
          glow && "drop-shadow-[0_0_22px_rgba(79,70,229,0.55)]"
        )}
        style={{ width: size, height: size }}
      >
        <Image alt="Kalmeron AI"
          src="/brand/kalmeron-mark.svg"
          width={size}
          height={size}
          priority
          loading="eager"
          className="w-full h-full object-contain"
        />
      </div>

      {showWordmark && (
        <div className="leading-none">
          <span
            className={cn(
              "block font-display font-extrabold text-[1.05rem] tracking-tight",
              wordmarkTone === "muted" ? "text-neutral-100" : "text-white"
            )}
          >
            KALMERON
          </span>
          <span className="block text-[0.62rem] uppercase tracking-[0.35em] text-cyan-300/80 mt-1">
            AI Studio
          </span>
        </div>
      )}
    </div>
  );

  if (!href) return inner;
  return (
    <Link href={href} className="inline-flex items-center" aria-label="Kalmeron AI">
      {inner}
    </Link>
  );
}
