import type { AST } from "@/lib/pakhilang";

type AnyNode = AST.Node & Record<string, unknown>;

const isNode = (v: unknown): v is AnyNode =>
  typeof v === "object" && v !== null && "type" in v && typeof (v as { type: unknown }).type === "string";

function label(node: AnyNode): string {
  const parts: string[] = [node.type];
  if (typeof node.operator === "string") parts.push(`(${node.operator})`);
  if ("value" in node && node.value !== undefined) parts.push(JSON.stringify(node.value));
  if (typeof node.name === "string") parts.push(node.name);
  return parts.join(" ");
}

function children(node: AnyNode): AnyNode[] {
  const result: AnyNode[] = [];
  for (const [key, value] of Object.entries(node)) {
    if (key === "loc") continue;
    if (isNode(value)) result.push(value);
    else if (Array.isArray(value)) result.push(...value.filter(isNode));
  }
  return result;
}

/**
 * Renders an AST node as an ASCII tree, e.g.
 *   PrintStatement
 *   └─ BinaryExpression (+)
 *      ├─ NumericLiteral 1
 *      └─ ...
 */
export function astToTree(node: AST.Node, prefix = "", isLast = true, isRoot = true): string {
  const n = node as AnyNode;
  const line = isRoot ? label(n) : `${prefix}${isLast ? "└─ " : "├─ "}${label(n)}`;
  const childPrefix = isRoot ? "" : prefix + (isLast ? "   " : "│  ");
  const kids = children(n);
  return [line, ...kids.map((kid, i) => astToTree(kid, childPrefix, i === kids.length - 1, false))].join("\n");
}
