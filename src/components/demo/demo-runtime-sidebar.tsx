import { getDemoWorkspaceContext } from "@/lib/demo-workspace";
import { DemoSidebarContent } from "@/components/demo/demo-sidebar";

export default async function DemoRuntimeSidebar() {
  const { demoBoard } = await getDemoWorkspaceContext();

  return <DemoSidebarContent board={demoBoard} />;
}
