import { RefObject, useId, useMemo, useState } from "react";
import { useShallow } from "zustand/react/shallow";
import type { FormMode, ClientTask } from "@/lib/types";
import { taskSchema, type TaskSchema } from "@/schemas/task";
import { useColumnStore } from "@/stores/column";
import useBoardStore from "@/stores/board";
import useForm from "@/hooks/use-form";
import GenericForm from "@/components/ui/generic-form";
import FormField from "@/components/ui/form-field";
import { Button } from "@/components/ui/button";
import { CalendarDays, Columns3, Loader2, Plus, Sparkles } from "lucide-react";
import { useTaskFormAction } from "@/hooks/use-task-form-action";
import { useTaskWritingImprovement } from "@/hooks/use-task-writing-improvement";
import { suggestTaskTagsAction } from "@/actions/task";
import { toast } from "sonner";
import taskPriorities from "../data/task-priorities";
import columnStatusOptions from "../data/column-status-options";
import { isTaskTag } from "../data/task-tags";
import {
  formatCreatedDate,
  formatFullCreatedDate,
  formatRelativeDate,
} from "@/lib/utils/format-date";
import { Label } from "@/components/ui/label";
import TagSelector from "./tag-selector";
import MarkdownTextarea from "./markdown-textarea";
import ColumnModal from "../column/column-modal";

type TaskFormProps = {
  formMode: FormMode;
  task?: ClientTask;
  columnId?: string;
  boardId?: string;
  onClose: () => void;
};

type TaskSchemaWithId = TaskSchema & { id: string };

