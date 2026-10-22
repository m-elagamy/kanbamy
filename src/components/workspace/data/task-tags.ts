import { TASK_TAGS, type TaskTag } from "@/lib/constants";
import type { TagOption } from "@/lib/types";

export type TaskTagOption = TagOption;

export const TASK_TAG_OPTIONS: Record<string, TaskTagOption> = {
  urgent: {
    id: "urgent",
    label: "Urgent",
    className: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
    dotColor: "bg-rose-500",
  },
  bug: {
    id: "bug",
    label: "Bug",
    className: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
    dotColor: "bg-red-500",
  },
  feature: {
    id: "feature",
    label: "Feature",
    className: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20",
    dotColor: "bg-sky-500",
  },
  enhancement: {
    id: "enhancement",
    label: "Enhancement",
    className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    dotColor: "bg-emerald-500",
  },
  design: {
    id: "design",
    label: "Design",
    className: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
    dotColor: "bg-purple-500",
  },
  research: {
    id: "research",
    label: "Research",
    className: "bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20",
    dotColor: "bg-teal-500",
  },
  study: {
    id: "study",
    label: "Study",
    className: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    dotColor: "bg-blue-500",
  },
  docs: {
    id: "docs",
    label: "Docs",
    className: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    dotColor: "bg-amber-500",
  },
  review: {
    id: "review",
    label: "Review",
    className: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
    dotColor: "bg-indigo-500",
  },
  refactor: {
    id: "refactor",
    label: "Refactor",
    className: "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20",
    dotColor: "bg-violet-500",
  },
  performance: {
    id: "performance",
    label: "Performance",
    className: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20",
    dotColor: "bg-cyan-500",
  },
};

const DEFAULT_TAG_THEME = {
  className: "bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-500/20",
  dotColor: "bg-slate-500",
};

export function getTaskTagOption(tag: string): TaskTagOption {
  if (!tag) {
    return {
      id: "",
      label: "",
      className: "bg-muted/60 text-muted-foreground border-border/60",
      dotColor: "bg-muted-foreground/60",
    };
  }

  const existing = TASK_TAG_OPTIONS[tag];
  if (existing) return existing;

  const label = tag.charAt(0).toUpperCase() + tag.slice(1);
  return {
    id: tag,
    label,
    ...DEFAULT_TAG_THEME,
  };
}

export const isTaskTag = (value: string): value is TaskTag =>
  (TASK_TAGS as readonly string[]).includes(value);

export const taskTagsList: TaskTagOption[] = TASK_TAGS.map((tag) =>
  getTaskTagOption(tag),
);

export default taskTagsList;
