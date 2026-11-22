/*
 * PakhiLang public API.
 *
 *   source code ──► Tokenizer ──► Parser ──► AST ──► Interpreter ──► output
 */
import { PakhiError } from "./errors";
import { Interpreter, InterpreterOptions } from "./interpreter/interpreter";
import { Tokenizer } from "./lexer/tokenizer";
import { parse } from "./parser/parser";

export { PakhiError, codeFrame } from "./errors";
export type { Loc } from "./errors";
export { Tokenizer } from "./lexer/tokenizer";
export type { Token } from "./lexer/tokenizer";
export { T as TokenTypes } from "./lexer/tokens";
export { Parser, parse } from "./parser/parser";
export type * as AST from "./parser/ast";
export { Interpreter } from "./interpreter/interpreter";
export type { InterpreterOptions } from "./interpreter/interpreter";
export { formatValue } from "./interpreter/values";

export const VERSION = "0.1.0";

/** Parse + run. Throws PakhiError on syntax/runtime errors. */
export function run(source: string, options: InterpreterOptions = {}): void {
  new Interpreter(options).run(parse(source));
}

export interface RunResult {
  output: string[];
  error: PakhiError | null;
}

/** Parse + run, collecting printed lines instead of printing (handy for playgrounds & tests). */
export function runAndCollect(
  source: string,
  options: Omit<InterpreterOptions, "print"> = {}
): RunResult {
  const output: string[] = [];
  try {
    run(source, { ...options, print: (line) => output.push(line) });
    return { output, error: null };
  } catch (err) {
    if (err instanceof PakhiError) return { output, error: err };
    throw err;
  }
}

/** Tokenize the whole source (for learning/debugging). */
export function tokenize(source: string) {
  return Tokenizer.tokenizeAll(source);
}
