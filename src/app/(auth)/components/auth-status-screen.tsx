import type { ReactNode } from "react";
import KanbanLogo from "@/components/layout/header/kanban-logo";
import BackgroundEffect from "./background-effect";

interface AuthStatusShellProps {
  children: ReactNode;
  footer?: ReactNode;
}

export function AuthStatusShell({ children, footer }: AuthStatusShellProps) {
  return (
    <main className="bg-muted/30 dark:bg-background relative isolate flex min-h-dvh items-center justify-center overflow-hidden px-4 py-10 sm:px-6">
      <BackgroundEffect />
      <section className="animate-in fade-in zoom-in-95 motion-reduce:animate-none relative z-10 grid w-full max-w-xl -translate-y-7 justify-items-center gap-5 text-center duration-500 ease-out sm:-translate-y-11 sm:gap-6">
        <KanbanLogo glow="auth" className="mx-auto" />
        {children}
      </section>
      {footer}
    </main>
  );
}

interface AuthStatusMessageProps {
  title: string;
  description: string;
}

export function AuthStatusMessage({
  title,
  description,
}: AuthStatusMessageProps) {
  return (
    <div
      className="grid max-w-2xl justify-items-center gap-3"
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      <div className="grid gap-1.5">
        <h1 className="text-foreground flex items-center justify-center gap-2 text-base font-semibold tracking-tight text-balance sm:text-lg">
          <span aria-hidden="true" className="relative flex size-2 shrink-0">
            <span className="bg-(--brand) absolute inline-flex size-full animate-ping rounded-full opacity-60 motion-reduce:animate-none" />
            <span className="bg-(--brand) relative inline-flex size-1.5 self-center rounded-full" />
          </span>
          {title}
        </h1>
        <p className="text-foreground/60 dark:text-foreground/65 mx-auto max-w-xl text-[0.68rem] font-medium leading-5 tracking-[0.12em] text-pretty sm:text-xs sm:tracking-[0.16em]">
          {description}
        </p>
      </div>
    </div>
  );
}
