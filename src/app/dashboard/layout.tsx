import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getAuthenticatedDashboardUser, requireAuth } from "@/lib/auth";
import { getUserOnboardingStateForUser } from "@/lib/dal/user";
import DashboardSidebar from "@/components/layout/sidebar";
import DashboardBreadcrumb from "@/components/layout/dashboard-breadcrumb";
import WorkspaceShell from "@/components/layout/workspace-shell";
import OfflineStatus from "@/components/workspace/offline-status";

/* eslint-disable @clerk/next/require-auth-protection -- This resource calls requireAuth(), which preserves DEV_AUTH_BYPASS before delegating to auth.protect(). */

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await requireAuth();

  const [cookieStore, user] = await Promise.all([
    cookies(),
    getAuthenticatedDashboardUser(),
  ]);
  const onboardingState = await getUserOnboardingStateForUser(user.id);

  if (
    onboardingState.boardsCount === 0 &&
    !onboardingState.hasCreatedBoardOnce
  ) {
    redirect("/welcome");
  }

  const defaultOpen = cookieStore.get("sidebar_state")?.value === "true";
  const sidebarUser = {
    fullName: user.fullName,
    firstName: user.firstName,
    imageUrl: user.imageUrl,
    email: user.email,
  };

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
