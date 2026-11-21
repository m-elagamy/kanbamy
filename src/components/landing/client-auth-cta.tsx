"use client";

import { useAuth } from "@clerk/nextjs";
import { Zap } from "lucide-react";
import { Skeleton } from "../ui/skeleton";
import CtaButton from "./cta-button";
import { CtaSectionButtons } from "./cta";

export function ClientHeroCtaActions() {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) {
    return <Skeleton className="h-10 w-44 rounded-md" aria-hidden="true" />;
  }

  const signedIn = Boolean(isSignedIn);

  return (
    <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-start">
      <CtaButton
        variant="cta-section"
        size="lg"
        isSignedIn={signedIn}
        effect="shine"
        className="mx-auto w-fit"
      />
      {!signedIn && (
        <div className="relative flex flex-col items-center gap-2">
          <CtaButton variant="demo" size="lg" isSignedIn={false} />
          <span className="text-muted-foreground flex items-center gap-1 text-xs leading-4 whitespace-nowrap sm:absolute sm:top-full sm:mt-2">
            <Zap
              aria-hidden="true"
              className="size-3.5 shrink-0 stroke-[1.75]"
            />
            No sign-up required
          </span>
        </div>
      )}
    </div>
  );
}

export function ClientCtaSectionActions() {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) {
    return <Skeleton className="h-10 w-44 rounded-md" aria-hidden="true" />;
  }

  return <CtaSectionButtons isSignedIn={Boolean(isSignedIn)} />;
}
