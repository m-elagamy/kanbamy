"use client";

import { CornerDownLeft } from "lucide-react";
import { CommandItem } from "@/components/ui/command";
import { Skeleton } from "@/components/ui/skeleton";
import PrioritySelector from "../task/priority-selector";
import type { TaskSearchResult } from "@/lib/types";
import type { BoardWithStats } from "@/lib/types/stores/board";
import { getBoardIdentity } from "@/lib/utils/board-identity";
import columnStatusOptions from "../data/column-status-options";

export function BoardIdentityMarker({
  title,
  id,
  size = "size-5",
}: {
  title: string;
  id: string;
  size?: "size-4" | "size-5";
}) {
  const identity = getBoardIdentity(title, id);

  return (
    <span
      className={`${identity.className} ${size} flex shrink-0 items-center justify-center rounded-[3px] text-[0.625rem] leading-none font-semibold`}
      aria-hidden="true"
    >
      {identity.initial}
    </span>
  );
}

export function BoardSearchResultItem({
  board,
  onSelect,
}: {
  board: BoardWithStats;
  onSelect: (board: BoardWithStats) => void;
}) {
  const openTasksCount = board._count?.openTasks ?? 0;

  return (
    <CommandItem
      value={`board-${board.id}`}
      onSelect={() => onSelect(board)}
      className="group hover:bg-accent hover:text-accent-foreground data-[selected=true]:!bg-accent data-[selected=true]:!text-accent-foreground flex min-w-0 cursor-pointer items-center gap-3 px-3 py-2.5"
    >
      <BoardIdentityMarker title={board.title} id={board.id} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{board.title}</p>
        {board.description && (
          <p className="text-muted-foreground mt-0.5 truncate text-xs">
            {board.description}
          </p>
        )}
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <span className="text-muted-foreground text-xs tabular-nums">
          {openTasksCount} open
        </span>
        <CornerDownLeft
          className="text-muted-foreground/70 hidden size-3.5 shrink-0 opacity-0 transition-opacity group-data-[selected=true]:opacity-100 sm:block"
          aria-hidden="true"
        />
      </div>
    </CommandItem>
  );
}

function ColumnStatusMarker({ status }: { status: string }) {
  const option =
    columnStatusOptions[status as keyof typeof columnStatusOptions];

  if (!option) {
    return (
      <span className="text-muted-foreground max-w-full truncate text-xs">
        {status}
      </span>
    );
  }

  const StatusIcon = option.icon;

  return (
    <span className="text-muted-foreground inline-flex min-w-0 max-w-full items-center gap-1.5 text-xs">
      <StatusIcon
        className="size-3.5 shrink-0"
        color={option.color}
        aria-hidden="true"
      />
      <span className="truncate">{status}</span>
    </span>
  );
}

export function TaskSearchResultItem({
  task,
  onSelect,
  showBoard,
}: {
  task: TaskSearchResult;
  onSelect: (task: TaskSearchResult) => void;
  showBoard: boolean;
}) {
  return (
    <CommandItem
      value={task.id}
      onSelect={() => onSelect(task)}
      className="group hover:bg-accent hover:text-accent-foreground data-[selected=true]:!bg-accent data-[selected=true]:!text-accent-foreground flex min-w-0 cursor-pointer items-center gap-3 px-3 py-2.5"
    >
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{task.title}</p>
        {(showBoard || task.description) && (
          <div className="text-muted-foreground mt-0.5 flex min-w-0 items-center gap-2 text-xs">
            {showBoard && (
              <span className="inline-flex min-w-0 shrink-0 items-center gap-1.5">
                <BoardIdentityMarker
                  title={task.board.title}
                  id={task.board.id}
                  size="size-4"
                />
                <span className="max-w-32 truncate">{task.board.title}</span>
              </span>
            )}
            {showBoard && task.description && (
              <span aria-hidden="true" className="text-muted-foreground/50">
                ·
              </span>
            )}
            {task.description && (
              <p className="min-w-0 truncate">{task.description}</p>
            )}
          </div>
        )}
      </div>
      <div className="flex min-w-0 shrink-0 items-center gap-2">
        <ColumnStatusMarker status={task.column.status} />
        <PrioritySelector priority={task.priority} showLabel={false} />
        <CornerDownLeft
          className="text-muted-foreground/70 hidden size-3.5 shrink-0 opacity-0 transition-opacity group-data-[selected=true]:opacity-100 sm:block"
          aria-hidden="true"
        />
      </div>
    </CommandItem>
  );
}

export function BoardSearchResultsSkeleton({
  isBoardTab,
  scope,
}: {
  isBoardTab: boolean;
  scope: "board" | "workspace";
}) {
  return (
    <div
      className="p-2"
      aria-label={`Searching ${isBoardTab ? "boards" : "tasks"}`}
    >
      <Skeleton className="mx-2 my-1.5 h-3 w-12" />
      {[0, 1, 2, 3].map((item) =>
        isBoardTab ? (
          <div
            key={item}
            className="flex items-center gap-3 rounded-sm px-3 py-2.5"
          >
            <Skeleton className="size-5 shrink-0 rounded-[3px]" />
            <div className="min-w-0 flex-1 space-y-1.5">
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-3 w-2/3" />
            </div>
            <Skeleton className="h-3.5 w-12 shrink-0" />
          </div>
        ) : (
          <div
            key={item}
            className="flex items-center gap-3 rounded-sm px-3 py-2.5"
          >
            <div className="min-w-0 flex-1 space-y-1.5">
              <Skeleton className="h-4 w-3/5" />
              <div className="flex items-center gap-1.5">
                {scope === "workspace" && (
                  <Skeleton className="size-4 shrink-0 rounded-[3px]" />
                )}
                <Skeleton className="h-3 w-28" />
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <Skeleton className="h-3.5 w-16" />
              <Skeleton className="size-4 rounded-sm" />
            </div>
          </div>
        ),
      )}
    </div>
  );
}
