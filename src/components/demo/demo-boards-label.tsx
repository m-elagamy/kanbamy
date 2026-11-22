"use client";

import { Folder, FolderOpen, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SidebarGroupLabel, SidebarMenuButton } from "@/components/ui/sidebar";
import { BoardSearch } from "@/components/workspace/board/board-search";
import type { BoardWithStats } from "@/lib/types/stores/board";
import DemoLockedBoardAction from "./demo-locked-board-action";

export default function DemoBoardsLabel({
  board,
  isOpen = true,
  onToggle,
}: {
  board: BoardWithStats;
  isOpen?: boolean;
  onToggle?: () => void;
}) {
  const message = "Create an account to add more boards.";
  const FolderIcon = isOpen ? FolderOpen : Folder;

  return (
    <>
      <SidebarMenuButton
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-label={isOpen ? "Collapse boards" : "Expand boards"}
        tooltip="Boards (1)"
        className="hidden cursor-pointer group-data-[collapsible=icon]:flex"
      >
        <FolderIcon className="size-4 shrink-0" aria-hidden="true" />
      </SidebarMenuButton>
      <SidebarGroupLabel className="flex-row justify-between pr-0 uppercase group-data-[collapsible=icon]:hidden">
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={isOpen}
          className="hover:text-sidebar-foreground focus-visible:ring-sidebar-ring flex cursor-pointer items-center gap-1.5 rounded-sm text-xs font-medium uppercase transition-colors group-data-[collapsible=icon]:pointer-events-none group-data-[collapsible=icon]:invisible focus-visible:ring-2 focus-visible:outline-none"
        >
          <FolderIcon className="size-3.5 shrink-0" aria-hidden="true" />
          <span>Boards</span>
          <Badge
            variant="outline"
            className="h-5 rounded-md px-[7px] text-[0.690rem]"
            animate={false}
          >
            1
          </Badge>
        </button>
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
              className="text-sidebar-foreground/50 hover:bg-sidebar-accent hover:text-sidebar-foreground focus-visible:ring-sidebar-ring inline-flex !size-6 cursor-pointer items-center justify-center !gap-0 rounded-md !p-0 transition-colors focus-visible:ring-2 focus-visible:outline-none"
            >
              <Plus className="size-4" aria-hidden="true" />
            </button>
          </DemoLockedBoardAction>
        </span>
      </SidebarGroupLabel>
    </>
  );
}
