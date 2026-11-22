"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Icon from "@/components/Icon";
import WindowDots from "@/components/WindowDots";
import { highlight, type Segment } from "@/lib/highlight";
import { cn } from "@/lib/ui";
import { KIND_CLASSES } from "@/components/HighlightedCode";

interface Props {
  fileName: string;
  code: string;
  output: string[];
}

/** ms per character while typing (whitespace is typed faster) */
const CHAR_DELAY = 22;

/** Keep only the first `count` characters of the highlighted segments. */
function sliceSegments(segments: Segment[], count: number): Segment[] {
  const result: Segment[] = [];
  let remaining = count;
  for (const segment of segments) {
    if (remaining <= 0) break;
    result.push(remaining >= segment.text.length ? segment : { ...segment, text: segment.text.slice(0, remaining) });
    remaining -= segment.text.length;
  }
  return result;
}

/**
 * The hero's code window: types the program out character by character, then
 * "runs" it and reveals the output line by line. Replays on demand.
 * With "reduce motion" turned on, it just shows everything.
 */
export default function TypingCode({ fileName, code, output }: Props) {
  const segments = useMemo(() => highlight(code), [code]);
  const [typed, setTyped] = useState(0);
  const [showOutput, setShowOutput] = useState(false);
  const [round, setRound] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const done = typed >= code.length;

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setTyped(code.length);
      setShowOutput(true);
      return;
    }

    let timer = 0;
    let count = 0;
    setTyped(0);
    setShowOutput(false);

    const step = () => {
      // type a little faster through runs of spaces (indentation)
      do count++;
      while (count < code.length && code[count] === " " && code[count - 1] === " ");
      setTyped(count);
      if (count < code.length) {
        timer = window.setTimeout(step, code[count - 1] === "\n" ? CHAR_DELAY * 4 : CHAR_DELAY);
      } else {
        timer = window.setTimeout(() => setShowOutput(true), 450);
      }
    };

    // start typing once the window is actually on screen
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        timer = window.setTimeout(step, 600);
      },
      { threshold: 0.3 }
    );
    if (rootRef.current) observer.observe(rootRef.current);

    return () => {
      observer.disconnect();
      window.clearTimeout(timer);
    };
  }, [code, round]);

  return (
    <div
      ref={rootRef}
      className="relative overflow-hidden rounded-2xl border border-line-strong bg-elevated/90 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.8)]"
    >
      <div className="flex h-[42px] items-center gap-3.5 border-b border-line bg-white/[0.02] px-4">
        <WindowDots />
        <span className="font-mono text-[12.5px] text-muted">{fileName}</span>
        <button
          type="button"
          onClick={() => setRound((r) => r + 1)}
          className={cn(
            "ml-auto flex cursor-pointer items-center gap-1.5 rounded-md px-2 py-1 text-xs text-faint transition hover:bg-surface-2 hover:text-fg",
            showOutput ? "opacity-100" : "pointer-events-none opacity-0"
          )}
        >
          <Icon name="replay" size={13} />
          Replay
        </button>
      </div>

      {/* The full code is rendered invisibly underneath so the window never changes size */}
      <div className="relative">
        <span className="sr-only">{code}</span>
        <pre aria-hidden="true" className="scrollbar-code invisible overflow-x-auto px-4 py-4 text-xs leading-[1.7] sm:px-[22px] sm:py-5 sm:text-[13px]">
          {code}
        </pre>
        <pre
          aria-hidden="true"
          className="scrollbar-code absolute inset-0 overflow-x-auto px-4 py-4 text-xs leading-[1.7] sm:px-[22px] sm:py-5 sm:text-[13px]"
        >
          {sliceSegments(segments, typed).map((segment, i) => (
            <span key={i} className={KIND_CLASSES[segment.kind] || undefined}>
              {segment.text}
            </span>
          ))}
          {!showOutput && (
            <span
              aria-hidden="true"
              className={cn(
                "ml-px inline-block h-[1.15em] w-[2px] translate-y-[3px] bg-pink",
                done ? "animate-blink" : ""
              )}
            />
          )}
        </pre>
      </div>

      <div className="border-t border-line bg-black/30 px-4 py-3.5 font-mono text-xs leading-[1.7] sm:px-[22px] sm:py-4 sm:text-[13px]">
        <div className="mb-1.5 flex items-center gap-1.5 font-sans text-[11px] font-semibold tracking-[0.08em] text-faint uppercase">
          <Icon name="terminal" size={14} />
          Output
          {done && !showOutput && <span className="ml-1 animate-pulse normal-case tracking-normal text-pink">chaltese…</span>}
        </div>
        {output.map((line, i) => (
          <div
            key={`${round}-${i}`}
            className={cn("text-ok", showOutput ? "animate-line-in" : "opacity-0")}
            style={showOutput ? { animationDelay: `${i * 220}ms` } : undefined}
          >
            <span className="text-pink">› </span>
            {line}
          </div>
        ))}
      </div>
    </div>
  );
}
