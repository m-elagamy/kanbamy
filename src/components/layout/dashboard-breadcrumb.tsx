"use client";

import Link from "next/link";
import { Home, ChevronRight } from "lucide-react";
import { usePathname } from "next/navigation";
import { useShallow } from "zustand/react/shallow";
import useBoardStore from "@/stores/board";
import deslugify from "@/utils/deslugify";

const DashboardBreadcrumb = () => {
  const pathname = usePathname();
  const { boards, activeBoardId } = useBoardStore(
    useShallow((state) => ({
      boards: state.boards,
      activeBoardId: state.activeBoardId,
    })),
  );
  const getPageLabel = (): string | null => {
    if (pathname === "/dashboard/tasks") return "Tasks";
    if (pathname === "/dashboard/boards") return "Boards";

    const boardSlug = pathname.match(/^\/dashboard\/(.+)/)?.[1];
    if (!boardSlug) return null;

    const decodedSlug = decodeURIComponent(boardSlug);
    const activeBoard = activeBoardId ? boards[activeBoardId] : null;

    return (
      (activeBoard?.slug === decodedSlug && activeBoard.title) ||
      Object.values(boards).find((board) => board.slug === decodedSlug)?.title ||
      deslugify(decodedSlug)
    );
  };

  const pageLabel = getPageLabel();

  return (
    <div className="text-muted-foreground flex min-w-0 flex-1 items-center gap-1.5 overflow-hidden text-sm">
      <Link
        href="/dashboard"
        className="hover:text-primary flex shrink-0 items-center gap-1 whitespace-nowrap transition-colors"
      >
        <Home size={14} />
        <span>Dashboard</span>
      </Link>
      {pageLabel && (
        <>
          <ChevronRight size={14} />
          <span className="text-foreground min-w-0 max-w-[45vw] truncate whitespace-nowrap font-medium capitalize sm:max-w-64">
            {pageLabel}
          </span>
        </>
      )}
    </div>
  );
};

export default DashboardBreadcrumb;
