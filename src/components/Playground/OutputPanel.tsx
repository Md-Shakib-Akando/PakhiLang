"use client";

import type { PakhiError, Token } from "@/lib/pakhilang";
import { GRADIENT_BG, cn } from "@/lib/ui";

export type Tab = "output" | "tokens" | "ast";

export interface PlaygroundResult {
  tab: Tab;
  /** changes on every run; used as a React key to replay the entry animation */
  runId?: number;
  output?: string[];
  tokens?: Token[];
  ast?: string;
  ms?: number;
  error?: PakhiError;
  frame?: string | null;
}

const TABS: { id: Tab; label: string }[] = [
  { id: "output", label: "Output" },
  { id: "tokens", label: "Tokens" },
  { id: "ast", label: "AST" },
];

interface Props {
  tab: Tab;
  onTabChange: (tab: Tab) => void;
  result: PlaygroundResult | null;
}

export default function OutputPanel({ tab, onTabChange, result }: Props) {
  return (
    <div className="flex h-[320px] min-h-0 flex-col bg-elevated lg:h-auto">
      <div className="flex gap-1 border-b border-line px-2.5 pt-2" role="tablist">
        {TABS.map(({ id, label }) => {
          const active = tab === id;
          return (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => onTabChange(id)}
              className={cn(
                "relative cursor-pointer px-3.5 pt-2 pb-3 text-[13px] font-medium transition-colors",
                active ? "text-fg" : "text-faint hover:text-fg"
              )}
            >
              {label}
              {active && <span className={cn("absolute inset-x-2.5 -bottom-px h-0.5 rounded-sm", GRADIENT_BG)} />}
            </button>
          );
        })}
      </div>
      <pre className="flex-1 overflow-auto px-[18px] py-4 font-mono text-[13px] leading-[1.7] whitespace-pre-wrap text-zinc-300">
        {result ? (
          <ResultView key={result.runId} result={result} />
        ) : (
          <span className="text-faint italic">&quot;Chalao&quot; chapo, pakhi uttor dibe…</span>
        )}
      </pre>
    </div>
  );
}

function ResultView({ result }: { result: PlaygroundResult }) {
  return (
    <>
      {result.output?.map((line, i) => (
        <div key={i} className="animate-line-in text-ok" style={{ animationDelay: `${Math.min(i * 35, 500)}ms` }}>
          <span className="text-pink">› </span>
          {line}
        </div>
      ))}

      {result.tokens?.map((t, i) => (
        <div key={i}>
          <span className="text-[#45454f]">{`${t.loc.line}:${t.loc.col}`.padEnd(7)}</span>{" "}
          <span className="text-warn">{t.type.padEnd(18)}</span> {JSON.stringify(t.value)}
        </div>
      ))}

      {result.ast}

      {result.error ? (
        <div className="mt-3 animate-shake rounded-[10px] border border-danger/30 bg-danger/[0.06] px-3.5 py-3">
          <div className="text-danger">✖ {result.error.summary}</div>
          {result.frame && <div className="mt-2.5 overflow-x-auto whitespace-pre text-muted">{result.frame}</div>}
        </div>
      ) : (
        result.tab === "output" && (
          <div className="mt-3.5 animate-line-in text-[12.5px] text-faint italic" style={{ animationDelay: `${Math.min((result.output?.length ?? 0) * 35, 500)}ms` }}>✓ shesh ({result.ms?.toFixed(1)} ms)</div>
        )
      )}
    </>
  );
}
