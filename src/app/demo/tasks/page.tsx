import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { TASKS_PAGE_SIZE } from "@/lib/constants";
import type { TasksFilter } from "@/lib/types";
import TasksPageContent, {
  filterValues,
  tasksHref,
} from "@/app/dashboard/tasks/tasks-page-content";
import { getWorkspaceTasksOverviewPageForUser } from "@/lib/dal/task";
import { getDemoWorkspaceContext } from "@/lib/demo-workspace";

type SearchParams = Promise<{
  attention?: string;
  page?: string;
  q?: string;
}>;

export default async function DemoTasksPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { demoSession } = await getDemoWorkspaceContext();
  const params = await searchParams;
  const filter = (params.attention ?? "all") as TasksFilter;
  const page = Number(params.page ?? "1");
  const rawQuery = params.q ?? "";
  const query = rawQuery.trim().slice(0, 100);

  if (
    !filterValues.has(filter) ||
    !Number.isSafeInteger(page) ||
    page < 1 ||
    page > 2147483647 / TASKS_PAGE_SIZE
  ) {
    redirect(tasksHref("/demo", "all", 1, query));
  }

  if (query !== rawQuery) redirect(tasksHref("/demo", filter, 1, query));

  const result = await getWorkspaceTasksOverviewPageForUser(
    demoSession.ownerId,
    filter,
    page,
    query,
    TASKS_PAGE_SIZE,
  );
  const totalPages = Math.max(1, Math.ceil(result.totalCount / TASKS_PAGE_SIZE));

  if (page > totalPages) {
    redirect(tasksHref("/demo", filter, totalPages, query));
  }

  return (
    <TasksPageContent
      data={result}
      page={page}
      filter={filter}
      query={query}
      basePath="/demo"
      backHref="/demo/overview"
      backLabel="Back to overview"
    />
  );
}

export const metadata: Metadata = {
  title: "Demo Tasks",
  description: "Review tasks in the Kanbamy Demo workspace.",
};
