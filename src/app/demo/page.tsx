import { notFound } from "next/navigation";
import BoardLayout from "@/components/workspace/board";
import { getDemoWorkspaceContext } from "@/lib/demo-workspace";
import {
  type BoardSearchParams,
  loadBoardWorkspace,
} from "@/features/board";

type SearchParams = Promise<BoardSearchParams>;

export default async function DemoPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const [{ demoSession, demoBoard }, queryParams] = await Promise.all([
    getDemoWorkspaceContext(),
    searchParams,
  ]);

  const workspaceData = await loadBoardWorkspace({
    ownerId: demoSession.ownerId,
    boardId: demoBoard.id,
    searchParams: queryParams,
  });

  if (!workspaceData) notFound();

  return (
    <BoardLayout
      key={workspaceData.initialBoard.id}
      initialBoard={workspaceData.initialBoard}
      linkedTask={workspaceData.linkedTask}
      focusedTaskId={workspaceData.focusedTaskId}
      animateEntry={workspaceData.animateEntry}
      clearEntryQuery={workspaceData.animateEntry}
    />
  );
}
