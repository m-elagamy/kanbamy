import { getDemoWorkspaceContext } from "@/lib/demo-workspace";
import { DemoSidebarContent } from "@/components/layout/sidebar/demo-sidebar";

export default async function DemoRuntimeSidebar() {
  const { demoBoard } = await getDemoWorkspaceContext();

  return <DemoSidebarContent board={demoBoard} />;
}
