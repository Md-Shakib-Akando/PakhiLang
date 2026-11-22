import { NAV_LINKS, SITE } from "@/constants/site";
import { CONTAINER, button, cn } from "@/lib/ui";

export default function Navbar() {
  return (
    <header className="nav-scroll sticky top-0 z-50 h-16 border-b backdrop-blur-md backdrop-saturate-150">
      <div className={cn(CONTAINER, "flex h-full items-center justify-between gap-8")}>
        <a href="#top" className="group flex items-center gap-2.5" aria-label={`${SITE.name} home`}>
          <span
            aria-hidden="true"
            className="grid size-8 place-items-center rounded-[9px] transition duration-300 group-hover:-rotate-12 group-hover:scale-110 border border-pink/30 bg-linear-140 from-pink/25 to-periwinkle/20 text-[17px]"
          >
            🐦
          </span>
          <span className="text-[17px] font-bold tracking-[-0.02em]">{SITE.name}</span>
          <span className="rounded-full border border-line-strong px-[7px] py-0.5 text-[11px] font-medium text-muted max-[400px]:hidden">
            v{SITE.version}
          </span>
        </a>

        <nav className="ml-auto hidden gap-7 md:flex" aria-label="Main">
          {NAV_LINKS.map((link) => (
            <a key={link.href} href={link.href} className="relative text-sm font-medium text-muted transition-colors after:absolute after:inset-x-0 after:-bottom-1 after:h-px after:origin-left after:scale-x-0 after:bg-pink after:transition-transform after:duration-300 hover:text-fg hover:after:scale-x-100">
              {link.label}
            </a>
          ))}
        </nav>

        <a href="#playground" className={button("primary", "sm")}>
          Try it now
        </a>
      </div>
    </header>
  );
}
