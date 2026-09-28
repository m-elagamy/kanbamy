"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { Check, LoaderCircle, X } from "lucide-react";
import { useShallow } from "zustand/react/shallow";
import { createTaskAction } from "@/actions/task";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import handleOnError from "@/utils/handle-on-error";
import useLoadingStore from "@/stores/loading";
import { useTaskStore } from "@/stores/task";
import type { PriorityFilterValue } from "@/lib/types/stores/task";
import { taskSchema } from "@/schemas/task";
import PriorityIndicator from "./priority-indicator";

type QuickAddTaskProps = {
  columnId: string;
  onClose: () => void;
  priorityFilter: PriorityFilterValue;
};

export default function QuickAddTask({
  columnId,
  onClose,
  priorityFilter,
}: QuickAddTaskProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState("");
  const [error, setError] = useState<string | null>(null);
  const priority = priorityFilter === "all" ? "medium" : priorityFilter;

  const addTask =
    useTaskStore(
      useShallow((state) => ({
        addTask: state.addTask,
      })),
    ).addTask;
  const { isCreating, setIsLoading } = useLoadingStore(
    useShallow((state) => ({
      isCreating: state.isLoading("task", "creating", `quick-${columnId}`),
      setIsLoading: state.setIsLoading,
    })),
  );

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const validated = taskSchema.safeParse({
      columnId,
      title,
      description: "",
      priority,
    });

    if (!validated.success) {
      const titleError = validated.error.flatten().fieldErrors.title?.[0];
      setError(titleError ?? "Please enter a valid task name.");
      inputRef.current?.focus();
      return;
    }

    const formData = new FormData();
    formData.set("columnId", columnId);
    formData.set("title", validated.data.title);
    formData.set("description", "");
    formData.set("priority", priority);

    setError(null);
    setIsLoading("task", "creating", true, `quick-${columnId}`);

    try {
      const result = await createTaskAction(formData);
      if (!result.success || !result.fields?.id) {
        handleOnError(result.message, "Failed to create task");
        return;
      }

      addTask(columnId, {
        id: result.fields.id,
        createdAt: result.fields.createdAt.toISOString(),
        columnId: result.fields.columnId,
        title: result.fields.title,
        description: result.fields.description,
        priority: result.fields.priority,
        order: result.fields.order,
        columnEnteredAt: result.fields.columnEnteredAt.toISOString(),
      });
      onClose();
    } catch (caughtError) {
      handleOnError(caughtError, "Failed to create task");
    } finally {
      setIsLoading("task", "creating", false, `quick-${columnId}`);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="border-primary/40 bg-card ring-primary/15 space-y-2.5 rounded-lg border p-3 shadow-sm ring-2"
      aria-label="Quick add task"
    >
      <Input
        ref={inputRef}
        value={title}
        onChange={(event) => {
          setTitle(event.target.value);
          if (error) setError(null);
        }}
        onKeyDown={(event) => {
          if (event.key === "Escape" && !isCreating) onClose();
        }}
        className="placeholder:text-muted-foreground/70 h-7 border-0 bg-transparent px-0 text-sm font-medium shadow-none focus-visible:ring-0 dark:bg-transparent"
        maxLength={50}
        placeholder="What needs to be done?"
        aria-label="Task title"
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `quick-task-error-${columnId}` : undefined}
        disabled={isCreating}
      />
      {error && (
        <p
          id={`quick-task-error-${columnId}`}
          className="text-destructive px-1 text-xs"
          role="alert"
        >
          {error}
        </p>
      )}
      <div className="flex min-h-7 items-center justify-between gap-2">
        <PriorityIndicator priority={priority} showLabel={false} />
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-7"
            onClick={onClose}
            disabled={isCreating}
          >
            <X aria-hidden="true" />
            <span className="sr-only">Cancel</span>
          </Button>
          <Button
            type="submit"
            size="sm"
            className="h-7 px-2.5"
            disabled={isCreating || !title.trim()}
          >
            {isCreating ? (
              <LoaderCircle className="animate-spin" aria-hidden="true" />
            ) : (
              <Check aria-hidden="true" />
            )}
            Create
          </Button>
        </div>
      </div>
    </form>
  );
}
