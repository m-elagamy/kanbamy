import { BOARD_TAGS, type BoardTag } from "@/lib/constants";
import type { TagOption } from "@/lib/types";

export const BOARD_TAG_OPTIONS: Record<BoardTag, TagOption> = {
  work: {
    id: "work",
    label: "Work",
    className: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    dotColor: "bg-blue-500",
  },
  personal: {
    id: "personal",
    label: "Personal",
    className: "bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/20",
    dotColor: "bg-pink-500",
  },
  study: {
    id: "study",
    label: "Study",
    className: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
    dotColor: "bg-indigo-500",
  },
  "side-project": {
    id: "side-project",
    label: "Side Project",
    className: "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20",
    dotColor: "bg-violet-500",
  },
  client: {
    id: "client",
    label: "Client",
    className: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    dotColor: "bg-amber-500",
  },
  product: {
    id: "product",
    label: "Product",
    className: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20",
    dotColor: "bg-sky-500",
  },
  engineering: {
    id: "engineering",
    label: "Engineering",
    className: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20",
    dotColor: "bg-cyan-500",
  },
  design: {
    id: "design",
    label: "Design",
    className: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
    dotColor: "bg-purple-500",
  },
  marketing: {
    id: "marketing",
    label: "Marketing",
    className: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20",
    dotColor: "bg-orange-500",
  },
  finance: {
    id: "finance",
    label: "Finance",
    className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    dotColor: "bg-emerald-500",
  },
  health: {
    id: "health",
    label: "Health",
    className: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
    dotColor: "bg-rose-500",
  },
};

export const boardTagsList: TagOption[] = BOARD_TAGS.map(
  (tag) => BOARD_TAG_OPTIONS[tag],
);

export const isBoardTag = (value: string): value is BoardTag =>
  (BOARD_TAGS as readonly string[]).includes(value);
