"use client";

import clsx from "clsx";
import { ChevronsLeftRight, GripVertical } from "lucide-react";
import type {
  DraggableAttributes,
  DraggableSyntheticListeners,
} from "@dnd-kit/core";
import { CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { SimplifiedColumn } from "@/lib/types/stores/column";
import ColumnActions from "./column-actions";
import columnStatusOptions from "../data/column-status-options";

type ColumnHeaderProps = {
  tasksCount: number;
  column: SimplifiedColumn;
  dragHandleProps?: {
    attributes: DraggableAttributes;
    listeners: DraggableSyntheticListeners;
  };
  onQuickAdd: () => void;
  onToggleCollapse?: () => void;
};

export default function ColumnHeader({
  tasksCount,
  column,
  dragHandleProps,
  onQuickAdd,
  onToggleCollapse,
}: ColumnHeaderProps) {
  const { id: columnId, status: columnStatus } = column;

  const { icon: Icon, color } =
    columnStatusOptions[columnStatus as keyof typeof columnStatusOptions];

  return (
    <CardHeader className="bg-muted/30 dark:bg-muted/20 sticky top-0 z-5 flex flex-row items-center justify-between gap-2 border-b p-4 pb-3!">
      <CardTitle className="flex min-w-0 flex-1 items-center gap-2 text-sm text-ellipsis whitespace-nowrap">
        {dragHandleProps && (
          <button
            type="button"
            className="text-muted-foreground/50 hover:text-muted-foreground focus-visible:ring-ring relative -ml-2 flex size-7 touch-none items-center justify-center rounded outline-none after:absolute after:-inset-2 md:after:hidden focus-visible:ring-2 active:cursor-grabbing"
            aria-label="Drag to reorder column"
            {...dragHandleProps.attributes}
            {...dragHandleProps.listeners}
          >
            <GripVertical size={14} />
          </button>
        )}
        <span className="relative flex min-w-0 flex-1 items-center gap-2">
          <span className="relative flex size-4 shrink-0 items-center justify-center">
            <Icon size={16} color={color} aria-hidden="true" />
            <span
              aria-hidden="true"
              className="bg-current absolute -bottom-1 left-1/2 h-px w-3.5 -translate-x-1/2 rounded-full"
              style={{ color }}
            />
          </span>
          <span
            className={clsx(
              "min-w-0 truncate",
              columnStatus.length > 21 && "max-w-[152px]",
            )}
            title={columnStatus.length > 21 ? columnStatus : ""}
          >
            {columnStatus}
          </span>
        <Badge
          variant="outline"
          className="h-5 shrink-0 rounded-md px-[7px] text-[0.690rem] tabular-nums"
          aria-label={`${tasksCount} ${tasksCount === 1 ? "task" : "tasks"}`}
        >
          {tasksCount}
        </Badge>
        </span>
      </CardTitle>
      <div className="flex items-center gap-0.5 shrink-0">
        {onToggleCollapse && (
          <Button
            variant="ghost"
            size="icon"
            className="size-8 text-muted-foreground/70 hover:text-foreground"
            onClick={onToggleCollapse}
            title="Collapse column"
            aria-label="Collapse column"
          >
            <ChevronsLeftRight className="size-4" />
          </Button>
        )}
        <ColumnActions
          columnId={columnId}
          columnStatus={columnStatus}
          onQuickAdd={onQuickAdd}
          onToggleCollapse={onToggleCollapse}
        />
      </div>
    </CardHeader>
  );
}
