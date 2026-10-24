import { Suspense } from "react";
import type { Metadata } from "next";
import BoardsPageShell from "@/components/workspace/boards-page-shell";
import BoardsContent from "@/components/workspace/boards-content";
import BoardsContentSkeleton from "@/components/workspace/boards-content-skeleton";
import { requireAuth } from "@/lib/auth";

/* eslint-disable @clerk/next/require-auth-protection -- This resource calls requireAuth(), which preserves DEV_AUTH_BYPASS before delegating to auth.protect(). */

type SearchParams = Promise<{ page?: string; q?: string }>;

export default async function BoardsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  await requireAuth();

  return (
    <BoardsPageShell backHref="/dashboard" backLabel="Back to dashboard">
      <Suspense fallback={<BoardsContentSkeleton />}>
        <BoardsContent searchParams={searchParams} />
      </Suspense>
    </BoardsPageShell>
  );
}

export const metadata: Metadata = {
  title: "All Boards",
  description: "Browse all of your Kanbamy boards.",
};
