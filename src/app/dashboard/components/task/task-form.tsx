import { RefObject, useMemo, useState } from "react";
import { useShallow } from "zustand/react/shallow";
import type { FormMode, ClientTask } from "@/lib/types";
import { taskSchema, type TaskSchema } from "@/schemas/task";
import { useColumnStore } from "@/stores/column";
import useForm from "@/hooks/use-form";
import GenericForm from "@/components/ui/generic-form";
import FormField from "@/components/ui/form-field";
import { Button } from "@/components/ui/button";
import { Columns3, Plus } from "lucide-react";
import { useTaskFormAction } from "@/hooks/use-task-form-action";
import taskPriorities from "../../data/task-priorities";
import columnStatusOptions from "../../data/column-status-options";
import { formatCreatedDate } from "@/lib/utils/format-date";
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

  const {
    formValues: taskFormData,
    handleOnChange,
    formRef,
    errors,
    validateBeforeSubmit,
  } = useForm<TaskSchemaWithId, TaskSchema>(
    {
      id: task?.id ?? "",
      title: task?.title ?? "",
      description: task?.description ?? "",
      priority: task?.priority ?? "medium",
      columnId: columnId ?? sortedColumns[0]?.id ?? "",
    },
    taskSchema,
  );

  const { handleFormAction, isEditMode, isLoading } = useTaskFormAction({
    task,
    formMode,
    columnId,
    onClose,
    validateBeforeSubmit,
  });

  const showColumnSelector = !columnId && boardId;
  const [selectedColumnId, setSelectedColumnId] = useState(
    taskFormData.columnId,
  );
  const [isColumnSelectOpen, setIsColumnSelectOpen] = useState(false);
  const [isAddColumnOpen, setIsAddColumnOpen] = useState(false);
  const hasNoColumns = showColumnSelector && columnOptions.length === 0;

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
      >
      <FormField
        type="text"
        name="title"
        label="What's the task?"
        defaultValue={taskFormData.title}
        onChange={(value) => handleOnChange("title", value)}
        error={errors?.title}
        required
        maxLength={50}
        placeholder="e.g., Create a stunning new landing page"
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
        columnId && (
          <FormField type="hidden" name="columnId" defaultValue={columnId} />
        )
      )}

      {isEditMode && (
        <FormField type="hidden" name="taskId" defaultValue={task?.id} />
      )}

      <FormField
        type="textarea"
        name="description"
        label="What needs to be done?"
        defaultValue={taskFormData.description}
        onChange={(value) => handleOnChange("description", value)}
        error={errors?.description}
        placeholder="e.g., Design a modern, mobile-friendly layout for the homepage"
        maxLength={2000}
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

      {isEditMode && task?.createdAt && (
        <p className="text-muted-foreground text-xs">
          {formatCreatedDate(task.createdAt)}
        </p>
      )}

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
