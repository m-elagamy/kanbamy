import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
} from "@/components/ui/sidebar";
import type { SimplifiedBoard } from "@/lib/types/stores/board";
import SidebarTitle from "./sidebar-title";
import BoardItem from "./board-item";
import DemoGatedNavigation from "./demo-gated-navigation";
import DemoIdentity from "./demo-identity";

export default function DemoSidebar({ board }: { board: SimplifiedBoard }) {
  return (
    <Sidebar collapsible="icon" variant="inset">
      <SidebarTitle />
      <SidebarContent>
        <DemoGatedNavigation />
        <SidebarGroup>
          <SidebarGroupLabel className="uppercase">Boards</SidebarGroupLabel>
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
        <DemoIdentity />
      </SidebarFooter>
    </Sidebar>
  );
}
