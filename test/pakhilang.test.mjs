import { test } from "node:test";
import assert from "node:assert/strict";
import { runAndCollect, tokenize, parse, PakhiError } from "../dist/pakhilang.js";

/** Wrap code in hi/bye pakhi and return printed lines. Fails the test on error. */
function out(body) {
  const { output, error } = runAndCollect(`hi pakhi\n${body}\nbye pakhi`);
  if (error) throw error;
  return output;
}

/** Run code and return the PakhiError it raised. */
function err(code) {
  const { error } = runAndCollect(code);
  assert.ok(error instanceof PakhiError, "expected a PakhiError");
  return error;
}

// ------------------------------------------------------------------ tokenizer

test("tokenizer: multi-word keywords, any whitespace between words", () => {
  const types = tokenize("hi   pakhi\nnahole\tjodi pakhi nahole pakhi bye pakhi").map((t) => t.type);
  assert.deepEqual(types, ["hi pakhi", "nahole jodi pakhi", "nahole pakhi", "bye pakhi"]);
});

test("tokenizer: tracks line and column", () => {
  const [, num] = tokenize("hi pakhi\n  42");
  assert.deepEqual(num.loc, { line: 2, col: 3 });
});

test("tokenizer: comments are skipped", () => {
  assert.deepEqual(out(`// ignore\n/* also\nignore */ bolo pakhi 1;`), ["1"]);
});

// --------------------------------------------------------------------- program

test("program: text outside hi/bye pakhi is ignored, even weird characters", () => {
  const { output, error } = runAndCollect(`@#$ don't "hi pakhi" \n hi pakhi bolo pakhi "ok"; bye pakhi ¯\\_(ツ)_/¯`);
  assert.equal(error, null);
  assert.deepEqual(output, ["ok"]);
});

test("program: missing hi pakhi / bye pakhi", () => {
  assert.match(err(`bolo pakhi 1;`).message, /hi pakhi/);
  assert.match(err(`hi pakhi bolo pakhi 1;`).message, /bye pakhi/);
});

// ----------------------------------------------------------------- expressions

test("values print as sotti / mittha / khali", () => {
  assert.deepEqual(out(`bolo pakhi sotti, mittha, khali, 1.5, "s";`), ["sotti mittha khali 1.5 s"]);
});

test("operator precedence and parentheses", () => {
  assert.deepEqual(out(`bolo pakhi 1 + 2 * 3, (1 + 2) * 3, 10 - 4 - 3, 2 * 3 % 4;`), ["7 9 3 2"]);
});

test("unary minus and a-1 without spaces (bhai-lang bug)", () => {
  assert.deepEqual(out(`dhoro pakhi a = 5; bolo pakhi a-1, a -1, -a, --a, -(2+3);`), ["4 4 -5 5 -5"]);
});

test("comparison, equality and logical operators", () => {
  assert.deepEqual(out(`bolo pakhi 1 < 2, 2 <= 1, "a" < "b", 1 == 1, 1 != "1", !sotti, !0;`), [
    "sotti mittha sotti sotti sotti mittha sotti",
  ]);
  assert.deepEqual(out(`bolo pakhi khali || "default", 0 && x, 1 && 2;`), ["default 0 2"]);
});

test("string concatenation formats other values", () => {
  assert.deepEqual(out(`bolo pakhi "x=" + 1 + ", ok=" + sotti + ", n=" + khali;`), ["x=1, ok=sotti, n=khali"]);
});

test("string escapes", () => {
  assert.deepEqual(out(`bolo pakhi "a\\nb", 'it\\'s';`), ["a\nb it's"]);
});

test("assignment operators and chained assignment", () => {
  assert.deepEqual(out(`dhoro pakhi a = 10, b; a += 5; a -= 1; a *= 2; a /= 4; a %= 4; b = a = 9; bolo pakhi a, b;`), ["9 9"]);
});

// ------------------------------------------------------------------ statements

test("variables: block scope and shadowing", () => {
  assert.deepEqual(out(`dhoro pakhi a = 1; { dhoro pakhi a = 2; bolo pakhi a; } bolo pakhi a;`), ["2", "1"]);
  assert.deepEqual(out(`dhoro pakhi a = 1; { a = 2; } bolo pakhi a;`), ["2"]);
});

test("variable without initializer is khali", () => {
  assert.deepEqual(out(`dhoro pakhi a; bolo pakhi a;`), ["khali"]);
});

test("if / else-if / else chain", () => {
  const prog = (n) => out(`
    dhoro pakhi n = ${n};
    jodi pakhi (n < 10) bolo pakhi "small";
    nahole jodi pakhi (n < 100) { bolo pakhi "medium"; }
    nahole pakhi { bolo pakhi "large"; }`);
  assert.deepEqual(prog(5), ["small"]);
  assert.deepEqual(prog(50), ["medium"]);
  assert.deepEqual(prog(500), ["large"]);
});

test("while with break and continue (including from nested if)", () => {
  assert.deepEqual(
    out(`
      dhoro pakhi i = 0;
      jotokkhon pakhi (i < 10) {
        i += 1;
        jodi pakhi (i % 2 == 0) { porer ta pakhi; bolo pakhi "never"; }
        jodi pakhi (i > 7) { thamo pakhi; }
        bolo pakhi i;
      }
      bolo pakhi "done", i;`),
    ["1", "3", "5", "7", "done 9"]
  );
});

