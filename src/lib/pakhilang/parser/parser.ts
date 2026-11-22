import { PakhiError, syntaxError } from "../errors";
import { Token, Tokenizer } from "../lexer/tokenizer";
import { T, TokenType } from "../lexer/tokens";
import * as AST from "./ast";

/*
 * Recursive descent parser.
 *
 * Grammar (EBNF-ish). Each rule below is one method in this class.
 * Rules lower in the expression list bind TIGHTER (higher precedence).
 *
 *   Program        := <junk> "hi pakhi" Statement* "bye pakhi" <junk>
 *
 *   Statement      := PrintStmt | VarStmt | IfStmt | WhileStmt | BreakStmt
 *                   | ContinueStmt | FunctionDecl | ReturnStmt | Block
 *                   | ";" | ExpressionStmt
 *   PrintStmt      := "bolo pakhi" Expression ("," Expression)* ";"?
 *   VarStmt        := "dhoro pakhi" Declaration ("," Declaration)* ";"?
 *   Declaration    := IDENT ("=" Expression)?
 *   IfStmt         := "jodi pakhi" "(" Expression ")" Statement
 *                     ( "nahole jodi pakhi" "(" Expression ")" Statement )*
 *                     ( "nahole pakhi" Statement )?
 *   WhileStmt      := "jotokkhon pakhi" "(" Expression ")" Statement
 *   BreakStmt      := "thamo pakhi" ";"?
 *   ContinueStmt   := "porer ta pakhi" ";"?
 *   FunctionDecl   := "kaj pakhi" IDENT "(" (IDENT ("," IDENT)*)? ")" Block
 *   ReturnStmt     := "ferot dao pakhi" Expression? ";"?
 *   Block          := "{" Statement* "}"
 *   ExpressionStmt := Expression ";"?
 *
 *   Expression     := Assignment
 *   Assignment     := LogicalOr ( ("=" | "+=" | "-=" | "*=" | "/=" | "%=") Assignment )?   (right assoc)
 *   LogicalOr      := LogicalAnd ( "||" LogicalAnd )*
 *   LogicalAnd     := Equality ( "&&" Equality )*
 *   Equality       := Relational ( ("==" | "!=") Relational )*
 *   Relational     := Additive ( ("<" | ">" | "<=" | ">=") Additive )*
 *   Additive       := Multiplicative ( ("+" | "-") Multiplicative )*
 *   Multiplicative := Unary ( ("*" | "/" | "%") Unary )*
 *   Unary          := ("-" | "!") Unary | Call
 *   Call           := Primary ( "(" (Expression ("," Expression)*)? ")" )*
 *   Primary        := NUMBER | STRING | "sotti" | "mittha" | "khali" | IDENT | "(" Expression ")"
 *
 * The parser looks at ONE token ahead (`lookahead`) to decide which rule to use:
 * that makes it an LL(1) parser.
 */
export class Parser {
  private tokenizer!: Tokenizer;
  private lookahead: Token | null = null;

  // Used to report `thamo pakhi` outside a loop / `ferot dao pakhi` outside a
  // function at PARSE time (bhai-lang only notices at runtime).
  private loopDepth = 0;
  private functionDepth = 0;

  parse(source: string): AST.Program {
    this.tokenizer = new Tokenizer(source);
    this.loopDepth = 0;
    this.functionDepth = 0;

    const hi = this.skipToProgramStart();
    this.lookahead = this.tokenizer.next();

    const body: AST.Statement[] = [];
    while (this.lookahead !== null && this.lookahead.type !== T.BYE_PAKHI) {
      body.push(this.statement());
    }

    if (this.lookahead === null) {
      throw syntaxError(
        `"bye pakhi" bolte bhule gecho! Pakhi ke bidaay na janiye program shesh kora jay na.`,
        this.tokenizer.loc
      );
    }
    // NOTE: we deliberately do NOT advance past "bye pakhi" — everything after it is ignored.

    return { type: "Program", body, loc: hi.loc };
  }

  /** Everything before "hi pakhi" is ignored, even text the tokenizer doesn't understand. */
  private skipToProgramStart(): Token {
    for (;;) {
      let token: Token | null;
      try {
        token = this.tokenizer.next();
      } catch (err) {
        if (err instanceof PakhiError) {
          this.tokenizer.skipChar();
          continue;
        }
        throw err;
      }
      if (token === null) {
        throw syntaxError(
          `"hi pakhi" kothay? Pakhi ke hi na bolle program shuru-i hobe na!`,
          { line: 1, col: 1 }
        );
      }
      if (token.type === T.HI_PAKHI) return token;
    }
  }

