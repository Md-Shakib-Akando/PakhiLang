import { PakhiError, Tokenizer, TokenTypes as T } from "@/lib/pakhilang";
import type { Token } from "@/lib/pakhilang";

export type SegmentKind =
  | "keyword"
  | "literal"
  | "number"
  | "string"
  | "identifier"
  | "function"
  | "operator"
  | "punctuation"
  | "comment"
  | "ignored"
  | "plain";

export interface Segment {
  text: string;
  kind: SegmentKind;
}

const OPERATORS = new Set<string>([
  T.ASSIGN, T.COMPLEX_ASSIGN, T.ADDITIVE, T.MULTIPLICATIVE,
  T.RELATIONAL, T.EQUALITY, T.AND, T.OR, T.NOT,
]);

function kindOf(token: Token, next: Token | undefined): SegmentKind {
  switch (token.type) {
    case T.TRUE:
    case T.FALSE:
    case T.NULL:
      return "literal";
    case T.NUMBER:
      return "number";
    case T.STRING:
      return "string";
    case T.IDENTIFIER:
      return next?.type === T.LPAREN ? "function" : "identifier";
  }
  if (OPERATORS.has(token.type)) return "operator";
  if (token.type.includes("pakhi")) return "keyword";
  return "punctuation";
}

/** Text between two tokens is whitespace and/or comments. */
function gapSegments(text: string, outside: boolean): Segment[] {
  if (outside) return text ? [{ text, kind: "ignored" }] : [];
  const segments: Segment[] = [];
  const commentRe = /\/\/[^\n]*|\/\*[\s\S]*?\*\//g;
  let last = 0;
  for (const m of text.matchAll(commentRe)) {
    if (m.index > last) segments.push({ text: text.slice(last, m.index), kind: "plain" });
    segments.push({ text: m[0], kind: "comment" });
    last = m.index + m[0].length;
  }
  if (last < text.length) segments.push({ text: text.slice(last), kind: "plain" });
  return segments;
}

/**
 * Splits PakhiLang source into colored segments, using PakhiLang's OWN tokenizer
 * (so the highlighting can never disagree with the language).
 * Never throws: characters the tokenizer doesn't understand become "plain".
 */
export function highlight(source: string): Segment[] {
  const tokenizer = new Tokenizer(source);
  const tokens: Token[] = [];

  while (tokenizer.hasMore()) {
    try {
      const token = tokenizer.next();
      if (token === null) break;
      tokens.push(token);
    } catch (err) {
      if (!(err instanceof PakhiError)) throw err;
      tokenizer.skipChar();
    }
  }

  const segments: Segment[] = [];
  let cursor = 0;
  let outside = true; // before "hi pakhi" / after "bye pakhi" everything is ignored

  tokens.forEach((token, i) => {
    const startsProgram = token.type === T.HI_PAKHI && outside;
    if (startsProgram) outside = false;

    segments.push(...gapSegments(source.slice(cursor, token.start), outside));
    segments.push({ text: token.value, kind: outside ? "ignored" : kindOf(token, tokens[i + 1]) });
    cursor = token.end;

    if (token.type === T.BYE_PAKHI && !outside) outside = true;
  });

  segments.push(...gapSegments(source.slice(cursor), outside));
  return segments;
}
