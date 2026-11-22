# PakhiLang kivabe kaj kore (bhai-lang deep dive shoho)

Ei guide e duita jinish ache:
1. **bhai-lang** er bhitore ki ache, ekdom code level e.
2. Same idea diye **PakhiLang** kivabe banano, ar kothay kothay amra improve korsi.

Shesh e kichu **exercise** ache. Ogula korle tumi nijer language e notun feature add korte parba.

---

## 0. Big picture: ekta language er 3 ta stage

```
 source code (string)
      │
      ▼
 ┌───────────┐   "hi pakhi bolo pakhi 1 + 2; bye pakhi"
 │ Tokenizer │
 └───────────┘
      │  tokens: [hi pakhi] [bolo pakhi] [NUMBER 1] [ADDITIVE +] [NUMBER 2] [;] [bye pakhi]
      ▼
 ┌───────────┐
 │  Parser   │   grammar rule mene token gula ke tree banay
 └───────────┘
      │  AST:  Program → PrintStatement → BinaryExpression(+, 1, 2)
      ▼
 ┌─────────────┐
 │ Interpreter │  tree ta walk kore, protita node "execute" kore
 └─────────────┘
      │
      ▼
   output: 3
```

Nije chokhe dekho:

```bash
npm run build:lib                                # prothome ekbar CLI build koro
node dist/cli.js --tokens examples/hello.pakhi   # stage 1 er output
node dist/cli.js --ast    examples/hello.pakhi   # stage 2 er output
node dist/cli.js          examples/hello.pakhi   # stage 3
```

