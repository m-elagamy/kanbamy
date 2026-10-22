import { useContext } from "react";
import { useShallow } from "zustand/react/shallow";
import { updateTaskAction } from "@/actions/task";
import type { ClientTask } from "@/lib/types";
import type { TaskSchema } from "@/schemas/task";
import { useTaskStore } from "@/stores/task";
import useLoadingStore from "@/stores/loading";
import handleOnError from "@/utils/handle-on-error";
import { DndTaskMoveSuccessTriggerContext } from "@/providers/dnd-provider";

type UseTaskUpdateActionProps = {
  task?: ClientTask;
  onClose: () => void;
  validateBeforeSubmit: (
    formData: FormData,
    isEditMode: boolean,
    existingBoards: { id: string; title: string }[],
    subsetFields: (keyof TaskSchema)[],
    entityType: "board" | "task",
  ) => { success: boolean; data?: TaskSchema; error?: string };
};

export function useTaskUpdateAction({
  task,
  onClose,
  validateBeforeSubmit,
}: UseTaskUpdateActionProps) {
  const showTaskMoveSuccess = useContext(DndTaskMoveSuccessTriggerContext);
  const updateTask = useTaskStore(
    useShallow((state) => ({
      updateTask: state.updateTask,
    })),
  ).updateTask;
  const { isLoading, setIsLoading } = useLoadingStore(
    useShallow((state) => ({
      isLoading: state.isLoading("task", "updating", task?.id),
      setIsLoading: state.setIsLoading,
    })),
  );

  const handleAction = async (formData: FormData) => {
    if (!task) return;

    const { success, data: validatedData } = validateBeforeSubmit(
      formData,
      true,
      [],
      ["title", "description", "priority", "columnId", "tags"],
      "task",
    );

    if (!success || !validatedData) return;

    const title = validatedData.title;
    const description = validatedData.description ?? "";
    const priority = (validatedData.priority ?? "medium") as ClientTask["priority"];
    const newColumnId = validatedData.columnId || task.columnId;
    const tags = validatedData.tags ?? [];

    setIsLoading("task", "updating", true, task.id);

    try {
      const result = await updateTaskAction(formData);
      if (!result.success) {
        handleOnError(result.message, "Failed to update task");
      } else {
        if (newColumnId !== task.columnId) {
          const store = useTaskStore.getState();
          const destinationHasMore = Boolean(
            store.columnPages[newColumnId]?.nextCursor,
          );
          store.moveTaskBetweenColumns(
            task.id,
            task.columnId,
            newColumnId,
            undefined,
            !destinationHasMore,
          );
          updateTask(task.id, {
            title,
            description,
            priority,
            tags,
            ...(result.fields ?? {}),
          });
          showTaskMoveSuccess(task.id);
        } else {
          updateTask(task.id, { title, description, priority, tags });
        }
        onClose();
      }
    } catch (error) {
      console.error("Error updating task:", error);
      handleOnError(error, "Failed to update task");
    } finally {
      setIsLoading("task", "updating", false, task.id);
    }
  };

  return { handleAction, isLoading };
}
