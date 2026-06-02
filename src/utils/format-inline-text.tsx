import type { ReactNode } from "react";

const INLINE_TOKEN =
  /(\*\*[^*]+\*\*|\[[^\]]+\]\(https?:\/\/[^)]+\))/g;

function parseInlineToken(token: string, key: number): ReactNode {
  if (token.startsWith("**") && token.endsWith("**")) {
    return <strong key={key}>{token.slice(2, -2)}</strong>;
  }

  const linkMatch = /^\[([^\]]+)\]\((https?:\/\/[^)]+)\)$/.exec(token);
  if (linkMatch) {
    const [, label, href] = linkMatch;
    return (
      <a key={key} href={href} target="_blank" rel="noreferrer">
        {label}
      </a>
    );
  }

  return token;
}

export function formatInlineText(text: string): ReactNode {
  const parts = text.split(INLINE_TOKEN).filter(part => part.length > 0);

  if (parts.length === 1 && typeof parts[0] === "string" && !INLINE_TOKEN.test(parts[0])) {
    return text;
  }

  return parts.map((part, index) => parseInlineToken(part, index));
}
