import { Loc, syntaxError } from "../errors";
import { SPEC, TokenType } from "./tokens";

export interface Token {
  type: TokenType;
  value: string;
  loc: Loc;
  /** offsets into the source: source.slice(start, end) === value */
  start: number;
  end: number;
}

/**
 * Lazy tokenizer (a.k.a. lexer / scanner).
 *
 * It does NOT tokenize the whole file up front. The parser pulls one token at a
 * time with `next()`. That's what lets us stop at "bye pakhi" and ignore
 * whatever junk comes after it — same trick bhai-lang uses.
 */
export class Tokenizer {
  private cursor = 0;
  private line = 1;
  private col = 1;

  constructor(private readonly source: string) {}

  hasMore(): boolean {
    return this.cursor < this.source.length;
  }

  /** Current position (where the next token would start). */
  get loc(): Loc {
    return { line: this.line, col: this.col };
  }

  /** Returns the next meaningful token, or `null` at end of input. */
  next(): Token | null {
    outer: while (this.hasMore()) {
      for (const { regex, type } of SPEC) {
        regex.lastIndex = this.cursor;
        const match = regex.exec(this.source);
        if (!match) continue;

        const loc = this.loc;
        const start = this.cursor;
        this.advance(match[0]);

        if (type === null) continue outer; // whitespace / comment -> skip
        return { type, value: match[0], loc, start, end: this.cursor };
      }

      // nothing matched
      const ch = this.source[this.cursor];
      if (ch === '"' || ch === "'") {
        throw syntaxError(
          `String ta shuru korso kintu shesh koro nai pakhi! Closing ${ch} ta kothay?`,
          this.loc
        );
      }
      throw syntaxError(`Ki likhso pakhi?? Ei character "${ch}" to chini na.`, this.loc);
    }
    return null;
  }

  /** Skip one raw character (used while hunting for "hi pakhi" in junk text). */
  skipChar(): void {
    if (this.hasMore()) this.advance(this.source[this.cursor]);
  }

  /** Convenience for tools/tests: tokenize everything. */
  static tokenizeAll(source: string): Token[] {
    const tokenizer = new Tokenizer(source);
    const tokens: Token[] = [];
    for (let t = tokenizer.next(); t !== null; t = tokenizer.next()) tokens.push(t);
    return tokens;
  }

  private advance(text: string): void {
    for (const ch of text) {
      if (ch === "\n") {
        this.line++;
        this.col = 1;
      } else {
        this.col++;
      }
    }
    this.cursor += text.length;
  }
}
