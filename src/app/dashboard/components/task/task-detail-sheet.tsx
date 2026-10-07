"use client";

import { useMemo, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useShallow } from "zustand/react/shallow";
import type { ClientTask } from "@/lib/types";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetClose,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
  CalendarDays,
  Check,
  CheckCircle2,
  Copy,
  FileText,
  Pencil,
  Trash2,
  ArrowRightLeft,
  MoreHorizontal,
  X,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";
import AlertConfirmation from "@/components/ui/alert-confirmation";
import PriorityIndicator from "./priority-indicator";
import TaskColumnAge from "./task-column-age";
import RichDescription from "./rich-description";
import { useTaskStore } from "@/stores/task";
import useBoardStore from "@/stores/board";
import { useColumnStore } from "@/stores/column";
import useLoadingStore from "@/stores/loading";
import columnStatusOptions from "../../data/column-status-options";
import { formatDate } from "@/lib/utils/format-date";
import { deleteTaskAction, updateTaskPositionAction } from "@/actions/task";
import handleOnError from "@/utils/handle-on-error";

type TaskDetailSheetProps = {
  task: ClientTask;
  columnId?: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: () => void;
  isCompleted?: boolean;
};

export default function TaskDetailSheet({
  task,
  columnId,
  open,
  onOpenChange,
  onEdit,
  isCompleted = false,
}: TaskDetailSheetProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [copied, setCopied] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Subscribe to live task updates in store
  const liveTask = useTaskStore((state) => state.tasks[task.id]) ?? task;
  const currentColumnId = liveTask.columnId || columnId;

  const boardId = useBoardStore((state) => state.activeBoardId);
  const columns = useColumnStore(
    useShallow((state) =>
      boardId ? (state.columnsByBoard[boardId] ?? {}) : {},
    ),
  );

  const currentColumn = currentColumnId ? columns[currentColumnId] : null;
  const currentStatus = currentColumn?.status;
  const statusConfig = currentStatus
    ? columnStatusOptions[currentStatus as keyof typeof columnStatusOptions]
    : null;
  const StatusIcon = statusConfig?.icon;

  const availableDestinations = useMemo(() => {
    return Object.values(columns)
      .filter((col) => col.id !== currentColumnId)
      .sort((a, b) => a.order - b.order);
  }, [columns, currentColumnId]);

  const deleteTask = useTaskStore((state) => state.deleteTask);

  const { isDeleting, isUpdating, setIsLoading } = useLoadingStore(
    useShallow((state) => ({
      isDeleting: state.isLoading("task", "deleting", liveTask.id),
      isUpdating: state.isLoading("task", "updating", liveTask.id),
      setIsLoading: state.setIsLoading,
    })),
  );

  const handleCopyDescription = async () => {
    if (!liveTask.description) return;
    try {
      await navigator.clipboard.writeText(liveTask.description);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  const handleDelete = async () => {
    if (isDeleting || isUpdating || !currentColumnId) return;
    setIsLoading("task", "deleting", true, liveTask.id);

    try {
      const result = await deleteTaskAction(liveTask.id);
      if (!result.success) {
        handleOnError(result.message, "Failed to delete task");
        setConfirmDelete(false);
      } else {
        deleteTask(currentColumnId, liveTask.id);
        setConfirmDelete(false);
        onOpenChange(false);
      }
    } catch (error) {
      handleOnError(error, "Failed to delete task");
      setConfirmDelete(false);
    } finally {
      setIsLoading("task", "deleting", false, liveTask.id);
    }
  };

  const handleMove = async (destinationId: string) => {
    if (isUpdating || isDeleting || !currentColumnId) return;
    setIsLoading("task", "updating", true, liveTask.id);
    const store = useTaskStore.getState();

    try {
      const result = await updateTaskPositionAction(
        liveTask.id,
        destinationId,
        null,
        null,
      );
      if (!result.success) {
        handleOnError(result.message, "Failed to move task");
        return;
      }
      if (useBoardStore.getState().activeBoardId === boardId) {
        const destinationHasMore = Boolean(
          store.columnPages[destinationId]?.nextCursor,
        );
        store.moveTaskBetweenColumns(
          liveTask.id,
          currentColumnId,
          destinationId,
          undefined,
          !destinationHasMore,
        );
        if (result.fields) store.updateTask(liveTask.id, result.fields);
      }
    } catch (error) {
      handleOnError(error, "Failed to move task");
    } finally {
      setIsLoading("task", "updating", false, liveTask.id);
    }
  };

  const removeFocusQueryParam = () => {
    const params = new URLSearchParams(searchParams.toString());
    if (params.has("focus")) {
      params.delete("focus");
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, {
        scroll: false,
      });
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      removeFocusQueryParam();
    }
    onOpenChange(isOpen);
  };

  const handleEdit = () => {
    removeFocusQueryParam();
    onEdit();
  };

  return (
    <>
      <Sheet open={open} onOpenChange={handleOpenChange}>
        <SheetContent
          side="right"
          hideClose
          className="border-border bg-background flex h-full max-h-dvh w-full flex-col gap-0 overflow-hidden border-s p-0 shadow-2xl sm:max-w-lg md:max-w-xl lg:max-w-2xl"
        >
          {/* Top Bar with actions */}
          <SheetHeader className="border-border/80 shrink-0 border-b px-4 py-2.5 sm:px-6">
            <div className="flex items-center justify-between gap-3">
              {/* Left: Close button and section title */}
              <div className="flex items-center gap-2">
                <SheetClose asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-foreground size-8"
                    title="Close"
                  >
                    <X className="size-4" />
                    <span className="sr-only">Close</span>
                  </Button>
                </SheetClose>
                <span className="text-border/80 select-none" aria-hidden="true">
                  |
                </span>
                <span className="text-muted-foreground text-xs font-medium tracking-wide">
                  Task Details
                </span>
              </div>

              {/* Actions: Edit and More options (...) */}
              <div className="flex items-center gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 gap-1.5 px-3 text-xs font-medium shadow-2xs"
                  onClick={handleEdit}
                  title="Edit task details"
                >
                  <Pencil size={13} aria-hidden="true" />
                  <span>Edit</span>
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-foreground size-8"
                      title="More actions"
                    >
                      <MoreHorizontal size={16} aria-hidden="true" />
                      <span className="sr-only">More actions</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    {availableDestinations.length > 0 && (
                      <DropdownMenuSub>
                        <DropdownMenuSubTrigger className="gap-2 text-xs">
                          <ArrowRightLeft
                            size={14}
                            className="text-muted-foreground"
                            aria-hidden="true"
                          />
                          <span>Move to column</span>
                        </DropdownMenuSubTrigger>
                        <DropdownMenuSubContent className="w-44">
                          {availableDestinations.map((col) => {
                            const opt =
                              columnStatusOptions[
                                col.status as keyof typeof columnStatusOptions
                              ];
                            const OptIcon = opt?.icon;
                            return (
                              <DropdownMenuItem
                                key={col.id}
                                className="gap-2 text-xs"
                                onClick={() => void handleMove(col.id)}
                                disabled={isUpdating}
                              >
                                {OptIcon && (
                                  <OptIcon
                                    size={14}
                                    style={{ color: opt?.color }}
                                    aria-hidden="true"
                                  />
                                )}
                                <span>{col.status}</span>
                              </DropdownMenuItem>
                            );
                          })}
                        </DropdownMenuSubContent>
                      </DropdownMenuSub>
                    )}

                    {availableDestinations.length > 0 && (
                      <DropdownMenuSeparator />
                    )}

                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer gap-2 text-xs"
                      onClick={() => setConfirmDelete(true)}
                      disabled={isDeleting}
                    >
                      <Trash2 size={14} aria-hidden="true" />
                      <span>Delete task</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Hidden sheet title and description for screen-readers */}
            <SheetTitle className="sr-only">{liveTask.title}</SheetTitle>
            <SheetDescription className="sr-only">
              Task details and full description view
            </SheetDescription>
          </SheetHeader>

          {/* Scrollable Main Reading Body */}
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-6 sm:px-6">
            <div className="max-w-none space-y-6">
              {/* Badges for status and priority */}
              <div className="flex flex-wrap items-center gap-2">
                {currentStatus && (
                  <div className="border-border/80 bg-muted/60 text-foreground inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium">
                    {StatusIcon && (
                      <StatusIcon
                        size={13}
                        style={{ color: statusConfig?.color }}
                        aria-hidden="true"
                      />
                    )}
                    <span>{currentStatus}</span>
                  </div>
                )}
                <div className="border-border/80 bg-muted/60 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium">
                  <PriorityIndicator
                    priority={liveTask.priority}
                    showLabel
                    iconSize={13}
                  />
                </div>
              </div>

              {/* Task Title & Metadata */}
              <div className="space-y-2.5">
                <h2
                  dir="auto"
                  className={`text-foreground text-xl leading-snug font-bold tracking-tight select-text sm:text-2xl ${
                    isCompleted
                      ? "text-muted-foreground decoration-muted-foreground/50 line-through"
                      : ""
                  }`}
                >
                  {isCompleted && (
                    <CheckCircle2
                      className="mr-2 inline-flex size-5 translate-y-0.5 text-emerald-500 dark:text-emerald-400"
                      aria-hidden="true"
                    />
                  )}
                  {liveTask.title}
                </h2>

                {/* Metadata Row */}
                <div className="text-muted-foreground flex flex-wrap items-center gap-4 text-xs">
                  {liveTask.createdAt && (
                    <span
                      className="inline-flex items-center gap-1.5"
                      title={formatDate(liveTask.createdAt)}
                    >
                      <CalendarDays className="size-3.5" aria-hidden="true" />
                      <span>Created {formatDate(liveTask.createdAt)}</span>
                    </span>
                  )}
                  {liveTask.columnEnteredAt && (
                    <TaskColumnAge
                      columnEnteredAt={liveTask.columnEnteredAt}
                      compact={false}
                      className="text-xs"
                    />
                  )}
                </div>
              </div>

              {/* Divider */}
              <div className="border-border/60 border-t" />

              {/* Description & Study Notes Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText
                      className="text-primary size-4"
                      aria-hidden="true"
                    />
                    <h3 className="text-foreground text-sm font-semibold">
                      Description &amp; Study Notes
                    </h3>
                  </div>

                  {liveTask.description && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground hover:text-foreground h-7 gap-1 px-2 text-xs"
                      onClick={handleCopyDescription}
                      title="Copy description"
                    >
                      {copied ? (
                        <>
                          <Check className="size-3.5 text-emerald-500" />
                          <span className="text-[11px] text-emerald-500">
                            Copied
                          </span>
                        </>
                      ) : (
                        <>
                          <Copy className="size-3.5" />
                          <span className="text-[11px]">Copy</span>
                        </>
                      )}
                    </Button>
                  )}
                </div>

                {liveTask.description ? (
                  <div className="border-border/70 bg-card/40 rounded-xl border p-4 sm:p-5">
                    <RichDescription content={liveTask.description} />
                  </div>
                ) : (
                  <div className="border-border/70 bg-card/30 rounded-xl border border-dashed py-8 text-center sm:py-10">
                    <p className="text-muted-foreground text-sm">
                      No description or notes added for this task yet.
                    </p>
                    <Button
                      variant="link"
                      size="sm"
                      onClick={onEdit}
                      className="text-primary mt-2 text-xs"
                    >
                      + Add a description or study notes
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation Alert */}
      <AlertConfirmation
        open={confirmDelete}
        setOpen={setConfirmDelete}
        title="Delete task"
        description={`Permanently delete "${liveTask.title}"? This action cannot be undone.`}
        confirmLabel="Delete task"
        isPending={isDeleting}
        onClick={handleDelete}
      />
    </>
  );
}
