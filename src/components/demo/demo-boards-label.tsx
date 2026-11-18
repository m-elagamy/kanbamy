"use client";

import { Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SidebarGroupLabel } from "@/components/ui/sidebar";
import { BoardSearch } from "@/components/workspace/board/board-search";
import type { BoardWithStats } from "@/lib/types/stores/board";
import DemoLockedBoardAction from "./demo-locked-board-action";

export default function DemoBoardsLabel({ board }: { board: BoardWithStats }) {
  const message = "Create an account to add more boards.";

  return (
    <SidebarGroupLabel className="flex-row justify-between pr-0 uppercase">
      <span className="flex items-center gap-2">
        Boards
        <Badge variant="outline" className="h-5 rounded-md px-[7px] text-[0.690rem]" animate={false}>
          1
        </Badge>
      </span>
      <span className="flex items-center gap-1">
        <BoardSearch
          scope="workspace"
          workspaceTabs="boards"
          compact
          enableShortcut={false}
          initialBoards={[board]}
          initialBoardsTotalCount={1}
          basePath="/demo"
        />
        <DemoLockedBoardAction side="right">
          <button
            type="button"
            aria-label={message}
            className="inline-flex !size-6 !gap-0 !p-0 cursor-pointer items-center justify-center rounded-md text-sidebar-foreground/50 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring"
          >
            <Plus className="size-4" aria-hidden="true" />
          </button>
        </DemoLockedBoardAction>
      </span>
    </SidebarGroupLabel>
  );
}