test("break only exits the innermost loop", () => {
  assert.deepEqual(
    out(`
      dhoro pakhi i = 0;
      jotokkhon pakhi (i < 3) {
        i += 1;
        dhoro pakhi j = 0;
        jotokkhon pakhi (sotti) { j += 1; jodi pakhi (j == 2) thamo pakhi; }
        bolo pakhi i, j;
      }`),
    ["1 2", "2 2", "3 2"]
  );
});

// ------------------------------------------------------------------- functions

test("functions, return, implicit khali", () => {
  assert.deepEqual(out(`kaj pakhi jog(a, b) { ferot dao pakhi a + b; } kaj pakhi noop() {} bolo pakhi jog(2, 3), noop();`), ["5 khali"]);
});

test("recursion", () => {
  assert.deepEqual(out(`kaj pakhi fact(n) { jodi pakhi (n <= 1) ferot dao pakhi 1; ferot dao pakhi n * fact(n - 1); } bolo pakhi fact(10);`), ["3628800"]);
});

test("deep but legal recursion doesn't blow the JS stack", () => {
  assert.deepEqual(out(`kaj pakhi down(n) { jodi pakhi (n == 0) ferot dao pakhi "tol"; ferot dao pakhi down(n - 1); } bolo pakhi down(490);`), ["tol"]);
});

test("closures capture their defining scope", () => {
  assert.deepEqual(
    out(`
      kaj pakhi counter() { dhoro pakhi c = 0; kaj pakhi inc() { c += 1; ferot dao pakhi c; } ferot dao pakhi inc; }
      dhoro pakhi a = counter(), b = counter();
      a(); a();
      bolo pakhi a(), b(), a;`),
    ["3 1 <kaj inc>"]
  );
});

test("return from inside a loop inside a function", () => {
  assert.deepEqual(out(`kaj pakhi first(n) { dhoro pakhi i = 0; jotokkhon pakhi (sotti) { i += 1; jodi pakhi (i * i > n) ferot dao pakhi i; } } bolo pakhi first(50);`), ["8"]);
});

// ---------------------------------------------------------------------- errors

test("syntax errors have locations", () => {
  const e = err(`hi pakhi\n  dhoro pakhi x = ;\nbye pakhi`);
  assert.equal(e.kind, "Syntax");
  assert.deepEqual(e.loc, { line: 2, col: 19 });
});

test("break / continue / return in the wrong place are syntax errors", () => {
  assert.equal(err(`hi pakhi thamo pakhi; bye pakhi`).kind, "Syntax");
  assert.equal(err(`hi pakhi porer ta pakhi; bye pakhi`).kind, "Syntax");
  assert.equal(err(`hi pakhi ferot dao pakhi 1; bye pakhi`).kind, "Syntax");
  // a loop outside a function doesn't make `thamo pakhi` legal inside it
  assert.equal(err(`hi pakhi jotokkhon pakhi (sotti) { kaj pakhi f() { thamo pakhi; } } bye pakhi`).kind, "Syntax");
});

test("else without if, invalid assignment target, unterminated string/block", () => {
  assert.match(err(`hi pakhi nahole pakhi {} bye pakhi`).message, /jodi pakhi/);
  assert.equal(err(`hi pakhi 1 = 2; bye pakhi`).kind, "Syntax");
  assert.match(err(`hi pakhi bolo pakhi "oops; bye pakhi`).message, /String/);
  assert.match(err(`hi pakhi { bolo pakhi 1; bye pakhi`).message, /bondho/);
});

test("runtime errors", () => {
  const cases = [
    [`bolo pakhi y;`, /chini na/],
    [`y = 1;`, /age dhoro nai/],
    [`dhoro pakhi a; dhoro pakhi a;`, /already/],
    [`bolo pakhi 1 / 0;`, /shunno/],
    [`bolo pakhi 1 % 0;`, /shunno/],
    [`bolo pakhi khali + 1;`, /Khali/],
    [`bolo pakhi sotti * 2;`, /mile na/],
    [`bolo pakhi -"x";`, /number/],
    [`dhoro pakhi a = 1; a();`, /call/],
    [`kaj pakhi f(a) {} f();`, /argument/],
    [`kaj pakhi f() { ferot dao pakhi f(); } f();`, /recursion/],
  ];
  for (const [body, pattern] of cases) {
    const e = err(`hi pakhi ${body} bye pakhi`);
    assert.equal(e.kind, "Runtime", body);
    assert.match(e.message, pattern, body);
    assert.ok(e.loc, `missing loc: ${body}`);
  }
});

test("infinite loop guard", () => {
  const { error } = runAndCollect(`hi pakhi jotokkhon pakhi (sotti) {} bye pakhi`, { maxLoopIterations: 1000 });
  assert.match(error.message, /1000/);
});

test("output printed before an error is kept", () => {
  const { output, error } = runAndCollect(`hi pakhi bolo pakhi "age"; bolo pakhi x; bye pakhi`);
  assert.deepEqual(output, ["age"]);
  assert.ok(error);
});

test("parse returns an AST", () => {
  const ast = parse(`hi pakhi bolo pakhi 1; bye pakhi`);
  assert.equal(ast.type, "Program");
  assert.equal(ast.body[0].type, "PrintStatement");
});

test("tokens carry source offsets", () => {
  const src = `hi pakhi bolo pakhi "x";`;
  for (const t of tokenize(src)) assert.equal(src.slice(t.start, t.end), t.value);
});