const TaskForm = ({
  formMode,
  task,
  onClose,
  columnId,
  boardId,
}: TaskFormProps) => {
  const columns = useColumnStore(
    useShallow((state) => {
      if (!boardId) return {};
      return state.columnsByBoard[boardId] || {};
    }),
  );

  const sortedColumns = useMemo(() => {
    return Object.values(columns).sort((a, b) => a.order - b.order);
  }, [columns]);

  const columnOptions = useMemo(() => {
    return sortedColumns.map((column) => {
      const statusOption =
        columnStatusOptions[
          column.status as keyof typeof columnStatusOptions
        ];

      return {
        id: column.id,
        label: column.status,
        icon: statusOption?.icon,
        iconColor: statusOption?.color,
      };
    });
  }, [sortedColumns]);

  const initialTags = (task?.tags ?? []).filter(isTaskTag);
  const [selectedTags, setSelectedTags] = useState<string[]>(initialTags);
  const tagsFieldId = useId();

  const [titleValue, setTitleValue] = useState(task?.title ?? "");
  const [descriptionValue, setDescriptionValue] = useState(
    task?.description ?? "",
  );

  const activeBoardId = useBoardStore((state) => state.activeBoardId);
  const resolvedBoardId = useMemo(() => {
    if (boardId) return boardId;
    if (activeBoardId) return activeBoardId;
    const targetColId = task?.columnId ?? columnId;
    if (targetColId) {
      const columnsByBoard = useColumnStore.getState().columnsByBoard;
      for (const [bId, cols] of Object.entries(columnsByBoard)) {
        if (cols[targetColId]) return bId;
      }
    }
    return undefined;
  }, [boardId, activeBoardId, task?.columnId, columnId]);

  const parentBoard = useBoardStore(
    useShallow((state) =>
      resolvedBoardId ? state.boards[resolvedBoardId] : undefined,
    ),
  );
  const boardName = parentBoard?.title?.trim() || undefined;
  const boardDescription = parentBoard?.description?.trim() || undefined;

  const {
    formValues: taskFormData,
    handleOnChange,
    formRef,
    errors,
    clearGenericError,
    validateBeforeSubmit,
  } = useForm<TaskSchemaWithId, TaskSchema>(
    {
      id: task?.id ?? "",
      title: task?.title ?? "",
      description: task?.description ?? "",
      priority: task?.priority ?? "medium",
      columnId: task?.columnId ?? columnId ?? sortedColumns[0]?.id ?? "",
      tags: initialTags,
    },
    taskSchema,
  );

  const handleTitleChange = (value: string) => {
    setTitleValue(value);
    handleOnChange("title", value);
  };

  const handleDescriptionChange = (value: string) => {
    setDescriptionValue(value);
    handleOnChange("description", value);
  };

  const {
    isImprovingTitle,
    isImprovingDescription,
    isImproving,
    handleImproveTitle,
    handleImproveDescription,
  } = useTaskWritingImprovement({
    title: titleValue,
    description: descriptionValue,
    boardName,
    boardDescription,
    onApplyTitle: handleTitleChange,
    onApplyDescription: handleDescriptionChange,
  });

  const { handleFormAction, isEditMode, isLoading } = useTaskFormAction({
    task,
    formMode,
    columnId,
    onClose,
    validateBeforeSubmit,
  });

  const showColumnSelector = Boolean(boardId) && (formMode === "edit" || !columnId);
  const [selectedColumnId, setSelectedColumnId] = useState(
    taskFormData.columnId,
  );
  const [isSuggestingTags, setIsSuggestingTags] = useState(false);
  const [isColumnSelectOpen, setIsColumnSelectOpen] = useState(false);
  const [isAddColumnOpen, setIsAddColumnOpen] = useState(false);
  const hasNoColumns = showColumnSelector && columnOptions.length === 0;
  const hasTaskTitle = Boolean(titleValue.trim());

  const handleTagsChange = (tags: string[]) => {
    setSelectedTags(tags);
    clearGenericError();
  };

  const handleSuggestTags = async () => {
    const currentTitle = titleValue.trim();
    if (!currentTitle) {
      toast.info("Please enter a task title first.");
      return;
    }

    setIsSuggestingTags(true);
    try {
      const result = await suggestTaskTagsAction(
        currentTitle,
        descriptionValue,
      );

      if (!result.success || !result.fields) {
        toast.error(result.message || "Failed to suggest tags.");
        return;
      }

      const suggestedTags = result.fields;
      if (suggestedTags.length === 0) {
        toast.info("No matching tags found for this task.");
        return;
      }

      const hasNewTags = suggestedTags.some(
        (tag) => !selectedTags.includes(tag),
      );

      if (!hasNewTags) {
        toast.info("All suggested tags are already added.");
        return;
      }

      const mergedTags = Array.from(
        new Set([...selectedTags, ...suggestedTags]),
      );
      handleTagsChange(mergedTags);
    } catch {
      toast.error("Failed to suggest tags with AI.");
    } finally {
      setIsSuggestingTags(false);
    }
  };

  const handleColumnChange = (value: string) => {
    setSelectedColumnId(value);
    handleOnChange("columnId", value);
  };

  const handleColumnCreated = (createdColumnId: string) => {
    setSelectedColumnId(createdColumnId);
    handleOnChange("columnId", createdColumnId);
    setIsColumnSelectOpen(false);
  };

  const addColumnAction = (className: string) =>
    boardId ? (
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className={className}
        onPointerDown={(event) => event.stopPropagation()}
        onClick={() => {
          setIsColumnSelectOpen(false);
          setIsAddColumnOpen(true);
        }}
      >
        <Plus aria-hidden="true" />
        Add column
      </Button>
    ) : undefined;

  return (
    <>
      <GenericForm
        formRef={formRef as RefObject<HTMLFormElement>}
        onAction={handleFormAction}
        errors={errors}
        formMode={formMode}
        isLoading={isLoading}
        hasAvailableStatuses={!showColumnSelector || columnOptions.length > 0}
        footerLeft={
          isEditMode && task?.createdAt ? (
            <span
              className="text-muted-foreground/75 inline-flex items-center gap-1.5 text-xs select-none"
              title={formatFullCreatedDate(task.createdAt)}
              aria-label={formatCreatedDate(task.createdAt)}
            >
              <CalendarDays className="size-3.5 opacity-70" aria-hidden="true" />
              <time
                dateTime={new Date(task.createdAt).toISOString()}
                suppressHydrationWarning
              >
                {formatRelativeDate(task.createdAt)}
              </time>
            </span>
          ) : undefined
        }
      >
        <FormField
          type="text"
          name="title"
          label="What's the task?"
          value={titleValue}
          onChange={handleTitleChange}
          error={errors?.title}
          required
          maxLength={50}
          placeholder="e.g., Create a stunning new landing page"
          onAiImprove={handleImproveTitle}
          isAiImproving={isImprovingTitle}
          isAiDisabled={!titleValue.trim() || isImproving}
          aiImproveLabel="Improve title with AI"
        />

        {showColumnSelector ? (
          <FormField
            type="select"
            name="columnId"
            label="Which column?"
            value={selectedColumnId}
            open={isColumnSelectOpen}
            onOpenChange={setIsColumnSelectOpen}
            onChange={handleColumnChange}
            options={columnOptions}
            error={errors?.columnId}
            placeholder="Select a column"
            selectEmptyState={
              hasNoColumns ? (
                <div className="flex flex-col items-center gap-2 px-3 py-4 text-center">
                  <Columns3
                    className="text-muted-foreground size-5"
                    aria-hidden="true"
                  />
                  <div className="space-y-0.5">
                    <p className="text-foreground text-sm font-medium">
                      No columns yet
                    </p>
                    <p className="text-muted-foreground text-xs">
                      Add a column to place this task.
                    </p>
                  </div>
                  {addColumnAction(
                    "text-primary hover:text-primary h-8 rounded-sm px-2 font-medium",
                  )}
                </div>
              ) : undefined
            }
            selectAction={
              hasNoColumns
                ? undefined
                : addColumnAction(
                    "text-muted-foreground hover:text-primary h-8 w-full justify-start rounded-sm px-2 font-normal",
                  )
            }
          />
        ) : (
          (task?.columnId || columnId) && (
            <FormField
              type="hidden"
              name="columnId"
              defaultValue={task?.columnId ?? columnId}
            />
          )
        )}

        {isEditMode && (
          <FormField type="hidden" name="taskId" defaultValue={task?.id} />
        )}

        <MarkdownTextarea
          name="description"
          label="What needs to be done?"
          value={descriptionValue}
          onChange={handleDescriptionChange}
          error={errors?.description}
          placeholder="e.g., Design a modern, mobile-friendly layout for the homepage"
          maxLength={2000}
          onAiImprove={handleImproveDescription}
          isAiImproving={isImprovingDescription}
          isAiDisabled={
            !descriptionValue.trim() || !titleValue.trim() || isImproving
          }
          aiImproveLabel="Improve description with AI"
        />

        <FormField
          type="select"
          name="priority"
          label="Priority"
          defaultValue={taskFormData.priority}
          onChange={(value) => handleOnChange("priority", value)}
          error={errors?.priority}
          options={taskPriorities}
          placeholder="Select priority"
        />

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor={tagsFieldId}>Tags</Label>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleSuggestTags}
              disabled={!hasTaskTitle || isSuggestingTags}
              title={
                !hasTaskTitle
                  ? "Enter a task title first to suggest tags"
                  : isSuggestingTags
                    ? "Suggesting tags..."
                    : "Suggest tags with AI"
              }
              aria-label={
                !hasTaskTitle
                  ? "Enter a task title first to suggest tags"
                  : isSuggestingTags
                    ? "Suggesting tags..."
                    : "Suggest tags with AI"
              }
              className="text-muted-foreground hover:text-foreground hover:bg-muted/50 h-6 gap-1.5 rounded px-2 text-xs font-normal transition-colors cursor-pointer disabled:pointer-events-none disabled:opacity-40"
            >
              {isSuggestingTags ? (
                <Loader2
                  className="size-3.5 animate-spin text-primary"
                  aria-hidden="true"
                />
              ) : (
                <Sparkles className="size-3.5!" aria-hidden="true" />
              )}
              <span>
                {isSuggestingTags ? "Suggesting..." : "Suggest with AI"}
              </span>
            </Button>
          </div>

          <TagSelector
            id={tagsFieldId}
            selectedTags={selectedTags}
            onChange={handleTagsChange}
          />
        </div>
      </GenericForm>
      {boardId && (
        <ColumnModal
          boardId={boardId}
          open={isAddColumnOpen}
          onOpenChange={setIsAddColumnOpen}
          onCreated={handleColumnCreated}
        />
      )}
    </>
  );
};

export default TaskForm;
