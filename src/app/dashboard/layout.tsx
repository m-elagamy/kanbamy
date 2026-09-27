import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import { requireAuth } from "@/utils/auth";
import { getUserOnboardingStateAction } from "@/actions/user";
import DashboardSidebar from "@/components/layout/sidebar";
import DashboardBreadcrumb from "@/components/layout/dashboard-breadcrumb";
import {
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar";
import KeyboardShortcuts from "@/components/layout/keyboard-shortcuts";
import OfflineStatus from "./components/offline-status";

/* eslint-disable @clerk/next/require-auth-protection -- This resource calls requireAuth(), which preserves DEV_AUTH_BYPASS before delegating to auth.protect(). */

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await requireAuth();
  const [cookieStore, user] = await Promise.all([cookies(), currentUser()]);
  const onboardingState = await getUserOnboardingStateAction();
  const boardsCount = onboardingState.fields?.boardsCount ?? 0;
  const hasCreatedBoardOnce =
    onboardingState.fields?.hasCreatedBoardOnce ?? false;

  if (boardsCount === 0 && !hasCreatedBoardOnce) redirect("/welcome");

  const defaultOpen = cookieStore.get("sidebar_state")?.value === "true";
  const sidebarUser = user
    ? {
        fullName: user.fullName,
        firstName: user.firstName,
        imageUrl: user.imageUrl,
        email: user.primaryEmailAddress?.emailAddress ?? "",
      }
    : null;

  return (
    <SidebarProvider defaultOpen={defaultOpen} className="bg-muted">
      <DashboardSidebar user={sidebarUser} />
      <SidebarInset className="border-border/60 min-h-0 min-w-0 border">
        <header className="border-border/60 bg-background/95 supports-backdrop-filter:bg-background/60 sticky top-0 z-40 flex h-12 shrink-0 items-center gap-3 border-b px-4 backdrop-blur md:rounded-t-xl">
          <SidebarTrigger />
          <DashboardBreadcrumb />
          <div className="ml-auto">
            <KeyboardShortcuts />
          </div>
        </header>
        <OfflineStatus />
        <div className="min-h-0 min-w-0 flex-1 overflow-auto">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
