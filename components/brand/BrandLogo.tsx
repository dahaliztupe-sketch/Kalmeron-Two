"use client";

import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

type Props = {
  size?: number;
  showWordmark?: boolean;
  href?: string | null;
  className?: string;
  glow?: boolean;
  /** when true, renders only the icon area (cropped from full logo) */
  iconOnly?: boolean;
};

/**
 * BrandLogo — uses the real Kalmeron AI logo image.
 * The original image already contains the icon + KALMERON AI wordmark
 * on a dark navy backdrop, so we render it as a self-contained tile.
 * For headers/sidebars we use `iconOnly` which crops to the icon glyph
 * via background-position trickery on a wrapper.
 */
export function BrandLogo({
  size = 40,
  showWordmark = true,
  href = "/",
  className,
  glow = false,
  iconOnly,
}: Props) {
  const useIconOnly = iconOnly ?? !showWordmark;

  const inner = (
    <div className={cn("flex items-center gap-3 select-none", className)}>
      <div
        className={cn(
          "relative shrink-0 rounded-2xl overflow-hidden",
          glow && "shadow-[0_0_28px_-6px_rgba(79,70,229,0.65)]"
        )}
        style={{ width: size, height: size }}
      >
        {useIconOnly ? (
          // Crop the icon glyph from the top portion of the logo image
          <div
            className="absolute inset-0 bg-center bg-no-repeat"
            style={{
              backgroundImage: "url(/brand/kalmeron-logo.png)",
              backgroundSize: "150% auto",
              backgroundPosition: "center 20%",
            }}
            aria-label="Kalmeron AI"
            role="img"
          />
        ) : (
          <Image
            src="/brand/kalmeron-logo.png"
            alt="Kalmeron AI"
            fill
            sizes={`${size}px`}
            className="object-contain"
            priority
          />
        )}
      </div>

      {showWordmark && useIconOnly && (
        <div className="leading-none">
          <span className="block font-display font-extrabold text-[1.05rem] tracking-tight text-white">
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
