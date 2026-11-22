/** Source location: line and column are both 1-based. */
export interface Loc {
  line: number;
  col: number;
}

export type PakhiErrorKind = "Syntax" | "Runtime";

/**
 * Every error PakhiLang raises on purpose is a PakhiError.
 * It carries the location in the source, so we can show the user exactly
 * where things went wrong (bhai-lang doesn't track line numbers, so this is one
 * of the improvements).
 */
export class PakhiError extends Error {
  readonly kind: PakhiErrorKind;
  readonly loc?: Loc;

  constructor(kind: PakhiErrorKind, message: string, loc?: Loc) {
    super(message);
    this.kind = kind;
    this.loc = loc;
    this.name = kind === "Syntax" ? "PakhiSyntaxError" : "PakhiRuntimeError";
  }

  /** One-line summary: `PakhiSyntaxError (line 3, col 5): ...` */
  get summary(): string {
    const where = this.loc ? ` (line ${this.loc.line}, col ${this.loc.col})` : "";
    return `${this.name}${where}: ${this.message}`;
  }
}

export const syntaxError = (message: string, loc?: Loc) =>
  new PakhiError("Syntax", message, loc);

export const runtimeError = (message: string, loc?: Loc) =>
  new PakhiError("Runtime", message, loc);

/**
 * Builds a small "code frame" pointing at the error, like:
 *
 *   3 |     dhoro pakhi x = ;
 *     |                     ^
 */
export function codeFrame(source: string, loc: Loc): string {
  const lines = source.split(/\r?\n/);
  const line = lines[loc.line - 1];
  if (line === undefined) return "";
  const gutter = String(loc.line);
  const pad = " ".repeat(gutter.length);
  return (
    `${gutter} | ${line}\n` +
    `${pad} | ${" ".repeat(Math.max(0, loc.col - 1))}^`
  );
}
