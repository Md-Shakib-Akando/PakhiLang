import Icon from "@/components/Icon";
import Logo from "@/components/Logo";
import { CONTAINER, GRADIENT_TEXT_ANIMATED, SECTION, button, cn, reveal } from "@/lib/ui";

export default function CallToAction() {
  return (
    <section className={SECTION}>
      <div className={CONTAINER}>
        {/* 1px frame: a big conic gradient spins behind the card, showing only at the edge */}
        <div className={cn("relative overflow-hidden rounded-3xl p-px", reveal())}>
          <div
            aria-hidden="true"
            className="absolute top-1/2 left-1/2 aspect-square w-[200%] -translate-x-1/2 -translate-y-1/2"
          >
            <div className="size-full animate-spin-slow bg-[conic-gradient(from_0deg,transparent_0deg,var(--color-pink)_50deg,transparent_110deg,transparent_180deg,var(--color-periwinkle)_230deg,transparent_290deg)]" />
          </div>

          <div className="relative overflow-hidden rounded-[23px] bg-elevated bg-[radial-gradient(500px_260px_at_50%_0%,rgba(255,95,162,0.22),transparent_70%),radial-gradient(500px_260px_at_50%_100%,rgba(139,156,255,0.14),transparent_70%)] px-5 py-12 text-center sm:px-8 sm:py-[72px]">
            <Logo
              size={64}
              className="mx-auto animate-float drop-shadow-[0_14px_30px_rgba(255,95,162,0.45)]"
            />
            <h2 className="mt-6 text-[clamp(28px,4vw,42px)] leading-[1.15] font-bold tracking-[-0.03em] text-balance">
              Pakhi wait kortese.
              <br />
              <span className={GRADIENT_TEXT_ANIMATED}>Prothom program ta likhe felo.</span>
            </h2>
            <p className="mt-[18px] text-muted">
              Tin line e shuru: <code className="text-[0.9em] text-pink-soft">hi pakhi</code>,{" "}
              <code className="text-[0.9em] text-pink-soft">bolo pakhi &quot;…&quot;;</code>,{" "}
              <code className="text-[0.9em] text-pink-soft">bye pakhi</code>.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <a href="#playground" className={button("primary")}>
                <Icon name="play" size={16} />
                Playground e chalao
              </a>
              <a href="#docs" className={cn(button("secondary"), "group")}>
                Docs porho
                <Icon name="arrowRight" size={16} className="transition-transform duration-200 group-hover:translate-x-1" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
