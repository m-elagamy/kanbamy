import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export default function DemoHeaderIndicator() {
  return (
    <div
      aria-label="Demo workspace"
      className="border-amber-500/25 bg-amber-500/[0.07] inline-flex h-7 shrink-0 items-center gap-2 rounded-full border px-3 text-xs shadow-2xs"
    >
      <span
        className="text-foreground/85 inline-flex items-center gap-1.5 font-medium"
        title="Temporary demo workspace"
      >
        <span className="relative flex size-2 shrink-0" aria-hidden="true">
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-amber-500/75" />
          <span className="relative inline-flex size-2 rounded-full bg-amber-500" />
        </span>
        Demo mode
      </span>
      <span aria-hidden="true" className="bg-border/80 h-3.5 w-px" />
      <Link
        href="/sign-up"
        className="text-primary hover:text-primary/80 inline-flex items-center gap-0.5 font-medium underline-offset-4 transition-colors hover:underline"
      >
        Create account
        <ArrowUpRight className="size-3.5 shrink-0" aria-hidden="true" />
      </Link>
    </div>
  );
}
