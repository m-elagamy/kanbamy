"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { CornerDownLeft, LoaderCircle, X } from "lucide-react";
import { useShallow } from "zustand/react/shallow";
import { createTaskAction } from "@/actions/task";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import handleOnError from "@/utils/handle-on-error";
import useLoadingStore from "@/stores/loading";
import { useTaskStore } from "@/stores/task";
import type { PriorityFilterValue } from "@/lib/types/stores/task";
import { taskSchema } from "@/schemas/task";
import PrioritySelector, { type PriorityValue } from "./priority-selector";

type QuickAddTaskProps = {
  columnId: string;
  onClose: () => void;
  priorityFilter: PriorityFilterValue;
  onTaskAdded?: () => void;
};

const getPriorityBorderClass = (priority: PriorityValue) => {
  const classes: Record<PriorityValue, string> = {
    high: "border-s-2 border-s-destructive/70 hover:border-s-destructive/90 focus-within:border-s-destructive/90",
    medium:
      "border-s-2 border-s-amber-500/60 hover:border-s-amber-500/80 focus-within:border-s-amber-500/80",
    low: "border-s-2 border-s-sky-400/55 hover:border-s-sky-400/75 focus-within:border-s-sky-400/75",
  };
  return classes[priority] ?? "border-s-border/70";
};

export default function QuickAddTask({
  columnId,
  onClose,
  priorityFilter,
  onTaskAdded,
}: QuickAddTaskProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [title, setTitle] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [justCreated, setJustCreated] = useState(false);
  const [priority, setPriority] = useState<PriorityValue>(() =>
    priorityFilter === "all" ? "medium" : priorityFilter,
  );

  const addTask = useTaskStore(
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
    textareaRef.current?.focus();
  }, []);

  const submitTask = async () => {
    const validated = taskSchema.safeParse({
      columnId,
      title,
      description: "",
      priority,
    });

    if (!validated.success) {
      const titleError = validated.error.flatten().fieldErrors.title?.[0];
      setError(titleError ?? "Please enter a valid task name.");
      textareaRef.current?.focus();
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
        tags: result.fields.tags ?? [],
        columnEnteredAt: result.fields.columnEnteredAt.toISOString(),
      });

      setTitle("");
      setJustCreated(true);
      setTimeout(() => setJustCreated(false), 450);
      setTimeout(() => {
        textareaRef.current?.focus();
        onTaskAdded?.();
      }, 60);
    } catch (caughtError) {
      handleOnError(caughtError, "Failed to create task");
    } finally {
      setIsLoading("task", "creating", false, `quick-${columnId}`);
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isCreating && title.trim()) {
      void submitTask();
    }
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 6, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -4, scale: 0.98 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      className={cn(
        "bg-card space-y-2.5 rounded-lg border p-3 shadow-xs",
        "border-border/80 transition-[border-color,box-shadow,background-color] duration-200",
        "hover:border-primary/45 focus-within:border-primary/50",
        getPriorityBorderClass(priority),
        justCreated && "border-emerald-500/60 ring-1 ring-emerald-500/30",
      )}
      aria-label="Quick add task"
    >
      <Textarea
        ref={textareaRef}
        value={title}
        rows={1}
        onChange={(event) => {
          setTitle(event.target.value);
          if (error) setError(null);
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            if (!isCreating && title.trim()) {
              void submitTask();
            }
          } else if (event.key === "Escape" && !isCreating) {
            event.preventDefault();
            onClose();
          }
        }}
        className="placeholder:text-muted-foreground/60 max-h-28 min-h-[38px] resize-none border-0 bg-transparent p-0 text-sm leading-snug font-semibold tracking-tight shadow-none focus-visible:border-0 focus-visible:ring-0 dark:bg-transparent"
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
          className="text-destructive px-0.5 text-xs"
          role="alert"
        >
          {error}
        </p>
      )}
      <div className="flex min-h-7 items-center justify-between gap-2 pt-0.5">
        <PrioritySelector
          priority={priority}
          onChange={setPriority}
          showLabel={false}
          disabled={isCreating}
        />

        <div className="flex items-center gap-1.5">
          {title.length >= 35 && (
            <span
              className={cn(
                "px-1 font-mono text-[10px] tabular-nums transition-colors select-none",
                title.length >= 48
                  ? "text-destructive font-semibold"
                  : title.length >= 42
                    ? "text-amber-500"
                    : "text-muted-foreground/60",
              )}
              aria-live="polite"
            >
              {title.length}/50
            </span>
          )}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-foreground size-7"
            onClick={onClose}
            disabled={isCreating}
            title="Cancel (Esc)"
          >
            <X className="size-3.5" aria-hidden="true" />
            <span className="sr-only">Cancel</span>
          </Button>
          <Button
            type="submit"
            size="sm"
            className={cn(
              "h-7 gap-1.5 px-2.5 text-xs shadow-xs transition-all duration-150",
              title.trim()
                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                : "opacity-50",
            )}
            disabled={isCreating || !title.trim()}
            title="Add task (Enter)"
          >
            {isCreating ? (
              <LoaderCircle
                className="size-3.5 animate-spin"
                aria-hidden="true"
              />
            ) : (
              <CornerDownLeft className="size-3.5" aria-hidden="true" />
            )}
            <span>Add</span>
          </Button>
        </div>
      </div>
    </motion.form>
  );
}
