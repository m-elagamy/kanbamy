import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
} from "@/components/ui/sidebar";
import type { BoardWithStats, SimplifiedBoard } from "@/lib/types/stores/board";
import SidebarTitle from "./sidebar-title";
import BoardItem from "./board-item";
import DemoGatedNavigation from "./demo-gated-navigation";
import DemoIdentity from "./demo-identity";
import DemoBoardsLabel from "./demo-boards-label";

export default function DemoSidebar({
  board,
  expiresAt,
}: {
  board: SimplifiedBoard;
  expiresAt: Date;
}) {
  const boardWithStats: BoardWithStats = {
    ...board,
    _count: { columns: 0, openTasks: 0 },
  };

  return (
    <Sidebar collapsible="icon" variant="inset">
      <SidebarTitle />
      <SidebarContent>
        <DemoGatedNavigation />
        <SidebarGroup>
          <DemoBoardsLabel board={boardWithStats} />
          <SidebarGroupContent>
            <SidebarMenu>
              <BoardItem
                board={board}
                href="/demo"
                isActive
                hideWhenCollapsed={false}
              />
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <DemoIdentity expiresAt={expiresAt} />
      </SidebarFooter>
    </Sidebar>
  );
}
