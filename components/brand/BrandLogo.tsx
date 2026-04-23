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
};

export function BrandLogo({
  size = 40,
  showWordmark = true,
  href = "/",
  className,
  glow = false,
}: Props) {
  const inner = (
    <div className={cn("flex items-center gap-3", className)}>
      <div
        className={cn(
          "relative shrink-0 rounded-2xl overflow-hidden",
          glow && "shadow-[0_0_24px_-4px_rgba(99,102,241,0.55)]"
        )}
        style={{ width: size, height: size }}
      >
        <Image
          src="/brand/logo-mark-transparent.png"
          alt="Kalmeron AI"
          fill
          sizes={`${size}px`}
          className="object-contain"
          priority
        />
      </div>
      {showWordmark && (
        <div className="leading-none">
          <span className="block font-display font-extrabold text-[1.05rem] tracking-tight bg-gradient-to-r from-white via-indigo-200 to-blue-300 bg-clip-text text-transparent">
            KALMERON
          </span>
          <span className="block text-[0.62rem] uppercase tracking-[0.35em] text-indigo-300/70 mt-0.5">
            AI Studio
          </span>
        </div>
      )}
    </div>
  );

  if (!href) return inner;
  return <Link href={href} className="inline-flex items-center">{inner}</Link>;
}
