"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import { Loader2 } from "lucide-react";
import KanbanLogo from "@/components/layout/header/kanban-logo";

type GisConfig = {
  callback?: (response: unknown) => void;
  [key: string]: unknown;
};

type GisAccountsId = {
  initialize: (config: GisConfig) => void;
  prompt?: (notification?: unknown) => void;
  __kanbamyWrapped?: boolean;
  [key: string]: unknown;
};

export default function AuthLoadingOverlay() {
  const { isSignedIn } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const pathname = usePathname();

  const isSignUp = pathname?.includes("sign-up");

  // 1. Intercept Google Identity Services (One Tap) callback to trigger loader instantly on tap
  useEffect(() => {
    let isMounted = true;

    function wrapGis() {
      if (typeof window === "undefined") return false;
      const google = (window as unknown as { google?: { accounts?: { id?: GisAccountsId } } })
        .google;
      const gis = google?.accounts?.id;
      if (!gis || gis.__kanbamyWrapped) return false;

      const originalInitialize = gis.initialize;
      if (typeof originalInitialize !== "function") return false;

      gis.__kanbamyWrapped = true;

      gis.initialize = function (config: GisConfig) {
        if (config && typeof config === "object") {
          const originalCallback = config.callback;
          config.callback = function (response: unknown) {
            if (isMounted) {
              setIsProcessing(true);
            }
            if (typeof originalCallback === "function") {
              return originalCallback(response);
            }
          };
        }
        return originalInitialize.call(this, config);
      };

      return true;
    }

    if (!wrapGis()) {
      const interval = setInterval(() => {
        if (wrapGis()) {
          clearInterval(interval);
        }
      }, 50);

      const timeout = setTimeout(() => {
        clearInterval(interval);
      }, 10000);

      return () => {
        isMounted = false;
        clearInterval(interval);
        clearTimeout(timeout);
      };
    }

    return () => {
      isMounted = false;
    };
  }, []);

  // 2. Safety timeout: if auth gets cancelled or fails, dismiss overlay after 12s
  useEffect(() => {
    if (isProcessing && !isSignedIn) {
      const timer = setTimeout(() => {
        setIsProcessing(false);
      }, 12000);
      return () => clearTimeout(timer);
    }
  }, [isProcessing, isSignedIn]);

  const shouldShow = isProcessing || isSignedIn;

  if (!shouldShow) {
    return null;
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/80 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div className="flex flex-col items-center gap-4 rounded-2xl border border-border/60 bg-card/90 px-8 py-7 shadow-2xl text-center max-w-sm mx-4">
        <KanbanLogo glow="auth" />
        <div className="flex items-center gap-2.5 text-primary pt-2">
          <Loader2 className="size-5 animate-spin" />
          <span className="text-sm font-medium text-foreground">
            {isSignUp ? "Setting up your account..." : "Completing sign-in..."}
          </span>
        </div>
        <p className="text-xs text-muted-foreground">
          {isSignUp
            ? "Creating your profile and redirecting you..."
            : "Setting up your workspace and redirecting you..."}
        </p>
      </div>
    </div>
  );
}