  // ================================================================ statements

  private statement(): AST.Statement {
    const token = this.lookahead!;
    switch (token.type) {
      case T.BOLO_PAKHI:
        return this.printStatement();
      case T.DHORO_PAKHI:
        return this.variableStatement();
      case T.JODI_PAKHI:
        return this.ifStatement(T.JODI_PAKHI);
      case T.JOTOKKHON_PAKHI:
        return this.whileStatement();
      case T.THAMO_PAKHI:
        return this.breakStatement();
      case T.PORER_TA_PAKHI:
        return this.continueStatement();
      case T.KAJ_PAKHI:
        return this.functionDeclaration();
      case T.FEROT_DAO_PAKHI:
        return this.returnStatement();
      case T.LBRACE:
        return this.blockStatement();
      case T.SEMICOLON:
        this.eat(T.SEMICOLON);
        return { type: "EmptyStatement", loc: token.loc };
      case T.NAHOLE_PAKHI:
      case T.NAHOLE_JODI_PAKHI:
        throw syntaxError(`"${token.value}" er age to "jodi pakhi" lagbe, pakhi!`, token.loc);
      case T.HI_PAKHI:
        throw syntaxError(`Ekbar to "hi pakhi" bolsoi, barbar hi bolle pakhi birokto hobe.`, token.loc);
      default:
        return this.expressionStatement();
    }
  }

  private printStatement(): AST.PrintStatement {
    const kw = this.eat(T.BOLO_PAKHI);
    const expressions = [this.expression()];
    while (this.peek() === T.COMMA) {
      this.eat(T.COMMA);
      expressions.push(this.expression());
    }
    this.optionalSemicolon();
    return { type: "PrintStatement", expressions, loc: kw.loc };
  }

  private variableStatement(): AST.VariableStatement {
    const kw = this.eat(T.DHORO_PAKHI);
    const declarations: AST.VariableDeclaration[] = [];
    do {
      if (declarations.length > 0) this.eat(T.COMMA);
      const id = this.identifier();
      let init: AST.Expression | null = null;
      if (this.peek() === T.ASSIGN) {
        this.eat(T.ASSIGN);
        init = this.expression();
      }
      declarations.push({ id, init });
    } while (this.peek() === T.COMMA);
    this.optionalSemicolon();
    return { type: "VariableStatement", declarations, loc: kw.loc };
  }

  private ifStatement(keyword: typeof T.JODI_PAKHI | typeof T.NAHOLE_JODI_PAKHI): AST.IfStatement {
    const kw = this.eat(keyword);
    const test = this.parenthesizedCondition();
    const consequent = this.statement();

    let alternate: AST.Statement | null = null;
    if (this.peek() === T.NAHOLE_JODI_PAKHI) {
      alternate = this.ifStatement(T.NAHOLE_JODI_PAKHI); // else-if => nested if
    } else if (this.peek() === T.NAHOLE_PAKHI) {
      this.eat(T.NAHOLE_PAKHI);
      alternate = this.statement();
    }
    return { type: "IfStatement", test, consequent, alternate, loc: kw.loc };
  }

  private whileStatement(): AST.WhileStatement {
    const kw = this.eat(T.JOTOKKHON_PAKHI);
    const test = this.parenthesizedCondition();
    this.loopDepth++;
    const body = this.statement();
    this.loopDepth--;
    return { type: "WhileStatement", test, body, loc: kw.loc };
  }

  private breakStatement(): AST.BreakStatement {
    const kw = this.eat(T.THAMO_PAKHI);
    if (this.loopDepth === 0) {
      throw syntaxError(`"thamo pakhi"?? Loop-i to nai, thambo ki?`, kw.loc);
    }
    this.optionalSemicolon();
    return { type: "BreakStatement", loc: kw.loc };
  }

  private continueStatement(): AST.ContinueStatement {
    const kw = this.eat(T.PORER_TA_PAKHI);
    if (this.loopDepth === 0) {
      throw syntaxError(`"porer ta pakhi"?? Loop-i to nai, porer ta ashbe kotha theke?`, kw.loc);
    }
    this.optionalSemicolon();
    return { type: "ContinueStatement", loc: kw.loc };
  }

