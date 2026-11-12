import BoardLayout from "@/components/workspace/board";
import { getDemoBoardWorkspace, getDemoWorkspaceContext } from "@/lib/demo-workspace";
import { getTaskDetails } from "@/lib/dal/task";

type SearchParams = Promise<{
  new?: string;
  created?: string;
  task?: string;
  focus?: string;
}>;

export default async function DemoPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const [{ demoSession }, queryParams] = await Promise.all([
    getDemoWorkspaceContext(),
    searchParams,
  ]);
  const taskId = queryParams.task;
  const focusedTaskId = queryParams.focus;
  const animateEntry =
    queryParams.new === "1" || queryParams.created === "1";
  const requestedTaskId = taskId ?? focusedTaskId;

  const [{ board }, taskResult] = await Promise.all([
    getDemoBoardWorkspace(),
    requestedTaskId
      ? getTaskDetails(demoSession.ownerId, requestedTaskId)
      : Promise.resolve(null),
  ]);

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
      key={board.slug}
      initialBoard={initialBoard}
      renderContainer={false}
      linkedTask={linkedTask}
      focusedTaskId={focusedTask?.id ?? focusedTaskId}
      animateEntry={animateEntry}
      clearEntryQuery={animateEntry}
    />
  );
}
