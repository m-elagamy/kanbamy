import type { Metadata } from "next";
import { unauthorized } from "next/navigation";
import {
  getAuthenticatedUserId,
  getUser,
  requireAuth,
} from "@/lib/auth";
import {
  OverviewContent,
  OverviewPageShell,
} from "@/components/workspace/overview";

/* eslint-disable @clerk/next/require-auth-protection -- This resource calls requireAuth(), which preserves DEV_AUTH_BYPASS before delegating to auth.protect(). */

async function getDashboardUserName() {
  const user = await getUser();
  if (!user) unauthorized();
  return user.firstName;
}

export default async function DashboardPage() {
  await requireAuth();

  return (
    <OverviewPageShell getUserName={getDashboardUserName} basePath="/dashboard">
      <OverviewContent
        getOwnerId={getAuthenticatedUserId}
        basePath="/dashboard"
      />
    </OverviewPageShell>
  );
}

export const metadata: Metadata = {
  title: "Dashboard",
  description:
    "Track tasks, manage projects, and stay organized with Kanbamy's dashboard.",
};
