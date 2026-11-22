import { cn } from "@/lib/ui";

/** The three macOS-style window buttons. `muted` renders them grey. */
export default function WindowDots({ muted = false, className }: { muted?: boolean; className?: string }) {
  const colors = muted ? ["bg-[#3a3a44]", "bg-[#3a3a44]", "bg-[#3a3a44]"] : ["bg-[#ff5f57]", "bg-[#febc2e]", "bg-[#28c840]"];
  return (
    <span className={cn("flex gap-[7px]", className)} aria-hidden="true">
      {colors.map((color, i) => (
        <i key={i} className={cn("size-[11px] rounded-full", color)} />
      ))}
    </span>
  );
}
