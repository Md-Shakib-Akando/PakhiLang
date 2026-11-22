import SectionHeading from "@/components/SectionHeading";
import { PIPELINE_CODE } from "@/constants/site";
import { parse, runAndCollect, tokenize } from "@/lib/pakhilang";
import { CONTAINER, GRADIENT_BG, GRADIENT_TEXT, SECTION, cn, reveal } from "@/lib/ui";
import { astToTree } from "./astToTree";

export default function HowItWorks() {
  // Everything below is produced by the real PakhiLang pipeline at build time.
  const program = `hi pakhi ${PIPELINE_CODE} bye pakhi`;
  const tokens = tokenize(program).slice(1, -1); // drop "hi pakhi" / "bye pakhi"
  const tree = astToTree(parse(program).body[0]);
  const { output } = runAndCollect(program);

  const steps = [
    {
      title: "Source code",
      text: "Tumi ja likho, computer er kache sheta shudhu ekta lomba string.",
      body: <code className="text-[13px] whitespace-nowrap text-fg">{PIPELINE_CODE}</code>,
    },
    {
      title: "Tokenizer",
      text: "Regex er ekta list diye string ke chhoto chhoto token e bhenge fele.",
      body: (
        <div className="flex flex-wrap gap-1.5">
          {tokens.map((t, i) => (
            <span
              key={i}
              className="inline-flex flex-col rounded-md border border-pink/20 bg-pink/[0.08] px-2 py-1 font-mono leading-[1.3]"
            >
              <span className="text-[12.5px] text-fg">{t.value}</span>
              <span className="text-[9.5px] text-faint">{t.type}</span>
            </span>
          ))}
        </div>
      ),
    },
    {
      title: "Parser",
      text: "Grammar mene token gulo diye ekta tree (AST) banay. Operator precedence ekhanei thik hoy.",
      body: <pre className="text-[11px] leading-[1.55] text-zinc-300">{tree}</pre>,
    },
    {
      title: "Interpreter",
      text: "Tree ta walk kore protita node er value ber kore, tarpor output dey.",
      body: (
        <div className="flex w-full flex-col items-center gap-1.5">
          <span className="text-[11px] font-semibold tracking-[0.08em] text-faint uppercase">output</span>
          <span className={cn("font-mono text-[52px] leading-none font-bold", GRADIENT_TEXT)}>{output.join("\n")}</span>
        </div>
      ),
    },
  ];

  return (
    <section id="how-it-works" className={SECTION}>
      <div className={CONTAINER}>
        <SectionHeading
          eyebrow="Kivabe kaj kore"
          title={
            <>
              Ek line code er <span className={GRADIENT_TEXT}>puro jatra</span>
            </>
          }
          description="PakhiLang ekta tree-walking interpreter. Protita line 4 ta dhap par hoye output hoy. Playground er Tokens ar AST tab e tomar nijer code er jonno-o eta dekhte parba."
        />
        <ol className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {steps.map((step, i) => (
            <li
              key={step.title}
              className={cn(
                "group relative flex flex-col rounded-[14px] border border-line bg-surface p-6 transition-colors duration-300 hover:border-pink/30",
                reveal(i)
              )}
            >
              {/* chevron connecting to the next step (only when steps sit side by side) */}
              {i < steps.length - 1 && (
                <span
                  aria-hidden="true"
                  className={cn("absolute top-[30px] -right-[15px] z-10 hidden animate-nudge", i % 2 === 0 ? "sm:block" : "xl:block")}
                  style={{ animationDelay: `${i * 300}ms` }}
                >
                  <span className="block size-[9px] rotate-45 border-t-2 border-r-2 border-pink" />
                </span>
              )}
              <div className="flex items-center gap-3">
                <span className={cn("grid size-[26px] place-items-center rounded-full text-[13px] font-bold text-[#14060d] transition-transform duration-300 group-hover:scale-110", GRADIENT_BG)}>
                  {i + 1}
                </span>
                <h3 className="text-base font-semibold">{step.title}</h3>
              </div>
              <p className="mt-3 mb-5 text-sm leading-relaxed text-muted">{step.text}</p>
              <div className="mt-auto flex min-h-40 items-center overflow-x-auto rounded-[10px] border border-line bg-black/35 p-3.5">
                {step.body}
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
