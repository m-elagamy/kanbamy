import BoardLayout from "@/app/dashboard/components/board";
import { getDemoBoardWorkspace } from "@/lib/demo-workspace";
import { getTaskDetails } from "@/lib/dal/task";

type SearchParams = Promise<{
  new?: string;
  task?: string;
  focus?: string;
}>;

export default async function DemoPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const [{ demoSession, board }, queryParams] = await Promise.all([
    getDemoBoardWorkspace(),
    searchParams,
  ]);
  const taskId = queryParams.task;
  const focusedTaskId = queryParams.focus;
  const animateEntry = queryParams.new === "1";
  const requestedTaskId = taskId ?? focusedTaskId;
  const taskResult = requestedTaskId
    ? await getTaskDetails(demoSession.ownerId, requestedTaskId)
    : null;
  const requestedTask =
    taskResult?.success && taskResult.data?.boardSlug === board.slug
      ? taskResult.data
      : null;
  const linkedTask = taskId ? requestedTask : null;
  const focusedTask = focusedTaskId ? requestedTask : null;
  const initialBoard = focusedTask
    ? {
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
      }
    : board;

  return (
    <BoardLayout
      key={`${board.slug}:${taskId ?? focusedTaskId ?? ""}`}
      initialBoard={initialBoard}
      renderContainer={false}
      linkedTask={linkedTask}
      focusedTaskId={focusedTask?.id}
      animateEntry={animateEntry}
      clearEntryQuery={animateEntry}
    />
  );
}
