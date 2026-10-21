"use client";

import { Loader } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/ui/icons";

export type AuthProvider = "oauth_google" | "oauth_github";

const BASE_BUTTONS = [
  ["oauth_google", <Icons.google key="google" />, "Continue with Google"],
  ["oauth_github", <Icons.gitHub key="github" />, "Continue with GitHub"],
] as const;

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
  const buttons = lastUsedProvider
    ? [...BASE_BUTTONS].sort(([a], [b]) => {
        if (a === lastUsedProvider) return -1;
        if (b === lastUsedProvider) return 1;
        return 0;
      })
    : BASE_BUTTONS;

  return (
    <div className="grid gap-3 pt-1">
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
              <span className="flex items-center gap-2 text-sm font-medium">
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
              </span>
            </Button>

            {isLastUsed && !provider && (
              <span className="pointer-events-none absolute -top-2.5 right-3.5 z-10 inline-flex items-center rounded-full border border-border bg-card px-2.5 py-0.5 text-[11px] font-normal text-muted-foreground shadow-xs">
                Last used
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
