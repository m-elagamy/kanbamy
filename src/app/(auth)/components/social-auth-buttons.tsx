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
            className="border-border bg-background/80 hover:bg-accent/70 dark:bg-input/50 dark:hover:bg-accent/60 relative h-10 px-4 shadow-xs"
            type="button"
            variant="outline"
            disabled={loading || provider !== null}
            onClick={() => onProvider(value)}
          >
            <span className="flex items-center gap-2">
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

            {isLastUsed && (
              <span className="border-primary/25 bg-primary/10 text-primary pointer-events-none absolute right-3 inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium tracking-wide uppercase">
                Last used
              </span>
            )}
          </Button>
        );
      })}
    </div>
  );
}