Website er playground e (`npm run dev` → http://localhost:3000) **Tokens** ar **AST** tab-o ache.

bhai-lang ar PakhiLang duitai **tree-walking interpreter**. Mane: kono machine code ba bytecode banano hoy na, AST ta-i shorashori chalano hoy. Eta shobcheye simple approach, shikhar jonno best.

---

## 1. bhai-lang er structure

bhai-lang ekta **monorepo** (Turborepo + npm workspaces):

```
packages/
  parser/        → "bhai-lang-parser": tokenizer + parser (source → AST)
  interpreter/   → "bhai-lang-interpreter": AST chalay
  cli/           → "bhailang" command (file pore interpreter e dey)
apps/
  docs/          → Next.js website + playground (bhailang.js.org)
```

Parser ar interpreter alada package. Tai interpreter browser eo chole (website er playground ota-i use kore).

### 1.1 Tokenizer: `packages/parser/src/constants/bhaiLangSpec.ts`

Language er "dictionary" holo ekta **ordered list of regex**:

```ts
export const SPEC = [
  { regex: /^\s+/, tokenType: null },              // whitespace → fele dao
  { regex: /^\/\/.*/, tokenType: null },           // comment → fele dao
  { regex: /^;/, tokenType: ";" },
  { regex: /^\bhi bhai\b/, tokenType: "hi bhai" },  // keyword
  ...
  { regex: /^[+-]?([\d]*[.])?[\d]+/, tokenType: "NUMBER" },
  { regex: /^\w+/, tokenType: "IDENTIFIER" },
  ...
];
```

`TokenizerImpl.getNextToken()` (`components/tokenizer/index.ts`) er kaj:
1. `cursor` theke baki string ta nao.
2. SPEC er protita regex upor theke niche try koro. **Prothom je ta match kore, shei ta win kore.**
3. `tokenType === null` hole (whitespace/comment) skip kore abar call koro.
4. Kichui match na korle `"Kya kar rha hai tu??...Unexpected token"`.

**Order keno important?** `"bhai ye hai"` keyword ke `IDENTIFIER` regex (`\w+`) er **age** rakhte hoy. Na rakhle `bhai` ke variable name hishebe dhore nibe.

Tokenizer ta **lazy**. Puro file ekbare tokenize kore na, parser jokhon chay tokhon ekta kore token dey.

### 1.2 Parser: recursive descent

`TokenExecutor` (`components/parser/tokenExecutor.ts`) shob shomoy **ekta token aage** (`_lookahead`) dekhe rakhe:

```ts
eatTokenAndForwardLookahead(tokenType) {
  const token = this._lookahead;
  if (token.type !== tokenType) throw new SyntaxError("...Unexpected token...");
  this._lookahead = this._tokenizer.getNextToken();   // ek dhap aage barao
  return token;
}
```

Er upor **protita grammar rule ekta class**:

- `StatementList.getInitialStatementList()`: `hi bhai` na pawa porjonto token khay (shob ignore kore), tarpor `InitStatement`.
- `Statement.getStatementImpl(lookahead)`: lookahead dekhe thik kore kon statement. `bol bhai` → PrintStatement, `agar bhai` → IfStatement, `{` → BlockStatement, baki shob → ExpressionStatement.
- Expressions **precedence ladder** e shajano. Protita level nicher level ke call kore:

```
AssignmentExpression          a = ...        (shobcheye loose)
  └ LogicalORExpression       ||
    └ LogicalANDExpression    &&
      └ EqualityExpression    == !=
        └ RelationalExpression < > <= >=
          └ AdditiveExpression + -
            └ MultiplicativeExpression * / %
              └ PrimaryExpression  literal, identifier, ( ... )   (shobcheye tight)
```

`1 + 2 * 3` keno `1 + (2 * 3)` hoy? Additive level age multiplicative ke call kore, tai `2 * 3` aage ekta node hoye jay. **Precedence = ke kake call kore.**

`Expression._getExpression()` holo common loop: `left (op right)*`. Ekhan theke **left-associative** tree hoy: `10 - 4 - 3` → `(10 - 4) - 3`.

Assignment **right recursion** use kore (`right: this.getExpression()`), tai `a = b = 5` → `a = (b = 5)`.

`BhaiLangModule` (`module/bhaiLangModule.ts`) ekta static **singleton factory / DI container**. Shob class er ekta instance lazily banay. Ei karone ~25 ta file hoy, kintu shob global state.

### 1.3 Interpreter: Visitor pattern

`InterpreterModule._visitorMap` e protita node type er jonno ekta **Visitor** class:

```ts
{ PrintStatement: new PrintStatement(), IfStatement: new IfStatement(), ... }
```

`InterpreterModule.getVisitor(node.type).visitNode(node)` call korle node ta chole. Protita visitor nijer child node gulo recursively visit kore.

**Scope** (`components/scope.ts`): ekta `Map` ar ekta `_parentScope`. Variable khujte gele chain dhore upore uthe (`get` → parent → parent ...). Block e dhukle `new Scope(parent)`, ber hole parent e ferot. Current scope ekta **global static** (`InterpreterModule._currentScope`).

**break/continue**: Scope e boolean flag (`_isBreakStatement`, `_isContinueStatement`). `BlockStatement` protita statement er age flag check kore. Flag set thakle thame ar parent scope e flag copy kore dey. `IfStatement`-o flag copy kore. Kaj kore, kintu shob jaygay mone kore copy korte hoy.

**Loop guard**: `WhileStatement` 5000 iteration er beshi chollei error dey. Na hole browser hang hoye jeto.

### 1.4 bhai-lang er kichu limitation (code pore paowa)

| Ki | Keno |
|----|------|
| `a -1` ba `a-1` likhle syntax error | NUMBER regex `[+-]?` diye shuru, ar seta ADDITIVE operator er **age**. Tai `-1` ekta number token hoye jay, ar `a` er pore operator chara number ashe |
| Function nai | Grammar e call expression ba return nai |
| Unary `-x`, `!x` nai | Grammar e unary level nai |
| Error e line number nai | Token e position track kora hoy na |
| Condition e shudhu `sahi` cholbe | `testResult === true \|\| testResult === "sahi"` |
| Loop er baire `bas kar bhai` dhora pore **runtime** e | Parser loop depth track kore na |
| 5000 iteration er beshi loop chole na | Hard-coded guard |

---

## 2. PakhiLang: same architecture, simpler code

PakhiLang ekta **Next.js (App Router)** project. bhai-lang language ar website ke alada package e rakhe. Amra rakhsi ekta project e, kintu clear vabe vag kore:

```
src/
  lib/pakhilang/   → LANGUAGE: tokenizer, parser, interpreter (kono React/Next dependency nai)
  lib/highlight.ts → language er nijer tokenizer diye syntax highlighting
  cli/             → `pakhi` command (esbuild diye dist/cli.js e bundle hoy)
  app/             → Next.js routes: layout.tsx, page.tsx, globals.css (Tailwind), icon.svg
  components/      → React UI (Tailwind): Navbar, Hero, Playground (CodeEditor + OutputPanel), Documentation, ...
  constants/       → data: examples, documentation sections, cheat sheet
```

`src/lib/pakhilang` pure TypeScript, tai eki code **3 jaygay** chole: browser er playground, Node er CLI, ar test e.

| Stage | bhai-lang | PakhiLang |
|-------|-----------|-----------|
| Token list | `bhaiLangSpec.ts` | [lib/pakhilang/lexer/tokens.ts](../src/lib/pakhilang/lexer/tokens.ts) |
| Tokenizer | `TokenizerImpl` | [lib/pakhilang/lexer/tokenizer.ts](../src/lib/pakhilang/lexer/tokenizer.ts) |
| Parser | ~25 ta class + `BhaiLangModule` | [lib/pakhilang/parser/parser.ts](../src/lib/pakhilang/parser/parser.ts) (ekta class, protita grammar rule ekta method) |
| AST type | ekta `ASTNode` (shob field optional) | [lib/pakhilang/parser/ast.ts](../src/lib/pakhilang/parser/ast.ts) (discriminated union) |
| Interpreter | ~20 ta Visitor class + `InterpreterModule` | [lib/pakhilang/interpreter/interpreter.ts](../src/lib/pakhilang/interpreter/interpreter.ts) (`exec` + `evaluate` er `switch`) |
| Scope | `Scope` | [lib/pakhilang/interpreter/environment.ts](../src/lib/pakhilang/interpreter/environment.ts) |

Concept same, shudhu kom file. Shikhar shomoy ek file e puro parser dekha shohoj.

### 2.1 Ja ja improve korsi

1. **Sticky regex (`/.../y`)**: bhai-lang protita token e `string.slice(cursor)` kore (O(n²)). Amra `regex.lastIndex = cursor` set kori, kono slicing nai.
2. **Line:col tracking**: protita token ar AST node e `loc` ache, tai error e exact jayga dekhano jay (code frame shoho).
3. **Number e sign nai**: `-` shob shomoy operator. Negative number ashe **unary minus** theke. Tai `a-1` thik moto kaj kore.
4. **Unary level** (`-x`, `!x`) ar **Call level** (`f(x)`) grammar e add kora.
5. **Functions + closures**: `kaj pakhi` / `ferot dao pakhi`. Function er closure = je scope e define hoise sheta. Call korle `new Environment(closure)`, caller er scope na. **Ei ekta line-i closure er rohoshyo.**
6. **break/continue/return = exception signal**: `throw BREAK` korle shob nested `exec()` ek dhakkay par hoye nearest loop er `catch` e pore. Kono flag copy korte hoy na.
7. **Parse-time check**: `thamo pakhi` loop er baire, ba `ferot dao pakhi` function er baire thakle **parser-i** dhore fele (`loopDepth`, `functionDepth`).
8. **Else-if = nested if**: `alternates` array er bodole `alternate` e arekta `IfStatement` (JavaScript er ESTree o eivabe kore).
9. **Truthiness**: `khali`, `mittha`, `0`, `""` falsy.
10. **Output injectable**: `new Interpreter({ print })`. CLI te `console.log`, playground/test e array te jomay. bhai-lang `console.log` ke override kore.

### 2.2 Ekta line er jibon: `bolo pakhi 1 + 2 * 3;`

**Tokenizer** (`--tokens`):
```
bolo pakhi  NUMBER(1)  ADDITIVE(+)  NUMBER(2)  MULTIPLICATIVE(*)  NUMBER(3)  ;
```

**Parser** call chain:
```
statement()              lookahead = "bolo pakhi" → printStatement()
  printStatement()       eat("bolo pakhi"), tarpor expression()
    assignment → logicalOr → logicalAnd → equality → relational → additive
      additive()         left = multiplicative() → … → primary() → 1
                         lookahead "+" → eat, right = multiplicative()
        multiplicative() left = 2, lookahead "*" → eat, right = 3 → (2*3)
                         → (1 + (2*3))
  optionalSemicolon()
```

**Interpreter**:
```
exec(PrintStatement)
  evaluate(Binary +)
    evaluate(1) = 1
    evaluate(Binary *) = evaluate(2) * evaluate(3) = 6
    = 7
  print("7")
```

---

## 3. Exercise: nije feature add koro

Protita exercise ei 4 ta step e hoy. Notun language feature add korte protibar ei same recipe:

1. **tokens.ts**: notun token/keyword add koro (order thik rekho!)
2. **ast.ts**: notun node type
3. **parser.ts**: grammar rule (method) add koro
4. **interpreter.ts**: `exec`/`evaluate` e notun `case`
5. **test** likho

### Exercise 1 (easy): `abar bolo pakhi` = print without newline
Hint: `print` option ta ekhon line ney. Notun statement e alada callback lagbe.

### Exercise 2 (easy): `**` power operator
Hint: `MULTIPLICATIVE` er cheye tight, unary er cheye loose level. Right-associative (`2 ** 3 ** 2 = 2 ** 9`), tai assignment er moto right recursion.

### Exercise 3 (medium): `for` loop → `protibar pakhi (dhoro pakhi i = 0; i < 10; i += 1) { }`
Hint: shobcheye shohoj upay holo parser e eta ke **desugar** kora, mane `{ init; jotokkhon pakhi (test) { body; update; } }` e convert kora. Tahole notun AST node lagbe na. Kintu ekta bug ache: `porer ta pakhi` dile `update` skip hoye jabe, ar loop kokhono shesh hobe na. Thik korte notun `ForStatement` node lagbe, ar interpreter e `ContinueSignal` dhorar **pore** `update` chalate hobe.

### Exercise 4 (medium): built-in function `lomba("pakhi")` → 5
Hint: `values.ts` e `NativeFunction` class, global environment e age theke declare kore rakho, `callFunction` e handle koro.

### Exercise 5 (hard): Array → `dhoro pakhi list = [1, 2, 3]; bolo pakhi list[0];`
Hint: `[` `]` token, `ArrayLiteral` ar `MemberExpression` node, call level e `(`er pashapashi `[` handle koro, assignment target e `list[0] = 5` allow koro.

### Exercise 6 (hard): REPL
`pakhi` command argument chara chalale prompt dekhabe, protita line chalabe, variable mone rakhbe. Hint: Interpreter er global environment ta run er baire rakhte hobe.

---

## 4. Aro porte chaile

- **Crafting Interpreters** (Robert Nystrom), free online: craftinginterpreters.com. Part II (jlox) hubohu ei approach.
- **Writing An Interpreter In Go** (Thorsten Ball).
- bhai-lang source: github.com/DulLabs/bhai-lang
