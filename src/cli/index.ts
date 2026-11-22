#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { PakhiError, VERSION, codeFrame, parse, run, tokenize } from "../lib/pakhilang";

const useColor = process.stdout.isTTY && !process.env.NO_COLOR;
const paint = (code: number) => (s: string) => (useColor ? `\x1b[${code}m${s}\x1b[0m` : s);
const red = paint(31);
const pink = paint(95);
const dim = paint(2);
const bold = paint(1);

const HELP = `
${pink("🐦 PakhiLang")} v${VERSION} — pakhi ke niye ekta programming language

${bold("Usage")}
  pakhi <file.pakhi>            program chalao
  pakhi -e "<code>"             code ta shorashori chalao
  pakhi --tokens <file>         tokenizer er output dekho (stage 1)
  pakhi --ast <file>            parser er AST dekho      (stage 2)
  pakhi -h | --help             ei help
  pakhi -v | --version          version

${bold("Example")}
  hi pakhi
    bolo pakhi "Hello pakhi!";
  bye pakhi
`;

function main(argv: string[]): number {
  let mode: "run" | "tokens" | "ast" = "run";
  let source: string | undefined;
  let fileName = "<code>";

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "-h" || arg === "--help") {
      console.log(HELP);
      return 0;
    } else if (arg === "-v" || arg === "--version") {
      console.log(VERSION);
      return 0;
    } else if (arg === "--tokens") {
      mode = "tokens";
    } else if (arg === "--ast") {
      mode = "ast";
    } else if (arg === "-e" || arg === "--eval") {
      source = argv[++i];
      if (source === undefined) {
        console.error(red(`"-e" er pore code dao pakhi.`));
        return 1;
      }
    } else if (arg.startsWith("-")) {
      console.error(red(`Ei option chini na: ${arg}`) + "\n" + HELP);
      return 1;
    } else {
      fileName = arg;
      try {
        source = readFileSync(arg, "utf8");
      } catch {
        console.error(red(`Pakhi, "${arg}" file ta to khuje pailam na!`));
        return 1;
      }
    }
  }

  if (source === undefined) {
    console.log(HELP);
    return 1;
  }

  try {
    if (mode === "tokens") {
      for (const t of tokenize(source)) {
        console.log(`${dim(`${t.loc.line}:${t.loc.col}`.padEnd(8))} ${t.type.padEnd(18)} ${JSON.stringify(t.value)}`);
      }
    } else if (mode === "ast") {
      console.log(JSON.stringify(parse(source), (key, value) => (key === "loc" ? undefined : value), 2));
    } else {
      run(source);
    }
    return 0;
  } catch (err) {
    if (err instanceof PakhiError) {
      const where = err.loc ? `${fileName}:${err.loc.line}:${err.loc.col}` : fileName;
      console.error(`\n${red(bold(`✖ ${err.name}`))} ${dim(where)}\n  ${err.message}\n`);
      if (err.loc) console.error(dim(codeFrame(source, err.loc)) + "\n");
      return 1;
    }
    throw err;
  }
}

process.exitCode = main(process.argv.slice(2));
