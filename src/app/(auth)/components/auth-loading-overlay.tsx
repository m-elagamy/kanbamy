"use client";

import { useEffect, useState } from "react";
import { useAuth, useClerk } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import { Loader2 } from "lucide-react";
import KanbanLogo from "@/components/layout/header/kanban-logo";

export default function AuthLoadingOverlay() {
  const { isSignedIn } = useAuth();
  const clerk = useClerk();
  const [isProcessing, setIsProcessing] = useState(false);
  const pathname = usePathname();

  const isSignUp = pathname?.includes("sign-up");

  // 1. Intercept FedCM (Chrome native One Tap credential prompt)
  useEffect(() => {
    if (typeof window === "undefined" || !navigator.credentials?.get) return;

    const originalGet = navigator.credentials.get.bind(navigator.credentials);
    navigator.credentials.get = async function (...args) {
      try {
        const result = await originalGet(...args);
        if (result) {
          setIsProcessing(true);
        }
        return result;
      } catch (err) {
        throw err;
      }
    };

    return () => {
      navigator.credentials.get = originalGet;
    };
  }, []);

  // 2. Intercept window.fetch for Clerk authentication mutations (sign_ins / sign_ups)
  useEffect(() => {
    if (typeof window === "undefined") return;

    const originalFetch = window.fetch;
    window.fetch = async function (...args) {
      try {
        const url =
          typeof args[0] === "string"
            ? args[0]
            : args[0] instanceof URL
              ? args[0].href
              : (args[0] as Request)?.url || "";

        const method = (
          args[1]?.method ||
          ((args[0] as Request)?.method || "GET")
        ).toUpperCase();

        const isAuthMutation =
          (method === "POST" || method === "PUT") &&
          (url.includes("clerk") || url.includes("/v1/client")) &&
          (url.includes("sign_in") ||
            url.includes("sign_up") ||
            url.includes("session") ||
            url.includes("tokens") ||
            url.includes("ticket"));

        if (isAuthMutation) {
          setIsProcessing(true);
        }

        const response = await originalFetch.apply(this, args);

        if (isAuthMutation && !response.ok && response.status !== 302 && response.status !== 307) {
          setIsProcessing(false);
        }

        return response;
      } catch (error) {
        setIsProcessing(false);
        throw error;
      }
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, []);

  // 3. Intercept Google Identity Services (GIS) callback if iframe prompt is used
  useEffect(() => {
    if (typeof window === "undefined") return;

    function wrapGis() {
      const google = (window as unknown as { google?: { accounts?: { id?: { initialize: (...args: unknown[]) => void; __kanbamyWrapped?: boolean } } } }).google;
      const gis = google?.accounts?.id;
      if (!gis || gis.__kanbamyWrapped) return false;

      gis.__kanbamyWrapped = true;
      const originalInitialize = gis.initialize;
      gis.initialize = function (config: unknown) {
        if (config && typeof config === "object") {
          const cfg = config as { callback?: (res: unknown) => void };
          const originalCallback = cfg.callback;
          cfg.callback = function (res: unknown) {
            setIsProcessing(true);
            return originalCallback?.(res);
          };
        }
        return originalInitialize.call(this, config);
      };
      return true;
    }

    wrapGis();
    const interval = setInterval(() => {
      if (wrapGis()) clearInterval(interval);
    }, 100);
    const timeout = setTimeout(() => clearInterval(interval), 6000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, []);

  // 4. Listen to Clerk session creation emission
  useEffect(() => {
    const unsubscribe = clerk.addListener((emission) => {
      if (emission.session || emission.user) {
        setIsProcessing(true);
      }
    });
    return () => {
      unsubscribe?.();
    };
  }, [clerk]);

  // 5. Safety timeout: dismiss overlay if auth fails or hangs after 12s
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
