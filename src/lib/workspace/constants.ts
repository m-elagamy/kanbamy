import type { TasksFilter, TasksSort } from "@/lib/types";

export const TASK_FILTERS: { value: TasksFilter; label: string }[] = [
  { value: "all", label: "All tasks" },
  { value: "open", label: "Open tasks" },
  { value: "attention", label: "Needs attention" },
  { value: "stale", label: "Stale" },
  { value: "priority", label: "High priority" },
];

export const TASK_FILTER_VALUES = new Set<TasksFilter>(
  TASK_FILTERS.map(({ value }) => value),
);

export const TASK_SORTS: { value: TasksSort; label: string }[] = [
  { value: "default", label: "Default order" },
  { value: "newest", label: "Newest created" },
  { value: "oldest", label: "Oldest in column" },
  { value: "priority", label: "Highest priority" },
];

export const TASK_SORT_VALUES = new Set<TasksSort>(
  TASK_SORTS.map(({ value }) => value),
);
