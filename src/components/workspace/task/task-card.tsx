"use client";

import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useSortable } from "@dnd-kit/sortable";
import { useDndContext } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import type { ClientTask } from "@/lib/types";
import dynamic from "next/dynamic";
import TaskActions from "./task-actions";
import useLoadingStore from "@/stores/loading";
import TaskModal from "./task-modal";
import PrioritySelector from "./priority-selector";
import TagBadge from "./tag-badge";
import { cn } from "@/lib/utils";
import { getTaskTagOption } from "../data/task-tags";

const TaskDetailSheet = dynamic(() => import("./task-details-sheet"), {
  ssr: false,
});
import TaskColumnAge from "./task-column-age";
import {
  ArrowUpRight,
  Check,
  CheckCircle2,
  GripVertical,
} from "lucide-react";
import { DndTaskMoveSuccessContext } from "@/providers/dnd-provider";

type TaskCardProps = {
  task: ClientTask;
  columnId?: string | null;
  isDragging?: boolean;
  isFocused?: boolean;
  showColumnAge?: boolean;
  isCompleted?: boolean;
  activeTags?: string[];
  onTagClick?: (tag: string) => void;
};

const getPriorityBorderClass = (priority: string) => {
  const classes = {
    high: "border-s-2 border-s-destructive/70 hover:border-s-destructive/90",
    medium: "border-s-2 border-s-amber-500/60 hover:border-s-amber-500/80",
    low: "border-s-2 border-s-sky-400/55 hover:border-s-sky-400/75",
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
  activeTags,
  onTagClick,
}: TaskCardProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [isHighlightDismissed, setIsHighlightDismissed] = useState(false);
  const [lastFocusedTaskId, setLastFocusedTaskId] = useState<string | null>(
    isFocused ? task.id : null,
  );

  if (isFocused && lastFocusedTaskId !== task.id) {
    setLastFocusedTaskId(task.id);
    setIsHighlightDismissed(false);
  } else if (!isFocused && lastFocusedTaskId !== null) {
    setLastFocusedTaskId(null);
    setIsHighlightDismissed(false);
  }

  const showFocus = isFocused && !isHighlightDismissed;
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
    const params = new URLSearchParams(searchParams.toString());
    params.set("focus", task.id);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
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
    transition:
      isDndTransitioning && smoothSortableTransition
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

    setHasDetailMounted(true);
    setIsDetailOpen(true);
    cardRef.current.scrollIntoView({
      behavior: "smooth",
      block: "center",
      inline: "center",
    });

    const timeout = window.setTimeout(() => {
      setIsHighlightDismissed(true);
    }, 3000);

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
      setIsHighlightDismissed(true);
      const params = new URLSearchParams(searchParams.toString());
      if (params.has("focus")) {
        params.delete("focus");
        const query = params.toString();
        router.replace(query ? `${pathname}?${query}` : pathname, {
          scroll: false,
        });
      }
      window.setTimeout(() => {
        setHasDetailMounted(false);
      }, 350);
    }
  };

  const handleEditFromDetail = () => {
    setIsDetailOpen(false);
    setIsHighlightDismissed(true);
    setIsEditOpen(true);
    const params = new URLSearchParams(searchParams.toString());
    if (params.has("focus")) {
      params.delete("focus");
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, {
        scroll: false,
      });
    }
    window.setTimeout(() => {
      setHasDetailMounted(false);
    }, 350);
  };

  const isCardActive = isDetailOpen || showFocus;

  return (
    <>
      <div
        className={cn(
          "group/task relative touch-manipulation rounded-lg border px-3 py-2 shadow-xs outline-none cursor-pointer",
          "border-border/80 bg-card",
          getPriorityBorderClass(task.priority),
          "transition-[background-color,border-color,box-shadow,transform] duration-200 ease-out",
          "hover:-translate-y-0.5 hover:border-primary/45 hover:bg-accent/25 hover:shadow-md hover:shadow-black/5 dark:hover:shadow-black/30",
          "focus-visible:ring-2 focus-visible:ring-ring",
          isSortableDragging && "border-dashed border-primary/40 bg-primary/[0.04]",
          isDragging &&
            "z-50 scale-[1.02] cursor-grabbing border-primary/50 bg-card ring-2 ring-primary/20 shadow-xl",
          isDropTarget &&
            "border-primary/45 bg-primary/[0.03] ring-1 ring-primary/20 after:absolute after:-top-2 after:right-3 after:left-3 after:h-px after:rounded-full after:bg-primary/60",
          isCardActive &&
            "z-10 -translate-y-0.5 border-primary/80 ring-1 ring-primary/40 ring-offset-1 ring-offset-background bg-primary/[0.03] dark:bg-primary/[0.06] shadow-md shadow-primary/10",
        )}
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
                data-no-overlay
                className="text-muted-foreground/30 group-hover/task:text-muted-foreground/70 hover:text-foreground focus-visible:ring-ring mt-0.5 flex size-6 shrink-0 cursor-grab touch-none items-center justify-center rounded transition-colors duration-200 outline-none focus-visible:ring-2 active:cursor-grabbing"
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
                  className={cn(
                    "text-sm leading-5 font-semibold transition-colors duration-150",
                    "group-hover/task:text-primary group-has-[[data-no-overlay]:hover]/task:text-foreground",
                    isCardActive && "text-primary font-bold",
                    isCompleted
                      ? "text-muted-foreground/90 decoration-muted-foreground/45 line-through"
                      : "text-foreground",
                    task.title.length > 30 && "line-clamp-2",
                  )}
                  title={task.title}
                >
                  {isCompleted && (
                    <CheckCircle2
                      className="mr-1 inline-flex size-4 translate-y-0.5 text-emerald-600/80 dark:text-emerald-400/80"
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
                data-no-overlay
                className="relative z-30 shrink-0 md:opacity-0 md:transition-opacity md:group-focus-within/task:opacity-100 md:group-hover/task:opacity-100"
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

          <div className="flex items-center justify-between gap-2 pt-0.5">
            <div className="flex min-w-0 flex-wrap items-center gap-1.5">
              <PrioritySelector
                priority={task.priority}
                showLabel={false}
                className="shrink-0"
              />
              {task.tags && task.tags.length > 0 && (
                <div className="flex flex-wrap items-center gap-1">
                  {task.tags.slice(0, 3).map((tag) => {
                    const isActive = activeTags?.includes(tag);
                    const label = getTaskTagOption(tag).label;

                    return onTagClick ? (
                      <button
                        key={tag}
                        type="button"
                        data-no-overlay
                        aria-pressed={isActive}
                        onClick={(e) => {
                          e.stopPropagation();
                          onTagClick(tag);
                        }}
                        className={cn(
                          "transition-all active:scale-95 cursor-pointer rounded-md",
                          isActive
                            ? "ring-1.5 ring-primary/70 ring-offset-1 ring-offset-background"
                            : "hover:opacity-80",
                        )}
                        title={
                          isActive
                            ? `Remove "${label}" filter`
                            : `Filter by "${label}"`
                        }
                      >
                        <TagBadge tag={tag} size="sm" />
                      </button>
                    ) : (
                      <TagBadge key={tag} tag={tag} size="sm" />
                    );
                  })}
                  {task.tags.length > 3 && (
                    <span className="text-muted-foreground px-0.5 text-[0.6875rem] font-medium">
                      +{task.tags.length - 3}
                    </span>
                  )}
                </div>
              )}
            </div>

            {showColumnAge && (
              <div className="text-muted-foreground shrink-0 text-xs">
                <TaskColumnAge columnEnteredAt={task.columnEnteredAt} />
              </div>
            )}
          </div>
        </div>

        {!isDragging && !isSortableDragging && !isCardActive && (
          <div className="bg-background/40 dark:bg-card/50 pointer-events-none absolute inset-0 z-20 flex items-center justify-center rounded-lg opacity-0 backdrop-blur-[1.5px] transition-all duration-200 group-hover/task:opacity-100 group-has-[[data-no-overlay]:hover]/task:opacity-0 group-has-[[data-no-overlay]:hover]/task:pointer-events-none">
            <span className="border-border/80 bg-background/95 dark:bg-card/95 text-foreground inline-flex scale-95 items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium shadow-lg shadow-black/10 transition-transform duration-200 ease-out group-hover/task:scale-100 group-has-[[data-no-overlay]:hover]/task:scale-95 dark:shadow-black/40">
              <span>View details</span>
              <ArrowUpRight size={13} className="text-primary" />
            </span>
          </div>
        )}
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
