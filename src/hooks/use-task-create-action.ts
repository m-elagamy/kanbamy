import { useActionState } from "react";
import { toast } from "sonner";
import { useShallow } from "zustand/react/shallow";
import { createTaskAction } from "@/actions/task";
import type { TaskSchema } from "@/schemas/task";
import { useTaskStore } from "@/stores/task";
import handleOnError from "@/utils/handle-on-error";

type UseTaskCreateActionProps = {
  validateBeforeSubmit: (
    formData: FormData,
    isEditMode: boolean,
    existingBoards: { id: string; title: string }[],
    subsetFields: (keyof TaskSchema)[],
    entityType: "board" | "task",
  ) => { success: boolean; data?: TaskSchema; error?: string };
  columnId?: string;
  onClose: () => void;
};

export function useTaskCreateAction({
  validateBeforeSubmit,
  columnId,
  onClose,
}: UseTaskCreateActionProps) {
  const { addTask, clearSnapshot } = useTaskStore(
    useShallow((state) => ({
      addTask: state.addTask,
      clearSnapshot: state.clearSnapshot,
    })),
  );

  const [, formAction, isPending] = useActionState(
    async (_previousState: null, formData: FormData) => {
      const { success, data: validatedData } = validateBeforeSubmit(
        formData,
        false,
        [],
        ["title", "description", "priority"],
        "task",
      );

      if (!success || !validatedData) return null;

      const finalColumnId = columnId || validatedData.columnId;
      const { title, description = "", priority = "medium" } = validatedData;

      try {
        const result = await createTaskAction(formData);
        if (!result.success || !result.fields?.id) {
          handleOnError(result.message, "Failed to create task");
          return null;
        }

        const operationId = addTask(finalColumnId, {
          id: result.fields.id,
          createdAt: new Date().toISOString(),
          columnId: finalColumnId,
          title,
          description,
          priority,
          order: result.fields.order ?? "",
          columnEnteredAt: new Date().toISOString(),
        });
        clearSnapshot(operationId ?? undefined);
        onClose();
      } catch (error) {
        console.error("Error creating task:", error);
        handleOnError(error, "Failed to create task");
      }

      return null;
    },
    null,
  );

  return { formAction, isPending };
}
