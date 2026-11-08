"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useShallow } from "zustand/react/shallow";
import type { ClientTask } from "@/lib/types";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import { cn } from "@/lib/utils";
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
  ChevronDown,
  Copy,
  Pencil,
  Trash2,
  AlignLeft,
  Link2,
  X,
  Loader2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import AlertConfirmation from "@/components/ui/alert-confirmation";
import PriorityIndicator from "./priority-indicator";
import TagBadge from "./tag-badge";
import TaskColumnAge from "./task-column-age";
import RichDescription from "./rich-description";
import MarkdownTextarea from "./markdown-textarea";
import TaskDevShortcuts from "./task-dev-shortcuts";
import { useTaskInlineDescription } from "@/hooks/use-task-inline-description";
import { useWritingImprovement } from "@/hooks/use-writing-improvement";
import { useTaskStore } from "@/stores/task";
import useBoardStore from "@/stores/board";
import { useColumnStore } from "@/stores/column";
import useLoadingStore from "@/stores/loading";
import columnStatusOptions from "../data/column-status-options";
import { TERMINAL_COLUMN_STATUSES } from "@/lib/constants";
import {
  formatFullCreatedDate,
  formatRelativeDate,
} from "@/lib/utils/format-date";
import {
  deleteTaskAction,
  updateTaskPositionAction,
} from "@/actions/task";
import handleOnError from "@/utils/handle-on-error";

type TaskDetailsSheetProps = {
  task: ClientTask;
  columnId?: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: () => void;
  isCompleted?: boolean;
};

