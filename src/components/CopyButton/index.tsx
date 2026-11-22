"use client";

import { useState } from "react";
import Icon from "@/components/Icon";

export default function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard blocked (e.g. plain http) — nothing to do
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={copied ? "Copied" : "Copy code"}
      title={copied ? "Copied" : "Copy"}
      className="grid size-7 cursor-pointer place-items-center rounded-md border border-line-strong bg-surface text-muted transition hover:bg-surface-2 hover:text-fg"
    >
      <Icon name={copied ? "check" : "copy"} size={14} />
    </button>
  );
}
