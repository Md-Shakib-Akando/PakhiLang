import { cn, reveal } from "@/lib/ui";

interface Props {
  eyebrow: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  align?: "center" | "left";
}

export default function SectionHeading({ eyebrow, title, description, align = "center" }: Props) {
  return (
    <div className={cn("mb-12 max-w-[680px]", reveal(), align === "center" ? "mx-auto text-center" : "text-left")}>
      <span className="mb-3.5 inline-block text-[13px] font-semibold uppercase tracking-[0.08em] text-pink">
        {eyebrow}
      </span>
      <h2 className="text-[clamp(30px,4.2vw,44px)] font-bold leading-[1.12] tracking-[-0.03em] text-balance">
        {title}
      </h2>
      {description && <p className="mt-4 text-[17px] text-pretty text-muted">{description}</p>}
    </div>
  );
}