  private functionDeclaration(): AST.FunctionDeclaration {
    const kw = this.eat(T.KAJ_PAKHI);
    const name = this.identifier();

    this.eat(T.LPAREN);
    const params: AST.Identifier[] = [];
    if (this.peek() !== T.RPAREN) {
      do {
        if (params.length > 0) this.eat(T.COMMA);
        const param = this.identifier();
        if (params.some((p) => p.name === param.name)) {
          throw syntaxError(`Pakhi, "${param.name}" naam e duita parameter rakha jay na.`, param.loc);
        }
        params.push(param);
      } while (this.peek() === T.COMMA);
    }
    this.eat(T.RPAREN);

    // A loop OUTSIDE the function doesn't count inside it:
    //   jotokkhon pakhi (...) { kaj pakhi f() { thamo pakhi; } }   <- invalid
    const savedLoopDepth = this.loopDepth;
    this.loopDepth = 0;
    this.functionDepth++;
    const body = this.blockStatement();
    this.functionDepth--;
    this.loopDepth = savedLoopDepth;

    return { type: "FunctionDeclaration", name, params, body, loc: kw.loc };
  }

  private returnStatement(): AST.ReturnStatement {
    const kw = this.eat(T.FEROT_DAO_PAKHI);
    if (this.functionDepth === 0) {
      throw syntaxError(`"ferot dao pakhi" shudhu "kaj pakhi" er vitore cholbe.`, kw.loc);
    }
    const next = this.peek();
    const argument =
      next === undefined || next === T.SEMICOLON || next === T.RBRACE ? null : this.expression();
    this.optionalSemicolon();
    return { type: "ReturnStatement", argument, loc: kw.loc };
  }

  private blockStatement(): AST.BlockStatement {
    const open = this.eat(T.LBRACE);
    const body: AST.Statement[] = [];
    while (this.lookahead !== null && this.lookahead.type !== T.RBRACE) {
      if (this.lookahead.type === T.BYE_PAKHI) {
        throw syntaxError(
          `"{" khulso (line ${open.loc.line}) kintu "}" bondho na korei "bye pakhi"?`,
          this.lookahead.loc
        );
      }
      body.push(this.statement());
    }
    this.eat(T.RBRACE);
    return { type: "BlockStatement", body, loc: open.loc };
  }

  private expressionStatement(): AST.ExpressionStatement {
    const expression = this.expression();
    this.optionalSemicolon();
    return { type: "ExpressionStatement", expression, loc: expression.loc };
  }

  // =============================================================== expressions

  private expression(): AST.Expression {
    return this.assignment();
  }

  private assignment(): AST.Expression {
    const left = this.logicalOr();

    const type = this.peek();
    if (type !== T.ASSIGN && type !== T.COMPLEX_ASSIGN) return left;

    const op = this.eat(type);
    if (left.type !== "Identifier") {
      throw syntaxError(`Pakhi, "${op.value}" er bam pashe ekta variable er naam lagbe.`, op.loc);
    }
    return {
      type: "AssignmentExpression",
      operator: op.value as AST.AssignmentExpression["operator"],
      target: left,
      value: this.assignment(), // right recursion => a = b = 5 works (right associative)
      loc: op.loc,
    };
  }

  /**
   * Generic helper for left-associative binary operators:
   *   left (op right)*   =>   ((left op right) op right) ...
   */
  private binary<K extends "BinaryExpression" | "LogicalExpression">(
    kind: K,
    operatorType: TokenType,
    next: () => AST.Expression
  ): AST.Expression {
    let left = next();
    while (this.peek() === operatorType) {
      const op = this.eat(operatorType);
      const right = next();
      left = { type: kind, operator: op.value, left, right, loc: op.loc } as AST.Expression;
    }
    return left;
  }

  private logicalOr = (): AST.Expression => this.binary("LogicalExpression", T.OR, this.logicalAnd);
  private logicalAnd = (): AST.Expression => this.binary("LogicalExpression", T.AND, this.equality);
  private equality = (): AST.Expression => this.binary("BinaryExpression", T.EQUALITY, this.relational);
  private relational = (): AST.Expression => this.binary("BinaryExpression", T.RELATIONAL, this.additive);
  private additive = (): AST.Expression => this.binary("BinaryExpression", T.ADDITIVE, this.multiplicative);
  private multiplicative = (): AST.Expression => this.binary("BinaryExpression", T.MULTIPLICATIVE, this.unary);

