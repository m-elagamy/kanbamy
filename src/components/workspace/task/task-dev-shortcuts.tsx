"use client";

import { useState } from "react";
import { GitBranch, Terminal, Copy, Check, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import { cn } from "@/lib/utils";
import type { ClientTask } from "@/lib/types";

const PREFIXES = [
  { value: "feat", label: "feat/" },
  { value: "fix", label: "fix/" },
  { value: "refactor", label: "refactor/" },
  { value: "chore", label: "chore/" },
  { value: "hotfix", label: "hotfix/" },
  { value: "docs", label: "docs/" },
  { value: "test", label: "test/" },
] as const;

type Prefix = (typeof PREFIXES)[number]["value"];

function slugify(text: string, prefix?: Prefix, maxLength = 45): string {
  const stripped = text.replace(
    /^(?:feat|fix|bug|refactor|chore|hotfix|docs?|test)[:\s\-_]+/i,
    "",
  );

  const clean = (stripped || text)
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");

  if (!clean) return "task";
  if (clean.length <= maxLength) return clean;

  const truncated = clean.slice(0, maxLength);
  const lastHyphen = truncated.lastIndexOf("-");
  return lastHyphen > 15 ? truncated.slice(0, lastHyphen) : truncated;
}

function detectPrefix(title: string, tags: string[] = []): Prefix {
  const lowerTags = tags.map((t) => t.toLowerCase());
  if (lowerTags.some((t) => t.includes("bug") || t.includes("fix"))) return "fix";
  if (lowerTags.some((t) => t.includes("refactor"))) return "refactor";
  if (lowerTags.some((t) => t.includes("doc"))) return "docs";
  if (lowerTags.some((t) => t.includes("test"))) return "test";
  if (lowerTags.some((t) => t.includes("chore"))) return "chore";

  const lowerTitle = title.toLowerCase().trim();
  if (/^(fix|bug|issue|solve)/i.test(lowerTitle)) return "fix";
  if (/^(refactor|clean|optimize)/i.test(lowerTitle)) return "refactor";
  if (/^(docs?|readme|guide)/i.test(lowerTitle)) return "docs";
  if (/^(test|e2e|unit)/i.test(lowerTitle)) return "test";
  if (/^(chore|deps|upgrade|bump|config)/i.test(lowerTitle)) return "chore";

  return "feat";
}

interface TaskDevShortcutsProps {
  task: ClientTask;
  className?: string;
}

export default function TaskDevShortcuts({ task, className }: TaskDevShortcutsProps) {
  const [prefix, setPrefix] = useState<Prefix>(() => detectPrefix(task.title, task.tags));
  const { copied, copy } = useCopyToClipboard();

  const slug = slugify(task.title, prefix);
  const command = `git switch -c ${prefix}/${slug}`;

  return (
    <div
      className={cn(
        "border-border/60 bg-muted/30 flex shrink-0 items-center gap-2 border-t px-4 py-2 sm:px-6",
        className,
      )}
    >
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="border-border/80 bg-background text-foreground hover:bg-muted focus-visible:ring-ring inline-flex h-7 shrink-0 cursor-pointer items-center gap-1.5 rounded border px-2 font-mono text-xs font-medium transition-colors focus-visible:ring-1 focus-visible:outline-none"
            title="Change branch prefix"
          >
            <GitBranch className="text-muted-foreground size-3.5" aria-hidden="true" />
            <span>{prefix}/</span>
            <ChevronDown className="text-muted-foreground size-3" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-28 min-w-0">
          {PREFIXES.map((opt) => (
            <DropdownMenuItem
              key={opt.value}
              onClick={() => setPrefix(opt.value)}
              className={cn(
                "flex cursor-pointer items-center justify-between font-mono text-xs",
                prefix === opt.value && "bg-accent font-semibold",
              )}
            >
              <span>{opt.label}</span>
              {prefix === opt.value && <Check className="text-primary size-3" />}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Command Display Box */}
      <div className="border-border/80 bg-zinc-950 dark:bg-zinc-900/90 flex h-7 min-w-0 flex-1 items-center justify-between rounded border px-2.5 text-zinc-100 shadow-2xs">
        <div className="flex min-w-0 items-center gap-1.5 overflow-x-auto font-mono text-[11px] select-all">
          <Terminal className="size-3 shrink-0 text-emerald-400" aria-hidden="true" />
          <span className="truncate">{command}</span>
        </div>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => copy(command)}
          className="hover:bg-zinc-800 -mr-1.5 h-6 shrink-0 cursor-pointer gap-1 px-1.5 text-[11px] text-zinc-300 hover:text-white"
          title="Copy branch command"
        >
          {copied ? (
            <>
              <Check className="size-3 text-emerald-400" />
              <span className="text-[10px] text-emerald-400">Copied</span>
            </>
          ) : (
            <>
              <Copy className="size-3" />
              <span className="text-[10px]">Copy</span>
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
