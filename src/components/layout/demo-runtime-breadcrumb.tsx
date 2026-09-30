import DemoBreadcrumb from "@/components/layout/demo-breadcrumb";
import { getDemoWorkspaceContext } from "@/lib/demo-workspace";

export default async function DemoRuntimeBreadcrumb() {
  const { demoBoard } = await getDemoWorkspaceContext();

  return <DemoBreadcrumb boardTitle={demoBoard.title} />;
}
