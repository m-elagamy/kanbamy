"use client";

import { useState } from "react";
import type { ClientTask } from "@/lib/types";
import { useTaskFieldUpdate } from "./use-task-field-update";

interface UseTaskInlineDescriptionProps {
  task: ClientTask;
  columnId?: string | null;
}

export function useTaskInlineDescription({
  task,
  columnId,
}: UseTaskInlineDescriptionProps) {
  const [prevTask, setPrevTask] = useState({
    id: task.id,
    description: task.description,
  });

  const hasDescription = Boolean(task.description?.trim());
  const [isEditing, setIsEditing] = useState(!hasDescription);
  const [value, setValue] = useState(task.description ?? "");

  const { updateField, isUpdating: isSaving } = useTaskFieldUpdate({
    task,
    columnId,
  });

  if (
    prevTask.id !== task.id ||
    prevTask.description !== task.description
  ) {
    setPrevTask({ id: task.id, description: task.description });
    setValue(task.description ?? "");
    if (!task.description?.trim()) {
      setIsEditing(true);
    }
  }

  const startEditing = () => setIsEditing(true);
  const cancelEditing = () => {
    setValue(task.description ?? "");
    setIsEditing(false);
  };

  const save = async () => {
    const trimmed = value.trim();
    if (trimmed === (task.description ?? "").trim()) {
      setIsEditing(false);
      return;
    }

    const result = await updateField("description", trimmed, {
      errorMessage: "Failed to update description",
    });

    if (result.success) {
      setIsEditing(false);
    }
  };

  return {
    isEditing,
    value,
    isSaving,
    hasDescription,
    setValue,
    setIsEditing,
    startEditing,
    cancelEditing,
    save,
  };
}