  private unary = (): AST.Expression => {
    const token = this.lookahead;
    if (token && (token.type === T.NOT || (token.type === T.ADDITIVE && token.value === "-"))) {
      this.eat(token.type);
      return {
        type: "UnaryExpression",
        operator: token.value as "-" | "!",
        argument: this.unary(),
        loc: token.loc,
      };
    }
    return this.call();
  };

  private call(): AST.Expression {
    let expr = this.primary();
    while (this.peek() === T.LPAREN) {
      const open = this.eat(T.LPAREN);
      const args: AST.Expression[] = [];
      if (this.peek() !== T.RPAREN) {
        do {
          if (args.length > 0) this.eat(T.COMMA);
          args.push(this.expression());
        } while (this.peek() === T.COMMA);
      }
      this.eat(T.RPAREN);
      expr = { type: "CallExpression", callee: expr, args, loc: open.loc };
    }
    return expr;
  }

  private primary(): AST.Expression {
    const token = this.lookahead;
    if (token === null) {
      throw syntaxError(`Hothat shesh hoye gelo pakhi! Ekta value asha korsilam.`, this.tokenizer.loc);
    }

    switch (token.type) {
      case T.NUMBER:
        this.eat(T.NUMBER);
        return { type: "NumericLiteral", value: Number(token.value), loc: token.loc };
      case T.STRING:
        this.eat(T.STRING);
        return { type: "StringLiteral", value: unescapeString(token.value), loc: token.loc };
      case T.TRUE:
      case T.FALSE:
        this.eat(token.type);
        return { type: "BooleanLiteral", value: token.type === T.TRUE, loc: token.loc };
      case T.NULL:
        this.eat(T.NULL);
        return { type: "NullLiteral", loc: token.loc };
      case T.IDENTIFIER:
        return this.identifier();
      case T.LPAREN: {
        this.eat(T.LPAREN);
        const expr = this.expression();
        this.eat(T.RPAREN);
        return expr; // parentheses only affect tree shape; no node needed
      }
      default:
        throw syntaxError(`Ki likhso pakhi?? "${token.value}" diye to kono value shuru hoy na.`, token.loc);
    }
  }

  private identifier(): AST.Identifier {
    const token = this.eat(T.IDENTIFIER);
    return { type: "Identifier", name: token.value, loc: token.loc };
  }

  // ==================================================================== helpers

  private parenthesizedCondition(): AST.Expression {
    this.eat(T.LPAREN);
    const test = this.expression();
    this.eat(T.RPAREN);
    return test;
  }

  private optionalSemicolon(): void {
    if (this.peek() === T.SEMICOLON) this.eat(T.SEMICOLON);
  }

  /** Type of the lookahead token (undefined at end of input). */
  private peek(): TokenType | undefined {
    return this.lookahead?.type;
  }

  /**
   * Consume the lookahead token if it has the expected type and move forward.
   * This is bhai-lang's `TokenExecutor.eatTokenAndForwardLookahead`.
   */
  private eat(type: TokenType): Token {
    const token = this.lookahead;
    if (token === null) {
      throw syntaxError(
        `Hothat shesh hoye gelo pakhi! ${describe(type)} asha korsilam.`,
        this.tokenizer.loc
      );
    }
    if (token.type !== type) {
      throw syntaxError(
        `Ki likhso pakhi?? "${token.value}" paisi, kintu ${describe(type)} asha korsilam.`,
        token.loc
      );
    }
    this.lookahead = this.tokenizer.next();
    return token;
  }
}

function describe(type: TokenType): string {
  switch (type) {
    case T.IDENTIFIER: return "ekta naam (identifier)";
    case T.NUMBER: return "ekta number";
    case T.STRING: return "ekta string";
    case T.ASSIGN: return `"="`;
    default: return `"${type}"`;
  }
}

const ESCAPES: Record<string, string> = { n: "\n", t: "\t", r: "\r", "0": "\0" };

/** `"hi\npakhi"` (with quotes, raw escapes) -> real string value */
function unescapeString(raw: string): string {
  return raw.slice(1, -1).replace(/\\(.)/g, (_, ch: string) => ESCAPES[ch] ?? ch);
}

export function parse(source: string): AST.Program {
  return new Parser().parse(source);
}
