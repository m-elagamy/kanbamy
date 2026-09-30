"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ErrorCard } from "@/components/ui/error-card";
import usePageMetadata from "@/hooks/use-page-metadata";

export default function DemoError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  usePageMetadata(
    "Error | Kanbamy",
    "An error occurred while loading the Demo workspace. Please try again.",
  );

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <ErrorCard
      title="This Demo workspace couldn't be loaded"
      description="Something went wrong while rendering the Demo workspace."
      icon={<AlertTriangle className="size-8" />}
      actions={
        <>
          <Button size="sm" variant="outline" onClick={() => reset()}>
            Try again
          </Button>
          <Button size="sm" asChild>
            <Link href="/demo">Return to Demo</Link>
          </Button>
        </>
      }
      helperText="Your temporary workspace can be restored by trying again."
    />
  );
}
