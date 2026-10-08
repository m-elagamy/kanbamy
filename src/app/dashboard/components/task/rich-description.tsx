"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

type RichDescriptionProps = {
  content: string;
  className?: string;
};

function CodeBlock({
  language,
  code,
}: {
  language?: string;
  code: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    void navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-3 overflow-hidden rounded-lg border border-border/80 bg-zinc-950 text-zinc-100 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/95">
      <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-900/80 px-3.5 py-1.5 text-xs text-zinc-400">
        <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-zinc-300">
          {language || "code"}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1.5 rounded px-2 py-0.5 text-[11px] font-medium text-zinc-300 transition-colors hover:bg-zinc-800 hover:text-white"
          title="Copy code"
        >
          {copied ? (
            <>
              <Check className="size-3 text-emerald-400" />
              <span className="font-medium text-emerald-400">Copied</span>
            </>
          ) : (
            <>
              <Copy className="size-3" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <pre
        dir="ltr"
        className="overflow-x-auto p-4 text-start font-mono text-xs leading-relaxed text-zinc-100 select-text"
      >
        <code>{code}</code>
      </pre>
    </div>
  );
}

export default function RichDescription({
  content,
  className,
}: RichDescriptionProps) {
  if (!content?.trim()) return null;

  return (
    <div
      className={cn(
        "space-y-3.5 text-sm sm:text-base leading-relaxed text-foreground/90 select-text",
        className,
      )}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h2
              dir="auto"
              className="pt-2 text-lg font-bold tracking-tight text-foreground sm:text-xl"
            >
              {children}
            </h2>
          ),
          h2: ({ children }) => (
            <h3
              dir="auto"
              className="pt-1.5 text-base font-semibold tracking-tight text-foreground sm:text-lg"
            >
              {children}
            </h3>
          ),
          h3: ({ children }) => (
            <h4
              dir="auto"
              className="pt-1 text-sm font-semibold text-foreground sm:text-base"
            >
              {children}
            </h4>
          ),
          p: ({ children }) => (
            <p
              dir="auto"
              className="whitespace-pre-line leading-relaxed text-foreground/85"
            >
              {children}
            </p>
          ),
          ul: ({ children }) => (
            <ul className="list-disc space-y-1.5 ps-5 marker:text-primary/70">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal space-y-1.5 ps-5 marker:font-medium marker:text-muted-foreground">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li dir="auto" className="ps-1 leading-relaxed">
              {children}
            </li>
          ),
          blockquote: ({ children }) => (
            <blockquote
              dir="auto"
              className="rounded-e-md border-s-3 border-primary/60 bg-muted/30 px-3.5 py-2 italic text-muted-foreground"
            >
              {children}
            </blockquote>
          ),
          code: ({ className: codeClassName, children, ...props }) => {
            const contentStr = Array.isArray(children)
              ? children.map((c) => (typeof c === "string" ? c : "")).join("")
              : typeof children === "string"
                ? children
                : String(children ?? "");

            const match = /language-(\w+)/.exec(codeClassName || "");
            const isMultiLine = contentStr.includes("\n");

            // If it's a code block (has language tag or contains newlines)
            if (match || isMultiLine) {
              return (
                <CodeBlock
                  language={match?.[1]}
                  code={contentStr.replace(/\n$/, "")}
                />
              );
            }

            // Inline code snippet
            return (
              <code
                dir="ltr"
                className="inline-block align-baseline rounded-md border border-zinc-200/90 bg-zinc-100 px-1.5 py-0.5 font-mono text-[0.85em] font-semibold text-zinc-900 shadow-2xs select-text dark:border-zinc-700/80 dark:bg-zinc-800/90 dark:text-zinc-100"
                {...props}
              >
                {children}
              </code>
            );
          },
          pre: ({ children }) => <>{children}</>,
          hr: () => <hr className="my-3 border-border/60" />,
          a: ({ children, href, ...props }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline underline-offset-3 hover:opacity-85"
              {...props}
            >
              {children}
            </a>
          ),
          input: ({ type, checked, ...props }) => {
            if (type === "checkbox") {
              return (
                <input
                  type="checkbox"
                  checked={checked}
                  disabled
                  className="me-2 size-3.5 rounded border-border accent-primary cursor-default align-middle"
                  {...props}
                />
              );
            }
            return <input type={type} {...props} />;
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
