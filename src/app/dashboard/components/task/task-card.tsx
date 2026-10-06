"use client";

import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { useDndContext } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import type { ClientTask } from "@/lib/types";
import dynamic from "next/dynamic";
import TaskActions from "./task-actions";
import useLoadingStore from "@/stores/loading";
import TaskModal from "./task-modal";
import PriorityIndicator from "./priority-indicator";

const TaskDetailSheet = dynamic(() => import("./task-detail-sheet"), {
  ssr: false,
});
import TaskColumnAge from "./task-column-age";
import { Check, CheckCircle2, GripVertical } from "lucide-react";
import { DndTaskMoveSuccessContext } from "@/providers/dnd-provider";

type TaskCardProps = {
  task: ClientTask;
  columnId?: string | null;
  isDragging?: boolean;
  isFocused?: boolean;
  showColumnAge?: boolean;
  isCompleted?: boolean;
};

const getPriorityBorderClass = (priority: string) => {
  const classes = {
    high: "border-s-2 border-s-destructive/70",
    medium: "border-s-2 border-s-amber-500/60",
    low: "border-s-2 border-s-sky-400/55",
  };

  return classes[priority as keyof typeof classes] ?? "border-s-border/70";
};

const TaskCard = ({
  task,
  columnId,
  isDragging = false,
  isFocused = false,
  showColumnAge = true,
  isCompleted = false,
}: TaskCardProps) => {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [showFocus, setShowFocus] = useState(isFocused);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [hasDetailMounted, setHasDetailMounted] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const isUpdating = useLoadingStore((state) =>
    state.isLoading("task", "updating"),
  );
  const recentlyMovedTaskId = useContext(DndTaskMoveSuccessContext);
  const showMoveSuccess = columnId && recentlyMovedTaskId === task.id;
  const openTask = () => {
    if (!columnId || isDragging) return;
    setHasDetailMounted(true);
    setIsDetailOpen(true);
  };
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
    isOver,
  } = useSortable({
    id: task.id,
    disabled: isUpdating,
    data: { type: "task" },
  });
  const { active } = useDndContext();
  const isActiveTask = active?.id === task.id;
  const isTaskDragActive =
    (active?.data.current as { type?: string } | undefined)?.type === "task";
  const isDropTarget = isTaskDragActive && isOver && !isActiveTask;
  const smoothSortableTransition = transition?.replace(
    /transform\s+[^,]+/,
    "transform 220ms cubic-bezier(0.22, 1, 0.36, 1)",
  );
  const isDndTransitioning = Boolean(
    transform || isSortableDragging || isTaskDragActive,
  );
  const style = {
    transform: isTaskDragActive ? undefined : CSS.Transform.toString(transform),
    transition: isDndTransitioning && smoothSortableTransition
      ? `${smoothSortableTransition}, background-color 180ms ease, border-color 180ms ease, box-shadow 220ms ease`
      : undefined,
    opacity: isSortableDragging ? "0.65" : "1",
    scale: isSortableDragging ? "0.98" : "1",
  };

  const setCardRef = useCallback(
    (node: HTMLDivElement | null) => {
      cardRef.current = node;
      setNodeRef(node);
    },
    [setNodeRef],
  );

  useEffect(() => {
    if (!isFocused || !cardRef.current) return;

    setShowFocus(true);
    setHasDetailMounted(true);
    setIsDetailOpen(true);
    cardRef.current.scrollIntoView({
      behavior: "smooth",
      block: "center",
      inline: "center",
    });

    const timeout = window.setTimeout(() => setShowFocus(false), 3000);
    return () => window.clearTimeout(timeout);
  }, [isFocused]);

  const handleCardKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      openTask();
      return;
    }

    listeners?.onKeyDown?.(event);
  };

  const handleDetailOpenChange = (open: boolean) => {
    setIsDetailOpen(open);
    if (!open) {
      if (typeof window !== "undefined") {
        const url = new URL(window.location.href);
        if (url.searchParams.has("focus")) {
          url.searchParams.delete("focus");
          const nextUrl = url.pathname + (url.search ? url.search : "");
          window.history.replaceState(window.history.state, "", nextUrl);
        }
      }
      window.setTimeout(() => {
        setHasDetailMounted(false);
      }, 350);
    }
  };

  const handleEditFromDetail = () => {
    setIsDetailOpen(false);
    setIsEditOpen(true);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      if (url.searchParams.has("focus")) {
        url.searchParams.delete("focus");
        const nextUrl = url.pathname + (url.search ? url.search : "");
        window.history.replaceState(window.history.state, "", nextUrl);
      }
    }
    window.setTimeout(() => {
      setHasDetailMounted(false);
    }, 350);
  };

  return (
    <>
      <div
        className={`group/task border-border/80 ${getPriorityBorderClass(task.priority)} bg-card hover:border-y-border hover:border-e-border hover:-translate-y-0.5 focus-visible:ring-ring relative touch-manipulation rounded-lg border px-3 py-2 shadow-xs transition-[background-color,border-color,box-shadow,transform] duration-400 ease-out outline-none hover:shadow-sm focus-visible:ring-2 ${isSortableDragging ? "border-primary/40 bg-primary/[0.04] border-dashed" : ""} ${isDragging ? "border-primary/50 bg-card ring-primary/20 z-50 scale-[1.02] cursor-grabbing shadow-xl ring-2" : "cursor-pointer"} ${isDropTarget ? "border-primary/45 bg-primary/[0.03] ring-primary/20 ring-1 after:bg-primary/60 after:absolute after:-top-2 after:right-3 after:left-3 after:h-px after:rounded-full" : ""} ${showFocus ? "border-primary/60 bg-primary/5 ring-primary/30 shadow-primary/10 dark:bg-primary/10 shadow-lg ring-2" : ""}`}
        ref={setCardRef}
        style={style}
        tabIndex={columnId ? 0 : -1}
        aria-label={
          columnId ? `${task.title}. Press Enter to open.` : undefined
        }
        onClick={openTask}
        onKeyDown={handleCardKeyDown}
      >
        <div className="relative z-10 space-y-1.5">
          <div className="flex items-start gap-2">
            {columnId && (
              <button
                type="button"
                className="text-muted-foreground/45 hover:text-muted-foreground focus-visible:ring-ring mt-0.5 flex size-6 shrink-0 cursor-grab touch-none items-center justify-center rounded outline-none transition-colors duration-200 focus-visible:ring-2 active:cursor-grabbing"
                aria-label="Drag task"
                onClick={(event) => event.stopPropagation()}
                {...attributes}
                {...listeners}
              >
                <GripVertical size={16} aria-hidden="true" />
              </button>
            )}
            <div className="min-w-0 flex-1 space-y-1">
              <div className="min-w-0">
                <h3
                  className={`text-sm leading-5 font-semibold ${isCompleted ? "text-muted-foreground/90 line-through decoration-muted-foreground/45" : "text-foreground"} ${task.title.length > 30 ? "line-clamp-2" : ""}`}
                  title={task.title}
                >
                  {isCompleted && (
                    <CheckCircle2
                      className="text-emerald-600/80 dark:text-emerald-400/80 mr-1 inline-flex size-4 translate-y-0.5"
                      aria-hidden="true"
                    />
                  )}
                  {task.title}
                {showMoveSuccess && !isCompleted && (
                  <span
                    className="task-move-success ml-1 inline-flex translate-y-0.5 text-emerald-600 dark:text-emerald-400"
                    aria-label="Task moved successfully"
                  >
                    <Check size={15} strokeWidth={2.5} aria-hidden="true" />
                  </span>
                )}
                </h3>
              </div>
              {task.description && (
                <p className="text-muted-foreground line-clamp-2 text-xs leading-4">
                  {task.description}
                </p>
              )}
            </div>
            {columnId && (
              <div
                className="shrink-0 md:opacity-0 md:transition-opacity md:group-focus-within/task:opacity-100 md:group-hover/task:opacity-100"
                onClick={(event) => event.stopPropagation()}
                onPointerDown={(event) => event.stopPropagation()}
                onKeyDown={(event) => event.stopPropagation()}
              >
              <TaskActions
                task={task}
                columnId={columnId}
                onViewDetails={() => {
                  setHasDetailMounted(true);
                  setIsDetailOpen(true);
                }}
                onEdit={() => setIsEditOpen(true)}
              />
              </div>
            )}
          </div>

          <div className="text-muted-foreground flex min-h-4 items-center gap-3 pr-6 text-xs">
            {showColumnAge && (
              <TaskColumnAge columnEnteredAt={task.columnEnteredAt} />
            )}
          </div>
        </div>
        <PriorityIndicator
          priority={task.priority}
          showLabel={false}
          className="absolute right-3 bottom-2"
        />
      </div>
      {columnId && hasDetailMounted && (
        <TaskDetailSheet
          task={task}
          columnId={columnId}
          open={isDetailOpen}
          onOpenChange={handleDetailOpenChange}
          onEdit={handleEditFromDetail}
          isCompleted={isCompleted}
        />
      )}
      {columnId && isEditOpen && (
        <TaskModal
          mode="edit"
          task={task}
          columnId={columnId}
          open={isEditOpen}
          onOpenChange={setIsEditOpen}
        />
      )}
    </>
  );
};

export default TaskCard;
