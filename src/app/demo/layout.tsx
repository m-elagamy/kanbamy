import { cache, Suspense, type ReactNode } from "react";
import { cookies } from "next/headers";
import { resolveDemoSession } from "@/lib/demo-session";
import { getDemoBoardSummary } from "@/lib/dal/demo-board";
import DemoBreadcrumb from "@/components/demo/demo-breadcrumb";
import DemoEntrySidebar from "@/components/demo/demo-entry-sidebar";
import DemoHeaderIndicator from "@/components/demo/demo-header-indicator";
import DemoSidebar from "@/components/demo/demo-sidebar";
import WorkspaceShell from "@/components/layout/workspace-shell";
import OfflineStatus from "@/components/workspace/offline-status";

export const instant = false;

export default async function DemoLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar_state")?.value === "true";

  return (
    <WorkspaceShell
      defaultOpen={defaultOpen}
      sidebar={
        <Suspense fallback={<DemoEntrySidebar />}>
          <DemoSidebarAsync />
        </Suspense>
      }
      breadcrumb={
        <Suspense fallback={<DemoBreadcrumb boardTitle="Demo" />}>
          <DemoBreadcrumbAsync />
        </Suspense>
      }
      headerIndicator={<DemoHeaderIndicator />}
      offlineStatus={<OfflineStatus />}
    >
      {children}
    </WorkspaceShell>
  );
}

async function DemoSidebarAsync() {
  const demoBoard = await getDemoSidebarBoard();
  return <DemoSidebar board={demoBoard} />;
}

async function DemoBreadcrumbAsync() {
  const demoBoard = await getDemoSidebarBoard();
  return <DemoBreadcrumb boardTitle={demoBoard?.title ?? "Demo"} />;
}

const getDemoSidebarBoard = cache(async () => {
  const demoSession = await resolveDemoSession();
  return demoSession ? getDemoBoardSummary(demoSession.ownerId) : null;
});
