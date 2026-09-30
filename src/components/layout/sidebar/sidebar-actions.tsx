"use client";

import { Plus } from "lucide-react";
import BoardModal from "@/app/dashboard/components/board/board-modal";
import { BoardSearch } from "@/app/dashboard/components/board/board-search";
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const SidebarActions = () => {
  const { open, isMobile } = useSidebar();

  if (isMobile) return null;

  return (
    <SidebarGroup className={open ? "hidden" : "block"}>
      <SidebarMenu>
        <SidebarMenuItem>
          <BoardSearch
            scope="workspace"
            workspaceTabs="boards"
            compact
            enableShortcut={false}
          />
        </SidebarMenuItem>
        <SidebarMenuItem>
          <BoardModal
            mode="create"
            variant="ghost"
            size="icon"
            trigger={
              <SidebarMenuButton
                className="justify-center text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                tooltip="Create board"
                asChild
              >
                <button type="button" aria-label="Create board">
                  <Plus />
                </button>
              </SidebarMenuButton>
            }
          />
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  );
};

export default SidebarActions;
