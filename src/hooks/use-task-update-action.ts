import { useShallow } from "zustand/react/shallow";
import { updateTaskAction } from "@/actions/task";
import type { ClientTask } from "@/lib/types";
import { useTaskStore } from "@/stores/task";
import useLoadingStore from "@/stores/loading";
import handleOnError from "@/utils/handle-on-error";

type UseTaskUpdateActionProps = {
  task?: ClientTask;
  onClose: () => void;
};

export function useTaskUpdateAction({
  task,
  onClose,
}: UseTaskUpdateActionProps) {
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

    const title = String(formData.get("title") ?? "");
    const description = String(formData.get("description") ?? "");
    const priority = String(
      formData.get("priority") ?? "medium",
    ) as ClientTask["priority"];

    setIsLoading("task", "updating", true, task.id);

    try {
      const result = await updateTaskAction(formData);
      if (!result.success) {
        handleOnError(result.message, "Failed to update task");
      } else {
        updateTask(task.id, { title, description, priority });
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
