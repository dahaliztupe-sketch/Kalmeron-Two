import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"

import { cn } from "@/lib/utils"

/**
 * Input — Kalmeron Design System v2
 * Refined focus ring, premium glass background, RTL-aware,
 * proper Arabic placeholder weight, and invalid state.
 */
function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        // Base layout
        "h-10 w-full min-w-0 rounded-xl px-3.5 py-2",
        // Surface
        "bg-white/[0.03] border border-white/[0.08]",
        "text-[14px] text-white",
        // Placeholder (Arabic placeholders need slightly heavier weight to feel balanced)
        "placeholder:text-neutral-500 placeholder:font-normal",
        // Transitions
        "transition-[border-color,background,box-shadow] duration-200 ease-out",
        // File-input
        "file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-white file:me-3",
        // Focus state — premium ring + brand background tint
        "outline-none",
        "focus-visible:border-indigo-400/60 focus-visible:bg-white/[0.05]",
        "focus-visible:shadow-[0_0_0_3px_rgb(99_102_241/0.18),0_8px_30px_-10px_rgb(79_70_229/0.40)]",
        // Disabled
        "disabled:pointer-events-none disabled:cursor-not-allowed",
        "disabled:bg-white/[0.02] disabled:opacity-50",
        // Invalid
        "aria-invalid:border-rose-400/60",
        "aria-invalid:focus-visible:shadow-[0_0_0_3px_rgb(244_63_94/0.18),0_8px_30px_-10px_rgb(244_63_94/0.40)]",
        // Hover (subtle)
        "hover:border-white/[0.14]",
        // Selection inside input
        "selection:bg-indigo-500/40 selection:text-white",
        // Better mobile sizing
        "md:text-[13.5px]",
        className
      )}
      {...props}
    />
  )
}

export { Input }
