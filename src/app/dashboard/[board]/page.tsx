import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { after } from "next/server";
import deslugify from "@/utils/deslugify";
import BoardLayout from "@/components/workspace/board";
import {
  getBoardBySlugForUser,
  recordBoardVisitForUser,
} from "@/lib/dal/board";
import { getTaskDetails } from "@/lib/dal/task";
import { requireWorkspaceAccess } from "@/lib/auth/workspace-access";
import { revalidateUserBoardListForUser } from "@/lib/cache/revalidate";

/* eslint-disable @clerk/next/require-auth-protection -- Board data is loaded through requireWorkspaceAccess(), which validates the authenticated user or demo session. */

type Params = Promise<{ board: string }>;
type SearchParams = Promise<{
  new?: string;
  created?: string;
  task?: string;
  focus?: string;
}>;

export default async function BoardPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  const [routeParams, queryParams, owner] = await Promise.all([
    params,
    searchParams,
    requireWorkspaceAccess(),
  ]);
  const boardSlug = decodeURIComponent(routeParams.board);
  const {
    new: isFreshlyCreated,
    created: isCreated,
    task: taskId,
    focus: focusedTaskId,
  } = queryParams;

  const requestedTaskId = taskId ?? focusedTaskId;

  const [currentBoard, taskResult] = await Promise.all([
    getBoardBySlugForUser(owner.ownerId, boardSlug),
    requestedTaskId
      ? getTaskDetails(owner.ownerId, requestedTaskId)
      : Promise.resolve(null),
  ]);

  if (!currentBoard) notFound();

  after(async () => {
    try {
      const visit = await recordBoardVisitForUser(
        owner.ownerId,
        currentBoard.id,
      );
      if (visit) {
        await revalidateUserBoardListForUser(owner.ownerId);
      }
    } catch (error) {
      console.error("Failed to record board visit:", error);
    }
  });

  const requestedTask =
    taskResult?.success && taskResult.data?.boardSlug === boardSlug
      ? taskResult.data
      : null;
  const linkedTask = taskId ? requestedTask : null;
  const focusedTask = focusedTaskId ? requestedTask : null;

  const initialBoard = focusedTask
    ? {
        ...currentBoard,
        columns: currentBoard.columns.map((column) =>
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
      }
    : currentBoard;

  return (
    <BoardLayout
      key={boardSlug}
      initialBoard={initialBoard}
      linkedTask={linkedTask}
      focusedTaskId={focusedTask?.id ?? focusedTaskId}
      animateEntry={isFreshlyCreated === "1" || isCreated === "1"}
      clearEntryQuery={isFreshlyCreated === "1" || isCreated === "1"}
    />
  );
}

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const boardSlug = decodeURIComponent((await params).board);

  const boardTitle = deslugify(boardSlug);

  return {
    title: boardTitle,
  };
}
