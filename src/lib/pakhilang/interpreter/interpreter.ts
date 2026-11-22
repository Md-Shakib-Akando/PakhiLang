import { Loc, runtimeError } from "../errors";
import * as AST from "../parser/ast";
import { Environment } from "./environment";
import { PakhiFunction, Value, formatValue, isTruthy, typeName } from "./values";

export interface InterpreterOptions {
  /** Where `bolo pakhi` output goes. Default: console.log */
  print?: (line: string) => void;
  /** Safety net against infinite loops (per loop). Default: 100000 */
  maxLoopIterations?: number;
  /** Safety net against infinite recursion. Default: 500 */
  maxCallDepth?: number;
}

/*
 * Control flow signals.
 *
 * `thamo pakhi`, `porer ta pakhi` and `ferot dao pakhi` need to jump out of
 * several nested exec() calls at once. Throwing a (non-error) object does exactly
 * that: the nearest loop / function call catches it.
 *
 * bhai-lang does this with boolean flags on the Scope (isBreakStatement, ...)
 * that every block has to check and copy to its parent — more code, easier to get wrong.
 */
class BreakSignal {}
class ContinueSignal {}
class ReturnSignal {
  constructor(readonly value: Value) {}
}
const BREAK = new BreakSignal();
const CONTINUE = new ContinueSignal();

/**
 * Tree-walking interpreter: walks the AST and executes each node directly.
 * `exec` handles statements (they DO something), `evaluate` handles
 * expressions (they PRODUCE a value).
 *
 * bhai-lang puts each node type in its own Visitor class; here each node type
 * is one `case` of a switch — same idea, less files.
 */
export class Interpreter {
  private readonly print: (line: string) => void;
  private readonly maxLoopIterations: number;
  private readonly maxCallDepth: number;
  private callDepth = 0;

  constructor(options: InterpreterOptions = {}) {
    this.print = options.print ?? ((line) => console.log(line));
    this.maxLoopIterations = options.maxLoopIterations ?? 100_000;
    this.maxCallDepth = options.maxCallDepth ?? 500;
  }

  run(program: AST.Program): void {
    const globals = new Environment(null);
    this.callDepth = 0;
    for (const statement of program.body) this.exec(statement, globals);
  }

  // ================================================================ statements

  private exec(node: AST.Statement, env: Environment): void {
    switch (node.type) {
      case "EmptyStatement":
        return;

      case "ExpressionStatement":
        this.evaluate(node.expression, env);
        return;

      case "PrintStatement": {
        const parts = node.expressions.map((e) => formatValue(this.evaluate(e, env)));
        this.print(parts.join(" "));
        return;
      }

      case "VariableStatement":
        for (const { id, init } of node.declarations) {
          env.declare(id.name, init ? this.evaluate(init, env) : null, id.loc);
        }
        return;

      case "BlockStatement":
        this.execBlock(node.body, new Environment(env));
        return;

      case "IfStatement":
        if (isTruthy(this.evaluate(node.test, env))) {
          this.exec(node.consequent, env);
        } else if (node.alternate) {
          this.exec(node.alternate, env); // an else-if is just another IfStatement
        }
        return;

      case "WhileStatement": {
        let iterations = 0;
        while (isTruthy(this.evaluate(node.test, env))) {
          if (++iterations > this.maxLoopIterations) {
            throw runtimeError(
              `Pakhi, loop to ar thame na! ${this.maxLoopIterations} bar ghure felsi, ebar thamo.`,
              node.loc
            );
          }
          try {
            this.exec(node.body, env);
          } catch (signal) {
            if (signal === BREAK) break;
            if (signal === CONTINUE) continue;
            throw signal;
          }
        }
        return;
      }

      case "BreakStatement":
        throw BREAK;

      case "ContinueStatement":
        throw CONTINUE;

      case "FunctionDeclaration":
        env.declare(node.name.name, new PakhiFunction(node, env), node.name.loc);
        return;

      case "ReturnStatement":
        throw new ReturnSignal(node.argument ? this.evaluate(node.argument, env) : null);
    }
  }

  private execBlock(statements: AST.Statement[], env: Environment): void {
    for (const statement of statements) this.exec(statement, env);
  }

  // =============================================================== expressions

