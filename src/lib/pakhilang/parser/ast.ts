import { Loc } from "../errors";

/*
 * The AST (Abstract Syntax Tree) — the parser's output and the interpreter's input.
 * Each node type is its own interface with a literal `type` field, so TypeScript can
 * narrow on `switch (node.type)` (a "discriminated union").
 *
 * bhai-lang uses one big ASTNode type with lots of optional fields instead; the
 * union version catches more mistakes at compile time.
 */

// ------------------------------------------------------------------ expressions

export interface NumericLiteral { type: "NumericLiteral"; value: number; loc: Loc }
export interface StringLiteral { type: "StringLiteral"; value: string; loc: Loc }
export interface BooleanLiteral { type: "BooleanLiteral"; value: boolean; loc: Loc }
export interface NullLiteral { type: "NullLiteral"; loc: Loc }
export interface Identifier { type: "Identifier"; name: string; loc: Loc }

export interface AssignmentExpression {
  type: "AssignmentExpression";
  operator: "=" | "+=" | "-=" | "*=" | "/=" | "%=";
  target: Identifier;
  value: Expression;
  loc: Loc;
}

export interface BinaryExpression {
  type: "BinaryExpression";
  operator: "+" | "-" | "*" | "/" | "%" | "<" | ">" | "<=" | ">=" | "==" | "!=";
  left: Expression;
  right: Expression;
  loc: Loc;
}

/** `&&` and `||` are separate from BinaryExpression because they short-circuit. */
export interface LogicalExpression {
  type: "LogicalExpression";
  operator: "&&" | "||";
  left: Expression;
  right: Expression;
  loc: Loc;
}

export interface UnaryExpression {
  type: "UnaryExpression";
  operator: "-" | "!";
  argument: Expression;
  loc: Loc;
}

export interface CallExpression {
  type: "CallExpression";
  callee: Expression;
  args: Expression[];
  loc: Loc;
}

export type Expression =
  | NumericLiteral
  | StringLiteral
  | BooleanLiteral
  | NullLiteral
  | Identifier
  | AssignmentExpression
  | BinaryExpression
  | LogicalExpression
  | UnaryExpression
  | CallExpression;

// ------------------------------------------------------------------ statements

export interface Program { type: "Program"; body: Statement[]; loc: Loc }
export interface BlockStatement { type: "BlockStatement"; body: Statement[]; loc: Loc }
export interface EmptyStatement { type: "EmptyStatement"; loc: Loc }
export interface ExpressionStatement { type: "ExpressionStatement"; expression: Expression; loc: Loc }

/** bolo pakhi a, b, c; */
export interface PrintStatement { type: "PrintStatement"; expressions: Expression[]; loc: Loc }

/** dhoro pakhi a = 1, b; */
export interface VariableDeclaration { id: Identifier; init: Expression | null }
export interface VariableStatement { type: "VariableStatement"; declarations: VariableDeclaration[]; loc: Loc }

/**
 * jodi pakhi (...) {...} nahole jodi pakhi (...) {...} nahole pakhi {...}
 *
 * An else-if chain is represented as nested IfStatements in `alternate`
 * (like JavaScript's ESTree). bhai-lang uses a flat `alternates` array instead.
 */
export interface IfStatement {
  type: "IfStatement";
  test: Expression;
  consequent: Statement;
  alternate: Statement | null;
  loc: Loc;
}

/** jotokkhon pakhi (...) {...} */
export interface WhileStatement { type: "WhileStatement"; test: Expression; body: Statement; loc: Loc }
/** thamo pakhi; */
export interface BreakStatement { type: "BreakStatement"; loc: Loc }
/** porer ta pakhi; */
export interface ContinueStatement { type: "ContinueStatement"; loc: Loc }

/** kaj pakhi naam(a, b) {...} */
export interface FunctionDeclaration {
  type: "FunctionDeclaration";
  name: Identifier;
  params: Identifier[];
  body: BlockStatement;
  loc: Loc;
}

/** ferot dao pakhi x; */
export interface ReturnStatement { type: "ReturnStatement"; argument: Expression | null; loc: Loc }

export type Statement =
  | BlockStatement
  | EmptyStatement
  | ExpressionStatement
  | PrintStatement
  | VariableStatement
  | IfStatement
  | WhileStatement
  | BreakStatement
  | ContinueStatement
  | FunctionDeclaration
  | ReturnStatement;

export type Node = Program | Statement | Expression;
