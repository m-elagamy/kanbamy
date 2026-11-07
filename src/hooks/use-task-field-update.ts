"use client";

import { useState } from "react";
import type { ClientTask } from "@/lib/types";
import { useTaskStore } from "@/stores/task";
import useLoadingStore from "@/stores/loading";
import { updateTaskAction } from "@/actions/task";
import handleOnError from "@/utils/handle-on-error";
import { toast } from "sonner";

export type UpdatableTaskField = "title" | "description" | "priority" | "tags";

export interface UpdateFieldOptions {
  successMessage?: string;
  errorMessage?: string;
  showToast?: boolean;
}

interface UseTaskFieldUpdateProps {
  task: ClientTask;
  columnId?: string | null;
}

export function useTaskFieldUpdate({
  task,
  columnId,
}: UseTaskFieldUpdateProps) {
  const [isUpdating, setIsUpdating] = useState(false);

  const updateField = async <K extends UpdatableTaskField>(
    field: K,
    value: ClientTask[K],
    options: UpdateFieldOptions = {},
  ): Promise<{ success: boolean; message?: string }> => {
    const taskColId = columnId || task.columnId;
    if (!taskColId || isUpdating) {
      return { success: false, message: "Invalid column or already updating" };
    }

    const {
      successMessage,
      errorMessage = `Failed to update ${field}`,
      showToast = true,
    } = options;

    const currentValue = task[field];
    const isUnchanged =
      typeof value === "string"
        ? (value as string).trim() ===
          ((currentValue as string | null) ?? "").trim()
        : JSON.stringify(value) === JSON.stringify(currentValue);

    if (isUnchanged) {
      return { success: true };
    }

    setIsUpdating(true);
    const { setIsLoading } = useLoadingStore.getState();
    setIsLoading("task", "updating", true, task.id);

    const formData = new FormData();
    formData.append("taskId", task.id);
    formData.append(
      "title",
      field === "title" ? (value as string) : task.title,
    );
    const resolvedDesc =
      field === "description"
        ? ((value as string | null) ?? "")
        : (task.description ?? "");
    if (resolvedDesc) {
      formData.append("description", resolvedDesc);
    }
    formData.append(
      "priority",
      field === "priority" ? (value as ClientTask["priority"]) : task.priority,
    );
    formData.append("columnId", taskColId);

    const resolvedTags =
      field === "tags" ? (value as string[]) : (task.tags || []);
    resolvedTags.forEach((tag) => formData.append("tags", tag));

    try {
      const result = await updateTaskAction(formData);
      if (!result.success) {
        handleOnError(result.message, errorMessage);
        if (showToast) {
          toast.error(result.message || errorMessage);
        }
        return { success: false, message: result.message };
      }

      useTaskStore.getState().updateTask(task.id, { [field]: value });

      if (showToast && successMessage) {
        toast.success(successMessage);
      }

      return { success: true };
    } catch (error) {
      handleOnError(error, errorMessage);
      if (showToast) {
        toast.error(errorMessage);
      }
      return { success: false, message: errorMessage };
    } finally {
      setIsUpdating(false);
      setIsLoading("task", "updating", false, task.id);
    }
  };

  return {
    updateField,
    isUpdating,
  };
}
