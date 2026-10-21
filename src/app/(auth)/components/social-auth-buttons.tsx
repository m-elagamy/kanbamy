"use client";

import { Loader } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/ui/icons";

export type AuthProvider = "oauth_google" | "oauth_github";

export function SocialAuthButtons({
  loading,
  provider,
  lastUsedProvider,
  onProvider,
}: {
  loading: boolean;
  provider: AuthProvider | null;
  lastUsedProvider?: string | null;
  onProvider: (provider: AuthProvider) => void;
}) {
  const buttons = [
    ["oauth_google", <Icons.google key="google" />, "Continue with Google"],
    ["oauth_github", <Icons.gitHub key="github" />, "Continue with GitHub"],
  ] as const;

  return (
    <div className="grid gap-3">
      {buttons.map(([value, icon, label]) => {
        const isLastUsed = lastUsedProvider === value;

        return (
          <div key={value} className="relative w-full">
            <Button
              className="border-border bg-background/80 hover:bg-accent/70 dark:bg-input/50 dark:hover:bg-accent/60 flex h-10 w-full items-center justify-center gap-2 px-4 shadow-xs"
              type="button"
              variant="outline"
              disabled={loading || provider !== null}
              onClick={() => onProvider(value)}
            >
              {provider === value ? (
                <>
                  <Loader className="animate-spin" />
                  Connecting to {value === "oauth_github" ? "GitHub" : "Google"}
                  ...
                </>
              ) : (
                <>
                  {icon} {label}
                </>
              )}
            </Button>

            {isLastUsed && !provider && (
              <span className="pointer-events-none absolute -top-2.5 right-3.5 z-10 inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-background px-2 py-0.5 text-[10px] font-medium text-foreground shadow-xs dark:border-white/15 dark:bg-[#1a1a1e] dark:text-neutral-200 dark:shadow-[0_2px_8px_rgba(0,0,0,0.6)]">
                <span className="size-1.5 rounded-full bg-primary shrink-0" />
                Last used
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
