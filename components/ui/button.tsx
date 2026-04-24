import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/src/lib/utils"

/**
 * Premium Button — Kalmeron Design System v2
 * ─────────────────────────────────────────────────────────────────────
 * 9 visual variants × 7 size steps · with proper haptic feel,
 * focus rings, shimmer/glow CTAs, and Arabic-aware glyph spacing.
 */
const buttonVariants = cva(
  [
    "group/button relative inline-flex shrink-0 items-center justify-center gap-2",
    "rounded-xl border border-transparent bg-clip-padding font-semibold whitespace-nowrap",
    "transition-[transform,box-shadow,background,filter,border-color] duration-200 ease-out",
    "outline-none select-none",
    "focus-visible:ring-2 focus-visible:ring-indigo-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#04060B]",
    "active:not(aria-[haspopup=true]):translate-y-[1px]",
    "disabled:pointer-events-none disabled:opacity-50",
    "aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/30",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
    "[&_svg]:transition-transform [&_svg]:duration-200",
  ].join(" "),
  {
    variants: {
      variant: {
        // ── Primary: signature gradient with glow halo on hover ──
        default:
          "text-white border-white/15 shadow-[0_10px_30px_-12px_rgb(79_70_229/0.65),inset_0_1px_0_rgb(255_255_255/0.18)] " +
          "bg-[linear-gradient(135deg,#4F46E5_0%,#2563EB_50%,#38BDF8_100%)] bg-[length:200%_100%] bg-[position:0%_50%] " +
          "hover:bg-[position:100%_50%] hover:shadow-[0_18px_40px_-12px_rgb(79_70_229/0.85),inset_0_1px_0_rgb(255_255_255/0.28)] " +
          "hover:-translate-y-0.5",

        // ── Outline: minimal border, perfect for secondary actions ──
        outline:
          "border-white/10 bg-white/[0.02] text-white backdrop-blur-md " +
          "hover:bg-white/[0.06] hover:border-white/25 hover:-translate-y-0.5",

        // ── Secondary: cyan emphasis, warm second-tier action ──
        secondary:
          "bg-cyan-500/10 text-cyan-200 border-cyan-400/30 " +
          "hover:bg-cyan-500/20 hover:border-cyan-400/50 hover:text-cyan-100",

        // ── Ghost: floating, used inside cards/headers ──
        ghost:
          "text-neutral-300 hover:text-white hover:bg-white/[0.05] " +
          "aria-expanded:bg-white/[0.06] aria-expanded:text-white",

        // ── Destructive: warm rose, never harsh red ──
        destructive:
          "bg-rose-500/10 text-rose-300 border-rose-400/25 " +
          "hover:bg-rose-500/20 hover:border-rose-400/45 hover:text-rose-200",

        // ── Link: animated underline ──
        link:
          "text-cyan-300 hover:text-cyan-200 underline-offset-4 " +
          "bg-[linear-gradient(currentColor,currentColor)] bg-no-repeat bg-[length:0_1px] bg-[position:0_100%] " +
          "hover:bg-[length:100%_1px] transition-[background-size] duration-300",

        // ── Hero: oversized landing CTA with persistent glow ──
        hero:
          "text-white border-white/20 " +
          "bg-[linear-gradient(135deg,#06B6D4_0%,#4F46E5_45%,#C026D3_100%)] " +
          "shadow-[0_20px_60px_-15px_rgb(79_70_229/0.75),inset_0_1px_0_rgb(255_255_255/0.25)] " +
          "hover:shadow-[0_30px_80px_-15px_rgb(79_70_229/0.95),inset_0_1px_0_rgb(255_255_255/0.35)] " +
          "hover:-translate-y-1 hover:[&_svg]:translate-x-1",

        // ── Soft: low-emphasis filled, for in-card actions ──
        soft:
          "bg-indigo-500/10 text-indigo-200 border-indigo-400/25 " +
          "hover:bg-indigo-500/18 hover:border-indigo-400/45 hover:text-indigo-100",

        // ── Glass: ambient toolbar action ──
        glass:
          "bg-white/[0.04] text-white border-white/[0.10] backdrop-blur-md " +
          "hover:bg-white/[0.10] hover:border-white/25",
      },
      size: {
        default: "h-9  px-3.5 text-[0.825rem] gap-1.5",
        xs:      "h-6  px-2   text-xs        gap-1   rounded-lg [&_svg:not([class*='size-'])]:size-3",
        sm:      "h-8  px-3   text-[0.8rem]  gap-1.5 rounded-lg [&_svg:not([class*='size-'])]:size-3.5",
        lg:      "h-11 px-5   text-[0.925rem] gap-2   rounded-xl",
        xl:      "h-13 px-7   text-base       gap-2.5 rounded-2xl [&_svg:not([class*='size-'])]:size-5",
        hero:    "h-14 px-8   text-base       gap-2.5 rounded-2xl [&_svg:not([class*='size-'])]:size-5",
        icon:    "size-9 rounded-xl",
        "icon-xs": "size-6 rounded-lg [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-8 rounded-lg [&_svg:not([class*='size-'])]:size-3.5",
        "icon-lg": "size-11 rounded-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
