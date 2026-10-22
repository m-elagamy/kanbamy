import type { FormMode, ClientTask } from "@/lib/types";
import type { TaskSchema } from "@/schemas/task";
import { useTaskCreateAction } from "./use-task-create-action";
import { useTaskUpdateAction } from "./use-task-update-action";

type UseTaskFormAction = {
  formMode: FormMode;
  validateBeforeSubmit: (
    formData: FormData,
    isEditMode: boolean,
    existingBoards: { id: string; title: string }[],
    subsetFields: (keyof TaskSchema)[],
    entityType: "board" | "task",
  ) => { success: boolean; data?: TaskSchema; error?: string };
  task?: ClientTask;
  columnId?: string;
  onClose: () => void;
};

export function useTaskFormAction({
  formMode,
  validateBeforeSubmit,
  task,
  columnId,
  onClose,
}: UseTaskFormAction) {
  const isEditMode = formMode === "edit";
  const createAction = useTaskCreateAction({
    validateBeforeSubmit,
    columnId,
    onClose,
  });
  const updateAction = useTaskUpdateAction({
    task,
    onClose,
    validateBeforeSubmit,
  });

  return {
    handleFormAction: isEditMode
      ? updateAction.handleAction
      : createAction.formAction,
    isEditMode,
    isLoading: isEditMode ? updateAction.isLoading : createAction.isPending,
  };
}
