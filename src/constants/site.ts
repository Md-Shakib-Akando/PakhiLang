export const SITE = {
  name: "PakhiLang",
  version: "0.1.0",
  tagline: "Programming, ekhon pakhi'r bhashay",
  description:
    "PakhiLang is a tiny, friendly programming language written in Banglish. Write code that reads like a love letter, and learn how a real tokenizer, parser and interpreter work along the way.",
} as const;

export const AUTHOR = {
  name: "Shakib Akando",
  github: "https://github.com/Md-Shakib-Akando",
} as const;

export const NAV_LINKS = [
  { href: "#features", label: "Features" },
  { href: "#how-it-works", label: "Kivabe kaj kore" },
  { href: "#playground", label: "Playground" },
  { href: "#docs", label: "Docs" },
] as const;

/** Shown in the hero code window. Its output is computed by actually running it. */
export const HERO_CODE = `hi pakhi
  dhoro pakhi naam = "Pakhi";

  kaj pakhi chithi(din) {
    jodi pakhi (din == 1) ferot dao pakhi "bhalo lagse";
    nahole jodi pakhi (din == 2) ferot dao pakhi "fuchka khabe?";
    ferot dao pakhi khali;
  }

  dhoro pakhi din = 1;
  jotokkhon pakhi (chithi(din) != khali) {
    bolo pakhi naam + ", " + chithi(din);
    din += 1;
  }
bye pakhi`;

export const HERO_STATS = [
  { value: "12", label: "Banglish keywords" },
  { value: "0", label: "runtime dependencies" },
  { value: "2", label: "platforms: browser + Node" },
] as const;

/** Used in the "Kivabe kaj kore" section: one line, followed through every stage. */
export const PIPELINE_CODE = `bolo pakhi 1 + 2 * 3;`;
