import {
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
} from "@/components/ui/sidebar";
import type { BoardWithStats, SimplifiedBoard } from "@/lib/types/stores/board";
import DemoBoardItem from "./demo-board-item";
import DemoGatedNavigation from "./demo-gated-navigation";
import DemoIdentity from "./demo-identity";
import DemoBoardsLabel from "./demo-boards-label";
import DemoSidebarFrame from "./demo-sidebar-frame";

export function DemoSidebarContent({
  board,
}: {
  board: SimplifiedBoard;
}) {
  const boardWithStats: BoardWithStats = {
    ...board,
    _count: { columns: 0, openTasks: 0 },
  };

  return (
    <>
      <SidebarContent>
      <DemoGatedNavigation />
      <SidebarGroup>
        <DemoBoardsLabel board={boardWithStats} />
        <SidebarGroupContent>
          <SidebarMenu>
            <DemoBoardItem board={board} />
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <DemoIdentity />
      </SidebarFooter>
    </>
  );
}

export default function DemoSidebar({ board }: { board: SimplifiedBoard }) {
  return (
    <DemoSidebarFrame>
      <DemoSidebarContent board={board} />
    </DemoSidebarFrame>
  );
}
