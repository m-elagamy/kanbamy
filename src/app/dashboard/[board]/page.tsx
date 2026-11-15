import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { after } from "next/server";
import deslugify from "@/utils/deslugify";
import BoardLayout from "@/components/workspace/board";
import {
  type BoardSearchParams,
  loadBoardWorkspace,
} from "@/features/board";
import { markBoardAsVisited } from "@/lib/dal/board";
import { requireWorkspaceAccess } from "@/lib/auth/workspace-access";
import { revalidateRecentBoards } from "@/lib/cache/revalidate";

/* eslint-disable @clerk/next/require-auth-protection -- Board data is loaded through requireWorkspaceAccess(), which validates the authenticated user or demo session. */

type Params = Promise<{ board: string }>;
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
  const boardSlug = decodeURIComponent(routeParams.board);

  const workspaceData = await loadBoardWorkspace({
    ownerId: owner.ownerId,
    boardSlug,
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
        await revalidateRecentBoards(owner.ownerId);
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
  const boardSlug = decodeURIComponent((await params).board);

  const boardTitle = deslugify(boardSlug);

  return {
    title: boardTitle,
  };
}
