"use client";

import { Plus } from "lucide-react";
import type { BoardSummary } from "@/lib/types";
import { getBoardIdentity } from "@/lib/utils/board-identity";
import BoardActions from "./board-actions";
import { TaskPriorityFilter } from "../task/tasks-filter";
import { BoardSearch } from "./board-search";
import TaskModal from "../task/task-modal";
import { Button } from "@/components/ui/button";
import type { PriorityFilterValue } from "@/lib/types/stores/task";

type BoardHeaderProps = {
  board: BoardSummary;
  priorityFilter: PriorityFilterValue;
  onPriorityFilterChange: (value: PriorityFilterValue) => void;
  isPriorityFilterPending?: boolean;
};

const BoardHeader = ({
  board,
  priorityFilter,
  onPriorityFilterChange,
  isPriorityFilterPending = false,
}: BoardHeaderProps) => {
  const identity = getBoardIdentity(board.title, board.id);

  return (
    <section className="border-border/50 bg-background/95 supports-backdrop-filter:bg-background/60 mb-4 shrink-0 border-b backdrop-blur">
      <div className="flex flex-col gap-4 p-4 sm:p-5 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex min-h-14 min-w-0 items-start gap-3 xl:flex-1">
          <div className="flex min-w-0 flex-1 items-start gap-3">
            <span
              className={`${identity.className} mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-lg text-base font-semibold`}
              aria-hidden="true"
            >
              {identity.initial}
            </span>
            <div className="min-w-0 pt-0.5">
              <h1 className="max-w-full truncate text-xl leading-tight font-semibold capitalize md:text-2xl">
                {board.title?.replace(/-/g, " ")}
              </h1>
              {board.description && (
                <p
                  className="text-muted-foreground mt-1 max-w-full truncate text-sm"
                  title={board.description}
                >
                  {board.description}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="grid shrink-0 grid-cols-[1fr_auto] items-center justify-between gap-2 sm:flex sm:gap-2.5 xl:ml-auto xl:gap-3">
          <div className="flex min-w-0 items-center gap-2 sm:contents">
            <TaskPriorityFilter
              value={priorityFilter}
              onValueChange={onPriorityFilterChange}
              isPending={isPriorityFilterPending}
              mobileCompact
            />
            <BoardSearch boardId={board.id} enableShortcut mobileCompact />
            {board.id && (
              <TaskModal
                mode="create"
                boardId={board.id}
                trigger={
                  <Button
                    className="max-[639px]:size-9 max-[639px]:shrink-0 max-[639px]:gap-0 max-[639px]:p-0"
                    aria-label="Add task"
                  >
                    <Plus size={16} />
                    <span className="max-[639px]:hidden">Add task</span>
                  </Button>
                }
              />
            )}
          </div>
          <div className="shrink-0">
            <BoardActions board={board} />
          </div>
        </div>
      </div>
    </section>
  );
};

export default BoardHeader;
