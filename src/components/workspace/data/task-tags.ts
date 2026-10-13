import { TASK_TAGS, type TaskTag } from "@/lib/constants";

export type TaskTagOption = {
  id: TaskTag;
  label: string;
  className: string;
  dotColor: string;
};

export const TASK_TAG_OPTIONS: Record<TaskTag, TaskTagOption> = {
  bug: {
    id: "bug",
    label: "Bug",
    className:
      "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
    dotColor: "bg-rose-500",
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
    className:
      "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    dotColor: "bg-emerald-500",
  },
  design: {
    id: "design",
    label: "Design",
    className:
      "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
    dotColor: "bg-purple-500",
  },
  docs: {
    id: "docs",
    label: "Docs",
    className:
      "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    dotColor: "bg-amber-500",
  },
  urgent: {
    id: "urgent",
    label: "Urgent",
    className:
      "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20",
    dotColor: "bg-orange-500",
  },
  refactor: {
    id: "refactor",
    label: "Refactor",
    className:
      "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
    dotColor: "bg-indigo-500",
  },
};

export const taskTagsList = TASK_TAGS.map((tag) => TASK_TAG_OPTIONS[tag]);

export default taskTagsList;
