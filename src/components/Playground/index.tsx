"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { DEFAULT_EXAMPLE, EXAMPLES } from "@/constants/examples";
import { PakhiError, codeFrame, parse, runAndCollect, tokenize } from "@/lib/pakhilang";
import Icon from "@/components/Icon";
import SectionHeading from "@/components/SectionHeading";
import WindowDots from "@/components/WindowDots";
import { CONTAINER, GRADIENT_TEXT, SECTION, button, cn, reveal } from "@/lib/ui";
import CodeEditor from "./CodeEditor";
import OutputPanel, { type PlaygroundResult, type Tab } from "./OutputPanel";

const HASH_PREFIX = "#code=";
const INITIAL = EXAMPLES.find((e) => e.name === DEFAULT_EXAMPLE) ?? EXAMPLES[0];

/** Runs one stage of the pipeline, depending on which tab is open. Never throws PakhiErrors. */
function execute(code: string, tab: Tab): PlaygroundResult {
  const fail = (error: PakhiError): PlaygroundResult => ({
    tab,
    error,
    frame: error.loc ? codeFrame(code, error.loc) : null,
  });

  try {
    if (tab === "tokens") return { tab, tokens: tokenize(code) };
    if (tab === "ast") {
      // `loc` is hidden to keep the tree readable
      return { tab, ast: JSON.stringify(parse(code), (k, v) => (k === "loc" ? undefined : v), 2) };
    }
    const started = performance.now();
    const { output, error } = runAndCollect(code);
    const ms = performance.now() - started;
    return error ? { ...fail(error), output } : { tab, output, ms };
  } catch (err) {
    if (err instanceof PakhiError) return fail(err);
    throw err;
  }
}

export default function Playground() {
  const [code, setCode] = useState(INITIAL.code);
  const [tab, setTab] = useState<Tab>("output");
  const [result, setResult] = useState<PlaygroundResult | null>(null);
  const [shareLabel, setShareLabel] = useState("Share");
  const sectionRef = useRef<HTMLElement>(null);

  const run = useCallback((source: string, activeTab: Tab) => {
    // a fresh runId each time, so the output animation replays even if the result is identical
    setResult({ ...execute(source, activeTab), runId: Date.now() });
  }, []);

  // Load code from the URL hash (#code=...) on first render and whenever it changes.
  // The "Playground e chalao" links in the documentation use this.
  useEffect(() => {
    const loadFromHash = (scroll: boolean) => {
      if (!location.hash.startsWith(HASH_PREFIX)) return false;
      const fromHash = decodeURIComponent(location.hash.slice(HASH_PREFIX.length));
      setCode(fromHash);
      setTab("output");
      run(fromHash, "output");
      if (scroll) sectionRef.current?.scrollIntoView({ behavior: "smooth" });
      return true;
    };

    if (!loadFromHash(false)) run(INITIAL.code, "output");
    const onHashChange = () => loadFromHash(true);
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, [run]);

  function changeTab(next: Tab) {
    setTab(next);
    run(code, next);
  }

  function loadExample(name: string) {
    const example = EXAMPLES.find((e) => e.name === name);
    if (!example) return;
    setCode(example.code);
    run(example.code, tab);
  }

  async function share() {
    const url = location.href.split("#")[0] + HASH_PREFIX + encodeURIComponent(code);
    history.replaceState(null, "", url);
    try {
      await navigator.clipboard.writeText(url);
      setShareLabel("Link copied");
    } catch {
      setShareLabel("Link in address bar");
    }
    setTimeout(() => setShareLabel("Share"), 1500);
  }

  const kbd = "inline-block rounded-[5px] border border-b-2 border-line-strong bg-surface px-1.5 py-px text-[11px] text-muted";

  return (
    <section id="playground" ref={sectionRef} className={SECTION}>
      <div className={CONTAINER}>
        <SectionHeading
          eyebrow="Playground"
          title={
            <>
              Likho, chalao, <span className={GRADIENT_TEXT}>shikho</span>
            </>
          }
          description="Kichu install korte hobe na. Code ta tomar browser ei chole. Example bechhe nao ba nije likho."
        />

        <div
          className={cn(
            "relative overflow-hidden rounded-2xl border border-line-strong bg-elevated shadow-[0_40px_100px_-40px_rgba(255,95,162,0.25),0_30px_60px_-30px_rgba(0,0,0,0.8)]",
            reveal()
          )}
        >
          {/* ---- toolbar ---- */}
          <div className="flex min-h-[58px] flex-wrap items-center gap-2.5 border-b border-line bg-white/[0.02] px-3 py-2.5 sm:flex-nowrap sm:gap-4 sm:pr-3.5 sm:pl-[18px]">
            <WindowDots muted className="max-sm:hidden" />
            <label className="relative inline-block max-sm:w-full">
              <span className="sr-only">Example</span>
              <select
                className="h-9 w-full cursor-pointer sm:w-auto appearance-none rounded-lg border border-line-strong bg-surface pr-[34px] pl-3 text-sm font-medium text-fg [&>option]:bg-[#16161d]"
                defaultValue={INITIAL.name}
                onChange={(e) => loadExample(e.target.value)}
              >
                {EXAMPLES.map((e) => (
                  <option key={e.name} value={e.name}>
                    {e.name}
                  </option>
                ))}
              </select>
              {/* chevron */}
              <span
                aria-hidden="true"
                className="pointer-events-none absolute top-1/2 right-3 -mt-[5px] size-1.5 rotate-45 border-r-[1.5px] border-b-[1.5px] border-muted"
              />
            </label>

            <div className="flex items-center gap-2 max-sm:w-full max-sm:[&>button]:flex-1 sm:ml-auto">
              <span className="mr-1.5 text-xs text-faint max-sm:hidden">
                <kbd className={kbd}>Ctrl</kbd> + <kbd className={kbd}>Enter</kbd>
              </span>
              <button type="button" className={button("secondary", "sm")} onClick={share}>
                <Icon name={shareLabel === "Share" ? "link" : "check"} size={15} />
                {shareLabel}
              </button>
              <button type="button" className={button("primary", "sm")} onClick={() => run(code, tab)}>
                <Icon name="play" size={14} />
                Chalao
              </button>
            </div>
          </div>

          {/* ---- editor | output ---- */}
          <div className="grid grid-cols-1 lg:h-[520px] lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
            <CodeEditor
              value={code}
              onChange={setCode}
              onRun={() => run(code, tab)}
              errorLine={result?.error?.loc?.line ?? null}
            />
            <OutputPanel tab={tab} onTabChange={changeTab} result={result} />
          </div>
        </div>
      </div>
    </section>
  );
}
