import { Suspense } from "react";
import { cookies } from "next/headers";
import { redirect, unauthorized } from "next/navigation";
import { getUser, requireAuth } from "@/lib/auth";
import { getOnboardingStateForUser } from "@/lib/dal/user";
import DashboardSidebar from "@/components/layout/sidebar";
import DashboardBreadcrumb from "@/components/layout/dashboard-breadcrumb";
import WorkspaceShell from "@/components/layout/workspace-shell";
import OfflineStatus from "@/components/workspace/offline-status";

/* eslint-disable @clerk/next/require-auth-protection -- Auth is enforced per page/DAL; this layout only reads the user profile via getUser() and calls unauthorized() if missing. */

export const instant = false;

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [cookieStore, user] = await Promise.all([cookies(), getUser()]);
  if (!user) {
    await requireAuth();
    unauthorized();
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
      <Suspense fallback={null}>
        <OnboardingGate userId={user.id} />
      </Suspense>
      {children}
    </WorkspaceShell>
  );
}

async function OnboardingGate({ userId }: { userId: string }) {
  const onboardingState = await getOnboardingStateForUser(userId);

  if (
    onboardingState.boardsCount === 0 &&
    !onboardingState.hasCreatedBoardOnce
  ) {
    redirect("/welcome");
  }

  return null;
}
