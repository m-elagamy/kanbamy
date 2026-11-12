"use client";

import { useSearchParams } from "next/navigation";
import BoardHeaderSkeleton from "@/components/workspace/board/board-header-skeleton";
import DemoBoardLoadingContent from "@/components/demo/demo-board-loading-content";

export default function DemoLoading() {
  const searchParams = useSearchParams();

  if (searchParams.get("new") !== "1" && searchParams.get("created") !== "1") {
    return <DemoBoardLoadingContent />;
  }

  return (
    <>
      <BoardHeaderSkeleton />
      <div className="flex-1" aria-hidden="true" />
    </>
  );
}
