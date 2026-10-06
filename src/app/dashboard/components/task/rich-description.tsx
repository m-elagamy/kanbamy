"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";

type RichDescriptionProps = {
  content: string;
  className?: string;
};

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
            const isInline = !codeClassName && typeof children === "string" && !children.includes("\n");
            if (isInline) {
              return (
                <code
                  className="rounded border border-border/60 bg-muted/70 px-1.5 py-0.5 font-mono text-xs text-foreground select-text"
                  {...props}
                >
                  {children}
                </code>
              );
            }
            return (
              <code className={cn("font-mono text-xs sm:text-sm", codeClassName)} {...props}>
                {children}
              </code>
            );
          },
          pre: ({ children }) => (
            <pre className="my-2 overflow-x-auto rounded-lg border border-border/70 bg-muted/50 p-3.5 font-mono text-xs text-foreground/90 sm:text-sm">
              {children}
            </pre>
          ),
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
