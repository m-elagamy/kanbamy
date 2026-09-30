import { LayoutDashboard, ListTodo } from "lucide-react";
import {
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import DemoSidebarFrame from "./demo-sidebar-frame";

export function DemoEntrySidebarContent() {
  return (
    <>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="uppercase">Workspace</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton disabled className="text-sidebar-foreground/55">
                  <LayoutDashboard aria-hidden="true" />
                  <span>Overview</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton disabled className="text-sidebar-foreground/55">
                  <ListTodo aria-hidden="true" />
                  <span>Tasks</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel className="uppercase">Boards</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  disabled
                  aria-hidden="true"
                  className="pointer-events-none opacity-55"
                >
                  <Skeleton className="size-5 rounded-lg animate-none" />
                  <Skeleton className="h-4 w-24 animate-none group-data-[collapsible=icon]:hidden" />
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton disabled className="text-sidebar-foreground/60">
              <span
                aria-hidden="true"
                className="bg-(--brand) size-4 shrink-0 rounded-full opacity-70"
              />
              <span>Demo environment</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </>
  );
}

export default function DemoEntrySidebar() {
  return (
    <DemoSidebarFrame>
      <DemoEntrySidebarContent />
    </DemoSidebarFrame>
  );
}
