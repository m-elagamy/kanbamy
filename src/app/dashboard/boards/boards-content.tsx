import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus, Search } from "lucide-react";
import { getUserBoardsPageAction } from "@/actions/user";
import { Button } from "@/components/ui/button";
import EmptyBoardsIllustration from "@/components/ui/empty-boards-illustration";
import { EmptyState } from "@/components/ui/empty-state";
import { BOARDS_PAGE_SIZE } from "@/lib/constants";
import BoardCard from "@/components/workspace/board/board-card";
import BoardModal from "@/components/workspace/board/board-modal";
import Pagination from "@/components/workspace/pagination";

type SearchParams = Promise<{ page?: string; q?: string }>;

function boardsHref(page: number, query = "") {
  const params = new URLSearchParams();
  if (query) params.set("q", query);
  if (page > 1) params.set("page", String(page));
  const search = params.toString();
  return `/dashboard/boards${search ? `?${search}` : ""}`;
}

export default async function BoardsContent({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { page: pageParam, q: queryParam = "" } = await searchParams;
  const query = queryParam.trim().slice(0, 100);
  const page = Number(pageParam ?? "1");
  if (query !== queryParam) redirect(boardsHref(1, query));
  if (
    !Number.isSafeInteger(page) ||
    page < 1 ||
    page > 2147483647 / BOARDS_PAGE_SIZE
  ) {
    redirect(boardsHref(1, query));
  }

  const result = await getUserBoardsPageAction(page, query);
  if (!result.success || !result.fields) {
    throw new Error("Failed to load boards. Please try again.");
  }
  const { boards, totalCount } = result.fields;
  const totalPages = Math.max(1, Math.ceil(totalCount / BOARDS_PAGE_SIZE));
  if (page > totalPages) {
    redirect(boardsHref(totalPages, query));
  }
  const hasQuery = query.length > 0;

  return (
    <>
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="text-sm font-medium" aria-live="polite">
          {hasQuery ? "Search results" : "All boards"} · {totalCount}{" "}
          {totalCount === 1 ? "board" : "boards"}
        </p>
        {totalPages > 1 && (
          <p className="text-muted-foreground text-xs">
            Page {page} of {totalPages}
          </p>
        )}
      </div>

      {boards.length === 0 ? (
        <div className="border-border/80 bg-background/80 rounded-xl border shadow-sm">
          {hasQuery ? (
            <EmptyState
              size="compact"
              illustration={
                <Search
                  className="text-muted-foreground size-8"
                  aria-hidden="true"
                />
              }
              title="No matching boards"
              description={`No boards match “${query}”. Try another name or description.`}
              action={
                <Button variant="outline" size="sm" asChild>
                  <Link href="/dashboard/boards">Clear search</Link>
                </Button>
              }
            />
          ) : (
            <EmptyState
              illustration={<EmptyBoardsIllustration />}
              title="No boards yet"
              description="Create a board to start organizing your tasks and projects."
              action={
                <BoardModal
                  mode="create"
                  trigger={
                    <button>
                      <Plus aria-hidden="true" />
                      Create a board
                    </button>
                  }
                />
              }
            />
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {boards.map((board) => (
            <BoardCard key={board.id} board={board} />
          ))}
        </div>
      )}

      <Pagination
        ariaLabel="Boards pagination"
        currentPage={page}
        totalPages={totalPages}
        hrefForPage={(pageNumber) => boardsHref(pageNumber, query)}
      />
    </>
  );
}
