import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getDashboardLayoutDataAction } from "@/actions/user";
import { requireAuth } from "@/utils/auth";
import DashboardSidebar from "@/components/layout/sidebar";
import DashboardBreadcrumb from "@/components/layout/dashboard-breadcrumb";
import WorkspaceShell from "@/components/layout/workspace-shell";
import OfflineStatus from "./components/offline-status";

/* eslint-disable @clerk/next/require-auth-protection -- Protected layout data is loaded through getDashboardLayoutDataAction(), which validates the authenticated user. */

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await requireAuth();

  const [cookieStore, layoutData] = await Promise.all([
    cookies(),
    getDashboardLayoutDataAction(),
  ]);
  const boardsCount = layoutData.fields?.boardsCount ?? 0;
  const hasCreatedBoardOnce =
    layoutData.fields?.hasCreatedBoardOnce ?? false;

  if (boardsCount === 0 && !hasCreatedBoardOnce) redirect("/welcome");

  const defaultOpen = cookieStore.get("sidebar_state")?.value === "true";
  const sidebarUser = layoutData.fields?.user ?? null;

  return (
    <WorkspaceShell
      defaultOpen={defaultOpen}
      sidebar={<DashboardSidebar user={sidebarUser} />}
      breadcrumb={<DashboardBreadcrumb />}
      offlineStatus={<OfflineStatus />}
    >
      {children}
    </WorkspaceShell>
  );
}
