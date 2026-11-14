import type { SimplifiedBoard } from "@/lib/types/stores/board";
import type { SimplifiedColumn } from "@/lib/types/stores/column";
import type { ClientTask } from "@/lib/types";

export type BoardWithColumnsAndTasks = SimplifiedBoard & {
  columns: (SimplifiedColumn & {
    tasks: ClientTask[];
    totalCount: number;
    nextCursor: string | null;
  })[];
};

export type BoardSearchParams = {
  new?: string;
  created?: string;
  task?: string;
  focus?: string;
};

export type BoardTaskDetail = ClientTask & { boardSlug: string };

export type BoardWorkspaceData<
  TBoard extends BoardWithColumnsAndTasks = BoardWithColumnsAndTasks,
> = {
  initialBoard: TBoard;
  linkedTask: ClientTask | null;
  focusedTaskId: string | undefined;
  animateEntry: boolean;
};
