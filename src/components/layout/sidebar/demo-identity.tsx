import { CircleUserRound } from "lucide-react";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

export default function DemoIdentity() {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          asChild
          size="lg"
          tooltip="Demo workspace"
          className="cursor-default hover:bg-transparent"
        >
          <div role="status">
            <CircleUserRound className="size-8 shrink-0" />
            <div className="grid min-w-0 flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
              <span className="truncate font-semibold">Demo workspace</span>
              <span className="text-muted-foreground truncate text-xs">
                Temporary session
              </span>
            </div>
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
