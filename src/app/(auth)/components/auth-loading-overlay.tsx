"use client";

import { useAuth } from "@clerk/nextjs";
import { Loader2 } from "lucide-react";
import KanbanLogo from "@/components/layout/header/kanban-logo";

export default function AuthLoadingOverlay() {
  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded || !isSignedIn) {
    return null;
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/80 backdrop-blur-md animate-in fade-in duration-300"
    >
      <div className="flex flex-col items-center gap-4 rounded-2xl border border-border/60 bg-card/90 px-8 py-7 shadow-2xl text-center max-w-sm mx-4">
        <KanbanLogo glow="auth" />
        <div className="flex items-center gap-2.5 text-primary pt-2">
          <Loader2 className="size-5 animate-spin" />
          <span className="text-sm font-medium text-foreground">
            Completing sign-in...
          </span>
        </div>
        <p className="text-xs text-muted-foreground">
          Setting up your workspace and redirecting you
        </p>
      </div>
    </div>
  );
}
