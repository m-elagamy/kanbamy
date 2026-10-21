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
          <Button
            key={value}
            className="border-border bg-background/80 hover:bg-accent/70 dark:bg-input/50 dark:hover:bg-accent/60 relative flex h-10 w-full items-center justify-center gap-2 px-4 shadow-xs"
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

            {isLastUsed && !provider && (
              <span className="pointer-events-none absolute right-3 inline-flex items-center rounded-full bg-muted/60 px-2.5 py-0.5 text-[11px] font-normal text-muted-foreground/80 dark:bg-white/[0.06] dark:text-neutral-400">
                Last used
              </span>
            )}
          </Button>
        );
      })}
    </div>
  );
}
