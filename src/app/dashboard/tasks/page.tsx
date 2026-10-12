import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { TASKS_PAGE_SIZE } from "@/lib/constants";
import type { TasksFilter } from "@/lib/types";
import TasksPageContent, {
  filterValues,
  tasksHref,
} from "@/components/workspace/tasks-page-content";
import { getWorkspaceTasksOverviewPageForUser } from "@/lib/dal/task";
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
  const [params, userId] = await Promise.all([
    searchParams,
    getAuthenticatedUserId(),
  ]);
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
    redirect(tasksHref("/dashboard", "all", 1, query));
  }

  if (query !== rawQuery) redirect(tasksHref("/dashboard", filter, 1, query));

  const result = await getWorkspaceTasksOverviewPageForUser(
    userId,
    filter,
    page,
    query,
    TASKS_PAGE_SIZE,
  );
  const totalPages = Math.max(1, Math.ceil(result.totalCount / TASKS_PAGE_SIZE));
  if (page > totalPages) redirect(tasksHref("/dashboard", filter, totalPages, query));

  return (
    <TasksPageContent
      data={result}
      page={page}
      filter={filter}
      query={query}
      basePath="/dashboard"
      backHref="/dashboard"
      backLabel="Back to dashboard"
    />
  );
}

export const metadata: Metadata = {
  title: "Tasks",
  description: "Browse and review tasks across your Kanbamy workspace.",
};
