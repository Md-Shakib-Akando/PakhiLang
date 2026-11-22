# 🐦 PakhiLang

> A toy programming language for everyone who calls their girlfriend *pakhi*.
> Inspired by [bhai-lang](https://github.com/DulLabs/bhai-lang), but in Banglish.

```
hi pakhi
  bolo pakhi "Hello pakhi!";
bye pakhi
```

PakhiLang is a small, dynamically typed, interpreted language written in TypeScript with zero runtime dependencies. It has variables, if/else-if/else, while loops with break/continue, functions with recursion and closures, and error messages that point at the line and column where things went wrong.

---

## Quick start

```bash
npm install

# Website + playground (Next.js)
npm run dev              # http://localhost:3000
npm run build            # production build
npm start                # serve the production build

# Language CLI + tests
npm run build:lib        # bundles dist/pakhilang.js (library) and dist/cli.js (CLI)
npm test                 # builds the library, then runs 30 tests
node dist/cli.js examples/hello.pakhi
node dist/cli.js -e 'hi pakhi bolo pakhi 1 + 2; bye pakhi'
npm link                 # optional: install the `pakhi` command globally
```

**Website:** the home page has a live playground and the language documentation. The playground has Output, Tokens and AST tabs, so you can see every stage of the interpreter. Every documentation snippet has a "Playground e chalao" button that loads it into the editor.

**Learn how it works:** read [docs/HOW_IT_WORKS.md](docs/HOW_IT_WORKS.md).

---

## Documentation

### General
`hi pakhi` is the entry point and `bye pakhi` is the end of the program. Anything outside of them is ignored.

```
Eta ignore hobe

hi pakhi
  // code ekhane
bye pakhi

Eta-o ignore hobe
```

### Variables
Declare variables with `dhoro pakhi`. Semicolons are optional.

```
hi pakhi
  dhoro pakhi a = 10;
  dhoro pakhi b = "two", c;     // c is khali
  a = a + 1;
  a += 5;                       // also -= *= /= %=
bye pakhi
```

### Types
| PakhiLang | Meaning |
|-----------|---------|
| `10`, `3.14` | number |
| `"text"`, `'text'` | string (escapes: `\n \t \" \'`) |
| `sotti` / `mittha` | true / false |
| `khali` | null |

`khali`, `mittha`, `0` and `""` are falsy. Everything else is truthy.

### Print
```
hi pakhi
  bolo pakhi "Hello", 5, sotti, khali;     // Hello 5 sotti khali
  bolo pakhi "Boyosh: " + 21;              // string + anything = string
bye pakhi
```

### Conditionals
```
hi pakhi
  dhoro pakhi mood = 75;
  jodi pakhi (mood > 90) {
    bolo pakhi "khushi";
  } nahole jodi pakhi (mood > 50) {
    bolo pakhi "thik ache";
  } nahole pakhi {
    bolo pakhi "block";
  }
bye pakhi
```

### Loops
`jotokkhon pakhi` is the while loop, `thamo pakhi` is break and `porer ta pakhi` is continue.

```
hi pakhi
  dhoro pakhi i = 0;
  jotokkhon pakhi (i < 10) {
    i += 1;
    jodi pakhi (i == 3) porer ta pakhi;
    jodi pakhi (i == 6) thamo pakhi;
    bolo pakhi i;
  }
bye pakhi
```

### Functions *(not in bhai-lang)*
Declare a function with `kaj pakhi` and return a value with `ferot dao pakhi`.

```
hi pakhi
  kaj pakhi fib(n) {
    jodi pakhi (n < 2) ferot dao pakhi n;
    ferot dao pakhi fib(n - 1) + fib(n - 2);
  }
  bolo pakhi fib(10);       // 55
bye pakhi
```

Functions are values, and they capture the scope they were defined in (closures). See [examples/functions.pakhi](examples/functions.pakhi).

### Operators
| Kind | Operators |
|------|-----------|
| Arithmetic | `+ - * / %`, unary `-` |
| Comparison | `== != < > <= >=` |
| Logical | `&& \|\| !` (short-circuit) |
| Assignment | `= += -= *= /= %=` |

### Keyword cheat sheet
| PakhiLang | JavaScript |
|-----------|------------|
| `hi pakhi` / `bye pakhi` | program start / end |
| `bolo pakhi` | `console.log` |
| `dhoro pakhi` | `let` |
| `jodi pakhi` | `if` |
| `nahole jodi pakhi` | `else if` |
| `nahole pakhi` | `else` |
| `jotokkhon pakhi` | `while` |
| `thamo pakhi` | `break` |
| `porer ta pakhi` | `continue` |
| `kaj pakhi` | `function` |
| `ferot dao pakhi` | `return` |
| `sotti` / `mittha` / `khali` | `true` / `false` / `null` |

### Errors
```
✖ PakhiRuntimeError examples/x.pakhi:3:14
  Pakhi, "y" ke to chini na! Age "dhoro pakhi" diye dhoro.

3 |   bolo pakhi y;
  |              ^
```

There are two safety nets. A single loop stops after 100,000 iterations, and the call depth is capped at 500. Both protect the playground from freezing.

---

## Project structure

This is a Next.js (App Router) project with a `src/` directory, styled with **Tailwind CSS v4**.

Animations need no library. They use CSS keyframes defined in `globals.css` (`animate-fade-up`, `animate-float`, ...), scroll-driven CSS animations for the scroll reveal and the navbar (`reveal`, `nav-scroll` utilities), and a little React for the hero typing effect and the mouse-following spotlight. With "reduce motion" turned on in the OS, everything shows up immediately without animating. The language itself lives in `src/lib/pakhilang/` and has no React or Next.js dependency. The same code runs in the browser playground, in the Node CLI and in the tests.

```
PakhiLang/
├── src/
│   ├── app/                          Next.js routes
│   │   ├── layout.tsx                root layout, fonts (Inter + JetBrains Mono), metadata
│   │   ├── page.tsx                  landing page: composes all sections below
│   │   ├── globals.css               Tailwind entry: @import "tailwindcss" + @theme colors (the ONLY .css file)
│   │   └── icon.svg                  favicon
│   ├── components/                   one folder per component, styled with Tailwind classes
│   │   ├── Navbar/                   sticky blurred top bar
│   │   ├── Hero/                     headline + typing code window (TypingCode.tsx; output computed at build time)
│   │   ├── Features/                 6 feature cards
│   │   ├── HowItWorks/               source → tokens → AST → output, from the real pipeline
│   │   ├── Playground/               "use client": index.tsx, CodeEditor.tsx, OutputPanel.tsx
│   │   ├── Documentation/            sticky sidebar + sections, Snippet.tsx
│   │   ├── Keywords/                 PakhiLang ↔ JavaScript reference table
│   │   ├── CallToAction/
│   │   ├── Footer/
│   │   ├── SectionHeading/  Icon/  HighlightedCode/  CopyButton/  WindowDots/  SpotlightCard/   (shared)
│   ├── constants/                    site.ts, features.ts, examples.ts, documentation.ts, keywords.ts
│   ├── lib/
│   │   ├── pakhilang/                ── THE LANGUAGE ──
│   │   │   ├── lexer/tokens.ts       token types + the regex SPEC table     (stage 1)
│   │   │   ├── lexer/tokenizer.ts    source text -> tokens                  (stage 1)
│   │   │   ├── parser/ast.ts         AST node types
│   │   │   ├── parser/parser.ts      recursive descent parser: tokens -> AST (stage 2)
│   │   │   ├── interpreter/          tree-walking interpreter: AST -> runs  (stage 3)
│   │   │   ├── errors.ts             PakhiError + code frame
│   │   │   └── index.ts              public API: run, runAndCollect, parse, tokenize
│   │   ├── highlight.ts              source -> colored segments
│   │   └── ui.ts                     shared Tailwind class helpers: cn(), button(), CONTAINER, GRADIENT_TEXT
│   └── cli/index.ts                  `pakhi` command (bundled to dist/cli.js)
├── examples/*.pakhi                  sample programs for the CLI
├── test/pakhilang.test.mjs           node:test suite (runs against dist/pakhilang.js)
├── docs/HOW_IT_WORKS.md              deep-dive learning guide (Banglish)
├── next.config.ts
├── postcss.config.mjs               Tailwind CSS v4 PostCSS plugin
├── tsconfig.json                     `@/*` -> `src/*`
└── package.json
```

## Using the language in code

```ts
import { runAndCollect } from "@/lib/pakhilang";

const { output, error } = runAndCollect(`hi pakhi bolo pakhi 2 * 21; bye pakhi`);
// output = ["42"], error = null
```

## Credits

The idea and the architecture come from [bhai-lang](https://github.com/DulLabs/bhai-lang) by DulLabs. PakhiLang is an independent implementation with Banglish keywords.
