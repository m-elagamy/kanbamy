"use client";

import { useEffect, useState } from "react";
import { notFound, usePathname } from "next/navigation";
import useActiveBoard from "@/hooks/use-active-board";
import { useBoardCreation } from "@/hooks/use-board-creation";
import BoardHeader from "./board-header";
import ColumnsWrapper from "../column";
import BoardContainer from "./board-container";
import BoardErrorCard from "@/components/ui/board-error-card";
import type { PriorityFilterValue } from "@/lib/types/stores/task";
import { useTaskStore } from "@/stores/task";
import { useColumnStore } from "@/stores/column";

export default function OptimisticBoardLayout() {
  const pathname = usePathname();
  const [priorityFilter, setPriorityFilter] =
    useState<PriorityFilterValue>("all");
  const { activeBoard } = useActiveBoard();
  const boardColumnIds = useColumnStore((state) =>
    activeBoard?.id
      ? Object.keys(state.columnsByBoard[activeBoard.id] ?? {})
      : [],
  );
  const isPriorityFilterPending = useTaskStore((state) =>
    boardColumnIds.length > 0 &&
    boardColumnIds.some((columnId) => {
      const page = state.columnPages[columnId];
      return !page || page.filter !== priorityFilter || page.isLoading;
    }),
  );
  const {
    hasError,
    errorDetails,
    isCreating,
    retryBoardCreation,
    navigateToDashboard,
  } = useBoardCreation();

  useEffect(() => {
    window.history.replaceState(null, "", pathname);
  }, [pathname]);

  if (hasError) {
    return (
      <BoardErrorCard
        onRetry={retryBoardCreation}
        onBack={navigateToDashboard}
        isPending={isCreating}
        debugMessage={errorDetails}
      />
    );
  }

  if (!activeBoard?.id) notFound();

  return (
    <BoardContainer>
      <BoardHeader
        board={activeBoard}
        priorityFilter={priorityFilter}
        onPriorityFilterChange={setPriorityFilter}
        isPriorityFilterPending={isPriorityFilterPending}
      />
      <ColumnsWrapper
        boardId={activeBoard.id}
        priorityFilter={priorityFilter}
      />
    </BoardContainer>
  );
}
