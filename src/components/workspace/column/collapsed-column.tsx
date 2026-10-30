"use client";

import type { CSSProperties } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { useDndContext } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronsRightLeft, GripVertical } from "lucide-react";
import type { SimplifiedColumn } from "@/lib/types/stores/column";
import columnStatusOptions from "../data/column-status-options";

interface CollapsedColumnProps {
  column: SimplifiedColumn;
  tasksCount: number;
  onExpand: () => void;
  disabledDrag?: boolean;
}

export default function CollapsedColumn({
  column,
  tasksCount,
  onExpand,
  disabledDrag = false,
}: CollapsedColumnProps) {
  const { id: columnId, status: columnStatus } = column;
  const statusMeta =
    columnStatusOptions[columnStatus as keyof typeof columnStatusOptions];
  const Icon = statusMeta?.icon;
  const color = statusMeta?.color;

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isOver,
    isDragging,
  } = useSortable({
    id: columnId,
    disabled: disabledDrag,
    data: { type: "column" },
  });

  const { active } = useDndContext();
  const isTaskDragActive =
    (active?.data.current as { type?: string } | undefined)?.type === "task";
  const isTaskColumnDropTarget = isOver && isTaskDragActive;

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <Card
      ref={setNodeRef}
      style={
        {
          ...style,
          "--column-drop-color": color ?? "var(--primary)",
        } as CSSProperties
      }
      className={`board-lane group/column border-border/80 hover:border-primary/25 relative flex h-full min-h-0 w-12 shrink-0 flex-col items-center justify-between rounded-lg border py-3 transition-[background-color,border-color,box-shadow,width] duration-200 select-none ${
        isOver && !isTaskColumnDropTarget
          ? "ring-primary/20 border-primary/40 bg-primary/3 shadow-md ring-2"
          : isTaskColumnDropTarget
            ? "board-lane-task-drop-target"
            : "bg-muted/10 hover:bg-muted/20"
      }`}
    >
      {/* Top: Drag handle + Expand button + Status Icon */}
      <div className="flex flex-col items-center gap-2">
        <button
          type="button"
          className="text-muted-foreground/40 hover:text-muted-foreground flex size-6 touch-none items-center justify-center rounded outline-none active:cursor-grabbing"
          aria-label="Drag to reorder column"
          {...attributes}
          {...listeners}
        >
          <GripVertical size={13} />
        </button>

        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:text-foreground size-7 rounded-md"
          onClick={onExpand}
          title={`Expand ${columnStatus}`}
          aria-label={`Expand ${columnStatus} column`}
        >
          <ChevronsRightLeft className="size-3.5" />
        </Button>

        {Icon && (
          <span
            className="flex size-5 items-center justify-center"
            title={columnStatus}
          >
            <Icon size={16} color={color} aria-hidden="true" />
          </span>
        )}
      </div>

      <button
        type="button"
        onClick={onExpand}
        className="text-muted-foreground hover:text-foreground flex flex-1 cursor-pointer items-center justify-center py-4 text-xs font-semibold tracking-wider uppercase transition-colors outline-none [writing-mode:vertical-rl] rotate-180"
        title={`Click to expand ${columnStatus}`}
      >
        <span className="truncate max-h-52">{columnStatus}</span>
      </button>

      {isTaskColumnDropTarget && (
        <div className="pointer-events-none absolute inset-x-1.5 top-1/2 z-20 flex -translate-y-1/2 justify-center">
          <span className="border-primary/30 bg-background/90 text-primary inline-flex items-center justify-center rounded-md border border-dashed px-1 py-1.5 text-[10px] font-medium shadow-sm backdrop-blur-sm [writing-mode:vertical-rl] rotate-180">
            Drop
          </span>
        </div>
      )}

      <div className="flex flex-col items-center">
        <Badge
          variant="outline"
          className="h-5 shrink-0 rounded-md px-1.5 text-[0.6875rem] tabular-nums"
          aria-label={`${tasksCount} ${tasksCount === 1 ? "task" : "tasks"}`}
        >
          {tasksCount}
        </Badge>
      </div>
    </Card>
  );
}
