import { NAV_LINKS, SITE } from "@/constants/site";
import { CONTAINER, cn } from "@/lib/ui";

const RESOURCES = [
  { href: "https://github.com/DulLabs/bhai-lang", label: "bhai-lang (inspiration)" },
  { href: "https://craftinginterpreters.com", label: "Crafting Interpreters" },
];

const HEADING = "mb-3.5 text-xs font-semibold tracking-[0.08em] text-faint uppercase";
const LINK = "text-sm text-muted transition-colors hover:text-fg";

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-line bg-white/[0.01] md:mt-28">
      <div className={cn(CONTAINER, "grid grid-cols-2 gap-8 pt-14 pb-12 md:grid-cols-[2fr_1fr_1fr] md:gap-12")}>
        <div className="col-span-2 md:col-span-1">
          <div className="text-lg font-bold tracking-[-0.02em]">
            <span aria-hidden="true">🐦</span> {SITE.name}
          </div>
          <p className="mt-3 max-w-[340px] text-sm text-muted">
            Ekta toy programming language, pakhi ke bhalobeshe banano. Tokenizer, parser ar interpreter shob
            khola, shekhar jonno.
          </p>
        </div>

        <div>
          <h3 className={HEADING}>Explore</h3>
          <ul className="space-y-2.5">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <a href={link.href} className={LINK}>
                  {link.label}
                </a>
              </li>
            ))}
            <li>
              <a href="#keywords" className={LINK}>
                Keyword reference
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h3 className={HEADING}>Resources</h3>
          <ul className="space-y-2.5">
            {RESOURCES.map((link) => (
              <li key={link.href}>
                <a href={link.href} target="_blank" rel="noopener noreferrer" className={LINK}>
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className={CONTAINER}>
        <div className="flex flex-wrap justify-between gap-2 border-t border-line pt-5 pb-7 text-[13px] text-faint">
          <span>
            © {new Date().getFullYear()} {SITE.name} · v{SITE.version} · MIT License
          </span>
          <span>Made with 💗 for every pakhi</span>
        </div>
      </div>
    </footer>
  );
}
