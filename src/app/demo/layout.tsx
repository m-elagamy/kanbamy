import DemoBreadcrumb from "@/components/layout/demo-breadcrumb";
import DemoSidebar from "@/components/layout/sidebar/demo-sidebar";
import OfflineStatus from "@/app/dashboard/components/offline-status";
import WorkspaceShell from "@/components/layout/workspace-shell";
import { getDemoWorkspaceContext } from "@/lib/demo-workspace";

export default async function DemoLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const { demoBoard, defaultOpen } =
    await getDemoWorkspaceContext();

  return (
    <WorkspaceShell
      defaultOpen={defaultOpen}
      sidebar={<DemoSidebar board={demoBoard} />}
      breadcrumb={<DemoBreadcrumb boardTitle={demoBoard.title} />}
      offlineStatus={<OfflineStatus />}
    >
      {children}
    </WorkspaceShell>
  );
}
