import type { BoardFormSchema } from "@/schemas/board";
import type { TaskSchema } from "@/schemas/task";
import type { Board, Column, Task } from "@prisma/client";

export type BoardActionState = {
  success: boolean;
  message: string;
  board?: Board & {
    columns: (Column & { tasks: Task[] })[];
  };
};

export type TaskActionState = {
  success: boolean;
  message: string;
  taskId: string;
  columnId: string;
  fields?: Partial<TaskSchema>;
  boardSlug?: string;
};

export type FormMode = "create" | "edit";

export type ServerActionResult<T> = {
  success: boolean;
  message: string;
  fields?: T;
};

export type ButtonVariants =
  | "default"
  | "link"
  | "destructive"
  | "outline"
  | "secondary"
  | "ghost"
  | null
  | undefined;

export type ServerErrors = {
  specific: string | null;
  generic: string | null;
};

export type ActionStateResponse = {
  success?: boolean;
  message?: string;
};

export type Templates = "personal" | "agile" | "bug-tracking" | "custom";

export type FormErrors<T> = Partial<Record<keyof T, string>> & {
  generic?: string;
};

export type EntityType = "board" | "task" | "column";

export type Operation = "fetching" | "creating" | "updating" | "deleting";

export type BoardFormValues = { id: string } & BoardFormSchema;

export type BoardSummary = Pick<
  Board,
  "id" | "title" | "description" | "slug" | "createdAt"
>;

export type TaskSummary = Pick<
  Task,
  "id" | "title" | "description" | "priority" | "order"
>;

export type ClientTask = {
  id: string;
  createdAt: string;
  title: string;
  description: string | null;
  priority: "low" | "medium" | "high";
  order: string;
  columnId: string;
  columnEnteredAt: string;
};

export type TaskSearchResult = ClientTask & {
  column: { status: string };
  board: { id: string; title: string; slug: string };
};

export type TaskSearchPage = {
  items: TaskSearchResult[];
  nextCursor: string | null;
};

export type TaskPage = {
  items: ClientTask[];
  nextCursor: string | null;
  totalCount: number;
};

export type NeedsAttentionTask = ClientTask & {
  column: { status: string };
  board: { title: string; slug: string };
  attentionReason: "stale" | "high-priority" | "high-priority-stale";
};

export type NeedsAttentionPreview = {
  items: NeedsAttentionTask[];
  hasMore: boolean;
};

export type TasksFilter =
  "all" | "open" | "needs-attention" | "stale" | "high-priority";

export type WorkspaceTask = TaskSearchResult & {
  attentionReason: NeedsAttentionTask["attentionReason"] | null;
};

export type WorkspaceTasksPage = {
  items: WorkspaceTask[];
  totalCount: number;
  counts: Record<TasksFilter, number>;
};
