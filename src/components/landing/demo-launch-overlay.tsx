"use client";

import KanbanLogo from "@/components/layout/header/kanban-logo";
import { useEffect, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

const EXIT_START_DELAY_MS = 650;
const subscribeToMount = () => () => {};
const getClientMountState = () => true;
const getServerMountState = () => false;

export default function DemoLaunchOverlay() {
  const [isExiting, setIsExiting] = useState(false);
  const mounted = useSyncExternalStore(
    subscribeToMount,
    getClientMountState,
    getServerMountState,
  );

  useEffect(() => {
    const timer = window.setTimeout(
      () => setIsExiting(true),
      EXIT_START_DELAY_MS,
    );

    return () => window.clearTimeout(timer);
  }, []);

  if (!mounted) return null;

  return createPortal(
    <div
      className={cn(
        "bg-background/72 fixed inset-0 z-[100] flex min-h-dvh items-center justify-center px-6 py-10 opacity-100 backdrop-blur-[2px] transition-[opacity,transform] duration-200 ease-out motion-reduce:backdrop-blur-none motion-reduce:transition-none",
        isExiting && "scale-[0.995] opacity-0",
      )}
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label="Preparing your Kanbamy workspace"
    >
      <div className="animate-in fade-in flex w-full max-w-sm flex-col items-center gap-5 text-center duration-300 motion-reduce:animate-none">
        <KanbanLogo glow="auth" className="pointer-events-none" />
        <div className="grid gap-2">
          <h1 className="text-foreground text-xl font-semibold tracking-tight sm:text-2xl">
            Preparing your Kanbamy workspace
          </h1>
          <p className="text-muted-foreground text-sm leading-6 sm:text-base">
            Setting up your demo experience…
          </p>
        </div>
        <div className="bg-border/60 h-px w-full max-w-xs overflow-hidden rounded-full">
          <div className="bg-primary h-full w-1/3 animate-[demo-launch-progress_1.4s_ease-in-out_infinite] motion-reduce:animate-none" />
        </div>
      </div>
    </div>,
    document.body,
  );
}
