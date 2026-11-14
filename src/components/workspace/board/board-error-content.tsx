"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ErrorCard } from "@/components/ui/error-card";
import usePageMetadata from "@/hooks/use-page-metadata";

type BoardErrorContentProps = {
  error: Error & { digest?: string };
  reset: () => void;
  title?: string;
  description?: string;
  helperText?: string;
  returnHref: string;
  returnLabel: string;
};

export default function BoardErrorContent({
  error,
  reset,
  title = "This board couldn't be loaded",
  description = "Something went wrong while rendering this board.",
  helperText = "If the problem persists, please try again later.",
  returnHref,
  returnLabel,
}: BoardErrorContentProps) {
  usePageMetadata(
    "Error | Kanbamy",
    "An error occurred while loading this board. Please try again.",
  );

  useEffect(() => {
    console.error(error);
  }, [error]);

  const actions = (
    <>
      <Button size="sm" variant="outline" onClick={() => reset()}>
        Try again
      </Button>
      <Button size="sm" asChild>
        <Link href={returnHref}>{returnLabel}</Link>
      </Button>
    </>
  );

  return (
    <ErrorCard
      title={title}
      description={description}
      icon={<AlertTriangle className="size-8" />}
      actions={actions}
      helperText={helperText}
    />
  );
}
