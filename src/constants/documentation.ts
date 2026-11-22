/**
 * Documentation sections shown on the home page (like bhailang.js.org).
 * `description` supports `inline code` with backticks.
 */
export interface DocSection {
  id: string;
  title: string;
  description: string;
  code: string;
}

export const DOCUMENTATION: DocSection[] = [
  {
    id: "general",
    title: "General",
    description:
      "`hi pakhi` holo program er shuru ar `bye pakhi` holo shesh. Er baire ja likhba, sob ignore hobe.",
    code: `Eta ignore hobe

hi pakhi
  // code ekhane
bye pakhi

Eta-o ignore hobe`,
  },
  {
    id: "variables",
    title: "Variables",
    description:
      "Variable declare korte `dhoro pakhi` likho. Ekbare comma diye onekgula declare kora jay. Semicolon optional.",
    code: `hi pakhi
  dhoro pakhi a = 10;
  dhoro pakhi b = "two", c;   // c holo khali
  a = a + 1;
  a += 5;                     // -= *= /= %= o ache
bye pakhi`,
  },
  {
    id: "types",
    title: "Types",
    description:
      "Number ar string onno language er motoi. `sotti` / `mittha` holo boolean, `khali` holo null. `khali`, `mittha`, `0` ar `\"\"` falsy, baki sob truthy.",
    code: `hi pakhi
  dhoro pakhi a = 10;
  dhoro pakhi b = 10 + (15 * 20);
  dhoro pakhi c = "two";
  dhoro pakhi d = 'ok\\n';
  dhoro pakhi e = khali;
  dhoro pakhi f = sotti;
  dhoro pakhi g = mittha;
bye pakhi`,
  },
  {
    id: "print",
    title: "Built-ins",
    description:
      "Kichu print korte `bolo pakhi` use koro. Comma diye onekgula value dile space diye jora hobe. String er sathe `+` korle sob string hoye jay.",
    code: `hi pakhi
  bolo pakhi "Hello World";
  dhoro pakhi a = 10;
  {
    dhoro pakhi b = 20;
    bolo pakhi a + b;
  }
  bolo pakhi 5, 'ok', khali, sotti, mittha;
  bolo pakhi "Boyosh: " + 21;
bye pakhi`,
  },
  {
    id: "conditionals",
    title: "Conditionals",
    description:
      "Condition `sotti` hole `jodi pakhi` block chole. Na hole porer `nahole jodi pakhi` gulo ekta ekta kore check hoy, ar kono-tai na mille `nahole pakhi` block chole.",
    code: `hi pakhi
  dhoro pakhi a = 10;
  jodi pakhi (a < 20) {
    bolo pakhi "a is less than 20";
  } nahole jodi pakhi (a < 25) {
    bolo pakhi "a is less than 25";
  } nahole pakhi {
    bolo pakhi "a is greater than or equal to 25";
  }
bye pakhi`,
  },
  {
    id: "loops",
    title: "Loops",
    description:
      "Condition `sotti` thaka porjonto `jotokkhon pakhi` block cholte thake. Loop theke ber hote `thamo pakhi`, ar porer round e jete `porer ta pakhi`.",
    code: `hi pakhi
  dhoro pakhi a = 0;
  jotokkhon pakhi (a < 10) {
    a += 1;
    jodi pakhi (a == 5) {
      bolo pakhi "vitor theke bolo pakhi", a;
      porer ta pakhi;
    }
    jodi pakhi (a == 6) {
      thamo pakhi;
    }
    bolo pakhi a;
  }
  bolo pakhi "done";
bye pakhi`,
  },
  {
    id: "functions",
    title: "Functions",
    description:
      "`kaj pakhi` diye function banao ar `ferot dao pakhi` diye value ferot dao. Recursion ar closure duitai kaj kore. (bhai-lang e eta nai!)",
    code: `hi pakhi
  kaj pakhi jog(a, b) {
    ferot dao pakhi a + b;
  }
  bolo pakhi jog(2, 3);

  kaj pakhi fact(n) {
    jodi pakhi (n <= 1) ferot dao pakhi 1;
    ferot dao pakhi n * fact(n - 1);
  }
  bolo pakhi fact(5);
bye pakhi`,
  },
];
