/**
 * Token types of PakhiLang.
 *
 * Keyword tokens use the keyword text itself as their type, exactly like
 * bhai-lang's `TokenTypes` (e.g. HI_BHAI_TYPE: "hi bhai").
 */
export const T = {
  // ---- program boundaries ----
  HI_PAKHI: "hi pakhi",
  BYE_PAKHI: "bye pakhi",

  // ---- statements ----
  BOLO_PAKHI: "bolo pakhi", // print
  DHORO_PAKHI: "dhoro pakhi", // variable declaration (let)
  JODI_PAKHI: "jodi pakhi", // if
  NAHOLE_JODI_PAKHI: "nahole jodi pakhi", // else if
  NAHOLE_PAKHI: "nahole pakhi", // else
  JOTOKKHON_PAKHI: "jotokkhon pakhi", // while
  THAMO_PAKHI: "thamo pakhi", // break
  PORER_TA_PAKHI: "porer ta pakhi", // continue
  KAJ_PAKHI: "kaj pakhi", // function declaration
  FEROT_DAO_PAKHI: "ferot dao pakhi", // return

  // ---- literals ----
  TRUE: "sotti",
  FALSE: "mittha",
  NULL: "khali",
  NUMBER: "NUMBER",
  STRING: "STRING",
  IDENTIFIER: "IDENTIFIER",

  // ---- punctuation ----
  SEMICOLON: ";",
  COMMA: ",",
  LBRACE: "{",
  RBRACE: "}",
  LPAREN: "(",
  RPAREN: ")",

  // ---- operators ----
  ASSIGN: "ASSIGN", // =
  COMPLEX_ASSIGN: "COMPLEX_ASSIGN", // += -= *= /= %=
  ADDITIVE: "ADDITIVE", // + -
  MULTIPLICATIVE: "MULTIPLICATIVE", // * / %
  RELATIONAL: "RELATIONAL", // < > <= >=
  EQUALITY: "EQUALITY", // == !=
  AND: "AND", // &&
  OR: "OR", // ||
  NOT: "NOT", // !
} as const;

export type TokenType = (typeof T)[keyof typeof T];

/** `kw("nahole jodi pakhi")` -> /nahole\s+jodi\s+pakhi\b/y  (any whitespace between words) */
function kw(text: string): RegExp {
  return new RegExp(text.split(" ").join("\\s+") + "\\b", "y");
}

/**
 * The lexical grammar: an ORDERED list of (regex, tokenType).
 * The tokenizer tries them top to bottom and the FIRST match wins, so order matters:
 *  - longer keywords before shorter ones ("nahole jodi pakhi" before "nahole pakhi")
 *  - keywords before identifiers
 *  - "==" before "=", "<=" before "<", "+=" before "+"
 *
 * tokenType `null` means "match it, then throw it away" (whitespace, comments).
 *
 * All regexes are *sticky* (`y` flag): they only match exactly at `lastIndex`,
 * so we never need to slice the source string (bhai-lang slices on every token).
 */
export const SPEC: ReadonlyArray<{ regex: RegExp; type: TokenType | null }> = [
  // whitespace & comments
  { regex: /\s+/y, type: null },
  { regex: /\/\/[^\n]*/y, type: null },
  { regex: /\/\*[\s\S]*?\*\//y, type: null },

  // punctuation
  { regex: /;/y, type: T.SEMICOLON },
  { regex: /,/y, type: T.COMMA },
  { regex: /\{/y, type: T.LBRACE },
  { regex: /\}/y, type: T.RBRACE },
  { regex: /\(/y, type: T.LPAREN },
  { regex: /\)/y, type: T.RPAREN },

  // keywords (longest first where they share a prefix)
  { regex: kw("hi pakhi"), type: T.HI_PAKHI },
  { regex: kw("bye pakhi"), type: T.BYE_PAKHI },
  { regex: kw("bolo pakhi"), type: T.BOLO_PAKHI },
  { regex: kw("dhoro pakhi"), type: T.DHORO_PAKHI },
  { regex: kw("jodi pakhi"), type: T.JODI_PAKHI },
  { regex: kw("nahole jodi pakhi"), type: T.NAHOLE_JODI_PAKHI },
  { regex: kw("nahole pakhi"), type: T.NAHOLE_PAKHI },
  { regex: kw("jotokkhon pakhi"), type: T.JOTOKKHON_PAKHI },
  { regex: kw("thamo pakhi"), type: T.THAMO_PAKHI },
  { regex: kw("porer ta pakhi"), type: T.PORER_TA_PAKHI },
  { regex: kw("kaj pakhi"), type: T.KAJ_PAKHI },
  { regex: kw("ferot dao pakhi"), type: T.FEROT_DAO_PAKHI },

  // literal keywords
  { regex: /sotti\b/y, type: T.TRUE },
  { regex: /mittha\b/y, type: T.FALSE },
  { regex: /khali\b/y, type: T.NULL },

  // numbers: NO leading sign here! (bhai-lang puts [+-]? in the number regex,
  // which makes `a -1` tokenize as IDENT, NUMBER(-1) -> syntax error.
  // We handle negative numbers with a unary minus in the parser instead.)
  { regex: /\d+(?:\.\d+)?/y, type: T.NUMBER },

  // identifiers
  { regex: /[A-Za-z_][A-Za-z0-9_]*/y, type: T.IDENTIFIER },

  // operators (longest first)
  { regex: /[=!]=/y, type: T.EQUALITY },
  { regex: /[+\-*/%]=/y, type: T.COMPLEX_ASSIGN },
  { regex: /=/y, type: T.ASSIGN },
  { regex: /&&/y, type: T.AND },
  { regex: /\|\|/y, type: T.OR },
  { regex: /!/y, type: T.NOT },
  { regex: /[<>]=?/y, type: T.RELATIONAL },
  { regex: /[+\-]/y, type: T.ADDITIVE },
  { regex: /[*/%]/y, type: T.MULTIPLICATIVE },

  // strings: single line, supports escapes like \n \" \'
  { regex: /"(?:[^"\\\n]|\\.)*"/y, type: T.STRING },
  { regex: /'(?:[^'\\\n]|\\.)*'/y, type: T.STRING },
];
