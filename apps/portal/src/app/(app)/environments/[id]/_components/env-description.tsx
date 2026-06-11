import { Fragment } from "react";

/**
 * Renders the env description with two inline transforms:
 *
 *  - `{code:KEY}` markers wrap as `<code>` (env-var name mention in prose, no
 *    auto-link per wireframe — they're not interactive).
 *  - URLs (`https://…`, terminated by whitespace) wrap as external `<a>`.
 *
 * Paragraph break = `\n\n` in the source string. Each paragraph renders as a
 * separate `<p>` so descriptions can have multiple blocks without dragging in
 * a markdown library.
 */
export function EnvDescription({ text }: { text: string }) {
  const paragraphs = text.split(/\n{2,}/).filter((p) => p.length > 0);
  return (
    <div className="flex flex-col gap-3">
      {paragraphs.map((para, i) => (
        <p key={i} className="text-foreground">
          {renderTokens(para)}
        </p>
      ))}
    </div>
  );
}

const TOKEN_RE = /(\{code:[A-Z0-9_]+\}|https?:\/\/[^\s)]+)/g;

function renderTokens(text: string) {
  const out: Array<React.ReactNode> = [];
  let last = 0;
  let key = 0;

  for (const match of text.matchAll(TOKEN_RE)) {
    const idx = match.index ?? 0;
    if (idx > last) out.push(text.slice(last, idx));

    const token = match[0];
    if (token.startsWith("{code:")) {
      const inner = token.slice(6, -1);
      out.push(
        <code
          key={key++}
          className="font-mono text-label bg-muted-surface text-foreground rounded-sm px-1"
        >
          {inner}
        </code>,
      );
    } else {
      out.push(
        <a
          key={key++}
          href={token}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary underline underline-offset-2 hover:text-primary-hover"
        >
          {token}
        </a>,
      );
    }
    last = idx + token.length;
  }
  if (last < text.length) out.push(text.slice(last));

  return out.map((node, i) => <Fragment key={i}>{node}</Fragment>);
}
