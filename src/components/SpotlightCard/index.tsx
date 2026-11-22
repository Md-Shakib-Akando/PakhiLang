"use client";

import { cn } from "@/lib/ui";

interface Props {
  className?: string;
  children: React.ReactNode;
}

/**
 * A card with a soft pink glow that follows the mouse.
 * The pointer position is written to CSS variables (--x, --y); Tailwind does the rest.
 */
export default function SpotlightCard({ className, children }: Props) {
  function onPointerMove(e: React.PointerEvent<HTMLElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--x", `${e.clientX - rect.left}px`);
    e.currentTarget.style.setProperty("--y", `${e.clientY - rect.top}px`);
  }

  return (
    <article onPointerMove={onPointerMove} className={cn("group relative overflow-hidden", className)}>
      {/* glow fill */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 bg-[radial-gradient(380px_circle_at_var(--x)_var(--y),rgba(255,95,162,0.1),transparent_45%)]"
      />
      {/* brighter border right under the pointer */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-[inherit] p-px opacity-0 transition-opacity duration-300 group-hover:opacity-100 bg-[radial-gradient(260px_circle_at_var(--x)_var(--y),rgba(255,95,162,0.55),transparent_60%)] [mask:linear-gradient(#000,#000)_content-box,linear-gradient(#000,#000)] [mask-composite:exclude]"
      />
      <div className="relative">{children}</div>
    </article>
  );
}
