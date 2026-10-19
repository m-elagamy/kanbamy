import type { ClientTask, FilteredBoardColumnTasks } from "@/lib/types";
import type { Priority } from "@prisma/client";

export type PriorityFilterValue = Priority | "all";

export type BoardFilters = {
  priorities: Priority[];
  tags: string[];
};

export const DEFAULT_BOARD_FILTERS: BoardFilters = {
  priorities: [],
  tags: [],
};

export function areBoardFiltersEqual(a: BoardFilters, b: BoardFilters): boolean {
  if (a.priorities.length !== b.priorities.length) return false;
  const setP = new Set(a.priorities);
  if (!b.priorities.every((p) => setP.has(p))) return false;

  if (a.tags.length !== b.tags.length) return false;
  const setT = new Set(a.tags);
  return b.tags.every((t) => setT.has(t));
}

export function getBoardFilterKey(filter: BoardFilters): string {
  const p = [...filter.priorities].sort().join(",");
  const t = [...filter.tags].sort().join(",");
  return `p:${p}|t:${t}`;
}

export type ColumnFilterCacheEntry = {
  taskIds: string[];
  nextCursor: string | null;
  totalCount: number;
};

export type ColumnTaskPageState = {
  nextCursor: string | null;
  totalCount: number;
  isLoading: boolean;
  error: string | null;
  filter: BoardFilters;
};

export type InitialColumnTaskPage = {
  columnId: string;
  tasks: ClientTask[];
  nextCursor: string | null;
  totalCount: number;
};

export type TaskOperation = {
  kind: "drag";
  boardId: string | null;
  taskId: string;
  previousColumnId: string;
  previousIndex: number;
};

export type TaskState = {
  activeBoardId: string | null;
  tasks: Record<string, ClientTask>;
  columnTaskIds: Record<string, string[]>;
  columnPages: Record<string, ColumnTaskPageState>;
  columnFilterCache: Record<string, Record<string, ColumnFilterCacheEntry>>;
  activeTaskId: string | null;
  optimisticOperations: Record<string, TaskOperation>;
};

type TaskActions = {
  initializeTaskPages: (
    boardId: string,
    pages: InitialColumnTaskPage[],
  ) => void;
  replaceColumnTaskPage: (
    columnId: string,
    tasks: ClientTask[],
    nextCursor: string | null,
    filter: BoardFilters,
    totalCount: number,
  ) => void;
  replaceBoardTaskPages: (
    pages: FilteredBoardColumnTasks[],
    filter: BoardFilters,
    allColumnIds?: string[],
  ) => void;
  appendColumnTaskPage: (
    columnId: string,
    tasks: ClientTask[],
    nextCursor: string | null,
  ) => void;
  restoreColumnFilterFromCache: (
    columnId: string,
    filter: BoardFilters,
  ) => boolean;
  restoreBoardFilterFromCache: (
    columnIds: string[],
    filter: BoardFilters,
  ) => boolean;
  setColumnPageLoading: (columnId: string, isLoading: boolean) => void;
  setBoardPagesLoading: (columnIds: string[], isLoading: boolean) => void;
  setColumnPageError: (columnId: string, error: string | null) => void;
  setActiveTask: (task: ClientTask | null) => void;
  captureSnapshot: (taskId?: string) => string | null;
  clearSnapshot: (operationId?: string) => void;

  addTask: (columnId: string, task: ClientTask) => void;
  updateTask: (taskId: string, updates: Partial<ClientTask>) => void;
  deleteTask: (columnId: string, taskId: string) => void;

  reorderTaskWithinColumn: (
    columnId: string,
    activeTaskId: string,
    overId: string,
  ) => void;
  moveTaskBetweenColumns: (
    taskId: string,
    fromColumnId: string,
    toColumnId: string,
    targetTaskId?: string,
    includeInDestination?: boolean,
  ) => void;

  rollback: (operationId?: string) => void;
};

type TaskSelectors = {
  getTask: (taskId: string) => ClientTask | undefined;
  getColumnTasks: (columnId: string) => ClientTask[];
};

export type TaskStore = TaskState & TaskActions & TaskSelectors;
