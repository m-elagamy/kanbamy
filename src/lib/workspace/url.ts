import type { TasksFilter } from "@/lib/types";

export interface BuildPaginatedUrlOptions {
  basePath: string;
  page?: number;
  query?: string;
  params?: Record<string, string | undefined | null>;
}

export function buildPaginatedUrl({
  basePath,
  page = 1,
  query = "",
  params = {},
}: BuildPaginatedUrlOptions): string {
  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.set(key, value);
    }
  }

  if (page > 1) {
    searchParams.set("page", String(page));
  }

  const trimmed = query.trim();
  if (trimmed) {
    searchParams.set("q", trimmed);
  }

  const search = searchParams.toString();
  return `${basePath}${search ? `?${search}` : ""}`;
}

export function buildTasksUrl(
  basePath: string,
  filter: TasksFilter = "all",
  page = 1,
  query = "",
) {
  return buildPaginatedUrl({
    basePath: `${basePath}/tasks`,
    page,
    query,
    params: {
      attention: filter !== "all" ? filter : undefined,
    },
  });
}

export function buildBoardsUrl(
  page = 1,
  query = "",
  basePath = "/dashboard/boards",
) {
  return buildPaginatedUrl({
    basePath,
    page,
    query,
  });
}

