import { Suspense } from "react";
import type { Metadata } from "next";
import TasksPageShell from "@/components/workspace/tasks-page-shell";
import TasksContent from "@/components/workspace/tasks-content";
import TasksContentSkeleton from "@/components/workspace/tasks-content-skeleton";
import { getAuthenticatedUserId, requireAuth } from "@/lib/auth";

/* eslint-disable @clerk/next/require-auth-protection -- This resource calls requireAuth(), which preserves DEV_AUTH_BYPASS before delegating to auth.protect(). */

type SearchParams = Promise<{
  attention?: string;
  page?: string;
  q?: string;
}>;

export default async function TasksPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  await requireAuth();

  return (
    <TasksPageShell
      basePath="/dashboard"
      backHref="/dashboard"
      backLabel="Back to dashboard"
    >
      <Suspense fallback={<TasksContentSkeleton />}>
        <TasksContent
          searchParams={searchParams}
          getOwnerId={getAuthenticatedUserId}
          basePath="/dashboard"
        />
      </Suspense>
    </TasksPageShell>
  );
}

export const metadata: Metadata = {
  title: "Tasks",
  description: "Browse and review tasks across your Kanbamy workspace.",
};
