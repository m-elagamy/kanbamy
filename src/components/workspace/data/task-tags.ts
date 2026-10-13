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
  design: {
    id: "design",
    label: "Design",
    className:
      "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
    dotColor: "bg-purple-500",
  },
  "ui/ux": {
    id: "ui/ux",
    label: "UI/UX",
    className:
      "bg-fuchsia-500/10 text-fuchsia-600 dark:text-fuchsia-400 border-fuchsia-500/20",
    dotColor: "bg-fuchsia-500",
  },
  frontend: {
    id: "frontend",
    label: "Frontend",
    className:
      "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20",
    dotColor: "bg-cyan-500",
  },
  backend: {
    id: "backend",
    label: "Backend",
    className:
      "bg-stone-500/10 text-stone-600 dark:text-stone-400 border-stone-500/20",
    dotColor: "bg-stone-500",
  },
  api: {
    id: "api",
    label: "API",
    className:
      "bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20",
    dotColor: "bg-teal-500",
  },
  database: {
    id: "database",
    label: "Database",
    className:
      "bg-amber-600/10 text-amber-700 dark:text-amber-300 border-amber-600/20",
    dotColor: "bg-amber-600",
  },
  devops: {
    id: "devops",
    label: "DevOps",
    className:
      "bg-blue-600/10 text-blue-700 dark:text-blue-300 border-blue-600/20",
    dotColor: "bg-blue-600",
  },
  testing: {
    id: "testing",
    label: "Testing",
    className:
      "bg-lime-500/10 text-lime-700 dark:text-lime-300 border-lime-500/20",
    dotColor: "bg-lime-500",
  },
  performance: {
    id: "performance",
    label: "Performance",
    className:
      "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20",
    dotColor: "bg-violet-500",
  },
  security: {
    id: "security",
    label: "Security",
    className:
      "bg-red-600/10 text-red-700 dark:text-red-300 border-red-600/20",
    dotColor: "bg-red-600",
  },
  docs: {
    id: "docs",
    label: "Docs",
    className:
      "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    dotColor: "bg-amber-500",
  },
};

export const taskTagsList = TASK_TAGS.map((tag) => TASK_TAG_OPTIONS[tag]);

export default taskTagsList;
