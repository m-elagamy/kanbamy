import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { after } from "next/server";
import BoardLayout from "@/components/workspace/board";
import {
  type BoardSearchParams,
  loadBoardWorkspace,
} from "@/features/board";
import { getBoardByIdForUser, markBoardAsVisited } from "@/lib/dal/board";
import {
  requireWorkspaceAccess,
  resolveWorkspaceOwner,
} from "@/lib/auth/workspace-access";
import { revalidateRecentBoards } from "@/lib/cache/revalidate";

/* eslint-disable @clerk/next/require-auth-protection -- Board data is loaded through requireWorkspaceAccess(), which validates the authenticated user or demo session. */

type Params = Promise<{ boardId: string }>;
type SearchParams = Promise<BoardSearchParams>;

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
  const boardId = decodeURIComponent(routeParams.boardId);

  const workspaceData = await loadBoardWorkspace({
    ownerId: owner.ownerId,
    boardId,
    searchParams: queryParams,
  });

  if (!workspaceData) notFound();

  after(async () => {
    if (workspaceData.animateEntry) return;

    try {
      const visit = await markBoardAsVisited(
        owner.ownerId,
        workspaceData.initialBoard.id,
      );
      if (visit) {
        revalidateRecentBoards(owner.ownerId);
      }
    } catch (error) {
      console.error("Failed to mark board as visited:", error);
    }
  });

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

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const [{ boardId }, owner] = await Promise.all([
    params,
    resolveWorkspaceOwner(),
  ]);
  if (!owner) return { title: "Board" };

  const board = await getBoardByIdForUser(
    owner.ownerId,
    decodeURIComponent(boardId),
  );

  return {
    title: board?.title ?? "Board",
  };
}
