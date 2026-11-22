import { FunctionDeclaration } from "../parser/ast";
import type { Environment } from "./environment";

/** A user-defined function: the declaration + the scope it was created in (a closure). */
export class PakhiFunction {
  constructor(
    readonly declaration: FunctionDeclaration,
    readonly closure: Environment
  ) {}

  get name(): string {
    return this.declaration.name.name;
  }

  get arity(): number {
    return this.declaration.params.length;
  }
}

/** All runtime values in PakhiLang. */
export type Value = number | string | boolean | null | PakhiFunction;

/** How a value looks when printed with `bolo pakhi`. */
export function formatValue(value: Value): string {
  if (value === null) return "khali";
  if (value === true) return "sotti";
  if (value === false) return "mittha";
  if (value instanceof PakhiFunction) return `<kaj ${value.name}>`;
  return String(value);
}

/** Name of a value's type, for error messages. */
export function typeName(value: Value): string {
  if (value === null) return "khali";
  if (typeof value === "boolean") return "sotti/mittha";
  if (typeof value === "number") return "number";
  if (typeof value === "string") return "string";
  return "kaj";
}

/**
 * Truthiness: `khali`, `mittha`, `0` and `""` are false, everything else is true.
 * (bhai-lang only accepts a strict `sahi` in conditions.)
 */
export function isTruthy(value: Value): boolean {
  return value !== null && value !== false && value !== 0 && value !== "";
}
