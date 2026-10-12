"use client";

import BoardContainer from "@/components/workspace/board/board-container";
import BoardHeaderSkeleton from "@/components/workspace/board/board-header-skeleton";
import BoardSkeleton from "@/components/workspace/board/board-skeleton";
import { useSearchParams } from "next/navigation";

export default function BoardPageLoading() {
  const searchParams = useSearchParams();

  if (searchParams.get("new") !== "1" && searchParams.get("created") !== "1") {
    return <BoardSkeleton columnsNumber={4} tasksPerColumn={[3, 2, 2, 2]} />;
  }

  return (
    <BoardContainer>
      <BoardHeaderSkeleton />
      <div className="flex-1" aria-hidden="true" />
    </BoardContainer>
  );
}
