import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus, Search } from "lucide-react";
import { getUserBoardsPageForUser } from "@/lib/dal/user";
import { getAuthenticatedUserId } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import EmptyBoardsIllustration from "@/components/ui/empty-boards-illustration";
import { EmptyState } from "@/components/ui/empty-state";
import { BOARDS_PAGE_SIZE } from "@/lib/constants";
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
  ]);
  const query = queryParam.trim().slice(0, 100);
  const page = Number(pageParam ?? "1");

  const MAX_SAFE_PAGE = Math.floor(2_147_483_647 / BOARDS_PAGE_SIZE);
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

  return (
    <>
      <div className="mb-4 flex shrink-0 items-center justify-between gap-3">
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
        <div className="border-border/80 bg-background/80 shrink-0 rounded-xl border shadow-sm">
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
                    <Button>
                      <Plus aria-hidden="true" />
                      Create a board
                    </Button>
                  }
                />
              }
            />
          )}
        </div>
      ) : (
        <div className="min-h-0 overflow-x-hidden overflow-y-auto">
          <div className="grid grid-cols-1 gap-4 pt-0.5 sm:grid-cols-2 lg:grid-cols-3">
            {boards.map((board) => (
              <BoardCard key={board.id} board={board} />
            ))}
          </div>
        </div>
      )}

      <Pagination
        ariaLabel="Boards pagination"
        currentPage={page}
        totalPages={totalPages}
        hrefForPage={(pageNumber) => buildBoardsUrl(pageNumber, query)}
      />
    </>
  );
}

