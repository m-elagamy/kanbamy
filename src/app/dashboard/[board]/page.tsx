import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { after } from "next/server";
import { recordBoardVisitForUser } from "@/lib/dal/board";
import { getBoardBySlugAction } from "@/actions/board";
import deslugify from "@/utils/deslugify";
import BoardLayout from "../components/board";
import { getTaskDetailsAction } from "@/actions/task";
import { getAuthenticatedUserId } from "@/utils/auth";
import {
  getServerTimestamp,
  logServerTiming,
} from "@/utils/server-timing";

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
  const userId = await getAuthenticatedUserId();
  const boardSlug = decodeURIComponent((await params).board);
  const {
    new: isFreshlyCreated,
    created: isCreated,
    task: taskId,
    focus: focusedTaskId,
  } = await searchParams;

  const requestedTaskId = taskId ?? focusedTaskId;

  const [boardResult, taskResult] = await Promise.all([
    getBoardBySlugAction(boardSlug),
    requestedTaskId
      ? getTaskDetailsAction(requestedTaskId)
      : Promise.resolve(null),
  ]);

  logServerTiming("board.route", getServerTimestamp() - startedAt, {
    hasTask: Boolean(requestedTaskId),
    boardFound: boardResult.success,
  });

  const currentBoard = boardResult.success ? boardResult.board : null;
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
