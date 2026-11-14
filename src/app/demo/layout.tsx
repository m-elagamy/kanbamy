import { cookies } from "next/headers";
import { resolveDemoSession } from "@/lib/demo-session";
import { getDemoBoardSummary } from "@/lib/dal/demo-board";
import DemoBreadcrumb from "@/components/demo/demo-breadcrumb";
import DemoHeaderIndicator from "@/components/demo/demo-header-indicator";
import DemoSidebar from "@/components/demo/demo-sidebar";
import WorkspaceShell from "@/components/layout/workspace-shell";
import OfflineStatus from "@/components/workspace/offline-status";

export default async function DemoLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [cookieStore, demoSession] = await Promise.all([
    cookies(),
    resolveDemoSession(),
  ]);

  const demoBoard = demoSession
    ? await getDemoBoardSummary(demoSession.ownerId)
    : null;

  const defaultOpen = cookieStore.get("sidebar_state")?.value === "true";

  return (
    <WorkspaceShell
      defaultOpen={defaultOpen}
      sidebar={<DemoSidebar board={demoBoard} />}
      breadcrumb={<DemoBreadcrumb boardTitle={demoBoard?.title ?? "Demo"} />}
      headerIndicator={<DemoHeaderIndicator />}
      offlineStatus={<OfflineStatus />}
    >
      {children}
    </WorkspaceShell>
  );
}
