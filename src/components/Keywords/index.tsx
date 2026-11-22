import SectionHeading from "@/components/SectionHeading";
import { KEYWORDS } from "@/constants/keywords";
import { CONTAINER, GRADIENT_TEXT, SECTION, cn, reveal } from "@/lib/ui";

const CELL = "border-b border-line px-3.5 py-[11px] whitespace-nowrap sm:px-6 sm:py-[13px]";

export default function Keywords() {
  return (
    <section id="keywords" className={SECTION}>
      <div className={CONTAINER}>
        <SectionHeading
          eyebrow="Keyword reference"
          title={
            <>
              JavaScript jano? <span className={GRADIENT_TEXT}>Tahole PakhiLang-o jano</span>
            </>
          }
          description="Protita PakhiLang keyword er JavaScript equivalent."
        />
        <div className={cn("mx-auto max-w-[880px] overflow-x-auto rounded-[14px] border border-line bg-surface", reveal())}>
          <table className="w-full border-collapse text-sm sm:text-[15px]">
            <thead>
              <tr className="bg-white/[0.02] text-left text-xs font-semibold tracking-[0.08em] text-faint uppercase">
                <th scope="col" className={CELL}>PakhiLang</th>
                <th scope="col" className={CELL}>JavaScript</th>
                <th scope="col" className={CELL}>Mane</th>
              </tr>
            </thead>
            <tbody>
              {KEYWORDS.map(([pakhi, js, meaning]) => (
                <tr key={pakhi} className="group transition-colors hover:bg-pink/[0.04] [&:last-child>td]:border-b-0">
                  <td className={CELL}>
                    <code className="inline-block text-sm font-semibold text-pink-soft transition-transform duration-200 group-hover:translate-x-1">{pakhi}</code>
                  </td>
                  <td className={CELL}>
                    <code className="text-sm text-syn-function">{js}</code>
                  </td>
                  <td className={`${CELL} text-muted`}>{meaning}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
