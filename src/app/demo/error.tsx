"use client";

import BoardErrorContent from "@/components/workspace/board/board-error-content";

export default function DemoError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <BoardErrorContent
      error={error}
      reset={reset}
      title="This Demo workspace couldn't be loaded"
      description="Something went wrong while rendering the Demo workspace."
      helperText="Your temporary workspace can be restored by trying again."
      returnHref="/demo"
      returnLabel="Return to Demo"
    />
  );
}
