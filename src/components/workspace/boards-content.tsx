import Link from "next/link";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { Plus, X } from "lucide-react";
import { getUserBoardsPageForUser } from "@/lib/dal/user";
import { getAuthenticatedUserId } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import EmptyBoardsIllustration from "@/components/ui/empty-boards-illustration";
import EmptyResultsIllustration from "@/components/ui/empty-results-illustration";
import { BOARDS_PAGE_SIZE, getMaxSafePage } from "@/lib/constants";
import { buildBoardsUrl } from "@/lib/workspace/url";
import BoardCard from "./board/board-card";
import BoardModal from "./board/board-modal";
import Pagination from "./pagination";

type SearchParams = Promise<{ page?: string; q?: string }>;

interface BoardsContentProps {
  searchParams: SearchParams;
}

export default async function BoardsContent({
  searchParams,
}: BoardsContentProps) {
  const [{ page: pageParam, q: queryParam = "" }, userId] = await Promise.all([
    searchParams,
    getAuthenticatedUserId(),
    connection(),
  ]);
  const query = queryParam.trim().slice(0, 100);
  const page = Number(pageParam ?? "1");

  const MAX_SAFE_PAGE = getMaxSafePage(BOARDS_PAGE_SIZE);
  const isInvalidPage = !Number.isSafeInteger(page) || page < 1 || page > MAX_SAFE_PAGE;

  if (isInvalidPage) {
    redirect(buildBoardsUrl(1, query));
  }

  if (pageParam === "1" || query !== queryParam) {
    redirect(buildBoardsUrl(page, query));
  }

  const { boards, totalCount } = await getUserBoardsPageForUser(
    userId,
    page,
    query,
  );
  const totalPages = Math.max(1, Math.ceil(totalCount / BOARDS_PAGE_SIZE));
  if (page > totalPages) {
    redirect(buildBoardsUrl(totalPages, query));
  }
  const hasQuery = query.length > 0;
  const rangeStart = (page - 1) * BOARDS_PAGE_SIZE + 1;
  const rangeEnd = Math.min(page * BOARDS_PAGE_SIZE, totalCount);

  return (
    <>
      {boards.length === 0 ? (
        <div className="border-border/80 bg-card/40 shrink-0 rounded-xl border shadow-xs">
          <EmptyState
            size="compact"
            className="min-h-64 py-10"
            illustration={
              hasQuery ? (
                <EmptyResultsIllustration />
              ) : (
                <EmptyBoardsIllustration />
              )
            }
            title={hasQuery ? "No matching boards" : "No boards yet"}
            description={
              hasQuery
                ? `No boards match “${query}”. Try another search term.`
                : "Create a board to start organizing your tasks and projects."
            }
            action={
              hasQuery ? (
                <Button variant="outline" size="sm" asChild>
                  <Link href="/dashboard/boards">
                    <X className="size-3.5" aria-hidden="true" />
                    <span>Clear search</span>
                  </Link>
                </Button>
              ) : (
                <BoardModal
                  mode="create"
                  trigger={
                    <Button size="sm" className="gap-2">
                      <Plus className="size-4" aria-hidden="true" />
                      Create a board
                    </Button>
                  }
                />
              )
            }
          />
        </div>
      ) : (
        <>
          <div className="min-h-0 overflow-x-hidden overflow-y-auto">
            <div className="grid grid-cols-1 gap-4 pt-0.5 sm:grid-cols-2 lg:grid-cols-3">
              {boards.map((board) => (
                <BoardCard key={board.id} board={board} />
              ))}
            </div>
          </div>

          <div className="mt-4 flex shrink-0 flex-col items-center justify-between gap-3 sm:grid sm:grid-cols-3">
            <p className="text-muted-foreground text-xs" aria-live="polite">
              Showing{" "}
              <span className="text-foreground font-semibold tabular-nums">
                {rangeStart}–{rangeEnd}
              </span>{" "}
              of{" "}
              <span className="text-foreground font-semibold tabular-nums">
                {totalCount}
              </span>{" "}
              {totalCount === 1 ? "board" : "boards"}
            </p>
            <div className="flex justify-center">
              <Pagination
                className="mt-0"
                ariaLabel="Boards pagination"
                currentPage={page}
                totalPages={totalPages}
                hrefForPage={(pageNumber) => buildBoardsUrl(pageNumber, query)}
              />
            </div>
            {totalPages > 1 && (
              <p className="text-muted-foreground text-xs tabular-nums sm:text-right">
                Page {page} of {totalPages}
              </p>
            )}
          </div>
        </>
      )}
    </>
  );
}
