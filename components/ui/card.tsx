import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * Card — Kalmeron Design System v2
 * Semantic surface with refined elevation, glass option, and lift hover.
 */
type CardSize = "default" | "sm" | "lg"
type CardVariant = "default" | "glass" | "elevated" | "outline" | "gradient"

function Card({
  className,
  size = "default",
  variant = "default",
  ...props
}: React.ComponentProps<"div"> & { size?: CardSize; variant?: CardVariant }) {
  return (
    <div
      data-slot="card"
      data-size={size}
      data-variant={variant}
      className={cn(
        "group/card relative flex flex-col gap-4 overflow-hidden rounded-2xl py-5 text-sm text-card-foreground",
        "transition-[transform,box-shadow,border-color] duration-300 ease-out",
        // Default surface
        variant === "default" &&
          "bg-card ring-1 ring-white/[0.07] shadow-[0_2px_6px_-1px_rgb(0_0_0/0.30)]",
        // Glass surface
        variant === "glass" &&
          "bg-[linear-gradient(180deg,rgba(255,255,255,0.04)_0%,rgba(255,255,255,0.01)_100%)] " +
          "ring-1 ring-white/[0.06] backdrop-blur-xl shadow-[inset_0_1px_0_rgb(255_255_255/0.05),0_8px_18px_-6px_rgb(0_0_0/0.40)]",
        // Elevated surface (more depth)
        variant === "elevated" &&
          "bg-[#0F172A]/80 ring-1 ring-white/[0.08] " +
          "shadow-[0_18px_40px_-12px_rgb(0_0_0/0.55),inset_0_1px_0_rgb(255_255_255/0.05)]",
        // Outline (minimal)
        variant === "outline" &&
          "bg-transparent ring-1 ring-white/[0.10] hover:ring-white/[0.18]",
        // Gradient border (for premium plan / hero card)
        variant === "gradient" &&
          "bg-[#0A0F1F]/95 ring-0 " +
          "before:absolute before:inset-0 before:-z-10 before:rounded-[inherit] before:p-px " +
          "before:bg-[conic-gradient(from_180deg,#38BDF8,#4F46E5,#C026D3,#38BDF8)] " +
          "before:[mask:linear-gradient(#000_0_0)_content-box,linear-gradient(#000_0_0)] " +
          "before:[mask-composite:exclude]",
        // Sizes
        "data-[size=sm]:gap-3 data-[size=sm]:py-4 data-[size=sm]:rounded-xl",
        "data-[size=lg]:gap-5 data-[size=lg]:py-7 data-[size=lg]:rounded-3xl",
        // Footer & image edge handling
        "has-data-[slot=card-footer]:pb-0 has-[>img:first-child]:pt-0",
        "*:[img:first-child]:rounded-t-2xl *:[img:last-child]:rounded-b-2xl",
        className
      )}
      {...props}
    />
  )
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "@container/card-header grid auto-rows-min items-start gap-1.5 rounded-t-2xl px-5",
        "group-data-[size=sm]/card:px-4 group-data-[size=lg]/card:px-7",
        "has-data-[slot=card-action]:grid-cols-[1fr_auto]",
        "has-data-[slot=card-description]:grid-rows-[auto_auto]",
        "[.border-b]:pb-4",
        className
      )}
      {...props}
    />
  )
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn(
        "font-display text-base font-bold leading-snug tracking-tight text-white",
        "group-data-[size=sm]/card:text-sm group-data-[size=lg]/card:text-lg",
        className
      )}
      {...props}
    />
  )
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-[13px] leading-relaxed text-neutral-400", className)}
      {...props}
    />
  )
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className
      )}
      {...props}
    />
  )
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn(
        "px-5 group-data-[size=sm]/card:px-4 group-data-[size=lg]/card:px-7",
        className
      )}
      {...props}
    />
  )
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn(
        "flex items-center rounded-b-2xl border-t border-white/5 bg-white/[0.02] p-5",
        "group-data-[size=sm]/card:p-4 group-data-[size=lg]/card:p-7",
        className
      )}
      {...props}
    />
  )
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
}
