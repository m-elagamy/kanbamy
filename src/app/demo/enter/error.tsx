"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ErrorCard } from "@/components/ui/error-card";

export default function DemoEntryError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <ErrorCard
      title="We couldn't prepare your Demo workspace"
      description="Something went wrong while starting the Demo. Please try again."
      icon={<AlertTriangle className="size-8" />}
      actions={
        <Button size="sm" onClick={reset}>
          Try again
        </Button>
      }
    />
  );
}
