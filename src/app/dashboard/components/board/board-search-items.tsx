"use client";

import { CommandItem } from "@/components/ui/command";
import PriorityIndicator from "../task/priority-indicator";
import type { TaskSearchResult } from "@/lib/types";
import type { BoardWithStats } from "@/lib/types/stores/board";
import { getBoardIdentity } from "@/lib/utils/board-identity";
import columnStatusOptions from "../../data/column-status-options";

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
      className={`${identity.className} ${size} flex shrink-0 items-center justify-center rounded-[3px] text-[10px] leading-none font-semibold`}
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
  return (
    <CommandItem
      value={`board-${board.id}`}
      onSelect={() => onSelect(board)}
      className="hover:bg-accent hover:text-accent-foreground data-[selected=true]:!bg-accent data-[selected=true]:!text-accent-foreground flex min-w-0 items-center gap-3 px-3 py-3"
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
      className="hover:bg-accent hover:text-accent-foreground data-[selected=true]:!bg-accent data-[selected=true]:!text-accent-foreground flex min-w-0 items-center gap-3 px-3 py-3"
    >
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{task.title}</p>
        {task.description && (
          <p className="text-muted-foreground mt-0.5 truncate text-xs">
            {task.description}
          </p>
        )}
      </div>
      <div className="flex min-w-0 max-w-[42%] shrink-0 items-center gap-2 max-sm:flex-col max-sm:items-end max-sm:gap-1">
        {showBoard ? (
          <span className="text-muted-foreground inline-flex min-w-0 max-w-full items-center gap-1.5 text-xs">
            <BoardIdentityMarker
              title={task.board.title}
              id={task.board.id}
              size="size-4"
            />
            <span className="truncate">{task.board.title}</span>
          </span>
        ) : (
          <ColumnStatusMarker status={task.column.status} />
        )}
        <PriorityIndicator priority={task.priority} />
      </div>
    </CommandItem>
  );
}
