/** Example programs shown in the playground's dropdown. */
export interface Example {
  name: string;
  code: string;
}

/** Name of the example the playground opens with. */
export const DEFAULT_EXAMPLE = "Hello pakhi";

export const EXAMPLES: Example[] = [
  {
    name: "Hello pakhi",
    code: `Ei line ignore hobe — "hi pakhi" er age ja likhba sob ignore.

hi pakhi
  bolo pakhi "Hello pakhi! 🐦";
bye pakhi`,
  },
  {
    name: "Variables",
    code: `hi pakhi
  dhoro pakhi naam = "Pakhi";
  dhoro pakhi boyosh = 21;
  dhoro pakhi bhalobashe = sotti;
  dhoro pakhi ex = khali;

  bolo pakhi "Naam:", naam, "| Boyosh:", boyosh;
  bolo pakhi "Bhalobashe?", bhalobashe, "| Ex:", ex;

  boyosh += 1;
  bolo pakhi "Next year: " + boyosh;
bye pakhi`,
  },
  {
    name: "Jodi / Nahole (if-else)",
    code: `hi pakhi
  dhoro pakhi mood = 75;

  jodi pakhi (mood > 90) {
    bolo pakhi "Pakhi khub khushi 😍";
  } nahole jodi pakhi (mood > 50) {
    bolo pakhi "Pakhi thik ache 🙂";
  } nahole pakhi {
    bolo pakhi "Pakhi block kore dise 💔";
  }
bye pakhi`,
  },
  {
    name: "Jotokkhon (loops)",
    code: `hi pakhi
  dhoro pakhi i = 0;
  jotokkhon pakhi (i < 15) {
    i += 1;
    jodi pakhi (i % 15 == 0) {
      bolo pakhi "PakhiBuzz";
      porer ta pakhi;   // continue
    }
    jodi pakhi (i % 3 == 0) bolo pakhi "Pakhi";
    nahole jodi pakhi (i % 5 == 0) bolo pakhi "Buzz";
    nahole pakhi bolo pakhi i;
  }

  dhoro pakhi msg = 0;
  jotokkhon pakhi (sotti) {
    msg += 1;
    jodi pakhi (msg == 3) {
      bolo pakhi "3 ta message seen, reply nai. Thamlam.";
      thamo pakhi;      // break
    }
  }
bye pakhi`,
  },
  {
    name: "Kaj (functions)",
    code: `hi pakhi
  kaj pakhi fib(n) {
    jodi pakhi (n < 2) ferot dao pakhi n;
    ferot dao pakhi fib(n - 1) + fib(n - 2);
  }

  dhoro pakhi i = 0;
  jotokkhon pakhi (i < 10) {
    bolo pakhi "fib(" + i + ") =", fib(i);
    i += 1;
  }

  // closure
  kaj pakhi counterBanao() {
    dhoro pakhi count = 0;
    kaj pakhi barao() { count += 1; ferot dao pakhi count; }
    ferot dao pakhi barao;
  }
  dhoro pakhi missedCall = counterBanao();
  missedCall(); missedCall();
  bolo pakhi "Pakhi ke missed call:", missedCall();
bye pakhi`,
  },
  {
    name: "Love letter 💌",
    code: `hi pakhi
  dhoro pakhi naam = "Pakhi";
  dhoro pakhi din = 1;

  kaj pakhi chithi(din) {
    jodi pakhi (din == 1) ferot dao pakhi "Prothom dekhay-i bhalo lege gelo.";
    jodi pakhi (din == 2) ferot dao pakhi "Tomar 'seen' dekhe rat ghum hoy na.";
    jodi pakhi (din == 3) ferot dao pakhi "Fuchka khawabo, ashba?";
    ferot dao pakhi khali;
  }

  bolo pakhi "Priyo " + naam + ",";
  jotokkhon pakhi (sotti) {
    dhoro pakhi line = chithi(din);
    jodi pakhi (line == khali) thamo pakhi;
    bolo pakhi "  Din " + din + ": " + line;
    din += 1;
  }
  bolo pakhi "Iti, tomar programmer 🐦";
bye pakhi`,
  },
  {
    name: "Error dekho 😅",
    code: `hi pakhi
  dhoro pakhi crush = "Pakhi";
  bolo pakhi "Amar crush: " + crush;
  bolo pakhi reply;   // "reply" ke to dhoro nai!
bye pakhi`,
  },
];
