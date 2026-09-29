import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft, Plus } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import BoardModal from "../components/board/board-modal";
import BoardsSearch from "./boards-search";
import BoardsContent from "./boards-content";
import BoardsCardsSkeleton from "./boards-cards-skeleton";
import { requireAuth } from "@/utils/auth";

/* eslint-disable @clerk/next/require-auth-protection -- This resource calls requireAuth(), which preserves DEV_AUTH_BYPASS before delegating to auth.protect(). */

type SearchParams = Promise<{ page?: string; q?: string }>;

export default async function BoardsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  await requireAuth();
  return (
    <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8 md:px-10">
      <div className="mb-6">
        <Link
          href="/dashboard"
          className="text-muted-foreground hover:text-primary mb-3 inline-flex items-center gap-1 text-sm transition-colors"
        >
          <ChevronLeft className="size-4" aria-hidden="true" />
          Back to dashboard
        </Link>
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-muted-foreground text-xs font-semibold tracking-[0.25em] uppercase">
              Your workspace
            </p>
            <h1 className="text-2xl font-semibold md:text-3xl">All boards</h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Choose a board to view and manage its tasks.
            </p>
          </div>
          <BoardModal
            mode="create"
            trigger={
              <button>
                <Plus aria-hidden="true" />
                New board
              </button>
            }
          />
        </div>
      </div>

      <Suspense
        fallback={<Skeleton className="mb-6 h-9 w-full rounded-md" />}
      >
        <BoardsSearch />
      </Suspense>

      <Suspense fallback={<BoardsCardsSkeleton />}>
        <BoardsContent searchParams={searchParams} />
      </Suspense>
    </main>
  );
}

export const metadata: Metadata = {
  title: "All Boards",
  description: "Browse all of your Kanbamy boards.",
};
