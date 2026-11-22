"use client";

import { useRef } from "react";
import HighlightedCode from "@/components/HighlightedCode";
import { cn } from "@/lib/ui";

interface Props {
  value: string;
  onChange: (value: string) => void;
  onRun: () => void;
  /** 1-based line to mark red in the gutter */
  errorLine: number | null;
}

/** Font metrics shared by the gutter, the highlight layer and the textarea. They MUST match. */
const METRICS = "font-mono text-[12.5px] leading-[1.7] sm:text-[13.5px]";

/** Shared by the <pre> and the <textarea>, which sit exactly on top of each other. */
const LAYER = cn(
  METRICS,
  "absolute inset-0 m-0 border-0 p-4 whitespace-pre [overflow-wrap:normal] [word-break:normal] [tab-size:2]"
);

/**
 * A lightweight code editor:
 * a transparent <textarea> (you type here) on top of a highlighted <pre> (you see this).
 * Both use the exact same font, padding and line-height, and scroll together.
 */
export default function CodeEditor({ value, onChange, onRun, errorLine }: Props) {
  const preRef = useRef<HTMLPreElement>(null);
  const gutterRef = useRef<HTMLDivElement>(null);
  const lineCount = value.split("\n").length;

  function syncScroll(e: React.UIEvent<HTMLTextAreaElement>) {
    const { scrollTop, scrollLeft } = e.currentTarget;
    if (preRef.current) {
      preRef.current.scrollTop = scrollTop;
      preRef.current.scrollLeft = scrollLeft;
    }
    if (gutterRef.current) gutterRef.current.scrollTop = scrollTop;
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      onRun();
    } else if (e.key === "Tab" && !e.shiftKey) {
      e.preventDefault();
      // execCommand keeps the browser's undo history intact (setting value directly doesn't)
      if (!document.execCommand("insertText", false, "  ")) {
        const el = e.currentTarget;
        const { selectionStart: s, selectionEnd: end } = el;
        onChange(value.slice(0, s) + "  " + value.slice(end));
        requestAnimationFrame(() => el.setSelectionRange(s + 2, s + 2));
      }
    }
  }

  return (
    <div className="flex h-[380px] min-h-0 border-b border-line bg-editor lg:h-auto lg:border-r lg:border-b-0">
      {/* extra bottom padding: room to match the textarea when it shows a scrollbar */}
      <div
        ref={gutterRef}
        aria-hidden="true"
        className={cn(METRICS, "min-w-12 overflow-hidden px-3 pt-4 pb-10 text-right text-[#45454f] select-none")}
      >
        {Array.from({ length: lineCount }, (_, i) => (
          <div key={i} className={i + 1 === errorLine ? "font-bold text-danger" : undefined}>
            {i + 1}
          </div>
        ))}
      </div>

      <div className="relative min-w-0 flex-1">
        {/* extra bottom/right padding so it can scroll as far as the textarea (whose scrollbars eat space) */}
        <pre ref={preRef} aria-hidden="true" className={cn(LAYER, "pointer-events-none overflow-hidden pr-10 pb-10 text-fg")}>
          <HighlightedCode code={value} />
          {/* keeps the last empty line's height in sync with the textarea */}
          {"\n "}
        </pre>
        <textarea
          className={cn(
            LAYER,
            "resize-none overflow-auto bg-transparent text-transparent caret-pink outline-none selection:bg-pink/30"
          )}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onScroll={syncScroll}
          onKeyDown={onKeyDown}
          spellCheck={false}
          autoCapitalize="off"
          autoComplete="off"
          autoCorrect="off"
          aria-label="PakhiLang code editor"
        />
      </div>
    </div>
  );
}
