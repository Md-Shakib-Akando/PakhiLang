import { highlight, type SegmentKind } from "@/lib/highlight";

/** Tailwind classes for each kind of token (colors defined in app/globals.css @theme). */
export const KIND_CLASSES: Record<SegmentKind, string> = {
  keyword: "text-syn-keyword font-semibold",
  literal: "text-syn-number",
  number: "text-syn-number",
  string: "text-syn-string",
  identifier: "text-syn-ident",
  function: "text-syn-function",
  operator: "text-syn-operator",
  punctuation: "text-syn-punct",
  comment: "text-syn-comment italic",
  ignored: "text-syn-ignored",
  plain: "",
};

/**
 * Renders PakhiLang source as colored <span>s using PakhiLang's own tokenizer.
 * No hooks, so it works in both server and client components.
 */
export default function HighlightedCode({ code }: { code: string }) {
  return (
    <>
      {highlight(code).map((segment, i) => (
        <span key={i} className={KIND_CLASSES[segment.kind] || undefined}>
          {segment.text}
        </span>
      ))}
    </>
  );
}
