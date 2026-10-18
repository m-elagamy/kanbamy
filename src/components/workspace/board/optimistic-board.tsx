"use client";

import { useEffect, useState } from "react";
import { notFound, usePathname, useRouter } from "next/navigation";
import useActiveBoard from "@/hooks/use-active-board";
import { useBoardCreation } from "@/hooks/use-board-creation";
import BoardHeader from "./board-header";
import ColumnsWrapper from "../column";
import BoardContainer from "./board-container";
import BoardErrorCard from "@/components/ui/board-error-card";
import {
  type BoardFilters,
  DEFAULT_BOARD_FILTERS,
  areBoardFiltersEqual,
} from "@/lib/types/stores/task";
import { useTaskStore } from "@/stores/task";
import { useColumnStore } from "@/stores/column";

export default function OptimisticBoardLayout() {
  const router = useRouter();
  const pathname = usePathname();
  const [filters, setFilters] = useState<BoardFilters>(DEFAULT_BOARD_FILTERS);
  const { activeBoard } = useActiveBoard();
  const boardColumnIds = useColumnStore((state) =>
    activeBoard?.id
      ? Object.keys(state.columnsByBoard[activeBoard.id] ?? {})
      : [],
  );
  const isFiltersPending = useTaskStore((state) =>
    boardColumnIds.length > 0 &&
    boardColumnIds.some((columnId) => {
      const page = state.columnPages[columnId];
      return !page || !areBoardFiltersEqual(page.filter, filters) || page.isLoading;
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
    router.replace(pathname, { scroll: false });
  }, [pathname, router]);

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
        filters={filters}
        onFiltersChange={setFilters}
        isFiltersPending={isFiltersPending}
      />
      <ColumnsWrapper
        boardId={activeBoard.id}
        filters={filters}
      />
    </BoardContainer>
  );
}
