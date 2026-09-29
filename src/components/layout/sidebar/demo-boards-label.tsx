"use client";

import { Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SidebarGroupLabel } from "@/components/ui/sidebar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { BoardSearch } from "@/app/dashboard/components/board/board-search";
import type { BoardWithStats } from "@/lib/types/stores/board";

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
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              aria-label={message}
              aria-disabled="true"
              title={message}
              onClick={(event) => event.preventDefault()}
              className="inline-flex !size-6 !gap-0 !p-0 items-center justify-center rounded-md text-sidebar-foreground/45 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring"
            >
              <Plus className="size-4" aria-hidden="true" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="right">{message}</TooltipContent>
        </Tooltip>
      </span>
    </SidebarGroupLabel>
  );
}
