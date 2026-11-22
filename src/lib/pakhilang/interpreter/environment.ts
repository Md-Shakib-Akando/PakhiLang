import { Loc, runtimeError } from "../errors";
import { Value } from "./values";

/**
 * A scope. Each `{ ... }` block and each function call gets a new Environment
 * whose `parent` is the enclosing one — a chain of scopes. Looking up a name walks
 * up the chain until it's found (this is bhai-lang's `Scope` class).
 */
export class Environment {
  private readonly variables = new Map<string, Value>();

  constructor(readonly parent: Environment | null) {}

  /** `dhoro pakhi x = ...` — create a NEW variable in THIS scope. */
  declare(name: string, value: Value, loc?: Loc): void {
    if (this.variables.has(name)) {
      throw runtimeError(`Pakhi, "${name}" to already dhora ache! Notun naam dao.`, loc);
    }
    this.variables.set(name, value);
  }

  /** `x = ...` — update an EXISTING variable, wherever it lives in the chain. */
  assign(name: string, value: Value, loc?: Loc): void {
    const env = this.resolve(name);
    if (!env) {
      throw runtimeError(
        `Pakhi, "${name}" ke to age dhoro nai! Age "dhoro pakhi ${name};" likho, tarpor value dao.`,
        loc
      );
    }
    env.variables.set(name, value);
  }

  lookup(name: string, loc?: Loc): Value {
    const env = this.resolve(name);
    if (!env) {
      throw runtimeError(`Pakhi, "${name}" ke to chini na! Age "dhoro pakhi" diye dhoro.`, loc);
    }
    return env.variables.get(name)!;
  }

  private resolve(name: string): Environment | null {
    for (let env: Environment | null = this; env !== null; env = env.parent) {
      if (env.variables.has(name)) return env;
    }
    return null;
  }
}
