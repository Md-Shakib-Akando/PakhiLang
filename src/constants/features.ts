import type { IconName } from "@/components/Icon";

export interface Feature {
  icon: IconName;
  title: string;
  description: string;
}

export const FEATURES: Feature[] = [
  {
    icon: "message",
    title: "Banglish syntax",
    description:
      "dhoro pakhi, jodi pakhi, jotokkhon pakhi. Keyword gulo shob Banglish, tai code pora jay chithir moto.",
  },
  {
    icon: "braces",
    title: "Functions & closures",
    description:
      "kaj pakhi diye function, ferot dao pakhi diye return. Recursion ar closure duitai kaj kore. bhai-lang e eta nai.",
  },
  {
    icon: "alert",
    title: "Friendly errors",
    description:
      "Protita error e exact line ar column, sathe code frame. Message gulo Banglish e, tai bujhte shohoj.",
  },
  {
    icon: "layers",
    title: "Bhitor ta dekho",
    description:
      "Playground e Tokens ar AST tab ache. Tomar code ke tokenizer ar parser kivabe dekhe, live dekhte parba.",
  },
  {
    icon: "zap",
    title: "Shob jaygay chole",
    description:
      "Pure TypeScript, kono runtime dependency nai. Eki interpreter browser, Node CLI ar test e chole.",
  },
  {
    icon: "shield",
    title: "Safe by default",
    description:
      "Infinite loop ar infinite recursion guard ache, tai bhul code likhleo browser hang hobe na.",
  },
];
