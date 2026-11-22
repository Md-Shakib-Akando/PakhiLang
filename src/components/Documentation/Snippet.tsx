import CopyButton from "@/components/CopyButton";
import HighlightedCode from "@/components/HighlightedCode";
import Icon from "@/components/Icon";

/** A highlighted, copyable code sample that can be opened in the playground. */
export default function Snippet({ code }: { code: string }) {
  return (
    <div className="group overflow-hidden rounded-xl border border-line bg-editor transition-colors duration-300 hover:border-line-strong">
      <div className="flex h-10 items-center justify-between border-b border-line bg-white/[0.02] pr-2 pl-4">
        <span className="font-mono text-xs text-faint">pakhi</span>
        {/* visible on hover / focus; always visible on touch screens */}
        <div className="flex items-center gap-1.5 opacity-0 transition group-focus-within:opacity-100 group-hover:opacity-100 pointer-coarse:opacity-100">
          <a
            href={`#code=${encodeURIComponent(code)}`}
            className="inline-flex h-7 items-center gap-1.5 rounded-md border border-pink/30 bg-pink/[0.12] px-2.5 text-xs font-semibold text-pink-soft hover:bg-pink/20"
          >
            <Icon name="play" size={12} />
            Playground e chalao
          </a>
          <CopyButton text={code} />
        </div>
      </div>
      <pre className="overflow-x-auto px-4 py-3.5 text-[12.5px] leading-[1.7] sm:px-5 sm:py-[18px] sm:text-[13.5px]">
        <HighlightedCode code={code} />
      </pre>
    </div>
  );
}
