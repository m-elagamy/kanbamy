import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getBoardBySlugAction } from "@/actions/board";
import deslugify from "@/utils/deslugify";
import BoardLayout from "../components/board";
import { getTaskDetailsAction } from "@/actions/task";

/* eslint-disable @clerk/next/require-auth-protection -- Board data is loaded through getBoardBySlugAction(), which validates the authenticated user. */

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
  const [routeParams, queryParams] = await Promise.all([params, searchParams]);
  const boardSlug = decodeURIComponent(routeParams.board);
  const {
    new: isFreshlyCreated,
    created: isCreated,
    task: taskId,
    focus: focusedTaskId,
  } = queryParams;

  const requestedTaskId = taskId ?? focusedTaskId;

  const [boardResult, taskResult] = await Promise.all([
    getBoardBySlugAction(boardSlug),
    requestedTaskId
      ? getTaskDetailsAction(requestedTaskId)
      : Promise.resolve(null),
  ]);

  const currentBoard = boardResult.success ? boardResult.board : null;
  if (!currentBoard) {
    notFound();
  }

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