export default function TaskDetailsSheet({
  task,
  columnId,
  open,
  onOpenChange,
  onEdit,
  isCompleted: initialIsCompleted = false,
}: TaskDetailsSheetProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { copied: copiedLink, copy: copyLink } = useCopyToClipboard({
    errorMessage: "Failed to copy link",
  });
  const { copied, copy: copyDescription } = useCopyToClipboard({
    errorMessage: "Failed to copy description",
  });
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Subscribe to live task updates in store
  const liveTask = useTaskStore((state) => state.tasks[task.id]) ?? task;
  const currentColumnId = liveTask.columnId || columnId;

  const {
    isEditing: isEditingDescription,
    value: descriptionDraft,
    isSaving: isSavingDescription,
    hasDescription,
    setValue: setDescriptionDraft,
    setIsEditing: setIsEditingDescription,
    startEditing: handleStartEditDescription,
    cancelEditing: handleCancelEditDescription,
    save: handleSaveDescription,
  } = useTaskInlineDescription({
    task: liveTask,
    columnId: currentColumnId,
  });

  const boardId = useBoardStore((state) => state.activeBoardId);
  const activeBoard = useBoardStore((state) =>
    boardId ? state.boards[boardId] : null,
  );
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

  const isCompleted = currentStatus
    ? currentStatus === "Done" || currentStatus === "Deployed"
    : initialIsCompleted;

  const isTerminalStatus = currentStatus
    ? TERMINAL_COLUMN_STATUSES.includes(currentStatus)
    : false;

  const deleteTask = useTaskStore((state) => state.deleteTask);

  const { isDeleting, isUpdating, setIsLoading } = useLoadingStore(
    useShallow((state) => ({
      isDeleting: state.isLoading("task", "deleting", liveTask.id),
      isUpdating: state.isLoading("task", "updating", liveTask.id),
      setIsLoading: state.setIsLoading,
    })),
  );

  const { isImprovingDescription, handleImproveDescription } =
    useWritingImprovement({
      scope: "task",
      title: liveTask.title,
      description: descriptionDraft,
      boardName: activeBoard?.title,
      boardDescription: activeBoard?.description ?? undefined,
      onApplyTitle: () => {},
      onApplyDescription: (newDesc) => setDescriptionDraft(newDesc),
    });

  const handleCopyLink = async () => {
    const url = new URL(window.location.href);
    url.searchParams.set("focus", liveTask.id);
    url.searchParams.delete("task");
    await copyLink(url.toString());
  };

  const handleCopyDescription = async () => {
    if (!liveTask.description) return;
    await copyDescription(liveTask.description);
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

  const removeFocusQueryParam = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (params.has("focus")) {
      params.delete("focus");
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, {
        scroll: false,
      });
    }
  }, [pathname, router, searchParams]);

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      removeFocusQueryParam();
      setIsEditingDescription(false);
    }
    onOpenChange(isOpen);
  };

  const handleEdit = useCallback(() => {
    removeFocusQueryParam();
    onEdit();
  }, [onEdit, removeFocusQueryParam]);

  // Keyboard shortcut: Press 'E' to edit task when sheet is open
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.isContentEditable
      ) {
        return;
      }

      if (event.key === "e" || event.key === "E") {
        event.preventDefault();
        handleEdit();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, handleEdit]);

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
              {/* Left: Close button */}
              <SheetClose asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-foreground size-8 shrink-0"
                  title="Close (Esc)"
                >
                  <X className="size-4" />
                  <span className="sr-only">Close</span>
                </Button>
              </SheetClose>

              {/* Actions: Copy link, Edit and More options (...) */}
              <div className="flex shrink-0 items-center gap-1.5">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-foreground size-8"
                  onClick={() => void handleCopyLink()}
                  title={copiedLink ? "Link copied" : "Copy task link"}
                  aria-label="Copy task link"
                >
                  {copiedLink ? (
                    <Check
                      size={15}
                      className="text-emerald-500"
                      aria-hidden="true"
                    />
                  ) : (
                    <Link2 size={15} aria-hidden="true" />
                  )}
                  <span className="sr-only">Copy task link</span>
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 gap-1.5 px-3 text-xs font-medium shadow-2xs"
                  onClick={handleEdit}
                  title="Edit task details (E)"
                >
                  <Pencil size={13} aria-hidden="true" />
                  <span>Edit</span>
                  <kbd className="bg-muted text-muted-foreground pointer-events-none hidden size-4 items-center justify-center rounded border font-mono text-[9px] leading-none select-none sm:inline-flex">
                    E
                  </kbd>
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 size-8 transition-colors cursor-pointer"
                  onClick={() => setConfirmDelete(true)}
                  disabled={isDeleting}
                  title="Delete task"
                  aria-label="Delete task"
                >
                  <Trash2 size={15} aria-hidden="true" />
                  <span className="sr-only">Delete task</span>
                </Button>
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
            <div className="max-w-none space-y-5">
              {/* Task Title First */}
              <div>
                <h2
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
              </div>

              {/* Interactive Properties Row (Status, Priority, Tags, and Stale Age) */}
              <div className="flex flex-wrap items-center justify-between gap-2.5">
                <div className="flex flex-wrap items-center gap-2">
                  {/* Status Dropdown */}
                  {currentStatus && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          type="button"
                          disabled={isUpdating}
                          className="border-border/80 bg-muted/60 hover:bg-muted text-foreground focus-visible:ring-ring inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none disabled:opacity-60"
                          title="Change status"
                        >
                          {StatusIcon && (
                            <StatusIcon
                              size={13}
                              style={{ color: statusConfig?.color }}
                              aria-hidden="true"
                            />
                          )}
                          <span>{currentStatus}</span>
                          <ChevronDown
                            size={12}
                            className="text-muted-foreground/60 -mr-0.5"
                            aria-hidden="true"
                          />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="w-44">
                        {Object.values(columns)
                          .sort((a, b) => a.order - b.order)
                          .map((col) => {
                            const opt =
                              columnStatusOptions[
                                col.status as keyof typeof columnStatusOptions
                              ];
                            const OptIcon = opt?.icon;
                            const isCurrent = col.id === currentColumnId;
                            return (
                              <DropdownMenuItem
                                key={col.id}
                                className={cn(
                                  "cursor-pointer gap-2 text-xs",
                                  isCurrent && "bg-accent/50 font-semibold",
                                )}
                                onClick={() =>
                                  !isCurrent && void handleMove(col.id)
                                }
                              >
                                {OptIcon && (
                                  <OptIcon
                                    size={14}
                                    style={{ color: opt?.color }}
                                    aria-hidden="true"
                                  />
                                )}
                                <span className="flex-1">{col.status}</span>
                                {isCurrent && (
                                  <Check
                                    size={13}
                                    className="text-primary ml-auto"
                                  />
                                )}
                              </DropdownMenuItem>
                            );
                          })}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}

                  {/* Priority (Read-only badge) */}
                  <div
                    className="border-border/80 bg-muted/60 text-foreground inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium select-none"
                    title={`Priority: ${liveTask.priority}`}
                  >
                    <PriorityIndicator
                      priority={liveTask.priority}
                      showLabel
                      iconSize={13}
                    />
                  </div>

                  {/* Tags (Read-only badges) */}
                  {liveTask.tags?.map((tag) => (
                    <TagBadge key={tag} tag={tag} size="sm" showDot />
                  ))}
                </div>

                {liveTask.columnEnteredAt && !isTerminalStatus && (
                  <TaskColumnAge
                    columnEnteredAt={liveTask.columnEnteredAt}
                    columnName={currentStatus || undefined}
                    compact={false}
                    className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-amber-500/25 bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-600 dark:text-amber-400"
                  />
                )}
              </div>

              {/* Divider */}
              <div className="border-border/60 border-t" />

              {/* Description Section with In-Place Markdown Editing */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground/60 text-xs font-medium tracking-wider uppercase">
                    Description
                  </span>

                  {!isEditingDescription && (
                    <div className="flex items-center gap-1">
                      {liveTask.description && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="text-muted-foreground hover:text-foreground h-7 cursor-pointer gap-1 px-2 text-xs"
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

                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-muted-foreground hover:text-foreground h-7 cursor-pointer gap-1 px-2 text-xs"
                        onClick={handleStartEditDescription}
                        title="Edit description inline"
                      >
                        <Pencil className="size-3.5" />
                        <span className="text-[11px]">
                          {hasDescription ? "Edit" : "Add"}
                        </span>
                      </Button>
                    </div>
                  )}
                </div>

                {isEditingDescription ? (
                  <div className="animate-in fade-in-50 space-y-3 duration-150">
                    <MarkdownTextarea
                      name="description"
                      value={descriptionDraft}
                      onChange={setDescriptionDraft}
                      onSubmit={handleSaveDescription}
                      placeholder="Add description or notes..."
                      maxLength={2000}
                      disabled={isSavingDescription}
                      textareaClassName="min-h-[240px] sm:min-h-[300px] max-h-[50vh] resize-y"
                      previewClassName="min-h-[240px] sm:min-h-[300px] max-h-[50vh]"
                      onAiImprove={handleImproveDescription}
                      isAiImproving={isImprovingDescription}
                      isAiDisabled={
                        !descriptionDraft.trim() || isSavingDescription
                      }
                      aiImproveLabel="Improve description with AI"
                    />

                    <div className="flex items-center justify-between gap-2">
                      <span className="text-muted-foreground/60 hidden text-[11px] sm:inline">
                        <kbd className="bg-muted text-muted-foreground rounded border px-1 py-0.5 font-mono text-[10px]">
                          Ctrl
                        </kbd>{" "}
                        +{" "}
                        <kbd className="bg-muted text-muted-foreground rounded border px-1 py-0.5 font-mono text-[10px]">
                          Enter
                        </kbd>{" "}
                        to save
                      </span>

                      <div className="ml-auto flex items-center gap-2">
                        {hasDescription && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            disabled={isSavingDescription}
                            onClick={handleCancelEditDescription}
                            className="h-8 cursor-pointer px-3 text-xs"
                          >
                            Cancel
                          </Button>
                        )}
                        <Button
                          type="button"
                          size="sm"
                          disabled={
                            isSavingDescription || !descriptionDraft.trim()
                          }
                          onClick={() => void handleSaveDescription()}
                          className="h-8 cursor-pointer gap-1.5 px-3 text-xs font-medium"
                        >
                          {isSavingDescription ? (
                            <>
                              <Loader2 className="size-3.5 animate-spin" />
                              <span>Saving...</span>
                            </>
                          ) : (
                            <span>Save</span>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : liveTask.description ? (
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={handleStartEditDescription}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        handleStartEditDescription();
                      }
                    }}
                    title="Click to edit description inline"
                    className="group hover:bg-muted/30 focus-visible:ring-ring -m-1 min-h-15 cursor-pointer rounded-md p-1 transition-colors focus-visible:ring-1 focus-visible:outline-none"
                  >
                    <RichDescription content={liveTask.description} size="sm" />
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleStartEditDescription}
                    className="text-muted-foreground/50 hover:text-muted-foreground hover:bg-muted/30 group focus-visible:ring-ring flex w-full cursor-pointer items-center gap-2 rounded-lg px-2 py-3 text-left text-sm transition-colors focus-visible:ring-2 focus-visible:outline-none"
                  >
                    <AlignLeft
                      size={15}
                      className="text-muted-foreground/40 group-hover:text-muted-foreground/70 transition-colors"
                      aria-hidden="true"
                    />
                    <span className="italic">Add description or notes...</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          <TaskDevShortcuts task={liveTask} />

          {/* Sheet Footer - Metadata */}
          {liveTask.createdAt && (
            <div className="border-border/60 bg-muted/20 text-muted-foreground flex shrink-0 items-center justify-between border-t px-5 py-3 text-xs sm:px-6">
              <span
                className="inline-flex items-center gap-1.5"
                title={formatFullCreatedDate(liveTask.createdAt)}
              >
                <CalendarDays className="size-3.5" aria-hidden="true" />
                <time
                  dateTime={new Date(liveTask.createdAt).toISOString()}
                  suppressHydrationWarning
                >
                  Created {formatRelativeDate(liveTask.createdAt)}
                </time>
              </span>
              <span className="text-muted-foreground/70 hidden items-center gap-1.5 text-[11px] sm:inline-flex">
                <kbd className="bg-muted text-muted-foreground pointer-events-none rounded border px-1.5 py-0.5 font-mono text-[0.625rem] select-none">
                  Esc
                </kbd>
                <span>to close</span>
              </span>
            </div>
          )}
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
