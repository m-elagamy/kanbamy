import type { ClientTask } from "@/lib/types";
import { getBoardByIdForUser } from "@/lib/dal/board";
import { getTaskDetails } from "@/lib/dal/task";
import type {
  BoardSearchParams,
  BoardTaskDetail,
  BoardWithColumnsAndTasks,
  BoardWorkspaceData,
} from "../types";

export function getRequestedTaskId(
  searchParams: BoardSearchParams,
): string | undefined {
  return searchParams.task ?? searchParams.focus;
}

export function ensureTaskInBoard<
  TBoard extends BoardWithColumnsAndTasks,
>(board: TBoard, focusedTask: ClientTask | null | undefined): TBoard {
  if (!focusedTask) return board;

  return {
    ...board,
    columns: board.columns.map((column) =>
      column.id === focusedTask.columnId &&
      !column.tasks.some((task) => task.id === focusedTask.id)
        ? {
            ...column,
            tasks: [...column.tasks, focusedTask].sort((a, b) =>
              a.order.localeCompare(b.order),
            ),
          }
        : column,
    ),
  };
}

export function resolveBoardWorkspaceData<
  TBoard extends BoardWithColumnsAndTasks,
>({
  board,
  task,
  searchParams,
}: {
  board: TBoard;
  task: BoardTaskDetail | null | undefined;
  searchParams: BoardSearchParams;
}): BoardWorkspaceData<TBoard> {
  const taskId = searchParams.task;
  const focusedTaskId = searchParams.focus;
  const animateEntry = searchParams.new === "1" || searchParams.created === "1";

  const isValidTaskForBoard = Boolean(task && task.boardId === board.id);
  const resolvedTask = isValidTaskForBoard ? (task as ClientTask) : null;

  const linkedTask = taskId ? resolvedTask : null;
  const focusedTask = focusedTaskId ? resolvedTask : null;
  const initialBoard = ensureTaskInBoard(board, focusedTask);

  return {
    initialBoard,
    linkedTask,
    focusedTaskId: focusedTask?.id ?? focusedTaskId,
    animateEntry,
  };
}

export async function loadBoardWorkspace({
  ownerId,
  boardId,
  searchParams,
}: {
  ownerId: string;
  boardId: string;
  searchParams: BoardSearchParams;
}): Promise<BoardWorkspaceData<BoardWithColumnsAndTasks> | null> {
  const requestedTaskId = getRequestedTaskId(searchParams);

  const [board, taskResult] = await Promise.all([
    getBoardByIdForUser(ownerId, boardId),
    requestedTaskId
      ? getTaskDetails(ownerId, requestedTaskId)
      : Promise.resolve(null),
  ]);

  if (!board) return null;

  return resolveBoardWorkspaceData({
    board,
    task: taskResult?.success ? taskResult.data : null,
    searchParams,
  });
}
