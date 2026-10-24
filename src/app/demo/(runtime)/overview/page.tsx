import type { Metadata } from "next";
import type { BoardWithStats } from "@/lib/types/stores/board";
import {
  OverviewContent,
  OverviewPageShell,
} from "@/components/workspace/overview";
import { getDemoWorkspaceContext } from "@/lib/demo-workspace";

export const metadata: Metadata = {
  title: "Demo Overview",
  description: "Explore a real Kanbamy workspace with a temporary Demo session.",
};

async function getDemoOwnerId() {
  const { demoSession } = await getDemoWorkspaceContext();
  return demoSession.ownerId;
}

async function getDemoBoardId() {
  const { demoBoard } = await getDemoWorkspaceContext();
  return demoBoard.id;
}

async function getDemoInitialBoards(): Promise<BoardWithStats[]> {
  const { demoBoard } = await getDemoWorkspaceContext();
  return [
    {
      ...demoBoard,
      _count: { columns: 0, openTasks: 0 },
    },
  ];
}

export default function DemoOverviewPage() {
  return (
    <OverviewPageShell
      basePath="/demo"
      canCreateBoard={false}
      workspaceTabs="boards"
      getInitialBoards={getDemoInitialBoards}
    >
      <OverviewContent
        getOwnerId={getDemoOwnerId}
        getDemoBoardId={getDemoBoardId}
        basePath="/demo"
        canNavigateTasks
      />
    </OverviewPageShell>
  );
}
