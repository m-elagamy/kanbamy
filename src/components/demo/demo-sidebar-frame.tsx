import type { ReactNode } from "react";
import { Sidebar } from "@/components/ui/sidebar";
import SidebarTitle from "@/components/layout/sidebar/sidebar-title";

type DemoSidebarFrameProps = {
  children: ReactNode;
};

export default function DemoSidebarFrame({
  children,
}: DemoSidebarFrameProps) {
  return (
    <Sidebar collapsible="icon" variant="inset">
      <SidebarTitle />
      {children}
    </Sidebar>
  );
}