  private evaluate(node: AST.Expression, env: Environment): Value {
    switch (node.type) {
      case "NumericLiteral":
      case "StringLiteral":
      case "BooleanLiteral":
        return node.value;

      case "NullLiteral":
        return null;

      case "Identifier":
        return env.lookup(node.name, node.loc);

      case "AssignmentExpression": {
        const name = node.target.name;
        let value = this.evaluate(node.value, env);
        if (node.operator !== "=") {
          const current = env.lookup(name, node.target.loc);
          const op = node.operator.slice(0, -1) as AST.BinaryExpression["operator"]; // "+=" -> "+"
          value = this.binaryOperation(op, current, value, node.loc);
        }
        env.assign(name, value, node.target.loc);
        return value;
      }

      case "LogicalExpression": {
        // short-circuit: in `a || b`, b is never evaluated if a is truthy
        const left = this.evaluate(node.left, env);
        if (node.operator === "||") return isTruthy(left) ? left : this.evaluate(node.right, env);
        return isTruthy(left) ? this.evaluate(node.right, env) : left;
      }

      case "BinaryExpression":
        return this.binaryOperation(
          node.operator,
          this.evaluate(node.left, env),
          this.evaluate(node.right, env),
          node.loc
        );

      case "UnaryExpression": {
        const value = this.evaluate(node.argument, env);
        if (node.operator === "!") return !isTruthy(value);
        if (typeof value !== "number") {
          throw runtimeError(`Pakhi, "-" shudhu number er sathe cholbe, ${typeName(value)} er sathe na.`, node.loc);
        }
        return -value;
      }

      case "CallExpression":
        return this.callFunction(node, env);
    }
  }

  private binaryOperation(
    operator: AST.BinaryExpression["operator"],
    left: Value,
    right: Value,
    loc: Loc
  ): Value {
    // equality works for every type
    if (operator === "==") return left === right;
    if (operator === "!=") return left !== right;

    // "+" with at least one string => concatenation ("x = " + khali works)
    if (operator === "+" && (typeof left === "string" || typeof right === "string")) {
      return formatValue(left) + formatValue(right);
    }

    if (left === null || right === null) {
      throw runtimeError(`Khali jinish diye "${operator}" kora jay na pakhi!`, loc);
    }

    if (typeof left === "number" && typeof right === "number") {
      switch (operator) {
        case "+": return left + right;
        case "-": return left - right;
        case "*": return left * right;
        case "/":
        case "%":
          if (right === 0) throw runtimeError(`Pakhi, shunno (0) diye vag kora jay na!`, loc);
          return operator === "/" ? left / right : left % right;
        case "<": return left < right;
        case ">": return left > right;
        case "<=": return left <= right;
        case ">=": return left >= right;
      }
    }

    if (typeof left === "string" && typeof right === "string") {
      switch (operator) {
        case "<": return left < right;
        case ">": return left > right;
        case "<=": return left <= right;
        case ">=": return left >= right;
      }
    }

    throw runtimeError(
      `Ki korso pakhi?? "${typeName(left)}" ar "${typeName(right)}" er moddhe "${operator}" mile na.`,
      loc
    );
  }

  private callFunction(node: AST.CallExpression, env: Environment): Value {
    const callee = this.evaluate(node.callee, env);
    if (!(callee instanceof PakhiFunction)) {
      throw runtimeError(`Pakhi, ${typeName(callee)} ke to call kora jay na — eta kono "kaj" na.`, node.loc);
    }

    const args = node.args.map((arg) => this.evaluate(arg, env));
    if (args.length !== callee.arity) {
      throw runtimeError(
        `Pakhi, "${callee.name}" ${callee.arity} ta argument chay, kintu tumi dila ${args.length} ta.`,
        node.loc
      );
    }

    if (this.callDepth >= this.maxCallDepth) {
      throw runtimeError(
        `Pakhi, "${callee.name}" nijeke ${this.maxCallDepth} bar dakse, ar parina! (infinite recursion?)`,
        node.loc
      );
    }

    // New scope whose parent is the scope where the function was DEFINED
    // (not where it's called). That's what makes closures work.
    const scope = new Environment(callee.closure);
    callee.declaration.params.forEach((param, i) => scope.declare(param.name, args[i], param.loc));

    this.callDepth++;
    try {
      this.execBlock(callee.declaration.body.body, scope);
      return null; // no `ferot dao pakhi` => khali
    } catch (signal) {
      if (signal instanceof ReturnSignal) return signal.value;
      throw signal;
    } finally {
      this.callDepth--;
    }
  }
}
