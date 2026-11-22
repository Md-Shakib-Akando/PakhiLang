import Icon from "@/components/Icon";
import { HERO_CODE, HERO_STATS, SITE } from "@/constants/site";
import { runAndCollect } from "@/lib/pakhilang";
import { CONTAINER, ENTRANCE_DELAY, GRADIENT_BG, GRADIENT_TEXT_ANIMATED, button, cn } from "@/lib/ui";
import TypingCode from "./TypingCode";

/** Fade + un-blur + slide up on page load, staggered by `step`. */
const enter = (step: number) => cn("animate-fade-up", ENTRANCE_DELAY[step]);

export default function Hero() {
  // Runs at build time (server component), so the output shown is the REAL output.
  const { output } = runAndCollect(HERO_CODE);

  return (
    <section id="top" className="relative overflow-hidden pt-16 pb-10 lg:pt-24">
      {/* soft glows, slowly breathing */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 animate-glow bg-[radial-gradient(600px_400px_at_15%_10%,rgba(255,95,162,0.16),transparent_70%),radial-gradient(700px_500px_at_85%_30%,rgba(139,156,255,0.13),transparent_70%)]"
      />
      {/* faint grid that fades out */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-size-[56px_56px] mask-[radial-gradient(ellipse_70%_60%_at_50%_30%,#000_30%,transparent_75%)]"
      />

      <div className={cn(CONTAINER, "relative grid grid-cols-1 items-center gap-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]")}>
        {/* ---- copy ---- */}
        <div>
          <a
            href="#how-it-works"
            className={cn(
              "inline-flex items-center gap-2 rounded-full border border-line-strong bg-surface py-1.5 pr-3 pl-2.5 text-[13px] text-muted transition hover:border-pink/50 hover:text-fg",
              enter(0)
            )}
          >
            <span className="relative flex size-[7px]">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-pink opacity-75" />
              <span className="relative inline-flex size-[7px] rounded-full bg-pink" />
            </span>
            Tokenizer → Parser → Interpreter
            <Icon name="arrowRight" size={14} />
          </a>

          <h1
            className={cn(
              "mt-6 text-[clamp(42px,6vw,68px)] leading-[1.04] font-extrabold tracking-[-0.045em] text-balance",
              enter(1)
            )}
          >
            Programming,
            <br />
            ekhon <span className={GRADIENT_TEXT_ANIMATED}>pakhi&apos;r bhashay</span>
          </h1>

          <p className={cn("mt-6 max-w-[520px] text-lg leading-[1.65] text-muted", enter(2))}>{SITE.description}</p>

          <div className={cn("mt-9 flex flex-wrap gap-3", enter(3))}>
            <a href="#playground" className={cn(button("primary"), "max-sm:flex-1 max-sm:basis-full")}>
              <Icon name="play" size={16} />
              Playground e chalao
            </a>
            <a href="#docs" className={cn(button("secondary"), "max-sm:flex-1 max-sm:basis-full")}>
              <Icon name="book" size={16} />
              Documentation
            </a>
          </div>

          <dl className={cn("mt-12 flex gap-6 border-t border-line pt-7 sm:gap-10", enter(4))}>
            {HERO_STATS.map((stat) => (
              <div key={stat.label} className="flex flex-col-reverse">
                <dt className="text-[13px] text-faint">{stat.label}</dt>
                <dd className="text-[22px] font-bold tracking-[-0.03em] sm:text-[28px]">{stat.value}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* ---- code window ---- */}
        <div className={cn("relative", enter(3))}>
          {/* outer layer sets the strength, inner layer breathes */}
          <div aria-hidden="true" className="absolute inset-x-[6%] top-[8%] -bottom-[6%] opacity-20 blur-[70px]">
            <div className={cn("size-full animate-glow rounded-[40px]", GRADIENT_BG)} />
          </div>
          <TypingCode fileName="love-letter.pakhi" code={HERO_CODE} output={output} />
        </div>
      </div>
    </section>
  );
}
