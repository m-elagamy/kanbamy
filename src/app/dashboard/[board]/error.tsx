"use client";

import BoardErrorContent from "@/components/workspace/board/board-error-content";

export default function BoardError({
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
      returnHref="/dashboard"
      returnLabel="Return to dashboard"
    />
  );
}
