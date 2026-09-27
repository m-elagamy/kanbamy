import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { after } from "next/server";
import {
  getBoardBySlugAction,
} from "@/actions/board";
import { recordBoardVisitForUser } from "@/lib/dal/board";
import deslugify from "@/utils/deslugify";
import BoardLayout from "../components/board";
import { getTaskDetailsAction } from "@/actions/task";
import { getAuthenticatedUserId, requireAuth } from "@/utils/auth";
import { getServerTimestamp } from "@/utils/server-timing";

/* eslint-disable @clerk/next/require-auth-protection -- This resource calls requireAuth(), which preserves DEV_AUTH_BYPASS before delegating to auth.protect(). */

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
  const startedAt = getServerTimestamp();
  await requireAuth();
  const userId = await getAuthenticatedUserId();
  const boardSlug = decodeURIComponent((await params).board);
  const {
    new: isFreshlyCreated,
    created: isCreated,
    task: taskId,
    focus: focusedTaskId,
  } = await searchParams;

  const requestedTaskId = taskId ?? focusedTaskId;

  const [{ board: currentBoard }, taskResult] = await Promise.all([
    getBoardBySlugAction(boardSlug),
    requestedTaskId
      ? getTaskDetailsAction(requestedTaskId)
      : Promise.resolve(null),
  ]);

  console.debug("[board-route-timing]", {
    totalMs: getServerTimestamp() - startedAt,
    hasTask: Boolean(requestedTaskId),
    boardFound: Boolean(currentBoard),
  });

  if (!currentBoard) {
    notFound();
  }

  after(async () => {
    try {
      await recordBoardVisitForUser(userId, currentBoard.id);
    } catch (error) {
      console.error("Failed to record board visit:", error);
    }
  });

  const requestedTask =
    taskResult?.success && taskResult.fields?.boardSlug === boardSlug
      ? taskResult.fields
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
      key={`${boardSlug}:${taskId ?? focusedTaskId ?? ""}`}
      initialBoard={initialBoard}
      linkedTask={linkedTask}
      focusedTaskId={focusedTask?.id}
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
