import SectionHeading from "@/components/SectionHeading";
import { DOCUMENTATION } from "@/constants/documentation";
import { CONTAINER, GRADIENT_TEXT, SECTION, reveal } from "@/lib/ui";
import Snippet from "./Snippet";

/** Turns `backtick` spans in a description into <code> elements. */
function renderDescription(text: string) {
  return text.split(/`([^`]+)`/).map((part, i) =>
    i % 2 === 1 ? (
      <code
        key={i}
        className="rounded-[5px] border border-line bg-surface-2 px-1.5 py-0.5 text-[0.86em] whitespace-nowrap text-pink-soft"
      >
        {part}
      </code>
    ) : (
      part
    )
  );
}

export default function Documentation() {
  return (
    <section id="docs" className={SECTION}>
      <div className={CONTAINER}>
        <SectionHeading
          align="left"
          eyebrow="Documentation"
          title={
            <>
              5 minute e <span className={GRADIENT_TEXT}>puro language</span>
            </>
          }
          description="Protita example “Playground e chalao” chap diye shorashori chalano jay, ba copy kore nijer moto bodlao."
        />

        <div className="grid grid-cols-1 items-start gap-14 lg:grid-cols-[220px_minmax(0,1fr)]">
          {/* sticky table of contents */}
          <nav className="sticky top-24 hidden lg:block" aria-label="Documentation">
            <p className="mb-3 text-xs font-semibold tracking-[0.08em] text-faint uppercase">On this page</p>
            <ul className="border-l border-line">
              {DOCUMENTATION.map((section) => (
                <li key={section.id}>
                  <a
                    href={`#${section.id}`}
                    className="-ml-px block border-l border-transparent py-1.5 pl-4 text-sm text-muted transition hover:border-pink hover:text-fg"
                  >
                    {section.title}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex flex-col gap-14">
            {DOCUMENTATION.map((section) => (
              <article key={section.id} id={section.id} className={reveal()}>
                <h3 className="group relative mb-2.5 text-[22px] font-semibold tracking-[-0.02em]">
                  <a
                    href={`#${section.id}`}
                    aria-hidden="true"
                    className="absolute -left-[22px] text-faint opacity-0 transition group-hover:opacity-100 max-sm:hidden"
                  >
                    #
                  </a>
                  {section.title}
                </h3>
                <p className="mb-5 max-w-[680px] text-muted">{renderDescription(section.description)}</p>
                <Snippet code={section.code} />
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
