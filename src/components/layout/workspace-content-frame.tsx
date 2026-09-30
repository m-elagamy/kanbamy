import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type WorkspaceContentFrameProps = {
  children: ReactNode;
  ariaLabel?: string;
  className?: string;
};

export default function WorkspaceContentFrame({
  children,
  ariaLabel,
  className,
}: WorkspaceContentFrameProps) {
  return (
    <section
      className={cn(
        "board-canvas relative flex h-full min-h-0 min-w-0 flex-col overflow-hidden rounded-xl",
        className,
      )}
    >
      {ariaLabel ? <h2 className="sr-only">{ariaLabel}</h2> : null}
      <div className="flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        {children}
      </div>
    </section>
  );
}
