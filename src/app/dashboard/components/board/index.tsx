"use client";

import { useEffect, useState } from "react";
import { useInitializeBoardData } from "@/hooks/use-initialize-board";
import type { SimplifiedBoard } from "@/lib/types/stores/board";
import type { SimplifiedColumn } from "@/lib/types/stores/column";
import type { ClientTask } from "@/lib/types";
import type { PriorityFilterValue } from "@/lib/types/stores/task";
import { useTaskStore } from "@/stores/task";
import { cn } from "@/lib/utils";
import BoardHeader from "./board-header";
import ColumnsWrapper from "../column";
import BoardContainer from "./board-container";
import TaskModal from "../task/task-modal";

type BoardLayoutProps = {
  initialBoard: SimplifiedBoard & {
    columns: (SimplifiedColumn & {
      tasks: ClientTask[];
      totalCount: number;
      nextCursor: string | null;
    })[];
  };
  linkedTask?: ClientTask | null;
  focusedTaskId?: string;
  animateEntry?: boolean;
  clearEntryQuery?: boolean;
  renderContainer?: boolean;
};

export default function BoardLayout({
  initialBoard,
  linkedTask,
  focusedTaskId,
  animateEntry = false,
  clearEntryQuery = false,
  renderContainer = true,
}: BoardLayoutProps) {
  const { hasInitializedTaskPages } = useInitializeBoardData(initialBoard);
  const [isLinkedTaskOpen, setIsLinkedTaskOpen] = useState(Boolean(linkedTask));
  const [priorityFilter, setPriorityFilter] =
    useState<PriorityFilterValue>("all");
  const isPriorityFilterPending = useTaskStore((state) => {
    if (!hasInitializedTaskPages || state.activeBoardId !== initialBoard.id)
      return false;

    return initialBoard.columns.some((column) => {
      const page = state.columnPages[column.id];
      return !page || page.filter !== priorityFilter || page.isLoading;
    });
  });

  useEffect(() => {
    if (animateEntry || clearEntryQuery)
      window.history.replaceState(null, "", window.location.pathname);
  }, [animateEntry, clearEntryQuery]);

  const boardContent = (
    <>
      <BoardHeader
        board={initialBoard}
        priorityFilter={priorityFilter}
        onPriorityFilterChange={setPriorityFilter}
        isPriorityFilterPending={isPriorityFilterPending}
      />
      <ColumnsWrapper
        boardId={initialBoard.id}
        focusedTaskId={focusedTaskId}
        animateEntry={animateEntry}
        initialColumns={initialBoard.columns}
        priorityFilter={priorityFilter}
      />
      {linkedTask && initialBoard.id && (
        <TaskModal
          mode="edit"
          task={linkedTask}
          columnId={linkedTask.columnId}
          open={isLinkedTaskOpen}
          onOpenChange={setIsLinkedTaskOpen}
        />
      )}
    </>
  );

  if (renderContainer) {
    return <BoardContainer>{boardContent}</BoardContainer>;
  }

  return (
    <div
      className={cn(
        "flex h-full min-h-0 min-w-0 flex-1 flex-col",
        animateEntry &&
          "animate-in fade-in-0 duration-300 ease-out motion-reduce:animate-none",
      )}
    >
      {boardContent}
    </div>
  );
}
