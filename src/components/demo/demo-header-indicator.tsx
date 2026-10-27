import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export default function DemoHeaderIndicator() {
  return (
    <div
      aria-label="Demo workspace"
      className="border-border/80 bg-card/70 inline-flex h-7 shrink-0 items-center gap-2.5 rounded-full border px-3 text-xs shadow-2xs"
    >
      <span
        className="text-muted-foreground inline-flex items-center gap-1.5 font-medium"
        title="Temporary demo workspace"
      >
        <span
          aria-hidden="true"
          className="size-1.5 shrink-0 rounded-full bg-amber-500"
        />
        Demo
      </span>
      <span aria-hidden="true" className="bg-border h-3.5 w-px" />
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
