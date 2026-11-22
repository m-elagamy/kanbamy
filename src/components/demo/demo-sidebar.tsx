"use client";

import { usePathname } from "next/navigation";
import {
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
} from "@/components/ui/sidebar";
import type { BoardWithStats, SimplifiedBoard } from "@/lib/types/stores/board";
import { useBoardsFolder } from "@/hooks/use-boards-folder";
import DemoBoardItem from "./demo-board-item";
import DemoGatedNavigation from "./demo-gated-navigation";
import DemoIdentity from "./demo-identity";
import DemoBoardsLabel from "./demo-boards-label";
import DemoSidebarFrame from "./demo-sidebar-frame";
import { DemoEntrySidebarContent } from "./demo-entry-sidebar";

export function DemoSidebarContent({
  board,
  defaultBoardsOpen = true,
}: {
  board: SimplifiedBoard;
  defaultBoardsOpen?: boolean;
}) {
  const { isOpen, toggle } = useBoardsFolder(defaultBoardsOpen);
  const boardWithStats: BoardWithStats = {
    ...board,
    _count: { columns: 0, openTasks: 0 },
  };

  return (
    <>
      <SidebarContent>
        <DemoGatedNavigation />
        <SidebarGroup>
          <DemoBoardsLabel
            board={boardWithStats}
            isOpen={isOpen}
            onToggle={toggle}
          />
          <div
            className={`grid transition-[grid-template-rows,opacity] duration-200 ease-out motion-reduce:transition-none ${
              isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
            }`}
            aria-hidden={!isOpen}
          >
            <div className="overflow-hidden">
              <SidebarGroupContent>
                <SidebarMenu>
                  <DemoBoardItem board={board} />
                </SidebarMenu>
              </SidebarGroupContent>
            </div>
          </div>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <DemoIdentity />
      </SidebarFooter>
    </>
  );
}

export default function DemoSidebar({
  board,
  defaultBoardsOpen = true,
}: {
  board?: SimplifiedBoard | null;
  defaultBoardsOpen?: boolean;
}) {
  const pathname = usePathname();
  const isEnter = pathname === "/demo/enter";

  return (
    <DemoSidebarFrame>
      {isEnter || !board ? (
        <DemoEntrySidebarContent />
      ) : (
        <DemoSidebarContent
          board={board}
          defaultBoardsOpen={defaultBoardsOpen}
        />
      )}
    </DemoSidebarFrame>
  );
}
