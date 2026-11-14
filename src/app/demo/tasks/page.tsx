import { Suspense } from "react";
import type { Metadata } from "next";
import TasksPageShell from "@/components/workspace/tasks-page-shell";
import TasksContent from "@/components/workspace/tasks-content";
import TasksContentSkeleton from "@/components/workspace/tasks-content-skeleton";
import { getDemoWorkspaceContext } from "@/lib/demo-workspace";

type SearchParams = Promise<{
  filter?: string;
  sort?: string;
  page?: string;
  q?: string;
}>;

async function getDemoOwnerId() {
  const { demoSession } = await getDemoWorkspaceContext();
  return demoSession.ownerId;
}

export default function DemoTasksPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  return (
    <TasksPageShell
      basePath="/demo"
      backHref="/demo/overview"
      backLabel="Back to overview"
    >
      <Suspense fallback={<TasksContentSkeleton />}>
        <TasksContent
          searchParams={searchParams}
          getOwnerId={getDemoOwnerId}
          basePath="/demo"
        />
      </Suspense>
    </TasksPageShell>
  );
}

export const metadata: Metadata = {
  title: "Demo Tasks",
  description: "Review tasks in the Kanbamy Demo workspace.",
};
