import type { TasksFilter } from "@/lib/types";

export const TASK_FILTERS: { value: TasksFilter; label: string }[] = [
  { value: "all", label: "All tasks" },
  { value: "open", label: "Open tasks" },
  { value: "needs-attention", label: "Needs attention" },
  { value: "stale", label: "Stale" },
  { value: "high-priority", label: "High priority" },
];

export const TASK_FILTER_VALUES = new Set<TasksFilter>(
  TASK_FILTERS.map(({ value }) => value),
);

